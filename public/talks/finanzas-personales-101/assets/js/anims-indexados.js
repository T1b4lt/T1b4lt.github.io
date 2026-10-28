/* Section 05: passive investing, index funds, returns, time and drawdowns. */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  // Haystack: 1.249 dots; a lens hunts the needle, then the whole haystack is bought.
  A["pajar"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 795,
      H = 560;
    const svg = F.stage(slide, "#pj-stage", W, H);
    const cols = 50,
      sp = 15.4,
      ox = 20,
      oy = 70;
    const dots = [];
    const dg = F.el("g", {}, svg);
    for (let i = 0; i < 1249; i++) {
      const c = i % cols,
        r = Math.floor(i / cols);
      dots.push(F.el("circle", { cx: ox + c * sp, cy: oy + r * sp, r: 4.6, fill: "#c9b8a8" }, dg));
    }
    const title = F.text(svg, ox, 40, "1.249 empresas del MSCI World", { size: 22, fill: C.heading, font: Deck.DISPLAY, weight: 700 });
    const lens = F.el("g", { opacity: 0 }, svg);
    F.el("circle", { cx: 0, cy: 0, r: 34, fill: "rgba(255,255,255,0.35)", stroke: C.warm, "stroke-width": 4 }, lens);
    F.line(lens, 24, 24, 52, 52, { stroke: C.warm, w: 7, cap: "round" });
    const needle = dots[637];
    const frame = F.rect(svg, ox - 14, oy - 14, (cols - 1) * sp + 28, 24 * sp + 28, { fill: "none", stroke: C.accent, sw: 3, rx: 10, opacity: 0 });
    const fund = F.text(svg, W / 2, oy + 25 * sp + 48, "1 fondo indexado = todas, en su peso", { size: 24, anchor: "middle", fill: C.accent, font: Deck.DISPLAY, weight: 700, opacity: 0 });

    const cap = Deck.captions(tl, slide.querySelector("#pj-cap"), [
      '<span class="k">El pajar</span>Cada punto es una empresa grande o mediana de un país desarrollado.<small>Apple, Nestlé, Toyota, Inditex… y otras 1.245.</small>',
      '<span class="k">Buscar la aguja</span>La gestión activa intenta adivinar qué empresas lo harán mejor.<small>Cuesta caro (analistas, comisiones del 1,5–2 %) y casi nunca acierta durante años seguidos.</small>',
      '<span class="k">Comprar el pajar</span>Un fondo indexado compra todas, en el mismo peso que el índice, de forma automática.<small>Si una empresa crece, pesa más; si se hunde, sale. Coste: ~0,1–0,3 % al año.</small>',
    ]);
    tl.fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.02, stagger: { each: 0.0012, from: "random" } }, 0.1);
    F.fade(tl, title, 0.1);
    cap(0, 0.2);
    tl.addLabel("s0");
    // Step 1: lens wanders, picks one dot
    tl.set(lens, { opacity: 1, x: 120, y: 160 }, "s0");
    tl.to(lens, { x: 520, y: 260, duration: 0.8, ease: "sine.inOut" }, "s0");
    tl.to(lens, { x: 300, y: 380, duration: 0.8, ease: "sine.inOut" }, "s0+=0.8");
    tl.to(lens, { x: +needle.getAttribute("cx"), y: +needle.getAttribute("cy"), duration: 0.6, ease: "power2.out" }, "s0+=1.6");
    tl.to(needle, { attr: { r: 9, fill: C.warm }, duration: 0.3 }, "s0+=2.1");
    cap(1, "s0");
    tl.addLabel("s1");
    // Step 2: lens goes, everything fills blue, frame appears
    tl.to(lens, { opacity: 0, duration: 0.3 }, "s1");
    tl.to(needle, { attr: { r: 4.6 }, duration: 0.3 }, "s1");
    tl.to(dots, { attr: { fill: C.accent }, duration: 0.02, stagger: { each: 0.0008, from: "start" } }, "s1+=0.2");
    tl.to(frame, { opacity: 1, duration: 0.5 }, "s1+=1.0");
    tl.to(fund, { opacity: 1, duration: 0.5 }, "s1+=1.2");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Horizontal bars helper for categorical lists.
  function hbars(tl, svg, W, data, o) {
    const x0 = o.x0,
      x1 = W - 70,
      rowH = o.rowH,
      y0 = o.y0 || 10;
    const sx = F.scale(0, o.max, x0, x1);
    data.forEach(([name, v, col], i) => {
      const y = y0 + i * rowH;
      F.text(svg, x0 - 14, y + rowH / 2 + 6, name, { size: o.size || 19, anchor: "end", fill: C.text });
      const r = F.rect(svg, x0, y + 6, sx(v) - x0, rowH - 14, { fill: col || C.markA });
      const t = F.text(svg, sx(v) + 10, y + rowH / 2 + 6, F.num(v, o.dec === undefined ? 1 : o.dec) + (o.unit || " %"), { size: 18, fill: C.heading, font: Deck.MONO, weight: 600 });
      F.growH(tl, r, (o.at || 0.2) + i * 0.1, 0.8);
      F.fade(tl, t, (o.at || 0.2) + 0.5 + i * 0.1);
    });
  }

  A["msci"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 682,
      H = 470;
    const s1 = F.stage(slide, "#ms-stage-1", W, H);
    hbars(
      tl,
      s1,
      W,
      [
        ["EE. UU.", 72.94, C.markA],
        ["Japón", 5.91, C.markA],
        ["Reino Unido", 3.41, C.markA],
        ["Canadá", 3.29, C.markA],
        ["Francia", 2.24, C.markA],
        ["Otros 18 países", 12.21, "#a9a097"],
      ],
      { x0: 170, rowH: 70, max: 80, y0: 20 },
    );
    const s2 = F.stage(slide, "#ms-stage-2", W, H);
    hbars(
      tl,
      s2,
      W,
      [
        ["Nvidia", 5.81],
        ["Apple", 5.41],
        ["Microsoft", 4.0],
        ["Alphabet (A+C)", 3.99],
        ["Amazon", 2.67],
        ["Meta", 1.76],
        ["Broadcom", 1.76],
        ["Micron", 1.33],
        ["Tesla", 1.12],
      ].map(([n, v]) => [n, v, C.markC]),
      { x0: 170, rowH: 50, max: 7, y0: 10, size: 18, dec: 2, at: 0.6 },
    );
    return { tl };
  };

  // SPIVA waffle: 98 of 100 active funds lag their index.
  A["spiva"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 735,
      H = 520;
    const svg = F.stage(slide, "#sp-stage", W, H);
    const cell = 44,
      gap = 6,
      ox = 20,
      oy = 20;
    const cells = [];
    for (let i = 0; i < 100; i++) {
      const c = i % 10,
        r = Math.floor(i / 10);
      const win = i >= 98;
      cells.push(F.rect(svg, ox + c * (cell + gap), oy + r * (cell + gap), cell, cell, { fill: win ? C.markA : C.markB, rx: 4, opacity: win ? 1 : 0.85 }));
    }
    const lx = ox + 10 * (cell + gap) + 16;
    const l1 = F.el("g", {}, svg);
    F.text(l1, lx, 120, "98", { size: 64, fill: C.warm, font: Deck.DISPLAY, weight: 900 });
    F.text(l1, lx, 150, "quedan por debajo", { size: 17, fill: C.text });
    F.text(l1, lx, 172, "de su índice", { size: 17, fill: C.text });
    const l2 = F.el("g", {}, svg);
    F.text(l2, lx, 400, "2", { size: 64, fill: C.accent, font: Deck.DISPLAY, weight: 900 });
    F.text(l2, lx, 430, "lo baten", { size: 17, fill: C.text });
    tl.fromTo(cells, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: (i) => (i >= 98 ? 1 : 0.85), scale: 1, duration: 0.25, stagger: 0.018, ease: "back.out(2)" }, 0.2);
    F.fade(tl, l1, 1.2);
    F.fade(tl, l2, 2.1);
    tl.from(slide.querySelectorAll("#sp-tbl tr"), { opacity: 0, x: 20, stagger: 0.12, duration: 0.4 }, 2.2);
    return { tl };
  };

  // Fees: three curves diverging over 30 years.
  A["comisiones"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 520;
    const svg = F.stage(slide, "#co-stage", W, H);
    const x0 = 100,
      x1 = W - 300;
    const sx = F.scale(0, 30, x0, x1);
    const sy = F.scale(0, 80000, H - 40, 20);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [0, 20000, 40000, 60000, 80000], x0, x1, { fmt: (v) => F.num(v) + " €" });
    [0, 10, 20, 30].forEach((t) => F.text(g, sx(t), H - 12, t + " años", { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO }));
    F.fade(tl, g, 0, { dur: 0.3 });
    const series = [
      [0.2, "Indexado · 0,2 %", C.markA],
      [1.5, "Activo · 1,5 %", C.markD],
      [2.0, "Activo · 2,0 %", C.markB],
    ];
    const ends = [];
    series.forEach(([fee, name, col], i) => {
      const pts = [];
      for (let n = 0; n <= 30; n++) pts.push([sx(n), sy(10000 * Math.pow(1 + (7 - fee) / 100, n))]);
      const p = F.path(svg, F.poly(pts), { stroke: col, w: 3.5 });
      Deck.draw(tl, p, 0.4, 2.4);
      const end = 10000 * Math.pow(1 + (7 - fee) / 100, 30);
      ends.push(end);
      const gl = F.el("g", { opacity: 0 }, svg);
      F.el("circle", { cx: sx(30), cy: sy(end), r: 6, fill: col }, gl);
      const dy = i === 1 ? -22 : i === 2 ? 22 : 0;
      F.text(gl, sx(30) + 16, sy(end) + 2 + dy, name, { size: 18, fill: C.text });
      F.text(gl, sx(30) + 16, sy(end) + 26 + dy, F.num(end) + " €", { size: 22, fill: C.heading, font: Deck.MONO, weight: 600 });
      tl.to(gl, { opacity: 1, duration: 0.4 }, 2.8 + i * 0.15);
    });
    const loss = F.el("g", { opacity: 0 }, svg);
    F.path(loss, `M${sx(30) - 14} ${sy(ends[0])} V${sy(ends[2])}`, { stroke: C.warm, w: 2, dash: "4 4" });
    F.text(loss, sx(30) - 24, sy(ends[2]) + 120, "−" + F.num(ends[0] - ends[2]) + " € (−40 %)", { size: 22, anchor: "end", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    tl.to(loss, { opacity: 1, duration: 0.5 }, 3.5);
    const start = F.text(svg, x0 + 20, 40, "10.000 € iniciales al 7 % anual bruto", { size: 17, fill: C.muted, font: Deck.MONO });
    F.fade(tl, start, 0.3);
    return { tl };
  };

  // Buffett's bet: S&P 500 vs five funds of hedge funds (cumulative 2008-2017).
  A["buffett"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 735,
      H = 500;
    const svg = F.stage(slide, "#bu-stage", W, H);
    const d = [
      ["Fondo indexado S&P 500", 125.8, C.markA],
      ["Fondo de hedge funds C", 87.7, "#a9a097"],
      ["Fondo de hedge funds B", 42.3, "#a9a097"],
      ["Fondo de hedge funds E", 27.0, "#a9a097"],
      ["Fondo de hedge funds A", 21.7, "#a9a097"],
      ["Fondo de hedge funds D", 2.8, "#a9a097"],
    ];
    F.text(svg, 0, 24, "Rentabilidad acumulada 2008-2017", { size: 18, fill: C.muted, font: Deck.MONO });
    const x0 = 250,
      x1 = W - 90;
    const sx = F.scale(0, 130, x0, x1);
    d.forEach(([name, v, col], i) => {
      const y = 50 + i * 72;
      F.text(svg, x0 - 14, y + 38, name, { size: i === 0 ? 19 : 17, anchor: "end", fill: i === 0 ? C.heading : C.text2, weight: i === 0 ? 700 : 400 });
      const r = F.rect(svg, x0, y + 14, sx(v) - x0, 40, { fill: col });
      const t = F.text(svg, sx(v) + 10, y + 42, "+" + F.num(v, 1) + " %", { size: 20, fill: C.heading, font: Deck.MONO, weight: 600 });
      F.growH(tl, r, 0.3 + (i === 0 ? 1.4 : (i - 1) * 0.2), i === 0 ? 1.4 : 0.8);
      F.fade(tl, t, 0.9 + (i === 0 ? 1.8 : (i - 1) * 0.2));
    });
    return { tl };
  };

  A["rentab"] = Deck.simple(["#rt-tbl tr", ".callout"], { stagger: 0.12 });

  // MSCI World annual returns 1970-2025.
  A["anual"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 540;
    const svg = F.stage(slide, "#an2-stage", W, H);
    const x0 = 70,
      x1 = W - 10;
    const sy = F.scale(-45, 50, H - 40, 20);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [-40, -20, 0, 20, 40], x0, x1, { fmt: (v) => v + " %" });
    const n = F.msciWorld.length;
    const bw = (x1 - x0) / n;
    F.fade(tl, g, 0, { dur: 0.3 });
    F.msciWorld.forEach((v, i) => {
      const x = x0 + i * bw + 2;
      const yr = 1970 + i;
      const r = F.rect(svg, x, v >= 0 ? sy(v) : sy(0), bw - 4, Math.abs(sy(v) - sy(0)), { fill: v >= 0 ? C.markA : C.markB, rx: 2 });
      F.growV(tl, r, 0.3 + i * 0.045, 0.35, sy(0));
      if (yr % 5 === 0) F.text(svg, x + bw / 2 - 2, H - 12, String(yr), { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO });
    });
    const note = (yr, v, txt, dy) => {
      const i = yr - 1970;
      const x = x0 + i * bw + bw / 2;
      const t = F.text(svg, x, sy(v) + dy, txt, { size: 17, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
      F.fade(tl, t, 0.6 + i * 0.045);
    };
    note(1974, -24.48, "−24 %", 22);
    note(1986, 42.8, "+43 %", -10);
    note(2002, -19.54, "−20 %", 22);
    note(2008, -40.33, "−40 %", 22);
    note(2022, -17.73, "−18 %", 22);
    const pos = F.el("g", { opacity: 0 }, svg);
    F.text(pos, x0 + 20, 46, "42 años positivos", { size: 22, fill: C.accent, font: Deck.DISPLAY, weight: 700 });
    F.text(pos, x0 + 20, H - 60, "14 años negativos", { size: 22, fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    tl.to(pos, { opacity: 1, duration: 0.5 }, 3.0);
    return { tl };
  };

  // Compound interest: start at 25 vs 35, 200 €/month at 6 %.
  A["compuesto"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 540;
    const svg = F.stage(slide, "#cp-stage", W, H);
    const x0 = 120,
      x1 = W - 330;
    const sx = F.scale(25, 65, x0, x1);
    const sy = F.scale(0, 400000, H - 40, 20);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [0, 100000, 200000, 300000, 400000], x0, x1, { fmt: (v) => F.num(v) + " €" });
    [25, 35, 45, 55, 65].forEach((a) => F.text(g, sx(a), H - 12, a + " años", { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO }));
    F.fade(tl, g, 0, { dur: 0.3 });
    const curve = (start, col, label, at) => {
      const pts = [],
        contrib = [];
      for (let a = start; a <= 65; a += 0.5) {
        const m = (a - start) * 12;
        pts.push([sx(a), sy(F.fvMonthly(200, 0.06, m))]);
        contrib.push([sx(a), sy(200 * m)]);
      }
      const area = F.path(svg, F.poly(contrib) + ` L${sx(65)} ${sy(0)} L${sx(start)} ${sy(0)} Z`, { fill: col, stroke: "none", opacity: 0 });
      const p = F.path(svg, F.poly(pts), { stroke: col, w: 4 });
      Deck.draw(tl, p, at, 2.2);
      tl.to(area, { opacity: 0.16, duration: 0.6 }, at + 0.8);
      const end = F.fvMonthly(200, 0.06, (65 - start) * 12);
      const gl = F.el("g", { opacity: 0 }, svg);
      F.el("circle", { cx: sx(65), cy: sy(end), r: 7, fill: col }, gl);
      F.text(gl, sx(65) + 18, sy(end) - 6, label, { size: 19, fill: C.text });
      const val = F.text(gl, sx(65) + 18, sy(end) + 24, "0 €", { size: 28, fill: C.heading, font: Deck.MONO, weight: 600 });
      F.text(gl, sx(65) + 18, sy(end) + 50, "aportado: " + F.num(200 * (65 - start) * 12) + " €", { size: 16, fill: C.muted, font: Deck.MONO });
      tl.to(gl, { opacity: 1, duration: 0.3 }, at + 2.0);
      F.count(tl, val, 0, end, at + 2.0, { dur: 0.9, fmt: (v) => F.num(Math.round(v / 100) * 100) + " €" });
    };
    curve(25, C.markA, "Empiezas a los 25", 0.4);
    curve(35, C.markB, "Empiezas a los 35", 0.8);
    const lg = F.text(svg, x0 + 20, 50, "Zona sombreada = lo que has puesto tú. El resto lo pone el interés compuesto.", { size: 19, fill: C.muted, style: "italic" });
    F.fade(tl, lg, 3.4);
    return { tl };
  };

  // Time and risk: % of losing windows and the range of annualised returns.
  A["tiempo"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 540;
    const svg = F.stage(slide, "#ti-stage", W, H);
    const d = [
      ["1 año", 25.0, -40.3, 42.8],
      ["3 años", 16.7, -16.4, 33.2],
      ["5 años", 11.5, -2.0, 28.0],
      ["10 años", 2.1, -0.2, 19.9],
      ["15 años", 0, 3.6, 18.8],
      ["20 años", 0, 4.9, 15.9],
    ];
    // Left: % of windows with loss
    const lx0 = 150,
      lx1 = 640;
    const sxl = F.scale(0, 30, lx0, lx1);
    // Right: range worst..best annualised
    const rx0 = 790,
      rx1 = W - 30;
    const sxr = F.scale(-45, 45, rx0, rx1);
    F.text(svg, lx0, 26, "% de periodos en los que perdías dinero", { size: 19, fill: C.heading, weight: 600 });
    F.text(svg, rx0, 26, "Peor y mejor rentabilidad anual media del periodo", { size: 19, fill: C.heading, weight: 600 });
    const g = F.el("g", {}, svg);
    [-40, -20, 0, 20, 40].forEach((t) => {
      F.line(g, sxr(t), 46, sxr(t), H - 36, { stroke: t === 0 ? C.text : C.line, w: t === 0 ? 1.6 : 1, dash: t === 0 ? null : "3 5" });
      F.text(g, sxr(t), H - 12, (t > 0 ? "+" : "") + t + " %", { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO });
    });
    F.fade(tl, g, 0, { dur: 0.3 });
    const rowH = 76,
      y0 = 56;
    d.forEach(([lbl, pct, lo, hi], i) => {
      const y = y0 + i * rowH;
      F.text(svg, lx0 - 16, y + 38, lbl, { size: 22, anchor: "end", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      const r = F.rect(svg, lx0, y + 14, Math.max(2, sxl(pct) - lx0), 38, { fill: pct > 0 ? C.markB : C.accent2 });
      const t = F.text(svg, sxl(pct) + 12, y + 42, pct === 0 ? "0 % · nunca" : F.num(pct, 1) + " %", { size: 20, fill: C.heading, font: Deck.MONO, weight: 600 });
      F.growH(tl, r, 0.3 + i * 0.3, 0.6);
      F.fade(tl, t, 0.6 + i * 0.3);
      const neg = lo < 0 ? F.rect(svg, sxr(lo), y + 18, sxr(Math.min(0, hi)) - sxr(lo), 30, { fill: C.markB, rx: 2 }) : null;
      const pos = F.rect(svg, sxr(Math.max(0, lo)), y + 18, sxr(hi) - sxr(Math.max(0, lo)), 30, { fill: C.markA, rx: 2 });
      const tlo = F.text(svg, sxr(Math.min(lo, 0)) - 8, y + 40, (lo > 0 ? "+" : "") + F.num(lo, 1), { size: 15, anchor: "end", fill: C.text2, font: Deck.MONO });
      const thi = F.text(svg, sxr(hi) + 8, y + 40, "+" + F.num(hi, 1), { size: 15, fill: C.text2, font: Deck.MONO });
      if (neg) F.growH(tl, neg, 0.4 + i * 0.3, 0.6, true);
      F.growH(tl, pos, 0.4 + i * 0.3, 0.6);
      F.fade(tl, [tlo, thi], 0.8 + i * 0.3);
    });
    return { tl };
  };

  // Big crashes, one panel per step: drop and months to recover (common x-scale).
  A["caidas"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#cd-stage", W, H);
    const crashes = [
      ["Puntocom", "2000-2002 · S&P 500", 49, 31, 86, "≈ 7 años"],
      ["Crisis financiera", "2007-2009 · MSCI World", 57.5, 17, 66, "≈ 5,5 años"],
      ["COVID", "2020 · S&P 500", 34, 1, 6, "≈ 6 meses"],
      ["Inflación y tipos", "2022 · S&P 500", 25.4, 9, 24, "≈ 2 años"],
    ];
    const pw = 330,
      gap = 34;
    const sy = F.scale(-72, 10, H - 40, 90);
    const panels = crashes.map(([name, sub, drop, tDown, tRec, recTxt], i) => {
      const px = i * (pw + gap) + 4;
      const sx = F.scale(0, 90, px + 10, px + pw - 10);
      const g = F.el("g", {}, svg);
      F.rect(g, px, 0, pw, H, { fill: "rgba(255,255,255,0.35)", stroke: C.line, sw: 1, rx: 4 });
      F.text(g, px + 18, 36, name, { size: 24, fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      F.text(g, px + 18, 62, sub, { size: 15, fill: C.muted, font: Deck.MONO });
      F.line(g, px + 10, sy(0), px + pw - 10, sy(0), { stroke: C.text, w: 1.4, dash: "5 5" });
      F.text(g, px + pw - 14, sy(0) - 8, "máximo previo", { size: 13, anchor: "end", fill: C.muted, font: Deck.MONO });
      // Smooth dip: 0 → -drop at tDown → 0 at tRec → a bit higher after
      const a = sx(0),
        b = sx(tDown),
        c = sx(tRec),
        e = Math.min(sx(tRec + 6), px + pw - 12);
      const d = `M${a} ${sy(0)} C ${a + (b - a) * 0.5} ${sy(-drop * 0.2)}, ${b - (b - a) * 0.3} ${sy(-drop)}, ${b} ${sy(-drop)} C ${b + (c - b) * 0.4} ${sy(-drop)}, ${c - (c - b) * 0.3} ${sy(0)}, ${c} ${sy(0)} L ${e} ${sy(4)}`;
      const p = F.path(g, d, { stroke: C.markB, w: 3.5 });
      const near = b - px < 70;
      const lbl = F.text(g, near ? px + 22 : b, sy(-drop) + 36, "−" + F.num(drop, drop % 1 ? 1 : 0) + " %", { size: 28, anchor: near ? "start" : "middle", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
      const rec = F.text(g, px + 18, H - 20, "Recuperación: " + recTxt, { size: 18, fill: C.accent, weight: 600 });
      return { g, p, lbl, rec };
    });
    const cap = Deck.captions(tl, slide.querySelector("#cd-cap"), [
      "2000: estalla la burbuja de internet. Tres años seguidos de caídas y siete hasta recuperar el máximo.",
      "2008: la peor caída desde los años 30. Quien vendió en marzo de 2009 se perdió una de las mayores subidas de la historia.",
      "2020: un −34 % en 33 días… y recuperado en unos seis meses. Nadie lo vio venir, nadie lo vio irse.",
      "2022: bajan acciones y bonos a la vez. Dos años de paciencia. En todos los casos, el que aguantó (y siguió aportando) salió ganando.",
    ]);
    panels.forEach((pn) => F.hide([pn.g]));
    panels.forEach((pn, i) => {
      const at = i === 0 ? 0.2 : `s${i - 1}`;
      tl.to(pn.g, { opacity: 1, duration: 0.3 }, at);
      Deck.draw(tl, pn.p, i === 0 ? 0.4 : `s${i - 1}+=0.2`, 1.4);
      tl.fromTo(pn.lbl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, i === 0 ? 0.9 : `s${i - 1}+=0.7`);
      tl.fromTo(pn.rec, { opacity: 0 }, { opacity: 1, duration: 0.3 }, i === 0 ? 1.6 : `s${i - 1}+=1.4`);
      cap(i, at);
      tl.addLabel(`s${i}`);
    });
    return { tl };
  };
})();
