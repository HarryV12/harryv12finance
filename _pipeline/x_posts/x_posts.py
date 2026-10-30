"""Makes the day's Data Visualization images from the live site and posts them to X.

Run by .github/workflows/x_posts.yml, which the Cloudflare timer starts at 9:45 pm UK on weekdays, half an hour
after the daily data update. What goes out, at most MAX_A_DAY posts a day:

  - Today's market movers: every day the US market has a new close
  - What Congress just bought (Latest disclosures): when the PC's weekly build brought new filings
  - Copy-trading leaderboard: Fridays

The images come from the site's own Data Visualization page, opened in an invisible browser, so they are exactly
what its Download button gives. The captions are fixed sentences filled in from the data, with no links (X charges
$0.20 for a post with a link and $0.015 without; the images already print the site's address).

Modes (the X_POST_MODE repository variable):
  test (the default): makes everything, posts nothing, and shows it all in a gallery at x-preview.harryv12finance.pages.dev
  live: posts to @RealFinancev12; needs the X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN and X_ACCESS_SECRET secrets, which
        connect_x_account.py sets up. The app belongs to the main developer account; the access token is the posting
        account's own, so the app's "Access Token" in the developer console (the main account's) must not be used here.
"""
import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime
from html import escape
from pathlib import Path
from zoneinfo import ZoneInfo

from playwright.sync_api import sync_playwright

X_ACCOUNT = "RealFinancev12"  # the only account this will post to
SITE = "https://harryv12finance.pages.dev/#/dataviz"
GALLERY = "https://x-preview.harryv12finance.pages.dev"
STATE = Path(__file__).with_name("state.json")
MAX_A_DAY = 2
KEEP_IN_GALLERY = 40
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # X's limit for a post's image
WAIT_FOR_CLOSE_MIN = 30  # the data update normally finishes well before 9:45 pm; give a slow one this long

# what the page knows, read after it has loaded: the last market close, the index moves, the newest filing
FACTS_JS = """async () => {
  const H = window.HFSite, P = await H.loadAllPrices(), V = window.__DV;
  const scope = V.postScope(), IDX = [["SPY", "S&P 500"], ["QQQ", "Nasdaq 100"], ["DIA", "Dow"]];
  const buys = V.trades.filter((t) => t.st && (V.isSec(t) || t.cls === "option") && scope.test(t) && t.side === "B" && t.ftime && t.T.ep);
  return {
    close: P.dates[P.dates.length - 1],
    weekFrom: P.dates[P.dates.length - 5],
    idx: IDX.map(([t, n]) => [n, H.moveOf(P, t, 1)]),
    idxWeek: IDX.map(([t, n]) => [n, H.moveOf(P, t, 5)]),
    newestBuyFiled: buys.reduce((m, t) => (t.fd > m ? t.fd : m), ""),
  };
}"""

# the image on show, as base64, once the page has finished drawing it
IMAGE_JS = """async (sel) => {
  const blob = await (await fetch(document.querySelector(sel).src)).blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let s = ""; for (let i = 0; i < bytes.length; i += 32768) s += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return { type: blob.type, b64: btoa(s) };
}"""


def nice_date(iso):
    d = datetime.strptime(iso, "%Y-%m-%d")
    return f"{d.day} {d.strftime('%b %Y')}"


def signed_pct(r):
    r = round(r * 100, 2)
    return f"{'+' if r > 0 else '−' if r < 0 else ''}{abs(r):.2f}%"


def load_state():
    return json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {}


def save_state(state):
    STATE.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")


# ---------- the page ----------
def open_page(browser):
    page = browser.new_context(viewport={"width": 1280, "height": 1600}).new_page()
    page.on("pageerror", lambda e: print(f"page error: {e}"))
    page.goto(SITE, wait_until="load", timeout=120_000)
    # the Insider Trading tab holds the data this script reads (window.__DV), so open it once before anything else
    page.click('[data-dvt="congress"]', timeout=120_000)
    page.wait_for_function("window.__DV && window.HFSite && !document.querySelector('#postSave').disabled", timeout=180_000)
    return page


def market_image(page, view):
    page.click('[data-dvt="markets"]')
    page.wait_for_selector(f'[data-view="{view}"]', timeout=60_000)
    page.click(f'[data-view="{view}"]')
    return read_image(page, "#mvSave", "#mvImg", "#mvEmpty")


def congress_image(page, style):
    page.click('[data-dvt="congress"]')
    page.click(f'#cgApp .styles [data-v="{style}"]')
    return read_image(page, "#postSave", "#postImg", "#postEmpty")


