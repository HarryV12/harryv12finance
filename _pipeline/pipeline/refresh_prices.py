"""Bring the site's prices up to the latest close without re-reading any filings.

    python -I -X utf8 _pipeline/pipeline/refresh_prices.py

Reads site/data.js (built weekly on the PC from the filings), downloads fresh daily closes from
Yahoo Finance for every stock in it, and rewrites:
  - prices.js  (daily closes for every stock, and SPY)
  - series.js  (weekly closes for every stock)
  - data.js    only its price fields: the weeks, SPY's weekly line, prices_through, and the returns of
               trades still open (a buy not yet sold, and the "copied on disclosure" return), which run
               to the latest close. Closed trades, members, filings and everything else stay as built.

Nothing is written unless the download looks complete (SPY has a new close and at most 3% of stocks
failed); a stock whose download failed keeps its old prices. Trades disclosed since the last full
build get their "copied" return at the next weekly build on the PC.
"""
import datetime as dt
import json
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import SITE_DIR, START_DATE
from prices import load_prices

MAX_FAILED = 0.03


def read_js(name, var):
    text = (SITE_DIR / name).read_text(encoding="utf-8")
    prefix = f"window.{var}="
    assert text.startswith(prefix), name
    return json.loads(text[len(prefix):text.rindex(";")])


def write_js(name, var, obj):
    (SITE_DIR / name).write_text(f"window.{var}=" + json.dumps(obj, separators=(",", ":"), default=str) + ";\n", encoding="utf-8")


def sig(x, n=5):
    if x is None or pd.isna(x):
        return None
    return float(f"{x:.{n}g}")


def main():
    data = read_js("data.js", "CTC_DATA")
    old_px = read_js("prices.js", "CTC_PRICES")
    old_series = read_js("series.js", "CTC_SERIES")
    tickers = sorted(data["stocks"])
    start = (dt.date.fromisoformat(START_DATE) - dt.timedelta(days=12)).isoformat()
    px = load_prices(tickers + ["SPY"], start=start)

    if "SPY" not in px:
        sys.exit("no SPY prices: Yahoo Finance download failed, nothing written")
    spy = px["SPY"].dropna()
    last_day = spy.index[-1]
    if last_day.date().isoformat() <= data["prices_through"]:
        print(f"no new close since {data['prices_through']}: nothing to do")
        return
    failed = [tk for tk in tickers if tk not in px or px[tk].dropna().empty]
    if len(failed) > MAX_FAILED * len(tickers):
        sys.exit(f"{len(failed)} of {len(tickers)} stocks failed to download: nothing written")

    # the same weekly grid and daily dates build_data.py makes
    weeks = pd.date_range(dt.date.fromisoformat(START_DATE), last_day, freq="W-FRI")
    if len(weeks) == 0 or weeks[-1] < last_day:
        weeks = weeks.append(pd.DatetimeIndex([last_day]))

    def weekly(s):
        s = s[s.index <= last_day]
        w = s.resample("W-FRI").last()
        w.index = w.index.where(w.index <= last_day, last_day)
        return w.reindex(weeks).ffill(limit=2)

    days = spy.index[spy.index >= pd.Timestamp(START_DATE)]
    dates = [d.date().isoformat() for d in days]
    old_at = {d: i for i, d in enumerate(old_px["dates"])}

    daily, series = {}, {}
    for tk in sorted(old_px["px"]):
        if tk in failed or tk not in px:
            # keep what we had, on the new dates
            old = old_px["px"][tk]
            daily[tk] = [old[old_at[d]] if d in old_at else None for d in dates]
        else:
            daily[tk] = [sig(v) for v in px[tk].reindex(days).tolist()]
    for tk in tickers:
        if tk in failed:
            old = old_series.get(tk, [])
            series[tk] = (old + [None] * len(weeks))[:len(weeks)]
        else:
            series[tk] = [sig(v) for v in weekly(px[tk].dropna()).tolist()]

    # open trades: their return runs to the latest close
    f = {k: i for i, k in enumerate(data["fields"])}
    spy_last = float(spy.iloc[-1])
    last = {tk: float(px[tk].dropna().iloc[-1]) for tk in tickers if tk not in failed}
    n_open = n_copy = 0
    for row in data["trades"]:
        tk = row[f["t"]]
        if tk not in last:
            continue
        if row[f["r"]] is not None and row[f["xd"]] is None and row[f["ep"]] and row[f["se"]]:
            row[f["r"]] = round(last[tk] / row[f["ep"]] - 1, 4)
            row[f["sr"]] = round(spy_last / row[f["se"]] - 1, 4)
            n_open += 1
        if row[f["rf"]] is not None and row[f["xfd"]] is None and row[f["epf"]] and row[f["sef"]]:
            row[f["rf"]] = round(last[tk] / row[f["epf"]] - 1, 4)
            row[f["srf"]] = round(spy_last / row[f["sef"]] - 1, 4)
            n_copy += 1

    data["weeks"] = [w.date().isoformat() for w in weeks]
    data["spy"] = [sig(v) for v in weekly(spy).tolist()]
    data["prices_through"] = last_day.date().isoformat()
    write_js("prices.js", "CTC_PRICES", {"dates": dates, "px": daily})
    write_js("series.js", "CTC_SERIES", series)
    write_js("data.js", "CTC_DATA", data)
    print(f"prices through {data['prices_through']}: {len(tickers) - len(failed)} of {len(tickers)} stocks, "
          f"{n_open:,} open trades and {n_copy:,} copied trades re-priced" + (f"; kept old prices for {', '.join(failed[:12])}" if failed else ""))


if __name__ == "__main__":
    main()
