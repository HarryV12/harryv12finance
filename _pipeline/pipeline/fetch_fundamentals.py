"""Company figures for the Data Visualization "Stock breakdown": earnings per share, revenue, net profit and
debt-to-equity, for every stock the breakdown offers (S&P 500, Nasdaq-100, Dow, AI and industry lists).

    python -I -X utf8 _pipeline/pipeline/fetch_fundamentals.py

From Yahoo Finance (yfinance): the latest quarter's revenue, net profit and EPS, the same quarter a year
earlier (for growth), and the twelve-month EPS the P/E is based on. Figures change only with quarterly
results, so they're re-fetched once a week, on Friday's run (9:15 pm UK); on other days the figures already
in site/fundamentals.js are kept (only missing stocks are fetched). Set CTC_FUND_FORCE=1 to fetch everything now. The page works
out the P/E from the latest close and the twelve-month EPS, so it moves with the price every day.

Writes site/fundamentals.js: window.CTC_FUND = {asof, d: {ticker: [fetched, 12-month EPS, 12-month revenue,
12-month net profit, debt-to-equity (as a ratio), reporting currency, latest quarter end,
quarter end, quarter revenue, quarter net profit, quarter EPS, year-ago revenue, year-ago net profit,
year-ago EPS]}}. Quarter figures are in the reporting currency (per-share figures per local share).
"""
import datetime as dt
import json
import os
import re
import sys
import time
from pathlib import Path

import yfinance as yf

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import SITE_DIR
from prices import yahoo_symbol

OUT = SITE_DIR / "fundamentals.js"
MAX_AGE = 8      # a safety net: figures older than this are fetched on any day (if Friday's run was missed)
MAX_PER_RUN = 700


def read_js(name):
    p = SITE_DIR / name
    if not p.exists():
        return None
    t = p.read_text(encoding="utf-8")
    return json.loads(t[t.index("{"):t.rindex("}") + 1])


def pool():
    """The tickers the breakdown offers: S&P 500 members, the extra index/AI names, and the lists in app.js."""
    data = read_js("data.js")
    tks = {t for t, v in data["stocks"].items() if v[5]}
    extra = read_js("extra_prices.js") or {"px": {}}
    tks |= set(extra["px"])
    app = (SITE_DIR / "app.js").read_text(encoding="utf-8")
    for name in ("DOW30", "NDX100", "AI_STOCKS"):
        m = re.search(rf"const {name} = \(?((?:\"[^\"]*\"\s*\+?\s*)+)\)?\.split", app)
        if m:
            tks |= set(" ".join(re.findall(r'"([^"]*)"', m.group(1))).split())
    block = re.search(r"const INDUSTRIES = \{(.*?)\n  \};", app, re.S)
    if block:
        tks |= set(re.findall(r'"([A-Z][A-Z.]{0,5})"', block.group(1)))
    return sorted(t for t in tks if t and t not in ("SPY", "QQQ", "DIA"))


def num(v):
    return None if v is None or v != v else float(v)


def quarter(t):
    """The latest quarter's [end, revenue, net profit, EPS] and the same quarter a year earlier's [revenue, net profit, EPS]."""
    try:
        q = yf.Ticker(yahoo_symbol(t)).quarterly_income_stmt
    except Exception:
        return [None] * 7
    if q is None or q.empty:
        return [None] * 7
    def row(names, col):
        for n in names:
            if n in q.index and col < q.shape[1]:
                return num(q.loc[n].iloc[col])
        return None
    rev, ni, eps = ["Total Revenue", "Operating Revenue"], ["Net Income Common Stockholders", "Net Income"], ["Diluted EPS", "Basic EPS"]
    end = q.columns[0].date().isoformat() if hasattr(q.columns[0], "date") else str(q.columns[0])[:10]
    return [end, row(rev, 0), row(ni, 0), row(eps, 0), row(rev, 4), row(ni, 4), row(eps, 4)]


def main():
    from zoneinfo import ZoneInfo
    today = dt.datetime.now(ZoneInfo("Europe/London")).date()
    old = (read_js("fundamentals.js") or {}).get("d", {})
    tks = pool()
    weekly = today.weekday() == 4 or os.environ.get("CTC_FUND_FORCE") == "1"   # Fridays, or when asked
    stale = [t for t in tks if t not in old or len(old[t]) < 14 or (today - dt.date.fromisoformat(old[t][0])).days >= MAX_AGE
             or (weekly and old[t][0] != today.isoformat())]
    stale.sort(key=lambda t: old[t][0] if t in old else "")
    out, done, failed = {t: old[t] for t in tks if t in old}, 0, []
    for t in stale[:MAX_PER_RUN]:
        try:
            i = yf.Ticker(yahoo_symbol(t)).info or {}
        except Exception:
            failed.append(t); continue
        if not i.get("trailingEps") and not i.get("totalRevenue"):
            failed.append(t); continue
        de = num(i.get("debtToEquity"))
        q = quarter(t)
        mrq = i.get("mostRecentQuarter")
        out[t] = [today.isoformat(), num(i.get("trailingEps")), num(i.get("totalRevenue")), num(i.get("netIncomeToCommon")),
                  round(de / 100, 3) if de is not None else None, i.get("financialCurrency") or i.get("currency") or "USD",
                  dt.datetime.fromtimestamp(mrq, dt.UTC).date().isoformat() if mrq else None] + q
        done += 1
        time.sleep(0.05)
    OUT.write_text("window.CTC_FUND=" + json.dumps({"asof": today.isoformat(), "d": out}, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"fundamentals: {len(out)} of {len(tks)} stocks ({done} fetched now, {len(failed)} with no figures"
          + (f": {', '.join(failed[:10])}" if failed else "") + ")")


if __name__ == "__main__":
    main()
