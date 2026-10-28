/* Sections 03 (assets) and 04 (before investing). */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  A["activos"] = Deck.simple([".card", ".callout"], { stagger: 0.15 });

  // 1 $ in 1900 → real value in 2025 (UBS/DMS), log-scale horizontal bars from the 1 $ line.
  A["siglo"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 520;
    const svg = F.stage(slide, "#sg-stage", W, H);
    const d = [
      ["Acciones", 3296, "6,6 % real/año", C.markA],
      ["Bonos", 7.5, "1,6 % real/año", C.markC],
      ["Oro", 5.2, "1,3 % real/año", C.markD],
      ["Letras (cuenta)", 1.8, "0,5 % real/año", "#8a7f77"],
      ["Billete en el cajón", 1 / 38, "−2,9 % real/año", C.markB],
    ];
    const xl = 300,
      xr = W - 170;
    const sx = F.logScale(0.01, 10000, xl, xr);
    const g = F.el("g", {}, svg);
    [0.01, 0.1, 1, 10, 100, 1000, 10000].forEach((t) => {
      F.line(g, sx(t), 20, sx(t), H - 50, { stroke: t === 1 ? C.text : C.line, w: t === 1 ? 2 : 1, dash: t === 1 ? null : "3 5" });
      F.text(g, sx(t), H - 22, t < 1 ? F.num(t, 2) + " $" : F.num(t) + " $", { size: 15, anchor: "middle", fill: t === 1 ? C.heading : C.muted, font: Deck.MONO });
    });
    F.text(g, sx(1) + 8, 34, "← pierde · 1 $ de 1900 · gana →", { size: 15, fill: C.heading, font: Deck.MONO, anchor: "middle" });
    F.fade(tl, g, 0, { dur: 0.3 });
    const rowH = 80,
      y0 = 60;
    d.forEach(([name, v, rate, col], i) => {
      const y = y0 + i * rowH;
      F.text(svg, xl - 20, y + 26, name, { size: 23, anchor: "end", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      F.text(svg, xl - 20, y + 50, rate, { size: 15, anchor: "end", fill: C.muted, font: Deck.MONO });
      const a = Math.min(sx(1), sx(v)),
        b = Math.max(sx(1), sx(v));
      const r = F.rect(svg, a, y + 6, b - a, 44, { fill: col, rx: 3 });
      const lbl = v >= 1 ? F.num(v, v < 10 ? 1 : 0) + " $" : F.num(v, 3) + " $";
      const t = F.text(svg, b + 12, y + 36, lbl, { size: 24, anchor: "start", fill: C.heading, font: Deck.MONO, weight: 600 });
      F.growH(tl, r, 0.3 + i * 0.35, 1.0, v < 1);
      F.fade(tl, t, 0.9 + i * 0.35);
    });
    return { tl };
  };

  // How inflation flows through a company vs through cash.
  A["empresas"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 430;
    const svg = F.stage(slide, "#em-stage", W, H);
    const node = (x, y, w, title, val, col) => {
      const g = F.el("g", {}, svg);
      F.rect(g, x, y, w, 110, { fill: "#fffaf5", stroke: col, sw: 2.5, rx: 8 });
      F.text(g, x + w / 2, y + 40, title, { size: 21, anchor: "middle", fill: C.heading, weight: 600 });
      F.text(g, x + w / 2, y + 82, val, { size: 26, anchor: "middle", fill: col, font: Deck.MONO, weight: 600 });
      return g;
    };
    const top = [
      node(10, 20, 250, "Inflación", "+5 %", C.warm),
      node(300, 20, 250, "Sube el precio", "10 € → 10,50 €", C.accent),
      node(590, 20, 250, "Suben las ventas", "+5 % en €", C.accent),
      node(880, 20, 250, "Sube el beneficio", "+5 % en €", C.accent),
      node(1170, 20, 244, "Dividendos y valor", "crecen", C.accent2),
    ];
    const arrows = [0, 1, 2, 3].map((i) => {
      const x = 260 + i * 290;
      return F.path(svg, `M${x + 4} 75 L${x + 36} 75 M${x + 26} 66 L${x + 36} 75 L${x + 26} 84`, { stroke: C.text, w: 2.5 });
    });
    const lbl1 = F.text(svg, 10, 175, "UNA EMPRESA", { size: 15, fill: C.muted, font: Deck.MONO, spacing: 3 });
    const lbl2 = F.text(svg, 10, 260, "TU EFECTIVO", { size: 15, fill: C.muted, font: Deck.MONO, spacing: 3 });
    const cash = [node(10, 280, 250, "Inflación", "+5 %", C.warm), node(300, 280, 380, "Tus 1.000 € siguen siendo", "1.000 €", C.text), node(720, 280, 400, "Pero compran como", "952 € de antes", C.warm)];
    const carr = [0, 1].map((i) => {
      const x = i === 0 ? 260 : 680;
      return F.path(svg, `M${x + 4} 335 L${x + 36} 335 M${x + 26} 326 L${x + 36} 335 L${x + 26} 344`, { stroke: C.text, w: 2.5 });
    });
    F.fade(tl, lbl1, 0);
    top.forEach((n, i) => {
      F.pop(tl, n, 0.2 + i * 0.45);
      if (arrows[i]) F.fade(tl, arrows[i], 0.45 + i * 0.45);
    });
    F.fade(tl, lbl2, 2.6);
    cash.forEach((n, i) => {
      F.pop(tl, n, 2.8 + i * 0.45);
      if (carr[i]) F.fade(tl, carr[i], 3.05 + i * 0.45);
    });
    F.pop(tl, slide.querySelector(".callout"), 4.4);
    return { tl };
  };

  // Pyramid of financial priorities, one layer per step.
  A["piramide"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 740,
      H = 560;
    const svg = F.stage(slide, "#pi-stage", W, H);
    const layers = [
      ["1 · Colchón de emergencia", C.accent2],
      ["2 · Fuera deudas caras", C.warm],
      ["3 · Ahorro automático", C.gold],
      ["4 · Invertir", C.accent],
    ];
    const base = 520,
      lh = 115,
      cx = W / 2;
    const polys = layers.map(([name, col], i) => {
      const y1 = base - i * lh,
        y0 = y1 - lh + 8;
      const half = (y) => 340 * ((y - 20) / (base - 20)) + 30;
      const g = F.el("g", {}, svg);
      F.path(g, `M${cx - half(y1)} ${y1} L${cx + half(y1)} ${y1} L${cx + half(y0)} ${y0} L${cx - half(y0)} ${y0} Z`, { fill: col, stroke: "none" });
      F.text(g, cx, (y0 + y1) / 2 + 9, name, { size: i === 3 ? 22 : 24, anchor: "middle", fill: "#fffaf5", weight: 700 });
      return g;
    });
    const cap = Deck.captions(tl, slide.querySelector("#pi-cap"), [
      '<span class="k">Escalón 1</span>Colchón: 3–6 meses de gastos esenciales en una cuenta remunerada o un depósito.<small>Es lo que te evita vender tus inversiones en el peor momento cuando se rompe la lavadora o te quedas sin trabajo.</small>',
      '<span class="k">Escalón 2</span>Liquida las deudas caras antes de invertir.<small>Una tarjeta revolving puede cobrar un 22–24 % TAE. Quitar una deuda al 6 % equivale a ganar un 6 % sin riesgo (Pizarra de Andrés).</small>',
      '<span class="k">Escalón 3</span>Págate primero: transferencia automática el día que cobras.<small>Referencia clásica 50/30/20: necesidades, caprichos y ahorro. Javi Linares propone ahorrar al menos un 15 %.</small>',
      '<span class="k">Escalón 4</span>Ahora sí: invertir el dinero que no vas a necesitar en años.<small>Con un plan, aportaciones periódicas y sin mirar la cartera cada día.</small>',
    ]);
    F.hide(polys);
    polys.forEach((p, i) => {
      const at = i === 0 ? 0.2 : `s${i - 1}`;
      tl.fromTo(p, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.5, ease: "bounce.out" }, at);
      cap(i, at);
      tl.addLabel(`s${i}`);
    });
    return { tl };
  };

  // Household savings: counter + donut of financial assets.
  A["hogares"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 682,
      H = 520;
    const svg = F.stage(slide, "#ho-stage", W, H);
    const cx = 260,
      cy = 260,
      r = 170,
      sw = 70;
    const segs = [
      ["Efectivo y depósitos", 33, C.markB],
      ["Fondos de inversión", 17, C.markA],
      ["Resto: acciones, seguros, pensiones…", 50, "#b8aca2"],
    ];
    const circ = 2 * Math.PI * r;
    let acc = 0;
    segs.forEach(([name, v, col], i) => {
      const len = (v / 100) * circ;
      const c = F.el(
        "circle",
        { cx, cy, r, fill: "none", stroke: col, "stroke-width": sw, "stroke-dasharray": `0 ${circ}`, transform: `rotate(${-90 + (acc / 100) * 360} ${cx} ${cy})` },
        svg,
      );
      tl.to(c, { attr: { "stroke-dasharray": `${Math.max(0, len - 3)} ${circ}` }, duration: 0.8, ease: "power2.out" }, 0.3 + i * 0.5);
      const mid = ((acc + v / 2) / 100) * 2 * Math.PI - Math.PI / 2;
      const lx = cx + Math.cos(mid) * r,
        ly = cy + Math.sin(mid) * r;
      const t = F.text(svg, lx, ly + 8, v + " %", { size: 24, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 });
      F.fade(tl, t, 0.8 + i * 0.5);
      acc += v;
    });
    const leg = F.el("g", {}, svg);
    segs.forEach(([name, v, col], i) => {
      F.rect(leg, 470, 170 + i * 50, 18, 18, { fill: col, rx: 3 });
      const words = name.split(": ");
      F.text(leg, 498, 185 + i * 50, words[0], { size: 18, fill: C.text });
      if (words[1]) F.text(leg, 498, 207 + i * 50, words[1], { size: 15, fill: C.muted });
    });
    F.text(svg, cx, cy - 6, "Ahorro", { size: 20, anchor: "middle", fill: C.muted });
    F.text(svg, cx, cy + 22, "financiero", { size: 20, anchor: "middle", fill: C.muted });
    F.text(svg, cx, cy + 50, "de los hogares", { size: 20, anchor: "middle", fill: C.muted });
    F.fade(tl, leg, 1.6);
    F.count(tl, slide.querySelector("#ho-num"), 0, 18.7, 0.2, { dec: 1, dur: 1.4 });
    return { tl };
  };

  // Horizon: allowed equity share grows with time.
  A["horizonte"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 300;
    const svg = F.stage(slide, "#hz-stage", W, H);
    const x0 = 120,
      x1 = W - 20;
    const sx = F.scale(0, 20, x0, x1);
    const sy = F.scale(0, 100, H - 40, 34);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [0, 50, 100], x0, x1, { fmt: (v) => v + " %" });
    [0, 3, 10, 20].forEach((t) => F.text(g, sx(t), H - 12, t === 20 ? "20+ años" : t + " años", { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO }));
    F.text(g, x0 - 10, 12, "% en bolsa", { size: 15, fill: C.muted, font: Deck.MONO, anchor: "end" });
    [3, 10].forEach((t) => F.line(g, sx(t), 20, sx(t), H - 40, { stroke: C.lineStrong, dash: "5 5" }));
    // Step band of equity share: <3 y: 0–20 %; 3–10 y: 30–70 %; >10 y: 70–100 %
    const band = [
      [0, 20], [3, 20], [3, 70], [10, 70], [10, 100], [20, 100],
      [20, 70], [10, 70], [10, 30], [3, 30], [3, 0], [0, 0],
    ];
    const poly = F.path(svg, F.poly(band.map(([a, b]) => [sx(a), sy(b)])) + " Z", { fill: "rgba(15,84,153,0.22)", stroke: C.accent, w: 2 });
    const clip = F.clip(svg, "hz-clip", 0, 0, x0, H);
    poly.setAttribute("clip-path", "url(#hz-clip)");
    F.fade(tl, g, 0, { dur: 0.3 });
    tl.to(clip, { attr: { width: W }, duration: 1.8, ease: "power1.inOut" }, 0.3);
    tl.from(slide.querySelectorAll(".card.hz"), { opacity: 0, y: 20, stagger: 0.4, duration: 0.5 }, 0.5);
    return { tl };
  };
})();