def read_image(page, save, img, empty):
    # Download goes off while an image draws and back on when it's ready
    page.wait_for_function(f"!document.querySelector('{save}').disabled || !document.querySelector('{empty}').hidden", timeout=180_000)
    problem = page.evaluate(f"(() => {{ const e = document.querySelector('{empty}'); return e.hidden ? '' : e.textContent; }})()")
    if problem:
        raise RuntimeError(f"the page couldn't draw this image: {problem}")
    got = page.evaluate(IMAGE_JS, img)
    data = base64.b64decode(got["b64"])
    if got["type"] != "image/png" or data[:4] != b"\x89PNG" or len(data) < 20_000:
        raise RuntimeError(f"not a real image: {got['type']}, {len(data)} bytes")
    if len(data) > MAX_IMAGE_BYTES:
        raise RuntimeError(f"image too big for X: {len(data)} bytes")
    return data


# ---------- what to post today ----------
def choose(facts, state, today, weekday):
    """The posts due today, most time-sensitive first, and why anything else isn't going out. Anything held back by the
    daily limit stays due: filings go out on the next day with room, and the leaderboard waits for next Friday."""
    due, skipped = [], []

    if facts["close"] != state.get("market_close") and facts["close"] == today["ny"]:
        moves = ", ".join(f"{n} {signed_pct(r)}" for n, r in facts["idx"] if r is not None)
        due.append({"key": "movers", "title": "Today's market movers", "kind": "market", "view": "today",
                    "caption": f"Today's market movers, {nice_date(facts['close'])}. {moves}.",
                    "mark": {"market_close": facts["close"]}})
    else:
        skipped.append(f"Market movers: no new close (latest is {facts['close']}; a market holiday, or the data update hadn't finished)")

    newest = facts["newestBuyFiled"]
    if newest and newest != state.get("congress_filed"):
        due.append({"key": "disclosures", "title": "What Congress just bought", "kind": "congress", "view": "list",
                    "caption": f"What Congress just bought: latest stock disclosures, filed up to {nice_date(newest)}.",
                    "mark": {"congress_filed": newest}})
    else:
        skipped.append(f"Latest disclosures: no new filings (newest is {newest})")

    if weekday == 4 and state.get("leaderboard") != today["uk"]:
        due.append({"key": "leaderboard", "title": "Copy-trading leaderboard", "kind": "congress", "view": "leaders",
                    "caption": f"Copy-trading leaderboard: members of Congress ranked by score, {nice_date(today['uk'])}.",
                    "mark": {"leaderboard": today["uk"]}})
    elif weekday != 4:
        skipped.append("Leaderboard: Fridays only")

    # Fridays' leaderboard keeps its place over filings, which can wait a day
    if len(due) > MAX_A_DAY and weekday == 4:
        due.sort(key=lambda p: p["key"] == "disclosures")
    room = max(0, MAX_A_DAY - state.get("posted_on", {}).get(today["uk"], 0))
    for post in due[room:]:
        skipped.append(f"{post['title']}: held back by the limit of {MAX_A_DAY} posts a day")
    return due[:room], skipped


def every_image(facts, today):
    """One of each: --preview-all makes them all to look at, --post-now posts the one it's asked for."""
    moves = ", ".join(f"{n} {signed_pct(r)}" for n, r in facts["idx"] if r is not None)
    week = ", ".join(f"{n} {signed_pct(r)}" for n, r in facts["idxWeek"] if r is not None)
    return [
        {"key": "movers", "title": "Today's market movers", "kind": "market", "view": "today",
         "caption": f"Today's market movers, {nice_date(facts['close'])}. {moves}.", "mark": {}},
        {"key": "week", "title": "This week's market movers", "kind": "market", "view": "week",
         "caption": f"This week's market movers, {nice_date(facts['weekFrom'])} to {nice_date(facts['close'])}. {week}.", "mark": {}},
        {"key": "disclosures", "title": "What Congress just bought", "kind": "congress", "view": "list",
         "caption": f"What Congress just bought: latest stock disclosures, filed up to {nice_date(facts['newestBuyFiled'])}.", "mark": {}},
        {"key": "leaderboard", "title": "Copy-trading leaderboard", "kind": "congress", "view": "leaders",
         "caption": f"Copy-trading leaderboard: members of Congress ranked by score, {nice_date(today['uk'])}.", "mark": {}},
    ]


def check_caption(text):
    # a link would make the post cost $0.20 instead of $0.015, and an @name would be an unsolicited mention
    if re.search(r"https?:|www\.|\b[\w-]+\.(com|net|org|io|dev|co|ai|gov|uk|us)\b|@\w", text, re.I):
        raise RuntimeError(f"caption has a link or a mention: {text}")
    if len(text) > 270:
        raise RuntimeError(f"caption too long: {text}")


