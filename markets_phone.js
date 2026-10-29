/* HarryV12 Finance · Data Visualization, Markets & AI: the images in the phone design (1080×1440, 3:4).
   Numbered, colour-coded sections, tinted panels and larger text; written text is never cut off with "…" (a block
   that needs more room gets a slightly smaller font) and every chart has labelled axes. markets_viz.js keeps the
   controls and calls HFMarketsPhone.draw(view, canvas, choices); a view or choice this design doesn't cover
   returns "FALLBACK" and the older drawing is used. */
(() => {
  "use strict";
  const H = window.HFSite;
  // the page's choices (markets_viz.js Q) and its story helpers, set on each draw
  let Q = {}, X = {};
  const FB = "FALLBACK", on = (k) => Q[k] !== "0";
  const W = 1080, HT = 1440, M = 44, FOOT = 86, BOTTOM = HT - FOOT - 8;
  const UI = '"Public Sans", system-ui, sans-serif', MONO = '"IBM Plex Mono", ui-monospace, monospace';
  const C = { bg: "#f5f6f8", card: "#ffffff", ink: "#0e1621", ink2: "#354153", muted: "#667085", grid: "#dfe5ee", up: "#1d7a45", down: "#c62828",
    blue: "#1f5fd6", gold: "#b7791f", green: "#2e7d4f", red: "#c62828", purple: "#7c4dbe", teal: "#0f7f86", navy: "#1b3a8a" };
  const TINT = { blue: "#e8f0fd", gold: "#f9f1e3", green: "#e5f2ea", red: "#fbe9e9", purple: "#f1ebfa", teal: "#e0f2f3", navy: "#e6ebf7" };
  const plain = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/⅓/g, "1/3").replace(/⅔/g, "2/3").replace(/¼/g, "1/4").replace(/½/g, "1/2");
  // no "not final", "unconfirmed" or "not confirmed" notes on the images
  const clean = (s) => plain(s).replace(/\s*\((not final|unconfirmed|not confirmed)\)/gi, "").replace(/[;,]?\s*not confirmed[^.;]*/gi, "").replace(/\s+([.;,])/g, "$1").trim();
  const SHORT = { IBM: "IBM", HPE: "HP Enterprise", AMD: "AMD" };
  const co = (tk) => SHORT[tk] || H.coName(tk).replace(/\s+(Common Stock|Ordinary Shares?|Class [A-C].*|Inc\.?|Incorporated|Corporation|Corp\.?|plc\.?|N\.V\.|S\.A\.|Holdings? (Inc|Ltd).*|Banco Holding.*|Holding S\.?A\.?|American Depositary.*|Sponsored.*|ADR.*|ADS.*|Ltd\.?|Limited)\b.*$/i, "").replace(/[,.]$/, "").trim();
  const flat = (r, d) => r != null && Math.abs(r) < 0.5 * Math.pow(10, -d - 2);
  const pc = (r, d = 1) => r == null ? "–" : flat(r, d) ? `${(0).toFixed(d)}%` : H.pct(r, d);
  const sc = (r, d = 1) => r == null || flat(r, d) ? C.muted : r >= 0 ? C.up : C.down;
  const date = (d, o = { day: "numeric", month: "short" }) => H.fmtDate(d, o);

  // ---------- drawing kit ----------
  const font = (c, w, s, f = UI) => { c.font = `${w} ${s}px ${f}`; };
  // one line; too long for max → the font gets smaller (never an ellipsis)
  function tx(c, str, x, y, { s = 24, w = 500, col = C.ink, f = UI, a = "left", max = 0, min = 15, ls = 0 } = {}) {
    str = String(str); font(c, w, s, f); if ("letterSpacing" in c) c.letterSpacing = `${ls}px`;
    while (max && s > min && c.measureText(str).width > max) font(c, w, --s, f);
    c.fillStyle = col; c.textAlign = a; c.textBaseline = "alphabetic"; c.fillText(str, x, y);
    const wd = c.measureText(str).width; if ("letterSpacing" in c) c.letterSpacing = "0px"; c.textAlign = "left"; return wd;
  }
  const caps = (c, str, x, y, col, s = 22, a = "left", max = 0) => tx(c, String(str).toUpperCase(), x, y, { s, w: 800, col, a, ls: 1.4, max });
  // rich text: **bold** and [[blue]] spans; returns the lines as lists of [text, style]
  function runs(str) { const out = []; String(str).split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/).forEach((p) => { if (!p) return;
    if (p.startsWith("**")) out.push([p.slice(2, -2), "b"]); else if (p.startsWith("[[")) out.push([p.slice(2, -2), "k"]); else out.push([p, ""]); }); return out; }
  function layout(c, str, maxW, s, w) {
    const words = []; for (const [t, st] of runs(str)) t.split(/(\s+)/).forEach((x) => { if (x) words.push([x, st]); });
    const L = []; let cur = [], cw = 0;
    const wid = (t, st) => { font(c, st ? 800 : w, s); return c.measureText(t).width; };
    for (const [t, st] of words) { if (/^\s+$/.test(t)) { if (cur.length) { cur.push([" ", st]); cw += wid(" ", st); } continue; }
      const tw = wid(t, st); if (cw + tw > maxW && cur.length) { while (cur.length && cur[cur.length - 1][0] === " ") cur.pop(); L.push(cur); cur = []; cw = 0; }
      cur.push([t, st]); cw += tw; }
    if (cur.length) L.push(cur); return L;
  }
  // a paragraph from the top y; returns the y under it
  function para(c, str, x, y, maxW, { s = 24, w = 500, col = C.ink2, lh = 1.38, kcol = C.blue, a = "left" } = {}) {
    const L = layout(c, str, maxW, s, w), step = Math.round(s * lh);
    L.forEach((ln, i) => { let xx = x; if (a === "center") { let tw = 0; for (const [t, st] of ln) { font(c, st ? 800 : w, s); tw += c.measureText(t).width; } xx = x - tw / 2; }
      for (const [t, st] of ln) { font(c, st ? 800 : w, s); c.fillStyle = st === "k" ? kcol : st === "b" ? C.ink : col; c.textAlign = "left"; c.fillText(t, xx, y + s + i * step - Math.round(s * 0.18)); xx += c.measureText(t).width; } });
    return y + L.length * step;
  }
  const paraH = (c, str, maxW, s, w = 500, lh = 1.38) => layout(c, str, maxW, s, w).length * Math.round(s * lh);
  // the biggest font (down to min) at which every text fits the height; heightOf(s) gives the height at size s
  function fitS(heightOf, maxH, s0, min = 18) { let s = s0; while (s > min && heightOf(s) > maxH) s--; return s; }
  function rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const fill = (c, col) => { c.fillStyle = col; c.fill(); };
  // a white card with a coloured band along its top
  function card(c, x, y, w, h, col, { tint = false } = {}) {
    c.save(); rr(c, x, y, w, h, 18); c.fillStyle = tint ? TINT[col] : C.card; c.shadowColor = "rgba(20,40,80,0.08)"; c.shadowBlur = 10; c.shadowOffsetY = 2; c.fill(); c.restore();
    if (col && !tint) { c.save(); rr(c, x, y, w, h, 18); c.clip(); c.fillStyle = C[col]; c.fillRect(x, y, w, 6); c.restore(); }
  }
  // a numbered section title in the section's colour; returns the y under it
  function title(c, x, y, num, text, col, max = 0) {
    let xx = x; if (num) { c.fillStyle = C[col]; c.beginPath(); c.arc(x + 16, y + 16, 16, 0, 7); c.fill(); tx(c, String(num), x + 16, y + 24, { s: 20, w: 800, col: "#fff", a: "center" }); xx += 44; }
    caps(c, text, xx, y + 25, C[col], 23, "left", max ? max - (xx - x) : 0); return y + 46;
  }
  // a coloured header bar (like "YIELDS UP"), white text
  function bar(c, x, y, w, col, left, right) {
    c.save(); rr(c, x, y, w, 50, 14); c.clip(); c.fillStyle = C[col]; c.fillRect(x, y, w, 50); c.restore();
    tx(c, left, x + 20, y + 34, { s: 24, w: 800, col: "#fff", max: w * 0.62 }); if (right) tx(c, right, x + w - 20, y + 34, { s: 21, w: 600, col: "rgba(255,255,255,.92)", a: "right", max: w * 0.36 });
  }
  function pill(c, x, y, str, col = "blue") { font(c, 800, 22); if ("letterSpacing" in c) c.letterSpacing = "1.4px"; const t = str.toUpperCase(), w = Math.min(W - 2 * M, c.measureText(t).width + 28); if ("letterSpacing" in c) c.letterSpacing = "0px";
    rr(c, x, y, w, 40, 8); fill(c, C[col]); caps(c, t, x + 14, y + 28, "#fff", 22, "left", w - 28); return w; }
  // a small tinted chip: label then a value; returns its width
  function chip(c, x, y, label, value, vcol, col = "blue", s = 21) {
    font(c, 600, s); const lw = label ? c.measureText(label).width + 8 : 0; font(c, 800, s, MONO); const vw = c.measureText(value).width, w = lw + vw + 24;
    rr(c, x, y, w, s + 18, 10); fill(c, TINT[col]); if (label) tx(c, label, x + 12, y + s + 4, { s, w: 600, col: C.ink2 }); tx(c, value, x + 12 + lw, y + s + 4, { s, w: 800, col: vcol, f: MONO }); return w;
  }
  function header(c, kicker, ttl, hi, sub, { ts = 60, subS = 25, kcol = "blue" } = {}) {
    c.fillStyle = C.bg; c.fillRect(0, 0, W, HT);
    caps(c, kicker, M, 60, C.blue, 21, "left", W - 2 * M);
    // the title, with one phrase in blue; it gets smaller rather than run off the edge
    ttl = ((Q.ttl || {})[Q.view] || "").trim() || ttl;
    let s = ts; font(c, 900, s); while (s > 40 && c.measureText(ttl).width > W - 2 * M) font(c, 900, --s);
    const i = -1, y0 = 80 + s;
    if (i < 0) tx(c, ttl, M, y0, { s, w: 900 }); else { let x = M; x += tx(c, ttl.slice(0, i), x, y0, { s, w: 900 }); x += tx(c, hi, x, y0, { s, w: 900, col: C.blue }); tx(c, ttl.slice(i + hi.length), x, y0, { s, w: 900 }); }
    let y = y0 + 26; if (sub) y = para(c, sub, M, y, W - 2 * M, { s: subS, w: 500, col: C.ink2, lh: 1.32 });
    return y + 20;
  }
  function footer(c, src) {
    c.fillStyle = C.grid; c.fillRect(M, HT - 50, W - 2 * M, 2);
    tx(c, `Sources: ${src}`, M, HT - 60, { s: 17, w: 500, col: C.muted, max: W - 2 * M, min: 13 });
    tx(c, "harryv12finance.pages.dev", M, HT - 18, { s: 21, w: 600, col: C.blue });
    tx(c, "HarryV12 Finance", W - M, HT - 18, { s: 21, w: 800, col: C.ink2, a: "right" });
  }
  const heat = (r, cap) => { if (r == null) return "rgb(120,126,136)"; const t = Math.max(-1, Math.min(1, r / cap)), a = Math.abs(t); const [R, G, B] = t >= 0 ? [22, 150, 74] : [214, 40, 40];
    return `rgb(${Math.round(110 + (R - 110) * a)},${Math.round(118 + (G - 118) * a)},${Math.round(128 + (B - 128) * a)})`; };
  const loadScript = (src, key, def) => window[key] ? Promise.resolve(window[key]) : new Promise((res) => { const el = document.createElement("script"); el.src = src; el.onload = () => res(window[key] || def); el.onerror = () => res(def); document.head.appendChild(el); });
  const fmtPx = (v, cur = "$") => cur + (v >= 1000 ? Math.round(v).toLocaleString() : v >= 100 ? v.toFixed(0) : v.toFixed(2));

  // a line chart with both axes labelled: y values on the right, months along the bottom, axis titles
  function chart(c, x, y, w, h, dates, vals, { yFmt = (v) => v.toFixed(0), yTitle = "", xTitle = "", col = C.blue, comp = null, shadeFrom = null, marks = [] } = {}) {
    const pw = w - 92, ph = h - 74, all = vals.concat(comp || []).filter((v) => v != null), lo0 = Math.min(...all), hi0 = Math.max(...all), pad = (hi0 - lo0) * 0.08 || 1, lo = lo0 - pad, hi = hi0 + pad;
    const X = (i) => x + i / Math.max(1, vals.length - 1) * pw, Y = (v) => y + 40 + ph - (v - lo) / (hi - lo) * ph;
    if (yTitle) tx(c, yTitle, x + pw + 90, y + 18, { s: 18, w: 700, col: C.muted, a: "right" });
    for (let g = 0; g <= 4; g++) { const v = lo + (hi - lo) * g / 4, gy = Y(v); c.fillStyle = C.grid; c.fillRect(x, gy, pw, 1.5); tx(c, yFmt(v), x + pw + 10, gy + 7, { s: 18, w: 600, col: C.muted, f: MONO }); }
    if (shadeFrom != null) { c.fillStyle = "rgba(31,95,214,0.10)"; c.fillRect(X(shadeFrom), y + 40, X(vals.length - 1) - X(shadeFrom), ph); }
    c.fillStyle = C.ink2; c.fillRect(x, y + 40 + ph, pw, 2); c.fillRect(x, y + 40, 2, ph);
    const line = (arr, color, lw, dash) => { c.beginPath(); let st = false; arr.forEach((v, i) => { if (v == null) return; st ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)); st = true; }); c.strokeStyle = color; c.lineWidth = lw; c.setLineDash(dash || []); c.lineJoin = "round"; c.stroke(); c.setLineDash([]); };
    if (comp) line(comp, C.muted, 2.5, [8, 6]); line(vals, col, 4);
    // months along the bottom (every other one when the range is long)
    let lastM = "", n = 0; const step = vals.length > 300 ? 2 : 1;
    for (let i = 1; i < dates.length; i++) { const m = dates[i].slice(0, 7); if (m !== lastM && lastM) { if (n++ % step === 0 && X(i) < x + pw - 20 && X(i) > x + 20) tx(c, H.fmtDate(dates[i], { month: "short" }), X(i), y + 40 + ph + 26, { s: 18, w: 600, col: C.muted, a: "center" }); } lastM = m; }
    if (xTitle) tx(c, xTitle, x + pw / 2, y + h, { s: 18, w: 700, col: C.muted, a: "center" });
    for (const mk of marks) { const i = mk.i, mx = X(i), my = Y(vals[i]), up = my - 40 > y + 44, ty = up ? my - 34 : my + 34;
      c.strokeStyle = mk.col; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(mx, my); c.lineTo(mx, ty); c.stroke(); c.setLineDash([]);
      c.fillStyle = mk.col; c.beginPath(); c.arc(mx, ty, 16, 0, 7); c.fill(); tx(c, mk.t, mx, ty + 7, { s: 18, w: 800, col: "#fff", a: "center" }); }
    return { X, Y };
  }

  // ---------- 1–2. market movers ----------
  async function movers(c, k) {
    const P = await H.loadAllPrices(), L = P.dates.length - 1, d = P.dates[L];
    if (Q.mrank === "usd" || !on("mheat")) return FB;
    const list = Q.list || "sp", sec = Q.msec && Q.msec !== "all" ? Q.msec : "", listName = H.LIST_NAMES[list] || "S&P 500", bySector = !!H.INDEX_LISTS[list] && !sec;
    const rows = H.listTks(P, list).filter((t) => !sec || H.sectorOf(t) === sec).map((t) => [t, H.moveOf(P, t, k)]).filter((x) => x[1] != null).sort((a, b) => b[1] - a[1]);
    if (rows.length < 4) return FB;
    const up = rows.filter((x) => x[1] > 0).length, dn = rows.filter((x) => x[1] < 0).length, cap = k === 1 ? 0.03 : 0.07;
    const when = k === 1 ? date(d, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : `${date(P.dates[L - k + 1])} – ${date(d, { day: "numeric", month: "short", year: "numeric" })}`;
    let y = header(c, `${listName}${sec ? " · " + sec : ""} · ${when}`, k === 1 ? "Today's market movers" : "This week's market movers", "movers",
      `**${up}** of ${rows.length} ${listName}${sec ? " " + sec : ""} stocks rose and **${dn}** fell ${k === 1 ? "at the close" : "over the last five trading days"}. Each box below is a company, sized by its value and coloured by its move.`);
    // the indexes
    if (on("midx")) { const IDX = [["SPY", "S&P 500", "blue"], ["QQQ", "Nasdaq 100", "purple"], ["DIA", "Dow", "gold"], ["IWM", "Small caps", "teal"]], tw = (W - 2 * M - 3 * 14) / 4;
    IDX.forEach(([tk, nm, col], i) => { const x = M + i * (tw + 14), r = H.moveOf(P, tk, k), mo = H.moveOf(P, tk, 21);
      rr(c, x, y, tw, 112, 14); fill(c, TINT[col]); tx(c, nm, x + 16, y + 32, { s: 21, w: 800, col: C[col] });
      tx(c, pc(r, 2), x + 16, y + 72, { s: 34, w: 800, col: sc(r, 2), f: MONO, max: tw - 28 }); tx(c, `past month ${pc(mo, 1)}`, x + 16, y + 100, { s: 18, w: 600, col: C.ink2, max: tw - 28 }); });
    y += 130; }
    // breadth
    const bw = W - 2 * M, uw = bw * up / rows.length;
    rr(c, M, y, bw, 22, 11); fill(c, C.down); rr(c, M, y, Math.max(22, uw), 22, 11); fill(c, C.up);
    tx(c, `▲ ${up} rose`, M, y + 52, { s: 22, w: 800, col: C.up }); tx(c, `${dn} fell ▼`, W - M, y + 52, { s: 22, w: 800, col: C.down, a: "right" });
    tx(c, `${Math.round(up / rows.length * 100)}% of stocks up`, W / 2, y + 52, { s: 21, w: 700, col: C.ink2, a: "center" });
    y += 72;
    // the lists take what they need; the heatmap the rest
    const n = Math.max(1, Math.min(+Q.mn || 5, 8, Math.floor(rows.length / 2))), rowH = 44, listH = 50 + n * rowH + 16, hh = BOTTOM - y - listH - 18;
    const items = rows.map(([tk, r]) => ({ tk, r, v: Math.max(H.mcapOf(tk), 5e9), s: bySector ? H.sectorOf(tk) : H.subOf(tk), i: H.subOf(tk) }));
    const groups = (list, key) => { const m = new Map(); for (const it of list) { if (!m.has(it[key])) m.set(it[key], []); m.get(it[key]).push(it); }
      return [...m].map(([g, l]) => { const v = l.reduce((a, x) => a + x.v, 0); return { s: g, l, v, r: l.reduce((a, x) => a + x.r * x.v, 0) / v }; }); };
    const tile = (t) => { c.fillStyle = heat(t.r, cap); c.fillRect(t.x, t.y, t.w, t.h); c.strokeStyle = C.bg; c.lineWidth = 1.5; c.strokeRect(t.x, t.y, t.w, t.h);
      const fs = Math.min(34, t.w / 3.6, t.h / 2.3); if (fs < 14) return; font(c, 800, fs); if (c.measureText(t.tk).width > t.w - 6) return;
      const two = t.h > fs * 2.3, cy = t.y + t.h / 2; tx(c, t.tk, t.x + t.w / 2, two ? cy - 2 : cy + fs * 0.36, { s: fs, w: 800, col: "#fff", a: "center" });
      if (two) tx(c, pc(t.r), t.x + t.w / 2, cy + fs * 0.85, { s: Math.max(14, fs * 0.66), w: 700, col: "#fff", a: "center", f: MONO }); };
    for (const sb of H.squarify(groups(items, "s"), M, y, W - 2 * M, hh)) {
      font(c, 800, 16); const nm = sb.s.toUpperCase(), lab = sb.h > 50 && c.measureText(nm).width + 70 < sb.w;
      const ix = sb.x + 1, iy = sb.y + (lab ? 24 : 1), iw = sb.w - 2, ih = sb.h - (lab ? 25 : 2), subs = groups(sb.l, "i");
      if (subs.length > 1 && iw > 160 && ih > 110) for (const ib of H.squarify(subs, ix, iy, iw, ih)) { for (const t of H.squarify(ib.l, ib.x + 1, ib.y + 1, ib.w - 2, ib.h - 2)) tile(t); c.strokeStyle = C.bg; c.lineWidth = 3; c.strokeRect(ib.x, ib.y, ib.w, ib.h); }
      else for (const t of H.squarify(sb.l, ix, iy, iw, ih)) tile(t);
      if (lab) { c.fillStyle = C.bg; c.fillRect(sb.x, sb.y, sb.w, 23); const w0 = tx(c, nm, sb.x + 4, sb.y + 18, { s: 16, w: 800, col: C.ink2, ls: 0.5 }); tx(c, pc(sb.r), sb.x + 12 + w0, sb.y + 18, { s: 16, w: 800, col: sc(sb.r), f: MONO }); }
    }
    y += hh + 18;
    // gainers and fallers under green and red bars
    const cw = (W - 2 * M - 18) / 2, gain = rows.slice(0, n), lose = rows.slice(-n).reverse();
    [[gain, M, "green", "▲ BIGGEST GAINERS"], [lose, M + cw + 18, "red", "▼ BIGGEST FALLERS"]].forEach(([arr, x, col, t]) => {
      card(c, x, y, cw, listH, null); bar(c, x, y, cw, col, t, k === 1 ? "today" : "this week");
      arr.forEach(([tk, r], i) => { const ry = y + 50 + 8 + i * rowH; if (i) { c.fillStyle = C.grid; c.fillRect(x + 16, ry, cw - 32, 1); }
        tx(c, tk, x + 16, ry + 31, { s: 22, w: 800, col: C.blue, f: MONO }); tx(c, co(tk), x + 108, ry + 30, { s: 20, w: 600, col: C.ink2, max: cw - 108 - 110 });
        tx(c, pc(r), x + cw - 16, ry + 31, { s: 22, w: 800, col: sc(r), f: MONO, a: "right" }); }); });
    footer(c, `Yahoo Finance prices to ${date(d)} · Nasdaq company values · Not advice`);
  }

  // ---------- 3–5. why it moved (today, this week, a drop or rise) ----------
  async function story(c, w) {
    const P = await H.loadAllPrices(), Mv = await H.loadMoves(), src = X.storySource(H, P, Mv, Q.sti || "all");
    if (!src) return "Pick a market, industry or sector.";
    const e = src.data ? src.data[w] : X.priceMove(H, P, src.tickers, w === "today" ? 1 : 5);
    if (!e) return "This story hasn't loaded yet.";
    return drawMove(c, P, src, { ...e, move: e.move ?? e.spy, what: e.what || [] }, { week: w !== "today", label: w === "today" ? "on the day" : "over five trading days", hasNews: !!src.data });
  }
  async function drop(c) {
    const P = await H.loadAllPrices(), Mv = await H.loadMoves(), [key, i] = (Q.dpsel || "").split("|"), src = key ? X.storySource(H, P, Mv, key) : null;
    if (!src) return "Pick a drop or rise from the list.";
    const raw = key === "all" ? (Mv.episodes || [])[+i] : (src.data.events || [])[+i];
    if (!raw) return "That move isn't in the data any more. Pick another.";
    const days = P.dates.indexOf(raw.end) - P.dates.indexOf(raw.start) + 1;
    const e = key === "all" ? { ...raw, move: raw.spy, most: raw.big || [], compare: [["S&P 500", raw.spy], ["Nasdaq 100", raw.qqq], ["Dow", raw.dia]].filter((r) => r[1] != null) }
      : { ...raw, compare: [[src.name, raw.move], ["S&P 500", raw.spy]] };
    return drawMove(c, P, src, { ...e, what: raw.why && raw.why.length ? raw.why : raw.what || [] }, { drop: true, label: days > 1 ? `over ${days} trading days` : "on the day", hasNews: true });
  }
  function drawMove(c, P, src, e, o) {
    const D = P.dates, ia = D.indexOf(e.start), ib = D.indexOf(e.end), a0 = ia - 1, L = D.length - 1, spy = P.px.SPY, up = e.move >= 0, isAll = !!src.isAll, name = src.name;
    if (ia < 1 || ib < 0) return "No prices for these days yet.";
    // the basket day by day (equal weight of its stocks' daily moves), as the Market drops page works it out
    let x = spy; if (!isAll) { const tks = src.tickers.filter((t) => P.px[t]); x = [1]; for (let i = 1; i <= L; i++) { const rs = tks.map((t) => P.px[t][i] && P.px[t][i - 1] ? P.px[t][i] / P.px[t][i - 1] - 1 : null).filter((r) => r != null); x.push(x[i - 1] * (1 + (rs.length ? rs.reduce((a, r) => a + r, 0) / rs.length : 0))); } }
    const pu = (r) => pc(Math.abs(r)).replace(/^[+−-]/, ""), mv = (tk, a, b) => { const p = P.px[tk]; return p && p[a] && p[b] ? p[b] / p[a] - 1 : null; };
    const when = e.start === e.end ? date(e.end, { day: "numeric", month: "short", year: "numeric" }) : `${date(e.start)} – ${date(e.end, { day: "numeric", month: "short", year: "numeric" })}`;
    const top3 = (e.most || []).slice(0, 3).map(([tk, r]) => `${co(tk)} (${pc(r, 0)})`).join(", ");
    const span = e.start === e.end ? `on ${date(e.end)}` : `from ${date(e.start)} to ${date(e.end)}`, who = isAll ? "The S&P 500" : name;
    const sub = isAll ? `The S&P 500 ${up ? "rose" : "fell"} ${pu(e.move)} ${span}.${top3 ? ` Among companies worth $50 billion or more, ${top3} moved most.` : ""}`
      : `${name} ${up ? "rose" : "fell"} ${pu(e.move)} ${span}, while the S&P 500 ${e.spy >= 0 ? "rose" : "fell"} ${pu(e.spy)}.${top3 ? ` ${top3} moved most.` : ""}`;
    let y = header(c, `${isAll ? "The market" : name} · ${o.drop ? (up ? "sharp rise" : "market drop") : o.week ? "this week" : "the day"} · ${when}`, `${who} ${up ? "rose" : "fell"} ${pu(e.move)}${o.week ? " this week" : ""}`, "", sub, { ts: 56, subS: 24 });
    // 1 the move, and 2 the stocks that moved most, side by side
    const half = (W - 2 * M - 18) / 2, cmp = (e.compare || (isAll ? [["S&P 500", e.move], ["Past month", e.month]] : [[name, e.move], ["S&P 500", e.spy], ["Past month", e.month]])).filter((r) => r[1] != null);
    let after = null;
    if (o.drop && on("dpafter")) { let rec = null; for (let i = ib + 1; i <= L; i++) if (up ? x[i] <= x[a0] : x[i] >= x[a0]) { rec = i; break; }
      after = up ? (rec ? `Gave the rise back by **${date(D[rec])}**.` : "It has kept the rise.") : (rec ? `Won the fall back by **${date(D[rec])}**.` : `**Not won back yet:** ${pc(x[L] / x[a0] - 1)} on where it started; ${pc(x[L] / x[ib] - 1)} since ${date(e.end)}.`); }
    const mov = on("stmov") ? (e.most || []).slice(0, 4) : [];
    const topH = 46 + 22 + 74 + 26 + cmp.length * 38 + (after ? 16 + paraH(c, after, (mov.length ? half : W - 2 * M) - 48, 21) : 0) + 14, movH = 46 + 22 + mov.length * 52 + 8, rowA = Math.max(topH, mov.length ? movH : 0);
    const w1 = mov.length ? half : W - 2 * M;
    card(c, M, y, w1, rowA, "blue"); let yy = title(c, M + 22, y + 20, 1, o.drop ? (up ? "The rise" : "The drop") : "The move", "blue");
    tx(c, `${up ? "▲" : "▼"} ${pu(e.move)}`, M + 22, yy + 62, { s: 62, w: 800, col: sc(e.move), f: MONO }); caps(c, o.label, M + 24, yy + 96, C.muted, 18);
    yy += 120; cmp.forEach(([n2, r], i) => { const ry = yy + i * 38; if (i) { c.fillStyle = C.grid; c.fillRect(M + 22, ry, w1 - 44, 1); }
      tx(c, n2, M + 22, ry + 28, { s: 22, w: 700, col: C.ink2, max: w1 - 160 }); tx(c, pc(r), M + w1 - 22, ry + 28, { s: 23, w: 800, col: sc(r), f: MONO, a: "right" }); });
    if (after) para(c, after, M + 22, yy + cmp.length * 38 + 10, w1 - 48, { s: 21, col: C.ink2 });
    if (mov.length) { const x2 = M + half + 18; card(c, x2, y, half, rowA, "gold"); yy = title(c, x2 + 22, y + 20, 2, isAll ? "Moved most ($50B+ firms)" : "Moved most", "gold", half - 44);
      mov.forEach(([tk, r], i) => { const ry = yy + 8 + i * 52; rr(c, x2 + 22, ry, half - 44, 44, 10); fill(c, TINT.gold);
        tx(c, tk, x2 + 36, ry + 31, { s: 22, w: 800, col: C.ink, f: MONO }); tx(c, co(tk), x2 + 120, ry + 30, { s: 20, w: 600, col: C.ink2, max: half - 44 - 110 - 110 });
        tx(c, pc(r), x2 + half - 36, ry + 31, { s: 22, w: 800, col: sc(r), f: MONO, a: "right" }); }); }
    y += rowA + 18;
    // 3 why: the written explanation and every step, in full (only where the site has news for it)
    let num = mov.length ? 3 : 2;
    if (on("stwhy") && o.hasNews) {
      const steps = on("ststeps") ? (e.detail || []).map(plain) : [], sum = plain(e.summary || "") || `Not written yet for this ${o.week ? "week" : o.drop ? "move" : "day"}: the explanation is added each evening.`;
      const room0 = BOTTOM - y, whyIn = W - 2 * M - 44, stepW = whyIn - 44, anaMin = on("stamk") || on("staot") ? 250 : 0;
      const whyH = (s) => 46 + 18 + paraH(c, sum, whyIn, s + 1, 700) + 12 + steps.reduce((a, d) => a + paraH(c, d, stepW, s) + 10, 0) + 12;
      const sW = fitS(whyH, Math.max(260, room0 - anaMin - 18), 23, 18), wh = whyH(sW);
      card(c, M, y, W - 2 * M, wh, "green"); yy = title(c, M + 22, y + 20, num++, o.week ? "Why it moved this week" : "Why it moved", "green") + 6;
      yy = para(c, sum, M + 22, yy, whyIn, { s: sW + 1, w: 700, col: C.ink }) + 12;
      steps.forEach((d, j) => { c.fillStyle = C.green; rr(c, M + 22, yy + 4, 28, 28, 6); c.fill(); tx(c, String(j + 1), M + 36, yy + 25, { s: 18, w: 800, col: "#fff", a: "center" }); yy = para(c, d, M + 66, yy, stepW, { s: sW, col: C.ink2 }) + 10; });
      y += wh + 18;
    }
    // 4 what the prices say: how broad it was (or how much was the market's), other markets, and with room what came before
    const room = BOTTOM - y, h0 = (e.what || []).find((h) => h.title), newsNeed = on("sthead") && +Q.sthead && h0 ? paraH(c, plain(h0.title), W - 2 * M - 44, 21, 700, 1.3) + 94 : 9999;
    if ((on("stamk") || on("staot")) && room >= 200) {
      const twoRow = on("stabf") && room >= 500, ah = twoRow || room - 268 < newsNeed ? room : 250, move = x[ib] / x[a0] - 1, spyMove = spy[ib] / spy[a0] - 1;
      card(c, M, y, W - 2 * M, ah, "purple"); yy = title(c, M + 22, y + 20, num++, "What the prices say", "purple");
      const inW = W - 2 * M - 44, hw = (inW - 20) / 2, bx = M + 22, ox = bx + hw + 20;
      if (on("stamk") && isAll) {
        const sp = Object.keys(P.px).filter((t) => H.stocks[t] && H.stocks[t][5]).map((t) => mv(t, a0, ib)).filter((r) => r != null), nUp = sp.filter((r) => r > 0).length, avg = sp.reduce((a, r) => a + r, 0) / (sp.length || 1);
        tx(c, "How broad was it?", bx, yy + 22, { s: 22, w: 800 }); rr(c, bx, yy + 38, hw, 20, 10); fill(c, C.down); rr(c, bx, yy + 38, Math.max(20, hw * nUp / sp.length), 20, 10); fill(c, C.up);
        tx(c, `${nUp} up`, bx, yy + 86, { s: 21, w: 800, col: C.up }); tx(c, `${sp.length - nUp} down`, bx + hw, yy + 86, { s: 21, w: 800, col: C.down, a: "right" });
        para(c, `The average S&P 500 company moved **${pc(avg)}**, against **${pc(e.move)}** for the index.`, bx, yy + 96, hw, { s: 20 });
      } else if (on("stamk")) {
        // beta over the year before: how much the S&P 500 explains, and how much was the industry's own
        const pts = []; for (let i2 = Math.max(1, ia - 250); i2 < ia; i2++) if (x[i2] && x[i2 - 1] && spy[i2] && spy[i2 - 1]) pts.push([spy[i2] / spy[i2 - 1] - 1, x[i2] / x[i2 - 1] - 1]);
        const mx = pts.reduce((a, p2) => a + p2[0], 0) / (pts.length || 1), my = pts.reduce((a, p2) => a + p2[1], 0) / (pts.length || 1);
        const bt = pts.reduce((a, p2) => a + (p2[0] - mx) * (p2[1] - my), 0) / Math.max(1e-12, pts.reduce((a, p2) => a + (p2[0] - mx) ** 2, 0)), exp = bt * spyMove, own = move - exp, tot = Math.abs(exp) + Math.abs(own) || 1, ew = hw * Math.abs(exp) / tot;
        tx(c, "The market, or the industry?", bx, yy + 22, { s: 22, w: 800, max: hw });
        rr(c, bx, yy + 38, Math.max(8, ew), 20, 8); fill(c, C.muted); rr(c, bx + ew, yy + 38, Math.max(8, hw - ew), 20, 8); fill(c, sc(own));
        tx(c, `market ${pc(exp)}`, bx, yy + 86, { s: 20, w: 800, col: C.ink2, f: MONO }); tx(c, `own ${pc(own)}`, bx + hw, yy + 86, { s: 20, w: 800, col: sc(own), f: MONO, a: "right" });
        para(c, `It usually moves ${bt.toFixed(1)}× the S&P 500, so the S&P's ${pc(spyMove)} explains ${pc(exp)}: ${Math.abs(own) > Math.abs(exp) ? "mostly its own news" : "mostly the wider market"}.`, bx, yy + 96, hw, { s: 19 });
      }
      if (on("staot")) {
        const ox2 = on("stamk") ? ox : bx, ow = on("stamk") ? hw : inW;
        tx(c, "Other markets, same days", ox2, yy + 22, { s: 22, w: 800 });
        const cross = [["TLT", "Treasury bonds"], ["HYG", "High-yield bonds"], ["GLD", "Gold"], ["XLE", "Energy stocks"]].map(([t, n2]) => [n2, mv(t, a0, ib)]).filter((r) => r[1] != null);
        cross.forEach(([n2, r], i) => { const ry = yy + 36 + i * 35; rr(c, ox2, ry, ow, 30, 8); fill(c, TINT.purple); tx(c, n2, ox2 + 12, ry + 22, { s: 20, w: 600, col: C.ink2 }); tx(c, pc(r), ox2 + ow - 12, ry + 23, { s: 21, w: 800, col: sc(r), f: MONO, a: "right" }); });
      }
      if (twoRow) { const cy0 = yy + 36 + 4 * 35 + 18, f0 = Math.max(0, a0 - 252), ds = D.slice(f0, ib + 1), vs = x.slice(f0, ib + 1), pre = a0 >= 63 ? x[a0] / x[a0 - 63] - 1 : null, hiV = Math.max(...x.slice(f0, a0 + 1));
        tx(c, `What came before: ${isAll ? "the S&P 500" : name} over the year before`, bx, cy0 + 4, { s: 22, w: 800, max: inW });
        tx(c, `${pc(pre)} in the 3 months before (shaded) · ${pc(x[a0] / hiV - 1)} from its 1-year high`, bx, cy0 + 32, { s: 19, w: 600, col: C.ink2, max: inW });
        chart(c, bx, cy0 + 40, inW, y + ah - (cy0 + 40) - 14, ds, vs, isAll ? { yFmt: (v) => Math.round(v), yTitle: "SPY price ($)", shadeFrom: Math.max(0, a0 - 63 - f0) } : { yFmt: (v) => Math.round(v * 100), yTitle: "Basket (start = 100)", shadeFrom: Math.max(0, a0 - 63 - f0) }); }
      y += ah + 18;
    }
    // 5 the headlines, with the room left
    const heads = on("sthead") ? (e.what || []).filter((h) => h.title).slice(0, +Q.sthead || 0) : [], hRoom = BOTTOM - y;
    if (heads.length && hRoom >= paraH(c, plain(heads[0].title), W - 2 * M - 44, 21, 700, 1.3) + 94) {
      card(c, M, y, W - 2 * M, hRoom, "teal"); let hy = title(c, M + 22, y + 18, num, "In the news", "teal");
      for (const h of heads) { const t = plain(h.title), hh = paraH(c, t, W - 2 * M - 44, 21, 700, 1.3) + 26; if (hy + hh > y + hRoom - 4) break;
        hy = para(c, t, M + 22, hy, W - 2 * M - 44, { s: 21, w: 700, col: C.ink, lh: 1.3 }); tx(c, `${plain(h.source)} · ${date(h.date)}`, M + 22, hy + 20, { s: 18, w: 600, col: C.teal }); hy += 34; }
    }
    footer(c, `${isAll ? "S&P 500" : `${name}: ${src.tickers.length} stocks, averaged`} · Yahoo Finance prices${o.hasNews ? " · Google News headlines" : ""} · Not advice`);
  }

  // ---------- 6. industries: today or this week ----------
  async function industries(c) {
    if (Q.ind && Q.ind !== "all") return FB;
    const P = await H.loadAllPrices(), Mv = await H.loadMoves(); if (!Mv || !Mv.themes) return "Industry moves haven't loaded.";
    const span = Q.ipd === "today" ? "today" : "now", mk = Mv.market[span], k = span === "today" ? 1 : 5;
    const when = span === "today" ? date(mk.end, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : `${date(mk.start)} – ${date(mk.end, { day: "numeric", month: "short", year: "numeric" })}`;
    let y = header(c, `${span === "today" ? "Today" : "This week"} · ${when}`, span === "today" ? "Today by industry" : "This week by industry", "", `How ${on("imkt") ? "the market and " : ""}five industries moved ${span === "today" ? "today" : "over the last five trading days"}${on("iwhy") ? ", and why" : ""}. Each industry is an average of its biggest stocks.`);
    const rows = [...(on("imkt") ? [{ name: "The whole market (S&P 500)", e: mk, tickers: null }] : []), ...Object.values(Mv.themes).filter((t) => t[span]).map((t) => ({ name: t.name, e: t[span], tickers: t.tickers }))];
    const n = rows.length, gap = 14, ch = Math.floor((BOTTOM - y - gap * (n - 1)) / n), COLS = ["navy", "blue", "gold", "teal", "purple", "red"];
    rows.forEach((r, i) => { const e = r.e, cy = y + i * (ch + gap), col = r.tickers ? COLS[(i + (on("imkt") ? 0 : 1)) % COLS.length] : "navy";
      card(c, M, cy, W - 2 * M, ch, col);
      tx(c, r.name, M + 22, cy + 46, { s: 30, w: 900, col: C[col], max: W - 2 * M - 220 }); tx(c, pc(e.move ?? e.spy), W - M - 22, cy + 48, { s: 38, w: 800, col: sc(e.move ?? e.spy), f: MONO, a: "right" });
      let cx = M + 22; const cy2 = cy + 62;
      if (r.tickers) cx += chip(c, cx, cy2, "S&P 500", pc(e.spy), sc(e.spy), col, 19) + 8;
      cx += chip(c, cx, cy2, "Past month", pc(e.month), sc(e.month), col, 19) + 8;
      const mvs = r.tickers ? r.tickers.map((tk) => [tk, H.moveOf(P, tk, k)]).filter((q) => q[1] != null).sort((a, b) => b[1] - a[1]) : (e.most || []).slice(0, 2);
      if (r.tickers && mvs.length > 1) { cx += chip(c, cx, cy2, `Best ${mvs[0][0]}`, pc(mvs[0][1]), sc(mvs[0][1]), col, 19) + 8; chip(c, cx, cy2, `Worst ${mvs[mvs.length - 1][0]}`, pc(mvs[mvs.length - 1][1]), sc(mvs[mvs.length - 1][1]), col, 19); }
      else if (!r.tickers) mvs.forEach(([tk, rr2]) => { cx += chip(c, cx, cy2, tk, pc(rr2), sc(rr2), col, 19) + 8; });
      if (on("iwhy")) { const sum = plain(e.summary || "No single cause was reported."), inW = W - 2 * M - 44, top = cy2 + 52, s = fitS((s2) => paraH(c, sum, inW, s2), cy + ch - 12 - top, 26, 15);
        para(c, sum, M + 22, top, inW, { s, col: C.ink2 }); } });
    footer(c, "Yahoo Finance prices · reasons from the day's news · Not advice");
  }

  // ---------- 7. AI stocks ----------
  async function ai(c) {
    const P = await H.loadAllPrices(), L = P.dates.length - 1, per = Q.aip || "day", k = { day: 1, week: 5, month: 21 }[per], cap = { day: 0.04, week: 0.08, month: 0.15 }[per], word = { day: "today", week: "this week", month: "this month" }[per];
    const allS = H.AI_STOCKS.filter((t) => P.px[t]).map((t) => [t, H.moveOf(P, t, k), H.moveOf(P, t, per === "day" ? 5 : 21)]).filter((x) => x[1] != null);
    if (!allS.length) return "No AI stock prices yet.";
    const order = { move: (a, b) => b[1] - a[1], fall: (a, b) => a[1] - b[1], cap: (a, b) => H.mcapOf(b[0]) - H.mcapOf(a[0]), az: (a, b) => a[0].localeCompare(b[0]) }[Q.aisort || "move"];
    const keep = Q.aisort === "cap" || Q.aisort === "az" ? allS.slice().sort((a, b) => H.mcapOf(b[0]) - H.mcapOf(a[0])) : allS.slice().sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    const rows = keep.slice(0, +Q.ain || 32).sort(order), byMove = allS.slice().sort((a, b) => b[1] - a[1]), avg = allS.reduce((a, x) => a + x[1], 0) / allS.length, up = allS.filter((x) => x[1] > 0).length;
    const when = k === 1 ? date(P.dates[L], { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : `${date(P.dates[L - k + 1])} – ${date(P.dates[L], { day: "numeric", month: "short", year: "numeric" })}`;
    let y = header(c, `AI stocks · ${when}`, `AI stocks ${word}`, "", `The average AI stock moved **${pc(avg)}**; **${up}** rose and **${allS.length - up}** fell. Best **${byMove[0][0]} ${pc(byMove[0][1])}**, worst **${byMove[byMove.length - 1][0]} ${pc(byMove[byMove.length - 1][1])}**.`);
    const t3 = cap * 0.75, keys = [[`Up ${Math.round(t3 * 100)}%+`, heat(cap, cap)], ["Up", heat(cap * 0.3, cap)], ["Flat", heat(0, cap)], ["Down", heat(-cap * 0.3, cap)], [`Down ${Math.round(t3 * 100)}%+`, heat(-cap, cap)]]; let kx = M;
    keys.forEach(([l, col]) => { rr(c, kx, y, 24, 24, 5); fill(c, col); kx += 32 + tx(c, l, kx + 32, y + 19, { s: 18, w: 600, col: C.ink2 }) + 22; });
    tx(c, `${word === "today" ? "today's move · then the week" : `the move ${word} · then ${per === "week" ? "the month" : "the month"}`}`, W - M, y + 19, { s: 18, w: 600, col: C.muted, a: "right" }); y += 40;
    const cols = 4, gap = 10, tw = (W - 2 * M - gap * (cols - 1)) / cols, nr = Math.ceil(rows.length / cols), th = Math.min(200, Math.floor((BOTTOM - y - gap * (nr - 1)) / nr));
    rows.forEach(([tk, r, wk], i) => { const x0 = M + (i % cols) * (tw + gap), ty = y + Math.floor(i / cols) * (th + gap);
      rr(c, x0, ty, tw, th, 12); fill(c, heat(r, cap));
      tx(c, tk, x0 + 14, ty + 30, { s: 23, w: 800, col: "#fff", f: MONO }); tx(c, pc(r), x0 + tw - 12, ty + 30, { s: 22, w: 800, col: "#fff", f: MONO, a: "right" });
      tx(c, co(tk), x0 + 14, ty + 56, { s: 18, w: 600, col: "rgba(255,255,255,.92)", max: tw - 26, min: 13 });
      if (th > 84) tx(c, `${per === "day" ? "week" : "month"} ${pc(wk)}`, x0 + 14, ty + th - 14, { s: 17, w: 600, col: "rgba(255,255,255,.88)" }); });
    footer(c, "The site's AI list: chips, cloud, AI software and power · Yahoo Finance · Not advice");
  }

  // ---------- 8. stock breakdown ----------
  async function stock(c) {
    const tk = Q.stk || "NVDA";
    const P = await H.loadAllPrices(), DESC = await loadScript("descriptions.js?v=1", "CTC_DESC", {}), FUND = await loadScript(`fundamentals.js?d=${H.D.prices_through}`, "CTC_FUND", { d: {} });
    if (!P.px[tk]) return "No prices for this company yet.";
    const x = P.px[tk], spy = P.px.SPY, li = H.lastIdx(x), at = (a, i) => { for (let j = i; j >= 0; j--) if (a[j] != null) return a[j]; return null; };
    const back = (n) => { const a = at(x, Math.max(0, li - n)); return a ? x[li] / a - 1 : null; }, sback = (n) => { const a = at(spy, Math.max(0, li - n)); return a ? at(spy, li) / a - 1 : null; };
    const name = co(tk), n = Q.stp === "all" ? li : Math.min(li, +Q.stp || 252), i0 = li - n, perName = { 126: "6 months", 252: "1 year", 504: "2 years" }[Q.stp] || "since 2023";
    let y = header(c, [H.sectorOf(tk), H.subOf(tk)].filter((v) => v && v !== "Other").join(" › "), `${name} (${tk})`, tk, plain((DESC || {})[tk] || ""), { ts: 56, subS: 22 });
    const k4 = [["Last close", fmtPx(x[li]), C.ink, date(P.dates[li]), "blue"], ["Today", pc(back(1), 2), sc(back(1), 2), "at the close", "purple"], ["Company value", H.usd(H.mcapOf(tk)), C.ink, "market value", "gold"], [perName === "since 2023" ? "Since 2023" : `Past ${perName}`, pc(back(n)), sc(back(n)), `S&P 500 ${pc(sback(n))}`, "teal"]];
    const tw = (W - 2 * M - 3 * 14) / 4; k4.forEach(([l, v, col, s2, tc], i) => { const bx = M + i * (tw + 14); rr(c, bx, y, tw, 104, 14); fill(c, TINT[tc]);
      tx(c, l, bx + 14, y + 28, { s: 19, w: 800, col: C[tc] }); tx(c, v, bx + 14, y + 66, { s: 30, w: 800, col, f: MONO, max: tw - 24 }); tx(c, s2, bx + 14, y + 92, { s: 18, w: 600, col: C.ink2, max: tw - 24 }); });
    y += 120;
    // 1 the price over the year, with the S&P 500 from the same start
    const ch = 300; card(c, M, y, W - 2 * M, ch, "blue"); let yy = title(c, M + 22, y + 18, 1, `Share price · ${perName}`, "blue");
    const s0 = at(spy, i0), p0 = at(x, i0), comp = spy.slice(i0, li + 1).map((v) => v != null ? v / s0 * p0 : null);
    c.strokeStyle = C.muted; c.lineWidth = 2.5; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(W - M - 330, y + 34); c.lineTo(W - M - 296, y + 34); c.stroke(); c.setLineDash([]);
    tx(c, "S&P 500, same start", W - M - 286, y + 41, { s: 18, w: 600, col: C.muted });
    chart(c, M + 22, yy - 8, W - 2 * M - 44, y + ch - (yy - 8) - 12, P.dates.slice(i0, li + 1), x.slice(i0, li + 1), { yFmt: (v) => fmtPx(v), yTitle: "Price ($)", xTitle: "", comp });
    y += ch + 16;
    // 2 returns against the S&P 500, as a table of tiles
    const ytd = P.dates.findIndex((d) => d.slice(0, 4) === P.dates[li].slice(0, 4)), per = [["1 week", 5], ["1 month", 21], ["3 months", 63], ["6 months", 126], ["This year", li - ytd + 1], ["1 year", 252]];
    const rh2 = 2 * 66 + 10 + 64; card(c, M, y, W - 2 * M, rh2, "purple"); yy = title(c, M + 22, y + 18, 2, `Returns: ${tk} vs the S&P 500`, "purple");
    const tw3 = (W - 2 * M - 44 - 2 * 12) / 3;
    per.forEach(([l, d], i) => { const a = back(d), b = sback(d), bx = M + 22 + (i % 3) * (tw3 + 12), by = yy + Math.floor(i / 3) * 76; rr(c, bx, by, tw3, 66, 10); fill(c, TINT.purple);
      tx(c, l, bx + 12, by + 26, { s: 19, w: 700, col: C.ink2 }); tx(c, pc(a), bx + tw3 - 12, by + 28, { s: 24, w: 800, col: sc(a), f: MONO, a: "right" });
      tx(c, `S&P 500 ${pc(b)}`, bx + 12, by + 54, { s: 18, w: 600, col: C.muted }); const dd = a != null && b != null ? a - b : null; tx(c, dd == null ? "" : `${dd >= 0 ? "beat by" : "behind by"} ${pc(Math.abs(dd), 0).replace(/^[+−-]/, "")}`, bx + tw3 - 12, by + 54, { s: 18, w: 700, col: sc(dd, 0), a: "right" }); });
    y += rh2 + 16;
    // 3 the company's figures
    const f = ((FUND && FUND.d) || {})[tk] || [], [, eps12, rev12, ni12, de, cur = "USD", mrq, qEnd, qRev, qNi, qEps, yRev, yNi, yEps] = f;
    const g = (a, b) => a != null && b ? (a - b) / Math.abs(b) : null, vs = (q) => q == null ? "" : `${q >= 0 ? "+" : "−"}${Math.abs(q * 100).toFixed(0)}% on a year ago`;
    const w52 = x.slice(Math.max(0, li - 251), li + 1).filter((v) => v != null), h52 = Math.max(...w52), l52 = Math.min(...w52), pe = eps12 > 0 ? x[li] / eps12 : null;
    const tiles = [["Profit per share (EPS)", qEps != null ? `$${qEps.toFixed(2)}` : "–", vs(g(qEps, yEps))], ["Price ÷ earnings (P/E)", pe ? `${pe.toFixed(1)}×` : "n/a", "price ÷ 12-month EPS"], ["Sales · quarter", H.usd(qRev ?? rev12), vs(g(qRev, yRev))],
      ["Profit · quarter", H.usd(qNi ?? ni12), qRev && qNi != null ? `${(qNi / qRev * 100).toFixed(0)}% of sales` : ""], ["Debt ÷ equity", de == null ? "–" : `${de.toFixed(2)}×`, de == null ? "" : de < 0.5 ? "low debt" : de > 2 ? "high debt" : "moderate debt"],
      ["52-week range", `${fmtPx(l52)}–${fmtPx(h52)}`, x[li] >= h52 * 0.999 ? "at its high" : `${pc(x[li] / h52 - 1)} from the high`]];
    const fh = BOTTOM - y; card(c, M, y, W - 2 * M, fh, "gold"); yy = title(c, M + 22, y + 18, 3, `The company · quarter to ${qEnd ? date(qEnd, { day: "numeric", month: "short", year: "numeric" }) : "latest"}`, "gold");
    const th3 = Math.min(130, (y + fh - 16 - yy - 12) / 2);
    tiles.forEach(([l, v, s3], i) => { const bx = M + 22 + (i % 3) * (tw3 + 12), by = yy + Math.floor(i / 3) * (th3 + 12); rr(c, bx, by, tw3, th3, 10); fill(c, TINT.gold);
      tx(c, l, bx + 12, by + 27, { s: 19, w: 700, col: C.gold, max: tw3 - 24 }); tx(c, v, bx + 12, by + th3 / 2 + 16, { s: 28, w: 800, col: C.ink, f: MONO, max: tw3 - 24 });
      if (s3) tx(c, s3, bx + 12, by + th3 - 10, { s: 17, w: 700, col: /^\+/.test(s3) ? C.up : /^−/.test(s3) ? C.down : C.ink2, max: tw3 - 24 }); });
    footer(c, `Yahoo Finance prices and company figures${FUND && FUND.asof ? ` (checked ${date(FUND.asof)})` : ""} · Not advice`);
  }

  // ---------- 9. aftermath ----------
  async function aftermath(c) {
    const A = await H.loadAfter(), list = (A && A.stocks) || []; if (!list.length) return "No Aftermath stocks yet.";
    const s = list.find((x) => x.tk === Q.af) || list[0], full0 = s.series || [], pk0 = Math.max(0, full0.findIndex((p) => p[0] >= s.peak)), lastD = full0.length ? full0[full0.length - 1][0] : s.peak;
    const from = Q.afr === "peak" ? (full0[Math.max(0, pk0 - 15)] || [s.peak])[0] : !Q.afr || Q.afr === "all" ? "" : new Date(Date.parse(lastD + "T00:00:00Z") - +Q.afr * 864e5).toISOString().slice(0, 10);
    const full = full0.filter((p) => p[0] >= from), // London prices are in pence, other foreign listings in their home currency
      cur = s.tk.endsWith(".L") ? "p" : s.tk.includes(".") ? "" : "$", money = (v) => cur === "$" ? fmtPx(v) : `${fmtPx(v, "")}${cur}`;
    let y = header(c, "Aftermath · steady stocks that kept falling", s.name, s.name, `**${s.tk}** · ${s.industry || s.sector}${s.cause ? ` · ${plain(s.cause)}` : ""}`, { ts: 60 });
    // 1 the fall
    const hh = 150; card(c, M, y, W - 2 * M, hh, "red"); let yy = title(c, M + 22, y + 18, 1, "The fall", "red");
    tx(c, pc(s.drop), M + 22, yy + 62, { s: 68, w: 900, col: C.down, f: MONO });
    tx(c, `since its record on ${date(s.peak, { day: "numeric", month: "short", year: "numeric" })}`, M + 22, yy + 92, { s: 20, w: 600, col: C.ink2 });
    const cx = M + 440; [["Record", money(s.peak_px)], ["Now", money(s.now_px)], ["Falling for", `${s.days} days`]].forEach(([l, v], i) => { const bx = cx + i * 184; rr(c, bx, y + 30, 172, 96, 12); fill(c, TINT.red);
      tx(c, l, bx + 14, y + 60, { s: 19, w: 700, col: C.red }); tx(c, v, bx + 14, y + 104, { s: 27, w: 800, col: C.ink, f: MONO, max: 148 }); });
    y += hh + 16;
    // 2 the chart, numbered events, the same days for its industry and the S&P 500
    const evs = (s.events || []).slice(0, 4), chH = 420; card(c, M, y, W - 2 * M, chH, "blue"); yy = title(c, M + 22, y + 18, 2, "Share price and what happened", "blue");
    let kx = M + 22; [["Same days: its industry", s.sector_move], ["S&P 500", s.spy]].forEach(([l, r]) => { kx += chip(c, kx, yy, l, pc(r, 0), sc(r, 0), "blue", 19) + 10; });
    const ds = full.map((p) => p[0]), vs = full.map((p) => p[1]), atI = (d) => { const i = ds.findIndex((z) => z >= d); return i < 0 ? ds.length - 1 : i; };
    chart(c, M + 22, yy + 40, W - 2 * M - 44, y + chH - (yy + 40) - 12, ds, vs, { yFmt: (v) => Math.round(v).toLocaleString(), yTitle: `Price (${cur === "p" ? "pence" : cur === "$" ? "$" : "local currency"})`, xTitle: "", shadeFrom: atI(s.peak),
      marks: evs.map((e, j) => ({ i: atI(e.date), t: String(j + 1), col: e.kind === "good" ? C.up : e.kind === "peak" ? C.blue : C.down })) });
    y += chH + 16;
    // 3 the events, and 4 why it fell, in full
    const why = plain(s.why || s.summary || ""), inW = W - 2 * M - 44;
    const evH = (sz) => 46 + evs.reduce((a, e) => a + paraH(c, plain(e.text), inW - 150, sz) + 8, 0) + 8, whyH = (sz) => why ? 46 + paraH(c, why, inW, sz) + 18 : 0;
    const sz = fitS((q) => evH(q) + whyH(q) + 16, BOTTOM - y, 23, 17);
    card(c, M, y, W - 2 * M, evH(sz), "gold"); yy = title(c, M + 22, y + 18, 3, "What happened", "gold");
    evs.forEach((e, j) => { const col = e.kind === "good" ? C.up : e.kind === "peak" ? C.blue : C.down; c.fillStyle = col; c.beginPath(); c.arc(M + 36, yy + 15, 14, 0, 7); c.fill(); tx(c, String(j + 1), M + 36, yy + 22, { s: 17, w: 800, col: "#fff", a: "center" });
      tx(c, date(e.date), M + 60, yy + sz, { s: sz, w: 800, col: C.ink, f: MONO }); yy = para(c, plain(e.text), M + 22 + 150, yy, inW - 150, { s: sz }) + 8; });
    y += evH(sz) + 16;
    if (why) { card(c, M, y, W - 2 * M, whyH(sz), "green"); yy = title(c, M + 22, y + 18, 4, "Why it kept falling", "green"); para(c, why, M + 22, yy, inW, { s: sz, col: C.ink }); }
    footer(c, "Daily closes · timeline from news reports · Not advice");
  }

  // ---------- 10. investments ----------
  async function invest(c) {
    const I = await H.loadInvest(), P = await H.loadAllPrices(); if (!I || !I.deals || !I.deals.length) return "No deals yet.";
    const d = I.deals[+Q.deal] || I.deals[0], L = P.dates.length - 1;
    const last = (tk) => { const x = P.px[tk]; const i = H.lastIdx(x); return i >= 0 ? x[i] : null; }, at = (tk, dt) => { const x = P.px[tk]; let i = P.dates.findIndex((z) => z >= dt); if (!x || i < 0) return null; for (; i <= L; i++) if (x[i] != null) return x[i]; return null; };
    let y = header(c, `Investments · ${date(d.date, { day: "numeric", month: "short", year: "numeric" })} · ${clean(d.status)}`, clean(d.title), plain(d.center.name), "", { ts: 46 });
    y -= 6; const inW = W - 2 * M - 44, KC = { gov: "blue", person: "purple", company: "gold" };
    // 1 the money in
    const ins = d.inflows.slice(0, 4), hw = (inW - 14) / 2;
    const boxH = (s) => Math.max(...ins.map((f) => 64 + paraH(c, clean(f.note), hw - 32, s))) + 14;
    const sIn = fitS(boxH, 150, 20, 17), bh = boxH(sIn), h1 = 46 + 10 + 2 * bh + 14 + 14;
    card(c, M, y, W - 2 * M, h1, "blue"); let yy = title(c, M + 22, y + 18, 1, "The money in", "blue") + 6;
    ins.forEach((f, i) => { const col = KC[f.kind] || "gold", bx = M + 22 + (i % 2) * (hw + 14), by = yy + Math.floor(i / 2) * (bh + 14);
      rr(c, bx, by, hw, bh, 12); fill(c, TINT[col]); c.fillStyle = C[col]; rr(c, bx, by, 6, bh, 3); c.fill();
      tx(c, clean(f.name), bx + 18, by + 30, { s: 23, w: 800, col: C.ink, max: hw - 30 }); tx(c, clean(f.amount), bx + 18, by + 58, { s: 22, w: 800, col: C[col], max: hw - 30 });
      para(c, clean(f.note), bx + 18, by + 66, hw - 32, { s: sIn }); });
    y += h1 + 14;
    // 2 the company it goes into
    const h2 = 104; card(c, M, y, W - 2 * M, h2, "navy", { tint: true }); c.strokeStyle = C.navy; c.lineWidth = 2; rr(c, M, y, W - 2 * M, h2, 18); c.stroke();
    tx(c, plain(d.center.name), M + 26, y + 52, { s: 40, w: 900, col: C.navy }); tx(c, plain(d.center.sub || ""), M + 26, y + 86, { s: 21, w: 600, col: C.ink2 });
    if (d.center.value) { const m = plain(d.center.value).match(/^(\S+)\s*(.*)$/); tx(c, "Valued at", W - M - 26, y + 34, { s: 19, w: 700, col: C.muted, a: "right" });
      tx(c, m[1], W - M - 26, y + 70, { s: 34, w: 800, col: C.ink, f: MONO, a: "right" }); if (m[2]) tx(c, m[2].replace(/^\(|\)$/g, ""), W - M - 26, y + 94, { s: 18, w: 600, col: C.muted, a: "right" }); }
    y += h2 + 14;
    // 4 the stake and 5 the summary take what they need; 3 the linked companies get the rest
    const tiles = []; for (const x of d.tiles || []) if (x.stake && last(x.stake.tk)) { const now = last(x.stake.tk); tiles.push([clean(x.label), H.usd(x.stake.shares * now), now / x.stake.price - 1, x.stake]); }
    const outs = d.links.slice(0, 4), sum = clean(d.summary);
    const linkH = (s) => 46 + outs.reduce((a, l) => a + 58 + paraH(c, clean(l.note || ""), inW - 24, s) + 12, 0) + 6;
    const sumH = (s) => 46 + paraH(c, sum, inW, s + 1) + 16, stakeH = tiles.length ? 96 : 0;
    const sz = fitS((s) => linkH(s) + sumH(s) + 16, BOTTOM - y - stakeH - (stakeH ? 14 : 0), 21, 16);
    const h3 = linkH(sz); card(c, M, y, W - 2 * M, h3, "gold"); yy = title(c, M + 22, y + 18, 2, "Listed companies linked · move since the news", "gold");
    outs.forEach((l) => { const now = last(l.tk), then = at(l.tk, d.date), r = now && then ? now / then - 1 : null;
      rr(c, M + 22, yy, 92, 36, 8); fill(c, TINT.gold); tx(c, l.tk, M + 68, yy + 26, { s: 21, w: 800, col: C.ink, f: MONO, a: "center" });
      const nw = tx(c, co(l.tk), M + 128, yy + 27, { s: 23, w: 800 }); tx(c, `· ${clean(l.role)}`, M + 138 + nw, yy + 27, { s: 21, w: 700, col: C.gold, max: inW - 260 - nw });
      tx(c, r != null ? pc(r) : "–", W - M - 22, yy + 28, { s: 26, w: 800, col: sc(r), f: MONO, a: "right" });
      yy = para(c, clean(l.note || ""), M + 22, yy + 46, inW - 24, { s: sz }) + 12; });
    y += h3 + 14;
    if (tiles.length) { const [lab, val, r, st] = tiles[0]; card(c, M, y, W - 2 * M, 96, "teal", { tint: true });
      caps(c, lab, M + 22, y + 34, C.teal, 20); tx(c, val, M + 22, y + 78, { s: 36, w: 800, col: C.ink, f: MONO });
      tx(c, `${pc(r, 0)} since bought`, W - M - 22, y + 44, { s: 24, w: 800, col: sc(r, 0), a: "right" }); tx(c, `bought ${date(st.date, { day: "numeric", month: "short", year: "numeric" })} at $${st.price}`, W - M - 22, y + 76, { s: 19, w: 600, col: C.ink2, a: "right" });
      y += 96 + 14; }
    card(c, M, y, W - 2 * M, sumH(sz), "green"); yy = title(c, M + 22, y + 18, 3, "The deal", "green"); para(c, sum, M + 22, yy, inW, { s: sz + 1, col: C.ink });
    footer(c, `${d.sources.length} filings and reports, listed on the Investments page · Yahoo Finance · Not advice`);
  }

  // ---------- 11. production map ----------
  async function prodmap(c) {
    if (String(Q.pmi || "").startsWith("grp:")) return FB;
    const D2 = await H.loadProd(), Wd = await H.loadWorld(); if (!D2) return "Production data hasn't loaded.";
    const it = D2.items[Q.pmi] || D2.items.chips, isPct = /^%/.test(it.unit), fv = (v) => isPct ? `${v}%` : v.toLocaleString();
    let y = header(c, `Where it's made · ${it.year.replace(/ \(.*\)$/, "")}`, it.name, "", on("pmwhy") ? plain(it.why) : "");
    // 1 the map, zoomed in on where it's made
    const mapH = BOTTOM - y - 200 - 16 - 150 - 16; card(c, M, y, W - 2 * M, mapH, "blue"); let yy = title(c, M + 22, y + 18, 1, "Where it's made", "blue");
    const mx0 = M + 16, my0 = yy, mw = W - 2 * M - 32, mh = y + mapH - 16 - yy;
    if (Wd && window.d3) { const d3 = window.d3, feats = Wd.features.filter((f) => f.id !== "010"), land = { type: "FeatureCollection", features: feats };
      const proj = d3.geoNaturalEarth1().fitHeight(mh * 1.0, land), b0 = d3.geoPath(proj).bounds(land); let sx = 0, sw = 0;
      for (const [, id, v] of it.rows) { const f = feats.find((g) => g.id === String(id).padStart(3, "0")); if (f) { sx += d3.geoPath(proj).centroid(f)[0] * v; sw += v; } }
      const scale = mh / (b0[1][1] - b0[0][1]) * 1.25; proj.scale(proj.scale() * scale); const b1 = d3.geoPath(proj).bounds(land), [t0, t1] = proj.translate();
      let cx0 = 0, cw0 = 0; for (const [, id, v] of it.rows) { const f = feats.find((g) => g.id === String(id).padStart(3, "0")); if (f) { const [px, py] = d3.geoPath(proj).centroid(f); cx0 += px * v; cw0 += py * v; } }
      const ccx = cx0 / sw, ccy = cw0 / sw; proj.translate([t0 + mx0 + mw / 2 - ccx, t1 + my0 + mh / 2 - ccy]);
      const path = d3.geoPath(proj, c), val = new Map(); for (const [, n2, v] of it.rows) val.set(String(n2).padStart(3, "0"), v); const mxv = Math.max(...val.values());
      c.save(); rr(c, mx0, my0, mw, mh, 12); c.clip(); c.fillStyle = "#dbe7f7"; c.fillRect(mx0, my0, mw, mh);
      for (const f of feats) { const v = val.get(f.id); c.beginPath(); path(f); c.fillStyle = v ? C.blue : "#f6f8fb"; c.globalAlpha = v ? 0.35 + 0.65 * v / mxv : 1; c.fill(); c.globalAlpha = 1; c.strokeStyle = "#b9c6d8"; c.lineWidth = 0.8; c.stroke(); }
      const spots = (on("pmbub") ? it.rows.slice(0, 5) : []).map(([nm, id, v]) => { const f = feats.find((g) => g.id === String(id).padStart(3, "0")); if (!f) return null; const [px, py] = path.centroid(f); return { nm: nm.split(" (")[0], v, px, py, r: 12 + 26 * Math.sqrt(v / mxv) }; }).filter(Boolean);
      for (const b of spots) { c.fillStyle = C.red; c.globalAlpha = 0.9; c.beginPath(); c.arc(b.px, b.py, b.r, 0, 7); c.fill(); c.globalAlpha = 1; c.strokeStyle = "#fff"; c.lineWidth = 3; c.stroke(); }
      spots.forEach((b, i) => { const lab = `${b.nm} ${fv(b.v)}`; font(c, 800, 26); const lw = c.measureText(lab).width + 24, lx = Math.min(Math.max(i % 2 ? b.px + b.r + 14 : b.px - b.r - 14 - lw, mx0 + 8), mx0 + mw - lw - 8), ly = b.py - 20 + (i % 2 ? -18 : 6);
        rr(c, lx, ly, lw, 40, 10); fill(c, "#fff"); c.strokeStyle = C.red; c.lineWidth = 2; c.stroke(); tx(c, lab, lx + 12, ly + 29, { s: 26, w: 800, col: C.ink }); });
      c.restore(); }
    y += mapH + 16;
    // 2 the share of the world, as one bar with an axis
    const h2 = 200; card(c, M, y, W - 2 * M, h2, "gold");
    if (isPct) {
    const rest = Math.max(0, 100 - it.rows.reduce((a, r) => a + r[2], 0)), parts = it.rows.slice(0, 6).map(([nm, , v]) => [nm.split(" (")[0], v]).concat(rest >= 1 ? [["Everyone else", rest]] : []);
    yy = title(c, M + 22, y + 18, 2, `Share of the world · ${it.unit.replace(/^% of /, "")}`, "gold", W - 2 * M - 44);
    const bx = M + 22, bw = W - 2 * M - 44; let x = bx; const PC = [C.blue, C.gold, C.teal, C.purple, C.red, C.navy];
    parts.forEach(([nm, v], i) => { const w = bw * v / 100; rr(c, x + 1, yy + 4, Math.max(4, w - 2), 70, 10); fill(c, nm === "Everyone else" ? C.grid : PC[i % PC.length]);
      if (w > 120) { tx(c, `${v}%`, x + 16, yy + 38, { s: 28, w: 800, col: nm === "Everyone else" ? C.ink : "#fff", f: MONO }); tx(c, nm, x + 16, yy + 64, { s: 20, w: 700, col: nm === "Everyone else" ? C.ink2 : "#fff", max: w - 24 }); }
      else if (w > 24) tx(c, `${nm} ${v}%`, Math.min(x + w, bx + bw), yy - 2, { s: 19, w: 800, col: C.ink, a: "right" });
      x += w; });
    for (const t of [0, 25, 50, 75, 100]) { const tx0 = bx + bw * t / 100; c.fillStyle = C.ink2; c.fillRect(tx0 - 1, yy + 78, 2, 8); tx(c, `${t}%`, Math.min(Math.max(tx0, bx + 18), bx + bw - 22), yy + 108, { s: 18, w: 600, col: C.muted, a: "center" }); }
    tx(c, "share of the world", bx + bw / 2, yy + 132, { s: 18, w: 700, col: C.muted, a: "center" });
    } else {
      yy = title(c, M + 22, y + 18, 2, `Biggest producers · ${it.unit}`, "gold", W - 2 * M - 44);
      const top = it.rows.slice(0, 3), mxv = top[0][2], bx = M + 22 + 230, bw = W - 2 * M - 44 - 230 - 120;
      top.forEach(([nm, , v], i) => { const ry = yy + i * 38; tx(c, nm.split(" (")[0], M + 22, ry + 26, { s: 21, w: 700, max: 220 }); rr(c, bx, ry + 10, Math.max(4, bw * v / mxv), 20, 10); fill(c, [C.blue, C.gold, C.teal][i]); tx(c, fv(v), W - M - 22, ry + 27, { s: 21, w: 800, f: MONO, a: "right" }); });
      tx(c, `world total ${it.world}`, M + 22, yy + 3 * 38 + 22, { s: 18, w: 700, col: C.muted });
    }
    y += h2 + 16;
    // 3 the producers, written out
    const h3 = BOTTOM - y; card(c, M, y, W - 2 * M, h3, "teal"); yy = title(c, M + 22, y + 18, 3, "Who makes them", "teal");
    const lines3 = it.rows.slice(0, 5).map((r, i) => `**${r[0].split(" (")[0]}**${i ? "" : " makes the most"}: **${fv(r[2])}**${isPct ? "" : ` ${it.unit}`}.`);
    para(c, `${lines3.join(" ")} World total: ${it.world}. Source: ${plain(it.source).split(/[,:]/)[0]}, figures for ${it.year.replace(/ \(.*\)$/, "")}.`, M + 22, yy, W - 2 * M - 44, { s: 22, col: C.ink2 });
    footer(c, `${plain(it.source).split(/[,:]/)[0]} · Figures rounded · Not advice`);
  }

  // ---------- 12. production supply chain ----------
  const WORDS = [[/three[- ]quarters/i, 75], [/two[- ]thirds/i, 67], [/(over |about |roughly )?half/i, 50], [/a third/i, 33], [/a quarter/i, 25], [/a fifth/i, 20]];
  function sharePart(txt) { const t = plain(txt), m = t.match(/^(~|about |over |roughly |nearly )?(\d+(?:\.\d+)?)\s*%(?=\s*(of\b|\(|,|and\b|$))/i);
    if (m) return { v: +m[2], approx: !!m[1], rest: t.slice(m[0].length).trim() }; for (const [re, v] of WORDS) { const w = t.match(re); if (w && w.index === 0) return { v, approx: true, rest: t.slice(w[0].length).trim() }; } return null; }
  async function prodchain(c) {
    if (String(Q.item || "").startsWith("grp:")) return FB;
    const D2 = await H.loadProd(); if (!D2) return "Production data hasn't loaded.";
    const it = D2.items[Q.item] || D2.items.chips, chain = it.chain || []; if (!chain.length) return `No supply chain written for ${it.name} yet.`;
    let y = header(c, `Supply chain · ${it.name}`, `${it.name}: the supply chain`, "", "Every step from raw material to market, and the country each step leans on.", { ts: 52 });
    const PAL = ["blue", "gold", "purple", "teal", "red", "navy"], cols = new Map(), cnt = new Map();
    for (const st of chain) { const w = plain(st.where); if (!cols.has(w)) cols.set(w, PAL[cols.size % PAL.length]); cnt.set(w, (cnt.get(w) || 0) + 1); }
    caps(c, "It depends on", M, y + 26, C.ink2, 22); let lx = M + 200;
    for (const [w, k] of cnt) { const lab = k > 1 ? `${w} ×${k}` : w; font(c, 800, 21); const cw = c.measureText(lab).width + 30; if (lx + cw > W - M) { lx = M + 200; y += 46; }
      rr(c, lx, y, cw, 38, 19); fill(c, C[cols.get(w)]); tx(c, lab, lx + 15, y + 27, { s: 21, w: 800, col: "#fff" }); lx += cw + 10; }
    y += 58;
    const n = chain.length, gap = 12, ch = Math.floor((BOTTOM - y - gap * (n - 1)) / n), rx = M + 26, x0 = M + 66;
    c.fillStyle = "#c9d3e2"; c.fillRect(rx - 3, y + ch / 2, 6, (n - 1) * (ch + gap));
    chain.forEach((st, i) => { const cy = y + i * (ch + gap), col = cols.get(plain(st.where)), sp = sharePart(st.share);
      c.fillStyle = C[col]; c.beginPath(); c.arc(rx, cy + ch / 2, 25, 0, 7); c.fill(); c.strokeStyle = C.bg; c.lineWidth = 5; c.stroke(); tx(c, String(i + 1), rx, cy + ch / 2 + 9, { s: 25, w: 800, col: "#fff", a: "center" });
      card(c, x0, cy, W - M - x0, ch, null); c.save(); rr(c, x0, cy, W - M - x0, ch, 18); c.clip(); c.fillStyle = C[col]; c.fillRect(x0, cy, 8, ch); c.restore();
      const R = 52, ringX = W - M - 24 - R, tw = ringX - R - 20 - (x0 + 26);
      caps(c, plain(st.step), x0 + 26, cy + 34, C[col], 21);
      tx(c, plain(st.where), x0 + 26, cy + 72, { s: 34, w: 900, max: tw }); tx(c, plain(st.who), x0 + 26, cy + 102, { s: 21, w: 600, col: C.ink2, max: tw });
      const words = sp ? `of ${sp.rest.replace(/^of\s+/i, "")}` : plain(st.share), s = fitS((q) => paraH(c, words, tw, q, 700, 1.25), cy + ch - 8 - (cy + 110), 21, 16);
      para(c, words, x0 + 26, cy + 110, tw, { s, w: 700, col: C.ink, lh: 1.25 });
      if (sp) { c.lineWidth = 14; c.strokeStyle = TINT[col]; c.beginPath(); c.arc(ringX, cy + ch / 2, R, 0, 7); c.stroke(); c.strokeStyle = C[col]; c.lineCap = "round"; c.beginPath(); c.arc(ringX, cy + ch / 2, R, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * Math.min(1, sp.v / 100)); c.stroke(); c.lineCap = "butt";
        tx(c, `${sp.approx ? "~" : ""}${sp.v}%`, ringX, cy + ch / 2 + 9, { s: 25, w: 800, col: C.ink, a: "center", f: MONO }); }
      else { rr(c, ringX - R, cy + ch / 2 - 26, 2 * R, 52, 26); fill(c, TINT[col]); tx(c, "Most", ringX, cy + ch / 2 + 9, { s: 25, w: 800, col: C[col], a: "center" }); } });
    footer(c, "USGS · Energy Institute · TrendForce · ASML · IEA · Not advice");
  }

  // ---------- 13. AI bubble watch ----------
  async function aiwatch(c) {
    const A = await H.loadAIB(), cw = A.coreweave, inW = W - 2 * M - 44;
    let y = header(c, `AI bubble watch · updated ${date(A.updated, { day: "numeric", month: "short", year: "numeric" })}`, "What's moving the AI bubble", "AI bubble", "The AI labs heading for the stock market, and the debt behind the AI build-out.", { ts: 54 });
    // 2 CoreWeave and 3 the labs have fixed sizes; 1 the news and 4 what to watch share the rest
    const cwH = 46 + 2 * 128 + 12 + 16, labsH = 46 + 182 + 14, ups = A.updates.slice(0, 3), watch = A.watch.slice(0, 5);
    const newsH = (s) => 46 + ups.reduce((a, u) => a + paraH(c, plain(u.text), inW - 120, s) + 12, 0) + 4, watchH = (s) => 46 + Math.ceil(watch.length / 2) * (paraH(c, "x", 100, s) + 10) + 8;
    const sz = fitS((s) => newsH(s) + watchH(s) + 32, BOTTOM - y - cwH - labsH, 22, 16);
    card(c, M, y, W - 2 * M, newsH(sz), "blue"); let yy = title(c, M + 22, y + 18, 1, "What's new", "blue");
    ups.forEach((u) => { rr(c, M + 22, yy, 100, 32, 8); fill(c, TINT.blue); tx(c, date(u.date), M + 72, yy + 23, { s: 19, w: 800, col: C.blue, a: "center", f: MONO }); yy = para(c, plain(u.text), M + 140, yy, inW - 120, { s: sz }) + 12; });
    y += newsH(sz) + 16;
    card(c, M, y, W - 2 * M, cwH, "red"); yy = title(c, M + 22, y + 18, 2, `CoreWeave · the AI debt worry · ${date(cw.asOf)}`, "red");
    const tw = (inW - 12) / 2, tiles = cw.stats.slice(0, 3);
    tiles.forEach((s, i) => { const bx = M + 22 + (i % 2) * (tw + 12), by = yy + Math.floor(i / 2) * 140; rr(c, bx, by, tw, 128, 12); fill(c, TINT.red);
      tx(c, plain(s.label), bx + 14, by + 28, { s: 19, w: 800, col: C.red, max: tw - 28 }); tx(c, plain(s.value), bx + 14, by + 68, { s: 34, w: 800, col: C.ink, f: MONO, max: tw - 28 });
      para(c, plain(s.note), bx + 14, by + 76, tw - 28, { s: fitS((q) => paraH(c, plain(s.note), tw - 28, q), 46, 18, 15), lh: 1.25 }); });
    { const bx = M + 22 + tw + 12, by = yy + 140, o = cw.defaultOdds; rr(c, bx, by, tw, 128, 12); fill(c, TINT.red); const cx = bx + 66, cy = by + 64;
      c.lineWidth = 16; c.strokeStyle = "#f3c9c9"; c.beginPath(); c.arc(cx, cy, 44, 0, 7); c.stroke(); c.strokeStyle = C.red; c.beginPath(); c.arc(cx, cy, 44, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * o.value); c.stroke();
      tx(c, `${Math.round(o.value * 100)}%+`, cx, cy + 8, { s: 22, w: 800, col: C.ink, a: "center", f: MONO }); tx(c, "Default odds", bx + 128, by + 30, { s: 19, w: 800, col: C.red });
      para(c, "chance of default within 5 years, as priced by its credit default swaps", bx + 128, by + 38, tw - 142, { s: 18, lh: 1.25 }); }
    y += cwH + 16;
    card(c, M, y, W - 2 * M, labsH, "purple"); yy = title(c, M + 22, y + 18, 3, "The private AI labs", "purple");
    A.labs.slice(0, 2).forEach((l, i) => { const bx = M + 22 + i * (tw + 12); rr(c, bx, yy, tw, 182, 12); fill(c, TINT.purple);
      tx(c, l.name, bx + 16, yy + 38, { s: 28, w: 900 }); tx(c, plain(l.label), bx + tw - 16, yy + 40, { s: 32, w: 800, col: C.purple, f: MONO, a: "right" });
      para(c, plain(l.status), bx + 16, yy + 52, tw - 32, { s: fitS((q) => paraH(c, plain(l.status), tw - 32, q), 118, 20, 15), lh: 1.3 }); });
    y += labsH + 16;
    card(c, M, y, W - 2 * M, watchH(sz), "teal"); yy = title(c, M + 22, y + 18, 4, "What to watch", "teal");
    watch.forEach((w, i) => { const bx = M + 22 + (i % 2) * (tw + 12), by = yy + Math.floor(i / 2) * (paraH(c, "x", 100, sz) + 10); c.fillStyle = C.teal; c.beginPath(); c.arc(bx + 7, by + sz * 0.6, 6, 0, 7); c.fill(); tx(c, plain(w), bx + 22, by + sz, { s: sz, w: 600, col: C.ink, max: tw - 26, min: 14 }); });
    footer(c, `${Object.keys(A.sources).length} dated sources on the AI bubble page · private values as reported · Not advice`);
  }

  // ---------- 14. where is the AI bubble ----------
  async function bubble(c) {
    const A = await H.loadAIB(), P = await H.loadAllPrices(), L = P.dates.length - 1, kk = +Q.buyr || 252, spanW = { 63: "Past 3 months", 126: "Past 6 months", 252: "Past year" }[kk] || "Past year", yr = (tk) => { const x = P.px[tk]; return x && x[L] && x[L - kk] ? x[L] / x[L - kk] - 1 : null; };
    let y = header(c, `AI bubble · ${date(P.dates[L], { day: "numeric", month: "short", year: "numeric" })}`, "Where is the AI bubble?", "AI bubble",
      "Listed AI companies are priced on fast-growing profits. The private AI labs about to sell shares are priced on hope.", { ts: 56 });
    // 1 two bubbles
    const h1 = 250; card(c, M, y, W - 2 * M, h1, "red"); let yy = title(c, M + 22, y + 18, 1, "Two kinds of AI company", "red");
    const by = yy + 92, ax = M + 230, bx = W - M - 250;
    c.setLineDash([9, 7]); c.fillStyle = TINT.green; c.strokeStyle = C.green; c.lineWidth = 3; c.beginPath(); c.arc(ax, by, 88, 0, 7); c.fill(); c.stroke(); c.setLineDash([]);
    tx(c, "AI stocks", ax, by - 10, { s: 28, w: 900, col: C.green, a: "center" }); tx(c, "priced on profits", ax, by + 22, { s: 20, w: 600, col: C.ink2, a: "center" });
    c.fillStyle = TINT.red; c.strokeStyle = C.red; c.beginPath(); c.arc(bx, by, 96, 0, 7); c.fill(); c.stroke();
    tx(c, "Private AI labs", bx, by - 30, { s: 23, w: 900, col: C.red, a: "center" }); A.labs.slice(0, 2).forEach((l, i) => tx(c, `${l.name} ${plain(l.label)}`, bx, by + 2 + i * 28, { s: 21, w: 700, col: C.ink, a: "center" }));
    tx(c, "the bigger risk", bx, by + 66, { s: 19, w: 800, col: C.red, a: "center" });
    c.strokeStyle = C.muted; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 110, by - 40); c.quadraticCurveTo((ax + bx) / 2, by - 90, ax + 102, by - 30); c.stroke();
    c.fillStyle = C.muted; c.beginPath(); c.moveTo(ax + 96, by - 24); c.lineTo(ax + 118, by - 30); c.lineTo(ax + 104, by - 46); c.closePath(); c.fill();
    tx(c, "listing soon", (ax + bx) / 2, by - 76, { s: 19, w: 800, col: C.muted, a: "center" });
    y += h1 + 16;
    // 2 where the labs rank, as bars with a value axis
    const big = Object.entries(H.stocks).filter(([t, s]) => s[4] > 5e11 && t !== "GOOG").map(([t, s]) => ({ name: co(t), v: s[4] }));
    const ranked = [...big, ...A.labs.map((l) => ({ name: `${l.name} (private)`, v: l.value, lab: true, label: plain(l.label) }))].sort((a, b) => b.v - a.v).slice(0, +Q.bun || 12), vmx = Math.ceil(ranked[0].v / 1e12);
    const h3 = 46 + 4 * 34 + 16, h2 = BOTTOM - y - h3 - 16; card(c, M, y, W - 2 * M, h2, "blue"); yy = title(c, M + 22, y + 18, 2, "America's biggest companies, with the labs", "blue");
    const lx0 = M + 22 + 40 + 230, bw = W - M - 22 - 110 - lx0, rh = Math.floor((y + h2 - 56 - yy) / ranked.length);
    ranked.forEach((r, i) => { const ry = yy + i * rh; if (r.lab) { rr(c, M + 14, ry, W - 2 * M - 28, rh - 2, 8); fill(c, TINT.red); }
      tx(c, String(i + 1), M + 26, ry + rh / 2 + 7, { s: 19, w: 700, col: C.muted, f: MONO }); tx(c, r.name, M + 62, ry + rh / 2 + 8, { s: 21, w: r.lab ? 800 : 600, col: C.ink, max: 222 });
      rr(c, lx0, ry + rh / 2 - 9, Math.max(4, bw * r.v / (vmx * 1e12)), 18, 9); fill(c, r.lab ? C.red : C.blue);
      tx(c, r.label || H.usd(r.v), W - M - 22, ry + rh / 2 + 8, { s: 21, w: 800, col: C.ink, f: MONO, a: "right" }); });
    const ay = yy + ranked.length * rh + 4; c.fillStyle = C.ink2; c.fillRect(lx0, ay, bw, 2);
    for (let t = 0; t <= vmx; t++) { const x = lx0 + bw * t / vmx; c.fillRect(x - 1, ay, 2, 8); tx(c, `$${t}T`, x, ay + 28, { s: 18, w: 600, col: C.muted, a: "center" }); }
    tx(c, "company value (trillions of dollars)", lx0 + bw / 2, ay + 50, { s: 18, w: 700, col: C.muted, a: "center" });
    y += h2 + 16;
    // 3 the past year: chipmakers against the data-centre renters
    card(c, M, y, W - 2 * M, h3, "gold"); yy = title(c, M + 22, y + 18, 3, `${spanW}: AI chipmakers vs data-centre renters`, "gold", W - 2 * M - 44);
    const hw = (W - 2 * M - 44 - 24) / 2;
    [[A.chipmakers, M + 22], [A.neoclouds, M + 22 + hw + 24]].forEach(([list, x]) => list.slice(0, 4).forEach(([nm, tk], i) => { const r = yr(tk), ry = yy + i * 34; rr(c, x, ry, hw, 30, 8); fill(c, TINT.gold);
      tx(c, nm, x + 12, ry + 22, { s: 20, w: 700, col: C.ink }); tx(c, pc(r, 0), x + hw - 12, ry + 23, { s: 21, w: 800, col: sc(r, 0), f: MONO, a: "right" }); }));
    footer(c, `Nasdaq company values · private values as reported (${date(A.labs[0].asOf)}) · Yahoo Finance · Not advice`);
  }

  const V = { today: (c) => movers(c, 1), week: (c) => movers(c, 5), story: (c) => story(c, "today"), storywk: (c) => story(c, "now"), drop, industries, ai, stock, aftermath, invest, prodmap, prodchain, aiwatch, bubble };
  window.HFMarketsPhone = {
    // draws the view on a 1080×1440 canvas; returns null, a message to show instead, or FALLBACK
    async draw(view, c, choices, helpers) {
      if (!V[view] || choices.theme === "dark") return FB;
      Q = choices; X = helpers || {};
      return (await V[view](c)) || null;
    },
  };
})();
