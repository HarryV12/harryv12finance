# Writing the explanations (for a scheduled Claude run)

GitHub Actions updates the numbers and headlines every weekday (`.github/workflows/daily.yml`).
This file is the job for the Claude run that follows it: write the short "why" texts the pages
show, then publish. Work in this repository only; change nothing outside the files named here.

## Each weekday (after the market update has run)

1. `git pull` so you have today's data.
2. Run `python -I -X utf8 _pipeline/pipeline/check_freshness.py`. It lists every explanation still
   to write. If it says nothing is missing, stop: there is nothing to do (a market holiday, say).
3. For each missing item, read the numbers and headlines in `market_moves.js` (and `aftermath.js`
   for Aftermath stocks) and write:
   - `_pipeline/config/move_summaries.json`: one sentence, keyed exactly as the report names it
     (`today|<all|ai|defense|banks|oil|health>|<date>`, `now|…|<date>` on Fridays,
     `drop|<start date>`, `<industry>|<date>`).
   - `_pipeline/config/move_details.json`: the same key, 1–3 short steps ("event (date) → effect,
     with the biggest movers and their moves").
   - `_pipeline/config/aftermath_notes.json` for a new Aftermath stock (see its `_about` entry).
   Match the style of the entries already there.
4. Run `check_freshness.py` again: the items you wrote should be gone. Don't run the market scripts
   yourself (the price files aren't in this copy): pushing starts GitHub's workflow, which re-runs them,
   attaches your text and publishes the site within a few minutes.
5. Commit as HarryV12 (`304028176+HarryV12@users.noreply.github.com`) with the message
   "Explanations for <date>" ending in `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`,
   then push.

## Rules (learned the hard way)

- State only causes the news actually gives. If there isn't one, say "no single cause".
- Dates must come from a source; never guess one.
- Numbers come from the site's own data (`market_moves.js`, `prices.js`), for the exact days.
- Neutral wording; no advice. Keep each summary to one sentence.
- Don't edit `app.js`, `index.html`, the data files or anything else; only the three JSON files above.
