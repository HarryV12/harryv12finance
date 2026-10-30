# HarryV12 Finance: what gets updated, when, and by what

Last checked against GitHub: 24 October 2026.
Full background is in `UPDATING.md` (on the PC, next to the `site` folder); this file is the schedule.

**Key**
- 🤖 **GitHub**: runs by itself in GitHub Actions (`.github/workflows/daily.yml`). No PC needed. Free.
- ✍️ **Claude writer**: runs by itself as a Claude cloud routine (Sonnet 5.5). No PC needed. Uses your Pro plan.
- 💻 **Your PC, weekly**: you run `publish_site.ps1` (Congress filings and the full rebuild).
- 🔎 **Claude weekly research**: runs by itself every Friday at 9:15 pm UK as a Claude cloud routine (Sonnet 5.5, high
  effort), following `_pipeline/WEEKLY.md`. No PC needed. Uses your Pro plan.
- 🗓️ **By hand / ask Claude**: dated jobs on a calendar (yearly releases, index changes, a new Congress).

---

## How the site is published (since 25 Oct 2026)

GitHub Pages is published by the workflow (`.github/workflows/daily.yml`), not straight from the branch.
It runs every weekday at 9:15 pm UK **and after every push** (the writer's explanations, the weekly
research, the PC's weekly Congress build, code changes). Each run downloads fresh closes, rebuilds the price
files, re-prices open trades, and publishes the whole site in a few minutes.

To keep the repository small, the big generated price files (`prices.js` 16 MB, `series.js` 3 MB) are **not
kept in git** (see `.gitignore`): every run rebuilds them. Only the small files that change daily are
committed (`market_moves.js`, `aftermath.js`, `extra_prices.js`, new news searches). `data.js` is committed only
by the PC's weekly build; the daily re-pricing of it is published but not committed. `_pipeline/` and `versions/`
are never published.

## 1. Every US trading day

### 🤖 On GitHub: weekdays at 9:15 pm UK time (15 minutes after the US close)

The US market closes at 4 pm New York time, which is 9 pm UK time (8 pm for a few weeks in March and
October/November, when the US and UK change their clocks on different dates; 9:15 pm is after the close either way).
GitHub schedules only in UTC, so `daily.yml` has two start times (20:15 and 21:15 UTC) and a check that lets
through only the one at 9 pm or later in London. The price step accepts a day's close from 4:10 pm New York time.
Since 30 Oct 2026 a Cloudflare timer (the Worker `harryv12finance-timer`) starts the job at exactly 9:15 pm UK,
because GitHub's own schedule was starting it 2½–3½ hours late. GitHub's schedule stays as a backup, and a
second run that day just finds nothing new. The site is published to https://harryv12finance.pages.dev.

### 🖼️ Images on X (@RealFinancev12)

`.github/workflows/x_posts.yml` (`_pipeline/x_posts/x_posts.py`) makes images from the live Data Visualization page and
posts them with a fixed caption and no link:

- **Today's market movers, every weekday with a new close:** the job runs each time the daily update finishes, so this
  goes out as soon as the site has the close, normally about 9:25 pm UK.
- **This week's market movers, Fridays at 11 pm UK:** the Cloudflare timer starts the job.

What Congress just bought and the Copy-trading leaderboard aren't automatic: run the workflow by hand and pick one under
"post_now". The repository variable `X_POST_MODE` is `live`, or `test` to stop the daily posts at once (nothing posted;
see https://x-preview.harryv12finance.pages.dev). `_pipeline/x_posts/state.json` remembers what went out, so nothing
goes out twice.

| Data | File | What it feeds | Script |
|---|---|---|---|
| Daily closes for every stock on the site, and SPY | `prices.js` | Every chart and % | `refresh_prices.py` |
| Weekly closes for every stock | `series.js` | Stock pages, charts | `refresh_prices.py` |
| Latest close date, SPY's line, returns of trades still open (to-date and "copied on disclosure") | `data.js` (price fields only) | Congress pages, member pages, scorecards | `refresh_prices.py` |
| Nasdaq-100, Dow and AI names members haven't traded (plus GFS, LAC, TMQ, IREN, CIFR, SNAP) | `extra_prices.js` | Home, Market movers, AI stocks, Investments, AI bubble | `fetch_extra_prices.py` |
| Market drops, the 5 industry baskets (AI and chips, defense, banks, oil, healthcare), "Today" and "This week" numbers, the day's headlines (Google News) | `market_moves.js` | Market drops, Home "Why markets moved", Industries, Data Viz | `fetch_market_moves.py` |
| Steady stocks that kept falling, their prices and headlines | `aftermath.js` | Aftermath page, Home teaser | `fetch_aftermath.py` |
| Company figures: latest quarter's EPS, revenue and net profit (vs the same quarter last year), debt-to-equity; re-fetched every **Friday at 9:15 pm UK** (or any time with the workflow's "refresh figures" switch); P/E worked out daily from the price | `fundamentals.js` | Data Viz "Stock breakdown" | `fetch_fundamentals.py` |
| To-do report (what's out of date, what still needs writing) | Actions run log | You and the Claude writer | `check_freshness.py` |

These pages then update by themselves, because they read those files: Home, Market movers, Market drops,
Aftermath, AI stocks, the AI bubble page's share moves and company values, the Investments page's price
moves and "since the news" figures, the Congress pages' returns, and every Data Visualization image.

### ✍️ Claude writer: Monday–Friday at 10 pm UK time (45 minutes after the data update)

Routine "HarryV12 Finance daily explanations" (Sonnet 5.5), following `_pipeline/WRITING.md`:

| Writing | File | When it's needed |
|---|---|---|
| "Today" for the market and each of the 5 industries | `_pipeline/config/move_summaries.json` + `move_details.json` | Every trading day (6 explanations) |
| "Why" + steps for a new market drop or a sharp industry move | same files | When one appears (a few a month) |
| "What led to the fall" + "why" for a new Aftermath stock | `_pipeline/config/aftermath_notes.json` | When a new stock joins the list |

It then re-runs the market and Aftermath steps so the text appears, and commits.

## 2. Every week

| What | How | When |
|---|---|---|
| "This week" explanations (market + 5 industries) | ✍️ Claude writer, automatically (Friday 10 pm run, from Friday's close) | Weekly |
| House trades: new filings, e-filed and scanned (OCR) | 💻 PC: `publish_site.ps1` | Weekly (filings arrive within 45 days of a trade) |
| Senate trades (via Quiver's copies; the Senate's own site blocks UK connections) | 💻 PC | Weekly |
| President's and officials' trades (OGE 278-T), scanned reports (OCR) | 💻 PC | Weekly |
| Business leaders' trades (SEC Form 4) | 💻 PC | Weekly |
| Amounts unreadable on scanned House forms (Quiver's copy) | 💻 PC | Weekly |
| Stock list, S&P 500 members, members and committees | 💻 PC | Weekly |
| Full rebuild of `data.js` (all trades, exact returns, holdings, photos for new members) | 💻 PC | Weekly |
| Public signals (contracts, lobbying, hearings, insiders, leaders' posts): `signals.js` | 💻 PC | Weekly (the to-do report flags it after 7 days) |
| Bond maturity dates: `bond_maturity.js` | 💻 PC | Weekly (only new bonds are looked up) |
| Accuracy figures: `estimate_test.js` | 💻 PC | Weekly |
| Company descriptions for stocks new to the site: `descriptions.js` | 💻 PC | Weekly (added 24 Oct 2026; cached per ticker) |
| AI bubble facts: Anthropic/OpenAI IPO news, CoreWeave debt, voices, updates (`ai_bubble.js`) | 🔎 Claude weekly research | Fridays 9:15 pm UK (the to-do report also flags it at 14 days) |
| Investments: new "Holdings behind the headline" stories (0–2 a week), new deals, open deal statuses (`investments.js`) | 🔎 Claude weekly research | Fridays 9:15 pm UK |
| Production: check whether any source has published newer figures (`production.js`) | 🔎 Claude weekly research | Fridays 9:15 pm UK (most weeks nothing changes) |

## 3. Every month

| What | How |
|---|---|
| Re-check each Investments deal's status (letters of intent, pending stakes); set `updated:` | 🔎 Covered weekly by the Friday research (the to-do report flags it after 30 days) |

## 4. Yearly, or on a date

| When | What | File |
|---|---|---|
| 24 Nov 2026 | Anthropic's IPO (files, prices, lists or is delayed); OpenAI's fundraise | `ai_bubble.js` |
| 21 Dec 2026 | Nasdaq-100 reshuffle: update `NDX100` in `app.js` and `NASDAQ100` in **both** copies of `fetch_extra_prices.py` (`pipeline/` on the PC and `_pipeline/pipeline/` in the repo) | code |
| 31 Dec 2026 | Helion's $175M letter of intent: final agreement signed? | `investments.js` |
| 3 Jan 2027 | New Congress: new members, committee seats, departing members marked former. Run the PC refresh; check committees | PC + `committee_industries.json` |
| late Jan 2027 | worldsteel: 2026 steel output | `production.js` |
| Feb 2027 | USGS Mineral Commodity Summaries 2027 (rare earths, lithium, cobalt, nickel, copper, gold, gallium); ASML annual report (EUV) | `production.js` |
| 31 Mar 2027 | Commerce may start selling its GlobalFoundries shares | `investments.js` |
| June 2027 | Energy Institute Statistical Review (oil, refining, gas, LNG) | `production.js` |
| mid-2027 | OGE annual reports (278e) for 2026: run `fetch_oge_annual.py` and `oge_annual_holdings.py` on the PC | `holdings_start.js` |
| Quarterly | TrendForce HBM shares; IEA data-centre electricity; uranium (World Nuclear Association) when published | `production.js` |
| Any time | Dow 30 changes: update `DOW30` / `DOW` | `app.js` |
| Any time | GlobalFoundries–Helion chip work marked "unconfirmed": confirm or remove | `investments.js` |

The to-do report lists each dated item 30 days before it's due.

## 5. Doesn't need updating

| What | Why |
|---|---|
| `app.js`, `style.css`, `index.html`, `markets_viz.js`, `dataviz.js`, `dataviz.css` | The site's code; only changes when the site changes |
| `classic.html` and its claude.ai copy | Legacy since 24 Oct 2026; never updated |
| `v2/` | Only redirects old links |
| Past explanations (earlier days, drops, industry moves) | Written once; stay as they are |
| `production.js` between the releases above | Figures only change once a year (or quarter) |
| `holdings_start.js` | Changes only with the yearly OGE reports |
| `photos.js`, `portraits/`, `photo_credits.js` | Change only when new members or officials appear (the weekly PC build handles it) |
| `committee_industries.json`, `executive_*.json`, `famous_insiders.json` | Change with a new Congress or administration |
| The list of AI stocks and brand logos in `app.js` | Only when you want to add names |

## 6. What was missing, and what was done about it (24 Oct 2026)

| Gap | Status |
|---|---|
| In UK summer time the writer (23:30) ran only 15 minutes after GitHub's 22:15 UTC data job, which GitHub can start late | **Fixed** (then changed on 24 Oct at your request): data at 9:15 pm UK, writer at 10 pm UK, both Monday–Friday |
| The weekly PC push could clash with GitHub's daily commit | **Fixed:** `publish_site.ps1` now pulls GitHub's commits before building and again before pushing |
| Stocks new to the site never got a company description | **Fixed:** `fetch_descriptions.py` now runs in the weekly PC refresh |
| Nothing flagged an Investments page left unchecked | **Fixed:** the to-do report flags it after 30 days |
| A copy of the writing is kept in two places | **Fixed:** the PC pipeline now reads the explanations from `site/_pipeline/config`, the same files GitHub and the writer use |
| No scheduled job for the weekly research (AI bubble facts, Investments stories and deals, Production releases) | **Fixed:** routine "HarryV12 Finance weekly research", Fridays 9:15 pm UK; its cloud environment now allows the main news, data and official sites (41 domains). Test run 24 Oct: worked, found nothing newer than that day's updates |
| The writer's push to `main` hasn't happened yet (its test run had nothing to write) | **Open:** first real run Mon 26 Oct 10 pm UK; check that the explanations reach the site |

## 7. Known limits

- **Daily re-pricing is close, not exact.** It re-prices open trades from their stored entry prices. Yahoo adjusts
  past prices for dividends, so a stock that pays one can be a fraction of a percent off until the weekly PC rebuild.
- **New filings** appear only after the weekly PC run; trades disclosed since then get their "copied on disclosure"
  return at that run.
- **If the PC run is skipped**, Congress data stops moving forward (the to-do report shows the newest filing date),
  while prices and markets carry on updating daily.
- **US market holidays**: the GitHub job still runs, finds no new close and changes nothing; the writer then finds
  nothing to write.
- **GitHub can start scheduled jobs late** at busy times (in late Oct 2026, 2½–3½ hours every day), which is why the
  Cloudflare timer now starts the 9:15 pm run. If the timer's GitHub token expires, the backup schedule still runs, late.
- **Sources GitHub uses**: Yahoo Finance and Google News. Both were checked from GitHub's servers on 24 Oct 2026
  (`.github/workflows/source_check.yml`; run it by hand any time).