# ---------- X ----------
def x_session():
    from requests_oauthlib import OAuth1Session
    names = ["X_API_KEY", "X_API_SECRET", "X_ACCESS_TOKEN", "X_ACCESS_SECRET"]
    missing = [n for n in names if not os.environ.get(n)]
    if missing:
        raise RuntimeError(f"live mode needs these secrets: {', '.join(missing)}")
    session = OAuth1Session(*(os.environ[n] for n in names))
    # checked before anything is posted: keys for any other account stop the run here
    me = session.get("https://api.x.com/2/users/me", timeout=60)
    if not me.ok:
        raise RuntimeError(f"X refused the keys: {me.status_code} {me.text[:400]}")
    name = me.json()["data"]["username"]
    if name.lower() != X_ACCOUNT.lower():
        raise RuntimeError(f"these keys post as @{name}, not @{X_ACCOUNT}, so nothing was posted")
    print(f"posting as @{name}")
    return session


def post_to_x(session, image, caption):
    up = session.post("https://api.x.com/2/media/upload", files={"media": ("image.png", image, "image/png")},
                      data={"media_category": "tweet_image"}, timeout=120)
    if not up.ok:
        raise RuntimeError(f"X refused the image: {up.status_code} {up.text[:400]}")
    media_id = up.json()["data"]["id"]
    made = session.post("https://api.x.com/2/tweets", json={"text": caption, "media": {"media_ids": [media_id]}}, timeout=60)
    if not made.ok:
        raise RuntimeError(f"X refused the post: {made.status_code} {made.text[:400]}")
    return made.json()["data"]["id"]


