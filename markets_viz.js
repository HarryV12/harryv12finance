/* HarryV12 Finance · Data Visualization, "Markets & AI": images from the market, industry and AI pages, drawn on
   a 1080×1440 canvas (the same 3:4 size as the Congress images) with Download image, Copy image and a full-size view.
   Every figure comes from the site's own data and calculations (window.HFSite, set up by app.js), so an image always
   matches the page it comes from. The Data Visualization page calls HFMarketsViz.mount() each time it opens. */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // some of the site's sentences are written for HTML; on a canvas they need their entities turned back
  const plain = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/⅓/g, "1/3").replace(/⅔/g, "2/3").replace(/¼/g, "1/4").replace(/½/g, "1/2");
  const S = () => window.HFSite;
  const W = 1080, HT = 1440, M = 56;
  const UI = '"Public Sans", system-ui, sans-serif', MONO = '"IBM Plex Mono", ui-monospace, monospace';
  const SITE = "harryv12finance.pages.dev";
  // the same colours as the Congress images
  const THEMES = {
    light: { bg: "#f5f6f8", card: "#ffffff", ink: "#0e1621", ink2: "#3f4a5a", muted: "#6b7584", grid: "#e2e6ec", line: "#1f5fd6",
      soft: "rgba(31,95,214,0.10)", up: "#0b7a41", down: "#c22f2f", chip: "#eef1f5", gov: "#1f5fd6", person: "#8a4fd0", company: "#b7791f" },
    dark: { bg: "#0c1117", card: "#141b24", ink: "#eef2f6", ink2: "#c3cbd6", muted: "#8b95a3", grid: "#222b36", line: "#5aa0ff",
      soft: "rgba(90,160,255,0.14)", up: "#3fd07f", down: "#ff6b6b", chip: "#1d2631", gov: "#5aa0ff", person: "#b48cf0", company: "#e0a94a" },
  };

  // ---------- the views, and the choices each one needs ----------
  const STORY_F = ["stmov", "stwhy", "ststeps", "stamk", "statg", "stabf", "staot", "sthead"];
  const VIEWS = [
    { v: "today", g: 1, t: "Today's market movers", s: "Heatmap of the market, with the biggest gainers and decliners at the close", f: ["list", "msec", "mn", "mrank", "mheat", "midx"] },
    { v: "week", g: 1, t: "This week's market movers", s: "The same for the last five trading days", f: ["list", "msec", "mn", "mrank", "mheat", "midx"] },
    { v: "story", g: 1, t: "Why it moved: today", s: "The day's story for the market, an industry or a sector: what happened, why, and our own analysis", f: ["sti", ...STORY_F] },
    { v: "storywk", g: 1, t: "Why it moved: this week", s: "The same for the last five trading days", f: ["sti", ...STORY_F] },
    { v: "drop", g: 1, t: "Market drop or jump", s: "Any sharp fall or rise, for the market or an industry: pick one from the list", f: ["dpk", "dpsel", ...STORY_F, "dpafter"] },
    { v: "industries", g: 1, t: "Industries: today or this week", s: "AI, defense, banks, oil and healthcare: how each moved, and why", f: ["ipd", "ind", "imkt", "iwhy", "ispy", "ibask", "ihead"] },
    { v: "ai", g: 1, t: "AI stocks", s: "Every AI stock at a glance: today, this week or this month", f: ["aip", "aisort", "ain", "aisp"] },
    { v: "stock", g: 1, t: "Stock breakdown", s: "One company at a glance: its price, returns against the market, risk, months and rivals", f: ["stk", "stp", "stcmp", "stret", "strisk", "stmon", "stpeer"] },
    { v: "aftermath", g: 2, t: "Aftermath card", s: "A steady stock that kept falling: its chart, what led to it and why", f: ["af", "afr", "afcmp", "aftl", "afwhy"] },
    { v: "invest", g: 2, t: "Investments money-flow", s: "Who put money in, and how the linked stocks have moved since", f: ["deal", "ivnote", "ivst", "ivsum"] },
    { v: "prodmap", g: 2, t: "Production map", s: "Where the world's chips, oil, metals and minerals are made", f: ["pmi", "pmn", "pmbub", "pmlist", "pmwhy"] },
    { v: "prodchain", g: 2, t: "Production supply chain", s: "Each step from raw material to market, and where it depends on", f: ["item", "pcwho", "pctop"] },
    { v: "aiwatch", g: 3, t: "AI bubble watch", s: "The latest news on the AI labs' listings and the debt behind AI", f: ["awn", "awcw", "awlabs", "awwatch"] },
    { v: "bubble", g: 3, t: "Where is the AI bubble?", s: "The private AI labs ranked among America's biggest companies", f: ["bubub", "bun", "bucmp", "buyr"] },
    { v: "holders", g: 3, t: "Who holds it", s: "A news story, the stocks it could move, and what Trump and Congress hold of them", f: ["hlst", "hlsince", "hltop", "hlcom"] },
    { v: "hype", g: 3, t: "Hype check", s: "Congress buys shared as tips, scored on how much they really mean", f: ["hy", "hyd", "hych", "hyn", "hyr", "hyone"] },
  ];
  const ON = [["1", "Show"], ["0", "Hide"]];
  // every filter: its label, and its choices ("sel" = a dropdown filled in from the data)
  const FIELDS = {
    list: ["Stocks", [["sp", "S&amp;P 500"], ["ndx", "Nasdaq-100"], ["dow", "Dow 30"], ["ai", "AI stocks"], ["chips", "Chips"], ["software", "Software"], ["oil", "Oil &amp; gas"],
      ["power", "Power &amp; utilities"], ["defense", "Defense &amp; space"], ["banks", "Banks"], ["health", "Healthcare"], ["crypto", "Crypto"]]],
    msec: ["Sector", "sel"],
    mn: ["Gainers and decliners listed", [["3", "3"], ["5", "5"], ["8", "8"]]],
    mrank: ["Rank them by", [["pct", "% move"], ["usd", "$ value gained or lost"]]],
    mheat: ["Heatmap", ON], midx: ["Index cards (S&amp;P 500, Nasdaq, Dow)", ON],
    ipd: ["Period", [["today", "Today"], ["now", "This week"]]],
    ind: ["Industry", [["all", "All five"], ["ai", "AI and chips"], ["defense", "Defense"], ["banks", "Banks"], ["oil", "Oil and gas"], ["health", "Healthcare"]]],
    ibask: ["Every stock in the industry (one industry)", ON], ihead: ["Headlines (one industry)", ON],
    imkt: ["Whole market row (all five)", ON], iwhy: ["Why each moved", ON], ispy: ["S&amp;P 500 marker", ON],
    aip: ["Period", [["day", "Today"], ["week", "This week"], ["month", "This month"]]],
    aisort: ["Order", [["move", "Biggest gain first"], ["fall", "Biggest fall first"], ["cap", "Company value"], ["az", "A–Z"]]],
    ain: ["How many", [["12", "12"], ["20", "20"], ["32", "All"]]], aisp: ["Sparklines", ON],
    af: ["Stock", "sel"],
    sti: ["Market, industry or sector", "sel"],
    dpk: ["Show", [["all", "Falls and rises"], ["down", "Falls"], ["up", "Rises"]]], dpsel: ["Which move", "sel"],
    stmov: ["Stocks that moved most", ON], stwhy: ["Why (the written explanation)", ON], ststeps: ["Its steps, one by one", ON],
    stamk: ["Analysis: market or industry", ON], statg: ["Analysis: did they move together", ON], stabf: ["Analysis: what came before", ON],
    staot: ["Analysis: other markets", ON], sthead: ["Headlines", [["0", "None"], ["3", "3"], ["5", "5"]]], dpafter: ["What happened after", ON],
    stk: ["Company", "sel"], stp: ["Chart period", [["126", "6 months"], ["252", "1 year"], ["504", "2 years"], ["all", "Since 2023"]]],
    stcmp: ["S&amp;P 500 line on the chart", ON], stret: ["Returns against the S&amp;P 500", ON], strisk: ["52-week range and company figures", ON],
    stmon: ["Month by month", ON], stpeer: ["Against its rivals", ON],
    afr: ["Chart", [["all", "Full history"], ["365", "1 year"], ["182", "6 months"], ["peak", "Since the high"]]],
    afcmp: ["Same-days comparison", ON], aftl: ["Timeline", ON], afwhy: ["Why it fell", ON],
    deal: ["Deal", "sel"], ivnote: ["Notes on each box", ON], ivst: ["Stake values", ON], ivsum: ["Summary", ON],
    item: ["What", "sel"], pmi: ["What", "sel"], pmn: ["Producers listed", [["5", "5"], ["8", "8"]]], pmbub: ["Bubbles on the map", ON], pmlist: ["Producer list", ON], pmwhy: ["Why it matters", ON],
    pcwho: ["Companies at each step", ON], pctop: ["Biggest producers", ON],
    awn: ["News items", [["2", "2"], ["3", "3"], ["4", "4"]]], awcw: ["CoreWeave figures", ON], awlabs: ["The private labs", ON], awwatch: ["What to watch", ON],
    bubub: ["Two-bubbles picture", ON], bun: ["Companies ranked", [["8", "8"], ["12", "12"], ["15", "15"]]], bucmp: ["Chipmakers vs data-centre renters", ON],
    buyr: ["Compare their moves over", [["63", "3 months"], ["126", "6 months"], ["252", "1 year"]]],
    hlst: ["Story", "sel"], hlsince: ["Move since the news", ON], hltop: ["Biggest holders", ON], hlcom: ["Committee links", ON],
    hy: ["Show", [["weak", "Weakest (most overhyped)"], ["strong", "Strongest"]]],
    hyd: ["Disclosed in the last", [["14", "14 days"], ["30", "30 days"], ["45", "45 days"]]],
    hych: ["Who", [["all", "Everyone"], ["H", "House"], ["S", "Senate"], ["E", "Officials"]]],
    hyn: ["Buys shown", [["3", "3"], ["4", "4"], ["5", "5"]]], hyr: ["Reasons per buy", [["1", "1"], ["2", "2"], ["3", "3"]]],
    hyone: ["Buys per person", [["1", "One"], ["0", "All"]]],
  };
  const DEF = { view: "today", list: "sp", msec: "all", mn: "5", mrank: "pct", mheat: "1", midx: "1", ipd: "now", ind: "all", ibask: "1", ihead: "1", imkt: "1", iwhy: "1", ispy: "1",
    sti: "all", dpk: "all", dpsel: "", stmov: "1", stwhy: "1", ststeps: "1", stamk: "1", statg: "1", stabf: "1", staot: "1", sthead: "3", dpafter: "1", stk: "NVDA", stp: "252", stcmp: "1", stret: "1", strisk: "1", stmon: "1", stpeer: "1", aip: "day", aisort: "move", ain: "32", aisp: "1", af: "", afr: "all", afcmp: "1", aftl: "1", afwhy: "1", deal: "0", ivnote: "1", ivst: "1", ivsum: "1",
    item: "chips", pmi: "chips", pmn: "8", pmbub: "1", pmlist: "1", pmwhy: "1", pcwho: "1", pctop: "1", awn: "4", awcw: "1", awlabs: "1", awwatch: "1",
    bubub: "1", bun: "12", bucmp: "1", buyr: "252", hlst: "", hlsince: "1", hltop: "1", hlcom: "1", hy: "weak", hyd: "45", hych: "all", hyn: "5", hyr: "3", hyone: "1", theme: "light", ttl: {} };
  const on = (k) => Q[k] !== "0";
  let Q = { ...DEF };
  try { Q = { ...DEF, ...(JSON.parse(localStorage.getItem("hf-mviz") || "{}") || {}) }; } catch (e) { /* storage blocked */ }
  if (!VIEWS.some((x) => x.v === Q.view)) Q.view = DEF.view;
  if (typeof Q.ttl !== "object" || !Q.ttl) Q.ttl = {};
  const save = () => { try { localStorage.setItem("hf-mviz", JSON.stringify(Q)); } catch (e) { /* storage blocked */ } };

  // ---------- drawing kit ----------
  const setF = (c, w, s, f = UI) => { c.font = `${w} ${s}px ${f}`; };
  function tx(c, str, x, y, { s = 20, w = 500, col = "#000", f = UI, a = "left", max = 0, ls = 0 } = {}) {
    setF(c, w, s, f); c.fillStyle = col; c.textAlign = a; c.textBaseline = "alphabetic";
    if ("letterSpacing" in c) c.letterSpacing = `${ls}px`;
    c.fillText(max ? fit(c, String(str), max) : String(str), x, y);
    if ("letterSpacing" in c) c.letterSpacing = "0px";
    c.textAlign = "left";
  }
  const caps = (c, str, x, y, col, s = 15, a = "left") => tx(c, String(str).toUpperCase(), x, y, { s, w: 800, col, a, ls: 1.6 });
  function fit(c, s, max) { if (c.measureText(s).width <= max) return s; while (s.length > 1 && c.measureText(s + "…").width > max) s = s.slice(0, -1); return s.trimEnd() + "…"; }
  function lines(c, str, max) {
    const out = []; let cur = "";
    for (const word of String(str).split(/\s+/).filter(Boolean)) { const t = cur ? cur + " " + word : word; if (c.measureText(t).width > max && cur) { out.push(cur); cur = word; } else cur = t; }
    if (cur) out.push(cur); return out;
  }
  // wrapped text; past maxL lines the last one ends in "…". Returns the y below the last line.
  function wrap(c, str, x, y, max, lh, maxL, { s = 20, w = 500, col = "#000", f = UI } = {}) {
    setF(c, w, s, f); c.fillStyle = col; let ls = lines(c, str, max);
    if (ls.length > maxL) { ls = ls.slice(0, maxL); ls[maxL - 1] = fit(c, ls[maxL - 1] + " …", max).replace(/ …$/, "…"); }
    ls.forEach((l, i) => c.fillText(l, x, y + i * lh)); return y + (ls.length - 1) * lh;
  }
  function rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const box = (c, th, x, y, w, h, r = 16) => { rr(c, x, y, w, h, r); c.fillStyle = th.card; c.fill(); c.strokeStyle = th.grid; c.lineWidth = 1.5; c.stroke(); };
  // a move too small to show at this precision reads as a neutral 0
  const flat = (r, d) => r != null && Math.abs(r) < 0.5 * Math.pow(10, -d - 2);
  const sgn = (r, th, d = 1) => r == null || flat(r, d) ? th.muted : r >= 0 ? th.up : th.down;
  const pc = (r, d = 1) => flat(r, d) ? `${(0).toFixed(d)}%` : S().pct(r, d);
  // colour for a move: grey to green or red, stronger the bigger the move (as the site's heatmap)
  const heat = (r, cap) => { if (r == null) return "rgb(120,126,136)"; const t = Math.max(-1, Math.min(1, r / cap)), a = Math.abs(t); const [R, G, B] = t >= 0 ? [22, 163, 74] : [220, 38, 38];
    return `rgb(${Math.round(84 + (R - 84) * a)},${Math.round(90 + (G - 90) * a)},${Math.round(100 + (B - 100) * a)})`; };
  function sparkline(c, vals, x, y, w, h, col, lw = 3, shadeFrom = null, th = null) {
    const pts = vals.map((v, i) => [i, v]).filter((p) => p[1] != null); if (pts.length < 2) return;
    const lo = Math.min(...pts.map((p) => p[1])), hi = Math.max(...pts.map((p) => p[1])), X = (i) => x + i / Math.max(1, vals.length - 1) * w, Y = (v) => y + h - (v - lo) / Math.max(1e-9, hi - lo) * h;
    if (shadeFrom != null && th) { c.fillStyle = th.soft; c.fillRect(X(shadeFrom), y - 4, x + w - X(shadeFrom), h + 8); }
    c.beginPath(); pts.forEach((p, k) => (k ? c.lineTo(X(p[0]), Y(p[1])) : c.moveTo(X(p[0]), Y(p[1])))); c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = "round"; c.lineCap = "round"; c.stroke();
  }
  function header(c, th, kicker, title, sub, { ts = 58 } = {}) {
    c.fillStyle = th.bg; c.fillRect(0, 0, W, HT);
    caps(c, kicker, M, 76, th.line, 16);
    title = (Q.ttl[Q.view] || "").trim() || title;
    setF(c, 800, ts); let tl = lines(c, title, W - 2 * M); if (tl.length > 2) tl = [tl[0], fit(c, tl.slice(1).join(" "), W - 2 * M)];
    let y = 76 + ts + 8; tl.forEach((l, i) => tx(c, l, M, y + i * (ts + 6), { s: ts, w: 800, col: th.ink }));
    y += (tl.length - 1) * (ts + 6);
    if (sub) y = wrap(c, sub, M, y + 40, W - 2 * M, 30, 2, { s: 22, w: 500, col: th.ink2 });
    return y + 34;
  }
  function footer(c, th, note) {
    const y = HT - 92; c.fillStyle = th.grid; c.fillRect(M, y, W - 2 * M, 2);
    if (note) tx(c, note, M, y - 16, { s: 15, w: 500, col: th.muted, max: W - 2 * M });
    tx(c, SITE, M, HT - 42, { s: 21, w: 600, col: th.line });
    tx(c, "HarryV12 Finance", W - M, HT - 42, { s: 21, w: 800, col: th.ink2, a: "right" });
  }
  const BOTTOM = HT - 92 - 44;  // content ends here (the source note sits below it)
  const loadImg = (src) => new Promise((res) => { if (!src) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });

  // ---------- 1–2. market movers (today or this week) ----------
  async function drawMovers(c, th, k) {
    const H = S(), P = await H.loadAllPrices(), L = P.dates.length - 1, date = P.dates[L], listName = H.LIST_NAMES[Q.list], sec = Q.msec !== "all" ? Q.msec : "";
    const rows = H.listTks(P, Q.list).filter((t) => !sec || H.sectorOf(t) === sec).map((t) => [t, H.moveOf(P, t, k)]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1]);
    if (!rows.length) return sec ? `None of the ${listName} stocks are in ${sec}. Pick another sector or list.` : `No prices for the ${listName} yet.`;
    const up = rows.filter((x) => x[1] > 0).length, dn = rows.filter((x) => x[1] < 0).length, cap = k === 1 ? 0.03 : 0.07;
    const when = k === 1 ? H.fmtDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(P.dates[L - k + 1], { day: "numeric", month: "short" })} – ${H.fmtDate(date)}`;
    let y = header(c, th, `${listName}${sec ? " · " + sec : ""} · ${when}`, k === 1 ? "Today's market movers" : "This week's market movers",
      `${up} of ${rows.length} ${listName}${sec ? " " + sec : ""} stocks rose and ${dn} fell ${k === 1 ? "at the close" : "over the last five trading days"}.`);
    // index cards
    if (on("midx")) {
      const IDX = [["SPY", "S&P 500"], ["QQQ", "Nasdaq 100"], ["DIA", "Dow"]], gap = 18, cw = (W - 2 * M - 2 * gap) / 3, ch = 128;
      IDX.forEach(([tk, nm], i) => {
        const x = M + i * (cw + gap), r = H.moveOf(P, tk, k), px = P.px[tk] || [];
        box(c, th, x, y, cw, ch); tx(c, nm, x + 20, y + 34, { s: 18, w: 700, col: th.ink2 });
        tx(c, pc(r, 2), x + 20, y + 84, { s: 40, w: 700, col: sgn(r, th), f: MONO });
        sparkline(c, px.slice(L - 21, L + 1), x + cw - 132, y + 30, 112, 70, sgn(r, th), 3, k > 1 ? 21 - k : null, th);
      });
      y += ch + 30;
    }
    // breadth
    const bw = W - 2 * M, upW = bw * up / rows.length;
    rr(c, M, y, bw, 16, 8); c.fillStyle = th.down; c.fill(); rr(c, M, y, Math.max(16, upW), 16, 8); c.fillStyle = th.up; c.fill();
    tx(c, `${up} up`, M, y + 44, { s: 18, w: 700, col: th.up }); tx(c, `${dn} down`, W - M, y + 44, { s: 18, w: 700, col: th.down, a: "right" });
    if (on("mheat")) tx(c, `${H.INDEX_LISTS[Q.list] && !sec ? "sectors › industries › companies" : "industries › companies"}, sized by value, coloured by the ${k === 1 ? "day" : "week"}`, W / 2, y + 44, { s: 15, w: 500, col: th.muted, a: "center" });
    y += 64;
    // the lists: by % move, or by the value each company gained or lost
    const n = Math.max(1, Math.min(+Q.mn, Math.ceil(rows.length / 2))), byUsd = Q.mrank === "usd";
    const val = (tk, r) => byUsd ? H.mcapOf(tk) * r / (1 + r) : r;
    const ranked = rows.map(([tk, r]) => [tk, r, val(tk, r)]).filter((x) => !byUsd || x[2]).sort((a, b) => b[2] - a[2]);
    const gain = ranked.slice(0, n).filter((x) => x[2] > 0), lose = ranked.slice(-n).reverse().filter((x) => x[2] < 0);
    const rowH = on("mheat") ? 48 : 62;
    // heatmap
    if (on("mheat")) {
      // sectors (or sub-industries, for an industry list or one sector), the sub-industries inside each sector,
      // then each company: block labels carry their value-weighted move, tiles show more the bigger they are
      const hx = M, hy = y, hw = W - 2 * M, hh = Math.max(300, BOTTOM - y - 34 - (22 + n * rowH) - 8), bySector = !!H.INDEX_LISTS[Q.list] && !sec;
      const items = rows.map(([tk, r]) => ({ tk, r, v: Math.max(H.mcapOf(tk), 5e9), s: bySector ? H.sectorOf(tk) : H.subOf(tk), i: H.subOf(tk) }));
      const groups = (list, key) => { const m = new Map(); for (const it of list) { if (!m.has(it[key])) m.set(it[key], []); m.get(it[key]).push(it); }
        return [...m].map(([g, l]) => { const v = l.reduce((a, x) => a + x.v, 0); return { s: g, l, v, r: l.reduce((a, x) => a + x.r * x.v, 0) / v }; }); };
      const tile = (t) => {
        c.fillStyle = heat(t.r, cap); c.fillRect(t.x, t.y, t.w, t.h); c.strokeStyle = th.bg; c.lineWidth = 1.5; c.strokeRect(t.x, t.y, t.w, t.h);
        if (t.w < 30 || t.h < 18) return;
        const fs = Math.max(10, Math.min(30, t.w / 4.2, t.h / 2.4)), two = t.h > 40 && t.w > 40, three = t.w > 150 && t.h > 96, cy = t.y + t.h / 2;
        const top = three ? cy - fs * 0.55 : two ? cy - 1 : cy + fs * 0.36;
        tx(c, t.tk, t.x + t.w / 2, top, { s: fs, w: 800, col: "#fff", a: "center", max: t.w - 6 });
        if (two) tx(c, pc(t.r), t.x + t.w / 2, top + fs * 0.95, { s: Math.max(10, fs * 0.62), w: 700, col: "#fff", a: "center", f: MONO });
        if (three) tx(c, H.coName(t.tk), t.x + t.w / 2, top + fs * 1.75, { s: Math.max(11, fs * 0.45), w: 600, col: "rgba(255,255,255,.88)", a: "center", max: t.w - 10 });
      };
      for (const sb of H.squarify(groups(items, "s"), hx, hy, hw, hh)) {
        const lab = sb.h > 44 && sb.w > 80;
        const ix = sb.x + 1, iy = sb.y + (lab ? 22 : 1), iw = sb.w - 2, ih = sb.h - (lab ? 23 : 2), subs = bySector ? groups(sb.l, "i") : [];
        if (subs.length > 1 && iw > 150 && ih > 100) {
          for (const ib of H.squarify(subs, ix, iy, iw, ih)) {
            const sl = ib.w > 84 && ib.h > 56;
            for (const t of H.squarify(ib.l, ib.x + 1, ib.y + (sl ? 16 : 1), ib.w - 2, ib.h - (sl ? 17 : 2))) tile(t);
            c.strokeStyle = th.bg; c.lineWidth = 3; c.strokeRect(ib.x, ib.y, ib.w, ib.h);
            if (sl) { c.fillStyle = "rgba(0,0,0,.42)"; c.fillRect(ib.x + 1.5, ib.y + 1.5, ib.w - 3, 15);
              tx(c, `${ib.s} ${pc(ib.r)}`, ib.x + 5, ib.y + 13, { s: 11, w: 700, col: "#fff", max: ib.w - 10 }); }
          }
        } else for (const t of H.squarify(sb.l, ix, iy, iw, ih)) tile(t);
        if (lab) { setF(c, 800, 13); const nm = sb.s.toUpperCase(), nw = Math.min(c.measureText(nm).width + 8, sb.w - 70);
          tx(c, nm, sb.x + 4, sb.y + 16, { s: 13, w: 800, col: th.muted, max: sb.w - 70, ls: 0.6 });
          tx(c, pc(sb.r), sb.x + 4 + nw + 6, sb.y + 16, { s: 13, w: 800, col: sgn(sb.r, th), f: MONO }); }
      }
      y = hy + hh + 34;
    }
    const colW = (W - 2 * M - 36) / 2, mx = Math.max(...gain.concat(lose).map((x) => Math.abs(x[2])), 1e-9);
    const big = rowH > 60, fsz = big ? 21 : 17;
    const list = (arr, x, title) => {
      caps(c, title, x, y, th.muted, 15);
      arr.forEach(([tk, r, v], i) => {
        const ry = y + 22 + i * rowH, chH = big ? 44 : 34;
        rr(c, x, ry, big ? 100 : 84, chH, 7); c.fillStyle = th.chip; c.fill(); tx(c, tk, x + (big ? 50 : 42), ry + chH / 2 + 7, { s: fsz, w: 700, col: th.ink, f: MONO, a: "center", max: big ? 94 : 78 });
        tx(c, H.coName(tk), x + (big ? 114 : 96), ry + chH / 2 + 7, { s: fsz, w: 600, col: th.ink2, max: colW - (big ? 114 : 96) - (byUsd ? 224 : 200) });
        const bx = x + colW - (byUsd ? 214 : 190), bl = (byUsd ? 76 : 92) * Math.abs(v) / mx; rr(c, bx, ry + chH / 2 - 6, Math.max(4, bl), 12, 6); c.fillStyle = sgn(r, th); c.fill();
        const lab = byUsd ? `${v > 0 ? "+" : ""}${H.usd(v)}` : pc(r, 1);
        tx(c, lab, x + colW, ry + chH / 2 + 8, { s: big ? 22 : 19, w: 700, col: sgn(r, th), f: MONO, a: "right" });
      });
    };
    list(gain, M, byUsd ? "Most value gained" : "Biggest gainers"); list(lose, M + colW + 36, byUsd ? "Most value lost" : "Biggest decliners");
    // without the heatmap: each sector's average move fills the rest
    y += 22 + n * rowH + 36;
    if (!on("mheat") && !sec && BOTTOM - y > 160) {
      const by = new Map(); for (const [tk, r] of rows) { const g = H.sectorOf(tk); if (!by.has(g)) by.set(g, []); by.get(g).push(r); }
      const sr = [...by].map(([g, l]) => [g, l.reduce((a, r) => a + r, 0) / l.length, l.length]).sort((a, b) => b[1] - a[1]);
      const rh2 = Math.min(40, Math.floor((BOTTOM - y - 24) / sr.length)), smx = Math.max(...sr.map((x) => Math.abs(x[1])), 1e-6), cx0 = M + 330, half = (W - 2 * M - 330 - 110) / 2, mid = cx0 + half;
      caps(c, "By sector · average move", M, y, th.muted, 15);
      sr.slice(0, Math.floor((BOTTOM - y - 24) / rh2)).forEach(([g, r, cnt], i) => { const ry = y + 22 + i * rh2;
        tx(c, `${g} (${cnt})`, M, ry + 24, { s: 18, w: 600, col: th.ink2, max: 320 });
        c.fillStyle = th.grid; c.fillRect(mid - 1, ry + 6, 2, 26); const bl = half * Math.abs(r) / smx; rr(c, r >= 0 ? mid : mid - bl, ry + 12, Math.max(3, bl), 14, 7); c.fillStyle = sgn(r, th); c.fill();
        tx(c, pc(r, 1), W - M, ry + 25, { s: 18, w: 700, col: sgn(r, th), f: MONO, a: "right" }); });
    }
    footer(c, th, `Closing prices from Yahoo Finance, to ${H.fmtDate(date)}. Company values from Nasdaq${byUsd ? "; value change = company value × its move" : ""}. Not financial advice.`);
  }

  // ---------- 3. industries: today or this week ----------
  async function drawIndustry(c, th, H, Mv, key) {
    const t = Mv.themes[key], span = Q.ipd, e = t && t[span]; if (!e) return "This industry's moves haven't loaded.";
    const P = await H.loadAllPrices(), L = P.dates.length - 1, k = span === "today" ? 1 : 5;
    const when = span === "today" ? H.fmtDate(e.end, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(e.start, { day: "numeric", month: "short" })} – ${H.fmtDate(e.end)}`;
    let y = header(c, th, `${t.name} · ${when}`, `${t.name} ${span === "today" ? "today" : "this week"}`, "");
    // the move, against the S&P 500, and the past month
    tx(c, pc(e.move, 1), M, y + 70, { s: 88, w: 800, col: sgn(e.move, th) });
    tx(c, `The ${t.tickers.length} biggest stocks in ${t.name}, averaged`, M, y + 104, { s: 17, w: 600, col: th.ink2 });
    const cx = 620, rows3 = [[t.name, e.move], ["S&P 500", e.spy], ["Past month", e.month]].filter((r) => r[1] != null), cmx = Math.max(...rows3.map((r) => Math.abs(r[1])), 0.01);
    rows3.forEach(([nm, r], i) => { const ry = y + 10 + i * 34; tx(c, nm, cx, ry + 18, { s: 17, w: 600, col: th.ink2, max: 150 }); const len = 160 * Math.abs(r) / cmx;
      rr(c, cx + 160, ry + 6, Math.max(4, len), 14, 7); c.fillStyle = sgn(r, th); c.fill(); tx(c, pc(r, 1), W - M, ry + 19, { s: 18, w: 700, col: sgn(r, th), f: MONO, a: "right" }); });
    y += 140;
    // the industry's last six months (weekly, the basket's average)
    const ser = (t.series || []).slice(-27);
    if (ser.length > 2) {
      const gh = 170, vals = ser.map((p2) => p2[1]), lo = Math.min(...vals), hi = Math.max(...vals), X = (i) => M + i / (ser.length - 1) * (W - 2 * M - 70), Y = (v) => y + 10 + (hi - v) / Math.max(1e-9, hi - lo) * gh;
      caps(c, "The last six months", M, y, th.muted, 13);
      c.beginPath(); vals.forEach((v, i) => (i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.lineTo(X(vals.length - 1), y + 10 + gh); c.lineTo(X(0), y + 10 + gh); c.closePath(); c.fillStyle = th.soft; c.fill();
      c.beginPath(); vals.forEach((v, i) => (i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.strokeStyle = th.line; c.lineWidth = 3.5; c.lineJoin = "round"; c.stroke();
      const ch6 = vals[vals.length - 1] / vals[0] - 1; tx(c, `${pc(ch6, 0)} in six months`, W - M, y, { s: 15, w: 700, col: sgn(ch6, th), a: "right" });
      for (let i = 1; i < ser.length; i++) if (ser[i][0].slice(0, 7) !== ser[i - 1][0].slice(0, 7)) tx(c, H.fmtDate(ser[i][0], { month: "short" }), X(i), y + gh + 32, { s: 13, w: 500, col: th.muted, a: "center" });
      y += gh + 56;
    }
    // every stock in the basket over the same days
    if (on("ibask")) {
      const rows = t.tickers.map((tk) => [tk, H.moveOf(P, tk, k)]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1]), mx = Math.max(...rows.map((x) => Math.abs(x[1])), 0.005);
      const cols = 2, per = Math.ceil(rows.length / cols), rh = 30, colW = (W - 2 * M - 30) / cols;
      caps(c, `Every stock in the basket · ${span === "today" ? "today" : "this week"}`, M, y, th.muted, 13);
      rows.forEach(([tk, r], i) => { const x = M + Math.floor(i / per) * (colW + 30), ry = y + 14 + (i % per) * rh, half = (colW - 150) / 2, mid = x + 70 + half;
        tx(c, tk, x, ry + 20, { s: 16, w: 800, col: th.ink, f: MONO }); c.fillStyle = th.grid; c.fillRect(mid - 1, ry + 4, 2, 22);
        const bl = half * Math.abs(r) / mx; rr(c, r >= 0 ? mid : mid - bl, ry + 9, Math.max(3, bl), 12, 6); c.fillStyle = sgn(r, th); c.fill();
        tx(c, pc(r, 1), x + colW, ry + 20, { s: 15, w: 700, col: sgn(r, th), f: MONO, a: "right" }); });
      y += 14 + per * rh + 30;
    }
    // why it moved, and what happened step by step
    if (on("iwhy") && (e.summary || (e.detail || []).length)) {
      const room = BOTTOM - y - (on("ihead") ? 150 : 0);
      if (room > 120) {
        setF(c, 500, 18); const whyL = e.summary ? Math.min(4, lines(c, plain(e.summary), W - 2 * M - 56).length) : 0;
        const steps = (e.detail || []).slice(0, 3); let need = 70 + whyL * 25 + steps.reduce((a, d) => a + 12 + 23 * Math.min(2, lines(c, plain(d), W - 2 * M - 90).length), 0);
        const bh = Math.min(room, need);
        rr(c, M, y, W - 2 * M, bh, 14); c.fillStyle = th.card; c.fill(); c.fillStyle = th.line; c.fillRect(M, y + 12, 5, bh - 24);
        caps(c, "Why it moved", M + 28, y + 34, th.line, 14); let yy = y + 62;
        if (whyL) yy = wrap(c, plain(e.summary), M + 28, yy, W - 2 * M - 56, 25, whyL, { s: 18, w: 600, col: th.ink }) + 34;
        steps.forEach((d, j) => { if (yy > y + bh - 20) return; c.fillStyle = th.line; c.beginPath(); c.arc(M + 40, yy - 6, 11, 0, 7); c.fill(); tx(c, String(j + 1), M + 40, yy - 1, { s: 13, w: 800, col: "#fff", a: "center" });
          yy = wrap(c, plain(d), M + 62, yy, W - 2 * M - 90, 23, 2, { s: 16, w: 500, col: th.ink2 }) + 35; });
        y += bh + 26;
      }
    }
    // the latest headlines
    if (on("ihead") && (e.what || []).length && BOTTOM - y > 70) {
      caps(c, "In the news", M, y, th.muted, 13); y += 14;
      for (const h of e.what.slice(0, Math.floor((BOTTOM - y) / 44))) { tx(c, plain(h.title), M, y + 22, { s: 17, w: 700, col: th.ink, max: W - 2 * M - 230 });
        tx(c, `${h.source} · ${H.fmtDate(h.date, { day: "numeric", month: "short" })}`, W - M, y + 22, { s: 14, w: 600, col: th.muted, a: "right" }); y += 44; }
    }
    footer(c, th, `${t.name}: the ${t.tickers.length} biggest stocks in the industry, averaged. Prices from Yahoo Finance; reasons from the day's news. Not financial advice.`);
  }
  async function drawIndustries(c, th) {
    const H = S(), Mv = await H.loadMoves(); if (!Mv || !Mv.themes) return "Industry moves haven't loaded.";
    if (Q.ind !== "all" && Mv.themes[Q.ind]) return drawIndustry(c, th, H, Mv, Q.ind);
    const span = Q.ipd, mk = Mv.market[span];
    const rows = [...(on("imkt") ? [["The whole market (S&P 500)", mk]] : []), ...Object.values(Mv.themes).map((t) => [t.name, t[span], 1])].filter((r) => r[1]);
    const when = span === "today" ? H.fmtDate(mk.end, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(mk.start, { day: "numeric", month: "short" })} – ${H.fmtDate(mk.end)}`;
    let y = header(c, th, `${span === "today" ? "Today" : "This week"} · ${when}`, span === "today" ? "Today by industry" : "This week by industry",
      `How ${on("imkt") ? "the market and " : ""}five industries moved${on("iwhy") ? ", and why" : ""}.${on("ispy") ? " Each bar is the industry's move; the marker is the S&P 500 over the same days." : ""}`);
    const n = rows.length, ch = Math.floor(Math.min(on("iwhy") ? 999 : 128, (BOTTOM - y - 14 * (n - 1)) / n)), gap = n > 1 ? Math.min(40, (BOTTOM - y - n * ch) / (n - 1)) : 0, mx = Math.max(...rows.map((r) => Math.max(Math.abs(r[1].move || 0), Math.abs(r[1].spy || 0))), 0.005);
    rows.forEach(([name, e, isInd], i) => {
      const ry = y + i * (ch + gap); box(c, th, M, ry, W - 2 * M, ch);
      tx(c, name, M + 24, ry + 40, { s: 24, w: 800, col: th.ink, max: 560 });
      tx(c, pc(e.move, 1), W - M - 24, ry + 44, { s: 38, w: 700, col: sgn(e.move, th), f: MONO, a: "right" });
      // the move against a centre line, with the S&P 500 marker
      const cx = M + 24 + 280, half = 260, by = ry + 62;
      c.fillStyle = th.grid; c.fillRect(cx - half, by + 5, 2 * half, 2); c.fillRect(cx - 1, by - 4, 2, 20);
      const len = half * Math.abs(e.move || 0) / mx; rr(c, e.move >= 0 ? cx : cx - len, by, Math.max(3, len), 12, 6); c.fillStyle = sgn(e.move, th); c.fill();
      if (isInd && on("ispy") && e.spy != null) { const sx = cx + half * e.spy / mx; c.fillStyle = th.ink2; c.beginPath(); c.moveTo(sx, by - 6); c.lineTo(sx - 6, by - 14); c.lineTo(sx + 6, by - 14); c.closePath(); c.fill(); }
      tx(c, isInd && on("ispy") && e.spy != null ? `S&P 500 ${pc(e.spy, 1)} · past month ${pc(e.month, 1)}` : `past month ${pc(e.month, 1)}`, W - M - 24, ry + 74, { s: 15, w: 600, col: th.muted, a: "right" });
      if (on("iwhy")) wrap(c, plain(e.summary || "No single cause was reported."), M + 24, ry + 108, W - 2 * M - 48, 25, Math.max(1, Math.floor((ch - 108) / 25) + 1), { s: 18, w: 500, col: th.ink2 });
    });
    footer(c, th, `Industries are baskets of the biggest stocks in each. Prices from Yahoo Finance; reasons from the day's news. Not financial advice.`);
  }

  // ---------- 4. AI stocks ----------
  async function drawAI(c, th) {
    const H = S(), P = await H.loadAllPrices(), L = P.dates.length - 1, k = { day: 1, week: 5, month: 21 }[Q.aip], cap = { day: 0.04, week: 0.08, month: 0.15 }[Q.aip];
    const all = H.AI_STOCKS.filter((t) => P.px[t]).map((t) => [t, H.moveOf(P, t, k)]).filter((x) => x[1] != null);
    const order = { move: (a, b) => b[1] - a[1], fall: (a, b) => a[1] - b[1], cap: (a, b) => H.mcapOf(b[0]) - H.mcapOf(a[0]), az: (a, b) => a[0].localeCompare(b[0]) }[Q.aisort];
    // "How many" keeps the biggest movers either way (or the biggest companies), then puts them in the chosen order
    const keep = Q.aisort === "cap" || Q.aisort === "az" ? all.slice().sort((a, b) => H.mcapOf(b[0]) - H.mcapOf(a[0])) : all.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const rows = keep.slice(0, +Q.ain).sort(order), byMove = all.slice().sort((a, b) => b[1] - a[1]);
    if (!rows.length) return "No AI stock prices yet.";
    const avg = all.reduce((a, x) => a + x[1], 0) / all.length, up = all.filter((x) => x[1] > 0).length;
    const word = { day: "today", week: "this week", month: "this month" }[Q.aip];
    const when = k === 1 ? H.fmtDate(P.dates[L], { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(P.dates[L - k + 1], { day: "numeric", month: "short" })} – ${H.fmtDate(P.dates[L])}`;
    let y = header(c, th, `AI stocks · ${when}`, `AI stocks ${word}`,
      `Average ${pc(avg)} · ${up} up, ${all.length - up} down · best ${byMove[0][0]} ${pc(byMove[0][1])}, worst ${byMove[byMove.length - 1][0]} ${pc(byMove[byMove.length - 1][1])}`);
    const cols = 4, gap = 14, tw = (W - 2 * M - gap * (cols - 1)) / cols, nr = Math.ceil(rows.length / cols), thh = Math.floor((BOTTOM - y - gap * (nr - 1)) / nr), from = Math.max(0, L - Math.max(21, k * 3));
    rows.forEach(([tk, r], i) => {
      const x = M + (i % cols) * (tw + gap), ty = y + Math.floor(i / cols) * (thh + gap);
      box(c, th, x, ty, tw, thh, 12); c.fillStyle = heat(r, cap); rr(c, x, ty, 8, thh, 4); c.fill();
      tx(c, tk, x + 22, ty + 32, { s: 22, w: 800, col: th.ink, f: MONO });
      if (on("aisp") || thh <= 150) tx(c, pc(r, 1), x + tw - 14, ty + 32, { s: 21, w: 700, col: sgn(r, th), f: MONO, a: "right" });
      tx(c, H.coName(tk), x + 22, ty + 54, { s: 14, w: 500, col: th.muted, max: tw - 36 });
      if (on("aisp") && thh > 84) sparkline(c, P.px[tk].slice(from, L + 1), x + 22, ty + 66, tw - 40, thh - 80, sgn(r, th), 2.5, k > 1 ? L - from - k : null, th);
      else if (thh > 84) {
        if (thh > 150) tx(c, pc(r, 1), x + tw / 2, ty + thh / 2 + 34, { s: Math.min(56, tw / 4), w: 800, col: sgn(r, th), f: MONO, a: "center" });
        rr(c, x + 22, ty + thh - 34, tw - 44, 10, 5); c.fillStyle = th.chip; c.fill(); const bl = (tw - 44) * Math.min(1, Math.abs(r) / cap); rr(c, x + 22, ty + thh - 34, Math.max(6, bl), 10, 5); c.fillStyle = sgn(r, th); c.fill();
      }
    });
    footer(c, th, `The site's AI list: chipmakers, cloud and AI software, and the power behind data centres. Prices from Yahoo Finance. Not financial advice.`);
  }

  // ---------- 5. Aftermath card ----------
  async function drawAftermath(c, th) {
    const H = S(), A = await H.loadAfter(); const list = (A && A.stocks) || []; if (!list.length) return "No Aftermath stocks yet.";
    const s = list.find((x) => x.tk === Q.af) || list[0];
    let y = header(c, th, "Aftermath · steady stocks that kept falling", s.name.replace(/ Common Stock$| Corporation.*$| Inc\..*$/, ""), `${s.tk} · ${s.industry || s.sector}${s.cause ? ` · ${s.cause}` : ""}`);
    // the fall, and the same days for its industry and the S&P 500
    tx(c, pc(s.drop, 1), M, y + 76, { s: 92, w: 800, col: th.down });
    tx(c, `since its high on ${H.fmtDate(s.peak, { day: "numeric", month: "short", year: "numeric" })} · ${s.days} trading days`, M, y + 112, { s: 18, w: 600, col: th.ink2 });
    const cmp = !on("afcmp") ? [] : [["This stock", s.drop], [s.industry ? "Its industry" : "Its sector", s.sector_move], ["S&P 500", s.spy]].filter((x) => x[1] != null), cx = 640, cmx = Math.max(...cmp.map((x) => Math.abs(x[1])), 0.05);
    if (cmp.length) caps(c, "Same days", cx, y + 6, th.muted, 14);
    cmp.forEach(([nm, r], i) => { const ry = y + 26 + i * 34; tx(c, nm, cx, ry + 18, { s: 17, w: 600, col: th.ink2 }); const len = 170 * Math.abs(r) / cmx;
      rr(c, cx + 140, ry + 6, Math.max(4, len), 14, 7); c.fillStyle = sgn(r, th); c.fill(); tx(c, pc(r, 0), W - M, ry + 19, { s: 18, w: 700, col: sgn(r, th), f: MONO, a: "right" }); });
    y += 140;
    // the chart, shaded from the high, with each event numbered
    setF(c, 500, 18); const evH = !on("aftl") ? 0 : (s.events || []).slice(0, 4).reduce((a, e) => a + 40 + 24 * (Math.min(2, lines(c, plain(e.text), W - 2 * M - 140).length) - 1), 0);
    setF(c, 500, 19); const whyH = on("afwhy") && (s.why || s.summary) ? 76 + 27 * Math.min(7, lines(c, plain(s.why || s.summary), W - 2 * M - 56).length) + 10 : 0;
    // the chart's range
    const full = s.series || [], pk0 = Math.max(0, full.findIndex((p) => p[0] >= s.peak)), lastD = full.length ? full[full.length - 1][0] : s.peak;
    const from = Q.afr === "peak" ? (full[Math.max(0, pk0 - 15)] || [s.peak])[0] : Q.afr === "all" ? "" : new Date(Date.parse(lastD + "T00:00:00Z") - +Q.afr * 864e5).toISOString().slice(0, 10);
    const ser = full.filter((p) => p[0] >= from), n = ser.length, gx = M, gy = y + 40, gw = W - 2 * M - 70, gh = Math.max(300, Math.min(on("aftl") ? 480 : on("afwhy") ? 640 : 760, BOTTOM - gy - 56 - evH - whyH - 16));
    if (n > 1) {
      const vals = ser.map((p) => p[1]), lo = Math.min(...vals) * 0.97, hi = Math.max(...vals) * 1.03, X = (i) => gx + i / (n - 1) * gw, Y = (v) => gy + (hi - v) / (hi - lo) * gh;
      const at = (d) => { const i = ser.findIndex((p) => p[0] >= d); return i < 0 ? n - 1 : i; }, pk = at(s.peak), inRange = (d) => d >= ser[0][0];
      c.fillStyle = th.soft; c.fillRect(X(pk), gy, X(n - 1) - X(pk), gh);
      for (const v of [lo, (lo + hi) / 2, hi]) { c.fillStyle = th.grid; c.fillRect(gx, Y(v), gw, 1.5); tx(c, v < 100 ? v.toFixed(2) : Math.round(v).toLocaleString(), gx + gw + 10, Y(v) + 6, { s: 15, w: 500, col: th.muted, f: MONO }); }
      for (let i = 1; i < n; i++) if (ser[i][0].slice(0, 7) !== ser[i - 1][0].slice(0, 7) && (n < 300 || +ser[i][0].slice(5, 7) % 2)) tx(c, H.fmtDate(ser[i][0], { month: "short" }), X(i), gy + gh + 24, { s: 14, w: 500, col: th.muted, a: "center" });
      c.beginPath(); vals.forEach((v, i) => (i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.strokeStyle = th.line; c.lineWidth = 3.5; c.lineJoin = "round"; c.stroke();
      (s.events || []).slice(0, 4).forEach((e, j) => { if (!inRange(e.date)) return; const i = at(e.date), ex = X(i), ey = Y(vals[i]), col = e.kind === "good" ? th.up : e.kind === "peak" ? th.line : th.down;
        const up = ey - 42 >= gy + 16, my = up ? ey - 42 : ey + 42;
        c.strokeStyle = col; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(ex, up ? ey - 28 : ey + 28); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
        c.fillStyle = col; c.beginPath(); c.arc(ex, my, 15, 0, 7); c.fill(); tx(c, String(j + 1), ex, my + 6, { s: 16, w: 800, col: "#fff", a: "center" }); });
    }
    y = gy + gh + 56;
    // the timeline
    const evs = on("aftl") ? (s.events || []).slice(0, 4) : [];
    evs.forEach((e, j) => { const col = e.kind === "good" ? th.up : e.kind === "peak" ? th.line : th.down;
      c.fillStyle = col; c.beginPath(); c.arc(M + 15, y + 2, 15, 0, 7); c.fill(); tx(c, String(j + 1), M + 15, y + 8, { s: 16, w: 800, col: "#fff", a: "center" });
      tx(c, H.fmtDate(e.date, { day: "numeric", month: "short" }), M + 44, y + 8, { s: 17, w: 700, col: th.ink, f: MONO });
      y = wrap(c, plain(e.text), M + 140, y + 8, W - 2 * M - 140, 24, 2, { s: 18, w: 500, col: th.ink2 }) + 40; });
    // why
    if (on("afwhy") && (s.why || s.summary)) {
      const room = BOTTOM - y, maxL = Math.floor((room - 76) / 27) + 1; setF(c, 500, 19);
      const n = Math.min(maxL, lines(c, plain(s.why || s.summary), W - 2 * M - 56).length), bh = 76 + n * 27;
      if (room > 110) {
        rr(c, M, y, W - 2 * M, bh, 14); c.fillStyle = th.card; c.fill(); c.fillStyle = th.line; c.fillRect(M, y + 12, 5, bh - 24);
        caps(c, s.why ? "Why it fell" : "What led to it", M + 28, y + 36, th.line, 15);
        wrap(c, plain(s.why || s.summary), M + 28, y + 68, W - 2 * M - 56, 27, maxL, { s: 19, w: 500, col: th.ink });
      }
    }
    footer(c, th, `Prices are daily closes${s.tk.includes(".") ? " in the home-market currency" : ""}. Timeline written from news reports. Not financial advice.`);
  }

  // ---------- 6. Investments money-flow ----------
  async function drawInvest(c, th) {
    const H = S(), [I, P] = await Promise.all([H.loadInvest(), H.loadAllPrices()]); const deals = (I && I.deals) || []; if (!deals.length) return "No deals yet.";
    const d = deals[+Q.deal] || deals[0], L = P.dates.length - 1;
    const last = (tk) => { const x = P.px[tk]; const i = H.lastIdx(x); return i >= 0 ? x[i] : null; };
    const at = (tk, dt) => { const x = P.px[tk]; if (!x) return null; let i = P.dates.findIndex((z) => z >= dt); if (i < 0) return null; for (; i <= L; i++) if (x[i] != null) return x[i]; return null; };
    let y = header(c, th, `Investments · ${H.fmtDate(d.date)} · ${d.status}`, d.title, "", { ts: 46 });
    // the flow: money in → the company → listed companies linked
    // stakes first, so the diagram can take the room left over
    const tiles = [];
    if (on("ivst")) for (const f of d.inflows) if (f.stake && last(f.stake.tk)) { const now = last(f.stake.tk); tiles.push([`${plain(f.name)} stake`, H.usd(f.stake.shares * now), now / f.stake.price - 1]); }
    if (on("ivst")) for (const x of d.tiles || []) if (x.stake && last(x.stake.tk)) { const now = last(x.stake.tk); tiles.push([plain(x.label), H.usd(x.stake.shares * now), now / x.stake.price - 1]); }
    setF(c, 500, 19); const sumL = on("ivsum") ? Math.min(6, lines(c, plain(d.summary), W - 2 * M).length) : 0;
    const ins = d.inflows.slice(0, 5), outs = d.links.slice(0, 5), top = y + 20, bw = 310, R = 124;
    const fh = Math.max(520, Math.min(980, BOTTOM - top - 30 - (tiles.length ? 140 : 0) - (sumL ? sumL * 28 + 30 : 0))), cx = W / 2, cy = top + fh / 2;
    caps(c, "Money in", M, top, th.muted, 14); caps(c, "Listed companies linked", W - M, top, th.muted, 14, "right");
    const slot = (n, i, h) => top + 24 + (fh - 24) * (i + 0.5) / n - h / 2;
    const curve = (x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2); c.strokeStyle = th.grid; c.lineWidth = 3; c.stroke(); };
    const bh = Math.min(on("ivnote") ? 132 : 84, (fh - 40) / Math.max(ins.length, outs.length) - 14);
    ins.forEach((f, i) => curve(M + bw, slot(ins.length, i, bh) + bh / 2, cx - R, cy));
    outs.forEach((l, i) => curve(cx + R, cy, W - M - bw, slot(outs.length, i, bh) + bh / 2));
    ins.forEach((f, i) => { const by = slot(ins.length, i, bh); box(c, th, M, by, bw, bh, 12); c.fillStyle = th[f.kind] || th.company; rr(c, M, by, 7, bh, 3); c.fill();
      tx(c, plain(f.name), M + 20, by + 30, { s: 19, w: 800, col: th.ink, max: bw - 30 }); tx(c, plain(f.amount), M + 20, by + 57, { s: 18, w: 700, col: th.ink2, max: bw - 30 });
      if (on("ivnote") && bh > 80) wrap(c, plain(f.note), M + 20, by + 82, bw - 34, 19, bh > 110 ? 2 : 1, { s: 14, w: 500, col: th.muted }); });
    c.fillStyle = th.soft; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); c.strokeStyle = th.line; c.lineWidth = 3; c.stroke();
    setF(c, 800, 26); const cn = lines(c, plain(d.center.name), 2 * R - 30).slice(0, 2); cn.forEach((l, i) => tx(c, l, cx, cy - 6 - (cn.length - 1) * 15 + i * 30, { s: 26, w: 800, col: th.ink, a: "center" }));
    wrap(c, plain(d.center.sub || ""), cx - R + 22, cy + 28 + (cn.length - 1) * 12, 2 * R - 44, 20, 2, { s: 15, w: 500, col: th.ink2 });
    outs.forEach((l, i) => { const by = slot(outs.length, i, bh), bx = W - M - bw, now = last(l.tk), then = at(l.tk, d.date), r = now && then ? now / then - 1 : null;
      box(c, th, bx, by, bw, bh, 12);
      rr(c, bx + 16, by + 12, 82, 30, 6); c.fillStyle = th.chip; c.fill(); tx(c, l.tk, bx + 57, by + 33, { s: 16, w: 700, col: th.ink, f: MONO, a: "center", max: 76 });
      tx(c, r != null ? pc(r, 0) : "–", bx + bw - 16, by + 34, { s: 22, w: 700, col: sgn(r, th), f: MONO, a: "right" });
      tx(c, H.coName(l.tk), bx + 16, by + 64, { s: 16, w: 700, col: th.ink2, max: bw - 32 });
      if (on("ivnote") && bh > 80) tx(c, `${plain(l.role)}${r != null ? ` · since ${H.fmtDate(d.date, { day: "numeric", month: "short" })}` : ""}`, bx + 16, by + 86, { s: 14, w: 500, col: th.muted, max: bw - 32 }); });
    y = top + fh + 30;
    // stakes: what they paid against what it's worth now
    if (tiles.length) {
      const n = Math.min(3, tiles.length), tw = (W - 2 * M - 18 * (n - 1)) / n;
      tiles.slice(0, n).forEach(([lab, val, r], i) => { const x = M + i * (tw + 18); box(c, th, x, y, tw, 110, 14); caps(c, lab, x + 20, y + 32, th.muted, 13);
        tx(c, val, x + 20, y + 78, { s: 34, w: 700, col: th.ink, f: MONO }); tx(c, `${pc(r, 0)} since bought`, x + tw - 20, y + 78, { s: 17, w: 700, col: sgn(r, th), a: "right" }); });
      y += 140;
    }
    if (sumL && BOTTOM - y > 60) wrap(c, plain(d.summary), M, y + 20, W - 2 * M, 28, Math.min(sumL, Math.floor((BOTTOM - y - 10) / 28)), { s: 19, w: 500, col: th.ink2 });
    footer(c, th, `Sources: ${d.sources.length} official filings and reports, listed on the Investments page. Prices from Yahoo Finance. Not financial advice.`);
  }

  // ---------- 7. Production map ----------
  async function drawProdMap(c, th) {
    const H = S(), [D2, Wd] = await Promise.all([H.loadProd(), H.loadWorld()]); if (!D2) return "Production data hasn't loaded.";
    if (String(Q.pmi).startsWith("grp:")) return drawProdField(c, th, D2, Wd, D2.groups.find((g) => g.name === Q.pmi.slice(4)) || D2.groups[0]);
    const it = D2.items[Q.pmi] || D2.items.chips, isPct = /^%/.test(it.unit), fmtV = (v) => isPct ? `${v}%` : v.toLocaleString();
    let y = header(c, th, `Where it's made · ${it.year}`, it.name, on("pmwhy") ? plain(it.why) : "");
    const nList = on("pmlist") ? Math.min(+Q.pmn, it.rows.length) : 0;
    const mx0 = M, my0 = y, mw = W - 2 * M, mh = Math.min(nList ? 640 : 900, BOTTOM - y - (nList ? 34 + 20 + nList * 46 : 10));
    if (Wd && window.d3) {
      const d3 = window.d3, proj = d3.geoNaturalEarth1().fitExtent([[mx0, my0], [mx0 + mw, my0 + mh]], { type: "Sphere" }), path = d3.geoPath(proj, c);
      const val = new Map(); for (const [, n, v] of it.rows) { const id = String(n).padStart(3, "0"); val.set(id, (val.get(id) || 0) + v); }
      const mx = Math.max(...val.values()), feats = Wd.features.filter((f) => f.id !== "010");
      c.beginPath(); path({ type: "Sphere" }); c.fillStyle = th.chip; c.fill();
      for (const f of feats) { const v = val.get(f.id); c.beginPath(); path(f); c.fillStyle = v ? th.line : th.grid; c.globalAlpha = v ? 0.25 + 0.75 * v / mx : 1; c.fill(); c.globalAlpha = 1; c.strokeStyle = th.bg; c.lineWidth = 0.7; c.stroke(); }
      // bubbles for the top five; each label goes above its bubble, or below, or is left off if both would overlap another
      const placed = [], hit = (b) => placed.some((q) => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h);
      const spots = (on("pmbub") ? it.rows.slice(0, 5) : []).map(([nm, id, v]) => { const f = feats.find((g) => g.id === String(id).padStart(3, "0")); if (!f) return null; const [px, py] = path.centroid(f); return { nm, v, px, py, r: 8 + 20 * Math.sqrt(v / mx) }; }).filter(Boolean);
      for (const b of spots) { c.fillStyle = th.down; c.globalAlpha = 0.9; c.beginPath(); c.arc(b.px, b.py, b.r, 0, 7); c.fill(); c.globalAlpha = 1; c.strokeStyle = "#fff"; c.lineWidth = 2; c.stroke(); placed.push({ x: b.px - b.r, y: b.py - b.r, w: 2 * b.r, h: 2 * b.r }); }
      setF(c, 800, 17);
      for (const b of spots) {
        const lab = `${b.nm.split(" (")[0]}${isPct ? ` ${b.v}%` : ""}`, lw = c.measureText(lab).width + 8;
        for (const ly of [b.py - b.r - 8, b.py + b.r + 22]) {
          const bb = { x: b.px - lw / 2, y: ly - 17, w: lw, h: 22 }; if (hit(bb)) continue;
          placed.push(bb); c.lineWidth = 5; c.strokeStyle = th.bg; c.textAlign = "center"; c.strokeText(lab, b.px, ly); tx(c, lab, b.px, ly, { s: 17, w: 800, col: th.ink, a: "center" }); break;
        }
      }
    } else tx(c, "The world map couldn't load; the list shows the same figures.", W / 2, my0 + mh / 2, { s: 18, w: 500, col: th.muted, a: "center" });
    y = my0 + mh + 34;
    if (nList) caps(c, `Biggest producers · ${it.unit}`, M, y, th.muted, 14);
    const rows = it.rows.slice(0, nList), rmx = (it.rows[0] || [0, 0, 1])[2], rh = Math.min(56, (BOTTOM - y - 20) / Math.max(1, rows.length));
    rows.forEach(([nm, , v], i) => { const ry = y + 20 + i * rh;
      tx(c, String(i + 1), M, ry + 26, { s: 17, w: 700, col: th.muted, f: MONO }); tx(c, nm, M + 34, ry + 26, { s: 19, w: 700, col: th.ink, max: 330 });
      const bx = M + 380, bl = (W - 2 * M - 380 - 150) * v / rmx; rr(c, bx, ry + 12, Math.max(4, bl), 18, 9); c.fillStyle = th.line; c.globalAlpha = 1 - i * 0.07; c.fill(); c.globalAlpha = 1;
      tx(c, fmtV(v), W - M, ry + 28, { s: 19, w: 700, col: th.ink, f: MONO, a: "right" }); });
    if (!nList) { const top = it.rows[0]; tx(c, `Biggest: ${top[0]} · ${/^%/.test(it.unit) ? top[2] + "%" : top[2].toLocaleString()} · world ${it.world}`, W / 2, BOTTOM - 4, { s: 20, w: 700, col: th.ink2, a: "center", max: W - 2 * M }); }
    footer(c, th, `Source: ${it.source} (${it.year}). World: ${it.world}. Figures rounded.`);
  }

  function drawProdField(c, th, D2, Wd, g) {
    const H = S(), items = g.items.map((k) => [k, D2.items[k]]).filter((x) => x[1] && x[1].rows.length);
    const lead = new Map(), name = new Map();  // country id → goods it produces the most of
    for (const [, it] of items) { const [nm, id] = it.rows[0], key = String(id).padStart(3, "0"); if (!lead.has(key)) lead.set(key, []); lead.get(key).push(it.name); name.set(key, nm.split(" (")[0]); }
    const yrs = [...new Set(items.map(([, it]) => (it.year.match(/\d{4}/) || [""])[0]))].sort();
    let y = header(c, th, `Where it's made · ${g.name}`, `${g.name}: who makes what`, on("pmwhy") ? `The biggest producer of each, and the two after it. Countries are shaded by how many of these ${items.length} they lead.` : "");
    const nList = on("pmlist") ? items.length : 0;
    const mx0 = M, my0 = y, mw = W - 2 * M, mh = Math.min(nList ? 560 : 900, BOTTOM - y - (nList ? 34 + 20 + nList * 64 : 10));
    if (Wd && window.d3) {
      const d3 = window.d3, proj = d3.geoNaturalEarth1().fitExtent([[mx0, my0], [mx0 + mw, my0 + mh]], { type: "Sphere" }), path = d3.geoPath(proj, c);
      const feats = Wd.features.filter((f) => f.id !== "010"), mx = Math.max(...[...lead.values()].map((l) => l.length), 1);
      c.beginPath(); path({ type: "Sphere" }); c.fillStyle = th.chip; c.fill();
      for (const f of feats) { const l = lead.get(f.id); c.beginPath(); path(f); c.fillStyle = l ? th.line : th.grid; c.globalAlpha = l ? 0.35 + 0.65 * l.length / mx : 1; c.fill(); c.globalAlpha = 1; c.strokeStyle = th.bg; c.lineWidth = 0.7; c.stroke(); }
      if (on("pmbub")) {
        const placed = [], hit = (b) => placed.some((q) => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h);
        const spots = [...lead].map(([id, l]) => { const f = feats.find((q) => q.id === id); if (!f) return null; const [px, py] = path.centroid(f); return { id, l, px, py, r: 10 + 9 * l.length }; }).filter(Boolean).sort((a, b) => b.l.length - a.l.length);
        for (const b of spots) { c.fillStyle = th.down; c.globalAlpha = 0.9; c.beginPath(); c.arc(b.px, b.py, b.r, 0, 7); c.fill(); c.globalAlpha = 1; c.strokeStyle = "#fff"; c.lineWidth = 2; c.stroke();
          tx(c, String(b.l.length), b.px, b.py + 7, { s: 19, w: 800, col: "#fff", a: "center" }); placed.push({ x: b.px - b.r, y: b.py - b.r, w: 2 * b.r, h: 2 * b.r }); }
        setF(c, 800, 17);
        for (const b of spots) { const lab = name.get(b.id), lw = c.measureText(lab).width + 8;
          for (const ly of [b.py - b.r - 8, b.py + b.r + 22]) { const bb = { x: b.px - lw / 2, y: ly - 17, w: lw, h: 22 }; if (hit(bb)) continue;
            placed.push(bb); c.lineWidth = 5; c.strokeStyle = th.bg; c.textAlign = "center"; c.strokeText(lab, b.px, ly); tx(c, lab, b.px, ly, { s: 17, w: 800, col: th.ink, a: "center" }); break; } }
      }
    } else tx(c, "The world map couldn't load; the list shows the same figures.", W / 2, my0 + mh / 2, { s: 18, w: 500, col: th.muted, a: "center" });
    y = my0 + mh + 34;
    if (nList) {
      caps(c, "Each one's top producers", M, y, th.muted, 14);
      const cw0 = 300, bx = M + cw0, bw = W - 2 * M - cw0, rh = Math.min(92, (BOTTOM - y - 24) / nList), chh = Math.min(56, rh - 14);
      items.forEach(([, it], i) => {
        const ry = y + 22 + i * rh, isPct = /^%/.test(it.unit), top = it.rows.slice(0, 3), mxv = top[0][2], f = (v) => isPct ? `${v}%` : v.toLocaleString();
        // a company list (AI memory) names the company; the rest name the country
        const who = (nm) => it.byCompany && /\((.+)\)/.test(nm) ? nm.match(/\((.+)\)/)[1] : nm.split(" (")[0];
        tx(c, it.name.replace(/ \(.*\)$/, ""), M, ry + chh / 2 + 2, { s: 19, w: 800, col: th.ink, max: cw0 - 16 });
        tx(c, `${it.unit} · ${it.year.replace(/ \(.*\)$/, "")}`, M, ry + chh / 2 + 22, { s: 13, w: 500, col: th.muted, max: cw0 - 16 });
        // the leader, then the next two as chips, each with a small bar showing its size against the leader
        const widths = [bw * 0.44, bw * 0.26, bw * 0.26]; let x = bx;
        top.forEach(([nm, , v], k) => { const ww = widths[k] - 8;
          rr(c, x, ry, ww, chh, 9); c.fillStyle = k === 0 ? th.line : th.card; c.fill(); if (k) { c.strokeStyle = th.grid; c.lineWidth = 1.5; c.stroke(); }
          tx(c, who(nm), x + 12, ry + chh / 2 - 5, { s: 16, w: 800, col: k === 0 ? "#fff" : th.ink, max: ww - 24 });
          tx(c, f(v), x + 12, ry + chh / 2 + 13, { s: 14, w: 600, col: k === 0 ? "#fff" : th.ink2, f: MONO, max: ww - 24 });
          if (k) { const bl = (ww - 24) * v / mxv; rr(c, x + 12, ry + chh - 7, ww - 24, 4, 2); c.fillStyle = th.chip; c.fill(); rr(c, x + 12, ry + chh - 7, Math.max(3, bl), 4, 2); c.fillStyle = th.line; c.fill(); }
          x += widths[k]; });
      });
    }
    footer(c, th, `Latest published figures (${yrs[0]}${yrs.length > 1 ? "–" + yrs[yrs.length - 1] : ""}): USGS, Energy Institute, worldsteel, WNA, TrendForce, ASML, IEA, SIA/BCG. Figures rounded.`);
  }

  // the share a step names, as a number: "~48% of refined copper" → 48, "About two-thirds of refining" → 67
  const WORDS = [[/three[- ]quarters/i, 75], [/two[- ]thirds/i, 67], [/(over |about |roughly )?half/i, 50], [/a third/i, 33], [/a quarter/i, 25], [/a fifth/i, 20]];
  // only a share of something counts ("50% tariffs" is not one); also returns the words after it
  function sharePart(txt) {
    const t = plain(String(txt || "")), m = t.match(/^(~|about |over |roughly |nearly )?(\d+(?:\.\d+)?)\s*%(?=\s*(of\b|\(|,|and\b|$))/i);
    if (m) return { v: +m[2], approx: !!m[1], rest: t.slice(m[0].length).trim() };
    for (const [re, v] of WORDS) { const w = t.match(re); if (w && w.index === 0 || w && /^(about|over|roughly|nearly) $/i.test(t.slice(0, w.index))) return { v, approx: true, rest: t.slice(w.index + w[0].length).trim() }; }
    return null;
  }
  const shareOf = (txt) => { const x = sharePart(txt); return x ? x.v : null; };
  function ring(c, th, cx, cy, R, v, lw = 12) {
    c.lineWidth = lw; c.strokeStyle = th.chip; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.strokeStyle = th.line; c.lineCap = "round"; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * Math.min(1, v / 100)); c.stroke(); c.lineCap = "butt";
  }

  // ---------- 8. Production supply chain ----------
  async function drawProdChain(c, th) {
    const H = S(), D2 = await H.loadProd(); if (!D2) return "Production data hasn't loaded.";
    if (String(Q.item).startsWith("grp:")) return drawChainField(c, th, D2, D2.groups.find((g) => g.name === Q.item.slice(4)) || D2.groups[0]);
    const it = D2.items[Q.item] || D2.items.chips, chain = it.chain || [];
    if (!chain.length) return `No supply chain written for ${it.name} yet.`;
    let y = header(c, th, `Supply chain · ${it.name}`, `${it.name}: the supply chain`, "Each step from raw material to market, and the place it depends on.");
    // the chain, then (when there is room) the biggest producers as bars
    const showTop = on("pctop") && it.rows.length >= 3, topH = showTop ? 50 + Math.min(5, it.rows.length) * 40 + 20 : 0;
    const n = chain.length, ch = Math.min(on("pcwho") ? 170 : 130, (BOTTOM - y - topH - 30 * (n - 1)) / n), gap = n > 1 ? Math.min(60, (BOTTOM - y - topH - n * ch) / (n - 1)) : 0;
    chain.forEach((s, i) => {
      const cy = y + i * (ch + gap); box(c, th, M, cy, W - 2 * M, ch, 16);
      c.fillStyle = th.line; c.beginPath(); c.arc(M + 44, cy + ch / 2, 24, 0, 7); c.fill(); tx(c, String(i + 1), M + 44, cy + ch / 2 + 8, { s: 22, w: 800, col: "#fff", a: "center" });
      caps(c, plain(s.step), M + 90, cy + 36, th.muted, 14);
      tx(c, plain(s.where), M + 90, cy + (on("pcwho") ? 78 : ch / 2 + 26), { s: 32, w: 800, col: th.ink, max: 520 });
      if (on("pcwho")) tx(c, plain(s.who), M + 90, cy + 110, { s: 18, w: 500, col: th.ink2, max: 520 });
      // the share: a ring with the percentage when the step names one, and the words beside it
      const v = shareOf(s.share), R = Math.min(42, ch / 2 - 18), rx = W - M - 26 - R, rcy = cy + ch / 2;
      if (v != null) { ring(c, th, rx, rcy, R, v); tx(c, `${sharePart(s.share).approx ? "~" : ""}${v}%`, rx, rcy + 7, { s: R > 34 ? 20 : 16, w: 800, col: th.ink, a: "center", f: MONO }); }
      const shW = v != null ? 300 : 330, shR = v != null ? rx - R - 18 : W - M - 26;
      setF(c, 800, v != null ? 18 : 22); const sh = lines(c, plain(s.share), shW).slice(0, 3);
      sh.forEach((l, k) => tx(c, l, shR, rcy - (sh.length - 1) * 12 + 7 + k * 24, { s: v != null ? 18 : 22, w: v != null ? 700 : 800, col: v != null ? th.ink2 : th.line, a: "right" }));
      if (i < n - 1) { c.fillStyle = th.muted; c.beginPath(); const ax = M + 44, ay = cy + ch + gap / 2 - 9; c.moveTo(ax - 10, ay); c.lineTo(ax + 10, ay); c.lineTo(ax, ay + 18); c.closePath(); c.fill(); }
    });
    if (showTop) {
      const isPct = /^%/.test(it.unit), rows = it.rows.slice(0, 5), mx = rows[0][2]; let ty = BOTTOM - topH + 38;
      caps(c, `Biggest producers · ${it.unit} · ${it.year}`, M, ty, th.muted, 13);
      rows.forEach(([nm, , v], i) => { const ry = ty + 14 + i * 40; tx(c, nm, M, ry + 26, { s: 18, w: 700, col: th.ink, max: 300 });
        const bl = (W - 2 * M - 320 - 140) * v / mx; rr(c, M + 320, ry + 13, Math.max(4, bl), 16, 8); c.fillStyle = th.line; c.globalAlpha = 1 - i * 0.1; c.fill(); c.globalAlpha = 1;
        tx(c, isPct ? `${v}%` : v.toLocaleString(), W - M, ry + 27, { s: 18, w: 700, col: th.ink, f: MONO, a: "right" }); });
    }
    footer(c, th, `Shares from USGS, Energy Institute, worldsteel, TrendForce, ASML and IEA; year shown with each. Not financial advice.`);
  }

  // a whole field: each good's chain as one row of steps, so the places everything depends on line up
  function drawChainField(c, th, D2, g) {
    const items = g.items.map((k) => D2.items[k]).filter((it) => it && it.chain && it.chain.length);
    if (!items.length) return `No supply chains written for ${g.name} yet.`;
    let y = header(c, th, `Supply chains · ${g.name}`, `${g.name}: every supply chain`, "Each good's steps from raw material to market, and the place each step depends on.");
    const n = items.length, gap = 12, rh = Math.min(200, Math.floor((BOTTOM - y - gap * (n - 1)) / n)), nameW = 196, x0 = M + nameW + 14, aw = 14;
    // how often each country or place comes up across the field's steps
    const where = new Map(); for (const it of items) for (const st of it.chain) for (const w of plain(st.where).split(/,\s*/)) where.set(w, (where.get(w) || 0) + 1);
    items.forEach((it, i) => {
      const ry = y + i * (rh + gap), steps = it.chain, k = steps.length, cw = (W - M - x0 - (k - 1) * aw) / k;
      box(c, th, M, ry, W - 2 * M, rh, 14);
      setF(c, 800, 19); const nl = lines(c, it.name.replace(/ \(.*\)$/, ""), nameW - 24).slice(0, 2);
      nl.forEach((l, j) => tx(c, l, M + 18, ry + rh / 2 - (nl.length - 1) * 12 + 6 + j * 24, { s: 19, w: 800, col: th.ink }));
      steps.forEach((st, j) => {
        const x = x0 + j * (cw + aw), top = ry + 12, h = rh - 24;
        rr(c, x, top, cw, h, 10); c.fillStyle = th.soft; c.fill();
        tx(c, plain(st.step).toUpperCase(), x + 8, top + 20, { s: 11, w: 800, col: th.muted, max: cw - 14 });
        setF(c, 800, 15); const wn = Math.min(2, lines(c, plain(st.where), cw - 16).length);
        wrap(c, plain(st.where), x + 8, top + 40, cw - 16, 18, wn, { s: 15, w: 800, col: th.ink });
        let sy = top + 40 + wn * 18 + 2;
        // the companies, when the row has room for them
        if (on("pcwho") && h - (sy - top) > 92) { setF(c, 500, 12); const wh = Math.min(2, lines(c, plain(st.who), cw - 16).length); wrap(c, plain(st.who), x + 8, sy + 2, cw - 16, 15, wh, { s: 12, w: 500, col: th.ink2 }); sy += wh * 15 + 6; }
        // the share, with a percentage bar when the step names one
        const sp = sharePart(st.share);
        if (sp) {
          // the percentage large, what it is a share of beneath, and a bar along the bottom
          const by = top + h - 15; rr(c, x + 8, by, cw - 16, 7, 3.5); c.fillStyle = th.chip; c.fill(); rr(c, x + 8, by, Math.max(5, (cw - 16) * Math.min(1, sp.v / 100)), 7, 3.5); c.fillStyle = th.line; c.fill();
          const ny = Math.min(sy + 18, by - 9); tx(c, `${sp.approx ? "~" : ""}${sp.v}%`, x + 8, ny, { s: ny < sy + 18 ? 17 : 20, w: 800, col: th.line, f: MONO });
          const room = Math.floor((by - 4 - (sy + 22)) / 14);
          if (sp.rest && room > 0) wrap(c, sp.rest, x + 8, sy + 35, cw - 16, 14, Math.min(2, room), { s: 12, w: 600, col: th.ink2 });
        } else {
          const room = Math.max(1, Math.floor((top + h - 6 - sy) / 16));
          wrap(c, plain(st.share), x + 8, sy + 10, cw - 16, 16, Math.min(3, room), { s: 13, w: 700, col: th.line });
        }
        if (j < k - 1) { c.fillStyle = th.muted; c.beginPath(); const ax = x + cw + 3, ay = ry + rh / 2; c.moveTo(ax, ay - 7); c.lineTo(ax + aw - 6, ay); c.lineTo(ax, ay + 7); c.closePath(); c.fill(); }
      });
    });
    const most = [...where].filter(([w]) => !/^Worldwide$/i.test(w)).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w, cnt], i) => `${w} ${cnt}${i ? "" : " steps"}`).join(", ");
    footer(c, th, `Most named across these chains: ${most}. Figures from the Production page. Not financial advice.`);
  }

  // ---------- 9. AI bubble watch ----------
  async function drawAIWatch(c, th) {
    const H = S(), A = await H.loadAIB(); if (!A) return "AI bubble watch hasn't loaded.";
    let y = header(c, th, `AI bubble watch · updated ${H.fmtDate(A.updated)}`, "What's moving the AI bubble", "The AI labs heading for Wall Street, and the debt behind the AI build-out.");
    caps(c, "What's new", M, y, th.line, 15); y += 22;
    const big = !on("awcw") && !on("awlabs"), fs = big ? 22 : 19, lh = big ? 31 : 26;
    for (const u of A.updates.slice(0, +Q.awn)) {
      if (y > (on("awcw") ? 700 : on("awlabs") ? 900 : 1100)) break;
      rr(c, M, y, 120, 32, 8); c.fillStyle = th.chip; c.fill(); tx(c, H.fmtDate(u.date, { day: "numeric", month: "short" }), M + 60, y + 23, { s: 16, w: 700, col: th.ink, f: MONO, a: "center" });
      y = wrap(c, plain(u.text), M + 140, y + 23, W - 2 * M - 140, lh, big ? 4 : 3, { s: fs, w: 500, col: th.ink2 }) + (big ? 40 : 30);
    }
    const cw = A.coreweave; y += 14;
    if (on("awcw")) {
    caps(c, `CoreWeave · the AI company bond markets are most worried about · ${H.fmtDate(cw.asOf, { day: "numeric", month: "short" })}`, M, y, th.line, 15); y += 20;
    const tiles = [...cw.stats.slice(0, 3)], tw = (W - 2 * M - 3 * 14) / 4, th2 = 190;
    tiles.forEach((s, i) => { const x = M + i * (tw + 14); box(c, th, x, y, tw, th2, 14);
      let ls = 12; setF(c, 800, ls); while (ls > 9 && c.measureText(plain(s.label).toUpperCase()).width + 1.6 * plain(s.label).length > tw - 28) setF(c, 800, --ls); caps(c, plain(s.label), x + 16, y + 30, th.muted, ls);
      let vs = 34; setF(c, 800, vs, MONO); while (vs > 20 && c.measureText(plain(s.value)).width > tw - 28) setF(c, 800, --vs, MONO);
      tx(c, plain(s.value), x + 16, y + 82, { s: vs, w: 800, col: th.ink, f: MONO }); wrap(c, plain(s.note), x + 16, y + 114, tw - 30, 21, 3, { s: 15, w: 500, col: th.ink2 }); });
    { const x = M + 3 * (tw + 14), o = cw.defaultOdds; box(c, th, x, y, tw, th2, 14); const cx = x + tw / 2, cy = y + 78, R = 46;
      c.lineWidth = 16; c.strokeStyle = th.chip; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke(); c.strokeStyle = th.down; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * o.value); c.stroke();
      tx(c, `${Math.round(o.value * 100)}%+`, cx, cy + 9, { s: 24, w: 800, col: th.ink, a: "center", f: MONO }); wrap(c, "chance of default in 5 years, priced by its default swaps", x + 14, y + 150, tw - 26, 18, 2, { s: 13, w: 500, col: th.ink2 }); }
    y += th2 + 34;
    }
    if (on("awlabs")) {
    caps(c, "The private AI labs", M, y, th.line, 15); y += 20;
    const lw = (W - 2 * M - 18) / 2; setF(c, 500, 16); const ln = Math.min(4, Math.max(...A.labs.slice(0, 2).map((l) => lines(c, plain(l.status), lw - 40).length))), lh2 = 92 + ln * 22;
    A.labs.slice(0, 2).forEach((l, i) => { const x = M + i * (lw + 18); box(c, th, x, y, lw, lh2, 14);
      tx(c, l.name, x + 20, y + 40, { s: 24, w: 800, col: th.ink }); tx(c, plain(l.label), x + lw - 20, y + 42, { s: 32, w: 800, col: th.down, f: MONO, a: "right" });
      wrap(c, plain(l.status), x + 20, y + 78, lw - 40, 22, ln, { s: 16, w: 500, col: th.ink2 }); });
    y += lh2 + 40;
    }
    if (on("awwatch") && BOTTOM - y > 80 && A.watch) {
      caps(c, "What to watch", M, y, th.line, 15); y += 18;
      const items = A.watch.slice(0, Math.floor((BOTTOM - y) / 46));
      items.forEach((w, i) => { const ry = y + i * 46; c.fillStyle = th.line; c.beginPath(); c.arc(M + 10, ry + 22, 6, 0, 7); c.fill(); tx(c, plain(w), M + 30, ry + 29, { s: 20, w: 600, col: th.ink, max: W - 2 * M - 30 }); });
    }
    footer(c, th, `Facts dated and sourced on the AI bubble page (${Object.keys(A.sources).length} sources). Reported private values are not official. Not financial advice.`);
  }

  // ---------- 10. Where is the AI bubble? ----------
  async function drawBubble(c, th) {
    const H = S(), [A, P] = await Promise.all([H.loadAIB(), H.loadAllPrices()]); if (!A) return "AI bubble watch hasn't loaded.";
    const L = P.dates.length - 1, kk = +Q.buyr, yr = (tk) => { const x = P.px[tk]; return x && x[L] && x[L - kk] ? x[L] / x[L - kk] - 1 : null; };
    const span = { 63: "past 3 months", 126: "past 6 months", 252: "past year" }[kk];
    let y = header(c, th, `AI bubble · ${H.fmtDate(P.dates[L])}`, "Where is the AI bubble?", "Listed AI companies are priced on fast-growing profits. The private AI labs about to sell shares are priced on hope.");
    // two bubbles
    if (on("bubub")) {
    const by = y + 120; c.setLineDash([8, 7]); c.fillStyle = "rgba(11,122,65,0.10)"; c.strokeStyle = th.up; c.lineWidth = 3; c.beginPath(); c.arc(270, by, 88, 0, 7); c.fill(); c.stroke(); c.setLineDash([]);
    tx(c, "AI stocks", 270, by - 8, { s: 24, w: 800, col: th.ink, a: "center" }); tx(c, "priced on profits", 270, by + 22, { s: 16, w: 600, col: th.ink2, a: "center" });
    c.fillStyle = "rgba(194,47,47,0.12)"; c.strokeStyle = th.down; c.beginPath(); c.arc(720, by, 130, 0, 7); c.fill(); c.stroke();
    tx(c, "Private AI labs", 720, by - 22, { s: 26, w: 800, col: th.ink, a: "center" }); A.labs.slice(0, 2).forEach((l, i) => tx(c, `${l.name} ${plain(l.label)}`, 720, by + 12 + i * 26, { s: 18, w: 700, col: th.ink2, a: "center", max: 236 }));
    tx(c, "the bigger risk", 720, by + 72, { s: 16, w: 800, col: th.down, a: "center" });
    // the labs heading into the stock market
    c.strokeStyle = th.muted; c.lineWidth = 2.5; c.beginPath(); c.moveTo(585, by - 50); c.quadraticCurveTo(470, by - 96, 378, by - 30); c.stroke();
    c.fillStyle = th.muted; c.beginPath(); c.moveTo(372, by - 24); c.lineTo(392, by - 30); c.lineTo(380, by - 46); c.closePath(); c.fill();
    tx(c, "listing soon", 480, by - 92, { s: 15, w: 700, col: th.muted, a: "center" });
    y = by + 160;
    } else y += 10;
    // where the labs would rank
    const big = Object.entries(H.stocks).filter(([t, s]) => s[4] > 5e11 && t !== "GOOG").map(([t, s]) => ({ name: H.coName(t), v: s[4] }));
    const ranked = [...big, ...A.labs.map((l) => ({ name: `${l.name} (private)`, v: l.value, lab: true, label: plain(l.label) }))].sort((a, b) => b.v - a.v).slice(0, +Q.bun), vmx = ranked[0].v;
    caps(c, "America's biggest companies, with the labs at their reported values", M, y, th.muted, 14); y += 16;
    const rh = Math.min(on("bubub") ? 44 : 54, Math.floor((BOTTOM - y - (on("bucmp") ? 190 : 10)) / ranked.length)); ranked.forEach((r, i) => { const ry = y + i * rh;
      if (r.lab) { rr(c, M - 8, ry + 2, W - 2 * M + 16, rh - 4, 8); c.fillStyle = "rgba(194,47,47,0.10)"; c.fill(); }
      tx(c, String(i + 1), M, ry + 25, { s: 15, w: 700, col: th.muted, f: MONO }); tx(c, r.name, M + 34, ry + 25, { s: 18, w: r.lab ? 800 : 600, col: th.ink, max: 290 });
      const bx = M + 340, bl = (W - 2 * M - 340 - 110) * r.v / vmx; rr(c, bx, ry + 11, Math.max(4, bl), 14, 7); c.fillStyle = r.lab ? th.down : th.line; c.fill();
      tx(c, r.label || H.usd(r.v), W - M, ry + 26, { s: 18, w: 700, col: th.ink, f: MONO, a: "right" }); });
    y += ranked.length * rh + 30;
    // the year for listed AI chipmakers and the debt-funded data-centre renters
    const colW = (W - 2 * M - 30) / 2;
    const col = (x, title, list) => { caps(c, title, x, y, th.muted, 13); const rows = list.map(([n, tk]) => [n, yr(tk)]).filter((r) => r[1] != null), mx = Math.max(1, ...rows.map((r) => Math.abs(r[1])));
      rows.slice(0, 4).forEach(([n, r], i) => { const ry = y + 16 + i * 36; tx(c, n, x, ry + 22, { s: 16, w: 600, col: th.ink2, max: 160 });
        const bl = (colW - 260) * Math.abs(r) / mx; rr(c, x + 170, ry + 10, Math.max(4, bl), 13, 6); c.fillStyle = sgn(r, th); c.fill(); tx(c, pc(r, 0), x + colW, ry + 23, { s: 17, w: 700, col: sgn(r, th), f: MONO, a: "right" }); }); };
    if (on("bucmp")) { col(M, `Listed AI chipmakers · ${span}`, A.chipmakers); col(M + colW + 30, `AI data-centre renters · ${span}`, A.neoclouds); }
    footer(c, th, `Company values from Nasdaq; private values as reported (${H.fmtDate(A.labs[0].asOf)}). Prices from Yahoo Finance. Not financial advice.`);
  }

  // ---------- 11. Hype check ----------
  async function drawHype(c, th) {
    const H = S(); await H.loadSignals();
    const days = +Q.hyd, who = Q.hych;
    const recent = H.trades.filter((t) => t.side === "B" && t.fd && t.t && H.stocks[t.t] && !H.isBiz(H.members[t.m]) && (who === "all" || H.members[t.m].chamber === who) && H.today - t.ftime < days * H.DAY).map((t) => ({ t, h: H.hype(t) })).filter((x) => x.h);
    // one buy per person (their weakest or strongest), so the image isn't one account's basket of buys
    const weak = Q.hy === "weak", seen = new Set(), list = [];
    for (const x of recent.filter((x) => weak ? x.h.level === 1 : x.h.level === 3).sort((a, b) => weak ? a.h.score - b.h.score || b.t.amt - a.t.amt : b.h.score - a.h.score || b.t.amt - a.t.amt)) {
      if (on("hyone") && seen.has(x.t.m)) continue; seen.add(x.t.m); list.push(x); if (list.length === +Q.hyn) break;
    }
    const whoName = { all: "Congress and officials", H: "The House", S: "The Senate", E: "Officials" }[who];
    if (!list.length) return `No ${weak ? "weak" : "strong"}-signal buys by ${whoName.toLowerCase()} were disclosed in the last ${days} days.`;
    let y = header(c, th, `${whoName} · buys disclosed in the last ${days} days`, weak ? "Hype check: the weakest 'copy this' buys" : "Hype check: the strongest signals",
      "Every buy is scored out of 100% from about fifteen public facts: its size, basket buying, selling soon after, their committee, how late it was filed and their record.");
    // cards keep a sensible height; room left over shows how to read the score
    const n = list.length, gap = 14, ch = Math.min(150 + 30 * +Q.hyr, Math.floor((BOTTOM - y - gap * (n - 1)) / n));
    const photos = await Promise.all(list.map((x) => loadImg(H.photoSrc(H.members[x.t.m]))));
    list.forEach(({ t, h }, i) => {
      const m = H.members[t.m], cy = y + i * (ch + gap), pr = 40; box(c, th, M, cy, W - 2 * M, ch, 14);
      const px = M + 22 + pr, py = cy + 22 + pr, col = m.party === "D" ? "#2f6fd6" : m.party === "R" ? "#d64545" : "#7a7f87";
      c.save(); c.beginPath(); c.arc(px, py, pr, 0, 7); c.clip();
      if (photos[i]) { const im = photos[i], sc = Math.max(2 * pr / im.width, 2 * pr / im.height); c.drawImage(im, px - im.width * sc / 2, py - pr, im.width * sc, im.height * sc); } else { c.fillStyle = th.chip; c.fill(); }
      c.restore(); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(px, py, pr, 0, 7); c.stroke();
      const x0 = M + 22 + 2 * pr + 22, right = W - M - 22;
      const lab = `${h.label} · ${h.score}%`, bc = h.level === 1 ? th.down : th.up; setF(c, 800, 18); const bwid = c.measureText(lab).width + 30;
      rr(c, right - bwid, cy + 20, bwid, 36, 18); c.fillStyle = bc; c.fill(); tx(c, lab, right - bwid / 2, cy + 44, { s: 18, w: 800, col: "#fff", a: "center" });
      tx(c, m.name, x0, cy + 44, { s: 23, w: 800, col: th.ink, max: right - bwid - 20 - x0 }); tx(c, `${m.party ? m.party + " · " : ""}${H.seat(m)}`, x0, cy + 68, { s: 15, w: 500, col: th.muted, max: right - x0 });
      // the buy
      rr(c, x0, cy + 82, 84, 30, 6); c.fillStyle = th.chip; c.fill(); tx(c, t.t, x0 + 42, cy + 103, { s: 16, w: 700, col: th.ink, f: MONO, a: "center", max: 78 });
      const amt = `${plain(H.rangeText(t))} · filed ${H.fmtDate(t.fd, { day: "numeric", month: "short" })}`; setF(c, 600, 16); const aw = c.measureText(amt).width;
      tx(c, H.coName(t.t), x0 + 96, cy + 103, { s: 17, w: 700, col: th.ink2, max: right - aw - 24 - x0 - 96 }); tx(c, amt, right, cy + 103, { s: 16, w: 600, col: th.ink2, a: "right" });
      // the main reasons
      let ry = cy + 146;
      for (const f of h.f.slice(0, +Q.hyr)) { if (ry > cy + ch - 12) break; c.fillStyle = f.v > 0 ? th.up : th.down; c.fillRect(M + 24, ry - 16, 4, 21);
        tx(c, plain(f.txt), M + 40, ry, { s: 17, w: 500, col: th.ink2, max: W - 2 * M - 64 }); ry += 28; }
    });
    const yEnd = y + n * (ch + gap);
    if (BOTTOM - yEnd > 170) {
      const sy = yEnd + 30, sx = M, sw = W - 2 * M, bands = [[0, 40, th.down, "Weak"], [40, 65, th.muted, "Some"], [65, 100, th.up, "Strong"]];
      caps(c, "How to read the score", sx, sy, th.line, 15);
      bands.forEach(([a, b, col, lab]) => { rr(c, sx + sw * a / 100 + 2, sy + 30, sw * (b - a) / 100 - 4, 22, 6); c.fillStyle = col; c.globalAlpha = 0.85; c.fill(); c.globalAlpha = 1;
        tx(c, `${lab} · ${a}–${b === 100 ? 100 : b - 1}%`, sx + sw * (a + b) / 200, sy + 82, { s: 16, w: 700, col: th.ink2, a: "center" }); });
      list.forEach(({ t, h }) => { const px = sx + sw * h.score / 100; c.fillStyle = th.ink; c.beginPath(); c.moveTo(px, sy + 26); c.lineTo(px - 7, sy + 14); c.lineTo(px + 7, sy + 14); c.closePath(); c.fill(); });
      const ye = wrap(c, "50% is neutral. Facts that make a buy look like a real pick (large for them, bought alone, kept, their committee's industry) add points; ones that make it look routine (a basket of stocks, sold soon after, a fund, filed late) take points away.",
        sx, sy + 124, sw, 26, 3, { s: 18, w: 500, col: th.ink2 });
      if (BOTTOM - ye > 150 && recent.length) {
        const cnt = [1, 2, 3].map((lv) => recent.filter((x) => x.h.level === lv).length), tot = recent.length, by = ye + 60;
        caps(c, `All ${tot.toLocaleString()} buys by ${whoName.toLowerCase()} disclosed in the last ${days} days`, sx, by, th.line, 15);
        let x0 = sx; [[cnt[0], th.down, "Weak"], [cnt[1], th.muted, "Some"], [cnt[2], th.up, "Strong"]].forEach(([k, col, lab]) => { if (!k) return; const w = sw * k / tot;
          rr(c, x0 + 1, by + 22, w - 2, 46, 8); c.fillStyle = col; c.fill(); if (w > 90) tx(c, `${lab} ${Math.round(k / tot * 100)}%`, x0 + w / 2, by + 52, { s: 18, w: 800, col: "#fff", a: "center" }); x0 += w; });
        tx(c, `${cnt[0].toLocaleString()} weak · ${cnt[1].toLocaleString()} some · ${cnt[2].toLocaleString()} strong`, sx, by + 100, { s: 18, w: 600, col: th.ink2 });
      }
    }
    footer(c, th, `From members' disclosure reports, scored by the site's Hype check (Congress trades page). Not financial advice.`);
  }

  // ---------- 12. Who holds it: holdings behind a headline ----------
  async function drawHolders(c, th) {
    const H = S(), [I, P] = await Promise.all([H.loadInvest(), H.loadAllPrices()]), st = ((I && I.stories) || []).find((x) => x.id === Q.hlst) || ((I && I.stories) || [])[0];
    if (!st) return "No stories yet.";
    const R = H.storyHoldings(st, P), n = R.rows.length;
    let y = header(c, th, `In the news · ${H.fmtDate(st.date)}`, st.title, "", { ts: 46 });
    y = wrap(c, plain(st.news), M, y + 6, W - 2 * M, 28, n <= 3 ? 5 : 4, { s: 20, w: 500, col: th.ink2 }) + 34;
    // the four headline figures
    const k4 = [["Trump still holds", R.trump ? "≈" + H.usd(R.trump) : "–", th.ink], ["Return on his buys", pc(R.tRet), sgn(R.tRet, th)], ["Congress still holds", R.cong ? "≈" + H.usd(R.cong) : "–", th.ink], ["Members holding", String(R.members), th.ink]];
    const tw = (W - 2 * M - 3 * 14) / 4;
    k4.forEach(([l, v, col], i) => { const x = M + i * (tw + 14); box(c, th, x, y, tw, 112, 14); caps(c, l, x + 16, y + 32, th.muted, 12); tx(c, v, x + 16, y + 84, { s: 34, w: 800, col, f: MONO, max: tw - 28 }); });
    y += 140;
    // one card per company
    const photo = await loadImg(R.trumpM ? H.photoSrc(R.trumpM) : ""), gap = 14, ch = Math.min(n <= 3 ? 250 : 200, Math.floor((BOTTOM - y - gap * (n - 1)) / n));
    R.rows.forEach((r, i) => {
      const cy = y + i * (ch + gap); box(c, th, M, cy, W - 2 * M, ch, 14);
      rr(c, M + 18, cy + 18, 92, 36, 8); c.fillStyle = th.chip; c.fill(); tx(c, r.tk, M + 64, cy + 43, { s: 19, w: 800, col: th.ink, f: MONO, a: "center", max: 86 });
      tx(c, H.coName(r.tk), M + 124, cy + 44, { s: 22, w: 800, col: th.ink, max: 400 });
      if (on("hlsince")) tx(c, `${pc(r.since)} since the news`, W - M - 20, cy + 44, { s: 18, w: 700, col: sgn(r.since, th), a: "right" });
      // Trump's position
      const ry = cy + 74, px = M + 46;
      c.save(); c.beginPath(); c.arc(px, ry + 24, 24, 0, 7); c.clip(); if (photo) { const sc = Math.max(48 / photo.width, 48 / photo.height); c.drawImage(photo, px - photo.width * sc / 2, ry, photo.width * sc, photo.height * sc); } else { c.fillStyle = th.chip; c.fill(); } c.restore();
      c.strokeStyle = "#d64545"; c.lineWidth = 2.5; c.beginPath(); c.arc(px, ry + 24, 24, 0, 7); c.stroke();
      caps(c, "Trump holds", M + 82, ry + 14, th.muted, 12);
      tx(c, r.trump ? "≈" + H.usd(r.trump) : "–", M + 82, ry + 44, { s: 26, w: 800, col: th.ink, f: MONO });
      tx(c, `${pc(r.tRet)} on his buys`, M + 82, ry + 68, { s: 15, w: 700, col: sgn(r.tRet, th) });
      // Congress
      const cx = M + 360; caps(c, "Congress holds", cx, ry + 14, th.muted, 12);
      tx(c, r.cong ? "≈" + H.usd(r.cong) : "none", cx, ry + 44, { s: 26, w: 800, col: th.ink, f: MONO });
      tx(c, `${r.n} member${r.n === 1 ? "" : "s"}`, cx, ry + 68, { s: 15, w: 600, col: th.ink2 });
      // the biggest holders
      if (on("hltop") && r.top.length) { const hx = M + 620; caps(c, "Biggest holders", hx, ry + 14, th.muted, 12);
        r.top.slice(0, ch >= 240 ? 3 : 2).forEach((x, j) => { const yy = ry + 24 + j * 30; c.fillStyle = x.m.party === "D" ? "#2f6fd6" : x.m.party === "R" ? "#d64545" : "#7a7f87"; c.beginPath(); c.arc(hx + 6, yy + 12, 6, 0, 7); c.fill();
          tx(c, H.surname(x.m.name), hx + 20, yy + 18, { s: 17, w: 700, col: th.ink, max: 170 }); tx(c, "≈" + H.usd(x.v), W - M - 20, yy + 18, { s: 17, w: 700, col: th.ink2, f: MONO, a: "right" }); }); }
      // committee links along the bottom of the card
      const cl = on("hlcom") ? r.links.filter((l) => l.short).slice(0, 2) : [];
      if (cl.length && ch >= 190) { const ly = cy + ch - 20; c.fillStyle = th.grid; c.fillRect(M + 18, ly - 24, W - 2 * M - 36, 1);
        let lx = M + 20; caps(c, "Committee", lx, ly, th.muted, 12); lx += 106;
        // a link that won't fit on the line is left off
        cl.forEach((l) => { const nm = `${H.surname(l.m.name)} · ${l.c[0].replace(/ Committee$/, "").replace("Health, Education, Labor and Pensions", "Health (HELP)")}: `;
          setF(c, 700, 15); const w1 = c.measureText(nm).width; setF(c, 600, 15); const w2 = c.measureText(l.short).width; if (lx + 20 + w1 + w2 > W - M - 20) { lx = W; return; }
          c.fillStyle = l.m.party === "D" ? "#2f6fd6" : l.m.party === "R" ? "#d64545" : "#7a7f87"; c.beginPath(); c.arc(lx + 6, ly - 5, 6, 0, 7); c.fill();
          tx(c, nm, lx + 20, ly, { s: 15, w: 700, col: th.ink }); tx(c, l.short, lx + 20 + w1, ly, { s: 15, w: 600, col: th.ink2 }); lx += 20 + w1 + w2 + 34; }); }
    });
    footer(c, th, `Holdings estimated from filings since ${H.fmtDate(H.D.start, { month: "short", year: "numeric" })}; shares held before, or from spin-offs, aren't counted. Not financial advice.`);
  }

  // ---------- Stock breakdown: one company, as a picture (markets only) ----------
  const loadDesc = () => window.CTC_DESC ? Promise.resolve(window.CTC_DESC) : new Promise((res) => {
    const el = document.createElement("script"); el.src = "descriptions.js?v=1"; el.onload = () => res(window.CTC_DESC || {}); el.onerror = () => res({}); document.head.appendChild(el); });
  // EPS, revenue, net profit and debt-to-equity (fundamentals.js, refreshed weekly by the GitHub workflow)
  const loadFund = () => window.CTC_FUND ? Promise.resolve(window.CTC_FUND) : new Promise((res) => {
    const el = document.createElement("script"); el.src = `fundamentals.js?d=${S().D.prices_through}`; el.onload = () => res(window.CTC_FUND || { d: {} }); el.onerror = () => res({ d: {} }); document.head.appendChild(el); });
  async function drawStock(c, th) {
    const H = S(), [P, DESC, FUND] = await Promise.all([H.loadAllPrices(), loadDesc(), loadFund()]), tk = Q.stk, x = P.px[tk];
    if (!x) return "No prices for this company yet.";
    const li = H.lastIdx(x), spy = P.px.SPY, at = (arr, i) => { for (let j = i; j >= 0; j--) if (arr[j] != null) return arr[j]; return null; };
    const back = (n) => { const i = Math.max(0, li - n), a = at(x, i), b = x[li]; return a && b ? b / a - 1 : null; };
    const spyBack = (n) => { const i = Math.max(0, li - n), a = at(spy, i), b = at(spy, li); return a && b ? b / a - 1 : null; };
    const n = Q.stp === "all" ? li : Math.min(li, +Q.stp), i0 = li - n, name = H.coName(tk), sector = H.sectorOf(tk), sub = H.subOf(tk);
    const periodName = { 126: "6 months", 252: "1 year", 504: "2 years" }[Q.stp] || "since 2023";
    const desc = plain((DESC || {})[tk] || "");
    let y = header(c, th, [sector, sub].filter((v) => v && v !== "Other").join(" › ") || "Stock", `${name} (${tk})`, desc, { ts: name.length > 26 ? 46 : 54 });

    // four headline figures
    const mcap = H.mcapOf(tk), today = back(1), pr = back(n), k4 = [["Last close", "$" + (x[li] >= 1000 ? Math.round(x[li]).toLocaleString() : x[li].toFixed(2)), th.ink, H.fmtDate(P.dates[li], { day: "numeric", month: "short" })],
      ["Today", pc(today, 2), sgn(today, th), "at the close"], ["Company value", mcap ? H.usd(mcap) : "–", th.ink, "market value"], [`Over ${periodName}`, pc(pr), sgn(pr, th), `S&P 500 ${pc(spyBack(n))}`]];
    const tw = (W - 2 * M - 3 * 14) / 4;
    k4.forEach(([l, v, col, s2], i) => { const bx = M + i * (tw + 14); box(c, th, bx, y, tw, 118, 14); caps(c, l, bx + 16, y + 30, th.muted, 12);
      tx(c, v, bx + 16, y + 76, { s: 34, w: 800, col, f: MONO, max: tw - 28 }); tx(c, s2, bx + 16, y + 102, { s: 14, w: 600, col: th.muted, max: tw - 28 }); });
    y += 146;

    // the price chart, with the S&P 500 drawn from the same starting price, and the period's high and low
    const ch = on("stpeer") ? 236 : 300, cx0 = M, cw = W - 2 * M - 92, vals = x.slice(i0, li + 1), sp = spy.slice(i0, li + 1), s0 = at(spy, i0), p0 = at(x, i0);
    const spR = on("stcmp") && s0 ? sp.map((v) => (v != null ? v / s0 * p0 : null)) : [];
    const all = vals.concat(spR).filter((v) => v != null), lo = Math.min(...all), hi = Math.max(...all), pad = (hi - lo) * 0.08;
    const X = (i) => cx0 + i / Math.max(1, vals.length - 1) * cw, Y = (v) => y + 26 + ch - (v - lo + pad) / (hi - lo + 2 * pad) * ch;
    caps(c, `Share price · ${periodName}`, M, y, th.muted, 13);
    if (spR.length) { c.strokeStyle = th.muted; c.lineWidth = 2; c.setLineDash([7, 6]); c.beginPath(); c.moveTo(W - M - 330, y - 5); c.lineTo(W - M - 296, y - 5); c.stroke(); c.setLineDash([]);
      tx(c, "S&P 500, same start", W - M - 288, y, { s: 14, w: 600, col: th.muted }); }
    for (let g = 0; g <= 3; g++) { const v = lo - pad + (hi - lo + 2 * pad) * g / 3, gy = Y(v); c.fillStyle = th.grid; c.fillRect(cx0, gy, cw, 1.5);
      tx(c, "$" + (v >= 1000 ? Math.round(v).toLocaleString() : v >= 100 ? v.toFixed(0) : v.toFixed(2)), cx0 + cw + 10, gy + 5, { s: 13, w: 600, col: th.muted, f: MONO }); }
    const pts = vals.map((v, i) => [i, v]).filter((q) => q[1] != null);
    c.beginPath(); pts.forEach(([i, v], k) => (k ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.lineTo(X(pts[pts.length - 1][0]), y + 26 + ch); c.lineTo(X(pts[0][0]), y + 26 + ch); c.closePath(); c.fillStyle = th.soft; c.fill();
    if (spR.length) { c.beginPath(); let st = false; spR.forEach((v, i) => { if (v == null) return; st ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)); st = true; }); c.strokeStyle = th.muted; c.lineWidth = 2; c.setLineDash([7, 6]); c.stroke(); c.setLineDash([]); }
    c.beginPath(); pts.forEach(([i, v], k) => (k ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.strokeStyle = th.line; c.lineWidth = 3.5; c.lineJoin = "round"; c.stroke();
    const hiI = pts.reduce((a, q) => (q[1] > a[1] ? q : a)), loI = pts.reduce((a, q) => (q[1] < a[1] ? q : a));
    for (const [[i, v], lab, up] of [[hiI, "High", true], [loI, "Low", false]]) {
      c.fillStyle = up ? th.up : th.down; c.beginPath(); c.arc(X(i), Y(v), 6, 0, 7); c.fill();
      const t = `${lab} $${v >= 100 ? v.toFixed(0) : v.toFixed(2)} · ${H.fmtDate(P.dates[i0 + i], { day: "numeric", month: "short", year: "2-digit" })}`;
      setF(c, 700, 14); const tw2 = c.measureText(t).width, lx = Math.min(Math.max(X(i) - tw2 / 2, cx0), cx0 + cw - tw2);
      // below the low when there's room above the date labels, else above it
      const ly = up ? Y(v) - 14 : Y(v) + 26 <= y + 26 + ch - 4 ? Y(v) + 26 : Y(v) - 14;
      rr(c, lx - 4, ly - 15, tw2 + 8, 20, 5); c.fillStyle = th.bg; c.fill();
      tx(c, t, lx, ly, { s: 14, w: 700, col: up ? th.up : th.down });
    }
    let lastM = ""; for (let i = 0; i < vals.length; i++) { const d = P.dates[i0 + i], m = d.slice(0, 7); if (m !== lastM && i > 4 && (n > 300 ? /-(01|04|07|10)$/.test(m) : true)) tx(c, H.fmtDate(d, n > 300 ? { month: "short", year: "2-digit" } : { month: "short" }), X(i), y + 26 + ch + 22, { s: 13, w: 500, col: th.muted, a: "center" }); lastM = m; }
    y += 26 + ch + 50;

    // returns against the S&P 500 (left) and the 52-week range and risk (right)
    const colW = (W - 2 * M - 40) / 2, rx = M + colW + 40;
    if (on("stret") || on("strisk")) {
      const ytdI = P.dates.findIndex((d) => d.slice(0, 4) === P.dates[li].slice(0, 4)), periods = [["1 week", 5], ["1 month", 21], ["3 months", 63], ["6 months", 126], ["This year", li - ytdI + 1], ["1 year", 252]];
      let leftEnd = y, rightEnd = y;
      if (on("stret")) {
        caps(c, "Returns against the S&P 500", M, y, th.muted, 13);
        const rows = periods.map(([l, d]) => [l, back(d), spyBack(d)]), mx = Math.max(...rows.flatMap((r) => [Math.abs(r[1] || 0), Math.abs(r[2] || 0)]), 0.01), half = (colW - 190) / 2, mid = M + 96 + half;
        rows.forEach(([l, a, b], i) => { const ry = y + 18 + i * 36;
          tx(c, l, M, ry + 22, { s: 15, w: 600, col: th.ink2 }); c.fillStyle = th.grid; c.fillRect(mid - 1, ry + 4, 2, 30);
          const la = half * Math.abs(a || 0) / mx, lb = half * Math.abs(b || 0) / mx;
          rr(c, (a || 0) >= 0 ? mid : mid - la, ry + 6, Math.max(3, la), 14, 4); c.fillStyle = sgn(a, th); c.fill();
          rr(c, (b || 0) >= 0 ? mid : mid - lb, ry + 23, Math.max(3, lb), 7, 3); c.fillStyle = th.muted; c.fill();
          tx(c, pc(a), M + colW, ry + 20, { s: 16, w: 800, col: sgn(a, th), f: MONO, a: "right" }); tx(c, pc(b), M + colW, ry + 36, { s: 12, w: 600, col: th.muted, f: MONO, a: "right" }); });
        tx(c, `thick bar ${tk} · thin bar S&P 500`, M, y + 18 + periods.length * 36 + 12, { s: 13, w: 500, col: th.muted });
        leftEnd = y + 18 + periods.length * 36 + 20;
      }
      if (on("strisk")) {
        const bx = on("stret") ? rx : M, bw = on("stret") ? colW : W - 2 * M;
        caps(c, "52-week range", bx, y, th.muted, 13);
        const w52 = x.slice(Math.max(0, li - 251), li + 1).filter((v) => v != null), h52 = Math.max(...w52), l52 = Math.min(...w52), posn = (x[li] - l52) / Math.max(1e-9, h52 - l52);
        rr(c, bx, y + 22, bw, 14, 7); c.fillStyle = th.chip; c.fill(); rr(c, bx, y + 22, Math.max(14, bw * posn), 14, 7); c.fillStyle = th.line; c.fill();
        c.fillStyle = th.ink; c.beginPath(); c.arc(bx + bw * posn, y + 29, 9, 0, 7); c.fill();
        tx(c, `$${l52 >= 100 ? l52.toFixed(0) : l52.toFixed(2)} low`, bx, y + 62, { s: 14, w: 600, col: th.muted }); tx(c, `high $${h52 >= 100 ? h52.toFixed(0) : h52.toFixed(2)}`, bx + bw, y + 62, { s: 14, w: 600, col: th.muted, a: "right" });
        tx(c, x[li] >= h52 * 0.999 ? "at its 52-week high" : `${pc(x[li] / h52 - 1)} below its high`, bx + bw / 2, y + 62, { s: 14, w: 700, col: th.ink, a: "center" });
        // the company's figures from its latest quarter, against the same quarter a year earlier; the P/E uses
        // the last twelve months' EPS (a single quarter's would make it look four times too high)
        const f = ((FUND && FUND.d) || {})[tk] || [], [, eps12, rev12, ni12, de, cur = "USD", mrq, qEnd, qRev, qNi, qEps, yRev, yNi, yEps] = f;
        const hasQ = qRev != null || qNi != null, rev = hasQ ? qRev : rev12, ni = hasQ ? qNi : ni12, epsQ = hasQ ? qEps : eps12, span = hasQ ? "quarter" : "12 months";
        const money = (v, c2 = cur) => v == null ? "–" : (v < 0 ? "−" : "") + (c2 === "USD" ? H.usd(Math.abs(v)) : `${c2} ${H.usd(Math.abs(v)).replace("$", "")}`);
        const perShare = (v) => v == null ? "–" : (v < 0 ? "−" : "") + (cur === "USD" || !hasQ ? `$${Math.abs(v).toFixed(2)}` : `${cur} ${Math.abs(v).toFixed(2)}`);
        const growth = (a, b) => a != null && b ? (a - b) / Math.abs(b) : null, vsYear = (g) => g == null ? "" : `${g >= 0 ? "+" : "−"}${Math.abs(g * 100).toFixed(0)}% vs same quarter last year`;
        const pe = eps12 > 0 ? x[li] / eps12 : null, margin = rev && ni != null ? ni / rev : null, end = qEnd || mrq;
        const tiles = [[`EPS · latest ${span}`, perShare(epsQ), epsQ < 0 ? th.down : th.ink, hasQ ? vsYear(growth(qEps, yEps)) || "per share" : "per share"],
          ["P/E ratio", pe ? `${pe >= 100 ? pe.toFixed(0) : pe.toFixed(1)}×` : "n/a", th.ink, pe ? "price ÷ 12-month EPS" : eps12 != null ? "no profit" : "no figures"],
          [`Revenue · latest ${span}`, money(rev), th.ink, hasQ ? vsYear(growth(qRev, yRev)) : ""],
          [`Net profit · latest ${span}`, money(ni), ni < 0 ? th.down : th.ink, margin != null && Math.abs(margin) < 5 ? `${(margin * 100).toFixed(0)}% of revenue` : ni < 0 ? "a loss" : ""],
          ["Debt-to-equity", de == null ? "–" : `${de.toFixed(2)}×`, de > 2 ? th.down : th.ink, de == null ? "not reported" : "debt ÷ equity"],
          ["Quarter ended", end ? H.fmtDate(end, { day: "numeric", month: "short" }) : "–", th.ink, end ? end.slice(0, 4) : ""]];
        const tcols = bw > 600 ? 3 : 2, tw3 = (bw - (tcols - 1) * 10) / tcols, th3 = 78;
        tiles.forEach(([l, v, col, s3], i) => { const tx0 = bx + (i % tcols) * (tw3 + 10), ty0 = y + 84 + Math.floor(i / tcols) * (th3 + 10);
          box(c, th, tx0, ty0, tw3, th3, 10); tx(c, l, tx0 + 12, ty0 + 20, { s: 12, w: 700, col: th.muted, max: tw3 - 24 });
          tx(c, v, tx0 + 12, ty0 + 47, { s: 22, w: 800, col, f: MONO, max: tw3 - 24 }); if (s3) tx(c, s3, tx0 + 12, ty0 + 68, { s: 12, w: 600, col: /^\+/.test(s3) ? th.up : /^−/.test(s3) ? th.down : th.muted, max: tw3 - 24 }); });
        rightEnd = y + 84 + Math.ceil(tiles.length / tcols) * (th3 + 10);
      }
      y = Math.max(leftEnd, rightEnd) + 26;
    }

    // month by month over the chart's period, as coloured squares (12 to a row)
    if (on("stmon") && BOTTOM - y > 110) {
      const ends = []; for (let i = li; i > 0; i--) if (i === li || P.dates[i].slice(0, 7) !== P.dates[i + 1].slice(0, 7)) { ends.push(i); if (i < i0) break; }
      if (ends[ends.length - 1] >= i0) ends.push(i0);   // the period starts with the data: measure its first month from there
      let months = []; for (let k = ends.length - 1; k > 0; k--) { const a = at(x, ends[k]), b = at(x, ends[k - 1]); months.push([P.dates[ends[k - 1]], a && b ? b / a - 1 : null]); }
      const want = { 126: 6, 252: 12, 504: 24 }[Q.stp]; if (want) months = months.slice(-want);   // a part-month at the start would make one too many
      // up to 12 to a row; fewer months make wider squares, so the row always spans the page
      const per = Math.min(12, months.length), rows = Math.ceil(months.length / 12), sh = rows > 1 ? 46 : 58, sq = (W - 2 * M - (per - 1) * 8) / per, multiYear = months.length > 12;
      caps(c, `Month by month · ${periodName}`, M, y, th.muted, 13);
      months.forEach(([d, r], i) => { const sx = M + (i % per) * (sq + 8), sy = y + 14 + Math.floor(i / per) * (sh + 8); rr(c, sx, sy, sq, sh, 8); c.fillStyle = heat(r, 0.12); c.fill();
        const lab = H.fmtDate(d, multiYear && (i === 0 || d.slice(5, 7) === "01") ? { month: "short", year: "2-digit" } : { month: "short" }) + (d === P.dates[li] ? " so far" : "");
        tx(c, pc(r, 0), sx + sq / 2, sy + sh / 2 + (rows > 1 ? 1 : 3), { s: rows > 1 ? 14 : per <= 6 ? 20 : 15, w: 800, col: "#fff", a: "center", f: MONO });
        tx(c, lab, sx + sq / 2, sy + sh - (rows > 1 ? 7 : 9), { s: rows > 1 ? 10 : 11, w: 600, col: "rgba(255,255,255,.9)", a: "center", max: sq - 4 }); });
      y += 14 + rows * (sh + 8) + 22;
    }

    // against its rivals: the biggest companies in the same sub-industry (or sector), over the chart period
    if (on("stpeer") && BOTTOM - y > 100) {
      let peers = Object.keys(H.stocks).filter((t) => t !== tk && P.px[t] && H.subOf(t) === sub && H.mcapOf(t) > 0);
      if (peers.length < 3) peers = Object.keys(H.stocks).filter((t) => t !== tk && P.px[t] && H.stocks[t][5] && H.sectorOf(t) === sector);
      const room = Math.max(2, Math.min(6, Math.floor((BOTTOM - y - 24) / 34) - 1));
      const list = peers.sort((a, b) => H.mcapOf(b) - H.mcapOf(a)).slice(0, room).concat([tk]).map((t) => { const p2 = P.px[t], l2 = H.lastIdx(p2), a = at(p2, Math.max(0, l2 - n)); return [t, a && p2[l2] ? p2[l2] / a - 1 : null]; })
        .filter((r) => r[1] != null).sort((a, b) => b[1] - a[1]);
      if (list.length > 1) {
        caps(c, `Against its rivals · ${periodName} · ${peers.length && H.subOf(peers[0]) === sub ? sub : sector}`, M, y, th.muted, 13);
        const mx = Math.max(...list.map((r) => Math.abs(r[1])), 0.01), bw = W - 2 * M - 420, neg = list.some((r) => r[1] < 0), pos2 = list.some((r) => r[1] > 0);
        const mid = M + 300 + (neg && pos2 ? bw / 2 : neg ? bw : 0), scale = neg && pos2 ? bw / 2 : bw;
        list.forEach(([t, r], i) => { const ry = y + 16 + i * 34, me = t === tk;
          if (me) { rr(c, M - 8, ry - 2, W - 2 * M + 16, 32, 8); c.fillStyle = th.soft; c.fill(); }
          tx(c, t, M, ry + 21, { s: 16, w: 800, col: th.ink, f: MONO }); tx(c, H.coName(t), M + 80, ry + 21, { s: 15, w: me ? 800 : 500, col: me ? th.ink : th.ink2, max: 210 });
          const bl = scale * Math.abs(r) / mx; rr(c, r >= 0 ? mid : mid - bl, ry + 8, Math.max(4, bl), 14, 7); c.fillStyle = me ? th.line : sgn(r, th); c.fill();
          tx(c, pc(r, 0), W - M, ry + 21, { s: 16, w: 800, col: sgn(r, th), f: MONO, a: "right" }); });
      }
    }
    footer(c, th, `Prices and company figures from Yahoo Finance (latest quarter; P/E on 12-month EPS${FUND && FUND.asof ? `; checked ${H.fmtDate(FUND.asof, { day: "numeric", month: "short" })}` : ""}). Not financial advice.`);
  }

  // ---------- Why it moved: one move told as a picture (today, this week, or any drop or rise) ----------
  const dropDates = (H, e) => e.start === e.end ? H.fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" })
    : `${H.fmtDate(e.start, { day: "numeric", month: "short" })} – ${H.fmtDate(e.end, { day: "numeric", month: "short", year: "numeric" })}`;
  // what's being described: the market, a news industry, an industry list or a sector; its stocks and its own data
  function storySource(H, P, Mv, key) {
    if (key === "all") return { isAll: true, name: "The S&P 500", tickers: null, data: Mv && Mv.market };
    if (Mv && Mv.themes && Mv.themes[key]) return { name: Mv.themes[key].name, tickers: Mv.themes[key].tickers, data: Mv.themes[key] };
    if (key.startsWith("L:") && H.INDUSTRIES[key.slice(2)]) return { name: H.INDUSTRIES[key.slice(2)][0], tickers: H.listTks(P, key.slice(2)), data: null };
    if (key.startsWith("S:")) { const g = key.slice(2); return { name: g, tickers: Object.keys(P.px).filter((t) => H.stocks[t] && H.stocks[t][5] && H.sectorOf(t) === g), data: null }; }
    return null;
  }
  // a move worked out from the prices alone (for lists and sectors, which have no news file)
  function priceMove(H, P, tickers, days) {
    const D = P.dates, L = D.length - 1, a = L - days, mv = (t, i, j) => { const x = P.px[t]; return x && x[i] && x[j] ? x[j] / x[i] - 1 : null; };
    const rs = tickers.map((t) => [t, mv(t, a, L)]).filter((r) => r[1] != null), avg = rs.reduce((s2, r) => s2 + r[1], 0) / (rs.length || 1);
    const month = tickers.map((t) => mv(t, L - 21, L)).filter((r) => r != null);
    return { start: D[a + 1], end: D[L], move: avg, spy: mv("SPY", a, L), month: month.reduce((s2, r) => s2 + r, 0) / (month.length || 1),
      most: rs.sort((x2, y2) => Math.abs(y2[1]) - Math.abs(x2[1])).slice(0, 4), what: [] };
  }
  async function drawStory(c, th, w) {
    const H = S(), [P, Mv] = await Promise.all([H.loadAllPrices(), H.loadMoves()]), src = storySource(H, P, Mv, Q.sti);
    if (!src) return "Pick a market, industry or sector.";
    const e = src.data ? src.data[w] : priceMove(H, P, src.tickers, w === "today" ? 1 : 5);
    if (!e) return "This story hasn't loaded yet.";
    return drawMove(c, th, H, P, src, { ...e, what: e.what || [] }, { label: w === "today" ? "on the day" : "over five trading days", week: w !== "today", hasNews: !!src.data });
  }
  async function drawDrop(c, th) {
    const H = S(), [P, Mv] = await Promise.all([H.loadAllPrices(), H.loadMoves()]);
    const [key, i] = (Q.dpsel || "").split("|"), src = key ? storySource(H, P, Mv, key) : null;
    if (!src) return "Pick a drop or rise from the list.";
    const raw = key === "all" ? (Mv.episodes || [])[+i] : (src.data.events || [])[+i];
    if (!raw) return "That move isn't in the data any more. Pick another.";
    // a market drop has the S&P's move and its biggest fallers; an industry move has its basket's
    const e = key === "all" ? { ...raw, move: raw.spy, most: raw.big || [], dir: "down", compare: [["S&P 500", raw.spy], ["Nasdaq 100", raw.qqq], ["Dow", raw.dia]].filter((r) => r[1] != null) }
      : { ...raw, compare: [[src.name, raw.move], ["S&P 500", raw.spy]] };
    const days = P.dates.indexOf(e.end) - P.dates.indexOf(e.start) + 1;
    return drawMove(c, th, H, P, src, { ...e, what: raw.why && raw.why.length ? raw.why : raw.what || [] }, { label: days > 1 ? `over ${days} trading days` : "on the day", drop: true, hasNews: true });
  }
  // the picture itself
  function drawMove(c, th, H, P, src, e, o) {
    const D = P.dates, ia = D.indexOf(e.start), ib = D.indexOf(e.end), a0 = ia - 1, L = D.length - 1, isAll = !!src.isAll, name = src.name;
    if (ia < 1 || ib < 0) return "No prices for these days yet.";
    const spy = P.px.SPY, up = e.move >= 0;
    let x = spy;   // the basket day by day (equal weight of its stocks' daily moves), as the Market drops page works it out
    if (!isAll) { const tks = src.tickers.filter((t) => P.px[t]); x = [1]; for (let i = 1; i <= L; i++) { const rs = tks.map((t) => P.px[t][i] && P.px[t][i - 1] ? P.px[t][i] / P.px[t][i - 1] - 1 : null).filter((r) => r != null); x.push(x[i - 1] * (1 + (rs.length ? rs.reduce((a, r) => a + r, 0) / rs.length : 0))); } }
    const mv = (tk, a, b) => { const p2 = P.px[tk]; return p2 && p2[a] && p2[b] ? p2[b] / p2[a] - 1 : null; };
    const pu = (r, d = 1) => pc(Math.abs(r), d).replace(/^[+−-]/, "");
    const nm = (tk) => H.coName(tk).replace(/\s+(American Depositary|Sponsored|ADR|ADS|Depositary|Holding SA|S\.?A\.?|SA|N\.V\.|PLC|Ltd)\b.*$/i, "").replace(/\s+\(.*$/, "").trim();
    const when = dropDates(H, e), span = e.start === e.end ? `on ${H.fmtDate(e.end, { day: "numeric", month: "short" })}` : `from ${H.fmtDate(e.start, { day: "numeric", month: "short" })} to ${H.fmtDate(e.end, { day: "numeric", month: "short" })}`;
    const top3 = (e.most || []).slice(0, 3).map(([tk, r]) => `${nm(tk)} (${pc(r, 0)})`).join(", ");
    const what = isAll ? `The S&P 500 ${up ? "rose" : "fell"} ${pu(e.move)} ${span}.${top3 ? ` Among companies worth $50 billion or more, ${top3} moved most.` : ""}`
      : `${name} ${up ? "rose" : "fell"} ${pu(e.move)} ${span}, while the S&P 500 ${e.spy >= 0 ? "rose" : "fell"} ${pu(e.spy)}.${top3 ? ` ${top3} moved most.` : ""}`;
    const kick = `${isAll ? "The market" : name} · ${o.drop ? (up ? "sharp rise" : "market drop") : o.week ? "this week" : "the day"} · ${when}`;
    let y = header(c, th, kick, `${name} ${up ? "rose" : "fell"} ${pu(e.move)}${o.week ? " this week" : ""}`, what, { ts: 52 });

    // the move, against the S&P 500 (and the Nasdaq and Dow, or the past month), and what happened after
    const hh = 150; box(c, th, M, y, W - 2 * M, hh, 18);
    rr(c, M, y, 12, hh, 6); c.fillStyle = sgn(e.move, th); c.fill();
    tx(c, `${up ? "▲" : "▼"} ${pu(e.move)}`, M + 36, y + 96, { s: 76, w: 800, col: sgn(e.move, th), f: MONO });
    caps(c, o.label, M + 40, y + 128, th.muted, 12);
    const rows3 = (e.compare || [[name, e.move], ...(isAll ? [] : [["S&P 500", e.spy]]), ["Past month", e.month]]).filter((r) => r[1] != null), cmx = Math.max(...rows3.map((r) => Math.abs(r[1])), 0.005), bx0 = M + 470, bw0 = W - M - 110 - bx0 - 160;
    rows3.forEach(([n2, r], i) => { const ry = y + 34 + i * 36 + (rows3.length === 2 ? 18 : 0); tx(c, n2, bx0, ry + 16, { s: 17, w: 700, col: th.ink2, max: 150 });
      const len = bw0 * Math.abs(r) / cmx; rr(c, bx0 + 160, ry + 3, Math.max(5, len), 16, 8); c.fillStyle = sgn(r, th); c.fill();
      tx(c, pc(r, 1), W - M - 24, ry + 17, { s: 19, w: 800, col: sgn(r, th), f: MONO, a: "right" }); });
    y += hh + 16;
    if (o.drop && on("dpafter")) {
      // after the move: back above where it started (and when), or how far off it still is
      let rec = null; for (let i = ib + 1; i <= L; i++) if (up ? x[i] <= x[a0] : x[i] >= x[a0]) { rec = i; break; }
      const since = x[L] / x[ib] - 1, t1 = up ? (rec ? `It gave the rise back by ${H.fmtDate(D[rec], { day: "numeric", month: "short", year: "numeric" })}` : "It has kept the rise")
        : (rec ? `It won the fall back by ${H.fmtDate(D[rec], { day: "numeric", month: "short", year: "numeric" })} (${Math.round((Date.parse(D[rec]) - Date.parse(D[ib])) / 864e5)} days after)` : `Not won back yet: ${pc(x[L] / x[a0] - 1)} on where it started`);
      rr(c, M, y, W - 2 * M, 44, 12); c.fillStyle = th.soft; c.fill();
      caps(c, "After", M + 18, y + 28, th.line, 13); tx(c, `${t1} · ${pc(since)} since ${H.fmtDate(e.end, { day: "numeric", month: "short" })}`, M + 96, y + 29, { s: 17, w: 700, col: th.ink, max: W - 2 * M - 120 });
      y += 44 + 14;
    }
    y += 14;

    // the stocks that moved most
    if (on("stmov") && (e.most || []).length) {
      caps(c, isAll ? "Moved most ($50B+ companies)" : "Moved most", M, y, th.muted, 13); y += 14;
      const mov = e.most.slice(0, 4), gw = (W - 2 * M - 3 * 14) / 4, mmx = Math.max(...mov.map((m) => Math.abs(m[1])), 0.005);
      mov.forEach(([tk, r], i) => { const gx = M + i * (gw + 14); box(c, th, gx, y, gw, 92, 14);
        tx(c, tk, gx + 16, y + 34, { s: 22, w: 800, col: th.ink, f: MONO, max: gw * 0.45 }); tx(c, pc(r, 1), gx + gw - 16, y + 34, { s: 22, w: 800, col: sgn(r, th), f: MONO, a: "right" });
        tx(c, nm(tk), gx + 16, y + 58, { s: 14, w: 600, col: th.ink2, max: gw - 32 });
        rr(c, gx + 16, y + 70, gw - 32, 8, 4); c.fillStyle = th.chip; c.fill(); rr(c, gx + 16, y + 70, Math.max(6, (gw - 32) * Math.abs(r) / mmx), 8, 4); c.fillStyle = sgn(r, th); c.fill(); });
      y += 92 + 28;
    }

    // room the analysis panels and headlines need below (the written steps give way to them)
    const panels = [["stamk", "mk"], ["statg", "tg"], ["stabf", "bf"], ["staot", "ot"]].filter(([k]) => on(k)).map((p2) => p2[1]);
    const rowsN = Math.ceil(panels.length / 2), PH_MIN = 180, anaNeed = panels.length ? 24 + rowsN * (PH_MIN + 16) : 0;
    const nHead = +Q.sthead || 0, headRoom = nHead && (e.what || []).length ? 30 + Math.min(nHead, e.what.length) * 36 : 0;
    // why: the written explanation and its steps (only where the site has news for it)
    if (on("stwhy") && o.hasNews) {
      const steps = on("ststeps") ? (e.detail || []).slice(0, 6) : [], sum = e.summary ? plain(e.summary) : "";
      const avail = BOTTOM - y - anaNeed - 26;   // headlines give way first
      setF(c, 600, 19); const sl = sum ? Math.min(3, lines(c, sum, W - 2 * M - 64).length) : 1;
      let stepH = 0, nSteps = 0; for (const d of steps) { setF(c, 500, 15); const h2 = 10 + 21 * Math.min(2, lines(c, plain(d), W - 2 * M - 100).length); if (54 + sl * 26 + stepH + h2 + 14 > avail) break; stepH += h2; nSteps++; }
      const bh = 54 + sl * 26 + stepH + 14;
      box(c, th, M, y, W - 2 * M, bh, 16); c.fillStyle = th.line; c.fillRect(M, y + 14, 5, bh - 28);
      caps(c, "Why", M + 30, y + 32, th.line, 14);
      let yy = y + 62;
      if (sum) yy = wrap(c, sum, M + 30, yy, W - 2 * M - 64, 26, 3, { s: 19, w: 600, col: th.ink }) + 34;
      else { tx(c, `Not written yet for this ${o.week ? "week" : o.drop ? "move" : "day"}: the explanation is added each evening.`, M + 30, yy, { s: 17, w: 500, col: th.muted }); yy += 34; }
      steps.slice(0, nSteps).forEach((d, j) => { c.fillStyle = th.line; c.beginPath(); c.arc(M + 42, yy - 6, 11, 0, 7); c.fill(); tx(c, String(j + 1), M + 42, yy - 1, { s: 13, w: 800, col: "#fff", a: "center" });
        yy = wrap(c, plain(d), M + 64, yy, W - 2 * M - 100, 21, 2, { s: 15, w: 500, col: th.ink2 }) + 31; });
      y += bh + 26;
    }

    // our own analysis from the price data: the panels that are switched on, two to a row
    // fewer headlines if the panels would otherwise be squeezed
    let heads = nHead && (e.what || []).length ? Math.min(nHead, e.what.length) : 0;
    while (heads > 0 && BOTTOM - y - (30 + heads * 36) < anaNeed) heads--;
    const headH = heads ? 30 + heads * 36 : 0;
    if (panels.length && BOTTOM - y - headH >= anaNeed - 4) {
      caps(c, "Independent analysis · from the price data", M, y, th.muted, 13); y += 14;
      const pw = (W - 2 * M - 16) / 2, ph = Math.max(PH_MIN, Math.min(250, Math.floor((BOTTOM - y - headH - 16 * rowsN) / rowsN)));
      const spyMove = spy[ib] / spy[a0] - 1, move = x[ib] / x[a0] - 1, cap = Math.max(0.02, Math.abs(move) * 1.2);
      panels.forEach((kind, i) => {
        const px = M + (i % 2) * (pw + 16), py = y + Math.floor(i / 2) * (ph + 16);
        box(c, th, px, py, pw, ph, 14);
        const title = (t) => tx(c, t, px + 18, py + 30, { s: 16, w: 800, col: th.ink });
        if (kind === "mk" && isAll) {
          title("How broad was it?");
          const sp = Object.keys(P.px).filter((t) => H.stocks[t] && H.stocks[t][5]).map((t) => mv(t, a0, ib)).filter((r) => r != null);
          const nUp = sp.filter((r) => r > 0).length, avg = sp.reduce((a, r) => a + r, 0) / (sp.length || 1), bw = pw - 36;
          rr(c, px + 18, py + 52, bw, 22, 11); c.fillStyle = th.down; c.fill(); rr(c, px + 18, py + 52, Math.max(22, bw * nUp / sp.length), 22, 11); c.fillStyle = th.up; c.fill();
          tx(c, `${nUp} up`, px + 18, py + 100, { s: 18, w: 800, col: th.up }); tx(c, `${sp.length - nUp} down`, px + pw - 18, py + 100, { s: 18, w: 800, col: th.down, a: "right" });
          wrap(c, `The average company moved ${pc(avg)}, against ${pc(move)} for the index.`, px + 18, py + ph - 44, pw - 36, 21, 2, { s: 15, w: 500, col: th.ink2 });
        } else if (kind === "mk") {
          title("The market, or the industry?");
          // beta over the year before: how much the S&P 500 explains, and how much was the industry's own
          const pts = []; for (let i2 = Math.max(1, ia - 250); i2 < ia; i2++) if (x[i2] && x[i2 - 1] && spy[i2] && spy[i2 - 1]) pts.push([spy[i2] / spy[i2 - 1] - 1, x[i2] / x[i2 - 1] - 1]);
          const mx = pts.reduce((a, p2) => a + p2[0], 0) / (pts.length || 1), my = pts.reduce((a, p2) => a + p2[1], 0) / (pts.length || 1);
          const bt = pts.reduce((a, p2) => a + (p2[0] - mx) * (p2[1] - my), 0) / Math.max(1e-12, pts.reduce((a, p2) => a + (p2[0] - mx) ** 2, 0)), exp = bt * spyMove, own = move - exp;
          const tot = Math.abs(exp) + Math.abs(own) || 1, bw = pw - 36, ew = bw * Math.abs(exp) / tot;
          rr(c, px + 18, py + 52, bw, 26, 8); c.fillStyle = th.chip; c.fill();
          rr(c, px + 18, py + 52, Math.max(8, ew), 26, 8); c.fillStyle = th.muted; c.fill(); rr(c, px + 18 + ew, py + 52, Math.max(8, bw - ew), 26, 8); c.fillStyle = sgn(own, th); c.fill();
          tx(c, `market ${pc(exp)}`, px + 18, py + 102, { s: 16, w: 800, col: th.ink2, f: MONO }); tx(c, `own ${pc(own)}`, px + pw - 18, py + 102, { s: 16, w: 800, col: sgn(own, th), f: MONO, a: "right" });
          wrap(c, `It usually moves ${bt.toFixed(1)}× the S&P 500, so the S&P's ${pc(spyMove)} explains ${pc(exp)}: ${Math.abs(own) > Math.abs(exp) ? "mostly its own news" : "mostly the wider market"}.`, px + 18, py + ph - 44, pw - 36, 21, 2, { s: 15, w: 500, col: th.ink2 });
        } else if (kind === "tg" && isAll) {
          title("Sectors, same days");
          const by = new Map(); for (const t of Object.keys(P.px)) { if (!(H.stocks[t] && H.stocks[t][5])) continue; const r = mv(t, a0, ib); if (r == null) continue; const g = H.sectorOf(t); if (!g || ["Other", "Miscellaneous", "Crypto"].includes(g)) continue; if (!by.has(g)) by.set(g, []); by.get(g).push(r); }
          const sr = [...by].map(([g, l]) => [g, l.reduce((a, r) => a + r, 0) / l.length]).sort((a, b) => b[1] - a[1]), pick = sr.length > 4 ? [...sr.slice(0, 2), ...sr.slice(-2)] : sr, smx = Math.max(...pick.map((r) => Math.abs(r[1])), 0.002), rh = (ph - 50) / 4;
          pick.forEach(([g, r], i2) => { const ry = py + 46 + i2 * rh, mid = px + pw - 170; tx(c, g, px + 18, ry + 15, { s: 14, w: 600, col: th.ink2, max: 200 });
            const len = 68 * Math.abs(r) / smx; rr(c, r >= 0 ? mid : mid - len, ry + 3, Math.max(4, len), 14, 7); c.fillStyle = sgn(r, th); c.fill(); tx(c, pc(r), px + pw - 18, ry + 15, { s: 15, w: 800, col: sgn(r, th), f: MONO, a: "right" }); });
        } else if (kind === "tg") {
          title("Did they move together?");
          const each = src.tickers.map((t) => [t, mv(t, a0, ib)]).filter((r) => r[1] != null).sort((a, b) => b[1] - a[1]), same = each.filter((r) => (r[1] < 0) === (move < 0)).length;
          const shown = each.slice(0, 21), per = Math.min(shown.length, 7), cw = (pw - 36) / Math.max(1, per), rowsT = Math.ceil(shown.length / per), cr = Math.min(16, cw / 2 - 4, (ph - 90) / rowsT / 2 - 7);
          shown.forEach(([t, r], i2) => { const cx = px + 18 + (i2 % per) * cw + cw / 2, cy = py + 52 + cr + Math.floor(i2 / per) * (2 * cr + 16);
            c.fillStyle = heat(r, cap); c.beginPath(); c.arc(cx, cy, cr, 0, 7); c.fill(); tx(c, t, cx, cy + cr + 11, { s: 9, w: 700, col: th.muted, a: "center", max: cw - 2 }); });
          tx(c, `${same} of ${each.length} moved the same way${each.length > shown.length ? ` (biggest ${shown.length} shown)` : ""}`, px + 18, py + ph - 16, { s: 15, w: 800, col: th.ink, max: pw - 36 });
        } else if (kind === "bf") {
          title("What came before");
          const f0 = Math.max(0, a0 - 252), seg = x.slice(f0, ib + 1), hiV = Math.max(...x.slice(f0, a0 + 1).filter((v) => v != null)), pre = a0 >= 63 ? x[a0] / x[a0 - 63] - 1 : null;
          const sx0 = px + 18, sw = pw - 36, sy0 = py + 46, sh = ph - 112, lo2 = Math.min(...seg), hi2 = Math.max(...seg), X2 = (i2) => sx0 + i2 / Math.max(1, seg.length - 1) * sw, Y2 = (v) => sy0 + sh - (v - lo2) / Math.max(1e-9, hi2 - lo2) * sh;
          c.fillStyle = th.soft; c.fillRect(X2(Math.max(0, a0 - 63 - f0)), sy0 - 4, X2(a0 - f0) - X2(Math.max(0, a0 - 63 - f0)), sh + 8);
          c.beginPath(); seg.forEach((v, i2) => (i2 ? c.lineTo(X2(i2), Y2(v)) : c.moveTo(X2(i2), Y2(v)))); c.strokeStyle = th.line; c.lineWidth = 2.5; c.stroke();
          c.setLineDash([5, 5]); c.strokeStyle = th.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(sx0, Y2(hiV)); c.lineTo(sx0 + sw, Y2(hiV)); c.stroke(); c.setLineDash([]);
          c.fillStyle = sgn(move, th); c.beginPath(); c.arc(X2(seg.length - 1), Y2(seg[seg.length - 1]), 5, 0, 7); c.fill();
          tx(c, pre == null ? "" : `${pc(pre)} in the 3 months before (shaded)`, px + 18, py + ph - 42, { s: 14, w: 700, col: sgn(pre, th), max: pw - 36 });
          tx(c, `${pc(x[a0] / hiV - 1)} below its 1-year high (dashed)`, px + 18, py + ph - 18, { s: 14, w: 700, col: th.ink2, max: pw - 36 });
        } else {
          title("Other markets, same days");
          const cross = [["TLT", "Treasury bonds"], ["HYG", "High-yield bonds"], ["GLD", "Gold"], ["XLE", "Energy stocks"], ...(isAll ? [["IWM", "Small companies"]] : [])].map(([t, n2]) => [n2, mv(t, a0, ib)]).filter((r) => r[1] != null).slice(0, 4);
          const tw4 = (pw - 36 - 10) / 2, th4 = (ph - 60 - 10) / 2;
          cross.forEach(([n2, r], i2) => { const tx0 = px + 18 + (i2 % 2) * (tw4 + 10), ty0 = py + 46 + Math.floor(i2 / 2) * (th4 + 10);
            rr(c, tx0, ty0, tw4, th4, 10); c.fillStyle = heat(r, Math.max(0.02, cap / 2)); c.fill();
            tx(c, n2, tx0 + 12, ty0 + 22, { s: 13, w: 700, col: "rgba(255,255,255,.92)", max: tw4 - 20 }); tx(c, pc(r), tx0 + 12, ty0 + th4 - 12, { s: 22, w: 800, col: "#fff", f: MONO }); });
        }
      });
      y += rowsN * (ph + 16) + 10;
    }

    // headlines
    if (heads && BOTTOM - y > 60) {
      caps(c, "In the news", M, y, th.muted, 13); y += 12;
      for (const h of e.what.slice(0, Math.min(heads, Math.max(0, Math.floor((BOTTOM - y) / 36))))) { tx(c, plain(h.title), M, y + 22, { s: 16, w: 700, col: th.ink, max: W - 2 * M - 220 });
        tx(c, `${h.source} · ${H.fmtDate(h.date, { day: "numeric", month: "short" })}`, W - M, y + 22, { s: 13, w: 600, col: th.muted, a: "right" }); y += 36; }
    }
    footer(c, th, `${isAll ? "S&P 500" : `${name}: ${src.tickers.length} stocks, averaged`}. Prices: Yahoo Finance${o.hasNews ? "; headlines: Google News" : ""}. Not financial advice.`);
  }

  const DRAW = { today: (c, th) => drawMovers(c, th, 1), week: (c, th) => drawMovers(c, th, 5), industries: drawIndustries, ai: drawAI, aftermath: drawAftermath,
    invest: drawInvest, prodmap: drawProdMap, prodchain: drawProdChain, aiwatch: drawAIWatch, bubble: drawBubble, holders: drawHolders, hype: drawHype, stock: drawStock, story: (c, th) => drawStory(c, th, "today"), storywk: (c, th) => drawStory(c, th, "now"), drop: drawDrop };

  // ---------- controls ----------
  const seg = (id, key, opts) => `<div class="seg" id="${id}" data-key="${key}" role="group">${opts.map(([v, l]) => `<button type="button" data-v="${v}">${l}</button>`).join("")}</div>`;
  const fieldHtml = (k) => { const [label, opts] = FIELDS[k], id = "mv_" + k;
    return opts === "sel" ? `<div class="field" data-mv="${k}"><label for="${id}">${label}</label><select id="${id}" data-key="${k}"></select></div>`
      : `<div class="field" data-mv="${k}"><span class="label">${label}</span>${seg(id, k, opts)}</div>`; };
  const markup = () => `<div class="post-grid">
      <div class="post-controls">
        ${[[1, "Markets"], [2, "Stories and industry"], [3, "AI and insider trading"]].map(([g, l]) => `<div class="field"><span class="label">${l}</span><div class="styles mv-styles">${VIEWS.filter((x) => x.g === g).map((x) => `<button type="button" data-view="${x.v}"><b>${esc(x.t)}</b><span>${esc(x.s)}</span></button>`).join("")}</div></div>`).join("")}
        ${Object.keys(FIELDS).map(fieldHtml).join("")}
        <div class="field"><label for="mvTtl">Headline <span class="muted">(optional: your own title for this image)</span></label><input type="text" id="mvTtl" maxlength="80" placeholder="Leave empty for the standard title"></div>
        <div class="field"><span class="label">Look</span>${seg("mvTheme", "theme", [["light", "Light"], ["dark", "Dark"]])}</div>
      </div>
      <div class="post-preview">
        <img id="mvImg" alt="Data visualization" tabindex="0" role="button" title="Click to see it full size">
        <p class="empty" id="mvEmpty" hidden></p>
        <div class="post-actions"><button type="button" class="btn primary" id="mvSave" disabled>Download image</button><button type="button" class="btn" id="mvCopy" disabled>Copy image</button><span id="mvHint">Click the image to view it full size.</span></div>
      </div>
    </div>
    <div class="img-view" id="mvView" role="dialog" aria-modal="true" aria-label="Image, full size" hidden><button type="button" class="img-view-close" aria-label="Close">×</button><img alt="Data visualization, full size"></div>`;

  let token = 0, blob = null, url = null;
  async function fillSelects() {
    const H = S(), [A, I, D2] = await Promise.all([H.loadAfter(), H.loadInvest(), H.loadProd()]);
    const af = (A && A.stocks) || []; if (!af.some((s) => s.tk === Q.af) && af[0]) Q.af = af[0].tk;
    const secs = [...new Set(Object.values(H.stocks).filter((x) => x[5] && x[1]).map((x) => x[1]))].sort();
    if (Q.msec !== "all" && !secs.includes(Q.msec)) Q.msec = "all";
    $("#mv_msec").innerHTML = `<option value="all">All sectors</option>` + secs.map((x) => `<option value="${esc(x)}">${esc(x)}</option>`).join("");
    // the story picker: the market, the five industries with news, every industry list, every S&P 500 sector
    const Mv0 = await H.loadMoves(), th0 = (Mv0 && Mv0.themes) || {};
    const secs0 = [...new Set(Object.values(H.stocks).filter((x) => x[5] && x[1] && !["Miscellaneous", "Crypto", "Other"].includes(x[1])).map((x) => x[1]))].sort();
    const stOpts = [["The market", [["all", "The S&P 500"]]], ["Industries with news and written explanations", Object.entries(th0).map(([k, t]) => [k, t.name])],
      ["Industry lists (from prices)", Object.entries(H.INDUSTRIES).map(([k, v]) => ["L:" + k, v[0]])], ["S&P 500 sectors (from prices)", secs0.map((g) => ["S:" + g, g])]];
    $("#mv_sti").innerHTML = stOpts.map(([g, l]) => `<optgroup label="${esc(g)}">${l.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join("")}</optgroup>`).join("");
    if (!stOpts.some(([, l]) => l.some(([v]) => v === Q.sti))) Q.sti = "all";
    // the drop picker: every market drop and every industry fall or rise, newest first
    const pick = []; (Mv0 && Mv0.episodes || []).forEach((e, i) => pick.push(["The market", `all|${i}`, e.start, "down", `S&P 500 ${H.pct(e.spy, 1)} · ${dropDates(H, e)}`]));
    for (const [k, t] of Object.entries(th0)) t.events.forEach((e, i) => pick.push([t.name, `${k}|${i}`, e.start, e.dir, `${e.dir === "up" ? "▲" : "▼"} ${H.pct(e.move, 1)} · ${dropDates(H, e)}`]));
    const shown = pick.filter((x) => Q.dpk === "all" || x[3] === Q.dpk), groups = [...new Set(shown.map((x) => x[0]))];
    $("#mv_dpsel").innerHTML = groups.map((g) => `<optgroup label="${esc(g)}">${shown.filter((x) => x[0] === g).sort((a, b) => b[2].localeCompare(a[2])).map((x) => `<option value="${x[1]}">${esc(x[4])}</option>`).join("")}</optgroup>`).join("");
    if (!shown.some((x) => x[1] === Q.dpsel)) Q.dpsel = shown.length ? shown.sort((a, b) => b[2].localeCompare(a[2]))[0][1] : "";
    // every stock with prices in an index, the AI list or an industry list, by name
    const PX = await H.loadAllPrices(), pool = [...new Set(Object.keys(H.LIST_NAMES).flatMap((k) => H.listTks(PX, k)))].filter((t) => t !== "SPY" && t !== "QQQ" && t !== "DIA");
    pool.sort((a, b) => H.coName(a).localeCompare(H.coName(b))); if (!pool.includes(Q.stk)) Q.stk = pool.includes("NVDA") ? "NVDA" : pool[0];
    $("#mv_stk").innerHTML = pool.map((t) => `<option value="${esc(t)}">${esc(H.coName(t))} (${esc(t)})</option>`).join("");
    $("#mv_af").innerHTML = af.map((s) => `<option value="${esc(s.tk)}">${esc(s.name.replace(/ Common Stock$| Corporation.*$| Inc\..*$/, ""))} (${esc(s.tk)}) · ${H.pct(s.drop, 0)}</option>`).join("");
    const stories = (I && I.stories) || []; if (!stories.some((x) => x.id === Q.hlst) && stories[0]) Q.hlst = stories[0].id;
    $("#mv_hlst").innerHTML = stories.map((x) => `<option value="${esc(x.id)}">${esc(x.title)} · ${esc(H.fmtDate(x.date, { day: "numeric", month: "short" }))}</option>`).join("");
    $("#mv_deal").innerHTML = ((I && I.deals) || []).map((d, i) => `<option value="${i}">${esc(d.center.name)} · ${esc(H.fmtDate(d.date, { month: "short", year: "numeric" }))}</option>`).join("");
    $("#mv_item").innerHTML = D2 ? D2.groups.map((g) => `<optgroup label="${esc(g.name)}">${g.items.map((k) => `<option value="${k}">${esc(D2.items[k].name)}</option>`).join("")}</optgroup>`).join("") : "";
    const singles = $("#mv_item").innerHTML, fields = (label) => D2 ? `<optgroup label="A whole field">${D2.groups.map((g) => `<option value="grp:${esc(g.name)}">${esc(g.name)}: ${label}</option>`).join("")}</optgroup>` : "";
    $("#mv_pmi").innerHTML = D2 ? fields("who makes what") + singles : "";
    $("#mv_item").innerHTML = D2 ? fields("every supply chain") + singles : "";
    $("#mv_msec").value = Q.msec; $("#mv_af").value = Q.af; $("#mv_deal").value = Q.deal; $("#mv_item").value = Q.item; $("#mv_pmi").value = Q.pmi; $("#mv_stk").value = Q.stk; $("#mv_sti").value = Q.sti; $("#mv_dpsel").value = Q.dpsel; $("#mv_hlst").value = Q.hlst;
  }
  function sync() {
    $$("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === Q.view)));
    const need = VIEWS.find((x) => x.v === Q.view).f;
    $$("[data-mv]").forEach((f) => { f.hidden = !need.includes(f.dataset.mv); });
    $$("#mvApp .seg[data-key]").forEach((g) => $$("button", g).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === Q[g.dataset.key]))));
    const t = $("#mvTtl"); if (t && document.activeElement !== t) t.value = Q.ttl[Q.view] || "";
  }
  async function render() {
    const my = ++token, img = $("#mvImg"), empty = $("#mvEmpty"); if (!img) return;
    sync(); $("#mvSave").disabled = true; $("#mvCopy").disabled = true; img.classList.add("drawing"); empty.hidden = true; empty.textContent = "";
    const th = THEMES[Q.theme] || THEMES.light, cv = document.createElement("canvas"); cv.width = W; cv.height = HT; const c = cv.getContext("2d");
    try { await Promise.all([`800 20px ${UI}`, `700 20px ${UI}`, `600 20px ${UI}`, `500 20px ${UI}`, `700 20px ${MONO}`, `600 20px ${MONO}`].map((f) => document.fonts.load(f))); } catch (e) { /* draw with what's there */ }
    let problem = null;
    try {
      // the phone design (markets_phone.js) where it covers this view and these choices; the older drawing otherwise
      const phone = window.HFMarketsPhone ? await window.HFMarketsPhone.draw(Q.view, c, Q, { storySource, priceMove }) : "FALLBACK";
      problem = phone === "FALLBACK" ? await DRAW[Q.view](c, th) : phone;
    } catch (e) { console.error(e); problem = "This image couldn't be drawn."; }
    if (my !== token) return;
    img.classList.remove("drawing");
    if (problem) { img.hidden = true; empty.hidden = false; empty.textContent = problem; blob = null; return; }
    blob = await new Promise((r) => cv.toBlob(r, "image/png")); if (my !== token) return;
    if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
    img.src = url; img.hidden = false; empty.hidden = true; $("#mvSave").disabled = false; $("#mvCopy").disabled = false;
  }
  const fileName = () => `harryv12-${Q.view}${Q.view === "aftermath" ? "-" + Q.af : Q.view === "stock" ? "-" + Q.stk : Q.view === "drop" ? "-" + Q.dpsel.replace("|", "-") : Q.view.startsWith("story") ? "-" + Q.sti.replace(/[:\s]+/g, "-") : Q.view === "prodmap" ? "-" + Q.pmi : Q.view === "prodchain" ? "-" + Q.item : ""}-${S().D.prices_through}.png`.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  function bind() {
    $$("[data-view]").forEach((b) => b.addEventListener("click", () => { Q.view = b.dataset.view; save(); render(); }));
    $$("#mvApp .seg[data-key]").forEach((g) => g.addEventListener("click", async (e) => { const b = e.target.closest("button"); if (!b) return; Q[g.dataset.key] = b.dataset.v;
      if (g.dataset.key === "dpk") await fillSelects();   // falls or rises: the list of moves changes
      save(); render(); }));
    $$("#mvApp select[data-key]").forEach((s) => s.addEventListener("change", () => { Q[s.dataset.key] = s.value; save(); render(); }));
    let tt; $("#mvTtl").addEventListener("input", (e) => { clearTimeout(tt); tt = setTimeout(() => { Q.ttl[Q.view] = e.target.value; save(); render(); }, 450); });
    $("#mvSave").addEventListener("click", () => { if (!blob) return; const a = document.createElement("a"); a.href = url; a.download = fileName(); document.body.appendChild(a); a.click(); a.remove(); });
    $("#mvCopy").addEventListener("click", async () => {
      const hint = $("#mvHint"); if (!blob) return;
      try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); hint.textContent = "Image copied. Paste it into your post."; }
      catch (e) { hint.textContent = "This browser won't copy images here. Right-click the image and choose Copy image, or use Download."; }
      setTimeout(() => { hint.textContent = "Click the image to view it full size."; }, 4000);
    });
    const view = $("#mvView"), open = () => { if (!url || $("#mvImg").hidden) return; $("img", view).src = url; view.hidden = false; document.body.style.overflow = "hidden"; };
    const close = () => { if (view.hidden) return; view.hidden = true; document.body.style.overflow = ""; };
    $("#mvImg").addEventListener("click", open); $("#mvImg").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    view.addEventListener("click", close); document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }
  window.HFMarketsViz = {
    markup,
    async mount() { bind(); sync(); await fillSelects(); render(); },
  };
})();
