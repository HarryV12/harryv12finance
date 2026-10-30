/* HarryV12 Finance · Data Visualization, Insider Trading: the images in the phone design (1080×1440, 3:4), matching the
   Markets & AI set: numbered colour sections, tinted panels, larger text, nothing cut off with "…", axes on every chart.
   Each keeps its own pieces (tables, logos, the ring, face bubbles, charts, price tags). Every number comes from
   dataviz.js's own calculations (window.__DV). dataviz.js calls HFDataVizPhone.draw(style, canvas, theme); a view or
   choice this design doesn't cover returns "FALLBACK" and the older drawing is used. */
(() => {
  "use strict";
  let V = window.__DV;  // set again on each draw: dataviz.js may load after this file
  const W = 1080, HT = 1440, M = 44, FOOT = 86, BOTTOM = HT - FOOT - 8;
  const UI = '"Public Sans", system-ui, sans-serif', MONO = '"IBM Plex Mono", ui-monospace, monospace';
  const C = { bg: "#f5f6f8", card: "#ffffff", ink: "#0e1621", ink2: "#354153", muted: "#667085", grid: "#dfe5ee", up: "#1d7a45", down: "#c62828",
    blue: "#1f5fd6", gold: "#b7791f", green: "#2e7d4f", red: "#c62828", purple: "#7c4dbe", teal: "#0f7f86", navy: "#1b3a8a", D: "#2f6fd6", R: "#d64545", I: "#7a7f87" };
  const TINT = { blue: "#e8f0fd", gold: "#f9f1e3", green: "#e5f2ea", red: "#fbe9e9", purple: "#f1ebfa", teal: "#e0f2f3", navy: "#e6ebf7" };
  const date = (d, o = { day: "numeric", month: "short" }) => V.fmtDate(d, o);
  const sc = (r) => r == null || !isFinite(r) ? C.muted : r > 0 ? C.up : r < 0 ? C.down : C.muted;
  const pc = (r, d = 1) => V.pct(r, d), price = (x) => V.price(x);
  const short = (s) => V.cleanName(s).replace(/[,.]?\s+(Inc|Corp|Corporation|Ltd|Plc|Co|Holdings?)\.?$/i, "");

  // ---------- drawing kit (as the Markets & AI phone images) ----------
  const font = (c, w, s, f = UI) => { c.font = `${w} ${s}px ${f}`; };
  function tx(c, str, x, y, { s = 24, w = 500, col = C.ink, f = UI, a = "left", max = 0, min = 14, ls = 0 } = {}) {
    str = String(str); font(c, w, s, f); if ("letterSpacing" in c) c.letterSpacing = `${ls}px`;
    while (max && s > min && c.measureText(str).width > max) font(c, w, --s, f);
    c.fillStyle = col; c.textAlign = a; c.textBaseline = "alphabetic"; c.fillText(str, x, y);
    const wd = c.measureText(str).width; if ("letterSpacing" in c) c.letterSpacing = "0px"; c.textAlign = "left"; return wd;
  }
  const caps = (c, str, x, y, col, s = 22, a = "left", max = 0) => tx(c, String(str).toUpperCase(), x, y, { s, w: 800, col, a, ls: 1.4, max });
  function runs(str) { const out = []; String(str).split(/(\*\*[^*]+\*\*)/).forEach((p) => { if (p) out.push(p.startsWith("**") ? [p.slice(2, -2), "b"] : [p, ""]); }); return out; }
  function layout(c, str, maxW, s, w) {
    const words = []; for (const [t, st] of runs(str)) t.split(/(\s+)/).forEach((x) => { if (x) words.push([x, st]); });
    const L = []; let cur = [], cw = 0; const wid = (t, st) => { font(c, st ? 800 : w, s); return c.measureText(t).width; };
    for (const [t, st] of words) { if (/^\s+$/.test(t)) { if (cur.length) { cur.push([" ", st]); cw += wid(" ", st); } continue; }
      const tw = wid(t, st); if (cw + tw > maxW && cur.length) { while (cur.length && cur[cur.length - 1][0] === " ") cur.pop(); L.push(cur); cur = []; cw = 0; }
      cur.push([t, st]); cw += tw; }
    if (cur.length) L.push(cur); return L;
  }
  function para(c, str, x, y, maxW, { s = 22, w = 500, col = C.ink2, lh = 1.36, a = "left" } = {}) {
    const L = layout(c, str, maxW, s, w), step = Math.round(s * lh);
    L.forEach((ln, i) => { let xx = x; if (a !== "left") { let tw = 0; for (const [t, st] of ln) { font(c, st ? 800 : w, s); tw += c.measureText(t).width; } xx = a === "center" ? x - tw / 2 : x - tw; }
      for (const [t, st] of ln) { font(c, st ? 800 : w, s); c.fillStyle = st ? C.ink : col; c.textAlign = "left"; c.fillText(t, xx, y + s + i * step - Math.round(s * 0.18)); xx += c.measureText(t).width; } });
    return y + L.length * step;
  }
  const paraH = (c, str, maxW, s, w = 500, lh = 1.36) => layout(c, str, maxW, s, w).length * Math.round(s * lh);
  function fitS(heightOf, maxH, s0, min = 15) { let s = s0; while (s > min && heightOf(s) > maxH) s--; return s; }
  function rr(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  const fill = (c, col) => { c.fillStyle = col; c.fill(); };
  function card(c, x, y, w, h, col, { tint = false } = {}) {
    c.save(); rr(c, x, y, w, h, 18); c.fillStyle = tint ? TINT[col] : C.card; c.shadowColor = "rgba(20,40,80,0.08)"; c.shadowBlur = 10; c.shadowOffsetY = 2; c.fill(); c.restore();
    if (col && !tint) { c.save(); rr(c, x, y, w, h, 18); c.clip(); c.fillStyle = C[col] || col; c.fillRect(x, y, w, 6); c.restore(); }
  }
  function title(c, x, y, num, text, col, max = 0) {
    let xx = x; const cc = C[col] || col; if (num) { c.fillStyle = cc; c.beginPath(); c.arc(x + 16, y + 16, 16, 0, 7); c.fill(); tx(c, String(num), x + 16, y + 24, { s: 20, w: 800, col: "#fff", a: "center" }); xx += 44; }
    caps(c, text, xx, y + 25, cc, 22, "left", max ? max - (xx - x) : 0); return y + 46;
  }
  function chip(c, x, y, label, value, vcol, col = "blue", s = 20) {
    font(c, 600, s); const lw = label ? c.measureText(label).width + 8 : 0; font(c, 800, s, MONO); const vw = c.measureText(value).width, w = lw + vw + 24;
    rr(c, x, y, w, s + 18, 10); fill(c, TINT[col]); if (label) tx(c, label, x + 12, y + s + 4, { s, w: 600, col: C.ink2 }); tx(c, value, x + 12 + lw, y + s + 4, { s, w: 800, col: vcol, f: MONO }); return w;
  }
  function header(c, kicker, ttl, sub, { ts = 56, subS = 23, right = 0 } = {}) {
    c.fillStyle = C.bg; c.fillRect(0, 0, W, HT);
    caps(c, kicker, M, 60, C.blue, 21, "left", W - 2 * M - right);
    let s = ts; font(c, 900, s); while (s > 34 && c.measureText(ttl).width > W - 2 * M - right) font(c, 900, --s);
    const y0 = 80 + s; tx(c, ttl, M, y0, { s, w: 900 });
    let y = y0 + 22; if (sub) y = para(c, sub, M, y, W - 2 * M - right, { s: subS, col: C.ink2, lh: 1.3 });
    return Math.max(y, right ? 210 : 0) + 20;
  }
  function footer(c, src) {
    c.fillStyle = C.grid; c.fillRect(M, HT - 50, W - 2 * M, 2);
    tx(c, `Sources: ${src}`, M, HT - 60, { s: 17, w: 500, col: C.muted, max: W - 2 * M, min: 12 });
    tx(c, "harryv12finance.pages.dev", M, HT - 18, { s: 21, w: 600, col: C.blue });
    tx(c, "HarryV12 Finance", W - M, HT - 18, { s: 21, w: 800, col: C.ink2, a: "right" });
  }
  async function face(c, m, cx, cy, r, hd = false) {
    const img = await (hd ? V.photoHD(m) : V.photoImage(m)), ring = C[m.party] || C.I;
    c.save(); c.beginPath(); c.arc(cx, cy, r + 4, 0, 7); c.fillStyle = ring; c.fill(); c.beginPath(); c.arc(cx, cy, r + 1.5, 0, 7); c.fillStyle = "#fff"; c.fill();
    c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip();
    if (img && img.width === img.height) c.drawImage(img, cx - r, cy - r, 2 * r, 2 * r); else if (img) c.drawImage(img, 0, Math.round(img.height * 0.04), img.width, img.width, cx - r, cy - r, 2 * r, 2 * r);
    else { c.fillStyle = "#eef1f5"; c.fillRect(cx - r, cy - r, 2 * r, 2 * r); }
    c.restore();
  }
  // a price chart with both axes labelled: prices on the right, months (and the year) along the bottom
  function priceChart(c, x, y, w, h, s, i0, i1, { col = C.blue, yTitle = "Price ($)", area = true, small = false } = {}) {
    const dates = V.PRICES.dates, pw = w - (small ? 74 : 96), top = y + (small ? 8 : 26), ph = h - (small ? 30 : 58) - (top - y);
    let lo = Infinity, hi = -Infinity; for (let i = i0; i <= i1; i++) if (s[i] != null) { lo = Math.min(lo, s[i]); hi = Math.max(hi, s[i]); }
    const pad = (hi - lo || hi * 0.1) * 0.08; lo -= pad; hi += pad;
    const X = (i) => x + (i - i0) / Math.max(1, i1 - i0) * pw, Y = (v) => top + ph - (v - lo) / (hi - lo) * ph;
    if (!small) tx(c, yTitle, x + pw + 92, y + 16, { s: 17, w: 700, col: C.muted, a: "right" });
    const n = small ? 2 : 4;
    for (let g = 0; g <= n; g++) { const v = lo + (hi - lo) * g / n, gy = Y(v); c.fillStyle = C.grid; c.fillRect(x, gy, pw, 1.5); tx(c, price(v), x + pw + 8, gy + 6, { s: small ? 15 : 17, w: 600, col: C.muted, f: MONO }); }
    c.fillStyle = C.ink2; c.fillRect(x, top + ph, pw, 2); c.fillRect(x + pw, top, 2, ph);
    if (area) { c.beginPath(); let st = false; for (let i = i0; i <= i1; i++) if (s[i] != null) { st ? c.lineTo(X(i), Y(s[i])) : c.moveTo(X(i), Y(s[i])); st = true; } c.lineTo(X(i1), top + ph); c.lineTo(X(i0), top + ph); c.closePath(); c.fillStyle = "rgba(31,95,214,0.10)"; c.fill(); }
    c.beginPath(); let st = false; for (let i = i0; i <= i1; i++) if (s[i] != null) { st ? c.lineTo(X(i), Y(s[i])) : c.moveTo(X(i), Y(s[i])); st = true; } c.strokeStyle = col; c.lineWidth = small ? 2.5 : 3.5; c.lineJoin = "round"; c.stroke();
    let lastX = -1e9, yearDone = false;
    for (let i = i0 + 1; i <= i1; i++) { if (dates[i].slice(0, 7) === dates[i - 1].slice(0, 7)) continue; const mx = X(i); if (mx - lastX < (small ? 74 : 66) || mx > x + pw - 20) continue;
      c.fillStyle = C.ink2; c.fillRect(mx - 1, top + ph, 2, 6);
      tx(c, V.fmtDate(dates[i], { day: "numeric", month: "short" }) + (!yearDone || dates[i].slice(5, 7) === "01" ? " " + dates[i].slice(2, 4) : ""), mx, top + ph + (small ? 22 : 26), { s: small ? 15 : 17, w: 600, col: C.muted, a: "center" }); yearDone = true; lastX = mx; }
    return { X, Y, lo, hi, pw, ph, top };
  }
  const tri = (c, x, y, up, col, outline = false, r = 8) => { c.beginPath(); c.moveTo(x, up ? y + 5 : y - 5); c.lineTo(x - r, up ? y + 5 + 1.7 * r : y - 5 - 1.7 * r); c.lineTo(x + r, up ? y + 5 + 1.7 * r : y - 5 - 1.7 * r); c.closePath();
    if (outline) { c.fillStyle = "#fff"; c.fill(); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke(); } else { c.fillStyle = col; c.fill(); } };
  const dash = (c, x0, x1, y, col, lw = 2) => { c.save(); c.strokeStyle = col; c.lineWidth = lw; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); c.restore(); };
  const tag = (c, x, y, text, bg, ink, edge) => { font(c, 700, 17, MONO); const w = c.measureText(text).width + 18; rr(c, x, y - 15, w, 30, 7); fill(c, bg); if (edge) { c.strokeStyle = edge; c.lineWidth = 1.5; c.stroke(); } tx(c, text, x + 9, y + 6, { s: 17, w: 700, col: ink, f: MONO }); return w; };

  // a table as on the site: column heads in a tinted bar, striped rows, each cell a line or two
  function table(c, x, y, w, cols, rows, { rowH = 44, col = "blue", s1 = 18, s2 = 15 } = {}) {
    rr(c, x, y, w, 34, 8); fill(c, TINT[col]);
    cols.forEach(([l, cx, , a]) => tx(c, l.toUpperCase(), a === "right" ? cx : cx, y + 23, { s: 14, w: 800, col: C[col], a: a || "left", ls: 0.8 }));
    let yy = y + 38;
    rows.forEach((r, i) => { if (i % 2) { rr(c, x, yy, w, rowH, 8); fill(c, "#f4f6fa"); }
      cols.forEach(([, cx, cw, a], j) => { const cell = r[j]; if (!cell) return; const [t1, t2, c1, c2, f1] = cell, two = t2 != null && t2 !== "";
        tx(c, t1, cx, yy + (two ? rowH / 2 - 2 : rowH / 2 + 7), { s: s1, w: 700, col: c1 || C.ink, f: f1 || UI, a: a || "left", max: cw, min: 11 });
        if (two) tx(c, t2, cx, yy + rowH / 2 + 17, { s: s2, w: 600, col: c2 || C.muted, a: a || "left", max: cw, min: 10 }); });
      yy += rowH; });
    return yy;
  }
  const FB = "FALLBACK";

  // ---------- 1. stock price chart ----------
  async function vChart(c) {
    const Mo = V.marketModel(); if (typeof Mo === "string") return Mo; if (Mo.mode !== "single") return FB;
    const s = Mo.series, last = Mo.last, buys = Mo.buys, sells = Mo.sells, marks = Mo.marks;
    let y = header(c, "Congress & administration trades · buys and sells", Mo.name, `**${Mo.tk}** · ${Mo.sector} · last close **${price(last)}** on ${date(Mo.lastDate)} · **${pc(Mo.chg)}** in ${Mo.periodShort}`);
    const st = V.stocks[Mo.tk] || [], about = (V.DESC || {})[Mo.tk] || "", inW = W - 2 * M - 44;
    const aboutH = 46 + paraH(c, about, inW, 21) + 22, keyH = 46 + 112 + 16, h1 = BOTTOM - y - keyH - aboutH - 32;
    // 1 the price, every trade, the average buy and the biggest trades as bubbles
    card(c, M, y, W - 2 * M, h1, "blue"); let yy = title(c, M + 22, y + 18, 1, `Price and trades · ${Mo.periodShort}`, "blue");
    const g = priceChart(c, M + 22, yy, inW, y + h1 - 14 - yy, s, Mo.s0, Mo.end);
    const wsum = buys.reduce((a, t) => a + (t.amt || 1), 0), avg = buys.length ? wsum / buys.reduce((a, t) => a + (t.amt || 1) / t.T.ep, 0) : null;
    if (avg && avg > g.lo && avg < g.hi) { dash(c, M + 22, M + 22 + g.pw, g.Y(avg), C.ink2); }
    const PX = (t) => g.X(V.idxOfDate(t.d)), PY = (t) => { const i = V.idxOfDate(t.d); return g.Y(s[i] ?? t.T.ep); };
    for (const t of marks) { c.beginPath(); c.arc(PX(t), PY(t), 8, 0, 7); c.fillStyle = t.side === "S" ? C.down : C.up; c.fill(); c.lineWidth = 3; c.strokeStyle = "#fff"; c.stroke(); }
    // bubbles: each person's biggest trade, the people with the most money first
    const per = new Map(); for (const t of marks) { const e = per.get(t.m) || { m: V.members[t.m], money: 0, rep: t }; e.money += t.amt; if (t.amt > e.rep.amt) e.rep = t; per.set(t.m, e); }
    const R = 28, BH = 74, placed = [], lab = [...per.values()].sort((a, b) => b.money - a.money).slice(0, 5);
    const left = M + 22, right = M + 22 + g.pw, top = g.top, bot = g.top + g.ph, dots = marks.map((t) => [PX(t), PY(t)]), line = [];
    for (let i = Mo.s0; i <= Mo.end; i += 2) if (s[i] != null) line.push([g.X(i), g.Y(s[i])]);
    for (const lb of lab) { const t = lb.rep; lb.l1 = `${t.side === "S" ? "Sold" : "Bought"} ${price(t.T.ep)}`; lb.l2 = `${date(t.d)} · ${V.amountShort(t)}`;
      font(c, 700, 22, MONO); let w = c.measureText(lb.l1).width; font(c, 600, 18); w = Math.max(w, c.measureText(lb.l2).width); lb.w = Math.ceil(w) + 2 * R + 40; lb.px = PX(t); lb.py = PY(t); }
    const inside = (b, x, yv, p) => x > b.x - p && x < b.x + b.w + p && yv > b.y - p && yv < b.y + b.h + p;
    for (const lb of lab) { let best = null, bc = Infinity;
      for (let dy = -360; dy <= 360; dy += 20) { if (Math.abs(dy) < 56) continue;
        for (const dx of [-lb.w / 2, -R - 8, -lb.w + R + 8, -lb.w * 0.2, -lb.w * 0.8, lb.w * 0.15, -lb.w * 1.15]) {
          const b = { x: Math.max(left + 4, Math.min(right - lb.w - 4, lb.px + dx)), y: Math.max(top + 2, Math.min(bot - BH - 4, lb.py + dy - BH / 2)), w: lb.w, h: BH };
          if (placed.some((p) => b.x < p.x + p.w + 10 && p.x < b.x + b.w + 10 && b.y < p.y + p.h + 10 && p.y < b.y + b.h + 10)) continue;
          let cost = Math.hypot(b.x + b.w / 2 - lb.px, b.y + b.h / 2 - lb.py) / 30; for (const [px, py] of line) if (inside(b, px, py, 8)) cost += 6; for (const [px, py] of dots) if (inside(b, px, py, 12)) cost += 60;
          if (cost < bc) { bc = cost; best = b; } } }
      if (best) placed.push(best); lb.box = best; }
    for (const lb of lab) if (lb.box) { c.strokeStyle = C.ink2; c.lineWidth = 2; c.beginPath(); c.moveTo(lb.px, lb.py); c.lineTo(lb.box.x + R + 10, lb.box.y + BH / 2); c.stroke(); }
    for (const lb of lab) { const b = lb.box; if (!b) continue; const sold = lb.rep.side === "S", col = sold ? C.red : C.green;
      c.save(); c.shadowColor = "rgba(0,0,0,0.12)"; c.shadowBlur = 14; c.shadowOffsetY = 3; rr(c, b.x, b.y, b.w, BH, BH / 2); fill(c, "#fff"); c.restore();
      rr(c, b.x, b.y, b.w, BH, BH / 2); fill(c, sold ? TINT.red : TINT.green); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
      await face(c, lb.m, b.x + R + 10, b.y + BH / 2, R);
      tx(c, lb.l1, b.x + 2 * R + 26, b.y + 33, { s: 22, w: 700, col: sold ? C.red : C.ink, f: MONO }); tx(c, lb.l2, b.x + 2 * R + 26, b.y + 58, { s: 18, w: 600, col: C.ink2 }); }
    if (avg && avg > g.lo && avg < g.hi) { font(c, 700, 17, MONO); const aw = c.measureText(`Avg buy ${price(avg)}`).width + 18, ty = g.Y(avg), clash = (yv) => placed.some((b) => b.x + b.w > M + 22 + g.pw - aw - 20 && yv - 16 < b.y + b.h && yv + 16 > b.y);
      const ty2 = !clash(ty + 22) ? ty + 22 : !clash(ty - 22) ? ty - 22 : ty + 60; tag(c, M + 22 + g.pw - aw - 8, ty2, `Avg buy ${price(avg)}`, "#fff", C.ink, C.ink2); }
    let kx = W - M - 22; for (const [l, col] of [["sale", C.down], ["buy", C.up]]) { const w0 = tx(c, l, kx, y + 42, { s: 18, w: 700, col: C.ink2, a: "right" }); kx -= w0 + 10; c.beginPath(); c.arc(kx, y + 36, 8, 0, 7); c.fillStyle = col; c.fill(); kx -= 26; }
    y += h1 + 16;
    // 2 the key numbers
    const unl = per.size - lab.filter((l) => l.box).length, eb = V.estOf(buys), es = V.estOf(sells);
    const cells = [["People", String(per.size), unl > 0 ? `${unl} not labelled` : "all labelled", "blue"], ["Buys / sells", `${buys.length} / ${sells.length}`, sells.length ? `sold ${V.estText(es)}` : "no sales", "purple"],
      ["Bought", buys.length ? V.estText(eb) : "–", V.likelyText(eb) || "best estimate", "green"], ["Average buy", avg ? price(avg) : "–", "cost per share", "gold"],
      ["Since avg buy", avg ? pc(last / avg - 1) : "–", Mo.spy != null ? `S&P 500 ${pc(Mo.spy)}` : "", "teal"]];
    card(c, M, y, W - 2 * M, keyH, "gold"); yy = title(c, M + 22, y + 18, 2, "Key numbers", "gold");
    const tw = (inW - 4 * 10) / 5; cells.forEach(([l, v, s2, col], i) => { const x = M + 22 + i * (tw + 10); rr(c, x, yy, tw, 112, 12); fill(c, TINT[col]);
      tx(c, l, x + 12, yy + 28, { s: 18, w: 800, col: C[col], max: tw - 20 }); tx(c, v, x + 12, yy + 68, { s: 28, w: 800, col: i === 4 ? sc(last / avg - 1) : C.ink, f: MONO, max: tw - 20 });
      tx(c, s2, x + 12, yy + 98, { s: 17, w: 600, col: C.ink2, max: tw - 20, min: 12 }); });
    y += keyH + 16;
    // 3 what the company does
    card(c, M, y, W - 2 * M, aboutH, "teal"); yy = title(c, M + 22, y + 18, 3, `About ${short(st[0] || Mo.tk)}`, "teal");
    if (st[4]) tx(c, `Company value ${V.usd(st[4])}`, W - M - 22, y + 42, { s: 20, w: 800, col: C.teal, a: "right" });
    para(c, about, M + 22, yy, inW, { s: 21 });
    footer(c, "House, Senate and OGE trade filings · buy price = close on the trade date · Not advice");
  }

  // ---------- 2. public signals ----------
  async function vSignals(c) {
    const sig = V.SIGNALS; if (!sig || !sig.stocks || !sig.stocks.length) return FB;
    let y = header(c, `Public signals · stocks bought in the last ${sig.buy_days} days`, "Public signals", "Stocks members are net buying, scored out of 100 with committee links, government contracts, lobbying, hearings, well-known investors and company insiders.");
    const pcs = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.round(Math.abs(v) * 100) + "%", usd = (v) => V.usd(v);
    const cols = [["Buyers", 40, (r) => r.points.congress + r.points.cluster, (r) => `${r.members} · ${pcs(r.npr_trades)} ${pcs(r.npr_dollars)}`], ["Committee", 20, (r) => r.points.committee, (r) => r.committee ? String(r.committee) : "–"],
      ["Contracts", 15, (r) => r.points.contracts, (r) => r.contracts ? usd(r.contracts) : "–"], ["Lobbying", 15, (r) => r.points.lobbying, (r) => r.lobbying ? usd(r.lobbying) : "–"],
      ["Hearings", 10, (r) => r.points.hearings, (r) => r.hearings_named.length + r.hearings_sector.length ? String(r.hearings_named.length + r.hearings_sector.length) : "–"],
      ["Leaders", 10, (r) => r.points.leaders || 0, (r) => (r.leaders || []).length ? String(new Set(r.leaders.map((p) => p.who)).size) : "–"], ["Insiders", 10, (r) => r.points.insiders || 0, (r) => r.insiders ? usd(r.insider_value) : "–"]];
    // the notes behind the top scores
    const byId = new Map(V.members.map((m) => [m.id, m])), notes = [], rows0 = sig.stocks.slice(0, 9);
    for (const r of rows0.slice(0, 3)) { const big = new Map((r.unusual || []).map(([id, x]) => [id, x])), ms = (r.who || []).map((i) => byId.get(i)).filter((m) => m && !V.isBiz(m)).slice(0, 3);
      if (ms.length) notes.push([r.t, `bought by ${ms.map((m) => big.has(m.id) ? `${V.shortName(m)} (${Math.round(big.get(m.id))}× their usual size)` : V.shortName(m)).join(", ")}${r.members > ms.length ? ` and ${r.members - ms.length} more` : ""}`]); }
    for (const r of rows0) { const ls = r.leaders || []; if (ls.length) notes.push([r.t, `${[...new Set(ls.map((p) => p.who))].slice(0, 2).join(", ")} named ${short(r.name)} in a post on ${date(ls[0].date)}`]); }
    const inW = W - 2 * M - 44, nShow = notes.slice(0, 4), notesH = 46 + nShow.reduce((a, [, t]) => a + paraH(c, t, inW - 100, 20) + 8, 0) + 40;
    const rowH = 128, n = Math.min(rows0.length, Math.floor((BOTTOM - y - notesH - 16 - 46 - 30) / (rowH + 10)));
    card(c, M, y, W - 2 * M, 46 + 30 + n * (rowH + 10), "blue"); let yy = title(c, M + 22, y + 18, 1, "The stocks, by score", "blue");
    tx(c, "shading = points earned in each signal · Buyers: members net buying, then net buying by trades and by dollars", M + 22, yy + 16, { s: 17, w: 600, col: C.muted, max: inW });
    yy += 30;
    rows0.slice(0, n).forEach((r, k) => { const ry = yy + k * (rowH + 10); rr(c, M + 22, ry, inW, rowH, 14); fill(c, "#f7f9fc");
      tx(c, r.t, M + 38, ry + 36, { s: 28, w: 800, f: MONO }); font(c, 800, 28, MONO); const tw0 = c.measureText(r.t).width;
      tx(c, short(r.name), M + 52 + tw0, ry + 35, { s: 20, w: 600, col: C.ink2, max: inW - tw0 - 260 });
      const bx = W - M - 22 - 16 - 190; rr(c, bx, ry + 24, 120, 12, 6); fill(c, C.grid); rr(c, bx, ry + 24, Math.max(6, 120 * r.score / 100), 12, 6); fill(c, C.blue);
      tx(c, String(Math.round(r.score)), W - M - 38, ry + 40, { s: 34, w: 800, f: MONO, a: "right" });
      const cw = (inW - 32 - 6 * 6) / 7; cols.forEach(([l, max, pts, val], j) => { const f = Math.max(0, Math.min(1, pts(r) / max)), cx = M + 38 + j * (cw + 6);
        rr(c, cx, ry + 54, cw, 62, 10); c.fillStyle = f ? `rgba(31,95,214,${0.08 + 0.4 * f})` : "#eef1f5"; c.fill();
        tx(c, l, cx + 10, ry + 76, { s: 15, w: 800, col: f ? C.navy : C.muted, max: cw - 16, min: 11 }); tx(c, val(r), cx + 10, ry + 104, { s: 20, w: 800, col: f ? C.ink : C.muted, f: MONO, max: cw - 16, min: 12 }); }); });
    y += 46 + 30 + n * (rowH + 10) + 16;
    card(c, M, y, W - 2 * M, notesH, "gold"); yy = title(c, M + 22, y + 18, 2, "Behind the scores", "gold");
    nShow.forEach(([t, text]) => { tx(c, t, M + 22, yy + 20, { s: 20, w: 800, col: C.gold, f: MONO }); yy = para(c, text, M + 122, yy, inW - 100, { s: 20 }) + 8; });
    tx(c, `No House hearings in the next ${sig.hearing_days} days touch these stocks (${sig.hearing_count} scheduled in all).`, M + 22, yy + 18, { s: 17, w: 600, col: C.muted, max: inW });
    footer(c, "House and Senate filings · USAspending contracts · Senate lobbying reports · House hearings · SEC Form 4 · Not advice");
  }

  // ---------- 3. stock breakdown ----------
  async function vTerminal(c) {
    if (!V.PE.ticker || !V.PRICES.px[V.PE.ticker]) return FB;
    const tk = V.PE.ticker, s = V.PRICES.px[tk], st = V.stocks[tk], dates = V.PRICES.dates, end = V.lastIdx(s), last = s[end];
    const list = V.trades.filter((t) => t.t === tk && t.st && t.side !== "O" && t.time >= V.windowStart() && !V.isBiz(V.members[t.m])).sort((a, b) => b.time - a.time); if (!list.length) return FB;
    const prev = s[end - 1], d1 = prev ? last / prev - 1 : null;
    let y = header(c, `${tk} · trades by members and officials · ${V.windowLabel()}`, short(st[0]), `**${tk}** · ${[st[3] || st[2], st[1]].filter(Boolean).join(" · ")} · last close **${price(last)}** (${d1 == null ? "–" : `${pc(d1, 2)} today`}) on ${date(dates[end], { day: "numeric", month: "short", year: "numeric" })}`);
    const inW = W - 2 * M - 44;
    // 1 returns and range
    const at = (days) => s[V.priceRange(s, days)[0]], ytd0 = s[Math.max(0, dates.findIndex((d) => d >= dates[end].slice(0, 4) + "-01-01"))];
    let lo52 = Infinity, hi52 = -Infinity; for (let i = V.priceRange(s, 365)[0]; i <= end; i++) if (s[i] != null) { lo52 = Math.min(lo52, s[i]); hi52 = Math.max(hi52, s[i]); }
    const cells = [["1 month", last / at(30) - 1], ["3 months", last / at(91) - 1], ["This year", ytd0 ? last / ytd0 - 1 : null], ["1 year", last / at(365) - 1], ["52-wk high", price(hi52)], ["52-wk low", price(lo52)], ["Value", st[4] ? V.usd(st[4]) : "–"]];
    card(c, M, y, W - 2 * M, 46 + 92 + 14, "blue"); let yy = title(c, M + 22, y + 18, 1, "The stock", "blue");
    const cw = (inW - 6 * 8) / 7; cells.forEach(([l, v], i) => { const x = M + 22 + i * (cw + 8); rr(c, x, yy, cw, 92, 10); fill(c, TINT.blue);
      tx(c, l, x + 10, yy + 26, { s: 17, w: 700, col: C.blue, max: cw - 16 }); tx(c, typeof v === "string" ? v : pc(v), x + 10, yy + 66, { s: 22, w: 800, col: typeof v === "string" ? C.ink : sc(v), f: MONO, max: cw - 16 }); });
    y += 46 + 92 + 14 + 16;
    // 2 Congress activity
    const buys = list.filter((t) => t.side === "B"), sells = list.filter((t) => t.side === "S"), bAmt = V.sumAmt(buys), sAmt = V.sumAmt(sells), tot = bAmt + sAmt || 1;
    const six = [["Buyers", new Set(buys.map((t) => t.m)).size, C.up], ["Sellers", new Set(sells.map((t) => t.m)).size, C.down], ["Buys", buys.length, C.up], ["Sales", sells.length, C.down], ["Bought", V.listSpan(buys), C.up], ["Sold", V.listSpan(sells), C.down]];
    const h2 = 46 + 80 + 26 + 40; card(c, M, y, W - 2 * M, h2, "purple"); yy = title(c, M + 22, y + 18, 2, `Congress activity · ${V.periodLong()}`, "purple");
    const sw = inW / 6; six.forEach(([l, v, col], i) => { const x = M + 22 + i * sw; tx(c, l, x, yy + 22, { s: 18, w: 700, col: C.muted }); tx(c, String(v), x, yy + 62, { s: 30, w: 800, col, f: MONO, max: sw - 12 }); });
    rr(c, M + 22, yy + 80, inW, 14, 7); fill(c, C.down); rr(c, M + 22, yy + 80, Math.max(14, inW * bAmt / tot), 14, 7); fill(c, C.up);
    const pb = buys.filter((t) => t.amt > 0 && t.T.ep), sh = pb.reduce((a, t) => a + t.amt / t.T.ep, 0), avgAll = sh ? pb.reduce((a, t) => a + t.amt, 0) / sh : null;
    tx(c, `Net ${bAmt >= sAmt ? "buying" : "selling"} ${V.usdEst(Math.abs(bAmt - sAmt))} · ${Math.round(bAmt / tot * 100)}% of the dollars were buys`, M + 22, yy + 124, { s: 19, w: 600, col: C.ink2 });
    if (avgAll) { const ch = last / avgAll - 1; tx(c, `avg buy ${price(avgAll)} · now ${price(last)} · ${pc(ch)}`, W - M - 22, yy + 124, { s: 19, w: 800, col: sc(ch), a: "right" }); }
    y += h2 + 16;
    // 3 who traded it: the site's table (each person's colour matches their average-buy line on the chart)
    const PAL = ["#1f5fd6", "#7c3aed", "#d9480f", "#0e8a9c", "#c0268f", "#a07500"], per = new Map();
    for (const t of list) { const g = per.get(t.m) || { m: V.members[t.m], buys: [], sells: [], money: 0 }; (t.side === "B" ? g.buys : g.sells).push(t); g.money += t.amt; per.set(t.m, g); }
    const people = [...per.values()].sort((p, q) => q.money - p.money);
    for (const g of people) { const b2 = g.buys.filter((t) => t.T.ep), dol = b2.reduce((a, t) => a + (t.amt || 1), 0); g.avg = b2.length ? dol / b2.reduce((a, t) => a + (t.amt || 1) / t.T.ep, 0) : null; g.left = V.sharesLeft(g.m, tk, s); }
    const chartH = 300, rowH = 42, nRows = Math.max(3, Math.min(people.length, Math.floor((BOTTOM - y - 16 - chartH - 46 - 38 - 40) / rowH))), shown = people.slice(0, nRows);
    let ci = 0; for (const g of shown) g.col = g.avg && ci < PAL.length ? PAL[ci++] : null;
    const h3 = 46 + 38 + nRows * rowH + (people.length > nRows ? 40 : 10); card(c, M, y, W - 2 * M, h3, "gold"); yy = title(c, M + 22, y + 18, 3, `Who traded ${tk}`, "gold");
    const X0 = M + 22, cols = [["Member", X0 + 26, 270], ["Bought", X0 + 306, 158], ["Sold", X0 + 474, 158], ["Avg buy", X0 + 642, 96], ["Change", X0 + 746, 82], ["Left now", W - M - 32, 100, "right"]];
    table(c, M + 14, yy - 4, W - 2 * M - 28, cols, shown.map((g) => { const r = g.avg ? last / g.avg - 1 : null, v = g.left == null ? null : g.left * last;
      return [[`${V.shortName(g.m)} · ${V.party(g.m)}`], [g.buys.length ? `${V.usdEst(V.estOf(g.buys).best)} · ${V.plural(g.buys.length, "buy")}` : "–", null, g.buys.length ? C.up : C.muted, null, MONO],
        [g.sells.length ? `${V.usdEst(V.estOf(g.sells).best)} · ${V.plural(g.sells.length, "sale")}` : "–", null, g.sells.length ? C.down : C.muted, null, MONO], [g.avg ? price(g.avg) : "–", null, g.col || C.ink, null, MONO],
        [r == null ? "–" : pc(r), null, sc(r), null, MONO], [v == null ? "unknown" : v < 1000 ? "sold out" : `≈${V.usdEst(v)}`, null, v != null && v < 1000 ? C.down : v == null ? C.muted : C.ink, null, MONO]]; }), { rowH, col: "gold", s1: 16 });
    shown.forEach((g, k) => { if (g.col) { rr(c, X0 + 4, yy - 4 + 38 + k * rowH + rowH / 2 - 8, 14, 14, 3); fill(c, g.col); } });
    if (people.length > nRows) tx(c, `+${people.length - nRows} more members and officials traded ${tk} in this period`, M + 22, yy + 38 + nRows * rowH + 22, { s: 18, w: 600, col: C.muted });
    y += h3 + 16;
    // 4 the price with every trade and each person's average buy
    const h4 = BOTTOM - y; card(c, M, y, W - 2 * M, h4, "teal"); yy = title(c, M + 22, y + 18, 4, `Price · ${V.periodLong()}`, "teal");
    tx(c, "▲ buy  ▼ sale  - - average buy", W - M - 22, y + 42, { s: 18, w: 700, col: C.ink2, a: "right" });
    const [i0, i1] = V.priceRange(s, V.windowDays()), tagW = 210, gg = priceChart(c, M + 22, yy - 6, inW - tagW, y + h4 - 12 - (yy - 6), s, i0, i1, { col: C.blue });
    for (const t of list) { const i = V.idxOfDate(t.d); if (i < i0) continue; tri(c, gg.X(i), gg.Y(s[i] ?? t.T.ep), t.side === "B", t.side === "B" ? C.up : C.down); }
    const lines = shown.filter((p) => p.col && p.avg >= gg.lo && p.avg <= gg.hi).map((p) => ({ p, y: gg.Y(p.avg) })).sort((u, v) => u.y - v.y);
    lines.forEach((ln, i) => { ln.ty = Math.max(ln.y, i ? lines[i - 1].ty + 34 : gg.top + 14); });
    const tx0 = M + 22 + gg.pw + 98;
    for (const ln of lines) { c.save(); c.globalAlpha = 0.85; dash(c, M + 22, M + 22 + gg.pw, ln.y, ln.p.col); c.restore(); c.strokeStyle = ln.p.col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(M + 22 + gg.pw, ln.y); c.lineTo(tx0 - 4, ln.ty); c.stroke();
      rr(c, tx0, ln.ty - 15, tagW - 10, 30, 7); fill(c, ln.p.col); tx(c, V.lastName(ln.p.m), tx0 + 9, ln.ty + 7, { s: 17, w: 800, col: "#fff", max: 100 }); tx(c, price(ln.p.avg), tx0 + tagW - 18, ln.ty + 7, { s: 17, w: 800, col: "#fff", f: MONO, a: "right" }); }
    footer(c, "House, Senate and OGE filings · amounts are best estimates of the filed ranges · Not advice");
  }

  // ---------- 4. latest disclosures ----------
  async function vList(c) {
    const P = V.P, since = V.today - (+P.days) * 86400000, sc0 = V.postScope(), side = P.side || "B";
    const list = V.trades.filter((t) => t.st && (V.isSec(t) || t.cls === "option") && sc0.test(t) && (side === "both" ? t.side !== "O" : t.side === side) && t.ftime && t.ftime >= since && t.T.ep);
    const noun = { B: "buy", S: "sale", both: "trade" }[side], lwho = sc0.kind === "one" ? sc0.short : sc0.kind === "committee" ? `${sc0.short} Committee members` : "Congress";
    if (!list.length) return FB;
    const by = new Map(); for (const t of list) { const g = by.get(t.m) || { m: V.members[t.m], list: [], amt: 0, newest: 0 }; g.list.push(t); g.amt += t.amt; g.newest = Math.max(g.newest, t.ftime); by.set(t.m, g); }
    const groups = [...by.values()].sort((a, b) => b.newest - a.newest || b.amt - a.amt); for (const g of groups) g.list.sort((a, b) => b.amt - a.amt || b.ftime - a.ftime);
    let y = header(c, `Disclosed ${date(new Date(since).toISOString().slice(0, 10))} – ${date(V.D.prices_through, { day: "numeric", month: "short", year: "numeric" })}`, { B: `What ${lwho} just bought`, S: `What ${lwho} just sold`, both: `Latest stock trades: ${lwho}` }[side], "");
    const HEAD = 64, ROW = 52, GAP = 10, avail = BOTTOM - y - 40 - 36, cost = (sh) => sh.reduce((a, n, i) => a + HEAD + n * ROW + (n < groups[i].list.length ? 26 : 8) + GAP, 0);
    let shown = [1]; while (shown.length < Math.min(8, groups.length) && cost([...shown, 1]) <= avail) shown.push(1);
    for (let added = true; added;) { added = false; for (let i = 0; i < shown.length; i++) { if (shown[i] >= groups[i].list.length) continue; shown[i]++; if (cost(shown) <= avail) added = true; else shown[i]--; } }
    tx(c, `${V.plural(list.length, noun)} by ${V.plural(groups.length, "politician")}${groups.length > shown.length ? ` · ${shown.length} shown` : ""}`, M, y + 4, { s: 23, w: 500, col: C.ink2 }); y += 26;
    // the shared column heads, as on the site
    const X = { stock: M + 22, trade: M + 172, amt: M + 268, dates: M + 418, px: M + 590, since: M + 726, meta: M + 840 }, R = W - M - 18;
    rr(c, M, y, W - 2 * M, 32, 8); fill(c, TINT.blue);
    [["Stock", X.stock], ["Trade", X.trade], ["Amount", X.amt], ["Traded · filed", X.dates], ["Price · now", X.px], ["Since · S&P", X.since], ["Account", X.meta]].forEach(([l, x]) => tx(c, l.toUpperCase(), x, y + 22, { s: 13, w: 800, col: C.blue, ls: 0.8 }));
    y += 42;
    const COLS = ["blue", "purple", "teal", "gold", "red", "navy", "green", "blue"];
    for (let gi = 0; gi < shown.length; gi++) { const g = groups[gi], n = shown[gi], more = g.list.length - n, col = COLS[gi % COLS.length], h = HEAD + n * ROW + (more > 0 ? 26 : 8);
      card(c, M, y, W - 2 * M, h, col); await face(c, g.m, M + 44, y + 36, 22);
      tx(c, V.plainName(g.m), M + 80, y + 33, { s: 24, w: 900, max: 520 });
      const ds = g.list.map((t) => t.fd).sort(); tx(c, `${V.tagline(g.m)} · ${V.plural(g.list.length, noun)} · filed ${date(ds[0])}${ds[ds.length - 1] !== ds[0] ? ` – ${date(ds[ds.length - 1])}` : ""}`, M + 80, y + 56, { s: 17, w: 600, col: C.ink2, max: 600 });
      tx(c, V.estText(V.estOf(g.list)), R, y + 42, { s: 24, w: 800, f: MONO, a: "right", col: C[col] });
      c.fillStyle = C.grid; c.fillRect(X.stock, y + HEAD - 2, R - X.stock, 1.5);
      g.list.slice(0, n).forEach((t, k) => { const ry = y + HEAD + k * ROW, l1 = ry + 22, l2 = ry + 42, v = V.eff(t, t.T.r), late = t.delay > 45;
        if (k) { c.fillStyle = C.grid; c.fillRect(X.stock, ry + 2, R - X.stock, 1); }
        const two = (x, w, a, b, fa, ca, cb, f = UI) => { tx(c, a, x, l1, { s: fa, w: 800, col: ca, f, max: w, min: 11 }); if (b) tx(c, b, x, l2, { s: 15, w: 600, col: cb || C.muted, max: w, min: 10 }); };
        two(X.stock, X.trade - X.stock - 8, t.t, short(t.st[0]), 19, C.ink, C.muted, MONO);
        two(X.trade, X.amt - X.trade - 8, t.side === "S" ? (t.k === "SP" ? "PART SOLD" : "SOLD") : "BOUGHT", "", 15, t.side === "S" ? C.down : C.up);
        two(X.amt, X.dates - X.amt - 8, V.amountShort(t), t.exact || !t.lo || t.lo === t.hi ? "" : `filed ${V.usd(t.lo)}–${V.usd(t.hi)}`, 17, C.ink, C.muted, MONO);
        two(X.dates, X.px - X.dates - 8, `Traded ${date(t.d)}`, `Filed ${date(t.fd)} · ${t.delay}d${late ? " late" : ""}`, 17, C.ink2, late ? C.down : C.muted);
        two(X.px, X.since - X.px - 8, price(t.T.ep), `now ${price(V.lastClose(t.t))}`, 17, C.ink, C.muted, MONO);
        two(X.since, X.meta - X.since - 8, v == null ? "–" : pc(v), t.T.sr == null ? "" : `S&P ${pc(t.T.sr)}`, 18, sc(v), C.muted, MONO);
        two(X.meta, R - X.meta, V.ownUnknown(t) ? "–" : (V.OWNER[t.own] || "Own"), t.c && t.c.length ? V.committeeShort(t.c[0]) : "no match", 16, C.ink2, t.c && t.c.length ? C.down : C.muted); });
      if (more > 0) tx(c, `+ ${V.plural(more, "smaller " + noun)} in this period`, X.stock, y + HEAD + n * ROW + 18, { s: 16, w: 600, col: C.muted });
      y += h + GAP; }
    footer(c, "House, Senate and OGE filings · price = close on the trade date · since = the move from the trade date · Not advice");
  }

  // ---------- 5. Democrats vs Republicans ----------
  async function vParties(c) {
    if (!V.PE.ticker || !V.PRICES.px[V.PE.ticker]) return FB;
    const tk = V.PE.ticker, s = V.PRICES.px[tk], st = V.stocks[tk], end = V.lastIdx(s), last = s[end];
    const list = V.trades.filter((t) => t.t === tk && t.st && t.side !== "O" && t.time >= V.windowStart() && !V.isBiz(V.members[t.m])), side = { D: [], R: [], I: [] };
    if (!list.length) return FB; for (const t of list) (side[V.members[t.m].party] || side.I).push(t);
    let y = header(c, `${tk} · Democrats vs Republicans · ${V.windowLabel()}`, short(st[0]), `**${tk}** · ${st[3] || st[2]} · close **${price(last)}** on ${date(V.PRICES.dates[end])}`);
    const P2 = [["D", "Democrats", C.D, "blue"], ["R", "Republicans", C.R, "red"]].map(([k, name, col, tint]) => { const L = side[k], buys = L.filter((t) => t.side === "B"), sells = L.filter((t) => t.side === "S");
      const pb = buys.filter((t) => t.amt > 0 && t.T.ep), sh = pb.reduce((a, t) => a + t.amt / t.T.ep, 0);
      return { name, col, tint, L, buys, sells, eb: V.estOf(buys), es: V.estOf(sells), avg: sh ? pb.reduce((a, t) => a + t.amt, 0) / sh : null, st: V.stats(buys, "T"), who: new Set(L.map((t) => t.m)) }; });
    const cw = (W - 2 * M - 18) / 2, ch = 46 + 30 + 8 * 38 + 14;
    P2.forEach((g, i) => { const x = M + i * (cw + 18); card(c, x, y, cw, ch, g.col);
      tx(c, g.name, x + 22, y + 46, { s: 30, w: 900, col: g.col }); tx(c, `${g.who.size} people · ${V.plural(g.buys.length, "buy")} · ${V.plural(g.sells.length, "sale")}`, x + 22, y + 74, { s: 18, w: 600, col: C.ink2 });
      const net = g.eb.best - g.es.best, r = g.avg ? last / g.avg - 1 : null;
      [["Bought", g.buys.length ? V.estText(g.eb) : "–", C.up], ["Sold", g.sells.length ? V.estText(g.es) : "–", C.down], ["Net", `${net >= 0 ? "+" : "−"}${V.usdEst(Math.abs(net))}`, sc(net)], ["Average buy", g.avg ? price(g.avg) : "–", C.ink],
        ["Price since then", pc(r), sc(r)], ["Their buys returned", g.st.n ? pc(g.st.ret) : "–", sc(g.st.ret)], ["S&P 500, same days", g.st.n ? pc(g.st.spyRet) : "–", C.ink2], ["Ahead of the S&P 500", g.st.n ? V.pts(g.st.diff) : "–", sc(g.st.diff)]]
        .forEach(([l, v, col], j) => { const ry = y + 90 + j * 38; if (j % 2 === 0) { rr(c, x + 12, ry, cw - 24, 38, 8); fill(c, TINT[g.tint]); }
          tx(c, l, x + 22, ry + 27, { s: 19, w: j === 7 ? 800 : 600, col: C.ink2 }); tx(c, v, x + cw - 22, ry + 27, { s: 20, w: 800, col, f: MONO, a: "right", max: cw * 0.45 }); }); });
    y += ch + 14;
    const [Dg, Rg] = P2; let verdict;
    if (Dg.st.n && Rg.st.n) { const b = Dg.st.diff >= Rg.st.diff ? Dg : Rg, w = b === Dg ? Rg : Dg; verdict = `**${b.name}' buys did better:** ${V.pts(b.st.diff)} against the S&P 500, versus ${V.pts(w.st.diff)} for ${w.name}.`; }
    else verdict = `Only one party bought ${tk} in this period.`;
    const vh = paraH(c, verdict, W - 2 * M - 44, 22) + 26; card(c, M, y, W - 2 * M, vh, "gold", { tint: true }); para(c, verdict, M + 22, y + 12, W - 2 * M - 44, { s: 22, col: C.ink });
    y += vh + 14;
    // most active, then the chart takes the rest
    const topH = 46 + 3 * 46 + 6, chH = BOTTOM - y - topH - 14;
    card(c, M, y, W - 2 * M, chH, "purple"); let yy = title(c, M + 22, y + 18, 1, `Price · ${V.periodLong()}`, "purple");
    tx(c, "▲ buy  △ sale  - - party's average buy", W - M - 22, y + 42, { s: 18, w: 700, col: C.ink2, a: "right" });
    const [i0, i1] = V.priceRange(s, V.windowDays()), g = priceChart(c, M + 22, yy - 6, W - 2 * M - 44, y + chH - 12 - (yy - 6), s, i0, i1, { col: C.ink2 });
    for (const p of P2) { if (p.avg && p.avg >= g.lo && p.avg <= g.hi) { dash(c, M + 22, M + 22 + g.pw, g.Y(p.avg), p.col); }
      for (const t of p.L) { const i = V.idxOfDate(t.d); if (i < i0) continue; tri(c, g.X(i), g.Y(s[i] ?? t.T.ep), t.side === "B", p.col, t.side !== "B"); } }
    y += chH + 14;
    for (const [i, p] of P2.entries()) { const x = M + i * (cw + 18), per = new Map();
      for (const t of p.L) { const e = per.get(t.m) || { m: V.members[t.m], b: 0, s: 0 }; if (t.side === "B") e.b += t.amt; else e.s += t.amt; per.set(t.m, e); }
      card(c, x, y, cw, topH, p.col); const ty = title(c, x + 22, y + 18, 0, `Most active ${p.name}`, p.col);
      const tops = [...per.values()].sort((a, b) => (b.b + b.s) - (a.b + a.s)).slice(0, 3);
      for (const [j, e] of tops.entries()) { const ry = ty + j * 46; await face(c, e.m, x + 38, ry + 16, 16);
        tx(c, V.shortName(e.m), x + 64, ry + 23, { s: 20, w: 700, max: cw - 280 }); tx(c, e.b ? `+${V.usdEst(e.b)}` : "–", x + cw - 120, ry + 23, { s: 19, w: 800, col: e.b ? C.up : C.muted, f: MONO, a: "right" });
        tx(c, e.s ? `−${V.usdEst(e.s)}` : "–", x + cw - 22, ry + 23, { s: 19, w: 800, col: e.s ? C.down : C.muted, f: MONO, a: "right" }); } }
    footer(c, "House, Senate and OGE filings · returns from the trade date, weighted by dollars · Not advice");
  }

  // ---------- 6. bonds and debt ----------
  async function vBonds(c) {
    if (V.P.bby === "issuer") return vBondIssuer(c);
    const all = V.PE.memberKey === "all", m = V.PE.member; if (!all && !m) return FB;
    const since = V.windowStart(), KC = { treasury: C.blue, muni: "#1baf7a", corp: "#eb6834", bank: "#6f4cc3", fund: "#8e96a3" };
    const poolAll = V.trades.filter((t) => t.time >= since && t.lo && V.isDebt(t) && !V.isBiz(V.members[t.m]) && (all || t.m === m.i)); for (const t of poolAll) t.debt = t.debt || V.debtInfo(t);
    const DT = V.DEBT_KINDS.some(([k]) => k === V.P.debt) ? V.P.debt : "all", WHAT = { all: "bonds and debt", treasury: "U.S. Treasuries", muni: "municipal bonds", corp: "corporate bonds", bank: "bank notes and CDs", fund: "bond funds" }[DT];
    const pool = DT === "all" ? poolAll : poolAll.filter((t) => t.debt.kind === DT);
    if (!pool.some((t) => t.side === "B")) return FB;
    const buys = pool.filter((t) => t.side === "B"), sells = pool.filter((t) => t.side === "S"), eb = V.estOf(buys), es = V.estOf(sells);
    const per = V.P.window === "all" ? `since ${V.START_SHORT}` : V.windowLabel();
    let y = all ? header(c, `Members and officials · ${WHAT} · ${per}`, `Who buys ${WHAT}`, "", DT === "all" ? "U.S. Treasuries, municipal and corporate bonds, bank notes and bond funds they bought: loans to governments and companies that pay interest." : `Only ${WHAT}; the bar below shows all their debt for comparison.`)
      : header(c, `${V.titleOf(m)} ${V.shortName(m)} · ${per}`, `${V.lastName(m)}’s ${WHAT}`, DT === "all" ? "Treasuries, municipal and corporate bonds, bank notes and bond funds: loans to governments and companies that pay interest." : `Only ${WHAT}; the bar below shows all their debt for comparison.`, { right: 150 });
    if (!all) await face(c, m, W - M - 62, 120, 58, true);
    const inW = W - 2 * M - 44, fw = (inW - 2 * 12) / 3;
    const theirAll = all ? null : V.trades.filter((t) => t.m === m.i && t.time >= since && t.side === "B" && t.lo && t.cls !== "option");
    const facts = [["blue", V.usdEst(eb.best), "Bought", `${V.plural(buys.length, "purchase")}${eb.exact ? "" : `, likely ${V.spanText(eb.lo, eb.hi)}`}.`], ["red", sells.length ? V.usdEst(es.best) : "$0", "Sold or redeemed", sells.length ? `${V.plural(sells.length, "sale")}${es.exact ? "" : `, likely ${V.spanText(es.lo, es.hi)}`}.` : "None in this period."],
      all ? ["purple", String(new Set(buys.map((t) => t.m)).size), "People", `members and officials who bought ${WHAT} in this period.`]
        : ["purple", `${Math.round(eb.best / (V.estOf(theirAll).best || 1) * 100)}%`, "Of all their buying", `went into ${WHAT}${DT === "all" ? " rather than stocks or funds" : ""}.`]];
    const fh = 46 + 76 + Math.max(...facts.map((f) => paraH(c, f[3], fw - 28, 18))) + 20; card(c, M, y, W - 2 * M, fh, "blue"); let yy = title(c, M + 22, y + 18, 1, "The totals", "blue");
    facts.forEach(([col, big, head, body], i) => { const x = M + 22 + i * (fw + 12); rr(c, x, yy, fw, fh - 60, 12); fill(c, TINT[col]);
      tx(c, big, x + 14, yy + 40, { s: 32, w: 800, col: C[col], f: MONO, max: fw - 28 }); tx(c, head, x + 14, yy + 66, { s: 19, w: 800 }); para(c, body, x + 14, yy + 74, fw - 28, { s: 18 }); });
    y += fh + 16;
    // 2 what kind of debt
    const byKind = new Map(V.DEBT_KINDS.map(([k]) => [k, 0])); for (const t of poolAll) if (t.side === "B") byKind.set(t.debt.kind, byKind.get(t.debt.kind) + t.amt); const tot = [...byKind.values()].reduce((a, v) => a + v, 0) || 1;
    // the legend wraps onto as many lines as it needs
    const legend = V.DEBT_KINDS.filter(([k]) => byKind.get(k)).map(([k, l]) => [k, `${l} ${V.usdEst(byKind.get(k))} · ${Math.round(byKind.get(k) / tot * 100)}%`]);
    let lines = 1, lw0 = 0; for (const [, t] of legend) { font(c, 700, 20); const w = 26 + c.measureText(t).width + 30; if (lw0 + w > inW) { lines++; lw0 = 0; } lw0 += w; }
    const h2 = 46 + 34 + lines * 32 + 24; card(c, M, y, W - 2 * M, h2, "purple"); yy = title(c, M + 22, y + 18, 2, "What kind of debt", "purple");
    let bx = M + 22; for (const [k] of V.DEBT_KINDS) { const w = inW * byKind.get(k) / tot; if (w > 0) { c.globalAlpha = DT === "all" || DT === k ? 1 : 0.25; rr(c, bx, yy, Math.max(4, w - 3), 26, 6); fill(c, KC[k]); c.globalAlpha = 1; bx += w; } }
    let lx = M + 22, ly = yy + 58; for (const [k, t] of legend) { font(c, 700, 20); const w = 26 + c.measureText(t).width + 30; if (lx + w - 30 > M + 22 + inW) { lx = M + 22; ly += 32; }
      c.globalAlpha = DT === "all" || DT === k ? 1 : 0.45; rr(c, lx, ly - 16, 18, 18, 4); fill(c, KC[k]); tx(c, t, lx + 26, ly, { s: 20, w: DT === k ? 800 : 700, col: C.ink2 }); c.globalAlpha = 1; lx += w; }
    y += h2 + 16;
    if (all) {
      // 3 who bought the most, each split by kind
      const pp = new Map(); for (const t of buys) { const e = pp.get(t.m) || { m: V.members[t.m], list: [], kinds: new Map() }; e.list.push(t); e.kinds.set(t.debt.kind, (e.kinds.get(t.debt.kind) || 0) + t.amt); pp.set(t.m, e); }
      const rank = [...pp.values()].map((e) => ({ ...e, est: V.estOf(e.list) })).sort((a, b) => b.est.best - a.est.best), h3 = BOTTOM - y, rowH = 62, n = Math.min(rank.length, Math.floor((h3 - 46 - 10) / rowH)), maxV = rank[0].est.best || 1;
      card(c, M, y, W - 2 * M, h3, "teal"); yy = title(c, M + 22, y + 18, 3, "Who bought the most", "teal");
      const WN = { treasury: "U.S. Treasuries", muni: "municipal bonds", corp: "corporate bonds", bank: "bank notes and CDs", fund: "bond funds" };
      for (let i = 0; i < n; i++) { const e = rank[i], ry = yy + i * rowH, cyy = ry + rowH / 2; if (i % 2 === 0) { rr(c, M + 14, ry, W - 2 * M - 28, rowH, 8); fill(c, TINT.teal); }
        await face(c, e.m, M + 50, cyy, 22);
        tx(c, `${V.shortName(e.m)} · ${V.party(e.m)}`, M + 84, cyy - 3, { s: 20, w: 800, max: 330 });
        const topK = [...e.kinds.entries()].sort((a, b) => b[1] - a[1])[0][0]; tx(c, `${V.plural(e.list.length, "purchase")}${DT === "all" ? ` · mostly ${WN[topK]}` : ""}`, M + 84, cyy + 21, { s: 16, w: 600, col: C.ink2, max: 330 });
        const bx0 = M + 440, bw = W - M - 22 - 170 - bx0; let x = bx0; for (const [k] of V.DEBT_KINDS) { const w = bw * (e.kinds.get(k) || 0) / maxV; if (w > 0) { c.fillStyle = KC[k]; c.fillRect(x, cyy - 9, w, 18); x += w; } }
        tx(c, V.usdEst(e.est.best), W - M - 30, cyy + 7, { s: 21, w: 800, f: MONO, a: "right" }); }
      if (rank.length > n) tx(c, `+${rank.length - n} more people`, M + 22, yy + n * rowH + 24, { s: 17, w: 600, col: C.muted });
      footer(c, "House, Senate and OGE filings · best estimates of the ranges · Not advice");
      return;
    }
    // 3 each issue they bought: the site's table
    const gs = new Map(); for (const t of buys) { const d = t.debt, k = `${d.name}|${d.coupon}|${d.mdate}`, g = gs.get(k) || { d, list: [] }; g.list.push(t); gs.set(k, g); }
    const rows = [...gs.values()].map((g) => ({ ...g, est: V.estOf(g.list) })).sort((a, b) => b.est.best - a.est.best), rowH = 40, h3 = BOTTOM - y, n = Math.min(rows.length, Math.floor((h3 - 46 - 38 - 44) / rowH));
    card(c, M, y, W - 2 * M, h3, "teal"); yy = title(c, M + 22, y + 18, 3, "Each bond they bought, biggest first", "teal");
    const X0 = M + 22, cols = [["Issuer", X0 + 26, 440], ["Type", X0 + 480, 120], ["Coupon", X0 + 610, 80], ["Matures", X0 + 700, 110], ["Bought", W - M - 32, 150, "right"]];
    table(c, M + 14, yy - 4, W - 2 * M - 28, cols, rows.slice(0, n).map((g) => [[g.d.name, null, C.ink], [V.DEBT_KINDS.find(([k]) => k === g.d.kind)[1].replace(" & CDs", ""), null, C.ink2],
      [g.d.coupon != null ? `${+g.d.coupon.toFixed(3)}%` : "–", null, C.ink2, null, MONO], [g.d.mdate ? V.fmtDate(g.d.mdate, { month: "short", year: "numeric" }) : "–", null, g.d.msrc === "likely" ? C.muted : C.ink2, null, MONO],
      [`${g.list.length === 1 ? V.amountShort(g.list[0]) : V.usdEst(g.est.best)}${g.list.length > 1 ? ` · ${g.list.length} buys` : ""}`, null, C.ink, null, MONO]]), { rowH, col: "teal", s1: 17 });
    rows.slice(0, n).forEach((g, k) => { rr(c, X0 + 4, yy - 4 + 38 + k * rowH + rowH / 2 - 7, 12, 14, 3); fill(c, KC[g.d.kind]); });
    if (rows.length > n) tx(c, `+${rows.length - n} more issues · grey maturity = likely date`, M + 22, yy + 38 + n * rowH + 22, { s: 17, w: 600, col: C.muted });
    footer(c, "House filings · best estimates of the ranges · maturity from the filing or a CUSIP lookup (OpenFIGI) · Not advice");
  }

  // ---------- 6b. bonds by issuer: who bought one issuer's bonds, with each person's coupons and maturities ----------
  async function vBondIssuer(c) {
    const since = V.windowStart(), name = V.PE.bond; if (!name) return FB;
    const KC = { treasury: C.blue, muni: "#1baf7a", corp: "#eb6834", bank: "#6f4cc3", fund: "#8e96a3" }, WN = { treasury: "U.S. Treasuries", muni: "municipal bonds", corp: "corporate bonds", bank: "bank notes and CDs", fund: "bond funds" };
    const pool = V.trades.filter((t) => t.time >= since && t.lo && V.isDebt(t) && !V.isBiz(V.members[t.m]) && (t.debt = t.debt || V.debtInfo(t)).name === name);
    const buys = pool.filter((t) => t.side === "B"), sells = pool.filter((t) => t.side === "S"); if (!buys.length) return FB;
    const kind = buys[0].debt.kind, eb = V.estOf(buys), es = V.estOf(sells), per = new Map();
    for (const t of pool) { const e = per.get(t.m) || { m: V.members[t.m], b: [], s: [], issues: new Map() }; (t.side === "B" ? e.b : e.s).push(t); if (t.side === "B") e.issues.set(`${t.debt.coupon ?? ""}|${t.debt.mdate || ""}`, t.debt); per.set(t.m, e); }
    const rows = [...per.values()].filter((e) => e.b.length).map((e) => ({ ...e, eb: V.estOf(e.b), es: V.estOf(e.s) })).sort((a, b) => b.eb.best - a.eb.best);
    const perL = V.P.window === "all" ? `since ${V.START_SHORT}` : V.windowLabel(), inW = W - 2 * M - 44;
    let y = header(c, `${V.DEBT_KINDS.find(([k]) => k === kind)[1]} · ${perL}`, `Who bought ${name}`, "", `${rows.length === 1 ? "One person" : `${rows.length} people`} bought its bonds ${V.P.window === "all" ? `since ${V.START_SHORT}` : `in ${V.periodLong()}`}.`, { ts: 46 });
    const fw = (inW - 24) / 3, facts = [["blue", V.usdEst(eb.best), "Bought", `${V.plural(buys.length, "purchase")}${eb.exact ? "" : `, likely ${V.spanText(eb.lo, eb.hi)}`}.`],
      ["red", sells.length ? V.usdEst(es.best) : "$0", "Sold or redeemed", sells.length ? `${V.plural(sells.length, "sale")}${es.exact ? "" : `, likely ${V.spanText(es.lo, es.hi)}`}.` : "None in this period."],
      ["purple", String(rows.length), rows.length === 1 ? "Person" : "People", `${WN[kind]} bought by members and officials.`]];
    const fh = 46 + 76 + Math.max(...facts.map((f) => paraH(c, f[3], fw - 28, 18))) + 20; card(c, M, y, W - 2 * M, fh, "blue"); let yy = title(c, M + 22, y + 18, 1, "The totals", "blue");
    facts.forEach(([col, big, head, body], i) => { const x = M + 22 + i * (fw + 12); rr(c, x, yy, fw, fh - 60, 12); fill(c, TINT[col]);
      tx(c, big, x + 14, yy + 40, { s: 32, w: 800, col: C[col], f: MONO, max: fw - 28 }); tx(c, head, x + 14, yy + 66, { s: 19, w: 800 }); para(c, body, x + 14, yy + 74, fw - 28, { s: 18 }); });
    y += fh + 16;
    const h2 = BOTTOM - y, rowH = 54, n = Math.min(rows.length, Math.floor((h2 - 46 - 38 - 40) / rowH));
    card(c, M, y, W - 2 * M, h2, "teal"); yy = title(c, M + 22, y + 18, 2, "Who bought it", "teal");
    const X0 = M + 22, cols = [["Person", X0 + 46, 290], ["Issues (coupon · matures)", X0 + 360, 330], ["Bought", X0 + 820, 130, "right"], ["Sold", W - M - 32, 100, "right"]];
    table(c, M + 14, yy - 4, W - 2 * M - 28, cols, rows.slice(0, n).map((e) => { const iss = [...e.issues.values()].map((d) => [d.coupon != null ? `${+d.coupon.toFixed(3)}%` : "", d.mdate ? V.fmtDate(d.mdate, { month: "short", year: "numeric" }) : ""].filter(Boolean).join(" · ") || "not given");
      return [[`${V.shortName(e.m)} · ${V.party(e.m)}`, V.plural(e.b.length, "purchase"), C.ink], [iss.slice(0, 2).join("   ") + (iss.length > 2 ? `   +${iss.length - 2}` : ""), null, C.ink2, null, MONO],
        [e.b.length === 1 ? V.amountShort(e.b[0]) : V.usdEst(e.eb.best), null, C.ink, null, MONO], [e.s.length ? V.usdEst(e.es.best) : "–", null, e.s.length ? C.down : C.muted, null, MONO]]; }), { rowH, col: "teal", s1: 18 });
    for (let i = 0; i < n; i++) await face(c, rows[i].m, X0 + 20, yy - 4 + 38 + i * rowH + rowH / 2, 17);
    if (rows.length > n) tx(c, `+${rows.length - n} more people`, M + 22, yy + 38 + n * rowH + 24, { s: 17, w: 600, col: C.muted });
    footer(c, "House, Senate and OGE filings · best estimates of the ranges · issuer names are the filings' abbreviations written out · Not advice");
  }

  // ---------- 7. biggest buys: the site's ring, logo badges and side cards, with the Markets & AI look and larger text ----------
  async function vHoldings(c) {
    const byStock = V.P.hby === "stock", tk = V.PE.ticker, m = byStock ? null : V.PE.member;
    if (byStock ? !tk || !V.stocks[tk] : !m) return FB;
    const since = V.windowStart();
    const mine = V.trades.filter((t) => (byStock ? t.t === tk && !V.isBiz(V.members[t.m]) : t.m === m.i) && t.time >= since && t.side !== "O" && t.cls !== "option" && t.lo), by = new Map();
    for (const t of mine) { const k = byStock ? t.m : V.holdingKey(t); if (k == null || k === "") continue; const pm = V.members[t.m];
      const g = by.get(k) || (byStock ? { k, m: pm, info: { name: `${V.shortName(pm)} · ${V.isExec(pm) ? pm.party : V.party(pm)}`, kind: "stock" }, t: tk, first: t, b: 0, s: 0 } : { k, info: V.holdingInfo(t), t: t.t, first: t, b: 0, s: 0 });
      if (t.side === "B") g.b += t.amt; else g.s += t.amt; by.set(k, g); }
    const all = [...by.values()], top = all.filter((g) => g.b > 0).sort((a, b) => b.b - a.b).slice(0, 15); if (!top.length) return FB; const buys = mine.filter((t) => t.side === "B"), sells = mine.filter((t) => t.side === "S");
    const eb = V.estOf(buys), es = V.estOf(sells), total = top.reduce((a, g) => a + g.b, 0);
    const money = (v) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e8 ? `$${Math.round(v / 1e6)}M` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${Math.round(v / 1e3)}K` : `$${Math.round(v)}`;
    let pi = 0;
    for (const g of top) { if (byStock) { g.col = V.HOLD_PALETTE[pi++ % V.HOLD_PALETTE.length]; } else { const b = V.brandOf(g.first); g.col = b ? b[0] : V.HOLD_PALETTE[pi++ % V.HOLD_PALETTE.length]; g.brand = b; g.logo = b && b[1] && b[1] !== "ms" ? await V.loadLogo(b[1]) : null; } g.soft = V.mixHex(g.col, "#6b7584", 0.3); }
    const stName = byStock ? short(V.stocks[tk][0]) : "";
    let y = byStock ? header(c, `${tk} · ${V.windowLabel()}`, `Who bought ${stName}`, `The ${top.length === 1 ? "buyer" : `${top.length} biggest buyers`} in ${V.periodLong()}, and how much each also sold.`)
      : header(c, `${V.titleOf(m)} ${V.shortName(m)} · ${V.windowLabel()}`, `${V.lastName(m)}’s biggest buys`, `The ${top.length} largest buys in ${V.periodLong()}, and how much of each was also sold.`);
    const factH = 214, h1 = BOTTOM - y - factH - 16;
    // 1 the ring, with each holding's card beside its slice
    card(c, M, y, W - 2 * M, h1, "blue"); const yy = title(c, M + 22, y + 18, 1, "Where the money went", "blue");
    const CW = 290, top0 = yy - 4, bot0 = y + h1 - 12, CX = W / 2, CY = (top0 + bot0) / 2, RO = 166, RI = 106;
    let a = top.length > 1 && top[0].b / total > 0.4 ? -Math.PI * top[0].b / total : -Math.PI / 2;
    for (const g of top) { const sw = 2 * Math.PI * g.b / total; g.mid = a + sw / 2; c.beginPath(); c.arc(CX, CY, RO, a, a + sw); c.arc(CX, CY, RI, a + sw, a, true); c.closePath(); c.fillStyle = g.soft; c.fill(); if (top.length > 1) { c.lineWidth = 3; c.strokeStyle = "#fff"; c.stroke(); } a += sw; }
    c.beginPath(); c.arc(CX, CY, RI - 8, 0, 7); c.strokeStyle = C.blue; c.lineWidth = 3; c.stroke();
    if (!byStock) await face(c, m, CX, CY, RI - 14, true);
    const right = top.filter((g) => Math.cos(g.mid) >= 0).sort((p, q) => Math.sin(p.mid) - Math.sin(q.mid)), left = top.filter((g) => Math.cos(g.mid) < 0).sort((p, q) => Math.sin(p.mid) - Math.sin(q.mid));
    const maxN = Math.max(right.length, left.length), CH = Math.min(78, Math.floor((bot0 - top0 - 6 * (maxN - 1)) / maxN));
    for (const [col, sg] of [[right, 1], [left, -1]]) {
      col.forEach((g) => { g.side = sg; g.ty = CY + (RO + 20) * Math.sin(g.mid); });
      if (col.length > 5) { const step = (bot0 - top0 - CH) / (col.length - 1); col.forEach((g, i) => { g.ty = top0 + CH / 2 + i * step; }); }
      else { for (let i = 1; i < col.length; i++) col[i].ty = Math.max(col[i].ty, col[i - 1].ty + CH + 10); const over = col.length ? col[col.length - 1].ty + CH / 2 - bot0 : 0; if (over > 0) col.forEach((g) => { g.ty -= over; });
        if (col.length && col[0].ty - CH / 2 < top0) { const d = top0 - (col[0].ty - CH / 2); col.forEach((g) => { g.ty += d; }); } }
    }
    const badge = (g, x, y0, z) => { const b = g.brand || [g.col];
      if (b[1] === "ms") { rr(c, x, y0, z, z, 9); fill(c, "#fff"); c.strokeStyle = C.grid; c.lineWidth = 1; c.stroke(); const q = z * 0.2, gp = z * 0.04, x0 = x + z / 2 - q - gp / 2, yb = y0 + z / 2 - q - gp / 2;
        [["#F25022", 0, 0], ["#7FBA00", 1, 0], ["#00A4EF", 0, 1], ["#FFB900", 1, 1]].forEach(([cc, i, j]) => { c.fillStyle = cc; c.fillRect(x0 + i * (q + gp), yb + j * (q + gp), q, q); }); return; }
      rr(c, x, y0, z, z, 9); fill(c, b[2] || b[0]);
      if (g.logo) { const n = Math.round(z * 1.2), off = document.createElement("canvas"); off.width = off.height = n; const oc = off.getContext("2d"); oc.drawImage(g.logo, 0, 0, n, n); oc.globalCompositeOperation = "source-in"; oc.fillStyle = b[2] ? b[0] : "#fff"; oc.fillRect(0, 0, n, n); c.drawImage(off, x + z * 0.2, y0 + z * 0.2, z * 0.6, z * 0.6); return; }
      const t = b[3] || g.info.badge; font(c, 800, t.length > 3 ? z * 0.3 : t.length > 2 ? z * 0.36 : t.length > 1 ? z * 0.42 : z * 0.56); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(t, x + z / 2, y0 + z / 2 + 1); c.textAlign = "left"; c.textBaseline = "alphabetic"; };
    if (byStock) { const b = V.brandOf({ t: tk, a: V.stocks[tk][0] }), ctr = { brand: b || [C.blue, null, null, tk.slice(0, 4)], info: { badge: tk.slice(0, 4) }, col: b ? b[0] : C.blue, logo: b && b[1] && b[1] !== "ms" ? await V.loadLogo(b[1]) : null };
      c.beginPath(); c.arc(CX, CY, RI - 14, 0, 7); fill(c, "#fff"); badge(ctr, CX - 40, CY - 64, 80); tx(c, tk, CX, CY + 50, { s: 26, w: 800, f: MONO, a: "center" }); tx(c, stName, CX, CY + 74, { s: 15, w: 600, col: C.muted, a: "center", max: 2 * RI - 50, min: 11 }); }
    for (const g of top) {
      const x0 = g.side > 0 ? W - M - 16 - CW : M + 16, y0 = g.ty - CH / 2, ax = g.side > 0 ? x0 : x0 + CW, ex = CX + (RO + 3) * Math.cos(g.mid), ey = CY + (RO + 3) * Math.sin(g.mid);
      c.strokeStyle = g.soft; c.lineWidth = 2; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ax - g.side * 18, g.ty); c.lineTo(ax, g.ty); c.stroke(); c.beginPath(); c.arc(ex, ey, 4.5, 0, 7); c.fillStyle = g.soft; c.fill();
      c.save(); c.shadowColor = "rgba(20,40,80,0.10)"; c.shadowBlur = 8; c.shadowOffsetY = 2; rr(c, x0, y0, CW, CH, 10); fill(c, "#fff"); c.restore(); rr(c, x0, y0, 7, CH, 3); fill(c, g.soft);
      const z = Math.min(48, CH - 16); if (byStock) await face(c, g.m, x0 + 16 + z / 2, y0 + CH / 2, z / 2 - 2); else badge(g, x0 + 16, y0 + (CH - z) / 2, z);
      const tx0 = x0 + 28 + z, tw = CW - (tx0 - x0) - 10, small = CH < 76;
      tx(c, g.info.name, tx0, y0 + (small ? 21 : 24), { s: 17, w: 700, col: C.ink2, max: tw, min: 12 });
      tx(c, money(g.b), tx0, y0 + (small ? 44 : 50), { s: small ? 21 : 24, w: 800, f: MONO });
      const more = g.s > g.b; tx(c, g.s >= 500 ? `sold ${money(g.s)}${more ? " · more than bought" : ""}` : "none sold", tx0, y0 + (small ? 63 : 70), { s: 15, w: more ? 800 : 600, col: more ? C.down : C.muted, max: tw, min: 11 });
    }
    y += h1 + 16;
    // 2–4 the three facts, as the Markets & AI tiles
    const kinds = { stock: 0, fund: 0, bond: 0 }; for (const g of all) kinds[g.info.kind] += g.b; const share = (v) => Math.round(v / (eb.best || 1) * 100) + "%", net = eb.best - es.best;
    const pSum = (k) => all.filter((g) => (g.m && g.m.party) === k).reduce((a, g) => a + g.b, 0);
    const third = byStock ? ["purple", `${share(pSum("D"))} · ${share(pSum("R"))}`, "Democrats · Republicans", `Democrats bought ${money(pSum("D"))} and Republicans ${money(pSum("R"))} of it in ${V.periodLong()}.`]
      : kinds.bond / (eb.best || 1) >= 0.1 ? ["gold", money(kinds.bond), "Went into bonds and notes", `Bonds and bank notes took ${share(kinds.bond)} of the buying; stocks ${share(kinds.stock)}, funds ${share(kinds.fund)}.`]
      : kinds.fund / (eb.best || 1) >= 0.1 ? ["green", money(kinds.fund), "Went into funds and ETFs", `Funds and ETFs took ${share(kinds.fund)} of the buying; single stocks ${share(kinds.stock)}.`]
      : ["green", share(total), `In these ${top.length}`, `Of all the buying, ${share(total)} went into the holdings shown.`];
    const facts = [["blue", money(eb.best), "Bought", `Best estimate from ${buys.length.toLocaleString()} buys, likely ${money(eb.lo)}–${money(eb.hi)}. The filings' ranges alone allow ${money(eb.min)}–${money(eb.max)}.`],
      ["red", money(es.best), "Sold in the same period", sells.length ? `${sells.length.toLocaleString()} sales, likely ${money(es.lo)}–${money(es.hi)}. Net, about ${money(Math.abs(net))} more ${net >= 0 ? "went in than came out" : "came out than went in"}.` : "No sales in this period."], third];
    const fw = (W - 2 * M - 24) / 3, fs = fitS((q) => Math.max(...facts.map((f) => paraH(c, f[3], fw - 36, q))), factH - 104, 19, 14);
    facts.forEach(([col, big, head, body], i) => { const x = M + i * (fw + 12); card(c, x, y, fw, factH, col);
      tx(c, big, x + 20, y + 58, { s: 42, w: 800, col: C[col], f: MONO, max: fw - 40 }); tx(c, head, x + 20, y + 90, { s: 21, w: 800 }); para(c, body, x + 20, y + 98, fw - 36, { s: fs }); });
    const lastFiled = mine.reduce((mx, t) => t.fd && t.fd > mx ? t.fd : mx, "");
    footer(c, `${byStock ? "STOCK Act and OGE" : "STOCK Act"} transaction reports${lastFiled ? `, filed through ${date(lastFiled)}` : ""} (${mine.length.toLocaleString()} trades) · best estimates of the filed ranges · options left out · Not advice`);
  }

  // ---------- 8. member factsheet: the site's two columns, with its bar chart and largest buys ----------
  async function vScorecard(c) {
    const m = V.PE.member, S = V.S;
    if (!m) return FB;
    const all = V.trades.filter((t) => t.m === m.i && t.st && (V.isSec(t) || (t.cls === "option" && S.options)) && t.side !== "O" && !(V.P.noBig && V.isBig(t)));
    const buysAll = all.filter((t) => t.side === "B" && t.T.r != null && t.T.sr != null); if (!buysAll.length) return FB; const since = V.windowStart(), win = buysAll.filter((t) => t.time >= since), pool = win.length ? win : buysAll;
    const partyWord = { D: "Democrat", R: "Republican", I: "Independent" }[m.party] || "", stateName = (V.STATE_NAMES[m.state] || m.state || "").replace(/^the /, "");
    let y = header(c, "Stock trading factsheet", V.plainName(m), [V.office(m), stateName, V.chamberOf(m) === "H" && m.district ? `district ${m.district}` : "", partyWord].filter(Boolean).join(" · ") + ` · as of ${date(V.D.prices_through, { day: "numeric", month: "short", year: "numeric" })}`, { right: 150 });
    await face(c, m, W - M - 62, 120, 58, true);
    const half = (W - 2 * M - 16) / 2, xL = M, xR = M + half + 16, iw = half - 44, per = V.windowLabel();
    // left 1: key facts
    const delays = all.filter((t) => t.delay != null && t.delay >= 0).map((t) => t.delay), own = new Map(); for (const t of all) if (!V.ownUnknown(t)) own.set(t.own || "self", (own.get(t.own || "self") || 0) + t.amt);
    const ownTop = [...own.entries()].sort((a, b) => b[1] - a[1])[0], vol = V.sumAmt(all), nB = all.filter((t) => t.side === "B").length, comms = (m.committees || []).map(V.cname).join(", ") || "None listed";
    const kf = [[`Stock trades since ${V.START_SHORT}`, all.length.toLocaleString()], ["Buys · sales", `${nB.toLocaleString()} · ${(all.length - nB).toLocaleString()}`], ["Dollars traded", V.listSpan(all)], ["Median days to report", delays.length ? String(V.median(delays)) : "–"],
      ["Reported after 45 days", delays.filter((d) => d > 45).length.toLocaleString()], ["Main account", ownTop ? `${{ self: "Own", SP: "Spouse", DC: "Child", JT: "Joint" }[ownTop[0]] || ownTop[0]} · ${Math.round(ownTop[1] / (vol || 1) * 100)}%` : "–"]];
    const h1 = 46 + 22 + paraH(c, comms, iw, 18) + 8 + kf.length * 34 + 10;
    card(c, xL, y, half, h1, "blue"); let yl = title(c, xL + 22, y + 18, 1, "Key facts", "blue");
    tx(c, "Committees", xL + 22, yl + 16, { s: 17, w: 700, col: C.muted }); yl = para(c, comms, xL + 22, yl + 20, iw, { s: 18, w: 600, col: C.ink }) + 8;
    kf.forEach(([l, v], i) => { const ry = yl + i * 34; if (i % 2 === 0) { rr(c, xL + 12, ry, half - 24, 34, 8); fill(c, TINT.blue); } tx(c, l, xL + 22, ry + 24, { s: 17, w: 600, col: C.ink2, max: iw - 170 }); tx(c, v, xL + half - 22, ry + 24, { s: 18, w: 800, a: "right", f: MONO, max: 170 }); });
    // right 2: the performance table
    const periods = [["3M", 91], ["6M", 182], ["1Y", 365], [`Since '${V.D.start.slice(2, 4)}`, null]].map(([l, d]) => { const b = buysAll.filter((t) => d == null || t.time >= V.today - d * 86400000); return { l, n: b.length, s: V.stats(b, "T"), c: V.stats(b, "P") }; });
    const rowsP = [["From the trade date"], ["Their buys", (p) => p.s.n ? pc(p.s.ret) : "–", () => C.ink], ["S&P 500", (p) => p.s.n ? pc(p.s.spyRet) : "–", () => C.muted], ["Difference", (p) => p.s.n ? V.pts(p.s.diff) : "–", (p) => sc(p.s.diff), true],
      ["From the day it was disclosed"], ["Their buys", (p) => p.c.n ? pc(p.c.ret) : "–", () => C.ink], ["S&P 500", (p) => p.c.n ? pc(p.c.spyRet) : "–", () => C.muted], ["Difference", (p) => p.c.n ? V.pts(p.c.diff) : "–", (p) => sc(p.c.diff), true], ["Buys counted", (p) => p.n.toLocaleString(), () => C.muted]];
    const h2 = 46 + 24 + 2 * 28 + 7 * 30 + 12; card(c, xR, y, half, Math.max(h1, h2), "purple"); let yr = title(c, xR + 22, y + 18, 2, "Their buys vs the S&P 500", "purple", iw);
    const c0 = 150, cw4 = (iw - c0) / 4; periods.forEach((p, i) => tx(c, p.l, xR + 22 + c0 + (i + 1) * cw4, yr + 12, { s: 15, w: 800, col: C.muted, a: "right", max: cw4 - 4 })); yr += 22;
    for (const [l, val, col, bold] of rowsP) { if (!val) { tx(c, l, xR + 22, yr + 20, { s: 15, w: 800, col: C.purple }); yr += 28; continue; }
      tx(c, l, xR + 22, yr + 21, { s: 16, w: bold ? 800 : 600, col: C.ink2 }); periods.forEach((p, j) => tx(c, val(p), xR + 22 + c0 + (j + 1) * cw4, yr + 21, { s: 16, w: bold ? 800 : 700, col: col(p), f: MONO, a: "right", max: cw4 - 4, min: 11 })); yr += 30; }
    let yL = y + Math.max(h1, h2) + 16, yR = yL;
    // left 3: how often they beat it
    const sW = V.stats(pool, "T"), wins = Math.round(sW.win * sW.n), h3 = 46 + 168;
    card(c, xL, yL, half, h3, "green"); yl = title(c, xL + 22, yL + 18, 3, `Beat the S&P 500 · ${per}`, "green", iw);
    tx(c, `${Math.round(sW.win * 100)}%`, xL + 22, yl + 56, { s: 56, w: 900, col: C.green });
    const sq = 24, sx = xL + 22 + 150, filled = Math.round(sW.win * 20); for (let i = 0; i < 20; i++) { rr(c, sx + (i % 10) * (sq + 4), yl + 8 + Math.floor(i / 10) * (sq + 4), sq, sq, 4); fill(c, i < filled ? C.green : C.grid); }
    para(c, `**${wins.toLocaleString()} of ${sW.n.toLocaleString()} buys** did better than the S&P 500 over the same days. Each square is 5%.`, xL + 22, yl + 76, iw, { s: 18 });
    yL += h3 + 16;
    // right 4: the bar chart, their buys (green) against the S&P 500 (blue), with a % axis
    const h4 = 300; card(c, xR, yR, half, h4, "teal"); yr = title(c, xR + 22, yR + 18, 4, "Trade date: buys vs S&P 500", "teal", iw);
    tx(c, "■ their buys", xR + 22, yr + 12, { s: 16, w: 700, col: C.up }); tx(c, "■ S&P 500", xR + 150, yr + 12, { s: 16, w: 700, col: C.blue });
    { const vals = periods.flatMap((p) => p.s.n ? [p.s.ret, p.s.spyRet] : []), vmin = Math.min(0, ...vals), vmax = Math.max(vmin + 0.02, 0, ...vals), ax = xR + 72, aw = half - 72 - 22, top = yr + 34, ph = yR + h4 - 40 - top;
      const Yb = (v) => top + (vmax - v) / (vmax - vmin) * ph;
      for (let g = 0; g <= 3; g++) { const v = vmin + (vmax - vmin) * g / 3; c.fillStyle = C.grid; c.fillRect(ax, Yb(v), aw, 1.2); tx(c, pc(v, 0), ax - 8, Yb(v) + 6, { s: 15, w: 600, col: C.muted, a: "right", f: MONO }); }
      c.fillStyle = C.ink2; c.fillRect(ax, Yb(0), aw, 2); c.fillRect(ax, top, 2, ph);
      const gw = aw / periods.length, bw = Math.min(30, gw / 3.2);
      periods.forEach((p, i) => { const cx = ax + i * gw + gw / 2; if (p.s.n) for (const [v, col, dx] of [[p.s.ret, C.up, -bw - 2], [p.s.spyRet, C.blue, 2]]) { const y1 = Yb(Math.max(0, v)), y2 = Yb(Math.min(0, v)); rr(c, cx + dx, y1, bw, Math.max(2, y2 - y1), 3); fill(c, col);
          tx(c, pc(v, Math.abs(v) < 0.1 ? 1 : 0), cx + dx + bw / 2, v >= 0 ? y1 - 6 : y2 + 16, { s: 13, w: 800, col: C.ink2, a: "center", f: MONO }); }
        tx(c, p.l, cx, top + ph + 24, { s: 16, w: 700, col: C.ink2, a: "center" }); }); }
    yR += h4 + 16;
    // left 5: sectors bought
    const sec = new Map(); for (const t of pool) sec.set(t.st[1] || "Other", (sec.get(t.st[1] || "Other") || 0) + t.amt); const secTot = V.sumAmt(pool) || 1;
    const h5 = BOTTOM - yL, nSec = Math.min(sec.size, Math.floor((h5 - 46 - 10) / 40)), secRows = [...sec.entries()].sort((a, b) => b[1] - a[1]).slice(0, nSec);
    card(c, xL, yL, half, h5, "gold"); yl = title(c, xL + 22, yL + 18, 5, `Sectors bought · ${per}`, "gold", iw);
    secRows.forEach(([nm, amt], i) => { const ry = yl + i * 40, f = amt / secTot; tx(c, nm, xL + 22, ry + 20, { s: 18, w: 600, col: C.ink2, max: iw - 70 }); tx(c, `${Math.round(f * 100)}%`, xL + half - 22, ry + 20, { s: 18, w: 800, f: MONO, a: "right" });
      rr(c, xL + 22, ry + 27, iw, 9, 4); fill(c, C.grid); rr(c, xL + 22, ry + 27, Math.max(4, iw * f), 9, 4); fill(c, C.gold); });
    // right 6: their largest buys
    const nOf = new Map(); for (const t of pool) nOf.set(t.t, (nOf.get(t.t) || 0) + 1);
    const big = [...pool].sort((a, b) => b.amt - a.amt || b.time - a.time).filter((t, i, arr) => arr.findIndex((u) => u.t === t.t) === i), h6 = BOTTOM - yR, n6 = Math.min(big.length, Math.floor((h6 - 46 - 6) / 48));
    card(c, xR, yR, half, h6, "red"); yr = title(c, xR + 22, yR + 18, 6, `Largest buys · ${per}`, "red", iw);
    big.slice(0, n6).forEach((t, i) => { const ry = yr + i * 48, v = V.eff(t, t.T.r); if (i % 2 === 0) { rr(c, xR + 12, ry, half - 24, 46, 8); fill(c, TINT.red); }
      tx(c, t.t, xR + 22, ry + 21, { s: 18, w: 800, f: MONO }); tx(c, pc(v, 0), xR + half - 22, ry + 21, { s: 18, w: 800, col: sc(v), f: MONO, a: "right" });
      tx(c, short(t.st[0]) + (nOf.get(t.t) > 1 ? ` (${nOf.get(t.t)} buys)` : ""), xR + 22, ry + 40, { s: 15, w: 600, col: C.ink2, max: iw - 130, min: 11 }); tx(c, V.amountShort(t), xR + half - 22, ry + 40, { s: 15, w: 700, col: C.ink2, f: MONO, a: "right" }); });
    footer(c, "House filings · buys held until a full sale is reported · past results don't predict future returns · Not advice");
  }

  // ---------- 9. copy-trading leaderboard ----------
  async function vLeaders(c) {
    const from = Math.max(V.windowStart(), Date.parse(V.D.start + "T00:00:00Z")), rows = V.followScores(from), N = Math.min(rows.length, 8); if (rows.length < 4) return FB;
    let y = header(c, "Copy-trading score · members of Congress", "Who's worth copying?", `Points out of 100 for copying each member's stock buys on the day they were disclosed, ${date(new Date(from).toISOString().slice(0, 10), { month: "short", year: "numeric" })} to ${date(V.D.prices_through, { month: "short", year: "numeric" })}.`);
    const MEDAL = ["#c9a227", "#9aa4ae", "#b0763c"], pw = (W - 2 * M - 32) / 3, h1 = 380, h2 = 346, baseY = y + 30 + h1;
    for (const [col, rank] of [1, 0, 2].entries()) { const r = rows[rank], h = rank === 0 ? h1 : h2, x = M + col * (pw + 16), yt = baseY - h, cx = x + pw / 2;
      card(c, x, yt, pw, h, rank === 0 ? "gold" : rank === 1 ? "#9aa4ae" : "#b0763c");
      c.beginPath(); c.arc(cx, yt, 26, 0, 7); c.fillStyle = MEDAL[rank]; c.fill(); c.lineWidth = 4; c.strokeStyle = C.bg; c.stroke(); tx(c, String(rank + 1), cx, yt + 9, { s: 26, w: 800, col: "#fff", a: "center" });
      const fr = rank === 0 ? 66 : 56, fcy = yt + 40 + fr; await face(c, r.m, cx, fcy, fr, true);
      tx(c, V.plainName(r.m), cx, fcy + fr + 38, { s: 25, w: 800, a: "center", max: pw - 24 }); tx(c, V.tagline(r.m), cx, fcy + fr + 64, { s: 18, w: 600, col: C.muted, a: "center", max: pw - 24 });
      tx(c, Math.round(r.score) + "", cx, yt + h - 58, { s: rank === 0 ? 60 : 52, w: 900, a: "center", col: C.ink }); caps(c, "points", cx, yt + h - 36, C.muted, 15, "center");
      tx(c, `copying ${pc(r.s.ret, 0)} vs S&P ${pc(r.s.spyRet, 0)} · ${r.s.n} buys`, cx, yt + h - 12, { s: 16, w: 600, col: C.ink2, a: "center", max: pw - 20, min: 12 }); }
    y = baseY + 20;
    const SEG = [["Edge vs S&P (40)", "edge"], ["Hit rate (25)", "hit"], ["Speed (15)", "speed"], ["Record (20)", "record"]], COL = ["#1f5fd6", "#0f8f84", "#a87400", "#7a4fd0"];
    const rest = rows.slice(3, N), h3 = BOTTOM - y; card(c, M, y, W - 2 * M, h3, "blue"); let yy = title(c, M + 22, y + 18, 0, "The rest of the top 8 · what each score is made of", "blue");
    let lx = M + 22; SEG.forEach(([l], i) => { rr(c, lx, yy - 2, 18, 18, 4); fill(c, COL[i]); lx += 26 + tx(c, l, lx + 26, yy + 14, { s: 18, w: 600, col: C.ink2 }) + 24; }); yy += 30;
    const rh = Math.min(104, (y + h3 - 10 - yy) / Math.max(1, rest.length));
    for (const [i, r] of rest.entries()) { const ry = yy + i * rh, cy = ry + rh / 2; rr(c, M + 14, ry + 4, W - 2 * M - 28, rh - 8, 12); fill(c, i % 2 ? "#fff" : TINT.blue);
      tx(c, String(i + 4), M + 44, cy + 10, { s: 28, w: 800, col: C.muted, a: "center" }); await face(c, r.m, M + 98, cy, 28);
      tx(c, V.plainName(r.m), M + 140, cy - 4, { s: 23, w: 800, max: 380 }); tx(c, `${V.tagline(r.m)} · ${r.s.n} buys · copying ${pc(r.s.ret, 0)} vs S&P ${pc(r.s.spyRet, 0)}`, M + 140, cy + 22, { s: 16, w: 600, col: C.ink2, max: 420, min: 12 });
      const bx = M + 580, bw = W - M - 22 - 80 - bx; c.save(); rr(c, bx, cy - 8, bw, 16, 8); c.clip(); c.fillStyle = C.grid; c.fillRect(bx, cy - 8, bw, 16); let x = bx; SEG.forEach(([, k], j) => { const w = r.parts[k] / 100 * bw; c.fillStyle = COL[j]; c.fillRect(x, cy - 8, Math.max(0, w - 2), 16); x += w; }); c.restore();
      tx(c, String(Math.round(r.score)), W - M - 30, cy + 12, { s: 34, w: 900, a: "right" }); }
    footer(c, "House and Senate filings · copying = buy when a trade was disclosed, sell when the sale was · 5+ buys · Not advice");
  }

  // ---------- 10. committee overlap ----------
  async function vConflict(c) {
    if (V.PE.memberKey === "all") return vConflictAll(c);
    if (!V.PE.member || V.noSeat(V.PE.member)) return FB;
    const m = V.PE.member, S = V.S, since = V.windowStart(), HOT = "#d9480f", COLD = "#b4bcc7";
    const list = V.trades.filter((t) => t.st && (V.isSec(t) || (t.cls === "option" && S.options)) && t.side !== "O" && t.time >= since && t.amt > 0 && t.m === m.i), inArea = (t) => !!(t.c && t.c.length);
    if (!list.length) return FB; const total = V.sumAmt(list), hot = V.sumAmt(list.filter(inArea));
    let y = header(c, `Committee overlap · ${V.periodLong()}`, V.plainName(m), V.tagline(m), { right: 150 });
    await face(c, m, W - M - 62, 120, 58, true);
    const inW = W - 2 * M - 44, shareTxt = `${Math.round(hot / total * 100)}%`;
    // 1 the headline share
    card(c, M, y, W - 2 * M, 190, "red"); let yy = title(c, M + 22, y + 18, 1, "Trading in their own committees' areas", "red");
    const sw = tx(c, shareTxt, M + 22, yy + 92, { s: 110, w: 900, col: HOT });
    para(c, `of ${V.plainName(m)}'s stock trading was in industries overseen by **${V.lastName(m)}'s own committees**: ${V.listSpan(list.filter(inArea))} of ${V.listSpan(list)} traded, ${list.length.toLocaleString()} trades.`, M + 50 + sw, yy + 4, inW - sw - 30, { s: 22, col: C.ink });
    y += 190 + 16;
    // 2 the flow from committees to industries
    const inT = new Map(); for (const t of list) if (inArea(t)) { const g = inT.get(t.t) || { t: t.t, amt: 0, c: t.c[0] }; g.amt += t.amt; inT.set(t.t, g); }
    const topIn = [...inT.values()].sort((a, b) => b.amt - a.amt).slice(0, 3), listH = 46 + topIn.length * 54 + 12, h2 = BOTTOM - y - listH - 16;
    card(c, M, y, W - 2 * M, h2, "gold"); yy = title(c, M + 22, y + 18, 2, "Where the money went: committee → industry", "gold");
    let lx = M + 22; for (const [col, l] of [[HOT, `In ${V.lastName(m)}'s committee areas`], [COLD, "Outside them"]]) { rr(c, lx, yy - 2, 18, 18, 4); fill(c, col); lx += 26 + tx(c, l, lx + 26, yy + 14, { s: 19, w: 600, col: C.ink2 }) + 28; }
    const RMAX = 7, tidy = (s) => s === s.toUpperCase() ? s.toLowerCase().replace(/\b\w/g, (q) => q.toUpperCase()) : s, indOf = (t) => tidy(t.st[1] || "Other");
    const OUT = "\u0000out", OTHER = "Other sectors", SEP = "\u0001", raw = new Map(), rTot = new Map();
    for (const t of list) { const cs = inArea(t) ? t.c : [OUT], ind = indOf(t); for (const cc of cs) raw.set(cc + SEP + ind, (raw.get(cc + SEP + ind) || 0) + t.amt / cs.length); rTot.set(ind, (rTot.get(ind) || 0) + t.amt); }
    const rS = [...rTot.entries()].sort((a, b) => b[1] - a[1]), keep = new Set(rS.slice(0, rS.length > RMAX ? RMAX - 1 : RMAX).map(([k]) => k)), folded = rS.length - keep.size;
    const flows = new Map(), lAmt = new Map(), rAmt = new Map();
    for (const [k, a] of raw) { const [cc, i0] = k.split(SEP), ind = keep.has(i0) ? i0 : OTHER; flows.set(cc + SEP + ind, (flows.get(cc + SEP + ind) || 0) + a); lAmt.set(cc, (lAmt.get(cc) || 0) + a); rAmt.set(ind, (rAmt.get(ind) || 0) + a); }
    const Ln = [...lAmt.entries()].sort((a, b) => (a[0] === OUT) - (b[0] === OUT) || b[1] - a[1]).map(([key, amt]) => ({ key, amt })), li = new Map(Ln.map((n, i) => [n.key, i]));
    const fl = [...flows.entries()].map(([k, a]) => { const [cc, ind] = k.split(SEP); return { c: cc, ind, a }; });
    const bary = (ind) => { let s2 = 0, w = 0; for (const f of fl) if (f.ind === ind) { s2 += f.a * li.get(f.c); w += f.a; } return w ? s2 / w : 0; };
    const Rn = [...rAmt.entries()].map(([key, amt]) => ({ key, amt, b: bary(key) })).sort((a, b) => (a.key === OTHER) - (b.key === OTHER) || a.b - b.b || b.amt - a.amt), ri = new Map(Rn.map((n, i) => [n.key, i]));
    const top = yy + 60, bot = y + h2 - 30, gap = 14, labelW = 250, nodeW = 14, lxN = M + 22 + labelW + 12, rxN = W - M - 22 - labelW - 12 - nodeW;
    caps(c, "Committee", M + 22, top - 18, C.muted, 16); caps(c, "Sector", W - M - 22, top - 18, C.muted, 16, "right");
    const scale = Math.min((bot - top - gap * (Ln.length - 1)) / total, (bot - top - gap * (Rn.length - 1)) / total);
    const place = (ns) => { let q = top + (bot - top - (total * scale + gap * (ns.length - 1))) / 2; for (const n of ns) { n.y = q; n.h = n.amt * scale; q += n.h + gap; } }; place(Ln); place(Rn);
    const lOff = new Map(Ln.map((n) => [n.key, n.y])), rOff = new Map(Rn.map((n) => [n.key, n.y]));
    fl.sort((p, q) => li.get(p.c) - li.get(q.c) || ri.get(p.ind) - ri.get(q.ind)); for (const f of fl) { f.ly = lOff.get(f.c); lOff.set(f.c, f.ly + f.a * scale); }
    for (const f of [...fl].sort((p, q) => ri.get(p.ind) - ri.get(q.ind) || li.get(p.c) - li.get(q.c))) { f.ry = rOff.get(f.ind); rOff.set(f.ind, f.ry + f.a * scale); }
    const xa = lxN + nodeW, xb = rxN, xm = (xa + xb) / 2;
    for (const f of fl) { const h = f.a * scale; c.beginPath(); c.moveTo(xa, f.ly); c.bezierCurveTo(xm, f.ly, xm, f.ry, xb, f.ry); c.lineTo(xb, f.ry + h); c.bezierCurveTo(xm, f.ry + h, xm, f.ly + h, xa, f.ly + h); c.closePath(); c.globalAlpha = 0.55; c.fillStyle = f.c === OUT ? COLD : HOT; c.fill(); c.globalAlpha = 1; }
    for (const n of Ln) { c.fillStyle = n.key === OUT ? COLD : HOT; c.fillRect(lxN, n.y, nodeW, Math.max(2, n.h)); } for (const n of Rn) { c.fillStyle = C.ink2; c.fillRect(rxN, n.y, nodeW, Math.max(2, n.h)); }
    const labels = (ns, left) => { for (const n of ns) { const nm = left ? (n.key === OUT ? "No committee link" : V.cname(n.key)) : n.key === OTHER ? `${OTHER} (${folded})` : n.key; n.lines = layout(c, nm, labelW, 20, 800).length; n.nm = nm; n.lh = paraH(c, nm, labelW, 20, 800, 1.2) + 24; n.c = n.y + n.h / 2; }
      ns[0].c = Math.max(ns[0].c, top + ns[0].lh / 2 - 6); for (let i = 1; i < ns.length; i++) ns[i].c = Math.max(ns[i].c, ns[i - 1].c + (ns[i - 1].lh + ns[i].lh) / 2 + 8);
      const lst = ns[ns.length - 1]; if (lst.c + lst.lh / 2 > bot + 26) { lst.c = bot + 26 - lst.lh / 2; for (let i = ns.length - 2; i >= 0; i--) ns[i].c = Math.min(ns[i].c, ns[i + 1].c - (ns[i].lh + ns[i + 1].lh) / 2 - 8); }
      for (const n of ns) { const x = left ? lxN - 12 : rxN + nodeW + 12, y0 = n.c - n.lh / 2;
        if (Math.abs(n.c - (n.y + n.h / 2)) > 10) { c.strokeStyle = C.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(left ? lxN - 3 : rxN + nodeW + 3, n.y + n.h / 2); c.lineTo(left ? x + 4 : x - 4, n.c); c.stroke(); }
        const ey = para(c, n.nm, x, y0, labelW, { s: 20, w: 800, col: C.ink, lh: 1.2, a: left ? "right" : "left" });
        tx(c, `${V.usdEst(n.amt)} · ${Math.round(n.amt / total * 100)}%`, x, ey + 18, { s: 17, w: 600, col: C.muted, a: left ? "right" : "left" }); } };
    labels(Ln, true); labels(Rn, false);
    y += h2 + 16;
    card(c, M, y, W - 2 * M, listH, "red"); yy = title(c, M + 22, y + 18, 3, `Biggest stocks in ${V.lastName(m)}'s committee areas`, "red");
    topIn.forEach((g, i) => { const ry = yy + i * 54; rr(c, M + 14, ry, W - 2 * M - 28, 48, 8); fill(c, TINT.red); tx(c, g.t, M + 26, ry + 31, { s: 21, w: 800, f: MONO });
      tx(c, `${short(V.stocks[g.t][0])} · ${V.cname(g.c)}`, M + 120, ry + 31, { s: 19, w: 600, col: C.ink2, max: inW - 320 }); tx(c, V.usdEst(g.amt), W - M - 30, ry + 31, { s: 21, w: 800, f: MONO, a: "right", col: HOT }); });
    footer(c, "House filings · committee areas are this site's reading of each committee's remit · a match is not evidence of wrongdoing · Not advice");
  }

  // ---------- 10b. committee overlap for all of Congress: which committees' members trade most in their own areas ----------
  async function vConflictAll(c) {
    const S = V.S, since = V.windowStart(), HOT = "#d9480f", inW = W - 2 * M - 44;
    const list = V.trades.filter((t) => t.st && (V.isSec(t) || (t.cls === "option" && S.options)) && t.side !== "O" && t.time >= since && t.amt > 0 && !V.noSeat(V.members[t.m])), inArea = (t) => !!(t.c && t.c.length);
    if (!list.length) return FB;
    const total = V.sumAmt(list), hot = V.sumAmt(list.filter(inArea)), nm = new Set(list.map((t) => t.m)).size;
    let y = header(c, `Committee overlap · all of Congress · ${V.periodLong()}`, "All of Congress", `${V.listSpan(list.filter(inArea))} of ${V.listSpan(list)} traded · ${list.length.toLocaleString()} trades by ${nm} members.`);
    card(c, M, y, W - 2 * M, 190, "red"); let yy = title(c, M + 22, y + 18, 1, "Trading in their own committees' areas", "red");
    const sw = tx(c, `${Math.round(hot / total * 100)}%`, M + 22, yy + 92, { s: 110, w: 900, col: HOT });
    para(c, "of stock trading by members of Congress was in industries **their own committees oversee**.", M + 50 + sw, yy + 14, inW - sw - 30, { s: 24, col: C.ink });
    y += 190 + 16;
    const byC = new Map(); for (const t of list) if (inArea(t)) for (const cc of t.c) { const g = byC.get(cc) || { c: cc, amt: 0, n: 0, ms: new Set(), tk: new Map() }; g.amt += t.amt; g.n++; g.ms.add(t.m); g.tk.set(t.t, (g.tk.get(t.t) || 0) + t.amt); byC.set(cc, g); }
    const rows = [...byC.values()].sort((a, b) => b.amt - a.amt), h2 = BOTTOM - y, rowH = 78, N = Math.min(rows.length, Math.floor((h2 - 46 - 10) / rowH)), max = rows.length ? rows[0].amt : 1;
    card(c, M, y, W - 2 * M, h2, "gold"); yy = title(c, M + 22, y + 18, 2, "Dollars members traded in their committee's area", "gold");
    rows.slice(0, N).forEach((g, i) => { const ry = yy + i * rowH, cy = ry + rowH / 2; if (i % 2 === 0) { rr(c, M + 14, ry, W - 2 * M - 28, rowH, 8); fill(c, TINT.gold); }
      tx(c, V.cname(g.c), M + 26, cy - 6, { s: 21, w: 800, max: 380 });
      tx(c, `${V.plural(g.ms.size, "member")} · ${V.plural(g.n, "trade")} · ${[...g.tk.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t).join(", ")}`, M + 26, cy + 20, { s: 16, w: 600, col: C.ink2, max: 380 });
      const bx0 = M + 430, bx1 = W - M - 160; rr(c, bx0, cy - 12, Math.max(4, (bx1 - bx0) * g.amt / max), 24, 6); fill(c, HOT);
      tx(c, V.usdEst(g.amt), W - M - 28, cy + 8, { s: 21, w: 800, f: MONO, a: "right" }); });
    if (!rows.length) tx(c, "No trades matched a committee area in this period.", M + 22, yy + 40, { s: 22, w: 600, col: C.muted });
    footer(c, "House and Senate filings · committee areas are this site's reading of each committee's remit · a match is not evidence of wrongdoing · Not advice");
  }

  // ---------- 11. buying spikes ----------
  async function vSpikes(c) {
    const since = V.windowStart(), seat = (t) => !V.isBiz(V.members[t.m]), by = new Map();
    for (const t of V.trades) { if (!t.spike || !t.st || t.time < since || !seat(t) || !V.PRICES.px[t.t]) continue; const g = by.get(t.t) || { t: t.t, st: t.st, last: t, s: t.spike }; if (t.time > g.last.time) { g.last = t; g.s = t.spike; } by.set(t.t, g); }
    for (const g of by.values()) { g.buys = V.trades.filter((t) => t.t === g.t && t.side === "B" && seat(t) && Math.abs(t.time - g.last.time) <= V.SPIKE_HALF); g.ms = [...new Set(g.buys.map((t) => t.m))];
      g.est = V.estOf(g.buys); g.by = new Map(g.ms.map((mi) => [mi, V.estOf(g.buys.filter((t) => t.m === mi))])); g.ms.sort((a, b) => g.by.get(b).best - g.by.get(a).best);
      g.since = V.weighted(g.buys, (t) => V.eff(t, t.T.r)); g.spy = V.weighted(g.buys, (t) => t.T.sr); const pb = g.buys.filter((t) => t.amt > 0 && t.T.ep), sh = pb.reduce((a, t) => a + t.amt / t.T.ep, 0); g.avg = sh ? pb.reduce((a, t) => a + t.amt, 0) / sh : null; }
    const rows = [...by.values()].sort((a, b) => b.last.time - a.last.time); if (!rows.length) return FB;
    const fi = rows.findIndex((g) => g.t === V.P.ticker); if (fi > 0) rows.unshift(rows.splice(fi, 1)[0]);
    let y = header(c, `Unusual buying spikes · ${V.periodLong()}`, "Unusual congressional buying", "Three or more members buying the same stock within about a month, when that many would happen by chance less than 1 time in 20.");
    const chart = (g, x, yy, w, h, small) => { const s = V.PRICES.px[g.t], ci = V.idxOfDate(g.last.d), e = V.lastIdx(s), i0 = Math.max(0, ci - (small ? 90 : 130)), i1 = Math.min(e, ci + (small ? 120 : 170));
      const gg = priceChart(c, x, yy, w, h, s, i0, i1, { small, yTitle: "Price ($)" });
      const a = gg.X(Math.max(i0, V.idxOfDate(new Date(g.last.time - V.SPIKE_HALF).toISOString().slice(0, 10)))), b = gg.X(Math.min(i1, V.idxOfDate(new Date(g.last.time + V.SPIKE_HALF).toISOString().slice(0, 10))));
      c.fillStyle = "rgba(46,125,79,0.14)"; c.fillRect(a, gg.top, Math.max(4, b - a), gg.ph);
      if (g.avg != null && g.avg >= gg.lo && g.avg <= gg.hi) dash(c, x, x + gg.pw, gg.Y(g.avg), C.ink2, small ? 1.5 : 2);
      for (const t of g.buys) { const k = V.idxOfDate(t.d); if (k < i0 || k > i1) continue; c.beginPath(); c.arc(gg.X(k), gg.Y(s[k] ?? t.T.ep), small ? 6 : 8, 0, 7); c.fillStyle = C.green; c.fill(); c.lineWidth = 2; c.strokeStyle = "#fff"; c.stroke(); }
      const now = s[e] ?? s[i1]; if (!small) { tag(c, x + gg.pw + 4, gg.Y(now), price(now), C.blue, "#fff"); if (g.avg != null && g.avg >= gg.lo && g.avg <= gg.hi) { const ay = Math.abs(gg.Y(g.avg) - gg.Y(now)) < 32 ? gg.Y(now) + 34 : gg.Y(g.avg); tag(c, x + gg.pw + 4, ay, "Avg " + price(g.avg), "#fff", C.ink, C.ink2); } }
      return gg; };
    // 1 the newest spike, large
    const f = rows[0], h1 = 600, inW = W - 2 * M - 44;
    card(c, M, y, W - 2 * M, h1, "green"); let yy = title(c, M + 22, y + 18, 1, "The latest spike", "green");
    tx(c, f.t, M + 22, yy + 34, { s: 40, w: 800, f: MONO }); font(c, 800, 40, MONO); const tw = c.measureText(f.t).width;
    tx(c, short(f.st[0]) + (f.st[5] ? " · S&P 500" : ""), M + 40 + tw, yy + 32, { s: 22, w: 600, col: C.ink2, max: inW - tw - 220 });
    if (f.since != null) tx(c, `${pc(f.since)} since`, W - M - 22, yy + 34, { s: 30, w: 800, col: sc(f.since), f: MONO, a: "right" });
    para(c, `**Bought ${V.estText(f.est)}** by ${f.ms.length} members around ${date(f.last.d, { month: "short", year: "numeric" })}. Usually ${f.s.usual < 1 ? "under 1 member" : f.s.usual.toFixed(1) + " members"} a month buy it${f.spy != null ? `; the S&P 500 did ${pc(f.spy)} over the same days` : ""}.`, M + 22, yy + 48, inW, { s: 20 });
    chart(f, M + 22, yy + 110, inW, 300, false);
    const n9 = Math.min(8, f.ms.length), fw = inW / n9;
    for (let k = 0; k < n9; k++) { const mi = f.ms[k], cx = M + 22 + k * fw + fw / 2, fy = y + h1 - 84; await face(c, V.members[mi], cx, fy, 26);
      tx(c, V.lastName(V.members[mi]), cx, fy + 50, { s: 17, w: 700, col: C.ink2, a: "center", max: fw - 6 }); tx(c, V.estText(f.by.get(mi)), cx, fy + 72, { s: 15, w: 700, col: C.muted, a: "center", f: MONO, max: fw - 4, min: 11 }); }
    tx(c, "shaded = the spike's month · dots = their buys · dashed = their average buy", W - M - 22, y + 42, { s: 16, w: 600, col: C.muted, a: "right" });
    y += h1 + 16;
    // 2 the spikes before it
    const rest = rows.slice(1, 5), tw2 = (W - 2 * M - 16) / 2, th2 = (BOTTOM - y - 16) / 2, COLS = ["blue", "purple", "teal", "gold"];
    for (const [k, g] of rest.entries()) { const x = M + (k % 2) * (tw2 + 16), ty = y + Math.floor(k / 2) * (th2 + 16), col = COLS[k];
      card(c, x, ty, tw2, th2, col); tx(c, g.t, x + 20, ty + 46, { s: 30, w: 800, f: MONO }); font(c, 800, 30, MONO); const t0 = c.measureText(g.t).width;
      tx(c, short(g.st[0]), x + 32 + t0, ty + 44, { s: 18, w: 600, col: C.ink2, max: tw2 - t0 - 160 }); if (g.since != null) tx(c, pc(g.since), x + tw2 - 20, ty + 46, { s: 24, w: 800, col: sc(g.since), f: MONO, a: "right" });
      tx(c, `${g.ms.length} members · ${date(g.last.d, { month: "short", year: "numeric" })}`, x + 20, ty + 103, { s: 17, w: 700, col: C.ink2, max: 160 });
      tx(c, `Bought ${V.estText(g.est)}`, x + 20, ty + 74, { s: 18, w: 800, col: C.ink, f: MONO, max: tw2 - 40 });
      { const nowPx = V.PRICES.px[g.t][V.lastIdx(V.PRICES.px[g.t])]; let px = x + tw2 - 20;
        for (const [t, bg, ink, edge] of [["Now " + price(nowPx), C.blue, "#fff"], ...(g.avg != null ? [["Avg " + price(g.avg), "#fff", C.ink, C.ink2]] : [])]) { font(c, 700, 16, MONO); const pw = c.measureText(t).width + 16; px -= pw; rr(c, px, ty + 84, pw, 26, 6); fill(c, bg); if (edge) { c.strokeStyle = edge; c.lineWidth = 1.2; c.stroke(); } tx(c, t, px + 8, ty + 103, { s: 16, w: 700, col: ink, f: MONO }); px -= 6; } }
      chart(g, x + 20, ty + 116, tw2 - 40, th2 - 116 - 54, true);
      for (let j = 0; j < Math.min(5, g.ms.length); j++) await face(c, V.members[g.ms[j]], x + 38 + j * 42, ty + th2 - 28, 16);
      if (g.ms.length > 5) tx(c, `+${g.ms.length - 5}`, x + 38 + 5 * 42 - 6, ty + th2 - 22, { s: 16, w: 700, col: C.muted }); }
    footer(c, "House, Senate and OGE filings · a spike is tested against how often members usually buy the stock · Not advice");
  }

  const VIEWS = { chart: vChart, signals: vSignals, terminal: vTerminal, list: vList, parties: vParties, bonds: vBonds, holdings: vHoldings, scorecard: vScorecard, leaders: vLeaders, conflict: vConflict, spikes: vSpikes };
  window.HFDataVizPhone = {
    // draws the view on a 1080×1440 canvas; returns null, a message to show instead, or FALLBACK
    async draw(style, c, theme) {
      if (!VIEWS[style] || theme === "dark" || !window.__DV) return FB;
      V = window.__DV;
      try { await Promise.all([`800 20px ${UI}`, `700 20px ${UI}`, `600 20px ${UI}`, `500 20px ${UI}`, `800 20px ${MONO}`, `700 20px ${MONO}`, `600 20px ${MONO}`].map((f) => document.fonts.load(f))); } catch (e) { /* fonts optional */ }
      return (await VIEWS[style](c)) || null;
    },
  };
})();
