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
  const SITE = "harryv12.github.io/harryv12finance";
  // the same colours as the Congress images
  const THEMES = {
    light: { bg: "#f5f6f8", card: "#ffffff", ink: "#0e1621", ink2: "#3f4a5a", muted: "#6b7584", grid: "#e2e6ec", line: "#1f5fd6",
      soft: "rgba(31,95,214,0.10)", up: "#0b7a41", down: "#c22f2f", chip: "#eef1f5", gov: "#1f5fd6", person: "#8a4fd0", company: "#b7791f" },
    dark: { bg: "#0c1117", card: "#141b24", ink: "#eef2f6", ink2: "#c3cbd6", muted: "#8b95a3", grid: "#222b36", line: "#5aa0ff",
      soft: "rgba(90,160,255,0.14)", up: "#3fd07f", down: "#ff6b6b", chip: "#1d2631", gov: "#5aa0ff", person: "#b48cf0", company: "#e0a94a" },
  };

  // ---------- the views, and the choices each one needs ----------
  const VIEWS = [
    { v: "today", g: 1, t: "Today's market movers", s: "Heatmap of the market, with the biggest gainers and decliners at the close", f: ["list"] },
    { v: "week", g: 1, t: "This week's market movers", s: "The same for the last five trading days", f: ["list"] },
    { v: "industries", g: 1, t: "Industries: today or this week", s: "AI, defense, banks, oil and healthcare: how each moved, and why", f: ["ipd"] },
    { v: "ai", g: 1, t: "AI stocks", s: "Every AI stock at a glance: today, this week or this month", f: ["aip"] },
    { v: "aftermath", g: 2, t: "Aftermath card", s: "A steady stock that kept falling: its chart, what led to it and why", f: ["af"] },
    { v: "invest", g: 2, t: "Investments money-flow", s: "Who put money in, and how the linked stocks have moved since", f: ["deal"] },
    { v: "prodmap", g: 2, t: "Production map", s: "Where the world's chips, oil, metals and minerals are made", f: ["item"] },
    { v: "prodchain", g: 2, t: "Production supply chain", s: "Each step from raw material to market, and where it depends on", f: ["item"] },
    { v: "aiwatch", g: 3, t: "AI bubble watch", s: "The latest news on the AI labs' listings and the debt behind AI", f: [] },
    { v: "bubble", g: 3, t: "Where is the AI bubble?", s: "The private AI labs ranked among America's biggest companies", f: [] },
    { v: "hype", g: 3, t: "Hype check", s: "Congress buys shared as tips, scored on how much they really mean", f: ["hy"] },
  ];
  const DEF = { view: "today", list: "sp", ipd: "now", aip: "day", af: "", deal: "0", item: "chips", hy: "weak", theme: "light" };
  let Q = { ...DEF };
  try { Q = { ...DEF, ...(JSON.parse(localStorage.getItem("hf-mviz") || "{}") || {}) }; } catch (e) { /* storage blocked */ }
  if (!VIEWS.some((x) => x.v === Q.view)) Q.view = DEF.view;
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
    const H = S(), P = await H.loadAllPrices(), L = P.dates.length - 1, date = P.dates[L];
    const rows = H.listTks(P, Q.list).map((t) => [t, H.moveOf(P, t, k)]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1]);
    if (!rows.length) return "No prices for this list yet.";
    const up = rows.filter((x) => x[1] > 0).length, dn = rows.filter((x) => x[1] < 0).length, cap = k === 1 ? 0.03 : 0.07, listName = H.LIST_NAMES[Q.list];
    const when = k === 1 ? H.fmtDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(P.dates[L - k + 1], { day: "numeric", month: "short" })} – ${H.fmtDate(date)}`;
    let y = header(c, th, `${listName} · ${when}`, k === 1 ? "Today's market movers" : "This week's market movers",
      `${up} of ${rows.length} ${listName} stocks rose and ${dn} fell ${k === 1 ? "at the close" : "over the last five trading days"}.`);
    // index cards
    const IDX = [["SPY", "S&P 500"], ["QQQ", "Nasdaq 100"], ["DIA", "Dow"]], gap = 18, cw = (W - 2 * M - 2 * gap) / 3, ch = 128;
    IDX.forEach(([tk, nm], i) => {
      const x = M + i * (cw + gap), r = H.moveOf(P, tk, k), px = P.px[tk] || [];
      box(c, th, x, y, cw, ch); tx(c, nm, x + 20, y + 34, { s: 18, w: 700, col: th.ink2 });
      tx(c, pc(r, 2), x + 20, y + 84, { s: 40, w: 700, col: sgn(r, th), f: MONO });
      sparkline(c, px.slice(L - 21, L + 1), x + cw - 132, y + 30, 112, 70, sgn(r, th), 3, k > 1 ? 21 - k : null, th);
    });
    y += ch + 30;
    // breadth
    const bw = W - 2 * M, upW = bw * up / rows.length;
    rr(c, M, y, bw, 16, 8); c.fillStyle = th.down; c.fill(); rr(c, M, y, Math.max(16, upW), 16, 8); c.fillStyle = th.up; c.fill();
    tx(c, `${up} up`, M, y + 44, { s: 18, w: 700, col: th.up }); tx(c, `${dn} down`, W - M, y + 44, { s: 18, w: 700, col: th.down, a: "right" });
    tx(c, `each square a company, sized by value, coloured by its ${k === 1 ? "day" : "week"}`, W / 2, y + 44, { s: 15, w: 500, col: th.muted, a: "center" });
    y += 64;
    // heatmap
    const hx = M, hy = y, hw = W - 2 * M, hh = 520;
    const items = rows.map(([tk, r]) => ({ tk, r, v: Math.max(H.mcapOf(tk), 5e9), s: H.sectorOf(tk) })), bySec = new Map();
    for (const it of items) { if (!bySec.has(it.s)) bySec.set(it.s, []); bySec.get(it.s).push(it); }
    const secs = H.squarify([...bySec].map(([s, l]) => ({ s, l, v: l.reduce((a, x) => a + x.v, 0) })), hx, hy, hw, hh);
    for (const sb of secs) {
      const lab = sb.h > 40 && sb.w > 70;
      for (const t of H.squarify(sb.l, sb.x + 1, sb.y + (lab ? 22 : 1), sb.w - 2, sb.h - (lab ? 23 : 2))) {
        c.fillStyle = heat(t.r, cap); c.fillRect(t.x, t.y, t.w, t.h); c.strokeStyle = th.bg; c.lineWidth = 2; c.strokeRect(t.x, t.y, t.w, t.h);
        if (t.w > 46 && t.h > 30) {
          const fs = Math.max(13, Math.min(30, t.w / 4.2, t.h / 2.6));
          tx(c, t.tk, t.x + t.w / 2, t.y + t.h / 2 + (t.h > 64 ? -2 : fs * 0.36), { s: fs, w: 800, col: "#fff", a: "center", max: t.w - 6 });
          if (t.h > 64) tx(c, pc(t.r), t.x + t.w / 2, t.y + t.h / 2 + fs * 0.95, { s: Math.max(12, fs * 0.62), w: 600, col: "#fff", a: "center", f: MONO });
        }
      }
      if (lab) tx(c, sb.s, sb.x + 4, sb.y + 16, { s: 13, w: 800, col: th.muted, max: sb.w - 8, ls: 0.6 });
    }
    y = hy + hh + 34;
    // gainers and decliners
    const colW = (W - 2 * M - 36) / 2, mx = Math.max(...rows.slice(0, 5).concat(rows.slice(-5)).map((x) => Math.abs(x[1])), 0.001);
    const list = (arr, x, title) => {
      caps(c, title, x, y, th.muted, 15);
      arr.forEach(([tk, r], i) => {
        const ry = y + 22 + i * 48;
        rr(c, x, ry, 84, 34, 7); c.fillStyle = th.chip; c.fill(); tx(c, tk, x + 42, ry + 24, { s: 17, w: 700, col: th.ink, f: MONO, a: "center", max: 78 });
        tx(c, H.coName(tk), x + 96, ry + 24, { s: 17, w: 600, col: th.ink2, max: colW - 96 - 190 });
        const bx = x + colW - 180, bl = 92 * Math.abs(r) / mx; rr(c, bx, ry + 12, Math.max(4, bl), 12, 6); c.fillStyle = sgn(r, th); c.fill();
        tx(c, pc(r, 1), x + colW, ry + 25, { s: 19, w: 700, col: sgn(r, th), f: MONO, a: "right" });
      });
    };
    list(rows.slice(0, 5), M, "Biggest gainers"); list(rows.slice(-5).reverse(), M + colW + 36, "Biggest decliners");
    footer(c, th, `Closing prices from Yahoo Finance, to ${H.fmtDate(date)}. Company values from Nasdaq. Not financial advice.`);
  }

  // ---------- 3. industries: today or this week ----------
  async function drawIndustries(c, th) {
    const H = S(), Mv = await H.loadMoves(); if (!Mv || !Mv.themes) return "Industry moves haven't loaded.";
    const span = Q.ipd, mk = Mv.market[span];
    const rows = [["The whole market (S&P 500)", mk], ...Object.values(Mv.themes).map((t) => [t.name, t[span]])].filter((r) => r[1]);
    const when = span === "today" ? H.fmtDate(mk.end, { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(mk.start, { day: "numeric", month: "short" })} – ${H.fmtDate(mk.end)}`;
    let y = header(c, th, `${span === "today" ? "Today" : "This week"} · ${when}`, span === "today" ? "Today by industry" : "This week by industry",
      "How the market and five industries moved, and why. Each bar is the industry's move; the marker is the S&P 500 over the same days.");
    const n = rows.length, gap = 14, ch = Math.floor((BOTTOM - y - gap * (n - 1)) / n), mx = Math.max(...rows.map((r) => Math.max(Math.abs(r[1].move || 0), Math.abs(r[1].spy || 0))), 0.005);
    rows.forEach(([name, e], i) => {
      const ry = y + i * (ch + gap); box(c, th, M, ry, W - 2 * M, ch);
      tx(c, name, M + 24, ry + 40, { s: 24, w: 800, col: th.ink, max: 560 });
      tx(c, pc(e.move, 1), W - M - 24, ry + 44, { s: 38, w: 700, col: sgn(e.move, th), f: MONO, a: "right" });
      // the move against a centre line, with the S&P 500 marker
      const cx = M + 24 + 280, half = 260, by = ry + 62;
      c.fillStyle = th.grid; c.fillRect(cx - half, by + 5, 2 * half, 2); c.fillRect(cx - 1, by - 4, 2, 20);
      const len = half * Math.abs(e.move || 0) / mx; rr(c, e.move >= 0 ? cx : cx - len, by, Math.max(3, len), 12, 6); c.fillStyle = sgn(e.move, th); c.fill();
      if (i > 0 && e.spy != null) { const sx = cx + half * e.spy / mx; c.fillStyle = th.ink2; c.beginPath(); c.moveTo(sx, by - 6); c.lineTo(sx - 6, by - 14); c.lineTo(sx + 6, by - 14); c.closePath(); c.fill(); }
      tx(c, i > 0 && e.spy != null ? `S&P 500 ${pc(e.spy, 1)} · past month ${pc(e.month, 1)}` : `past month ${pc(e.month, 1)}`, W - M - 24, ry + 74, { s: 15, w: 600, col: th.muted, a: "right" });
      wrap(c, plain(e.summary || "No single cause was reported."), M + 24, ry + 108, W - 2 * M - 48, 25, Math.max(1, Math.floor((ch - 108) / 25) + 1), { s: 18, w: 500, col: th.ink2 });
    });
    footer(c, th, `Industries are baskets of the biggest stocks in each. Prices from Yahoo Finance; reasons from the day's news. Not financial advice.`);
  }

  // ---------- 4. AI stocks ----------
  async function drawAI(c, th) {
    const H = S(), P = await H.loadAllPrices(), L = P.dates.length - 1, k = { day: 1, week: 5, month: 21 }[Q.aip], cap = { day: 0.04, week: 0.08, month: 0.15 }[Q.aip];
    const rows = H.AI_STOCKS.filter((t) => P.px[t]).map((t) => [t, H.moveOf(P, t, k)]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1]).slice(0, 32);
    if (!rows.length) return "No AI stock prices yet.";
    const avg = rows.reduce((a, x) => a + x[1], 0) / rows.length, up = rows.filter((x) => x[1] > 0).length;
    const word = { day: "today", week: "this week", month: "this month" }[Q.aip];
    const when = k === 1 ? H.fmtDate(P.dates[L], { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : `${H.fmtDate(P.dates[L - k + 1], { day: "numeric", month: "short" })} – ${H.fmtDate(P.dates[L])}`;
    let y = header(c, th, `AI stocks · ${when}`, `AI stocks ${word}`,
      `Average ${pc(avg)} · ${up} up, ${rows.length - up} down · best ${rows[0][0]} ${pc(rows[0][1])}, worst ${rows[rows.length - 1][0]} ${pc(rows[rows.length - 1][1])}`);
    const cols = 4, gap = 14, tw = (W - 2 * M - gap * (cols - 1)) / cols, nr = Math.ceil(rows.length / cols), thh = Math.floor((BOTTOM - y - gap * (nr - 1)) / nr), from = Math.max(0, L - Math.max(21, k * 3));
    rows.forEach(([tk, r], i) => {
      const x = M + (i % cols) * (tw + gap), ty = y + Math.floor(i / cols) * (thh + gap);
      box(c, th, x, ty, tw, thh, 12); c.fillStyle = heat(r, cap); rr(c, x, ty, 8, thh, 4); c.fill();
      tx(c, tk, x + 22, ty + 32, { s: 22, w: 800, col: th.ink, f: MONO });
      tx(c, pc(r, 1), x + tw - 14, ty + 32, { s: 21, w: 700, col: sgn(r, th), f: MONO, a: "right" });
      tx(c, H.coName(tk), x + 22, ty + 54, { s: 14, w: 500, col: th.muted, max: tw - 36 });
      if (thh > 84) sparkline(c, P.px[tk].slice(from, L + 1), x + 22, ty + 66, tw - 40, thh - 80, sgn(r, th), 2.5, k > 1 ? L - from - k : null, th);
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
    const cmp = [["This stock", s.drop], [s.industry ? "Its industry" : "Its sector", s.sector_move], ["S&P 500", s.spy]].filter((x) => x[1] != null), cx = 640, cmx = Math.max(...cmp.map((x) => Math.abs(x[1])), 0.05);
    caps(c, "Same days", cx, y + 6, th.muted, 14);
    cmp.forEach(([nm, r], i) => { const ry = y + 26 + i * 34; tx(c, nm, cx, ry + 18, { s: 17, w: 600, col: th.ink2 }); const len = 170 * Math.abs(r) / cmx;
      rr(c, cx + 140, ry + 6, Math.max(4, len), 14, 7); c.fillStyle = sgn(r, th); c.fill(); tx(c, pc(r, 0), W - M, ry + 19, { s: 18, w: 700, col: sgn(r, th), f: MONO, a: "right" }); });
    y += 140;
    // the chart, shaded from the high, with each event numbered
    setF(c, 500, 18); const evH = (s.events || []).slice(0, 4).reduce((a, e) => a + 40 + 24 * (Math.min(2, lines(c, plain(e.text), W - 2 * M - 140).length) - 1), 0);
    setF(c, 500, 19); const whyH = s.why || s.summary ? 76 + 27 * Math.min(7, lines(c, plain(s.why || s.summary), W - 2 * M - 56).length) + 10 : 0;
    const ser = s.series || [], n = ser.length, gx = M, gy = y + 40, gw = W - 2 * M - 70, gh = Math.max(300, Math.min(480, BOTTOM - gy - 56 - evH - whyH - 16));
    if (n > 1) {
      const vals = ser.map((p) => p[1]), lo = Math.min(...vals) * 0.97, hi = Math.max(...vals) * 1.03, X = (i) => gx + i / (n - 1) * gw, Y = (v) => gy + (hi - v) / (hi - lo) * gh;
      const at = (d) => { const i = ser.findIndex((p) => p[0] >= d); return i < 0 ? n - 1 : i; }, pk = at(s.peak);
      c.fillStyle = th.soft; c.fillRect(X(pk), gy, X(n - 1) - X(pk), gh);
      for (const v of [lo, (lo + hi) / 2, hi]) { c.fillStyle = th.grid; c.fillRect(gx, Y(v), gw, 1.5); tx(c, v < 100 ? v.toFixed(2) : Math.round(v).toLocaleString(), gx + gw + 10, Y(v) + 6, { s: 15, w: 500, col: th.muted, f: MONO }); }
      for (let i = 1; i < n; i++) if (ser[i][0].slice(0, 7) !== ser[i - 1][0].slice(0, 7)) tx(c, H.fmtDate(ser[i][0], { month: "short" }), X(i), gy + gh + 24, { s: 14, w: 500, col: th.muted, a: "center" });
      c.beginPath(); vals.forEach((v, i) => (i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)))); c.strokeStyle = th.line; c.lineWidth = 3.5; c.lineJoin = "round"; c.stroke();
      (s.events || []).slice(0, 4).forEach((e, j) => { const i = at(e.date), ex = X(i), ey = Y(vals[i]), col = e.kind === "good" ? th.up : e.kind === "peak" ? th.line : th.down;
        const up = ey - 42 >= gy + 16, my = up ? ey - 42 : ey + 42;
        c.strokeStyle = col; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(ex, up ? ey - 28 : ey + 28); c.lineTo(ex, ey); c.stroke(); c.setLineDash([]);
        c.fillStyle = col; c.beginPath(); c.arc(ex, my, 15, 0, 7); c.fill(); tx(c, String(j + 1), ex, my + 6, { s: 16, w: 800, col: "#fff", a: "center" }); });
    }
    y = gy + gh + 56;
    // the timeline
    const evs = (s.events || []).slice(0, 4);
    evs.forEach((e, j) => { const col = e.kind === "good" ? th.up : e.kind === "peak" ? th.line : th.down;
      c.fillStyle = col; c.beginPath(); c.arc(M + 15, y + 2, 15, 0, 7); c.fill(); tx(c, String(j + 1), M + 15, y + 8, { s: 16, w: 800, col: "#fff", a: "center" });
      tx(c, H.fmtDate(e.date, { day: "numeric", month: "short" }), M + 44, y + 8, { s: 17, w: 700, col: th.ink, f: MONO });
      y = wrap(c, plain(e.text), M + 140, y + 8, W - 2 * M - 140, 24, 2, { s: 18, w: 500, col: th.ink2 }) + 40; });
    // why
    if (s.why || s.summary) {
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
    for (const f of d.inflows) if (f.stake && last(f.stake.tk)) { const now = last(f.stake.tk); tiles.push([`${plain(f.name)} stake`, H.usd(f.stake.shares * now), now / f.stake.price - 1]); }
    for (const x of d.tiles || []) if (x.stake && last(x.stake.tk)) { const now = last(x.stake.tk); tiles.push([plain(x.label), H.usd(x.stake.shares * now), now / x.stake.price - 1]); }
    setF(c, 500, 19); const sumL = Math.min(6, lines(c, plain(d.summary), W - 2 * M).length);
    const ins = d.inflows.slice(0, 5), outs = d.links.slice(0, 5), top = y + 20, bw = 310, R = 124;
    const fh = Math.max(520, Math.min(820, BOTTOM - top - 30 - (tiles.length ? 140 : 0) - (sumL * 28 + 30))), cx = W / 2, cy = top + fh / 2;
    caps(c, "Money in", M, top, th.muted, 14); caps(c, "Listed companies linked", W - M, top, th.muted, 14, "right");
    const slot = (n, i, h) => top + 24 + (fh - 24) * (i + 0.5) / n - h / 2;
    const curve = (x1, y1, x2, y2) => { c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2); c.strokeStyle = th.grid; c.lineWidth = 3; c.stroke(); };
    const bh = Math.min(132, (fh - 40) / Math.max(ins.length, outs.length) - 14);
    ins.forEach((f, i) => curve(M + bw, slot(ins.length, i, bh) + bh / 2, cx - R, cy));
    outs.forEach((l, i) => curve(cx + R, cy, W - M - bw, slot(outs.length, i, bh) + bh / 2));
    ins.forEach((f, i) => { const by = slot(ins.length, i, bh); box(c, th, M, by, bw, bh, 12); c.fillStyle = th[f.kind] || th.company; rr(c, M, by, 7, bh, 3); c.fill();
      tx(c, plain(f.name), M + 20, by + 30, { s: 19, w: 800, col: th.ink, max: bw - 30 }); tx(c, plain(f.amount), M + 20, by + 57, { s: 18, w: 700, col: th.ink2, max: bw - 30 });
      if (bh > 80) wrap(c, plain(f.note), M + 20, by + 82, bw - 34, 19, bh > 110 ? 2 : 1, { s: 14, w: 500, col: th.muted }); });
    c.fillStyle = th.soft; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); c.strokeStyle = th.line; c.lineWidth = 3; c.stroke();
    setF(c, 800, 26); const cn = lines(c, plain(d.center.name), 2 * R - 30).slice(0, 2); cn.forEach((l, i) => tx(c, l, cx, cy - 6 - (cn.length - 1) * 15 + i * 30, { s: 26, w: 800, col: th.ink, a: "center" }));
    wrap(c, plain(d.center.sub || ""), cx - R + 22, cy + 28 + (cn.length - 1) * 12, 2 * R - 44, 20, 2, { s: 15, w: 500, col: th.ink2 });
    outs.forEach((l, i) => { const by = slot(outs.length, i, bh), bx = W - M - bw, now = last(l.tk), then = at(l.tk, d.date), r = now && then ? now / then - 1 : null;
      box(c, th, bx, by, bw, bh, 12);
      rr(c, bx + 16, by + 12, 82, 30, 6); c.fillStyle = th.chip; c.fill(); tx(c, l.tk, bx + 57, by + 33, { s: 16, w: 700, col: th.ink, f: MONO, a: "center", max: 76 });
      tx(c, r != null ? pc(r, 0) : "–", bx + bw - 16, by + 34, { s: 22, w: 700, col: sgn(r, th), f: MONO, a: "right" });
      tx(c, H.coName(l.tk), bx + 16, by + 64, { s: 16, w: 700, col: th.ink2, max: bw - 32 });
      if (bh > 80) tx(c, `${plain(l.role)}${r != null ? ` · since ${H.fmtDate(d.date, { day: "numeric", month: "short" })}` : ""}`, bx + 16, by + 86, { s: 14, w: 500, col: th.muted, max: bw - 32 }); });
    y = top + fh + 30;
    // stakes: what they paid against what it's worth now
    if (tiles.length) {
      const n = Math.min(3, tiles.length), tw = (W - 2 * M - 18 * (n - 1)) / n;
      tiles.slice(0, n).forEach(([lab, val, r], i) => { const x = M + i * (tw + 18); box(c, th, x, y, tw, 110, 14); caps(c, lab, x + 20, y + 32, th.muted, 13);
        tx(c, val, x + 20, y + 78, { s: 34, w: 700, col: th.ink, f: MONO }); tx(c, `${pc(r, 0)} since bought`, x + tw - 20, y + 78, { s: 17, w: 700, col: sgn(r, th), a: "right" }); });
      y += 140;
    }
    if (BOTTOM - y > 60) wrap(c, plain(d.summary), M, y + 20, W - 2 * M, 28, Math.min(sumL, Math.floor((BOTTOM - y - 10) / 28)), { s: 19, w: 500, col: th.ink2 });
    footer(c, th, `Sources: ${d.sources.length} official filings and reports, listed on the Investments page. Prices from Yahoo Finance. Not financial advice.`);
  }

  // ---------- 7. Production map ----------
  async function drawProdMap(c, th) {
    const H = S(), [D2, Wd] = await Promise.all([H.loadProd(), H.loadWorld()]); if (!D2) return "Production data hasn't loaded.";
    const it = D2.items[Q.item] || D2.items.chips, isPct = /^%/.test(it.unit), fmtV = (v) => isPct ? `${v}%` : v.toLocaleString();
    let y = header(c, th, `Where it's made · ${it.year}`, it.name, plain(it.why));
    const mx0 = M, my0 = y, mw = W - 2 * M, mh = Math.min(600, BOTTOM - y - 34 - 20 - 8 * 46);
    if (Wd && window.d3) {
      const d3 = window.d3, proj = d3.geoNaturalEarth1().fitExtent([[mx0, my0], [mx0 + mw, my0 + mh]], { type: "Sphere" }), path = d3.geoPath(proj, c);
      const val = new Map(); for (const [, n, v] of it.rows) { const id = String(n).padStart(3, "0"); val.set(id, (val.get(id) || 0) + v); }
      const mx = Math.max(...val.values()), feats = Wd.features.filter((f) => f.id !== "010");
      c.beginPath(); path({ type: "Sphere" }); c.fillStyle = th.chip; c.fill();
      for (const f of feats) { const v = val.get(f.id); c.beginPath(); path(f); c.fillStyle = v ? th.line : th.grid; c.globalAlpha = v ? 0.25 + 0.75 * v / mx : 1; c.fill(); c.globalAlpha = 1; c.strokeStyle = th.bg; c.lineWidth = 0.7; c.stroke(); }
      // bubbles for the top five; each label goes above its bubble, or below, or is left off if both would overlap another
      const placed = [], hit = (b) => placed.some((q) => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h);
      const spots = it.rows.slice(0, 5).map(([nm, id, v]) => { const f = feats.find((g) => g.id === String(id).padStart(3, "0")); if (!f) return null; const [px, py] = path.centroid(f); return { nm, v, px, py, r: 8 + 20 * Math.sqrt(v / mx) }; }).filter(Boolean);
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
    caps(c, `Biggest producers · ${it.unit}`, M, y, th.muted, 14);
    const rows = it.rows.slice(0, 8), rmx = rows[0][2], rh = Math.min(46, (BOTTOM - y - 20) / rows.length);
    rows.forEach(([nm, , v], i) => { const ry = y + 20 + i * rh;
      tx(c, String(i + 1), M, ry + 26, { s: 17, w: 700, col: th.muted, f: MONO }); tx(c, nm, M + 34, ry + 26, { s: 19, w: 700, col: th.ink, max: 330 });
      const bx = M + 380, bl = (W - 2 * M - 380 - 150) * v / rmx; rr(c, bx, ry + 12, Math.max(4, bl), 18, 9); c.fillStyle = th.line; c.globalAlpha = 1 - i * 0.07; c.fill(); c.globalAlpha = 1;
      tx(c, fmtV(v), W - M, ry + 28, { s: 19, w: 700, col: th.ink, f: MONO, a: "right" }); });
    footer(c, th, `Source: ${it.source} (${it.year}). World: ${it.world}. Figures rounded.`);
  }

  // ---------- 8. Production supply chain ----------
  async function drawProdChain(c, th) {
    const H = S(), D2 = await H.loadProd(); if (!D2) return "Production data hasn't loaded.";
    const it = D2.items[Q.item] || D2.items.chips, chain = it.chain || [];
    if (!chain.length) return `No supply chain written for ${it.name} yet.`;
    let y = header(c, th, `Supply chain · ${it.name}`, `${it.name}: the supply chain`, "Each step from raw material to market, and the place it depends on.");
    // the chain, then (when there is room) the biggest producers as bars
    const showTop = it.rows.length >= 3, topH = showTop ? 50 + Math.min(5, it.rows.length) * 40 + 20 : 0;
    const n = chain.length, gap = 30, ch = Math.min(150, (BOTTOM - y - topH - gap * (n - 1)) / n);
    chain.forEach((s, i) => {
      const cy = y + i * (ch + gap); box(c, th, M, cy, W - 2 * M, ch, 16);
      c.fillStyle = th.line; c.beginPath(); c.arc(M + 44, cy + ch / 2, 24, 0, 7); c.fill(); tx(c, String(i + 1), M + 44, cy + ch / 2 + 8, { s: 22, w: 800, col: "#fff", a: "center" });
      caps(c, plain(s.step), M + 90, cy + 36, th.muted, 14);
      tx(c, plain(s.where), M + 90, cy + 78, { s: 32, w: 800, col: th.ink, max: 520 });
      tx(c, plain(s.who), M + 90, cy + 110, { s: 18, w: 500, col: th.ink2, max: 520 });
      setF(c, 800, 22); const sh = lines(c, plain(s.share), 330).slice(0, 3);
      sh.forEach((l, k) => tx(c, l, W - M - 26, cy + ch / 2 - (sh.length - 1) * 14 + 8 + k * 28, { s: 22, w: 800, col: th.line, a: "right" }));
      if (i < n - 1) { c.fillStyle = th.muted; c.beginPath(); const ax = M + 44, ay = cy + ch + 6; c.moveTo(ax - 10, ay); c.lineTo(ax + 10, ay); c.lineTo(ax, ay + gap - 12); c.closePath(); c.fill(); }
    });
    if (showTop) {
      const isPct = /^%/.test(it.unit), rows = it.rows.slice(0, 5), mx = rows[0][2]; let ty = BOTTOM - topH + 38;
      caps(c, `Biggest producers · ${it.unit} · ${it.year}`, M, ty, th.muted, 13);
      rows.forEach(([nm, , v], i) => { const ry = ty + 14 + i * 40; tx(c, nm, M, ry + 26, { s: 18, w: 700, col: th.ink, max: 300 });
        const bl = (W - 2 * M - 320 - 140) * v / mx; rr(c, M + 320, ry + 13, Math.max(4, bl), 16, 8); c.fillStyle = th.line; c.globalAlpha = 1 - i * 0.1; c.fill(); c.globalAlpha = 1;
        tx(c, isPct ? `${v}%` : v.toLocaleString(), W - M, ry + 27, { s: 18, w: 700, col: th.ink, f: MONO, a: "right" }); });
    }
    footer(c, th, `Shares from the Production page's sources (USGS, Energy Institute, worldsteel, TrendForce, ASML, IEA); year shown with each. Not financial advice.`);
  }

  // ---------- 9. AI bubble watch ----------
  async function drawAIWatch(c, th) {
    const H = S(), A = await H.loadAIB(); if (!A) return "AI bubble watch hasn't loaded.";
    let y = header(c, th, `AI bubble watch · updated ${H.fmtDate(A.updated)}`, "What's moving the AI bubble", "The AI labs heading for Wall Street, and the debt behind the AI build-out.");
    caps(c, "What's new", M, y, th.line, 15); y += 22;
    for (const u of A.updates.slice(0, 4)) {
      if (y > 700) break;
      rr(c, M, y, 120, 32, 8); c.fillStyle = th.chip; c.fill(); tx(c, H.fmtDate(u.date, { day: "numeric", month: "short" }), M + 60, y + 23, { s: 16, w: 700, col: th.ink, f: MONO, a: "center" });
      y = wrap(c, plain(u.text), M + 140, y + 23, W - 2 * M - 140, 26, 3, { s: 19, w: 500, col: th.ink2 }) + 30;
    }
    const cw = A.coreweave; y += 14;
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
    caps(c, "The private AI labs", M, y, th.line, 15); y += 20;
    const lw = (W - 2 * M - 18) / 2; setF(c, 500, 16); const ln = Math.min(4, Math.max(...A.labs.slice(0, 2).map((l) => lines(c, plain(l.status), lw - 40).length))), lh = 92 + ln * 22;
    A.labs.slice(0, 2).forEach((l, i) => { const x = M + i * (lw + 18); box(c, th, x, y, lw, lh, 14);
      tx(c, l.name, x + 20, y + 40, { s: 24, w: 800, col: th.ink }); tx(c, plain(l.label), x + lw - 20, y + 42, { s: 32, w: 800, col: th.down, f: MONO, a: "right" });
      wrap(c, plain(l.status), x + 20, y + 78, lw - 40, 22, ln, { s: 16, w: 500, col: th.ink2 }); });
    y += lh + 40;
    if (BOTTOM - y > 80 && A.watch) {
      caps(c, "What to watch", M, y, th.line, 15); y += 18;
      const items = A.watch.slice(0, Math.floor((BOTTOM - y) / 46));
      items.forEach((w, i) => { const ry = y + i * 46; c.fillStyle = th.line; c.beginPath(); c.arc(M + 10, ry + 22, 6, 0, 7); c.fill(); tx(c, plain(w), M + 30, ry + 29, { s: 20, w: 600, col: th.ink, max: W - 2 * M - 30 }); });
    }
    footer(c, th, `Facts dated and sourced on the AI bubble page (${Object.keys(A.sources).length} sources). Reported private values are not official. Not financial advice.`);
  }

  // ---------- 10. Where is the AI bubble? ----------
  async function drawBubble(c, th) {
    const H = S(), [A, P] = await Promise.all([H.loadAIB(), H.loadAllPrices()]); if (!A) return "AI bubble watch hasn't loaded.";
    const L = P.dates.length - 1, yr = (tk) => { const x = P.px[tk]; return x && x[L] && x[L - 252] ? x[L] / x[L - 252] - 1 : null; };
    let y = header(c, th, `AI bubble · ${H.fmtDate(P.dates[L])}`, "Where is the AI bubble?", "Listed AI companies are priced on fast-growing profits. The private AI labs about to sell shares are priced on hope.");
    // two bubbles
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
    // where the labs would rank
    const big = Object.entries(H.stocks).filter(([t, s]) => s[4] > 5e11 && t !== "GOOG").map(([t, s]) => ({ name: H.coName(t), v: s[4] }));
    const ranked = [...big, ...A.labs.map((l) => ({ name: `${l.name} (private)`, v: l.value, lab: true, label: plain(l.label) }))].sort((a, b) => b.v - a.v).slice(0, 12), vmx = ranked[0].v;
    caps(c, "America's biggest companies, with the labs at their reported values", M, y, th.muted, 14); y += 16;
    const rh = Math.min(44, Math.floor((BOTTOM - y - 190) / ranked.length)); ranked.forEach((r, i) => { const ry = y + i * rh;
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
    col(M, "Listed AI chipmakers · past year", A.chipmakers); col(M + colW + 30, "AI data-centre renters · past year", A.neoclouds);
    footer(c, th, `Company values from Nasdaq; private values as reported (${H.fmtDate(A.labs[0].asOf)}). Prices from Yahoo Finance. Not financial advice.`);
  }

  // ---------- 11. Hype check ----------
  async function drawHype(c, th) {
    const H = S(); await H.loadSignals();
    const recent = H.trades.filter((t) => t.side === "B" && t.fd && t.t && H.stocks[t.t] && !H.isBiz(H.members[t.m]) && H.today - t.ftime < 45 * H.DAY).map((t) => ({ t, h: H.hype(t) })).filter((x) => x.h);
    // one buy per person (their weakest or strongest), so the image isn't one account's basket of buys
    const weak = Q.hy === "weak", seen = new Set(), list = [];
    for (const x of recent.filter((x) => weak ? x.h.level === 1 : x.h.level === 3).sort((a, b) => weak ? a.h.score - b.h.score || b.t.amt - a.t.amt : b.h.score - a.h.score || b.t.amt - a.t.amt)) {
      if (seen.has(x.t.m)) continue; seen.add(x.t.m); list.push(x); if (list.length === 5) break;
    }
    if (!list.length) return `No ${weak ? "weak" : "strong"}-signal buys were disclosed in the last 45 days.`;
    let y = header(c, th, "Congress · buys disclosed in the last 45 days", weak ? "Hype check: the weakest 'copy this' buys" : "Hype check: the strongest signals",
      "Every buy is scored out of 100% from about fifteen public facts: its size, basket buying, selling soon after, their committee, how late it was filed and their record.");
    const n = list.length, gap = 14, ch = Math.floor((BOTTOM - y - gap * (n - 1)) / n);
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
      for (const f of h.f.slice(0, 3)) { if (ry > cy + ch - 12) break; c.fillStyle = f.v > 0 ? th.up : th.down; c.fillRect(M + 24, ry - 16, 4, 21);
        tx(c, plain(f.txt), M + 40, ry, { s: 17, w: 500, col: th.ink2, max: W - 2 * M - 64 }); ry += 28; }
    });
    footer(c, th, `From members' disclosure reports, scored by the site's Hype check (Congress page). Not financial advice.`);
  }

  const DRAW = { today: (c, th) => drawMovers(c, th, 1), week: (c, th) => drawMovers(c, th, 5), industries: drawIndustries, ai: drawAI, aftermath: drawAftermath,
    invest: drawInvest, prodmap: drawProdMap, prodchain: drawProdChain, aiwatch: drawAIWatch, bubble: drawBubble, hype: drawHype };

  // ---------- controls ----------
  const seg = (id, key, opts) => `<div class="seg" id="${id}" data-key="${key}" role="group">${opts.map(([v, l]) => `<button type="button" data-v="${v}">${l}</button>`).join("")}</div>`;
  const markup = () => `<div class="post-grid">
      <div class="post-controls">
        ${[[1, "Markets"], [2, "Stories and industry"], [3, "AI and Congress"]].map(([g, l]) => `<div class="field"><span class="label">${l}</span><div class="styles mv-styles">${VIEWS.filter((x) => x.g === g).map((x) => `<button type="button" data-view="${x.v}"><b>${esc(x.t)}</b><span>${esc(x.s)}</span></button>`).join("")}</div></div>`).join("")}
        <div class="field" data-mv="list"><span class="label">Stocks</span>${seg("mvList", "list", [["sp", "S&amp;P 500"], ["ndx", "Nasdaq-100"], ["dow", "Dow 30"], ["ai", "AI stocks"]])}</div>
        <div class="field" data-mv="ipd"><span class="label">Period</span>${seg("mvIpd", "ipd", [["today", "Today"], ["now", "This week"]])}</div>
        <div class="field" data-mv="aip"><span class="label">Period</span>${seg("mvAip", "aip", [["day", "Today"], ["week", "This week"], ["month", "This month"]])}</div>
        <div class="field" data-mv="af"><label for="mvAf">Stock</label><select id="mvAf" data-key="af"></select></div>
        <div class="field" data-mv="deal"><label for="mvDeal">Deal</label><select id="mvDeal" data-key="deal"></select></div>
        <div class="field" data-mv="item"><label for="mvItem">What</label><select id="mvItem" data-key="item"></select></div>
        <div class="field" data-mv="hy"><span class="label">Show</span>${seg("mvHy", "hy", [["weak", "Weakest (most overhyped)"], ["strong", "Strongest"]])}</div>
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
    $("#mvAf").innerHTML = af.map((s) => `<option value="${esc(s.tk)}">${esc(s.name.replace(/ Common Stock$| Corporation.*$| Inc\..*$/, ""))} (${esc(s.tk)}) · ${H.pct(s.drop, 0)}</option>`).join("");
    $("#mvDeal").innerHTML = ((I && I.deals) || []).map((d, i) => `<option value="${i}">${esc(d.center.name)} · ${esc(H.fmtDate(d.date, { month: "short", year: "numeric" }))}</option>`).join("");
    $("#mvItem").innerHTML = D2 ? D2.groups.map((g) => `<optgroup label="${esc(g.name)}">${g.items.map((k) => `<option value="${k}">${esc(D2.items[k].name)}</option>`).join("")}</optgroup>`).join("") : "";
    $("#mvAf").value = Q.af; $("#mvDeal").value = Q.deal; $("#mvItem").value = Q.item;
  }
  function sync() {
    $$("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === Q.view)));
    const need = VIEWS.find((x) => x.v === Q.view).f;
    $$("[data-mv]").forEach((f) => { f.hidden = !need.includes(f.dataset.mv); });
    $$("#mvApp .seg[data-key]").forEach((g) => $$("button", g).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === Q[g.dataset.key]))));
  }
  async function render() {
    const my = ++token, img = $("#mvImg"), empty = $("#mvEmpty"); if (!img) return;
    sync(); $("#mvSave").disabled = true; $("#mvCopy").disabled = true; img.classList.add("drawing");
    const th = THEMES[Q.theme] || THEMES.light, cv = document.createElement("canvas"); cv.width = W; cv.height = HT; const c = cv.getContext("2d");
    try { await Promise.all([`800 20px ${UI}`, `700 20px ${UI}`, `600 20px ${UI}`, `500 20px ${UI}`, `700 20px ${MONO}`, `600 20px ${MONO}`].map((f) => document.fonts.load(f))); } catch (e) { /* draw with what's there */ }
    let problem = null;
    try { problem = await DRAW[Q.view](c, th); } catch (e) { console.error(e); problem = "This image couldn't be drawn."; }
    if (my !== token) return;
    img.classList.remove("drawing");
    if (problem) { img.hidden = true; empty.hidden = false; empty.textContent = problem; blob = null; return; }
    blob = await new Promise((r) => cv.toBlob(r, "image/png")); if (my !== token) return;
    if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
    img.src = url; img.hidden = false; empty.hidden = true; $("#mvSave").disabled = false; $("#mvCopy").disabled = false;
  }
  const fileName = () => `harryv12-${Q.view}${Q.view === "aftermath" ? "-" + Q.af : Q.view.startsWith("prod") ? "-" + Q.item : ""}-${S().D.prices_through}.png`.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  function bind() {
    $$("[data-view]").forEach((b) => b.addEventListener("click", () => { Q.view = b.dataset.view; save(); render(); }));
    $$("#mvApp .seg[data-key]").forEach((g) => g.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; Q[g.dataset.key] = b.dataset.v; save(); render(); }));
    $$("#mvApp select[data-key]").forEach((s) => s.addEventListener("change", () => { Q[s.dataset.key] = s.value; save(); render(); }));
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
