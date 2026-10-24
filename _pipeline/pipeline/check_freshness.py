"""What on the website is out of date, or still needs writing by hand.

Checks every data file's date, the written explanations the Market drops and Aftermath pages need, the
hand-kept facts on the Investments, Production and AI bubble pages, and the index member lists. Prints a
report and writes it to logs/freshness.txt. Runs at the end of refresh_all.py; safe to run any time:

    python -I -X utf8 pipeline/check_freshness.py

Nothing here changes the site. See UPDATING.md for what to do about each item.
"""
import datetime as dt
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import CONFIG_DIR, LOGS, SITE_DIR

OUT = LOGS / "freshness.txt"
# hand-kept facts with a date by which they should be looked at again (see UPDATING.md)
REVIEW = [
    ("2026-11-24", "AI bubble page: Anthropic's IPO was expected as soon as November 2026. Add a dated update to ai_bubble.js once it files publicly, is priced, lists or is delayed."),
    ("2026-12-31", "Investments: Helion's $175M is only a letter of intent. Check whether the final agreement was signed."),
    ("2027-03-31", "Investments: Commerce may start selling its 9.9M GlobalFoundries shares (earliest early 2027)."),
    ("2026-12-21", "Market movers: the Nasdaq-100 list changes every December (annual reconstitution). Update NDX100 in site/app.js and NASDAQ100 in fetch_extra_prices.py."),
    ("2027-01-03", "A new Congress starts on 3 Jan 2027: new members and new committee seats. Run fetch_reference.py and check the committee lists."),
    ("2027-02-15", "Production: USGS Mineral Commodity Summaries 2027 (2026 data) are usually out by early February. Update rare earths, lithium, cobalt, nickel, copper, gold, gallium."),
    ("2027-01-31", "Production: worldsteel publishes the year's steel output in late January. Update steel."),
    ("2027-07-15", "Production: the Energy Institute's Statistical Review (oil, refining, gas, LNG) comes out each June. Update those four."),
    ("2027-07-31", "Executive branch: OGE annual reports (278e) for 2026 are usually released around mid-year; run fetch_oge_annual.py and oge_annual_holdings.py."),
]


def load(name):
    p = SITE_DIR / name
    if not p.exists():
        return None
    s = p.read_text(encoding="utf-8")
    return json.loads(s[s.index("{"):s.rindex("}") + 1])


def days(d, today):
    return (today - dt.date.fromisoformat(d[:10])).days if d else None


