"""The weekday market update GitHub Actions runs after the US close (see .github/workflows/daily.yml).

    python -I -X utf8 _pipeline/pipeline/daily.py

Steps, in the order the full refresh runs them: prices (required), market drops and industry moves with
their headlines, extra prices (Nasdaq-100, Dow, AI names), Aftermath, then the to-do report. A step other
than prices may fail (a site down) without stopping the rest; the page then keeps that step's last data.
Writes _pipeline/logs/daily_last.json; exits 1 only if the prices step failed.
"""
import datetime as dt
import json
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from config import LOGS, SITE_DIR

STEPS = [
    ("refresh_prices.py", True),
    ("fetch_market_moves.py", False),
    ("fetch_extra_prices.py", False),
    ("fetch_aftermath.py", False),
    ("check_freshness.py", False),
]


def main():
    result = {"date": dt.date.today().isoformat(), "steps": [], "ok": True}
    for script, required in STEPS:
        t0 = time.time()
        print(f"== {script}", flush=True)
        p = subprocess.run([sys.executable, "-I", "-X", "utf8", str(HERE / script)], cwd=SITE_DIR,
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        out = (p.stdout + p.stderr).strip()
        print("\n".join("   " + line for line in out.splitlines()[-15:]), flush=True)
        ok = p.returncode == 0
        result["steps"].append({"step": script, "ok": ok, "seconds": round(time.time() - t0)})
        print(f"   {'ok' if ok else 'FAILED'} in {time.time() - t0:.0f}s", flush=True)
        if not ok and required:
            result["ok"] = False
            break
    (LOGS / "daily_last.json").write_text(json.dumps(result, indent=1), encoding="utf-8")
    failed = [s["step"] for s in result["steps"] if not s["ok"]]
    print("=== " + ("ok" if result["ok"] else "PRICES FAILED: nothing published") + (f" · failed: {', '.join(failed)}" if failed else ""))
    sys.exit(0 if result["ok"] else 1)


if __name__ == "__main__":
    main()
