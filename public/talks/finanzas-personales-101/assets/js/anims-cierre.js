/* Section 08 (taxes and psychology) and closing slides. */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  // Savings-base IRPF brackets as a staircase; a 10.000 € gain filled bracket by bracket.
  A["irpf"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#ir-stage", W, H);
    const x0 = 120,
      x1 = W - 120;
    const sx = F.scale(0, 60000, x0, x1);
    const sy = F.scale(0, 30, 290, 40);
    const g = F.el("g", {}, svg);
    const br = [
      [0, 6000, 19],
      [6000, 50000, 21],
      [50000, 60000, 23],
    ];
    br.forEach(([a, b, r]) => {
      F.rect(g, sx(a) + 1, sy(r), sx(b) - sx(a) - 2, sy(0) - sy(r), { fill: "rgba(153,15,61,0.14)", stroke: C.warm, sw: 1.5, rx: 0 });
      F.text(g, (sx(a) + sx(b)) / 2, sy(r) - 12, r + " %", { size: 24, anchor: "middle", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    });
    F.text(g, x1 + 10, sy(23) + 30, "… 27 % y 30 %", { size: 16, fill: C.muted, font: Deck.MONO });
    F.text(g, x1 + 10, sy(23) + 52, "a partir de 200.000 €", { size: 16, fill: C.muted, font: Deck.MONO });
    F.line(g, x0, sy(0), x1, sy(0), { stroke: C.text, w: 1.5 });
    [0, 6000, 20000, 30000, 40000, 50000, 60000].forEach((t) => F.text(g, sx(t), sy(0) + 26, F.num(t) + (t ? " €" : ""), { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO }));
    F.text(g, x0, 20, "Ganancia al vender (en un año)", { size: 17, fill: C.muted, font: Deck.MONO });

    const f1 = F.rect(svg, sx(0) + 1, sy(19), sx(6000) - sx(0) - 2, sy(0) - sy(19), { fill: C.warm, rx: 0 });
    const f2 = F.rect(svg, sx(6000) + 1, sy(21), sx(10000) - sx(6000) - 2, sy(0) - sy(21), { fill: C.warm, rx: 0 });
    const t1 = F.text(svg, sx(3000), sy(19) + 60, "1.140 €", { size: 18, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 });
    const t2 = F.text(svg, sx(8000), sy(21) + 60, "840 €", { size: 18, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 });
    const tot = F.el("g", {}, svg);
    F.text(tot, sx(10000) + 30, sy(21) + 70, "10.000 € de ganancia →", { size: 22, fill: C.text });
    const totV = F.text(tot, sx(10000) + 30, sy(21) + 110, "1.980 € de impuestos (19,8 %)", { size: 30, fill: C.warm, font: Deck.DISPLAY, weight: 700 });

    // Sale breakdown bar
    const sale = F.el("g", {}, svg);
    const by = 370;
    F.text(sale, x0, by - 12, "Vendes por 30.000 €:", { size: 18, fill: C.text, weight: 600 });
    F.rect(sale, sx(0), by, sx(20000) - sx(0) - 2, 50, { fill: "#b8aca2" });
    F.text(sale, (sx(0) + sx(20000)) / 2, by + 32, "20.000 € que pusiste: no tributan", { size: 18, anchor: "middle", fill: "#fffaf5", weight: 600 });
    F.rect(sale, sx(20000), by, sx(30000) - sx(20000), 50, { fill: C.warm });
    F.text(sale, (sx(20000) + sx(30000)) / 2, by + 32, "10.000 € ganancia", { size: 18, anchor: "middle", fill: "#fffaf5", weight: 600 });

    const cap = Deck.captions(tl, slide.querySelector("#ir-cap"), [
      "Las ganancias de inversiones van a la «base del ahorro», con tramos: cada tramo paga solo por la parte que cae dentro de él.",
      "Ganas 10.000 €: los primeros 6.000 € pagan un 19 % y los 4.000 € siguientes un 21 %. Total: 1.980 €, un 19,8 % efectivo.",
      "Y solo pagas por la ganancia, y solo cuando vendes. Mientras no vendas, Hacienda espera… y tu dinero sigue trabajando entero.",
    ]);
    F.hide([f1, f2, t1, t2, tot, sale]);
    F.fade(tl, g, 0.1);
    cap(0, 0.2);
    tl.addLabel("s0");
    tl.to(f1, { opacity: 1, duration: 0.01 }, "s0");
    F.growV(tl, f1, "s0", 0.5, sy(0));
    tl.to(t1, { opacity: 1, duration: 0.3 }, "s0+=0.4");
    tl.to(f2, { opacity: 1, duration: 0.01 }, "s0+=0.6");
    F.growV(tl, f2, "s0+=0.6", 0.5, sy(0));
    tl.to(t2, { opacity: 1, duration: 0.3 }, "s0+=1.0");
    tl.to(tot, { opacity: 1, duration: 0.4 }, "s0+=1.3");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to(sale, { opacity: 1, duration: 0.5 }, "s1");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Fund switch (traspaso) vs ETF sale, and the effect after 20 years.
  A["traspaso"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#tr-stage", W, H);
    const lane = (y, title, col) => {
      F.text(svg, 0, y - 60, title, { size: 22, fill: col, font: Deck.DISPLAY, weight: 700 });
      F.line(svg, 0, y + 45, W, y + 45, { stroke: C.line });
    };
    lane(80, "Con un ETF", C.warm);
    lane(320, "Con un fondo de inversión", C.accent);
    const box = (x, y, w, txt, sub, col) => {
      const g = F.el("g", {}, svg);
      F.rect(g, x, y - 35, w, 70, { fill: "#fffaf5", stroke: col, sw: 2.5, rx: 6 });
      const t = F.text(g, x + w / 2, y + 2, txt, { size: 26, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
      F.text(g, x + w / 2, y + 26, sub, { size: 14, anchor: "middle", fill: C.muted, font: Deck.MONO });
      return { g, t };
    };
    const arrow = (x1, y, x2, lbl, col) => {
      const g = F.el("g", {}, svg);
      F.path(g, `M${x1} ${y} L${x2} ${y} M${x2 - 10} ${y - 9} L${x2} ${y} L${x2 - 10} ${y + 9}`, { stroke: col, w: 2.5 });
      F.text(g, (x1 + x2) / 2, y - 12, lbl, { size: 16, anchor: "middle", fill: col, font: Deck.MONO, weight: 600 });
      return g;
    };
    // Stage 0: both grew to 20.000
    const a0 = box(0, 80, 230, "20.000 €", "invertiste 10.000 €", C.lineStrong);
    const b0 = box(0, 320, 230, "20.000 €", "invertiste 10.000 €", C.lineStrong);
    // Stage 1: switch product
    const aArr = arrow(240, 80, 420, "vendes", C.warm);
    const tax = box(430, 80, 200, "−1.980 €", "a Hacienda", C.warm);
    const aArr2 = arrow(640, 80, 760, "compras", C.warm);
    const a1 = box(770, 80, 230, "18.020 €", "nuevo ETF", C.warm);
    const bArr = arrow(240, 320, 760, "traspaso: sin pasar por Hacienda", C.accent);
    const b1 = box(770, 320, 230, "20.000 €", "nuevo fondo", C.accent);
    // Stage 2: 20 years at 7 %
    const aArr3 = arrow(1010, 80, 1130, "20 años", C.warm);
    const a2 = box(1140, 80, 270, "0 €", "al 7 % anual", C.warm);
    const bArr3 = arrow(1010, 320, 1130, "20 años", C.accent);
    const b2 = box(1140, 320, 270, "0 €", "al 7 % anual", C.accent);
    const diff = F.text(svg, 1275, 220, "+7.660 € para el fondo", { size: 26, anchor: "middle", fill: C.accent, font: Deck.DISPLAY, weight: 700 });

    const cap = Deck.captions(tl, slide.querySelector("#tr-cap"), [
      "Dos inversores invierten 10.000 € y ambos llegan a 20.000 €. Los dos quieren cambiar de producto.",
      "El del ETF tiene que vender: paga 1.980 € y reinvierte 18.020 €. El del fondo hace un traspaso: los 20.000 € pasan enteros al nuevo fondo.",
      "Veinte años después, al 7 %, esos 1.980 € que siguieron trabajando valen unos 7.660 € más (antes del impuesto final, que ambos pagarán al vender).",
    ]);
    const s1 = [aArr, tax.g, aArr2, a1.g, bArr, b1.g];
    const s2 = [aArr3, a2.g, bArr3, b2.g, diff];
    F.hide([...s1, ...s2]);
    F.pop(tl, [a0.g, b0.g], 0.2, { stagger: 0.2 });
    cap(0, 0.2);
    tl.addLabel("s0");
    tl.to([aArr, tax.g, aArr2, a1.g], { opacity: 1, duration: 0.35, stagger: 0.3 }, "s0");
    tl.to([bArr, b1.g], { opacity: 1, duration: 0.35, stagger: 0.3 }, "s0+=0.3");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to([aArr3, a2.g, bArr3, b2.g], { opacity: 1, duration: 0.35, stagger: 0.15 }, "s1");
    const f = Math.pow(1.07, 20);
    F.count(tl, a2.t, 18020, 18020 * f, "s1+=0.4", { dur: 1.2, fmt: (v) => F.num(Math.round(v / 10) * 10) + " €" });
    F.count(tl, b2.t, 20000, 20000 * f, "s1+=0.4", { dur: 1.2, fmt: (v) => F.num(Math.round(v / 10) * 10) + " €" });
    tl.to(diff, { opacity: 1, duration: 0.4 }, "s1+=1.6");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Behaviour gap and the cost of missing the best days.
  A["brecha"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 682,
      H = 470;
    const s1 = F.stage(slide, "#br-stage-1", W, H);
    const sy = F.scale(0, 12, H - 60, 50);
    const g1 = F.el("g", {}, s1);
    F.yAxis(g1, sy, [0, 4, 8, 12], 60, W - 10, { fmt: (v) => v + " %" });
    F.fade(tl, g1, 0, { dur: 0.3 });
    const bars = [
      ["Los fondos", 9.9, C.markA, 170],
      ["Sus inversores", 8.7, C.markB, 440],
    ];
    bars.forEach(([n, v, col, x]) => {
      const r = F.rect(s1, x, sy(v), 150, sy(0) - sy(v), { fill: col });
      const t = F.text(s1, x + 75, sy(v) - 12, F.num(v, 1) + " %", { size: 26, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
      F.text(s1, x + 75, H - 30, n, { size: 20, anchor: "middle", fill: C.text });
      F.growV(tl, r, 0.3, 0.8, sy(0));
      F.fade(tl, t, 0.8);
    });
    const gap = F.el("g", {}, s1);
    F.path(gap, `M330 ${sy(9.9)} H620 M610 ${sy(9.9)} V${sy(8.7)}`, { stroke: C.warm, w: 2, dash: "4 4" });
    F.text(gap, 615, sy(9.9) - 16, "−1,2 puntos al año", { size: 20, anchor: "end", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    F.text(s1, 60, 24, "Rentabilidad anual, 10 años", { size: 16, fill: C.muted, font: Deck.MONO });
    F.fade(tl, gap, 1.3);

    const s2 = F.stage(slide, "#br-stage-2", W, H);
    const d = [
      ["Invertido siempre", 10.5, C.markA],
      ["Sin los 10 mejores días", 6.2, C.markB],
      ["Sin los 20 mejores", 3.6, C.markB],
      ["Sin los 30 mejores", 1.4, C.markB],
    ];
    const x0 = 250;
    const sx = F.scale(0, 12, x0, W - 70);
    F.text(s2, 0, 24, "S&P 500, rentabilidad anual, 2004-2024", { size: 16, fill: C.muted, font: Deck.MONO });
    d.forEach(([n, v, col], i) => {
      const y = 60 + i * 96;
      F.text(s2, x0 - 14, y + 42, n, { size: 18, anchor: "end", fill: C.text });
      const r = F.rect(s2, x0, y + 16, sx(v) - x0, 46, { fill: col, opacity: i ? 1 - i * 0.12 : 1 });
      const t = F.text(s2, sx(v) + 10, y + 48, F.num(v, 1) + " %", { size: 22, fill: C.heading, font: Deck.MONO, weight: 600 });
      F.growH(tl, r, 1.4 + i * 0.3, 0.7);
      F.fade(tl, t, 1.8 + i * 0.3);
    });
    return { tl };
  };

  A["sesgos"] = Deck.simple([".card"], { stagger: 0.12 });
  A["plan"] = Deck.simple([".s5", ".callout"], { stagger: 0.18 });
  A["libros"] = Deck.simple([".col-lib"], { stagger: 0.2 });
  A["takeaways"] = Deck.simple([".takeaways .item"], { stagger: 0.3 });
  A["fuentes"] = Deck.simple([".fuentes li"], { stagger: 0.05 });
})();
