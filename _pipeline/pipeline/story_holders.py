"""Who in government trades the stocks a news story could move: a helper for "Holdings behind the headline".

    python -I -X utf8 _pipeline/pipeline/story_holders.py GEV CEG VST

For each ticker: whether the stock is on the site, Trump's trades in it, and every member of Congress who has
traded it (party, chamber, Bioguide id, trade count, latest trade, committees). The page works out the
holdings itself; this only shows who to consider for a story's committee notes.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))  # scripts run with python -I
from config import SITE_DIR


def main():
    text = (SITE_DIR / "data.js").read_text(encoding="utf-8")
    D = json.loads(text[text.index("{"):text.rindex(";")])
    f = {k: i for i, k in enumerate(D["fields"])}
    members, committees = D["members"], D["committees"]
    for tk in [a.upper() for a in sys.argv[1:]]:
        print(f"== {tk}: " + ("on the site" if tk in D["stocks"] else "NOT on the site (no member or official has traded it)"))
        rows = [t for t in D["trades"] if t[f["t"]] == tk]
        by = {}
        for t in rows:
            by.setdefault(t[f["m"]], []).append(t)
        for mi, ts in sorted(by.items(), key=lambda kv: -len(kv[1])):
            m = members[mi]
            if m["id"] != "EX_TRUMP_DONALD_J" and m.get("chamber") not in ("H", "S"):
                continue
            last = max(t[f["d"]] for t in ts)
            buys = sum(1 for t in ts if t[f["k"]] == "B")
            com = ", ".join(f"{c} {committees.get(c, {}).get('name', '')}" for c in m.get("committees", [])) or "none"
            print(f"  {m['name']} ({m.get('party', '?')}, {m.get('chamber', '?')}, id {m['id']}): {len(ts)} trade{'s' if len(ts) != 1 else ''} ({buys} buy{'s' if buys != 1 else ''}), latest {last}"
                  + ("" if m["id"] == "EX_TRUMP_DONALD_J" else f"; committees: {com}"))


if __name__ == "__main__":
    main()