def main():
    today = dt.date.today()
    lines, todo = [], []
    say = lines.append
    say(f"Freshness report, {today.isoformat()}")
    say("")
    say("DATA FILES (updated by refresh_all.py)")
    D = load("data.js")
    if D:
        last_filed = max((t[D["fields"].index("fd")] or "" for t in D["trades"]), default="")
        say(f"  data.js            built {D.get('generated', '?')[:10]} · prices to {D.get('prices_through')} · newest filing {last_filed} · {len(D['trades']):,} trades")
        if days(D.get("prices_through"), today) and days(D["prices_through"], today) > 4:
            todo.append(f"Prices are {days(D['prices_through'], today)} days old: run the refresh.")
    for f, key, limit in [("market_moves.js", "generated", 4), ("aftermath.js", "generated", 4), ("signals.js", "generated", 7)]:
        j = load(f)
        g = j.get(key) if j else None
        age = days(g, today) if g else None
        say(f"  {f:18} {g or 'missing'}{f' · {age} days old' if age is not None else ''}")
        if age is None or age > limit:
            todo.append(f"{f} is {'missing' if age is None else f'{age} days old'}: run the refresh.")
    X = load("extra_prices.js")
    say(f"  extra_prices.js    {len(X['px']) if X else 0} extra tickers")
    pj = SITE_DIR / "prices.js"
    say(f"  prices.js          {pj.stat().st_size / 1e6:.1f} MB" if pj.exists() else "  prices.js          not here (GitHub builds it on each run)")

    say("")
    say("WRITTEN EXPLANATIONS STILL NEEDED (Market drops page)")
    M = load("market_moves.js") or {}
    summ = json.loads((CONFIG_DIR / "move_summaries.json").read_text(encoding="utf-8"))
    det = json.loads((CONFIG_DIR / "move_details.json").read_text(encoding="utf-8"))
    need = []
    for e in M.get("episodes", []):
        k = f"drop|{e['start']}"
        if k not in summ:
            need.append(f"{k} (Why)")
        if e["start"] >= "2025-01-01" and k not in det:
            need.append(f"{k} (Independent analysis)")
    for name, th in (M.get("themes") or {}).items():
        for e in th["events"]:
            k = f"{name}|{e['start']}"
            if k not in summ:
                need.append(f"{k} (Why)")
            if e["start"] >= "2025-01-01" and k not in det:
                need.append(f"{k} (Independent analysis)")
    for name, src in [("all", M.get("market") or {})] + list((M.get("themes") or {}).items()):
        for w in ("today", "now"):
            n = src.get(w)
            if n and f"{w}|{name}|{n['end']}" not in summ:
                need.append(f"{w}|{name}|{n['end']} (Why + Independent analysis)")
    say("  none" if not need else "\n".join("  " + x for x in need))
    if need:
        todo.append(f"{len(need)} Market drops explanations to write (config/move_summaries.json, config/move_details.json).")

    say("")
    say("AFTERMATH PAGE")
    A = load("aftermath.js") or {"stocks": []}
    for s in A["stocks"]:
        say(f"  {s['tk']:10} {s['name'][:34]:34} {s['drop']:+.1%} since {s['peak']}" + ("" if s.get("cause") else "   ← needs a timeline in config/aftermath_notes.json"))
        if not s.get("cause"):
            todo.append(f"Aftermath: write what led {s['name']} to fall (config/aftermath_notes.json).")
        elif not s.get("why"):
            todo.append(f"Aftermath: write the 'why' for {s['name']} (config/aftermath_notes.json).")

    say("")
    say("HAND-KEPT FACTS")
    aib = (SITE_DIR / "ai_bubble.js").read_text(encoding="utf-8")
    up = re.search(r'updated:\s*"([\d-]+)"', aib)
    age = days(up.group(1), today) if up else None
    say(f"  ai_bubble.js       last updated {up.group(1) if up else '?'}" + (f" ({age} days ago)" if age is not None else ""))
    if age is None or age > 14:
        todo.append(f"AI bubble page: facts are {age} days old. Check the news (Anthropic/OpenAI IPOs, CoreWeave bonds, AI price cuts) and add dated updates to ai_bubble.js.")
    inv = (SITE_DIR / "investments.js").read_text(encoding="utf-8")
    up = re.search(r'updated:\s*"([\d-]+)"', inv)
    say(f"  investments.js     last checked {up.group(1) if up else '?'}" + (f" ({days(up.group(1), today)} days ago)" if up else ""))
    for st in re.findall(r'status:\s*"([^"]+)"', inv):
        if re.search(r"intent|not final|pending|unconfirmed", st, re.I):
            say(f"    still open: {st}")
    if "unconfirmed" in inv:
        say("    contains claims marked 'unconfirmed': check whether they can now be confirmed")
    if up and days(up.group(1), today) > 30:
        todo.append(f"Investments: last checked {days(up.group(1), today)} days ago. Re-check deal statuses, add new deals and headline stories, then set updated: in investments.js.")
    prod = (SITE_DIR / "production.js").read_text(encoding="utf-8")
    for name, year in re.findall(r'name:\s*"([^"]+)",\s*unit:[^\n]*?year:\s*"([^"]+)"', prod):
        y = int(re.match(r"\d{4}", year).group(0))
        # "latest ..." in the year marks figures already checked as the newest the source has published
        flag = "  ← newer figures are probably out" if today.year - y >= 2 and "latest" not in year else ""
        say(f"  production         {name:30} {year}{flag}")
    for when, what in REVIEW:
        if dt.date.fromisoformat(when) <= today + dt.timedelta(days=30):
            say(f"  DUE {when}: {what}")
            todo.append(f"Due {when}: {what}")

    say("")
    say("TO DO")
    say("  nothing" if not todo else "\n".join(f"  - {t}" for t in todo))
    say("")
    text = "\n".join(lines)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(text + "\n", encoding="utf-8")
    print(text)


if __name__ == "__main__":
    main()
