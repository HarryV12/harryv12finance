"""Why did the market drop? For the website's "Market drops" page.

Finds sharp falls in the S&P 500 (SPY) and the Nasdaq 100 (QQQ) since the data starts:
  - a drop day: SPY down 1.5% or more, or QQQ down 2% or more, in one day
  - a selloff: SPY down 3% or more, or QQQ down 4% or more, over five trading days
  - a slide: SPY down 5% or more, or QQQ down 6% or more, over ten trading days (a slow fall like July 2026's)
Each flag covers its whole window; overlapping windows become one episode. For each episode it records:
  - the move (SPY, QQQ, Dow) and the hardest-hit sectors and large companies (from the site's daily prices)
  - headlines from that day ("what happened") and from the week after ("why it happened": the follow-up
    and analysis pieces), from Google News' public RSS search, kept to well-known financial news outlets

Writes site/market_moves.js (window.CTC_MOVES). Searches are cached in cache/news/ (older episodes are never
searched again; the latest two weeks are refreshed after 6 hours).

    python -I -X utf8 pipeline/fetch_market_moves.py
"""
import datetime as dt
import html
import json
import re
import statistics
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import CACHE, CONFIG_DIR, SITE_DIR

OUT = SITE_DIR / "market_moves.js"
NEWS = CACHE / "news"
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36"}
# outlets institutions and professional investors read; anything else is left out
OUTLETS = ["Reuters", "Bloomberg", "The Wall Street Journal", "WSJ", "Financial Times", "CNBC", "Associated Press", "AP News", "MarketWatch",
           "Barron's", "Yahoo Finance", "The New York Times", "Axios", "Morningstar", "Investopedia", "Business Insider", "Fortune", "CNN",
           "Forbes", "The Economist", "Nasdaq", "Investor's Business Daily", "Seeking Alpha", "Kiplinger", "The Washington Post", "BBC"]
# industries people ask about: a basket of their biggest names each, the searches for their news, and the words a
# headline must contain to count as being about them
THEMES = [
    ("ai", "AI and chips", "NVDA AMD AVGO TSM MU ARM SMCI PLTR MRVL LRCX AMAT KLAC ORCL", ["AI stocks", "chip stocks"],
     r"\b(AI|A\.I\.|artificial intelligence|chips?|chipmakers?|semiconductors?|Nvidia|AMD|Broadcom|TSMC|Micron|Arm|Palantir|Oracle|data cent(er|re)s?)\b"),
    ("defense", "Defense", "LMT RTX NOC GD LHX HII LDOS BAH AVAV", ["defense stocks"],
     r"\b(defen[cs]e|military|Pentagon|Lockheed|Raytheon|RTX|Northrop|General Dynamics|L3Harris|weapons?|arms|NATO)\b"),
    ("banks", "Banks", "JPM BAC C WFC GS MS SCHW USB PNC KRE", ["bank stocks"],
     r"\b(banks?|banking|lenders?|JPMorgan|Goldman|Citi(group)?|Wells Fargo|Morgan Stanley|regional|financials?|credit)\b"),
    ("oil", "Oil and gas", "XOM CVX COP OXY SLB EOG HAL MPC PSX XLE", ["oil stocks", "energy stocks"],
     r"\b(oil|crude|energy|OPEC|Exxon|Chevron|gas|Brent|WTI|refiners?|drillers?)\b"),
    ("health", "Healthcare", "LLY UNH JNJ PFE MRK ABBV TMO ABT XLV", ["healthcare stocks"],
     r"\b(health ?care|drugmakers?|pharma(ceutical)?s?|biotech|insurers?|UnitedHealth|Eli Lilly|Pfizer|Merck|Medicare|FDA|drugs?)\b"),
]
DAY_SPY, DAY_QQQ, WEEK_SPY, WEEK_QQQ, SLIDE_SPY, SLIDE_QQQ = -0.015, -0.02, -0.03, -0.04, -0.05, -0.06


def load(name):
    s = (SITE_DIR / name).read_text(encoding="utf-8")
    return json.loads(s[s.index("{"):s.rindex("}") + 1])


