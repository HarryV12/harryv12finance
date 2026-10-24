# The weekly research (for a scheduled Claude run every Friday at 9:15 pm UK)

The daily data and the daily "why" texts update themselves (see `_pipeline/UPDATE_SCHEDULE.md`). This job
keeps the hand-kept facts current: the AI bubble page, the Investments page and the Production page.
Work in this repository only, and change only `ai_bubble.js`, `investments.js` and `production.js`.

Start with `git pull`, then run `python -I -X utf8 _pipeline/pipeline/check_freshness.py` and read its
HAND-KEPT FACTS and TO DO sections.

## 1. AI bubble page (`ai_bubble.js`)

Search the past week's news (since the newest date in `updates`) for:
- Anthropic's IPO (filed, priced, listed, delayed) and OpenAI's fundraise or IPO plans, and their reported values;
- CoreWeave's debt, bond yields and credit default swaps;
- AI price cuts and cost trends; Nvidia's forward P/E; big AI spending announcements;
- telling remarks from well-known investors or executives about an AI bubble.

For each real new event, add one line at the top of `updates` (newest first, `date` = the day it happened,
`src` = a key you add to `sources` as `key: { name, url }`). Change `labs`, `coreweave`, `voices`, `squeeze`,
`pe` and `next` only where a new fact replaces an old one. Then set `updated:` to today's date.
If nothing new happened, change nothing.

## 2. Investments page (`investments.js`)

**Holdings behind the headline (`stories`).** Look for 0–2 news stories from the past week that could move
listed stocks which Trump or members of Congress hold or trade (policy decisions, government deals, contracts,
sanctions, regulation). For each candidate, run
`python -I -X utf8 _pipeline/pipeline/story_holders.py TICKER1 TICKER2 …` and keep the story only if the
stocks are on the site and Trump or members trade them. Add it at the top of `stories` in the same shape as
the existing ones: `id`, `date` (the news day), `title`, `news` (2–3 neutral sentences), `angle`, `tickers`,
`sources` (original reporting), and `committees` notes only for members the helper lists as trading the stock
**and** whose committee clearly touches the story (`tk`, `m` = their id from the helper, `role`, `why`, and a
2–3 word `short`). Never claim a holding the helper doesn't show.

**Deals (`deals`).** Check each deal whose status is a letter of intent, pending or unconfirmed: if it changed,
update its status with a dated source. Add a new deal only for a major government stake or AI deal with listed
companies involved, in the same shape as the others. Then set `updated:` to today's date.

## 3. Production page (`production.js`)

Check whether any source named on an item has published newer figures than the year shown (USGS Mineral
Commodity Summaries, Energy Institute Statistical Review, worldsteel, World Nuclear Association, TrendForce HBM
shares, IEA data-centre electricity, ASML annual report). Only if a newer release is out: update that item's
figures, `year` and `source`, keeping the same shape. Most weeks nothing changes.

## Finish

1. Check each changed file still loads: `python -I -X utf8 -c "import json,re,sys"` is not enough for JS, so
   run `node --check <file>` if node is available; otherwise re-read the edited parts carefully for missing
   commas and quotes.
2. Run `check_freshness.py` again.
3. Commit only the changed files as HarryV12 (`304028176+HarryV12@users.noreply.github.com`) with the message
   "Weekly research <date>: <one-line summary>" ending in
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`, and push to main.
4. End with a short list of what you changed and why, or "nothing new this week".

## Rules

- Only facts with a source you actually read; prefer original reporting (Reuters, Bloomberg, CNBC, FT, AP,
  company filings, official press releases). Aggregators and social posts only as leads, never as the source.
- Dates come from the source. Never guess a date, a value or a holding.
- Neutral wording, no advice, no predictions of your own. Quote people only word for word from the source.
- Don't touch any other file (no code, no data files, no explanations).
