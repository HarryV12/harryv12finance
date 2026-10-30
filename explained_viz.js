/* HarryV12 Finance · Data Visualization, Explained: beginner's guides to how markets work (bonds, stock trades,
   futures, options, money, derivatives, commodities, fundamental analysis, ETFs, EBITDA, dividends), one 1080×1440
   image each, in the same design as the Markets & AI images. Worked examples are labelled as such; the live figures
   (bond, gold, ETF, commodity and NVIDIA numbers) come from the site's own data (window.HFSite). */
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
    // a title still too long at the smallest size goes onto two lines
    let y0 = 80 + s;
    if (c.measureText(ttl).width <= W - 2 * M) tx(c, ttl, M, y0, { s, w: 900 });
    else { const ls = layout(c, ttl, W - 2 * M, s, 900); ls.slice(0, 2).forEach((ln, j) => tx(c, ln.map((q) => q[0]).join(""), M, y0 + j * Math.round(s * 1.12), { s, w: 900, max: W - 2 * M })); y0 += Math.round(s * 1.12) * (Math.min(2, ls.length) - 1); }
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
    // dates along the bottom, the first trading day of each month (every other one when the range is long)
    let lastM = "", n = 0; const step = vals.length > 300 ? 2 : 1;
    for (let i = 1; i < dates.length; i++) { const m = dates[i].slice(0, 7); if (m !== lastM && lastM) { if (n++ % step === 0 && X(i) < x + pw - 20 && X(i) > x + 20) tx(c, H.fmtDate(dates[i], { day: "numeric", month: "short" }), X(i), y + 40 + ph + 26, { s: 18, w: 600, col: C.muted, a: "center" }); } lastM = m; }
    if (xTitle) tx(c, xTitle, x + pw / 2, y + h, { s: 18, w: 700, col: C.muted, a: "center" });
    for (const mk of marks) { const i = mk.i, mx = X(i), my = Y(vals[i]), up = my - 40 > y + 44, ty = up ? my - 34 : my + 34;
      c.strokeStyle = mk.col; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(mx, my); c.lineTo(mx, ty); c.stroke(); c.setLineDash([]);
      c.fillStyle = mk.col; c.beginPath(); c.arc(mx, ty, 16, 0, 7); c.fill(); tx(c, mk.t, mx, ty + 7, { s: 18, w: 800, col: "#fff", a: "center" }); }
    return { X, Y };
  }

  // ======================================================================
  // Explained: beginner's guides to how markets work, one 1080×1440 image each
  // ======================================================================
  const AREA = (x, y, w, h) => ({ x, y, w, h });
  // a numbered section card; returns the area inside it
  function sec(c, x, y, w, h, num, ttl, col) { card(c, x, y, w, h, col); const yy = title(c, x + 22, y + 18, num, ttl, col, w - 44); return AREA(x + 22, yy, w - 44, y + h - 16 - yy); }
  // tinted boxes in a grid: [heading, body, colour?]; the text gets smaller rather than overflow
  function boxes(c, a, items, { cols = items.length, col = "blue", gap = 12, arrows = false, hs = 23, bs = 21, rows, inline = false } = {}) {
    rows = rows || Math.ceil(items.length / cols); const aw = arrows ? 30 : 0, bw = (a.w - (cols - 1) * (gap + aw)) / cols, bh = (a.h - (rows - 1) * gap) / rows, pad = bw < 200 ? 10 : 14;
    const txt = ([h, b]) => inline ? `**${h}** · ${b}` : b;
    const fitH = inline ? hs : fitS((q) => Math.max(...items.map(([h]) => h ? paraH(c, h, bw - 2 * pad, q, 800, 1.15) : 0)), bh * 0.45, hs, 16);
    const fitB = fitS((q) => Math.max(...items.map((it) => (!inline && it[0] ? paraH(c, it[0], bw - 2 * pad, fitH, 800, 1.15) + 4 : 0) + (it[1] ? paraH(c, txt(it), bw - 2 * pad, q, 500, 1.22) : 0))), bh - 12, bs, 16);
    items.forEach(([h, b, cc], i) => { const k = cc || col, x = a.x + (i % cols) * (bw + gap + aw), y = a.y + Math.floor(i / cols) * (bh + gap);
      rr(c, x, y, bw, bh, 12); fill(c, TINT[k]); let yy = y + 9;
      if (inline) { const th = paraH(c, txt([h, b]), bw - 2 * pad, fitB, 500, 1.25); yy = y + (bh - th) / 2 - 2; para(c, txt([h, b]), x + pad, yy, bw - 2 * pad, { s: fitB, lh: 1.25 }); }
      else { if (h) yy = para(c, h, x + pad, yy, bw - 2 * pad, { s: fitH, w: 800, col: C[k], lh: 1.15 }) + 4;
      if (b) para(c, b, x + pad, yy, bw - 2 * pad, { s: fitB, lh: 1.22 }); }
      if (arrows && i % cols < cols - 1) tx(c, "→", x + bw + gap / 2 + aw / 2, y + bh / 2 + 10, { s: 30, w: 800, col: C[k], a: "center" }); });
  }
  // a header bar with bullet lines under it: [bold, rest]
  function bulletCard(c, x, y, w, h, col, head, right, items) {
    card(c, x, y, w, h, null); bar(c, x, y, w, col, head, right);
    const a = AREA(x + 22, y + 62, w - 44, h - 74), lh = a.h / items.length, s = fitS((q) => Math.max(...items.map(([b, r]) => paraH(c, `**${b}**${r ? " · " + r : ""}`, a.w - 26, q, 500, 1.2))), lh - 2, 24, 16);
    items.forEach(([b, r], i) => { const yy = a.y + i * lh; c.fillStyle = C[col]; c.beginPath(); c.arc(a.x + 7, yy + s * 0.62, 6, 0, 7); c.fill(); para(c, `**${b}**${r ? " · " + r : ""}`, a.x + 24, yy, a.w - 26, { s, lh: 1.2 }); });
  }
  // one line or two of plain text in an area
  const note = (c, a, text, { s = 22, col = C.ink2, w = 500 } = {}) => para(c, text, a.x, a.y, a.w, { s: fitS((q) => paraH(c, text, a.w, q, w), a.h, s, 14), col, w });
  // a "remember" band along the bottom: tinted, not heavy
  function keyBand(c, y, label, text, col = "navy") { const h = BOTTOM - y; if (h < 84) return; card(c, M, y, W - 2 * M, h, col, { tint: true }); caps(c, label, M + 24, y + 38, C[col], 20);
    para(c, text, M + 24, y + 50, W - 2 * M - 48, { s: fitS((q) => paraH(c, text, W - 2 * M - 48, q, 600), h - 62, 24, 15), w: 600, col: C.ink }); }
  // a simple bar chart with a value axis: [label, value, colour, top label]
  function bars(c, a, items, { fmt = (v) => v, axis = true, lo = null } = {}) {
    const vals = items.map((i) => i[1]), raw = (Math.max(...vals) * 1.1 - (lo ?? Math.min(0, ...vals))) / 4, p10 = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map((k) => k * p10).find((q) => q >= raw);
    const mn = Math.floor((lo ?? Math.min(0, ...vals)) / step) * step, mx = Math.ceil(Math.max(...vals) * 1.1 / step) * step, pw = a.w - (axis ? 74 : 0), ph = a.h - 64, Y = (v) => a.y + 30 + ph - (v - mn) / (mx - mn) * ph;
    if (axis) for (let v = mn; v <= mx + step / 2; v += step) { c.fillStyle = C.grid; c.fillRect(a.x, Y(v), pw, 1.2); tx(c, fmt(Math.round(v * 10) / 10), a.x + pw + 8, Y(v) + 6, { s: 16, w: 600, col: C.muted, f: MONO }); }
    const gw = pw / items.length, bw = Math.min(110, gw * 0.62);
    items.forEach(([l, v, col, top], i) => { const cx = a.x + i * gw + gw / 2, y1 = Y(Math.max(v, 0)), y2 = Y(Math.min(v, 0) > mn ? Math.min(v, 0) : mn);
      rr(c, cx - bw / 2, y1, bw, Math.max(3, y2 - y1), 6); fill(c, col); tx(c, top ?? fmt(v), cx, y1 - 8, { s: 21, w: 800, col: C.ink, a: "center", f: MONO, max: gw - 4 });
      para(c, l, cx, Y(mn) + 6, gw - 6, { s: 18, w: 700, col: C.ink2, a: "center", lh: 1.15 }); });
    c.fillStyle = C.ink2; c.fillRect(a.x, Y(mn), pw, 2);
  }
  const yr1 = (P, tk) => { const x = P.px[tk]; if (!x) return null; const L = H.lastIdx(x); return x[L] && x[L - 252] ? x[L] / x[L - 252] - 1 : null; };

  // ---------- 1. What is a bond? ----------
  async function bond(c) {
    let y = header(c, "Bonds explained · beginner's guide", "What is a bond?", "", "A loan you can resell. When its price falls, the **yield** (what a new buyer earns) rises.", { ts: 64 });
    // 1 the loan
    let a = sec(c, M, y, W - 2 * M, 240, 1, "A bond is a loan", "blue");
    rr(c, a.x, a.y + 14, 170, 90, 12); fill(c, C.blue); tx(c, "YOU", a.x + 85, a.y + 58, { s: 34, w: 900, col: "#fff", a: "center" }); tx(c, "the lender", a.x + 85, a.y + 88, { s: 19, w: 600, col: "#fff", a: "center" });
    const gx = a.x + 400; rr(c, gx, a.y + 14, 170, 90, 12); fill(c, C.gold); tx(c, "GOVT", gx + 85, a.y + 58, { s: 34, w: 900, col: "#fff", a: "center" }); tx(c, "the borrower", gx + 85, a.y + 88, { s: 19, w: 600, col: "#fff", a: "center" });
    const ar = (x1, x2, y0, col) => { c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(x1, y0); c.lineTo(x2, y0); c.stroke(); const d = x2 > x1 ? -1 : 1; c.fillStyle = col; c.beginPath(); c.moveTo(x2, y0); c.lineTo(x2 + d * 16, y0 - 9); c.lineTo(x2 + d * 16, y0 + 9); c.closePath(); c.fill(); };
    ar(a.x + 182, gx - 12, a.y + 44, C.blue); tx(c, "$1,000 today", a.x + 285, a.y + 30, { s: 22, w: 800, col: C.blue, a: "center" });
    ar(gx - 12, a.x + 182, a.y + 76, C.gold); tx(c, "$50 a year (5%)", a.x + 285, a.y + 108, { s: 22, w: 800, col: C.gold, a: "center" });
    para(c, "**+ $1,000 back after 10 years** (the principal)", a.x, a.y + 132, 570, { s: 21 });
    boxes(c, AREA(a.x + 600, a.y, a.w - 600, a.h), [["Tradable", "sell it any day", "gold"], ["Split up", "sold in $1,000 bits", "gold"], ["Fixed pay", "so the price moves", "gold"]], { cols: 1, inline: true, bs: 20 });
    y += 240 + 16;
    // 2 the resale price, and 3 why
    const hw = (W - 2 * M - 16) / 2;
    a = sec(c, M, y, hw, 400, 2, "Its resale price", "green");
    bars(c, AREA(a.x, a.y, a.w, a.h - 30), [["Rates 4%", 1081, C.green, "$1,081"], ["Rates 5%", 1000, C.gold, "$1,000"], ["Rates 6%", 926, C.red, "$926"]], { fmt: (v) => "$" + v, lo: 800 });
    tx(c, "10-year 5% bond · price when new bonds pay…", a.x + a.w / 2, a.y + a.h, { s: 16, w: 600, col: C.muted, a: "center" });
    a = sec(c, M + hw + 16, y, hw, 400, 3, "Why?", "green");
    boxes(c, a, [["Rates rise to 6%", "New bonds pay $60. At $926, yours gives $50 a year plus a $74 gain at the end: about 6%."], ["Longer bond, bigger swing", "A 30-year 5% bond would drop to about $862 (−14%)."], ["Hold to the end", "You still get every $50 and the $1,000 back. You only lose if you sell."]], { cols: 1, col: "green" });
    y += 400 + 16;
    // 4 who buys
    a = sec(c, M, y, W - 2 * M, 225, 4, "Who buys and sells", "blue");
    boxes(c, a, [["Pensions", "owe money for decades"], ["Banks", "need safe assets"], ["Foreign govts", "hold dollar reserves"], ["The Fed", "buys to push rates down"], ["Traders", "bet on daily moves"], ["Savers", "via bond funds"]], { cols: 2, inline: true, bs: 21 });
    y += 225 + 16;
    // 5 yields up / down
    const bh = BOTTOM - y; bulletCard(c, M, y, hw, bh, "red", "▲ YIELDS UP", "prices fall", [["Inflation rising", "$50 buys less"], ["Rates stay high", "new bonds pay more"], ["More bonds sold", "big deficits"], ["Debt worries", "want extra for risk"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "green", "▼ YIELDS DOWN", "prices rise", [["Rate cuts coming", "old bonds look good"], ["Inflation cools", "fixed pay holds up"], ["Stock panic", "rush to safety"], ["Economy weakens", "rates likely to fall"]]);
    footer(c, "Worked example: a 10-year bond paying 5% a year · prices are what it would sell for · Not advice");
  }

  // ---------- 2. How a stock is bought and sold ----------
  async function trade(c) {
    let y = header(c, "Stocks explained · beginner's guide", "How a stock trade happens", "", "Every trade needs a buyer and a seller at the same price. The **last trade** is the price you see.", { ts: 60 });
    const hw = (W - 2 * M - 16) / 2;
    // 1 the order book
    let a = sec(c, M, y, hw, 420, 1, "The order book", "blue");
    const asks = [["$100.06", 500], ["$100.04", 200], ["$100.02", 300]], bids = [["$99.98", 400], ["$99.96", 600], ["$99.94", 250]];
    tx(c, "SELLERS ASK", a.x, a.y + 16, { s: 16, w: 800, col: C.red }); tx(c, "shares", a.x + a.w, a.y + 16, { s: 16, w: 700, col: C.muted, a: "right" });
    asks.forEach(([p, n], i) => { const ry = a.y + 28 + i * 40; rr(c, a.x, ry, a.w, 34, 7); fill(c, TINT.red); tx(c, p, a.x + 12, ry + 24, { s: 20, w: 800, col: C.red, f: MONO }); tx(c, String(n), a.x + a.w - 12, ry + 24, { s: 19, w: 700, f: MONO, a: "right" }); });
    const sy = a.y + 28 + 3 * 40; tx(c, "spread $0.04", a.x + a.w / 2, sy + 22, { s: 18, w: 800, col: C.ink2, a: "center" });
    bids.forEach(([p, n], i) => { const ry = sy + 34 + i * 40; rr(c, a.x, ry, a.w, 34, 7); fill(c, TINT.green); tx(c, p, a.x + 12, ry + 24, { s: 20, w: 800, col: C.green, f: MONO }); tx(c, String(n), a.x + a.w - 12, ry + 24, { s: 19, w: 700, f: MONO, a: "right" }); });
    tx(c, "BUYERS BID", a.x, sy + 34 + 3 * 40 + 18, { s: 16, w: 800, col: C.green });
    // 2 order types
    a = sec(c, M + hw + 16, y, hw, 420, 2, "Order types", "purple");
    boxes(c, a, [["Market order", "Buy now at the best ask ($100.02). Fast, but the price can slip."], ["Limit order", "Buy only at $99.98 or less. Waits in the book; may never fill."], ["Stop order", "Becomes a market order if the price hits a trigger. Used to cut losses."]], { cols: 1, col: "purple" });
    y += 420 + 16;
    // 3 the path of a trade
    a = sec(c, M, y, W - 2 * M, 270, 3, "What happens when you press buy", "gold");
    boxes(c, a, [["You", "send an order to your broker app"], ["Broker", "routes it to an exchange or a market maker"], ["Match", "your buy meets a seller's ask"], ["Clearing", "a clearing house guarantees both sides"], ["Settled", "shares and cash swap the next business day"]], { cols: 5, col: "gold", arrows: true });
    y += 270 + 16;
    // 4 why prices move
    const bh = 220; bulletCard(c, M, y, hw, bh, "green", "▲ PRICE TICKS UP", "buyers keen", [["Buyers take the asks", "sellers run out"], ["Good news", "more people want in"], ["Sellers pull back", "fewer shares on offer"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "red", "▼ PRICE TICKS DOWN", "sellers keen", [["Sellers hit the bids", "buyers run out"], ["Bad news", "more people want out"], ["Buyers pull back", "bids drop lower"]]);
    y += bh + 16;
    keyBand(c, y, "Remember", "Nobody sets the price. It is wherever the latest buyer and seller agreed. Market makers keep both sides of the book filled and earn the small spread between them.");
    footer(c, "Example prices · US stocks settle one business day after the trade (T+1, since May 2024) · Not advice");
  }

  // ---------- 3. Futures ----------
  async function futures(c) {
    let y = header(c, "Futures explained · beginner's guide", "What is a future?", "", "A contract to buy or sell something **at a price fixed today**, for delivery on a set date later.", { ts: 60 });
    let a = sec(c, M, y, W - 2 * M, 210, 1, "A deal now, for later", "blue");
    boxes(c, a, [["Farmer", "will have wheat in September and fears the price will fall", "gold"], ["The contract", "1 future: 5,000 bushels at $6 each, delivered in September", "blue"], ["Baker", "needs wheat in September and fears the price will rise", "gold"]], { cols: 3, arrows: true });
    y += 210 + 16;
    const hw = (W - 2 * M - 16) / 2;
    a = sec(c, M, y, hw, 380, 2, "September: who won?", "green");
    bars(c, AREA(a.x, a.y, a.w, a.h - 6), [["Price falls to $5", 5, C.red, "$5"], ["Agreed price", 6, C.blue, "$6"], ["Price rises to $7", 7, C.green, "$7"]], { fmt: (v) => "$" + v, lo: 3 });
    a = sec(c, M + hw + 16, y, hw, 380, 3, "Either way, both are covered", "green");
    boxes(c, a, [["If wheat falls to $5", "The farmer still sells at $6 (+$5,000 vs the market). The baker pays $6, more than the market."], ["If wheat rises to $7", "The baker still buys at $6 (+$5,000 vs the market). The farmer misses the extra."], ["Locked in", "Neither gambles on the price: both know their number today."]], { cols: 1, col: "green" });
    y += 380 + 16;
    a = sec(c, M, y, W - 2 * M, 250, 4, "Margin: why futures are risky", "red");
    boxes(c, a, [["Small deposit", "Oil: 1 contract = 1,000 barrels. At $80 that's $80,000 of oil, but you may only put down about $8,000 (margin).", "red"], ["Settled every day", "Each day's move is paid in or out of your account. +$1 a barrel = +$1,000; −$1 = −$1,000.", "red"], ["Leverage", "A 10% drop in oil wipes out 100% of that deposit, and you can be asked for more.", "red"]], { cols: 3 });
    y += 250 + 16;
    const bh = BOTTOM - y - 0; bulletCard(c, M, y, hw, bh, "blue", "WHO USES THEM", "", [["Hedgers", "lock in prices"], ["Speculators", "bet with leverage"], ["Funds", "track oil, gold, indexes"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "gold", "GOOD TO KNOW", "", [["Rarely delivered", "most close early"], ["Indexes too", "trade nearly 24h"], ["On exchanges", "e.g. CME, Chicago"]]);
    footer(c, "Worked examples; real margin levels vary by contract and broker · Not advice");
  }

  // ---------- 4. Options ----------
  async function options(c) {
    let y = header(c, "Options explained · beginner's guide", "Calls and puts", "", "An option is the **right, not the duty**, to buy or sell a stock at a set price before a set date. You pay a fee (the **premium**) for it.", { ts: 60 });
    const hw = (W - 2 * M - 16) / 2;
    let a = sec(c, M, y, hw, 230, 1, "Call: the right to buy", "green");
    note(c, a, "Stock at **$100**. You pay **$3 a share** for the right to buy at **$105** within 3 months. One contract covers **100 shares**, so it costs **$300**. You make money if the stock goes above **$108** ($105 + $3).", { s: 21 });
    a = sec(c, M + hw + 16, y, hw, 230, 2, "Put: the right to sell", "red");
    note(c, a, "Same stock at **$100**. You pay **$2 a share** for the right to sell at **$95**. Like insurance: if the stock crashes to $70, you can still sell at $95. Profit below **$93** ($95 − $2).", { s: 21 });
    y += 230 + 16;
    // 3 payoff chart for the call and the put, with axes
    a = sec(c, M, y, W - 2 * M, 430, 3, "Profit or loss at expiry, per 100 shares", "blue");
    const px0 = a.x + 70, pw = a.w - 70 - 10, top = a.y + 10, ph = a.h - 60, lo = 60, hi = 130, vmin = -500, vmax = 2000;
    const X = (p) => px0 + (p - lo) / (hi - lo) * pw, Y = (v) => top + (vmax - v) / (vmax - vmin) * ph;
    for (const v of [-500, 0, 500, 1000, 1500, 2000]) { c.fillStyle = v === 0 ? C.ink2 : C.grid; c.fillRect(px0, Y(v), pw, v === 0 ? 2 : 1.2); tx(c, (v > 0 ? "+$" : v < 0 ? "−$" : "$") + Math.abs(v).toLocaleString(), px0 - 8, Y(v) + 6, { s: 15, w: 600, col: C.muted, f: MONO, a: "right" }); }
    for (let p = 60; p <= 130; p += 10) { c.fillStyle = C.ink2; c.fillRect(X(p) - 1, top + ph, 2, 6); tx(c, "$" + p, X(p), top + ph + 26, { s: 16, w: 600, col: C.muted, a: "center" }); }
    tx(c, "stock price at expiry", px0 + pw / 2, top + ph + 48, { s: 16, w: 700, col: C.muted, a: "center" });
    const line = (f, col) => { c.beginPath(); for (let p = lo; p <= hi; p += 0.5) { const v = Math.max(vmin, Math.min(vmax, f(p))); p === lo ? c.moveTo(X(p), Y(v)) : c.lineTo(X(p), Y(v)); } c.strokeStyle = col; c.lineWidth = 4.5; c.lineJoin = "round"; c.stroke(); };
    line((p) => (Math.max(0, p - 105) - 3) * 100, C.green); line((p) => (Math.max(0, 95 - p) - 2) * 100, C.red);
    rr(c, X(96), Y(1300) - 22, 262, 34, 8); fill(c, TINT.green); tx(c, "Call: loss capped at $300", X(96) + 12, Y(1300) + 2, { s: 18, w: 800, col: C.green });
    rr(c, X(61), Y(1100) - 22, 252, 34, 8); fill(c, TINT.red); tx(c, "Put: loss capped at $200", X(61) + 12, Y(1100) + 2, { s: 18, w: 800, col: C.red });
    y += 430 + 16;
    a = sec(c, M, y, hw, 270, 4, "Buyer vs seller", "purple");
    boxes(c, a, [["Buyer", "pays the premium; can lose only that"], ["Seller (writer)", "keeps the premium; a sold call can lose without limit"]], { cols: 1, col: "purple" });
    a = sec(c, M + hw + 16, y, hw, 270, 5, "What sets the premium", "gold");
    boxes(c, a, [["Stock price", "vs the strike"], ["Time left", "value melts each day"], ["Volatility", "wild stocks cost more"], ["Interest rates", "a small effect"]], { cols: 2, col: "gold" });
    y += 270 + 16;
    keyBand(c, y, "Remember", "Most options that are bought expire worthless or are sold before expiry. Options let you control 100 shares for a small fee, which is why gains and losses can be large.");
    footer(c, "Worked example with made-up prices · ignores trading fees · Not advice");
  }

  // ---------- 5. Gold-backed vs fiat money ----------
  async function money(c) {
    const P = await H.loadAllPrices(), g1 = yr1(P, "GLD"), s1 = yr1(P, "SPY");
    let y = header(c, "Money explained · beginner's guide", "Gold-backed vs fiat money", "", "Gold-backed money can be swapped for a fixed amount of gold. **Fiat** money (every major currency today) is backed by trust in the government that issues it.", { ts: 56 });
    // 1 timeline
    let a = sec(c, M, y, W - 2 * M, 260, 1, "How the dollar left gold", "gold");
    boxes(c, a, [["1879", "Dollars can again be swapped for gold after the Civil War"], ["1933–34", "Americans must hand in gold; the price is reset to $35 an ounce"], ["1944", "Bretton Woods: other currencies pegged to the dollar, the dollar to gold"], ["1971", "Nixon stops swapping dollars for gold"], ["1973", "Currencies float: worth what markets say"]], { cols: 5, col: "gold", arrows: true });
    y += 260 + 16;
    const hw = (W - 2 * M - 16) / 2, bh = 380;
    bulletCard(c, M, y, hw, bh, "gold", "GOLD-BACKED", "", [["Hard to print", "money limited by gold held"], ["Prices steady over decades", "but swing year to year"], ["No room in a crisis", "can't add money in a slump"], ["Bank runs", "everyone wants gold at once"], ["Growth needs new gold", "mines set the pace"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "blue", "FIAT", "", [["Central bank sets supply", "can fight recessions"], ["Lower rates, more lending", "when the economy is weak"], ["Inflation risk", "printing too much cuts value"], ["Trust is everything", "a weak government = a weak currency"], ["Gold still held", "as a reserve, not as backing"]]);
    y += bh + 16;
    a = sec(c, M, y, W - 2 * M, 270, 4, "Why people still buy gold", "green");
    boxes(c, a, [["A hedge", "against inflation and a falling currency", "green"], ["Safe haven", "often bought when stocks fall", "green"], ["No promise", "it can't default, but pays no interest", "green"], ["Central banks", "the US holds about 8,100 tonnes", "green"]], { cols: 4 });
    y += 270 + 16;
    keyBand(c, y, "Past year", `Gold (GLD) **${pc(g1)}** vs the S&P 500 (SPY) **${pc(s1)}**. Gold's price is now set by markets, not by any government.`, "gold");
    footer(c, "US Treasury, Federal Reserve history · Yahoo Finance prices · Not advice");
  }

  // ---------- 6. Derivatives ----------
  async function derivatives(c) {
    let y = header(c, "Derivatives explained · beginner's guide", "What are derivatives?", "", "Contracts whose value **comes from something else**: a stock, a bond, oil, a currency or an interest rate.", { ts: 60 });
    let a = sec(c, M, y, W - 2 * M, 330, 1, "The family", "blue");
    boxes(c, a, [["Futures", "agree a price now for a trade later; on an exchange"], ["Forwards", "the same, but a private deal between two firms"], ["Options", "the right, not the duty, to buy or sell"], ["Swaps", "two sides swap payments, e.g. fixed for floating interest"], ["Credit default swaps", "insurance that pays if a borrower defaults"], ["Warrants", "options a company itself issues"]], { cols: 3 });
    y += 330 + 16;
    a = sec(c, M, y, W - 2 * M, 250, 2, "A swap, step by step", "purple");
    boxes(c, a, [["Company A", "borrowed at a floating rate and fears rates rising", "purple"], ["The swap", "A pays the bank a fixed 4%; the bank pays A the floating rate", "purple"], ["Result", "A now has a fixed cost, whatever rates do", "purple"]], { cols: 3, arrows: true });
    y += 250 + 16;
    const hw = (W - 2 * M - 16) / 2, bh = 300;
    bulletCard(c, M, y, hw, bh, "green", "WHAT THEY'RE FOR", "", [["Hedging", "protect against a price move"], ["Speculating", "bet with a small deposit"], ["Arbitrage", "profit from tiny price gaps"], ["Access", "exposure without owning the thing"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "red", "THE RISKS", "", [["Leverage", "small moves, big losses"], ["Counterparty", "the other side may not pay"], ["Complexity", "hard to value"], ["Chain reactions", "one failure spreads"]]);
    y += bh + 16;
    keyBand(c, y, "2008", "Insurer AIG had sold huge amounts of credit default swaps on mortgage bonds. When those bonds failed it couldn't pay, and the US government bailed it out. Most derivatives today are traded with a clearing house in the middle to stop that happening again.", "red");
    footer(c, "Worked example · history from public records · Not advice");
  }

  // ---------- 7. Commodities ----------
  async function commodities(c) {
    const P = await H.loadAllPrices();
    let y = header(c, "Commodities explained · beginner's guide", "What are commodities?", "", "Raw materials where one unit is as good as another: a barrel of oil is a barrel of oil, whoever made it.", { ts: 60 });
    let a = sec(c, M, y, W - 2 * M, 230, 1, "The main groups", "gold");
    boxes(c, a, [["Energy", "crude oil, natural gas, petrol", "gold"], ["Metals", "gold, silver, copper, aluminium", "gold"], ["Farming", "wheat, corn, soybeans, coffee", "green"], ["Livestock", "cattle, hogs", "green"]], { cols: 4 });
    y += 230 + 16;
    a = sec(c, M, y, W - 2 * M, 240, 2, "Ways to invest", "blue");
    boxes(c, a, [["Physical", "gold bars or coins; storage and insurance cost money"], ["Futures", "contracts for later delivery (with leverage)"], ["Funds (ETFs)", "e.g. GLD for gold, SLV for silver"], ["Producers' stocks", "oil companies, miners, farms"]], { cols: 4 });
    y += 240 + 16;
    const hw = (W - 2 * M - 16) / 2, bh = 330;
    bulletCard(c, M, y, hw, bh, "blue", "WHAT MOVES PRICES", "", [["Supply shocks", "weather, war, strikes, OPEC cuts"], ["Demand", "factories, China, the economy"], ["The dollar", "priced in dollars: weak dollar, higher prices"], ["Storage", "full tanks push prices down"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "purple", "HOW THEY DIFFER FROM STOCKS", "", [["No profits", "value comes only from use"], ["No dividends", "you earn only if the price rises"], ["Costs to hold", "storage, or rolling futures"], ["Boom and bust", "high prices bring new supply"]]);
    y += bh + 16;
    a = sec(c, M, y, W - 2 * M, BOTTOM - y, 4, "Past year: commodity funds vs stocks", "green");
    const it = [["Gold (GLD)", yr1(P, "GLD")], ["Silver (SLV)", yr1(P, "SLV")], ["Energy stocks (XLE)", yr1(P, "XLE")], ["S&P 500 (SPY)", yr1(P, "SPY")]].filter((x) => x[1] != null);
    const rh = Math.min(48, a.h / it.length), mx = Math.max(...it.map((x) => Math.abs(x[1])), 0.01), mid = a.x + 280 + (a.w - 280 - 110) / 2, half = (a.w - 280 - 110) / 2;
    it.forEach(([l, r], i) => { const ry = a.y + i * rh; tx(c, l, a.x, ry + 30, { s: 21, w: 700, col: C.ink2 }); c.fillStyle = C.grid; c.fillRect(mid - 1, ry + 8, 2, 30);
      const bl = half * Math.abs(r) / mx; rr(c, r >= 0 ? mid : mid - bl, ry + 13, Math.max(4, bl), 20, 10); fill(c, sc(r)); tx(c, pc(r, 0), a.x + a.w, ry + 31, { s: 21, w: 800, col: sc(r), f: MONO, a: "right" }); });
    footer(c, "Yahoo Finance prices, past 12 months · Not advice");
  }

  // ---------- 8. Fundamental analysis ----------
  async function fundamentals(c) {
    const P = await H.loadAllPrices(), F = await loadScript(`fundamentals.js?d=${H.D.prices_through}`, "CTC_FUND", { d: {} }), tk = "NVDA", x = P.px[tk], li = H.lastIdx(x), px = x[li];
    const f = ((F && F.d) || {})[tk] || [], [, eps12, , , de, , , , qRev, qNi, , yRev] = f, pe = eps12 > 0 ? px / eps12 : null, margin = qRev && qNi != null ? qNi / qRev : null, grow = qRev && yRev ? qRev / yRev - 1 : null;
    let y = header(c, "Investing explained · beginner's guide", "Fundamental analysis", "", "Working out what a company is **really worth** from its business, then comparing that with its share price.", { ts: 60 });
    let a = sec(c, M, y, W - 2 * M, 230, 1, "The three reports", "blue");
    boxes(c, a, [["Income statement", "sales, costs and profit over a quarter or year"], ["Balance sheet", "what it owns, what it owes, at one date"], ["Cash flow", "the cash that actually came in and went out"]], { cols: 3 });
    y += 230 + 16;
    a = sec(c, M, y, W - 2 * M, 330, 2, `The key numbers · ${H.coName(tk).replace(/ Corporation.*$/, "")} today`, "green");
    const tiles = [["P/E ratio", pe ? `${pe.toFixed(1)}×` : "–", "price ÷ a year's profit per share: what you pay for $1 of profit"], ["Profit margin", margin != null ? `${Math.round(margin * 100)}%` : "–", "profit as a share of sales, last quarter"], ["Sales growth", grow != null ? pc(grow, 0) : "–", "last quarter vs the same quarter a year before"], ["Debt ÷ equity", de != null ? `${de.toFixed(2)}×` : "–", "how much it borrows vs what owners put in"]];
    const tw = (a.w - 36) / 4; tiles.forEach(([l, v, d], i) => { const tx0 = a.x + i * (tw + 12); rr(c, tx0, a.y, tw, a.h, 12); fill(c, TINT.green); tx(c, l, tx0 + 14, a.y + 30, { s: 19, w: 800, col: C.green, max: tw - 24 }); tx(c, v, tx0 + 14, a.y + 84, { s: 40, w: 800, f: MONO, max: tw - 24 }); para(c, d, tx0 + 14, a.y + 104, tw - 28, { s: 17 }); });
    y += 330 + 16;
    a = sec(c, M, y, W - 2 * M, 250, 3, "The steps", "gold");
    boxes(c, a, [["Read the reports", "growth, margins, debt"], ["Judge the business", "moat, managers, rivals, market size"], ["Estimate future profit", "and what that's worth today"], ["Compare with the price", "buy only with a safety margin"]], { cols: 4, col: "gold", arrows: true });
    y += 250 + 16;
    keyBand(c, y, "Remember", "A great company can still be a bad buy if its price already assumes everything goes right. Fundamental analysis asks two questions: is the business good, and is the price fair?");
    footer(c, `${tk} figures from Yahoo Finance (latest quarter; P/E on 12-month profit) · Not advice`);
  }

  // ---------- 9. ETFs ----------
  async function etfs(c) {
    const P = await H.loadAllPrices();
    let y = header(c, "ETFs explained · beginner's guide", "What is an ETF?", "", "An exchange-traded fund: **a basket of investments that trades like one stock**. One share of an S&P 500 ETF owns a sliver of all 500 companies.", { ts: 60 });
    let a = sec(c, M, y, W - 2 * M, 270, 1, "How the price stays honest", "blue");
    boxes(c, a, [["Big firms", "(authorised participants) buy the underlying shares"], ["Create", "hand them to the fund and get new ETF shares back"], ["Redeem", "or hand ETF shares back and get the stocks"], ["Arbitrage", "if the ETF drifts from its basket's value, they profit by closing the gap"]], { cols: 4, arrows: true });
    y += 270 + 16;
    a = sec(c, M, y, W - 2 * M, 330, 2, "Kinds of ETF · past year", "green");
    const it = [["S&P 500", "SPY", C.blue], ["Nasdaq 100", "QQQ", C.purple], ["Energy", "XLE", C.gold], ["Long bonds", "TLT", C.teal], ["Gold", "GLD", C.gold]].map(([l, t, col]) => [`${l} (${t})`, Math.round((yr1(P, t) || 0) * 1000) / 10, col, pc(yr1(P, t), 0)]);
    bars(c, a, it, { fmt: (v) => `${v}%`, lo: Math.min(0, ...it.map((i) => i[1])) * 1.2 });
    y += 330 + 16;
    a = sec(c, M, y, W - 2 * M, 200, 3, "Fees add up", "gold");
    boxes(c, a, [["About 0.09% a year", "an S&P 500 ETF: $9 a year on $10,000", "green"], ["1% a year", "a typical managed fund: $100 a year on $10,000", "red"], ["Over 30 years", "at 7% growth, a 1% fee takes roughly a quarter of the final pot", "gold"]], { cols: 3 });
    y += 200 + 16;
    const hw = (W - 2 * M - 16) / 2, bh = BOTTOM - y;
    bulletCard(c, M, y, hw, bh, "green", "WHY PEOPLE USE THEM", "", [["Instant spread", "hundreds of companies"], ["Trade all day", "like a stock"], ["Low cost", "most track an index"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "red", "WATCH OUT FOR", "", [["Leveraged ETFs", "daily resets lose over time"], ["Thin ETFs", "wide gaps between buy and sell"], ["Narrow themes", "less spread than they look"]]);
    footer(c, "Yahoo Finance prices, past 12 months · fee example before tax · Not advice");
  }

  // ---------- 10. EBITDA and other ways to measure a company ----------
  async function ebitda(c) {
    let y = header(c, "Company finances explained · beginner's guide", "EBITDA and other measures", "", "From sales to profit: each line takes away one more cost. **EBITDA** stops before interest, tax, depreciation and amortisation.", { ts: 56 });
    let a = sec(c, M, y, W - 2 * M, 470, 1, "From sales to profit · an example company, $ millions", "blue");
    const steps = [["Sales", 1000, 0, C.blue], ["Costs of goods", -400, 1000, C.red], ["Gross profit", 600, 0, C.blue], ["Running costs", -300, 600, C.red], ["EBITDA", 300, 0, C.purple], ["Depreciation & amortisation", -100, 300, C.red], ["EBIT (operating profit)", 200, 0, C.blue], ["Interest", -50, 200, C.red], ["Tax", -30, 150, C.red], ["Net income", 120, 0, C.green]];
    const pw = a.w - 64, ph = a.h - 96, top = a.y + 26, Y = (v) => top + ph - v / 1100 * ph, gw = pw / steps.length, bw = gw * 0.66;
    for (const v of [0, 250, 500, 750, 1000]) { c.fillStyle = C.grid; c.fillRect(a.x, Y(v), pw, 1.2); tx(c, "$" + v, a.x + pw + 8, Y(v) + 6, { s: 15, w: 600, col: C.muted, f: MONO }); }
    steps.forEach(([l, v, base, col], i) => { const x0 = a.x + i * gw + (gw - bw) / 2, y1 = Y(v >= 0 ? base + v : base), y2 = Y(v >= 0 ? base : base + v);
      rr(c, x0, y1, bw, Math.max(3, y2 - y1), 5); fill(c, col); tx(c, v > 0 ? `${v}` : `−${-v}`, x0 + bw / 2, y1 - 8, { s: 18, w: 800, col: v > 0 ? C.ink : C.red, a: "center", f: MONO });
      para(c, l, x0 + bw / 2, top + ph + 8, gw - 4, { s: 14, w: 700, col: C.ink2, a: "center", lh: 1.12 }); });
    c.fillStyle = C.ink2; c.fillRect(a.x, Y(0), pw, 2);
    y += 470 + 16;
    a = sec(c, M, y, W - 2 * M, 330, 2, "Other ways to measure it", "green");
    boxes(c, a, [["Free cash flow", "cash from the business minus spending on equipment"], ["EPS", "net income ÷ number of shares"], ["Margins", "gross, operating and net profit as % of sales"], ["Return on equity", "net income ÷ what shareholders own"], ["Debt ÷ EBITDA", "years of EBITDA to pay off the debt"], ["Current ratio", "short-term assets ÷ short-term debts"]], { cols: 3, col: "green" });
    y += 330 + 16;
    const hw = (W - 2 * M - 16) / 2, bh = BOTTOM - y;
    bulletCard(c, M, y, hw, bh, "green", "WHY EBITDA IS USED", "", [["Compare firms", "ignores how each is financed"], ["Rough cash power", "before big one-off charges"], ["Loan deals", "banks set debt limits on it"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "red", "ITS BLIND SPOTS", "", [["Ignores equipment", "machines must be replaced"], ["Ignores interest", "debt still has to be paid"], ["Flattering", "can make weak firms look fine"]]);
    footer(c, "Worked example with made-up figures · Not advice");
  }

  // ---------- 11. Dividends ----------
  async function dividends(c) {
    let y = header(c, "Dividends explained · beginner's guide", "How dividends work", "", "A dividend is **cash a company pays its shareholders** out of its profits, usually every quarter. The share price drops by about the same amount.", { ts: 60 });
    let a = sec(c, M, y, W - 2 * M, 220, 1, "The dates", "blue");
    boxes(c, a, [["Declared", "the board announces $1 a share"], ["Ex-dividend date", "buy before this day to get it"], ["Record date", "the company checks who owns shares"], ["Paid", "cash lands in your account"]], { cols: 4, arrows: true });
    y += 220 + 16;
    const hw = (W - 2 * M - 16) / 2;
    a = sec(c, M, y, hw, 420, 2, "No free money", "purple");
    bars(c, AREA(a.x, a.y, a.w, a.h - 10), [["Day before", 50, C.blue, "$50"], ["Ex-date: share", 49, C.purple, "$49"], ["+ cash", 1, C.green, "+$1"]], { fmt: (v) => "$" + v, axis: true });
    a = sec(c, M + hw + 16, y, hw, 420, 3, "Why the price falls", "purple");
    boxes(c, a, [["Cash leaves the company", "$1 a share goes to owners, so each share is worth $1 less."], ["You end even", "a $49 share plus $1 cash = the $50 you had."], ["Then markets move", "the drop can be hidden by the day's other news."]], { cols: 1, col: "purple" });
    y += 420 + 16;
    a = sec(c, M, y, W - 2 * M, 170, 4, "Dividend yield", "gold");
    boxes(c, a, [["Yield = yearly dividend ÷ price", "$2 a year on a $50 share = 4%", "gold"], ["High yield trap", "a yield jumps when the price crashes, often before a cut", "red"]], { cols: 2 });
    y += 170 + 16;
    const bh = BOTTOM - y;
    bulletCard(c, M, y, hw, bh, "red", "THE DOWNSIDES", "", [["Taxed", "even if reinvested"], ["Less growth", "cash not reinvested"], ["Cuts hurt", "prices often fall hard"], ["Can't last", "if it pays more than it earns"]]);
    bulletCard(c, M + hw + 16, y, hw, bh, "green", "THE UPSIDES", "", [["Steady income", "no need to sell"], ["A sign of strength", "real profits to share"], ["Reinvesting", "buys more shares"], ["Buybacks", "another way to pay out"]]);
    footer(c, "Worked example with a made-up stock · tax rules depend on where you live · Not advice");
  }

  const EX = [
    ["bond", "What is a bond?", "A loan you can resell, and why its price moves", bond],
    ["trade", "How a stock trade happens", "The order book, order types and what happens when you press buy", trade],
    ["futures", "Futures", "A price fixed today for a trade later, and why margin is risky", futures],
    ["options", "Options: calls and puts", "The right to buy or sell, with a profit-and-loss chart", options],
    ["money", "Gold-backed vs fiat money", "How the dollar left gold, and what each kind of money does", money],
    ["derivatives", "Derivatives", "Futures, options, swaps and credit default swaps in one picture", derivatives],
    ["commodities", "Commodities", "Oil, metals and crops: what moves them and how people invest", commodities],
    ["fundamentals", "Fundamental analysis", "Valuing a company from its reports, with live figures", fundamentals],
    ["etfs", "ETFs", "How a fund that trades like a stock works, and what it costs", etfs],
    ["ebitda", "EBITDA and other measures", "From sales to profit, and other ways to judge a company", ebitda],
    ["dividends", "Dividends", "The dates, why the price drops, and the downsides", dividends],
  ];

  // ---------- the tab: pick a guide, see it, download or copy it ----------
  let cur = "bond", blob = null, url = null, seq = 0;
  try { cur = localStorage.getItem("hf-ex") || "bond"; } catch (e) { /* storage blocked */ }
  if (!EX.some((e) => e[0] === cur)) cur = "bond";
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const markup = () => `<div class="post-grid"><div class="post-controls"><div class="field"><span class="label">Guides</span><div class="styles ex-styles">${EX.map(([v, t, s]) => `<button type="button" data-ex="${v}"><b>${esc(t)}</b><span>${esc(s)}</span></button>`).join("")}</div></div></div>
    <div class="post-preview"><img id="exImg" alt="Explainer image" tabindex="0" role="button" title="Click to see it full size"><p class="empty" id="exEmpty" hidden></p>
    <div class="post-actions"><button type="button" class="btn primary" id="exSave" disabled>Download image</button><button type="button" class="btn" id="exCopy" disabled>Copy image</button><span id="exHint">Click the image to view it full size.</span></div></div></div>
    <div class="img-view" id="exView" role="dialog" aria-modal="true" aria-label="Image, full size" hidden><button type="button" class="img-view-close" aria-label="Close">×</button><img alt="Explainer, full size"></div>`;
  async function draw(view) {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = HT; const c = cv.getContext("2d");
    try { await Promise.all([`900 20px ${UI}`, `800 20px ${UI}`, `700 20px ${UI}`, `600 20px ${UI}`, `500 20px ${UI}`, `800 20px ${MONO}`, `700 20px ${MONO}`, `600 20px ${MONO}`].map((f) => document.fonts.load(f))); } catch (e) { /* fonts optional */ }
    await EX.find((e) => e[0] === view)[3](c);
    return await new Promise((r) => cv.toBlob(r, "image/png"));
  }
  async function render() {
    const my = ++seq, img = document.getElementById("exImg"); if (!img) return;
    document.querySelectorAll("[data-ex]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ex === cur)));
    document.getElementById("exSave").disabled = true; document.getElementById("exCopy").disabled = true; img.classList.add("drawing");
    let b = null; try { b = await draw(cur); } catch (e) { console.error(e); }
    if (my !== seq) return; img.classList.remove("drawing");
    if (!b) { img.hidden = true; const em = document.getElementById("exEmpty"); em.hidden = false; em.textContent = "This image couldn't be drawn."; return; }
    blob = b; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(b); img.src = url; img.hidden = false; document.getElementById("exEmpty").hidden = true;
    document.getElementById("exSave").disabled = false; document.getElementById("exCopy").disabled = false;
  }
  function mount() {
    document.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { cur = b.dataset.ex; try { localStorage.setItem("hf-ex", cur); } catch (e) { /* storage blocked */ } render(); }));
    document.getElementById("exSave").addEventListener("click", () => { if (!url) return; const a = document.createElement("a"); a.href = url; a.download = `harryv12-explained-${cur}.png`; document.body.appendChild(a); a.click(); a.remove(); });
    document.getElementById("exCopy").addEventListener("click", async () => { const hint = document.getElementById("exHint"); if (!blob) return;
      try { await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]); hint.textContent = "Image copied. Paste it into your post."; } catch (e) { hint.textContent = "This browser won't copy images here. Right-click the image and choose Copy image, or use Download."; }
      setTimeout(() => { hint.textContent = "Click the image to view it full size."; }, 4000); });
    const view = document.getElementById("exView"), open = () => { if (!url) return; view.querySelector("img").src = url; view.hidden = false; document.body.style.overflow = "hidden"; }, close = () => { view.hidden = true; document.body.style.overflow = ""; };
    document.getElementById("exImg").addEventListener("click", open); view.addEventListener("click", close); document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !view.hidden) close(); });
    render();
  }
  window.HFExplained = { markup, mount, draw, EX };
})();