def search(q, after, before, fresh):
    """Headlines for a Google News search between two dates: [{title, source, date, url}]."""
    NEWS.mkdir(parents=True, exist_ok=True)
    key = re.sub(r"\W+", "_", f"{q}_{after}_{before}")[:150]
    p = NEWS / f"{key}.json"
    if p.exists() and (not fresh or time.time() - p.stat().st_mtime < 6 * 3600):
        return json.loads(p.read_text(encoding="utf-8"))
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": f"{q} after:{after} before:{before}", "hl": "en-US", "gl": "US", "ceid": "US:en"})
    out = []
    try:
        s = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read().decode("utf-8", "replace")
        for item in re.findall(r"<item>(.*?)</item>", s, re.S):
            g = lambda tag: html.unescape((re.search(f"<{tag}[^>]*>(.*?)</{tag}>", item, re.S) or [None, ""])[1]).strip()
            src, title = g("source"), g("title")
            title = re.sub(r"\s+-\s+" + re.escape(src) + r"\s*$", "", title) if src else title
            try:
                date = dt.datetime.strptime(g("pubDate")[:16], "%a, %d %b %Y").date().isoformat()
            except ValueError:
                date = ""
            out.append({"title": title, "source": src, "date": date, "url": g("link")})
        time.sleep(1.2)
    except Exception as e:
        print("news search failed:", q, after, e)
        return []
    p.write_text(json.dumps(out), encoding="utf-8")
    return out


def keep(items, start, end, n, must=None):
    seen, out = set(), []
    for it in items:
        if not any(o.lower() in it["source"].lower() for o in OUTLETS):
            continue
        if not (start <= it["date"] <= end):
            continue
        if must and not re.search(must, it["title"], re.I):
            continue
        k = re.sub(r"\W+", "", it["title"].lower())[:60]
        if k in seen or re.search(r"\b(dividend|best stocks? to buy|millionaire|retire|should you buy|1 stock|2 stocks|3 stocks|things to know|stock market news for|what investors should watch|on the market today)\b", it["title"], re.I):
            continue
        seen.add(k); out.append(it)
    out.sort(key=lambda it: it["date"])
    return out[:n]


