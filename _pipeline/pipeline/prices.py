"""Daily closing prices from Yahoo Finance (yfinance), cached per ticker per day.

Cache layout: cache/prices/<YYYY-MM-DD>_from_<start>/<TICKER>.csv  (one folder per download
day and history start, so a longer history is never mistaken for a shorter cached one;
existing files are reused, never overwritten).
"""
import datetime as dt
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import PRICE_DIR


def yahoo_symbol(ticker):
    return ticker.replace(".", "-").replace("/", "-")


def last_closed_day(at=None):
    """The newest trading day with a final close: today in New York only after 4:30 pm there,
    so a run during market hours doesn't treat a half-day price as the close. `at` is a Unix
    time to ask about instead of now (when a cached file was downloaded)."""
    from zoneinfo import ZoneInfo
    ny = ZoneInfo("America/New_York")
    now = dt.datetime.fromtimestamp(at, ny) if at is not None else dt.datetime.now(ny)
    return now.date() if now.time() >= dt.time(16, 30) else now.date() - dt.timedelta(days=1)


def load_prices(tickers, start, chunk=80):
    import yfinance as yf

    day_dir = PRICE_DIR / f"{dt.date.today().isoformat()}_from_{start}"
    day_dir.mkdir(parents=True, exist_ok=True)
    missing = [t for t in tickers if not (day_dir / f"{t}.csv").exists() or (day_dir / f"{t}.csv").stat().st_size < 20]
    print(f"prices: {len(tickers) - len(missing)} cached today, {len(missing)} to download")
    for i in range(0, len(missing), chunk):
        part = missing[i:i + chunk]
        ysyms = {yahoo_symbol(t): t for t in part}
        df = yf.download(list(ysyms), start=start, auto_adjust=True, progress=False, threads=True, group_by="column")
        closes = df["Close"] if isinstance(df.columns, pd.MultiIndex) else df[["Close"]].rename(columns={"Close": part[0]})
        for ysym, t in ysyms.items():
            s = closes[ysym].dropna() if ysym in closes else pd.Series(dtype=float)
            if len(s):  # failures (often temporary on Yahoo's side) are retried next run
                s.rename("close").to_csv(day_dir / f"{t}.csv", index_label="date")
        print(f"  downloaded {min(i + chunk, len(missing))}/{len(missing)}")
    out = {}
    cutoff = pd.Timestamp(last_closed_day())
    for t in tickers:
        p = day_dir / f"{t}.csv"
        if p.exists():
            s = pd.read_csv(p, index_col="date")["close"]
            if len(s):  # older runs left empty files for failed downloads
                s.index = pd.to_datetime(s.index)
                # a file saved during market hours holds that day's price so far, not its close
                saved = pd.Timestamp(last_closed_day(p.stat().st_mtime))
                out[t] = s[s.index <= min(cutoff, saved)]
    print(f"prices: no data for {len(tickers) - len(out)} tickers")
    return pd.DataFrame(out).sort_index()


TRADED_DIR = PRICE_DIR.parent / "prices_traded"


def load_traded_closes(tickers, start, chunk=80):
    """Closing prices as they were on each day, for share count x price = dollars traded.

    load_prices() gives adjusted closes (scaled back for later splits and dividends), which suit
    returns but not dollar amounts: 100 NVDA shares bought before its 10:1 split cost 10x the
    adjusted price. Yahoo's unadjusted "Close" is still split-adjusted, so later splits are
    multiplied back in from the split history. Cached like load_prices, in cache/prices_traded/."""
    import yfinance as yf

    day_dir = TRADED_DIR / f"{dt.date.today().isoformat()}_from_{start}"
    day_dir.mkdir(parents=True, exist_ok=True)
    missing = [t for t in tickers if not (day_dir / f"{t}.csv").exists()]
    print(f"traded closes: {len(tickers) - len(missing)} cached today, {len(missing)} to download")
    for i in range(0, len(missing), chunk):
        part = missing[i:i + chunk]
        ysyms = {yahoo_symbol(t): t for t in part}
        df = yf.download(list(ysyms), start=start, auto_adjust=False, actions=True, progress=False,
                         threads=True, group_by="column")
        multi = isinstance(df.columns, pd.MultiIndex)
        have = set(df.columns.get_level_values(0)) if len(df.columns) else set()
        for ysym, t in ysyms.items():
            # a batch where every download failed comes back without some columns
            col = lambda name: None if name not in have else (df[name][ysym] if ysym in df[name] else None) if multi else df[name]
            close, splits = col("Close"), col("Stock Splits")
            if close is None or not close.notna().any():
                continue  # retried next run
            splits = splits.fillna(0) if splits is not None else pd.Series(0.0, index=close.index)
            pd.DataFrame({"close": close, "split": splits}).dropna(subset=["close"]).to_csv(day_dir / f"{t}.csv", index_label="date")
    out = {}
    for t in tickers:
        p = day_dir / f"{t}.csv"
        if not p.exists():
            continue
        f = pd.read_csv(p, index_col="date")
        f.index = pd.to_datetime(f.index)
        f = f[f.index <= pd.Timestamp(min(last_closed_day(), last_closed_day(p.stat().st_mtime)))]
        ratio = f["split"].where(f["split"] > 0, 1.0)
        # a split on day s divides every close before s: undo it by the product of later splits
        later = ratio[::-1].cumprod()[::-1].shift(-1, fill_value=1.0)
        out[t] = (f["close"] * later).rename(t)
    print(f"traded closes: no data for {len(tickers) - len(out)} tickers")
    return out
