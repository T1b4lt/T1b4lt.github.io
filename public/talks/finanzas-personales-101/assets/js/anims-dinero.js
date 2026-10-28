/* Section 02: from gold to fiat. */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  // Money timeline, stepped by era.
  A["timeline"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#tl-stage", W, H);
    const ay = 250;
    const nodes = [
      { x: 70, when: "Prehistoria", title: "Trueque", text: "Cambias una cabra por trigo… si el otro quiere cabra.", era: 0, up: true },
      { x: 250, when: "s. VII a. C.", title: "Primeras monedas", text: "Oro y plata acuñados (Lidia). El dinero ES el metal.", era: 0, up: false },
      { x: 430, when: "1870 – 1914", title: "Patrón oro", text: "Cada billete se puede canjear por una cantidad fija de oro.", era: 1, up: true },
      { x: 610, when: "1914 – 1944", title: "Guerras", text: "Se suspende el canje para financiar las guerras.", era: 1, up: false },
      { x: 790, when: "1944", title: "Bretton Woods", text: "El dólar, atado al oro (35 $/onza); el resto, al dólar.", era: 2, up: true },
      { x: 970, when: "15-ago-1971", title: "Nixon cierra el canje", text: "El dólar deja de ser convertible en oro.", era: 2, up: false },
      { x: 1150, when: "1999 / 2002", title: "Nace el euro", text: "Dinero fiat gestionado por el BCE.", era: 3, up: true },
      { x: 1340, when: "2008 · 2020", title: "QE", text: "Los bancos centrales crean dinero a gran escala.", era: 3, up: false },
    ];
    const eraCol = [C.gold, C.gold, C.accent2, C.accent];
    const eraBands = [
      [20, 340, "DINERO MERCANCÍA", C.gold],
      [340, 700, "PATRÓN ORO", C.gold],
      [700, 1060, "ORO VÍA DÓLAR", C.accent2],
      [1060, 1404, "DINERO FIAT", C.accent],
    ].map(([a, b, label, col]) => {
      const g = F.el("g", {}, svg);
      F.rect(g, a + 4, ay - 6, b - a - 8, 12, { fill: col, rx: 3, opacity: 0.85 });
      F.text(g, (a + b) / 2 - 20, ay + 34, label, { size: 13, anchor: "middle", fill: col, font: Deck.MONO, weight: 600, spacing: 2 });
      return g;
    });
    const groups = nodes.map((n) => {
      const g = F.el("g", {}, svg);
      const dir = n.up ? -1 : 1;
      F.line(g, n.x, ay + dir * 10, n.x, ay + dir * 46, { stroke: C.lineStrong, w: 1.5 });
      F.el("circle", { cx: n.x, cy: ay, r: 9, fill: C.bg, stroke: eraCol[n.era], "stroke-width": 4 }, g);
      const by = n.up ? ay - 150 : ay + 66;
      const anchor = n.x < 120 ? "start" : n.x > 1300 ? "end" : "middle";
      const tx = anchor === "start" ? n.x - 10 : anchor === "end" ? n.x + 10 : n.x;
      F.text(g, tx, by, n.when, { size: 15, anchor, fill: C.warm, font: Deck.MONO, weight: 600 });
      F.text(g, tx, by + 30, n.title, { size: 23, anchor, fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      // wrap text in two lines of ~26 chars
      const words = n.text.split(" ");
      const lines = [""];
      words.forEach((w) => (lines[lines.length - 1].length + w.length > 26 ? lines.push(w) : (lines[lines.length - 1] += (lines[lines.length - 1] ? " " : "") + w)));
      lines.forEach((l, i) => F.text(g, tx, by + 56 + i * 21, l, { size: 16, anchor, fill: C.text2 }));
      return g;
    });
    const axis = F.line(svg, 20, ay, W - 20, ay, { stroke: C.lineStrong, w: 2 });

    const cap = Deck.captions(tl, slide.querySelector("#tl-cap"), [
      "Durante milenios, el dinero fue una mercancía con valor propio: conchas, sal y, sobre todo, metales preciosos.",
      "Con el patrón oro, el papel era un recibo: el banco solo podía emitir billetes si tenía oro detrás. Las guerras rompieron esa disciplina.",
      "Tras la Segunda Guerra Mundial, el oro quedó solo detrás del dólar. En 1971, EE. UU. cortó también ese último hilo.",
      "Desde entonces el dinero es fiat: vale porque el Estado lo declara de curso legal y porque confiamos en él. Y se puede crear sin límite físico.",
    ]);
    F.hide([...groups, ...eraBands]);
    Deck.draw(tl, axis, 0, 0.8);
    const reveal = (eras, at) => {
      tl.to(eraBands.filter((_, i) => eras.includes(i)), { opacity: 1, duration: 0.4 }, at);
      tl.to(groups.filter((_, i) => eras.includes(nodes[i].era)), { opacity: 1, duration: 0.5, stagger: 0.3 }, at);
    };
    reveal([0], 0.5);
    cap(0, 0.5);
    tl.addLabel("s0");
    reveal([1], "s0");
    cap(1, "s0");
    tl.addLabel("s1");
    reveal([2], "s1");
    cap(2, "s1");
    tl.addLabel("s2");
    reveal([3], "s2");
    cap(3, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  // Gold anchor: note ↔ gold; Bretton Woods hub; 1971 the chain breaks.
  A["ancla"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 480;
    const svg = F.stage(slide, "#an-stage", W, H);

    const gold = F.el("g", {}, svg);
    F.path(gold, "M110 300 L150 230 L290 230 L330 300 Z", { fill: C.gold, stroke: "#9c6700", w: 2 });
    F.path(gold, "M150 230 L170 205 L270 205 L290 230", { fill: "#e6a83a", stroke: "#9c6700", w: 2 });
    F.text(gold, 220, 280, "ORO", { size: 26, anchor: "middle", fill: "#fffaf5", font: Deck.DISPLAY, weight: 900 });
    F.text(gold, 220, 345, "reservas del banco central", { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO });

    const chain = F.path(svg, "M335 260 L585 260", { stroke: C.gold, w: 6, dash: "14 8" });
    const chainLbl = F.text(svg, 460, 240, "canjeable", { size: 18, anchor: "middle", fill: C.text2, font: Deck.MONO });
    const chainL = F.path(svg, "M335 260 L455 260", { stroke: C.gold, w: 6, dash: "14 8", opacity: 0 });
    const chainR = F.path(svg, "M465 260 L585 260", { stroke: C.gold, w: 6, dash: "14 8", opacity: 0 });
    const cut = F.text(svg, 460, 300, "✕ 15-ago-1971", { size: 22, anchor: "middle", fill: C.warm, font: Deck.MONO, weight: 600, opacity: 0 });

    // The note / the dollar
    const note = F.el("g", {}, svg);
    F.rect(note, 590, 200, 220, 120, { fill: "#e9d3bd", stroke: C.accent, sw: 2.5, rx: 8 });
    const noteTxt = F.text(note, 700, 275, "Billete", { size: 34, anchor: "middle", fill: C.accent, font: Deck.DISPLAY, weight: 900 });
    const noteSub = F.text(note, 700, 350, "= recibo de oro", { size: 18, anchor: "middle", fill: C.text2, font: Deck.MONO });

    // Other currencies around the dollar
    const cur = ["Libra", "Franco", "Marco", "Lira", "Yen", "Peseta"];
    const cx = 1120;
    const curG = cur.map((c, i) => {
      const y = 60 + i * 70;
      const g = F.el("g", {}, svg);
      const link = F.path(g, `M815 260 C 920 260, 960 ${y + 22}, ${cx - 70} ${y + 22}`, { stroke: C.accent2, w: 2 });
      F.rect(g, cx - 70, y, 140, 44, { fill: "#fffaf5", stroke: C.accent2, sw: 2, rx: 6 });
      F.text(g, cx, y + 29, c, { size: 20, anchor: "middle", fill: C.heading, weight: 600 });
      g.dataset.link = "1";
      return { g, link };
    });
    const fixLbl = F.text(svg, 1300, 240, "tipo de cambio", { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO });
    const fixLbl2 = F.text(svg, 1300, 262, "fijo con el dólar", { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO });

    const cap = Deck.captions(tl, slide.querySelector("#an-cap"), [
      "Patrón oro: el banco solo emite billetes si tiene oro en la cámara. No se puede «imprimir» de más sin que se note.",
      "Bretton Woods (1944): solo el dólar se canjea por oro, a 35 $ la onza. Las demás monedas fijan su cambio con el dólar.",
      "15 de agosto de 1971: Nixon «cierra la ventanilla del oro». Se rompe el último ancla y las monedas pasan a flotar: dinero fiat.",
    ]);
    F.hide([...curG.map((c) => c.g), fixLbl, fixLbl2]);
    F.pop(tl, gold, 0.1);
    F.pop(tl, note, 0.4);
    Deck.draw(tl, chain, 0.8, 0.7);
    F.fade(tl, chainLbl, 1.2);
    cap(0, 0.6);
    tl.addLabel("s0");
    // Step 1: the note becomes "the dollar", currencies hook onto it.
    const flip = { v: 0 };
    tl.to(flip, { v: 1, duration: 0.4, onUpdate: () => ((noteTxt.textContent = flip.v > 0.5 ? "Dólar" : "Billete"), (noteSub.textContent = flip.v > 0.5 ? "35 $ = 1 onza" : "= recibo de oro")) }, "s0");
    curG.forEach((c, i) => {
      tl.to(c.g, { opacity: 1, duration: 0.4 }, `s0+=${0.2 + i * 0.12}`);
    });
    tl.to([fixLbl, fixLbl2], { opacity: 1, duration: 0.4 }, "s0+=0.8");
    cap(1, "s0");
    tl.addLabel("s1");
    // Step 2: the chain breaks, gold drifts away, currencies float.
    tl.set(chain, { opacity: 0 }, "s1");
    tl.set([chainL, chainR], { opacity: 1 }, "s1");
    tl.to(chainLbl, { opacity: 0, duration: 0.2 }, "s1");
    tl.to(chainL, { x: -40, y: 30, rotation: 12, svgOrigin: "335 260", duration: 0.7, ease: "power2.out" }, "s1+=0.1");
    tl.to(chainR, { x: 30, y: 40, rotation: -14, svgOrigin: "585 260", duration: 0.7, ease: "power2.out" }, "s1+=0.1");
    tl.to(gold, { opacity: 0.35, x: -30, duration: 0.8 }, "s1+=0.2");
    tl.to(cut, { opacity: 1, duration: 0.4 }, "s1+=0.3");
    tl.to(flip, { v: 2, duration: 0.3, onUpdate: () => (noteSub.textContent = flip.v > 1.5 ? "vale por confianza" : "35 $ = 1 onza") }, "s1+=0.3");
    const drift = [-10, 8, -6, 10, -4, 6];
    curG.forEach((c, ci) => {
      const dy = drift[ci];
      tl.to(c.g, { y: dy, duration: 0.9, ease: "sine.inOut" }, "s1+=0.4");
      tl.to(c.link, { attr: { "stroke-dasharray": "4 6" }, duration: 0.1 }, "s1+=0.4");
    });
    tl.to([fixLbl, fixLbl2], { opacity: 0, duration: 0.3 }, "s1+=0.3");
    const floatLbl = F.text(svg, 1300, 252, "cambio flotante", { size: 16, anchor: "middle", fill: C.warm, font: Deck.MONO, weight: 600, opacity: 0 });
    tl.to(floatLbl, { opacity: 1, duration: 0.4 }, "s1+=0.6");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Money creation by bank lending (BoE 2014), with a T-account.
  A["creacion"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#cr-stage", W, H);
    const box = (x, y, w, h, title, sub, col) => {
      const g = F.el("g", {}, svg);
      F.rect(g, x, y, w, h, { fill: "#fffaf5", stroke: col, sw: 2.5, rx: 8 });
      F.text(g, x + w / 2, y + 40, title, { size: 26, anchor: "middle", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      if (sub) F.text(g, x + w / 2, y + 68, sub, { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO });
      return g;
    };
    const bce = box(40, 20, 260, 90, "BCE", "fija el tipo de interés", C.accent2);
    const you = box(40, 330, 260, 90, "Tú", "pides una hipoteca", C.warm);
    const seller = box(1120, 330, 264, 90, "Vendedor del piso", "recibe el dinero", C.gold);
    const bank = box(520, 20, 380, 90, "Tu banco", "apunta préstamo y depósito", C.accent);

    // T-account
    const tx = 520,
      ty = 150,
      tw = 380;
    const tacc = F.el("g", {}, svg);
    F.line(tacc, tx, ty + 40, tx + tw, ty + 40, { stroke: C.text, w: 2 });
    F.line(tacc, tx + tw / 2, ty + 10, tx + tw / 2, ty + 140, { stroke: C.text, w: 2 });
    F.text(tacc, tx + tw / 4, ty + 30, "Activo", { size: 18, anchor: "middle", fill: C.muted, font: Deck.MONO });
    F.text(tacc, tx + (3 * tw) / 4, ty + 30, "Pasivo", { size: 18, anchor: "middle", fill: C.muted, font: Deck.MONO });
    const loan = F.el("g", {}, svg);
    F.text(loan, tx + tw / 4, ty + 82, "Préstamo a ti", { size: 19, anchor: "middle", fill: C.text });
    F.text(loan, tx + tw / 4, ty + 112, "200.000 €", { size: 26, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
    const dep = F.el("g", {}, svg);
    F.text(dep, tx + (3 * tw) / 4, ty + 82, "Tu depósito", { size: 19, anchor: "middle", fill: C.text });
    const depAmt = F.text(dep, tx + (3 * tw) / 4, ty + 112, "200.000 €", { size: 26, anchor: "middle", fill: C.accent, font: Deck.MONO, weight: 600 });
    const newMoney = F.text(svg, tx + tw / 2, ty + 200, "+200.000 € de dinero nuevo", { size: 22, anchor: "middle", fill: C.accent, font: Deck.DISPLAY, weight: 700 });

    const p1 = F.path(svg, "M300 65 L515 65", { stroke: C.accent2, w: 2.5 });
    const p1l = F.text(svg, 408, 52, "tipo de interés", { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO });
    const p2 = F.path(svg, "M300 375 C 420 375, 430 260, 515 230", { stroke: C.warm, w: 2.5 });
    const p3 = F.path(svg, "M905 230 C 1000 260, 1060 375, 1115 375", { stroke: C.accent, w: 2.5 });
    const gone = F.text(svg, tx + tw / 2, ty + 280, "Al devolver el préstamo, ese dinero desaparece", { size: 20, anchor: "middle", fill: C.warm, font: Deck.MONO });

    const cap = Deck.captions(tl, slide.querySelector("#cr-cap"), [
      "El BCE no reparte billetes a la gente: fija el precio del dinero (el tipo de interés) y presta a los bancos.",
      "Pides una hipoteca de 200.000 €. El banco no se los quita a otro cliente: apunta un préstamo en su activo y un depósito en tu cuenta. Ese dinero no existía.",
      "Pagas el piso y el dinero nuevo pasa al vendedor, que lo gasta o lo ahorra. Ya circula por la economía.",
      "Cuando devuelves el préstamo, el dinero se destruye. Por eso, cuando se presta mucho, hay mucho más dinero persiguiendo las mismas cosas.",
    ]);
    F.hide([you, seller, tacc, loan, dep, newMoney, p2, p3, gone]);
    F.pop(tl, [bce, bank], 0.1, { stagger: 0.2 });
    Deck.draw(tl, p1, 0.6, 0.6);
    F.fade(tl, p1l, 0.9);
    cap(0, 0.3);
    tl.addLabel("s0");
    tl.to(you, { opacity: 1, duration: 0.4 }, "s0");
    tl.to(p2, { opacity: 1, duration: 0.01 }, "s0+=0.3");
    Deck.draw(tl, p2, "s0+=0.3", 0.6);
    tl.to(tacc, { opacity: 1, duration: 0.4 }, "s0+=0.8");
    tl.to(loan, { opacity: 1, duration: 0.4 }, "s0+=1.1");
    tl.to(dep, { opacity: 1, duration: 0.4 }, "s0+=1.4");
    tl.to(newMoney, { opacity: 1, duration: 0.4 }, "s0+=1.8");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to(seller, { opacity: 1, duration: 0.4 }, "s1");
    tl.to(p3, { opacity: 1, duration: 0.01 }, "s1+=0.2");
    Deck.draw(tl, p3, "s1+=0.2", 0.6);
    tl.add(() => {}, "s1+=0.8");
    const flow = { v: 0 };
    tl.to(flow, { v: 1, duration: 0.5, onUpdate: () => (depAmt.textContent = flow.v > 0.5 ? "→ vendedor" : "200.000 €") }, "s1+=0.6");
    cap(2, "s1");
    tl.addLabel("s2");
    tl.to([loan, dep, newMoney], { opacity: 0.25, duration: 0.6 }, "s2");
    tl.to(gone, { opacity: 1, duration: 0.5 }, "s2+=0.3");
    cap(3, "s2");
    tl.addLabel("s3");
    // Pulse along the paths for "money moves" in step 2
    return { tl };
  };

  // Eurosystem balance sheet and M3, bars.
  A["balance"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 682,
      H = 470;
    const draw = (sel, data, max, ticks, hiIdx, pctLabel, col) => {
      const svg = F.stage(slide, sel, W, H);
      const x0 = 50,
        x1 = W - 10;
      const sy = F.scale(0, max, H - 50, 70);
      const g = F.el("g", {}, svg);
      F.yAxis(g, sy, ticks, x0, x1, { fmt: (v) => F.num(v) });
      F.fade(tl, g, 0, { dur: 0.3 });
      const bw = (x1 - x0) / data.length - 14;
      const xs = [];
      data.forEach(([lbl, v], i) => {
        const x = x0 + 7 + i * (bw + 14);
        xs.push(x + bw / 2);
        const r = F.rect(svg, x, sy(v), bw, sy(0) - sy(v), { fill: col, opacity: hiIdx.includes(i) ? 1 : 0.45 });
        const t = F.text(svg, x + bw / 2, sy(v) - 10, F.num(v, 2), { size: 16, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
        F.text(svg, x + bw / 2, H - 22, lbl, { size: 14, anchor: "middle", fill: C.muted, font: Deck.MONO });
        F.growV(tl, r, 0.2 + i * 0.15, 0.6, sy(0));
        F.fade(tl, t, 0.5 + i * 0.15);
      });
      // Bracket from first to peak
      const [a, b] = hiIdx;
      const yb = sy(max) - 4;
      const br = F.path(svg, `M${xs[a]} ${yb + 16} V${yb} H${xs[b]} V${yb + 16}`, { stroke: C.warm, w: 2 });
      const bl = F.text(svg, (xs[a] + xs[b]) / 2, yb - 10, pctLabel, { size: 24, anchor: "middle", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
      F.fade(tl, [br, bl], 1.6);
    };
    draw(
      "#ba-stage-1",
      [
        ["2019", 4.69],
        ["2020", 7.01],
        ["2021", 8.57],
        ["jun-22", 8.84],
        ["2022", 7.96],
        ["2023", 6.94],
        ["2025", 6.16],
        ["oct-26", 5.94],
      ],
      10,
      [0, 2, 4, 6, 8, 10],
      [0, 3],
      "+88 % en dos años y medio",
      C.accent,
    );
    draw(
      "#ba-stage-2",
      [
        ["2019", 12.98],
        ["2020", 14.47],
        ["2021", 15.49],
        ["2022", 16.05],
        ["2023", 16.1],
        ["2025", 17.2],
        ["ago-26", 17.65],
      ],
      20,
      [0, 5, 10, 15, 20],
      [0, 2],
      "+19 % en dos años",
      C.accent2,
    );
    return { tl };
  };

  A["proscons"] = Deck.simple([".card"], { stagger: 0.3 });

  // A ruler that shrinks 2 % a year: the same basket "measures" more euros.
  A["regla"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 380;
    const svg = F.stage(slide, "#rg-stage", W, H);
    const x0 = 80,
      unit = 6.4; // px per euro at year 0
    // The basket (fixed real size)
    const basket = F.el("g", {}, svg);
    F.rect(basket, x0, 40, 100 * unit, 110, { fill: "rgba(15,84,153,0.12)", stroke: C.accent, sw: 2.5, rx: 8 });
    F.text(basket, x0 + 50 * unit, 108, "La misma cesta de la compra", { size: 28, anchor: "middle", fill: C.accent, font: Deck.DISPLAY, weight: 700 });
    F.line(svg, x0, 30, x0, 330, { stroke: C.text, w: 1.5, dash: "4 4" });
    F.line(svg, x0 + 100 * unit, 30, x0 + 100 * unit, 330, { stroke: C.text, w: 1.5, dash: "4 4" });

    // Ruler (group scaled on X)
    const ruler = F.el("g", {}, svg);
    F.rect(ruler, x0, 190, 200 * unit, 70, { fill: "#f3d9a8", stroke: "#9c6700", sw: 2, rx: 4 });
    for (let e = 0; e <= 200; e += 5) {
      const big = e % 50 === 0;
      F.line(ruler, x0 + e * unit, 190, x0 + e * unit, 190 + (big ? 34 : e % 10 === 0 ? 22 : 12), { stroke: "#5b3d00", w: big ? 2 : 1 });
      if (e % 50 === 0) F.text(ruler, x0 + e * unit + 4, 250, e + " €", { size: 16, fill: "#5b3d00", font: Deck.MONO });
    }
    gsap.set(ruler, { svgOrigin: `${x0} 225` });
    const yearT = F.text(svg, W - 40, 310, "Año 0", { size: 26, anchor: "end", fill: C.muted, font: Deck.MONO });
    const meas = F.text(svg, x0 + 100 * unit + 20, 330, "La cesta mide 100 €", { size: 30, fill: C.warm, font: Deck.DISPLAY, weight: 700 });

    F.pop(tl, basket, 0.1);
    F.pop(tl, ruler, 0.4);
    const st = { n: 0 };
    tl.to(
      st,
      {
        n: 30,
        duration: 3.5,
        ease: "power1.inOut",
        onUpdate: () => {
          const f = Math.pow(1.02, st.n);
          gsap.set(ruler, { scaleX: 1 / f });
          yearT.textContent = "Año " + Math.round(st.n);
          meas.textContent = "La cesta mide " + Math.round(100 * f) + " €";
        },
      },
      1.0,
    );
    return { tl };
  };
})();