# ---------- the gallery (what would go out, for checking) ----------
def fetch_from_gallery(name):
    req = urllib.request.Request(f"{GALLERY}/{name}", headers={"User-Agent": "harryv12finance-x-posts"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def fetch_old_gallery(out):
    """Earlier entries come from the gallery already online, so it builds up without images being kept in git."""
    try:
        old = json.loads(fetch_from_gallery("manifest.json"))
    except (OSError, ValueError) as e:  # the first run has no gallery yet
        print(f"no earlier gallery: {e}")
        return {"entries": []}
    kept = []
    for e in old.get("entries", [])[:KEEP_IN_GALLERY]:
        if e.get("file"):
            try:
                (out / e["file"]).write_bytes(fetch_from_gallery(e["file"]))
            except OSError:
                continue
        kept.append(e)
    return {"entries": kept}


def write_gallery(out, gallery, mode):
    cards = []
    for e in gallery["entries"]:
        if e.get("file"):
            status = f'<a href="https://x.com/i/status/{e["tweet"]}">Posted on X</a>' if e.get("tweet") else "Test: not posted"
            cards.append(f'<article><h2>{escape(e["title"])}</h2><p class="meta">{escape(e["when"])} · {status}</p>'
                         f'<p class="cap">{escape(e["caption"])}</p><a href="{escape(e["file"])}"><img loading="lazy" src="{escape(e["file"])}" alt="{escape(e["title"])}"></a></article>')
        else:
            cards.append(f'<article class="none"><p class="meta">{escape(e["when"])}</p><p>{escape(e["note"])}</p></article>')
    what = "Live: the daily posts are going out on X." if mode == "live" else "Test mode: the daily posts aren't going out. Anything marked Posted on X was asked for by hand."
    (out / "index.html").write_text(f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>X posts: HarryV12 Finance</title>
<style>
:root {{ color-scheme: light dark; --bg: #f5f6f8; --card: #fff; --ink: #0e1621; --muted: #667085; --line: #dfe5ee; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #0e1621; --card: #182231; --ink: #eef1f6; --muted: #9aa6b8; --line: #2b3749; }} }}
body {{ margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.45 system-ui, sans-serif; }}
main {{ max-width: 620px; margin: 0 auto; padding: 24px 16px 64px; }}
h1 {{ font-size: 24px; margin: 0 0 4px; }} h2 {{ font-size: 18px; margin: 0; }}
.lede, .meta {{ color: var(--muted); font-size: 14px; margin: 4px 0 0; }}
article {{ background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px; margin-top: 16px; }}
.cap {{ margin: 12px 0; }} img {{ display: block; width: 100%; height: auto; border-radius: 8px; }}
.none p:last-child {{ margin: 6px 0 0; }}
</style></head><body><main><h1>X posts</h1><p class="lede">{what} Newest first.</p>
{"".join(cards) or "<p>Nothing yet.</p>"}
</main></body></html>
""", encoding="utf-8")
    (out / "manifest.json").write_text(json.dumps(gallery, indent=1), encoding="utf-8")


# ---------- the run ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview-all", action="store_true", help="make one of each image for the gallery; never posts or counts as posted")
    ap.add_argument("--post-now", choices=["movers", "week", "disclosures", "leaderboard"],
                    help="post this one image to X now, whatever X_POST_MODE says; asked for by hand, so the daily rules and limit don't apply")
    ap.add_argument("--out", default="_x_preview", help="folder for the gallery")
    ap.add_argument("--no-old-gallery", action="store_true", help="don't fetch earlier entries (for trying this on the PC)")
    args = ap.parse_args()

    setting = os.environ.get("X_POST_MODE", "test").strip().lower()
    if setting not in ("test", "live"):
        raise SystemExit(f"X_POST_MODE must be test or live, not {setting!r}")
    if args.preview_all and args.post_now:
        raise SystemExit("--preview-all never posts, so it can't go with --post-now")
    mode = "test" if args.preview_all else "live" if args.post_now else setting
    by_hand = args.preview_all or args.post_now  # not the daily run, so nothing is recorded as the day's post
    uk_now = datetime.now(ZoneInfo("Europe/London"))
    today = {"uk": uk_now.date().isoformat(), "ny": datetime.now(ZoneInfo("America/New_York")).date().isoformat()}
    when = uk_now.strftime("%a %-d %b %Y, %H:%M UK") if os.name != "nt" else uk_now.strftime("%a %d %b %Y, %H:%M UK")
    print(f"mode: {mode}{' (preview of every image)' if args.preview_all else ''}; {when}")

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    gallery = {"entries": []} if args.no_old_gallery else fetch_old_gallery(out)
    state = load_state()

    failures, fresh = [], []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = open_page(browser)
        facts = page.evaluate(FACTS_JS)
        print("facts:", json.dumps(facts))

        # the update is usually done by now; if it's slow, wait, in case today's close is on its way
        waited = 0
        while not by_hand and facts["close"] != today["ny"] and uk_now.weekday() < 5 and waited < WAIT_FOR_CLOSE_MIN:
            print(f"latest close is {facts['close']}, not {today['ny']}: checking again in 3 minutes")
            time.sleep(180)
            waited += 3
            page.close()
            page = open_page(browser)
            facts = page.evaluate(FACTS_JS)

        if args.preview_all:
            posts, skipped = every_image(facts, today), []
        elif args.post_now:
            posts, skipped = [p for p in every_image(facts, today) if p["key"] == args.post_now], []
        else:
            posts, skipped = choose(facts, state, today, uk_now.weekday())
        for s in skipped:
            print("not today:", s)
        session = x_session() if mode == "live" and posts else None

        for post in posts:
            print(f"making: {post['title']}")
            try:
                check_caption(post["caption"])
                image = market_image(page, post["view"]) if post["kind"] == "market" else congress_image(page, post["view"])
                print(f"  {len(image) // 1024} KB; caption: {post['caption']}")
                tweet = None
                if mode == "live":
                    tweet = post_to_x(session, image, post["caption"])
                    print(f"  posted: https://x.com/i/status/{tweet}")
                name = f"{today['uk']}_{post['key']}{'_preview' if args.preview_all else ''}.png"
                (out / name).write_bytes(image)
                entry = {"when": when, "title": post["title"], "caption": post["caption"], "file": name}
                if tweet:
                    entry["tweet"] = tweet
                fresh.append(entry)
                # recorded after each post, in test mode too, so the test week behaves as the live one will
                if not by_hand:
                    state.update(post["mark"])
                    counts = {today["uk"]: state.get("posted_on", {}).get(today["uk"], 0) + 1}
                    state["posted_on"] = counts
                    save_state(state)
            except Exception as e:  # one image failing shouldn't stop the next; the run still ends as failed
                print(f"FAILED: {post['title']}: {e}")
                failures.append(f"{post['title']}: {e}")
        browser.close()

    if not posts and not failures:
        fresh.append({"when": when, "note": "Nothing to post. " + " ".join(skipped)})
    # an image made again the same day replaces the earlier one (it has the same file name)
    new_files = {e["file"] for e in fresh if e.get("file")}
    older = [e for e in gallery["entries"] if e.get("file") not in new_files]
    gallery["entries"] = (fresh[::-1] + older)[:KEEP_IN_GALLERY]
    write_gallery(out, gallery, setting)
    print(f"gallery written to {out}")
    if failures:
        sys.exit("failed: " + "; ".join(failures))


if __name__ == "__main__":
    main()