def main():
    P, D = load("prices.js"), load("data.js")
    dates, px = P["dates"], P["px"]
    spy, qqq, dia = px["SPY"], px["QQQ"], px.get("DIA")
    ret = lambda s, i, k=1: (s[i] / s[i - k] - 1) if i >= k and s[i] and s[i - k] else None
    ranges = []  # [first day, last day] of each flag's window
    for i in range(10, len(dates)):
        d1s, d1q = ret(spy, i), ret(qqq, i)
        if d1s is None or d1q is None:
            continue
        w5s, w5q, w10s, w10q = ret(spy, i, 5), ret(qqq, i, 5), ret(spy, i, 10), ret(qqq, i, 10)
        if (w10s is not None and w10s <= SLIDE_SPY) or (w10q is not None and w10q <= SLIDE_QQQ):
            ranges.append([i - 9, i])
        elif (w5s is not None and w5s <= WEEK_SPY) or (w5q is not None and w5q <= WEEK_QQQ):
            ranges.append([i - 4, i])
        elif d1s <= DAY_SPY or d1q <= DAY_QQQ:
            ranges.append([i, i])
    eps = []
    for a, b in ranges:
        if eps and a <= eps[-1][-1] + 2:
            eps[-1] = list(range(eps[-1][0], max(eps[-1][-1], b) + 1))
        else:
            eps.append(list(range(a, b + 1)))
    today = dates[-1]
    stocks = D["stocks"]
    out = []
    for ep in eps:
        a, b = ep[0], ep[-1]
        a0 = max(0, a - 1)
        # the episode's span: from the close before its first flagged day to its lowest close
        lowest = min(range(a, min(len(dates), b + 1)), key=lambda i: (qqq[i] or 1e9) / (qqq[a0] or 1))
        start, end = dates[a], dates[lowest if lowest >= a else b]
        mv = lambda s: round(s[lowest] / s[a0] - 1, 4) if s and s[lowest] and s[a0] else None
        worst_day = min(ep, key=lambda i: ret(qqq, i) or 0)
        # hardest hit, over the episode: sectors (median of their stocks) and large companies
        by_sec, big = {}, []
        for tk, s in px.items():
            st = stocks.get(tk)
            if not st or not s[a0] or not s[lowest]:
                continue
            r = s[lowest] / s[a0] - 1
            if st[1] and st[1] not in ("Fund", "Funds", "Crypto", "Miscellaneous"):
                by_sec.setdefault(st[1], []).append(r)
            if (st[4] or 0) >= 50e9 and st[1] != "Fund":
                big.append((r, tk))
        secs = sorted(((statistics.median(v), k) for k, v in by_sec.items() if len(v) >= 8))[:4]
        big.sort()
        fresh = (dt.date.fromisoformat(today) - dt.date.fromisoformat(end)).days < 15
        d0 = (dt.date.fromisoformat(start) - dt.timedelta(days=1)).isoformat()
        d_end1 = (dt.date.fromisoformat(end) + dt.timedelta(days=2)).isoformat()
        d_end8 = (dt.date.fromisoformat(end) + dt.timedelta(days=9)).isoformat()
        what = keep(search("stock market", d0, d_end1, fresh) + search("stocks fall", d0, d_end1, fresh), start, d_end1, 8)
        why = keep(search("stock market selloff why", end, d_end8, fresh) + search("market sell-off what caused", end, d_end8, fresh)
                   + search("stocks slide investors", end, d_end8, fresh), end, d_end8, 8)
        why = [w for w in why if w["title"] not in {x["title"] for x in what}][:6]
        out.append({"start": start, "end": end, "days": len(ep), "worst": dates[worst_day],
                    "spy": mv(spy), "qqq": mv(qqq), "dia": mv(dia),
                    "worst_day": {"date": dates[worst_day], "spy": round(ret(spy, worst_day) or 0, 4), "qqq": round(ret(qqq, worst_day) or 0, 4)},
                    "sectors": [[k, round(v, 4)] for v, k in secs], "big": [[tk, round(r, 4)] for r, tk in big[:6]],
                    "what": what, "why": why})
        print(f"{start} – {end}: SPY {mv(spy):+.1%}, QQQ {mv(qqq):+.1%} · {len(what)} + {len(why)} headlines", flush=True)
    out.sort(key=lambda e: e["end"], reverse=True)
    themes = theme_moves(dates, px, spy, stocks, today)
    bigs = [tk for tk, st in stocks.items() if (st[4] or 0) >= 50e9 and st[1] not in ("Fund", "Funds") and tk in px]
    market = {"now": recent(dates, px, spy, spy, bigs, ["stock market", "stocks"], None, 5),
              "today": recent(dates, px, spy, spy, bigs, ["stock market today", "stocks"], None, 1)}
    # plain-English explanations written from each move's headlines (config/move_summaries.json)
    summ = json.loads((CONFIG_DIR / "move_summaries.json").read_text(encoding="utf-8")) if (CONFIG_DIR / "move_summaries.json").exists() else {}
    for e in out:
        if summ.get(f"drop|{e['start']}"):
            e["summary"] = summ[f"drop|{e['start']}"]
    for k, th in themes.items():
        for e in th["events"]:
            if summ.get(f"{k}|{e['start']}"):
                e["summary"] = summ[f"{k}|{e['start']}"]
    # cause-and-effect points (config/move_details.json)
    det = json.loads((CONFIG_DIR / "move_details.json").read_text(encoding="utf-8")) if (CONFIG_DIR / "move_details.json").exists() else {}
    for e in out:
        if det.get(f"drop|{e['start']}"):
            e["detail"] = det[f"drop|{e['start']}"]
    for k, th in themes.items():
        for e in th["events"]:
            if det.get(f"{k}|{e['start']}"):
                e["detail"] = det[f"{k}|{e['start']}"]
    # today's and this week's explanations, keyed "today|<industry or all>|<date>" and "now|...|<date>"
    for k, src in [("all", market)] + list(themes.items()):
        for w in ("now", "today"):
            n = src[w]
            for field, book in (("summary", summ), ("detail", det)):
                if book.get(f"{w}|{k}|{n['end']}"):
                    n[field] = book[f"{w}|{k}|{n['end']}"]
            if "summary" not in n:
                print(f"no written explanation yet for {w}|{k}|{n['end']}")
    missing = [f"drop|{e['start']}" for e in out if "summary" not in e] + [f"{k}|{e['start']}" for k, th in themes.items() for e in th["events"] if "summary" not in e]
    if missing:
        print("moves without a written explanation (add to config/move_summaries.json):", ", ".join(missing))
    # how each industry did in each market drop
    for e in out:
        a0, b = max(0, dates.index(e["start"]) - 1), dates.index(e["end"])
        e["themes"] = {k: round(th["idx"][b] / th["idx"][a0] - 1, 4) for k, th in themes.items() if th["idx"][a0] and th["idx"][b]}
    for th in themes.values():
        th["series"] = [[dates[i], round(th["idx"][i], 4)] for i in range(0, len(dates), 3)] + [[dates[-1], round(th["idx"][-1], 4)]]
        del th["idx"]
    OUT.write_text("window.CTC_MOVES=" + json.dumps({"generated": today, "episodes": out, "themes": themes, "market": market}, separators=(",", ":")) + ";", encoding="utf-8")
    print(f"{len(out)} drops written to {OUT} ({OUT.stat().st_size / 1e3:.0f} KB)")


