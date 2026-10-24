"""Daily closes for stocks the finance pages need that members haven't traded, so aren't in site/prices.js:
Nasdaq-100 and Dow members, AI names, and companies on the Investments page. Lined up with prices.js's days.

Writes site/extra_prices.js (window.CTC_XPX = {px: {ticker: [closes]}}); the website adds them to its prices.

    python -I -X utf8 pipeline/fetch_extra_prices.py
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import SITE_DIR
from fetch_market_moves import load

OUT = SITE_DIR / "extra_prices.js"
DOW = "AAPL AMGN AMZN AXP BA CAT CRM CSCO CVX DIS GS HD HON IBM JNJ JPM KO MCD MMM MRK MSFT NKE NVDA PG SHW TRV UNH V VZ WMT"
NASDAQ100 = ("AAPL ABNB ADBE ADI ADP ADSK AEP AMAT AMD AMGN AMZN APP ARM ASML AVGO AXON AZN BIIB BKNG BKR CCEP CDNS CDW CEG CHTR CMCSA COST "
             "CPRT CRWD CSCO CSGP CSX CTAS CTSH DASH DDOG DXCM EA EXC FANG FAST FTNT GEHC GFS GILD GOOG GOOGL HON IDXX INTC INTU ISRG KDP KHC "
             "KLAC LIN LRCX LULU MAR MCHP MDLZ MELI META MNST MRVL MSFT MSTR MU NFLX NVDA NXPI ODFL ON ORLY PANW PAYX PCAR PDD PEP PLTR PYPL "
             "QCOM REGN ROP ROST SBUX SHOP SNPS TEAM TMUS TRI TSLA TTD TTWO TXN VRSK VRTX WBD WDAY XEL ZS")
AI = "NVDA AVGO AMD TSM MU ARM SMCI PLTR MRVL LRCX AMAT KLAC ORCL MSFT GOOGL META AMZN CRWV ANET VRT DELL HPE SNOW NOW CRM ADBE IBM INTC QCOM TXN ASML VST CEG"
INVEST = "GFS LAC TMQ MP IREN CIFR SNAP"  # plus names the AI-bubble page compares


def main():
    import pandas as pd
    import yfinance as yf
    P = load("prices.js")
    dates, have = P["dates"], P["px"]
    want = sorted({*DOW.split(), *NASDAQ100.split(), *AI.split(), *INVEST.split()} - set(have))
    print(f"{len(want)} tickers to fetch")
    df = yf.download(want, start=dates[0], auto_adjust=True, progress=False, group_by="column")["Close"]
    if isinstance(df, pd.Series):
        df = df.to_frame(want[0])
    out = {}
    for t in want:
        if t not in df:
            continue
        s = df[t].dropna()
        s.index = s.index.strftime("%Y-%m-%d")
        if len(s) < 20:
            continue
        vals, last = [], None
        for d in dates:
            if d in s.index:
                last = round(float(s[d]), 4)
            vals.append(last if last is not None and d >= s.index[0] else None)
        out[t] = vals
    OUT.write_text("window.CTC_XPX=" + json.dumps({"px": out}, separators=(",", ":")) + ";", encoding="utf-8")
    print(f"wrote {len(out)} of {len(want)} to {OUT} ({OUT.stat().st_size / 1e3:.0f} KB); missing: {sorted(set(want) - set(out))}")


if __name__ == "__main__":
    main()
