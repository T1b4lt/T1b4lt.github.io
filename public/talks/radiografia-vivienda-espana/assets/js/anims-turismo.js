/* Message 2 · tourist rentals: official count, unofficial (illegal) supply,
   weight in the rental market by city (BdE 2025) and "would it change things". */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;
  const fmt = (v, d = 1) => Number(v).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = (v) => Math.round(v).toLocaleString("es-ES");

  anims.oficial = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.count(tl, slide.querySelector("#of-num"), 341001, 0.1, { duration: 1.4, format: int });
    tl.from(slide.querySelectorAll(".grid-2 > div:first-child > :not(.big-num)"), { opacity: 0, y: 16, stagger: 0.2, duration: 0.5 }, 0.8);
    tl.from(slide.querySelector(".mini-title"), { opacity: 0, duration: 0.4 }, 0.4);
    Deck.fillBars(tl, slide.querySelector("#of-bars"), 0.6);
    tl.from(slide.querySelector(".grid-2 > div:last-child .tiny"), { opacity: 0, duration: 0.4 }, 1.6);
    return { tl };
  };

  anims.extraoficial = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".stat-card"), { opacity: 0, y: 26, stagger: 0.3, duration: 0.6 }, 0);
    Deck.count(tl, slide.querySelector("#ex-1"), 65122, 0.2, { duration: 1.2, format: int });
    Deck.count(tl, slide.querySelector("#ex-2"), 93, 0.5, { duration: 1.2, format: (v) => `~${Math.round(v)} %` });
    Deck.count(tl, slide.querySelector("#ex-3"), 86275, 0.8, { duration: 1.2, format: int });
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 16, duration: 0.6 }, 1.8);
    return { tl };
  };

  /* Grouped bars: urban area (blue) vs tourist centre (brick); step 1 adds the centres. */
  anims.vutciudades = function (slide) {
    const W = 1424,
      H = 520;
    const s = Deck.stageSvg(slide.querySelector("#vut-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#vut-caption"), [
      "En cada <strong>área urbana</strong>, las turísticas ya pesan por encima de la media en Málaga, Las Palmas y Sevilla.",
      "En el <strong>centro turístico</strong> se disparan: 44,6&nbsp;% en Málaga, 44,9&nbsp;% en Sevilla, 22,2&nbsp;% en Barcelona.",
    ]);
    const data = [
      ["Málaga", 28.9, 44.6],
      ["Las Palmas", 12.9, 26.9],
      ["Sevilla", 12.1, 44.9],
      ["S. C. Tenerife", 9.6, 8.2],
      ["Palma", 7.6, 0.7],
      ["Valencia", 5.7, 9.8],
      ["Barcelona", 4.0, 22.2],
      ["Madrid", 2.8, 14.9],
      ["Zaragoza", 1.4, 2.2],
    ];
    const x0 = 70,
      yB = 450,
      yT = 40,
      y = (v) => yB - (v / 50) * (yB - yT),
      gw = (W - x0) / data.length,
      bw = 50;
    [0, 10, 20, 30, 40, 50].forEach((v) => {
      svg("line", { x1: x0, x2: W, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1 }, s);
      svg("text", { x: x0 - 12, y: y(v) + 6, "text-anchor": "end", fill: C.muted, "font-size": 16, "font-family": Deck.MONO, text: `${v} %` }, s);
    });
    // Legend
    svg("rect", { x: W - 520, y: 0, width: 16, height: 16, rx: 3, fill: C.markB }, s);
    svg("text", { x: W - 496, y: 14, fill: C.text2, "font-size": 18, text: "Área urbana" }, s);
    const legC = svg("g", {}, s);
    svg("rect", { x: W - 340, y: 0, width: 16, height: 16, rx: 3, fill: C.markA }, legC);
    svg("text", { x: W - 316, y: 14, fill: C.text2, "font-size": 18, text: "Centro de la zona turística" }, legC);

    const areas = [],
      centres = [];
    data.forEach(([n, a, c], i) => {
      const cx = x0 + gw * i + gw / 2;
      svg("text", { x: cx, y: yB + 30, "text-anchor": "middle", fill: C.text, "font-size": 19, text: n }, s);
      const ga = svg("g", {}, s);
      svg("title", { text: `${n} · área urbana: ${fmt(a)} %` }, ga);
      svg("rect", { x: cx - bw - 2, y: y(a), width: bw, height: yB - y(a), rx: 3, fill: C.markB }, ga);
      svg("text", { x: cx - bw / 2 - 2, y: y(a) - 8, "text-anchor": "middle", fill: C.text, "font-size": 17, "font-family": Deck.MONO, text: fmt(a) }, ga);
      const gc = svg("g", {}, s);
      svg("title", { text: `${n} · centro turístico: ${fmt(c)} %` }, gc);
      svg("rect", { x: cx + 2, y: y(c), width: bw, height: yB - y(c), rx: 3, fill: C.markA }, gc);
      svg("text", { x: cx + bw / 2 + 2, y: y(c) - 8, "text-anchor": "middle", fill: C.text, "font-size": 17, "font-weight": 600, "font-family": Deck.MONO, text: fmt(c) }, gc);
      areas.push(ga);
      centres.push(gc);
    });
    svg("line", { x1: x0, x2: W, y1: yB, y2: yB, stroke: C.lineStrong, "stroke-width": 1.2 }, s);
    const ref = svg("line", { x1: x0, x2: W, y1: y(10.8), y2: y(10.8), stroke: C.text2, "stroke-width": 1.4, "stroke-dasharray": "6 5" }, s);
    const refT = svg("text", { x: W, y: y(10.8) - 8, "text-anchor": "end", fill: C.text2, "font-size": 17, "font-family": Deck.MONO, text: "media 10,8 %" }, s);

    gsap.set([...centres, legC], { opacity: 0 });
    tl.from(areas, { opacity: 0, y: 30, stagger: 0.07, duration: 0.5 }, 0.1);
    tl.from([ref, refT], { opacity: 0, duration: 0.4 }, 0.9);
    show(0, 0.2);
    tl.addLabel("s0");
    tl.to(legC, { opacity: 1, duration: 0.3 }, "s0");
    tl.to(centres, { opacity: 1, duration: 0.01, stagger: 0.07 }, "s0");
    tl.from(centres, { y: 40, duration: 0.5, stagger: 0.07, ease: "power3.out", immediateRender: false }, "s0");
    show(1, "s0");
    tl.addLabel("s1");
    return { tl };
  };

  anims.cambiaria = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".mini-title"), { opacity: 0, duration: 0.4 }, 0);
    Deck.fillBars(tl, slide.querySelector("#cam-bars"), 0.2);
    tl.from(slide.querySelectorAll(".grid-2 > div:first-child > p, .card"), { opacity: 0, y: 18, stagger: 0.3, duration: 0.5 }, 1.0);
    tl.from(slide.querySelector(".callout"), { opacity: 0, duration: 0.5 }, 1.8);
    return { tl };
  };
})();