def recent(dates, px, x, spy, tks, queries, must, days):
    """The last `days` trading days of a series (an industry basket or the S&P 500): its move, the S&P 500's, the past
    month, the stocks that moved most, and the news of those days."""
    L = len(dates) - 1
    a0, end = L - days, dates[L]
    each = sorted(((px[t][L] / px[t][a0] - 1, t) for t in tks if px.get(t) and px[t][a0] and px[t][L]), key=lambda v: -abs(v[0]))
    d0 = (dt.date.fromisoformat(dates[a0 + 1]) - dt.timedelta(days=2 if days == 1 else 1)).isoformat()
    d1 = (dt.date.fromisoformat(end) + dt.timedelta(days=1)).isoformat()
    news = keep(sum((search(q, d0, d1, True) for q in queries), []), d0, d1, 8, must)
    return {"start": dates[a0 + 1], "end": end, "move": round(x[L] / x[a0] - 1, 4), "spy": round(spy[L] / spy[a0] - 1, 4),
            "month": round(x[L] / x[max(0, L - 21)] - 1, 4), "most": [[t, round(r, 4)] for r, t in each[:4]], "what": news}


def theme_moves(dates, px, spy, stocks, today):
    """Each industry basket as an equal-weight index, and its sharp falls and jumps (five trading days beyond 2.2 times
    its usual five-day move, and at least 5%), each with the stocks that moved most and the headlines then and after."""
    out = {}
    for key, name, tks, queries, must in THEMES:
        tks = [t for t in tks.split() if t in px]
        idx, v = [1.0], 1.0
        for i in range(1, len(dates)):
            rs = [px[t][i] / px[t][i - 1] - 1 for t in tks if px[t][i] and px[t][i - 1]]
            v *= 1 + (statistics.mean(rs) if rs else 0); idx.append(v)
        r5 = [idx[i] / idx[i - 5] - 1 for i in range(5, len(idx))]
        cut = max(0.05, 2.2 * statistics.pstdev(r5))
        flags = []
        for i in range(5, len(idx)):
            r = idx[i] / idx[i - 5] - 1
            if abs(r) >= cut:
                flags.append([i - 4, i, "up" if r > 0 else "down"])
        evs = []
        for a, b, d in flags:
            if evs and evs[-1][2] == d and a <= evs[-1][1] + 2:
                evs[-1][1] = max(evs[-1][1], b)
            else:
                evs.append([a, b, d])
        events = []
        for a, b, d in evs:
            a0 = max(0, a - 1)
            ext = (max if d == "up" else min)(range(a, b + 1), key=lambda i: idx[i])
            mv = lambda s: round(s[ext] / s[a0] - 1, 4) if s and s[ext] and s[a0] else None
            each = sorted(((px[t][ext] / px[t][a0] - 1, t) for t in tks if px[t][a0] and px[t][ext]), reverse=d == "up")
            start, end = dates[a], dates[ext]
            fresh = (dt.date.fromisoformat(today) - dt.date.fromisoformat(end)).days < 15
            d0 = (dt.date.fromisoformat(start) - dt.timedelta(days=1)).isoformat()
            d2 = (dt.date.fromisoformat(end) + dt.timedelta(days=2)).isoformat()
            d9 = (dt.date.fromisoformat(end) + dt.timedelta(days=9)).isoformat()
            verb = "rally" if d == "up" else "fall"
            what = keep(sum((search(f"{q} {verb}", d0, d2, fresh) for q in queries), []), start, d2, 6, must)
            why = keep(sum((search(f"{q} why", end, d9, fresh) for q in queries[:1]), []), end, d9, 6, must)
            why = [w for w in why if w["title"] not in {x["title"] for x in what}][:5]
            events.append({"start": start, "end": end, "dir": d, "move": mv(idx), "spy": mv(spy),
                           "most": [[t, round(r, 4)] for r, t in each[:4]], "what": what, "why": why})
            print(f"{name}: {start} – {end} {d} {mv(idx):+.1%} · {len(what)} + {len(why)} headlines", flush=True)
        events.sort(key=lambda e: e["end"], reverse=True)
        # today and this week, whether or not the move was sharp
        now = recent(dates, px, idx, spy, tks, queries, must, 5)
        day = recent(dates, px, idx, spy, tks, queries, must, 1)
        out[key] = {"name": name, "tickers": tks, "cut": round(cut, 4), "events": events, "now": now, "today": day, "idx": idx}
    return out


if __name__ == "__main__":
    main()
