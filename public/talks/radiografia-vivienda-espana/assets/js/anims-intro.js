/* Opening and "radiografía" slides: cover, denominator trick, the five
   messages, the housing stock and tenure. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;
  const fmt = (v, d = 1) => Number(v).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

  anims.cover = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".kicker"), { opacity: 0, x: -30, duration: 0.6 })
      .from(slide.querySelector("h1"), { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, 0.15)
      .from(slide.querySelector(".sub"), { opacity: 0, y: 20, duration: 0.7 }, 0.55)
      .from(slide.querySelectorAll(".tags .tag"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 }, 0.85)
      .from(slide.querySelector(".replay-hint"), { opacity: 0, duration: 0.6 }, 1.6);
    return { tl };
  };

  /* Same numerator, three denominators: the share jumps from 1,3 % to 44,6 %. */
  anims.denominador = function (slide) {
    const W = 1424;
    const s = Deck.stageSvg(slide.querySelector("#den-stage"), W, 430);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#den-caption"), [
      "Sobre <strong>todo el parque</strong> (26,6 millones), las viviendas turísticas son una gota: el 1,3&nbsp;%.",
      "Pero no compiten con todas las casas, sino con las que <strong>se alquilan</strong>: ahí son el 10,8&nbsp;%.",
      "Y donde se concentran, en el <strong>centro turístico de Málaga</strong>, son casi la mitad del alquiler: el 44,6&nbsp;%.",
    ]);
    const steps = [
      { p: 1.3, total: "Todo el parque de viviendas · 26,6 M" },
      { p: 10.8, total: "Viviendas en alquiler · España" },
      { p: 44.6, total: "Viviendas en alquiler · centro turístico de Málaga" },
    ];

    const big = svg("text", { x: 0, y: 150, fill: C.accent, "font-size": 170, "font-weight": 600, "font-family": Deck.DISPLAY, text: "0 %" }, s);
    svg("text", { x: 4, y: 214, fill: C.text2, "font-size": 26, text: "son viviendas turísticas, sobre…" }, s);
    const totalLbl = svg("text", { x: 0, y: 262, fill: C.text, "font-size": 24, "font-weight": 600, text: steps[0].total }, s);

    const barY = 278;
    svg("rect", { x: 0, y: barY, width: W, height: 66, rx: 4, fill: C.markN, opacity: 0.45 }, s);
    const seg = svg("rect", { x: 0, y: barY, width: 0, height: 66, rx: 4, fill: C.accent }, s);
    const segLbl = svg("text", { x: 0, y: barY + 98, fill: C.text2, "font-size": 20, "font-family": Deck.MONO, text: "▲ viviendas turísticas" }, s);

    // Ladder of the three denominators.
    const ladder = steps.map((st, i) =>
      svg("text", { x: i * 480, y: 418, fill: C.muted, "font-size": 18, "font-family": Deck.MONO, text: `${i + 1} · ${["parque total", "mercado del alquiler", "alquiler en el centro turístico"][i]}` }, s),
    );

    const st = { p: 0, k: 0 };
    const render = () => {
      big.textContent = `${fmt(st.p)} %`;
      const w = Math.max(3, (st.p / 100) * W);
      seg.setAttribute("width", w);
      segLbl.setAttribute("x", Math.max(0, Math.min(w - 230, W - 260)));
      const k = Math.round(st.k);
      totalLbl.textContent = steps[k].total;
      ladder.forEach((t, i) => {
        t.setAttribute("fill", i === k ? C.accent : C.muted);
        t.setAttribute("font-weight", i === k ? 600 : 400);
      });
    };
    render();

    tl.from([big, totalLbl], { opacity: 0, y: 20, duration: 0.6 }, 0);
    tl.to(st, { p: 1.3, duration: 1.2, ease: "power2.out", onUpdate: render }, 0.3);
    show(0, 0.4);
    tl.addLabel("s0");

    show(1, "s0");
    tl.to(st, { k: 1, duration: 0.01, onUpdate: render }, "s0");
    tl.to(st, { p: 10.8, duration: 1.3, ease: "power2.inOut", onUpdate: render }, "s0+=0.1");
    tl.addLabel("s1");

    show(2, "s1");
    tl.to(st, { k: 2, duration: 0.01, onUpdate: render }, "s1");
    tl.to(st, { p: 44.6, duration: 1.5, ease: "power2.inOut", onUpdate: render }, "s1+=0.1");
    tl.addLabel("s2");
    return { tl };
  };

  anims.mensajes = Deck.simple([".msg-list li", ".small.muted"], { stagger: 0.14 });
  anims.dicen = Deck.simple([".claim", ".callout"], { stagger: 0.25 });

  /* Housing stock: three 100 % bars (use, electricity consumption, tenure). */
  anims.parque = function (slide) {
    const W = 1424;
    const s = Deck.stageSvg(slide.querySelector("#parque-stage"), W, 470);
    const tl = gsap.timeline({ paused: true });
    const rows = [
      {
        title: "Por uso · 26.623.708 viviendas",
        segs: [
          { v: 69.6, c: C.markB, l: "Principales (alguien empadronado)", n: "18,5 M · 69,6 %" },
          { v: 30.4, c: C.markN, l: "No principales", n: "8,1 M · 30,4 %" },
        ],
      },
      {
        title: "Por consumo eléctrico",
        segs: [
          { v: 72.6, c: C.markN, l: "Resto (uso habitual)", n: "72,6 %" },
          { v: 3.5, c: "#d9b56a", l: "", n: "" },
          { v: 9.4, c: C.markD, l: "Esporádico", n: "9,4 %" },
          { v: 14.4, c: C.markA, l: "Vacías", n: "3,8 M · 14,4 %" },
        ],
      },
      {
        title: "Hogares por régimen de tenencia",
        segs: [
          { v: 75.5, c: C.markB, l: "En propiedad", n: "75,5 %" },
          { v: 16.1, c: C.markC, l: "En alquiler", n: "16,1 %" },
          { v: 8.4, c: C.markN, l: "Otros", n: "8,4 %" },
        ],
      },
    ];
    rows.forEach((r, i) => {
      const y = 34 + i * 162;
      svg("text", { x: 0, y, fill: C.text, "font-size": 22, "font-weight": 600, text: r.title }, s);
      let x = 0;
      r.segs.forEach((g, j) => {
        const w = (g.v / 100) * W - 2;
        const rect = svg("rect", { x, y: y + 14, width: w, height: 56, rx: 3, fill: g.c }, s);
        tl.from(rect, { attr: { width: 0 }, duration: 0.8, ease: "power3.out" }, 0.2 + i * 0.35 + j * 0.12);
        if (g.l) {
          const anchorEnd = j === r.segs.length - 1 && r.segs.length > 2;
          const tx = anchorEnd ? x + w : x + 10;
          const t1 = svg("text", { x: tx, y: y + 98, "text-anchor": anchorEnd ? "end" : "start", fill: C.text2, "font-size": 19, text: g.l }, s);
          const t2 = svg("text", { x: tx, y: y + 50, "text-anchor": anchorEnd ? "end" : "start", fill: g.c === C.markN || g.c === "#d9b56a" ? C.text : "#fff", "font-size": 20, "font-weight": 600, "font-family": Deck.MONO, text: g.n }, s);
          if (anchorEnd) t2.setAttribute("x", x + w - 10);
          tl.from([t1, t2], { opacity: 0, duration: 0.4 }, 0.7 + i * 0.35 + j * 0.12);
        }
        x += w + 2;
      });
    });
    svg("text", { x: W, y: 34 + 162, "text-anchor": "end", fill: C.muted, "font-size": 16, text: "▮ muy bajo consumo 3,5 %" }, s).setAttribute("fill", "#a8862e");
    return { tl };
  };

  /* Tenure 2008 → 2022: slope chart with three exclusive household profiles. */
  anims.tenencia = function (slide) {
    const W = 800,
      H = 520;
    const s = Deck.stageSvg(slide.querySelector("#ten-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const x0 = 120,
      x1 = 560,
      yT = 30,
      yB = 470;
    const y = (v) => yB - (v / 85) * (yB - yT);
    [0, 20, 40, 60, 80].forEach((v) => {
      svg("line", { x1: x0 - 20, x2: x1 + 20, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1 }, s);
    });
    [
      [x0, "2008"],
      [x1, "2022"],
    ].forEach(([x, t]) => svg("text", { x, y: H - 10, "text-anchor": "middle", fill: C.text2, "font-size": 20, "font-weight": 600, text: t }, s));
    const series = [
      { n: "Propietarios", a: 79.0, b: 63.85, c: C.markB },
      { n: "Inquilinos", a: 11.92, b: 19.17, c: C.markC },
      { n: "Caseros", a: 3.38, b: 9.79, c: C.markA },
    ];
    series.forEach((sr, i) => {
      const line = svg("line", { x1: x0, y1: y(sr.a), x2: x1, y2: y(sr.b), stroke: sr.c, "stroke-width": 3 }, s);
      const d0 = svg("circle", { cx: x0, cy: y(sr.a), r: 6, fill: sr.c, stroke: C.bg, "stroke-width": 2 }, s);
      const d1 = svg("circle", { cx: x1, cy: y(sr.b), r: 6, fill: sr.c, stroke: C.bg, "stroke-width": 2 }, s);
      const la = svg("text", { x: x0 - 14, y: y(sr.a) - 12, "text-anchor": "end", fill: C.text, "font-size": 19, "font-family": Deck.MONO, text: `${fmt(sr.a)} %` }, s);
      const dy = sr.n === "Inquilinos" ? -6 : sr.n === "Caseros" ? 16 : 6;
      const lb = svg("text", { x: x1 + 16, y: y(sr.b) + dy, fill: C.text, "font-size": 20, "font-weight": 600, text: `${sr.n} ${fmt(sr.b)} %` }, s);
      const t = 0.3 + i * 0.4;
      tl.from([d0, la], { opacity: 0, duration: 0.3 }, t);
      Deck.draw(tl, line, t + 0.1, 0.9);
      tl.from([d1, lb], { opacity: 0, duration: 0.4 }, t + 0.9);
    });
    tl.from(slide.querySelectorAll(".stat, .tiny"), { opacity: 0, y: 20, stagger: 0.25, duration: 0.5 }, 1.8);
    return { tl };
  };
})();
