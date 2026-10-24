"""Aftermath: steady, low-risk stocks that have fallen for two months or more, for the website's "Aftermath" page.

A stock qualifies when, over the past six months:
  - it was steady before: its daily swings in the year before its peak were among the calmest 40% of the list
    (the hand-picked international names below count whatever their swings)
  - it fell 15% or more from that peak, the peak was at least two months (40 trading days) ago, and it is still
    near its low (within 8%)
  - it is a big company: worth $20 billion or more (or one of the hand-picked international names below)
The ten biggest falls relative to how steady the stock used to be are kept, plus any hand-picked name that
qualifies. For each: its daily price since a year ago, how far it fell and how fast, the S&P 500 and its sector
over the same days, and the news since its peak (Google News). The written timeline of what caused the fall
comes from config/aftermath_notes.json.

Writes site/aftermath.js (window.CTC_AFTERMATH).

    python -I -X utf8 pipeline/fetch_aftermath.py
"""
import datetime as dt
import json
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import CONFIG_DIR, SITE_DIR
from fetch_market_moves import keep, search, load

OUT = SITE_DIR / "aftermath.js"
# well-known steady companies listed outside the US, priced from their home market (Yahoo symbols)
EXTRA = {"RR.L": ["Rolls-Royce", "Industrials", "Aerospace engines", 90e9], "DGE.L": ["Diageo", "Consumer Staples", "Drinks", 60e9],
         "ULVR.L": ["Unilever", "Consumer Staples", "Household goods", 150e9], "NESN.SW": ["Nestlé", "Consumer Staples", "Food", 250e9],
         "NOVO-B.CO": ["Novo Nordisk", "Health Care", "Drugs", 250e9], "SIE.DE": ["Siemens", "Industrials", "Industrial technology", 170e9]}


def extra_prices(dates):
    import pandas as pd
    import yfinance as yf
    df = yf.download(list(EXTRA), start=dates[0], auto_adjust=True, progress=False, group_by="column")["Close"]
    out = {}
    for sym in EXTRA:
        if sym not in df:
            continue
        s = df[sym].dropna()
        s.index = s.index.strftime("%Y-%m-%d")
        vals, last = [], None
        for d in dates:  # line up with the US trading days; a home-market holiday keeps the last close
            if d in s.index:
                last = float(s[d])
            vals.append(last)
        out[sym] = vals
    return out


def main():
    P, D = load("prices.js"), load("data.js")
    dates, px, stocks = P["dates"], P["px"], D["stocks"]
    L = len(dates) - 1
    spy = px["SPY"]
    try:
        ex = extra_prices(dates)
    except Exception as e:
        print("international prices failed:", e)
        ex = {}
    universe = {tk: px[tk] for tk, st in stocks.items() if tk in px and st[5]}
    universe.update(ex)
    info = lambda tk: EXTRA[tk] if tk in EXTRA else [stocks[tk][0], stocks[tk][1], stocks[tk][3] or stocks[tk][2], stocks[tk][4] or 0]
    rows = []
    for tk, x in universe.items():
        if not x[L] or not x[L - 260]:
            continue
        a = L - 126
        hi_at = max(range(a, L + 1), key=lambda i: x[i] or 0)
        hi, low = x[hi_at], min(v for v in x[hi_at:] if v)
        rets = [x[i] / x[i - 1] - 1 for i in range(max(1, hi_at - 252), hi_at) if x[i] and x[i - 1]]
        if len(rets) < 120:
            continue
        vol = statistics.pstdev(rets) * 252 ** 0.5
        rows.append({"tk": tk, "hi_at": hi_at, "hi": hi, "low": low, "drop": x[L] / hi - 1, "vol": vol})
    cut = sorted(r["vol"] for r in rows)[int(len(rows) * 0.4)]
    picks = [r for r in rows if (r["vol"] <= cut or r["tk"] in EXTRA) and r["drop"] <= -0.15 and L - r["hi_at"] >= 40 and universe[r["tk"]][L] <= r["low"] * 1.08
             and (info(r["tk"])[3] >= 20e9 or r["tk"] in EXTRA)]
    picks.sort(key=lambda r: r["drop"] / r["vol"])
    hand = [r for r in picks if r["tk"] in EXTRA]  # well-known names people ask about (Rolls-Royce...) always count
    chosen = hand + [r for r in picks if r["tk"] not in EXTRA][:10 - len(hand)]
    print(f"steady = yearly swings under {cut:.0%}; {len(picks)} steady stocks fell 15%+ for 2+ months")
    notes = json.loads((CONFIG_DIR / "aftermath_notes.json").read_text(encoding="utf-8")) if (CONFIG_DIR / "aftermath_notes.json").exists() else {}
    out = []
    for r in chosen:
        tk, x = r["tk"], universe[r["tk"]]
        name, sector, industry, mcap = info(tk)
        a = r["hi_at"]
        sec = [universe[t][L] / universe[t][a] - 1 for t in universe if t != tk and info(t)[1] == sector and universe[t][a] and universe[t][L]]
        during = [x[i] / x[i - 1] - 1 for i in range(a + 1, L + 1) if x[i] and x[i - 1]]
        short = name.split(" Inc")[0].split(" Corp")[0].split(",")[0]
        news = keep(search(f"{short} stock", dates[a], dates[L], True) + search(f"{short} shares fall", dates[a], dates[L], True), dates[a], dates[L], 12)
        e = {"tk": tk, "hand": tk in EXTRA and r["vol"] > cut, "name": name, "sector": sector, "industry": industry, "mcap": mcap, "peak": dates[a], "peak_px": round(r["hi"], 2),
             "now_px": round(x[L], 2), "drop": round(r["drop"], 4), "days": L - a, "vol_before": round(r["vol"], 4),
             "vol_during": round(statistics.pstdev(during) * 252 ** 0.5, 4) if len(during) > 5 else None,
             "spy": round(spy[L] / spy[a] - 1, 4), "sector_move": round(statistics.median(sec), 4) if sec else None,
             "series": [[dates[i], round(x[i], 2)] for i in range(L - 260, L + 1) if x[i]], "news": news}
        e.update(notes.get(tk, {}))
        out.append(e)
        print(f"{tk:10} {name[:32]:32} {r['drop']:+.1%} since {dates[a]} (steady: {r['vol']:.0%} a year) · {len(news)} headlines{'' if tk in notes else ' · NO NOTES'}")
    OUT.write_text("window.CTC_AFTERMATH=" + json.dumps({"generated": dates[L], "steady_cut": round(cut, 4), "stocks": out}, separators=(",", ":")) + ";", encoding="utf-8")
    print(f"wrote {OUT} ({OUT.stat().st_size / 1e3:.0f} KB)")


if __name__ == "__main__":
    main()
