"""Paths for the market-data part of the pipeline that GitHub Actions runs every weekday.

This folder (site/_pipeline) lives inside the website's repository: the site's files are one level up,
the writing (move summaries, Aftermath notes) is in _pipeline/config, and the news searches already
made are kept in _pipeline/cache/news so old episodes are never searched again. The folder starts with
an underscore, so GitHub Pages doesn't publish it.

Congress, Senate, officials' and insiders' filings are not refreshed here: the full pipeline on the PC
(congress_trades/pipeline/refresh_all.py) does that, weekly.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent      # site/_pipeline
SITE_DIR = ROOT.parent                              # the website (repository root)
CACHE = ROOT / "cache"
PRICE_DIR = CACHE / "prices"
CONFIG_DIR = ROOT / "config"
LOGS = ROOT / "logs"
START_DATE = "2023-01-01"

for d in (CACHE, PRICE_DIR, LOGS):
    d.mkdir(parents=True, exist_ok=True)
