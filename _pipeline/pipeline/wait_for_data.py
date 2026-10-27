"""Wait until the day's market data has landed, for the Claude writer.

    python -I -X utf8 _pipeline/pipeline/wait_for_data.py

GitHub often starts its scheduled update late (sometimes hours), so the writer can't rely on the clock. This
works out the latest US trading day that has closed (a day's close counts from 4:10 pm New York time;
weekends and NYSE holidays are skipped), then pulls the repository every minute until market_moves.js
covers that day, for up to 9 minutes per call (a tool call's limit).

Prints one line and exits with:
  0  "ready: …"    the data covers the latest close: write the explanations
  3  "waiting: …"  not yet: run this again (the writer gives up after about 4 hours)
"""
import datetime as dt
import json
import subprocess
import sys
import time
from pathlib import Path
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import SITE_DIR

# NYSE full-day closures (half days still have a close)
HOLIDAYS = {
    "2026-01-01", "2026-01-19", "2026-02-16", "2026-04-03", "2026-05-25", "2026-06-19", "2026-07-03", "2026-09-07", "2026-11-26", "2026-12-25",
    "2027-01-01", "2027-01-18", "2027-02-15", "2027-03-26", "2027-05-31", "2027-06-18", "2027-07-05", "2027-09-06", "2027-11-25", "2027-12-24",
}


def trading(d):
    return d.weekday() < 5 and d.isoformat() not in HOLIDAYS


def latest_close():
    now = dt.datetime.now(ZoneInfo("America/New_York"))
    d = now.date() if now.time() >= dt.time(16, 10) else now.date() - dt.timedelta(days=1)
    while not trading(d):
        d -= dt.timedelta(days=1)
    return d.isoformat()


def site_day():
    p = SITE_DIR / "market_moves.js"
    t = p.read_text(encoding="utf-8")
    m = json.loads(t[t.index("{"):t.rindex("}") + 1])
    return ((m.get("market") or {}).get("today") or {}).get("end", "")


def main(minutes=9):
    want = latest_close()
    end = time.time() + minutes * 60
    while True:
        subprocess.run(["git", "pull", "-q", "origin", "main"], cwd=SITE_DIR, capture_output=True)
        have = site_day()
        if have >= want:
            print(f"ready: the site's data covers {have} (latest close {want})")
            return 0
        if time.time() > end:
            print(f"waiting: the site's data is for {have}; the latest close is {want}. Run this again.")
            return 3
        time.sleep(60)


if __name__ == "__main__":
    sys.exit(main())
