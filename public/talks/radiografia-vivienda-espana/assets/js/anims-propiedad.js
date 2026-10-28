/* Message 1 · "Solo el 1 % son grandes tenedores": Catastro owner/home
   imbalance, the >100 holders, the concentration ladder, rental market and
   regions. Data: Catastro, padrón 2026, uso residencial (research/datos/catastro). */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;
  const fmt = (v, d = 1) => Number(v).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

  /* Two 100 % bars (holders vs homes) joined by ribbons per band. */
  anims.desequilibrio = function (slide) {
    const W = 1424;
    const s = Deck.stageSvg(slide.querySelector("#deseq-stage"), W, 470);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#deseq-caption"), [
      "Quien tiene <strong>una sola vivienda</strong> es 3 de cada 4 titulares… pero solo tiene la mitad de las viviendas.",
      "Quien tiene <strong>de 2 a 5</strong> es 1 de cada 4 titulares, y ya acumula el 39&nbsp;% de las viviendas.",
      "Los <strong>grandes tenedores</strong> (más de 10): el 0,16&nbsp;% de los titulares tiene el 4,2&nbsp;% de las viviendas, <strong>26 veces su peso</strong>.",
      "Con el umbral de las <strong>zonas tensionadas</strong> (más de 5): el 0,77&nbsp;% de los titulares tiene el 7,2&nbsp;%, 1,76 millones de viviendas.",
    ]);
    const bands = [
      { k: "1", t: 75.97, v: 53.5, c: C.markN },
      { k: "2-5", t: 23.26, v: 39.26, c: C.markB },
      { k: "6-10", t: 0.616, v: 3.07, c: C.markD },
      { k: ">10", t: 0.157, v: 4.16, c: C.markA },
    ];
    const yT = 64,
      yB = 330,
      h = 52,
      gap = 2;
    const layout = (key) => {
      let x = 0;
      return bands.map((b) => {
        const w = Math.max(2, (b[key] / 100) * W - gap);
        const r = { x, w };
        x += w + gap;
        return r;
      });
    };
    const top = layout("t"),
      bot = layout("v");
    svg("text", { x: 0, y: yT - 14, fill: C.text, "font-size": 21, "font-weight": 600, text: "Titulares · 17,1 millones" }, s);
    svg("text", { x: 0, y: yB + h + 34, fill: C.text, "font-size": 21, "font-weight": 600, text: "Viviendas · 24,3 millones" }, s);

    const ribbons = [],
      segsT = [],
      segsB = [];
    bands.forEach((b, i) => {
      const a = top[i],
        z = bot[i];
      ribbons.push(
        svg("polygon", { points: `${a.x},${yT + h} ${a.x + a.w},${yT + h} ${z.x + z.w},${yB} ${z.x},${yB}`, fill: b.c, opacity: 0.22 }, s),
      );
      segsT.push(svg("rect", { x: a.x, y: yT, width: a.w, height: h, rx: 3, fill: b.c }, s));
      segsB.push(svg("rect", { x: z.x, y: yB, width: z.w, height: h, rx: 3, fill: b.c }, s));
    });

    // Per-step labels: share of holders (above) and of homes (below).
    const lbl = (x, y, txt, anchor, big) =>
      svg("text", { x, y, "text-anchor": anchor || "middle", fill: C.text, "font-size": big ? 30 : 20, "font-weight": 600, "font-family": big ? Deck.DISPLAY : Deck.BODY, opacity: 0, text: txt }, s);
    const labelSets = [
      [lbl(top[0].x + top[0].w / 2, yT + h / 2 + 8, "76,0 %", "middle", true), lbl(bot[0].x + bot[0].w / 2, yB + h / 2 + 10, "53,5 %", "middle", true)],
      [lbl(top[1].x + top[1].w / 2, yT + h / 2 + 10, "23,3 %", "middle", true), lbl(bot[1].x + bot[1].w / 2, yB + h / 2 + 10, "39,3 %", "middle", true)],
      [lbl(W, yT - 14, "0,16 % de los titulares ▾", "end"), lbl(W, yB + h + 34, "▴ 4,2 % de las viviendas · 1,01 M", "end")],
      [lbl(W, yT - 14, "0,77 % de los titulares ▾", "end"), lbl(W, yB + h + 34, "▴ 7,2 % de las viviendas · 1,76 M", "end")],
    ];
    labelSets[0].concat(labelSets[1]).forEach((t) => t.setAttribute("fill", "#fff"));
    labelSets[0].forEach((t) => t.setAttribute("fill", C.text));

    const focus = (idx, at) => {
      bands.forEach((b, i) => {
        const on = idx.includes(i);
        tl.to([segsT[i], segsB[i]], { opacity: on ? 1 : 0.28, duration: 0.4 }, at);
        tl.to(ribbons[i], { opacity: on ? 0.38 : 0.08, duration: 0.4 }, at);
      });
    };
    const swapLabels = (from, to, at) => {
      if (from !== null) tl.to(labelSets[from], { opacity: 0, duration: 0.3 }, at);
      tl.to(labelSets[to], { opacity: 1, duration: 0.4 }, typeof at === "number" ? at + 0.2 : `${at}+=0.2`);
    };

    // s0 · bars grow, ribbons appear, focus on single-home owners
    tl.from(segsT, { attr: { width: 0 }, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0);
    tl.from(segsB, { attr: { width: 0 }, duration: 0.7, stagger: 0.08, ease: "power3.out" }, 0.3);
    tl.from(ribbons, { opacity: 0, duration: 0.6, stagger: 0.08 }, 0.8);
    focus([0], 1.4);
    swapLabels(null, 0, 1.4);
    show(0, 0.2);
    tl.addLabel("s0");

    focus([1], "s0");
    swapLabels(0, 1, "s0");
    show(1, "s0");
    tl.addLabel("s1");

    focus([3], "s1");
    swapLabels(1, 2, "s1");
    show(2, "s1");
    tl.to(ribbons[3], { opacity: 0.6, duration: 0.4 }, "s1+=0.4");
    tl.addLabel("s2");

    focus([2, 3], "s2");
    swapLabels(2, 3, "s2");
    show(3, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  /* The 802 holders with more than 100 homes. */
  anims.megatenedores = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const a = slide.querySelector("#mt-a"),
      b = slide.querySelector("#mt-b");
    const int = (v) => Math.round(v).toLocaleString("es-ES");
    Deck.count(tl, a, 802, 0.2, { duration: 1.0, format: int });
    tl.from(slide.querySelector(".hero-pair .arrow"), { opacity: 0, y: -10, duration: 0.4 }, 1.0);
    Deck.count(tl, b, 500981, 1.2, { duration: 1.4, format: int });
    tl.from(slide.querySelectorAll(".hero-pair .small, .grid-2 > div > p"), { opacity: 0, duration: 0.5, stagger: 0.15 }, 1.6);
    tl.from(slide.querySelector(".mini-title"), { opacity: 0, duration: 0.4 }, 0.4);
    Deck.fillBars(tl, slide.querySelector("#mt-bars"), 0.6);
    return { tl };
  };

  /* Ladder: share of holders (grey) vs share of homes (brick), row by row. */
  anims.escalera = function (slide) {
    const W = 1424;
    const s = Deck.stageSvg(slide.querySelector("#esc-stage"), W, 560);
    const tl = gsap.timeline({ paused: true });
    const rows = [
      { l: "Más de 100 viviendas", sub: "802 titulares", t: 0.0047, v: 2.06, x: "×440" },
      { l: "Más de 10 (gran tenedor legal)", sub: "26.890 titulares", t: 0.157, v: 4.16, x: "×26" },
      { l: "Más de 5 (en zona tensionada)", sub: "132.468 titulares", t: 0.773, v: 7.23, x: "×9" },
      { l: "El 1 % con más viviendas", sub: "171.372 titulares", t: 1.0, v: 7.8, vTxt: "~7,6-8,0 %", x: "×8" },
      { l: "Con 2 o más viviendas", sub: "4,1 millones de titulares", t: 24.03, v: 46.5, x: "×1,9" },
    ];
    const x0 = 430,
      scale = 760 / 50,
      rowH = 96,
      y0 = 70;
    // Legend + header
    svg("rect", { x: x0, y: 8, width: 16, height: 16, rx: 3, fill: C.markN }, s);
    svg("text", { x: x0 + 26, y: 22, fill: C.text2, "font-size": 18, text: "% de los titulares" }, s);
    svg("rect", { x: x0 + 220, y: 8, width: 16, height: 16, rx: 3, fill: C.markA }, s);
    svg("text", { x: x0 + 246, y: 22, fill: C.text2, "font-size": 18, text: "% de las viviendas que tienen" }, s);
    svg("text", { x: W, y: 22, "text-anchor": "end", fill: C.muted, "font-size": 16, "font-family": Deck.MONO, text: "VECES SU PESO" }, s);
    svg("line", { x1: x0, x2: x0, y1: 44, y2: y0 + rows.length * rowH - 16, stroke: C.lineStrong, "stroke-width": 1 }, s);

    const groups = rows.map((r, i) => {
      const g = svg("g", {}, s);
      const y = y0 + i * rowH;
      svg("line", { x1: 0, x2: W, y1: y + rowH - 14, y2: y + rowH - 14, stroke: C.line, "stroke-width": 1 }, g);
      svg("text", { x: 0, y: y + 24, fill: C.heading || C.text, "font-size": 23, "font-weight": 600, "font-family": Deck.DISPLAY, text: r.l }, g);
      svg("text", { x: 0, y: y + 52, fill: C.muted, "font-size": 18, text: r.sub }, g);
      const wt = Math.max(2, r.t * scale),
        wv = r.v * scale;
      const bt = svg("rect", { x: x0, y: y + 6, width: wt, height: 20, rx: 3, fill: C.markN }, g);
      const bv = svg("rect", { x: x0, y: y + 34, width: wv, height: 20, rx: 3, fill: C.markA }, g);
      svg("text", { x: x0 + wt + 10, y: y + 22, fill: C.text2, "font-size": 18, "font-family": Deck.MONO, text: `${fmt(r.t, r.t < 0.1 ? 3 : r.t < 1 ? 2 : 1)} %` }, g);
      svg("text", { x: x0 + wv + 10, y: y + 51, fill: C.text, "font-size": 19, "font-weight": 600, "font-family": Deck.MONO, text: r.vTxt || `${fmt(r.v, r.v < 10 ? 2 : 1)} %` }, g);
      svg("text", { x: W, y: y + 46, "text-anchor": "end", fill: C.accent, "font-size": 40, "font-weight": 600, "font-family": Deck.DISPLAY, text: r.x }, g);
      gsap.set(g, { opacity: 0 });
      return { g, bt, bv, wt, wv };
    });
    const reveal = (i, at) => {
      const r = groups[i];
      tl.to(r.g, { opacity: 1, duration: 0.4 }, at);
      tl.fromTo(r.bt, { attr: { width: 0 } }, { attr: { width: r.wt }, duration: 0.5 }, typeof at === "number" ? at : `${at}+=0.1`);
      tl.fromTo(r.bv, { attr: { width: 0 } }, { attr: { width: r.wv }, duration: 0.9, ease: "power3.out" }, typeof at === "number" ? at + 0.4 : `${at}+=0.4`);
    };
    reveal(0, 0.2);
    reveal(1, 0.9);
    tl.addLabel("s0");
    reveal(2, "s0");
    tl.addLabel("s1");
    reveal(3, "s1");
    tl.addLabel("s2");
    reveal(4, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  anims.alquiler = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".card"), { opacity: 0, y: 24, stagger: 0.3, duration: 0.6 }, 0);
    Deck.fillBars(tl, slide.querySelector("#alq-bars"), 0.8);
    return { tl };
  };

  /* Regions: stacked private + public share of homes held by >10 holders. */
  anims.ccaa = function (slide) {
    const W = 860,
      H = 600;
    const s = Deck.stageSvg(slide.querySelector("#ccaa-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const data = [
      ["Canarias", 8.0, 6.64],
      ["Cataluña", 5.64, 4.64],
      ["Madrid", 4.87, 3.86],
      ["Baleares", 4.2, 3.64],
      ["Andalucía", 4.08, 2.48],
      ["Murcia", 3.92, 3.33],
      ["Asturias", 3.58, 1.93],
      ["Extremadura", 3.25, 0.91],
      ["C. Valenciana", 3.03, 2.48],
      ["Castilla-La Mancha", 2.6, 1.94],
      ["Aragón", 2.56, 2.18],
      ["Galicia", 2.41, 1.91],
      ["Cantabria", 1.99, 1.74],
      ["Castilla y León", 1.81, 1.46],
      ["La Rioja", 1.57, 1.3],
    ];
    const x0 = 210,
      sc = 560 / 8.5,
      rh = 37,
      y0 = 30;
    const ref = svg("line", { x1: x0 + 4.16 * sc, x2: x0 + 4.16 * sc, y1: 10, y2: y0 + data.length * rh, stroke: C.text2, "stroke-width": 1.2, "stroke-dasharray": "4 4" }, s);
    const refT = svg("text", { x: x0 + 4.16 * sc + 6, y: y0 + data.length * rh + 4, fill: C.text2, "font-size": 16, "font-family": Deck.MONO, text: "media 4,2 %" }, s);
    data.forEach(([n, tot, priv], i) => {
      const y = y0 + i * rh;
      const g = svg("g", {}, s);
      svg("title", { text: `${n}: ${fmt(tot, 2)} % (privados ${fmt(priv, 2)} %, públicos ${fmt(tot - priv, 2)} %)` }, g);
      svg("rect", { x: 0, y: y - 4, width: W, height: rh, fill: "transparent" }, g);
      svg("text", { x: x0 - 12, y: y + 20, "text-anchor": "end", fill: C.text, "font-size": 19, "font-weight": i < 3 ? 600 : 400, text: n }, g);
      const a = svg("rect", { x: x0, y: y + 4, width: priv * sc - 1, height: 22, rx: 3, fill: C.markA }, g);
      const b = svg("rect", { x: x0 + priv * sc + 1, y: y + 4, width: Math.max(1, (tot - priv) * sc - 1), height: 22, rx: 3, fill: C.markB }, g);
      const t = svg("text", { x: x0 + tot * sc + 8, y: y + 21, fill: C.text, "font-size": 17, "font-family": Deck.MONO, text: `${fmt(tot, 1)} %` }, g);
      tl.from(a, { attr: { width: 0 }, duration: 0.6, ease: "power3.out" }, 0.1 + i * 0.05);
      tl.from(b, { attr: { width: 0, x: x0 }, duration: 0.6, ease: "power3.out" }, 0.35 + i * 0.05);
      tl.from(t, { opacity: 0, duration: 0.3 }, 0.6 + i * 0.05);
    });
    tl.from([ref, refT], { opacity: 0, duration: 0.4 }, 1.2);
    tl.from(slide.querySelectorAll(".grid-2 > div:last-child > *"), { opacity: 0, duration: 0.4, stagger: 0.15 }, 0.4);
    return { tl };
  };
})();
