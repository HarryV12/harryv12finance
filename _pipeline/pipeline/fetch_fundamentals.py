"""Company figures for the Data Visualization "Stock breakdown": earnings per share, revenue, net profit and
debt-to-equity, for every stock the breakdown offers (S&P 500, Nasdaq-100, Dow, AI and industry lists).

    python -I -X utf8 _pipeline/pipeline/fetch_fundamentals.py

From Yahoo Finance (yfinance), trailing twelve months. Figures change only with quarterly results, so each
stock is re-fetched once a week; the rest are kept from site/fundamentals.js. The page works out the P/E
from the latest close and the EPS, so it moves with the price every day.

Writes site/fundamentals.js: window.CTC_FUND = {asof, d: {ticker: [fetched, eps, revenue, net profit,
debt-to-equity (as a ratio), financial currency, latest quarter end]}}.
"""
import datetime as dt
import json
import re
import sys
import time
from pathlib import Path

import yfinance as yf

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import SITE_DIR
from prices import yahoo_symbol

OUT = SITE_DIR / "fundamentals.js"
MAX_AGE = 7      # days before a stock's figures are fetched again
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


def main():
    today = dt.date.today()
    old = (read_js("fundamentals.js") or {}).get("d", {})
    tks = pool()
    stale = [t for t in tks if t not in old or (today - dt.date.fromisoformat(old[t][0])).days >= MAX_AGE]
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
        mrq = i.get("mostRecentQuarter")
        out[t] = [today.isoformat(), num(i.get("trailingEps")), num(i.get("totalRevenue")), num(i.get("netIncomeToCommon")),
                  round(de / 100, 3) if de is not None else None, i.get("financialCurrency") or i.get("currency") or "USD",
                  dt.datetime.fromtimestamp(mrq, dt.UTC).date().isoformat() if mrq else None]
        done += 1
        time.sleep(0.05)
    OUT.write_text("window.CTC_FUND=" + json.dumps({"asof": today.isoformat(), "d": out}, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"fundamentals: {len(out)} of {len(tks)} stocks ({done} fetched now, {len(failed)} with no figures"
          + (f": {', '.join(failed[:10])}" if failed else "") + ")")


if __name__ == "__main__":
    main()
