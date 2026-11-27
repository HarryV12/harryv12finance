/* AI bubble watch: the hand-kept facts behind the AI bubble page. The page adds live figures from the site's
   prices (one-year share moves, company values). To update: add a dated line to the top of `updates`, change the
   facts below (each has its own date and source), and set `updated`. See UPDATING.md. */
window.CTC_AIB = {
  updated: "2026-11-27",
  // newest first; shown as "What's new"
  updates: [
    { date: "2026-11-25", text: "Nvidia fell 4% and Oracle more than 5% on a day when investors weighed AI spending, a hot inflation reading and rate risk, CNBC reports. Anthropic rose more than 4% after its shares had dropped below the IPO price. Barclays' Venu Krishna said: \"We just feel that this is panic right now.\"", src: "cnbc_selloff1125" },
    { date: "2026-11-24", text: "Anthropic's shares closed down 6.5% on Tuesday, below the $83 IPO price, five days after the debut, CNBC reports. Canaccord Genuity (buy, $135 target), Wedbush (outperform, $120) and Oppenheimer (outperform, $150) began coverage; roughly half of the institutions that placed IPO orders were left without shares.", src: "cnbc_ant_below" },
    { date: "2026-11-20", text: "Anthropic announced the closing of its IPO, \"including full exercise of underwriters' option\" (headline of its announcement; the closing terms were not in the text read).", src: "anthropic_close" },
    { date: "2026-11-19", text: "Anthropic began trading on Nasdaq as \"ANT\", opening at $111.50 (about 34% above its $83 IPO price) and closing at $97.17, up about 17%. CNBC put its fully diluted value at about $1.8T at the close. Nvidia, Google, Microsoft and AMD bought about $26B of stock at the IPO price in private placements.", src: "cnbc_ant_live" },
    { date: "2026-11-18", text: "Anthropic priced its IPO at $83 a share, above the $70–$78 range set on 10 Nov, selling 980M Class A shares to raise $81.3B (up to $93.5B if underwriters buy the extra 147M shares they have until 20 Nov to take), the largest IPO on record, CNBC reports.", src: "cnbc_ant_live" },
    { date: "2026-11-12", text: "OpenAI has raised $15B at a $1.25T valuation, sources told CNBC. That is below the up to $30B it first sought; the Financial Times had reported a cut to $20B. The report does not say who led the round.", src: "cnbc_openai15", src2: "cnbc_openai20" },
    { date: "2026-11-11", text: "CoreWeave's shares rose 24.71%, their best day since April 2025, after it raised its 2026 revenue forecast. CEO Michael Intrator said it plans another asset-level debt offering within one to two weeks, which he expects to price at 7% to 7.5%.", src: "cnbc_cw1111" },
    { date: "2026-11-10", text: "CoreWeave reported third-quarter revenue of $3,661M (up 168%), a net loss of $709M, a revenue backlog of about $132.5B and total debt of $46,873M at 30 September, excluding leases. It raised 2026 revenue guidance to $13.0–13.3B.", src: "cw_q3", src2: "cnbc_cw1111" },
    { date: "2026-11-10", text: "Anthropic launched its IPO roadshow: 825M Class A shares at an expected $70–$78 each, raising up to $64.4B and valuing it at up to $1.4T fully diluted at the top, below the $2T once discussed. Trading could start as early as 18–19 Nov.", src: "fortune_range" },
    { date: "2026-11-06", text: "CoreWeave's 9.625% bond due 2032 now yields above 16%, and its five-year credit default swaps spiked above 1,289 basis points on 5 Nov, wider than the October peak (Deutsche Bank data). Goldman Sachs counts five AI bond deals worth $67B since 29 Oct.", src: "cnbc_cw1106" },
    { date: "2026-11-02", text: "Anthropic's amended IPO filing shows third-quarter revenue of about $17B, a net loss of $23.29B and about $895.4B of purchase and lease commitments, almost all for computing. It gives no price range yet; CNBC says the roadshow is about to start.", src: "cnbc_s1_q3" },
    { date: "2026-10-31", text: "OpenAI is now seeking up to $20B, down from a target of up to $30B, at a $1.25T post-money value, the Financial Times reported. Investors from the UAE are leading the round with Coatue, and it has not closed.", src: "cnbc_openai20" },
    { date: "2026-10-26", text: "Anthropic filed its IPO prospectus (Form S-1) publicly, for a Nasdaq listing under the ticker \"ANT\". It shows first-half 2026 revenue of $16.29B, a net loss of $80.7B (about $72B of it from convertible-note accounting) and about $417B of obligations to computing providers.", src: "cnbc_s1_live" },
    { date: "2026-10-23", text: "Anthropic's IPO is expected on Nasdaq as soon as November; talk of its value has slipped to about $1.5T after third-quarter results, below the $2T it had sought. OpenAI is raising money at a reported $1.25T, down from $1.4T, and has ruled out listing in 2026.", src: "beincrypto", src2: "futuresearch" },
    { date: "2026-10-19", text: "CoreWeave's bonds still yield about 14.9% even as AI shares bounced; its credit default swaps sit near 1,082 basis points, a level treated as distress.", src: "cnbc_cw19" },
    { date: "2026-10-15", text: "CoreWeave's five-year credit default swaps hit a record of about 1,194 basis points, which markets read as a more than 60% chance of default within five years.", src: "benzinga_cds" },
    { date: "2026-10-12", text: "Broadcom's CEO Hock Tan said many AI investors \"have no clue what they are investing in\" and that capital, not chips or power, may become AI's biggest constraint.", src: "fortune_tan", src2: "cnbc_tan" },
    { date: "2026-10-09", text: "Jefferies' Chris Wood repeated his warning that debt-funded AI spending is likely to end in \"massive capital destruction\" in the US.", src: "cryptobriefing_wood" }
  ],
  // what people who matter are saying; keep 3, newest first
  voices: [
    { who: "Venu Krishna, Barclays head of US equity strategy", date: "2026-11-25", said: "We just feel that this is panic right now.", src: "cnbc_selloff1125" },
    { who: "Hock Tan, Broadcom CEO", date: "2026-10-12", said: "A lot of investors have no clue what they are investing in.", src: "fortune_tan" },
    { who: "Bond markets, on CoreWeave", date: "2026-10-15", said: "Its default swaps priced a better-than-even chance of default within five years.", paraphrase: true, src: "benzinga_cds" }
  ],
  // CoreWeave: the AI company whose debt markets are most worried about
  coreweave: {
    asOf: "2026-11-11",
    stats: [
      { label: "Debt", value: "$46.9B", note: "total debt, 30 Sep 2026, excluding leases ($35.6B on 30 Jun)", src: "cw_q3" },
      { label: "2026 revenue (company forecast)", value: "$13.0–13.3B", note: "raised on 10 Nov; third-quarter revenue up 168%", src: "cw_q3" },
      { label: "Bond yield", value: "16%+", note: "9.625% bond due 2032, above 16% on 6 Nov (14.9% on 19 Oct)", src: "cnbc_cw1106" }
    ],
    // implied five-year default probability from credit default swaps
    defaultOdds: { value: 0.6, label: "more than 60%", note: "chance of default within 5 years implied by its credit default swaps at the 15 Oct record", src: "benzinga_cds" }
  },
  // costs going up, prices going down
  squeeze: {
    up: [
      { text: "Big Tech's AI building budgets: about <b>$695B</b> in 2026, heading for <b>$870B</b> in 2027, more of it borrowed", src: "business_standard_wood" },
      { text: "Broadcom's CEO: <b>capital</b> may become AI's biggest constraint, more than chips or power", src: "cnbc_tan" },
      { text: "Five AI bond deals worth <b>$67B</b> since 29 Oct; Goldman Sachs expects about <b>$440B</b> of hyperscaler debt next year", src: "cnbc_cw1106" }
    ],
    down: [
      { text: "OpenAI cut its cheapest model's price by <b>80%</b> (30 Jul 2026) as Chinese open-weight models undercut it", src: "forbes_cut" },
      { text: "It cut its top model by <b>20–33%</b> in August, on a promotional price", src: "technology_org_cut" }
    ]
  },
  // share price up, price-to-earnings down: investors already discount the risk
  pe: [
    { name: "Nvidia", tk: "NVDA", then: 40, thenLabel: "Jul 2025", now: 23.2, nowLabel: "Jul 2026", note: "forward price-to-earnings", src: "fool_nvda" }
  ],
  peNote: "By late October some data providers put Nvidia's forward multiple as low as 16–18, about half of Apple's.",
  peSrc: "wallst_apple",
  // AI data-centre renters ("neoclouds"): one-year moves come from the site's prices
  neoclouds: [["CoreWeave", "CRWV"], ["IREN", "IREN"], ["Cipher Mining", "CIFR"], ["Nebius", "NBIS"]],
  chipmakers: [["Nvidia", "NVDA"], ["Broadcom", "AVGO"], ["Micron", "MU"], ["AMD", "AMD"]],
  // the private AI labs, placed among the biggest US-listed companies (whose values are live)
  labs: [
    { name: "Anthropic", value: 1.8e12, label: "~$1.8T", status: "Listed on Nasdaq as \"ANT\" on 19 Nov: priced at $83 (above the $70–$78 range), closed day one at $97.17 (about $1.8T fully diluted, last private round $965B); closed below $83 on 24 Nov, down 6.5% that day (CNBC)", asOf: "2026-11-24", src: "cnbc_ant_below", src2: "cnbc_ant_live" },
    { name: "OpenAI", value: 1.25e12, label: "~$1.25T", status: "raised $15B at $1.25T, sources told CNBC (12 Nov); earlier target up to $30B; no IPO in 2026", asOf: "2026-11-12", src: "cnbc_openai15", src2: "cnbc_openai20" }
  ],
  // what decides it next; edit as events happen
  next: [
    { kind: "", title: "Price range set (10 Nov)", text: "$70–$78 a share for 825M shares: up to $64.4B raised and up to $1.4T fully diluted at the top." },
    { kind: "", title: "IPO priced (18 Nov)", text: "$83 a share, above the range, for 980M shares: $81.3B raised. It opened at $111.50 on 19 Nov and closed at $97.17." },
    { kind: "bad", title: "Below $83 (24 Nov)", text: "ANT closed down 6.5% on 24 Nov, under its IPO price five days after the debut; it rose more than 4% on 25 Nov, CNBC reports." },
    { kind: "", title: "Recovers above $83", text: "A close back above the IPO price would restore the first-day gain.", fork: true },
    { kind: "bad", title: "Stays below $83", text: "Shares that stay under the IPO price mean new buyers are paying less than the pricing round did.", fork: true }
  ],
  watch: ["Anthropic's share price against its $83 IPO price", "CoreWeave's bond yields and default swaps", "OpenAI's fundraise value", "AI model price cuts", "Big Tech's 2027 spending plans at January results"],
  sources: {
    cnbc_selloff1125: { name: "CNBC, 25 Nov 2026: Nvidia leads tech sell-off as Huang comeback rally fizzles", url: "https://www.cnbc.com/2026/11/25/nvidia-ai-stock-tech-selloff.html" },
    cnbc_ant_below: { name: "CNBC, 24 Nov 2026: Anthropic closes below $83 IPO price, but analysts are still largely positive", url: "https://www.cnbc.com/2026/11/24/anthropic-stock-ipo-price.html" },
    anthropic_close: { name: "Anthropic, 20 Nov 2026: Anthropic announces closing of initial public offering, including full exercise of underwriters' option (headline listed on anthropic.com/news/s1-sec)", url: "https://www.anthropic.com/news/s1-sec" },
    cnbc_ant_live: { name: "CNBC, 19 Nov 2026: Anthropic IPO live updates: ANT stock price and Nasdaq debut", url: "https://www.cnbc.com/2026/11/19/anthropic-ipo-ant-live-updates.html" },
    cnbc_openai15: { name: "CNBC, 12 Nov 2026: OpenAI raises $15B at a $1.25T valuation, sources say", url: "https://www.cnbc.com/video/2026/11/12/openai-raises-15b-at-a-1-point-25t-valuation-what-it-means-for-the-ipo.html" },
    cnbc_cw1111: { name: "CNBC, 11 Nov 2026: CoreWeave soars more than 24% for best day since April 2025 after strong Q3 report", url: "https://www.cnbc.com/2026/11/11/coreweave-crwv-outlook-earnings-ai.html" },
    cw_q3: { name: "CoreWeave, 10 Nov 2026: CoreWeave Reports Strong Third Quarter 2026 Results", url: "https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Third-Quarter-2026-Results/default.aspx" },
    fortune_range: { name: "Fortune, 10 Nov 2026: Anthropic sets IPO range valuing it at up to $1.4 trillion amid AI stock sell-off", url: "https://fortune.com/2026/11/10/anthropic-ipo-price-range-ai-stock-sell-off/" },
    cnbc_cw1106: { name: "CNBC, 6 Nov 2026: The AI \"credit card\" is getting costlier as CoreWeave bond yield tops 16%", url: "https://www.cnbc.com/2026/11/06/coreweave-bond-yield-tops-16percent-as-ai-credit-stress-rises.html" },
    cnbc_s1_q3: { name: "CNBC, 2 Nov 2026: Anthropic reports $17 billion in Q3 revenue, purchase commitments of $895.4 billion in revised S-1", url: "https://www.cnbc.com/2026/11/02/anthropic-ant-s-1-quarter-financials.html" },
    cnbc_openai20: { name: "CNBC, 31 Oct 2026: OpenAI pares fundraising goal, now seeking up to $20 billion", url: "https://www.cnbc.com/2026/10/31/openai-fundraising-20-billion-valuation.html" },
    cnbc_s1_live: { name: "CNBC, 26 Oct 2026: Anthropic IPO live updates, AI lab's S-1 filing", url: "https://www.cnbc.com/2026/10/26/anthropic-ipo-live-updates-ai-s-1-filing.html" },
    beincrypto: { name: "BeInCrypto: Anthropic IPO filing and OpenAI's fundraise", url: "https://beincrypto.com/openai-fundraise-anthropic-ipo-valuation/" },
    futuresearch: { name: "FutureSearch: Anthropic and OpenAI IPO dates and valuations", url: "https://futuresearch.ai/anthropic-openai-ipo-dates-valuations/" },
    newscord: { name: "Newscord: Anthropic prepares 2026 IPO (6 outlets compared)", url: "https://newscord.org/article/anthropic-prepares-2026-ipo-as-investors-await-filing-on-600-billion-infrastruct--Story_20261023_WhatsomeofAnthropicseba9c3b5" },
    cnbc_cw19: { name: "CNBC, 19 Oct 2026: CoreWeave bond yields stay near 15%", url: "https://www.cnbc.com/2026/10/19/coreweave-oracle-ai-credit-stress.html" },
    benzinga_cds: { name: "Benzinga: CoreWeave's \"Darwin moment\", markets price 60% default odds", url: "https://www.benzinga.com/markets/tech/26/10/62412918/coreweave-bonds-distress-ai-darwin-moment-hartnett" },
    register_cw: { name: "The Register, 12 Aug 2026: CoreWeave's debt pile reaches $35.6B", url: "https://www.theregister.com/off-prem/2026/08/12/coreweave-revenue-doubles-as-debt-pile-reaches-356b/5286832" },
    cnbc_cw_q2: { name: "CNBC, 11 Aug 2026: CoreWeave revenue doubles", url: "https://www.cnbc.com/2026/08/11/coreweave-crwv-q2-earnings-report-2026.html" },
    fortune_tan: { name: "Fortune, 15 Oct 2026: Hock Tan says AI investors are \"in a casino\"", url: "https://fortune.com/2026/10/15/broadcom-hock-tan-ai-investing-casino/" },
    cnbc_tan: { name: "CNBC, 12 Oct 2026: Intel and Broadcom CEOs warn of a capital crunch", url: "https://www.cnbc.com/2026/10/12/intel-broadcom-ceos-warn-capital-crunch-could-become-ai-bottleneck.html" },
    cryptobriefing_wood: { name: "Crypto Briefing: Jefferies' Chris Wood warns of capital destruction", url: "https://cryptobriefing.com/jefferies-warns-us-ai-capital-destruction/" },
    business_standard_wood: { name: "Business Standard: Chinese AI models can trigger capital destruction in US, Chris Wood", url: "https://www.business-standard.com/markets/news/chinese-ai-models-can-trigger-massive-capital-destruction-in-us-chris-wood-126072800660_1.html" },
    forbes_cut: { name: "Forbes, 31 Jul 2026: OpenAI's 80% price cut", url: "https://www.forbes.com/sites/geruiwang/2026/07/31/why-openais-80-price-cut-could-trigger-a-race-to-the-bottom-in-ai/" },
    technology_org_cut: { name: "Technology.org, 24 Aug 2026: OpenAI cuts GPT-5.6 Sol prices", url: "https://www.technology.org/2026/08/24/openai-gpt-5-6-sol-price-cut-developers/" },
    fool_nvda: { name: "Motley Fool: Nvidia's forward P/E has fallen as its stock rose", url: "https://www.fool.com/investing/2026/07/11/nvidias-forward-pe-has-actually-fallen-as-its-stoc/" },
    wallst_apple: { name: "24/7 Wall St., 20 Oct 2026: Apple trades at twice Nvidia's forward P/E", url: "https://247wallst.com/investing/2026/10/20/apple-now-trades-at-twice-nvidias-forward-p-e/" }
  }
};
