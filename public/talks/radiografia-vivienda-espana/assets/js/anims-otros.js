/* Messages 3-5, the open question and the closing slides. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;
  const fmt = (v, d = 1) => Number(v).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
  const int = (v) => Math.round(v).toLocaleString("es-ES");

  /* Housing deficit 2021-2025 as % of households (BdE). Spain highlighted. */
  anims.construir = function (slide) {
    const W = 760,
      H = 400;
    const s = Deck.stageSvg(slide.querySelector("#cons-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const data = [
      ["Portugal", 7.0],
      ["Países Bajos", 4.7],
      ["España", 3.9],
      ["Italia", 1.5],
      ["Francia", 0.02],
      ["Alemania", -0.5],
    ];
    const x0 = 230,
      sc = 440 / 7.5,
      rh = 56;
    svg("line", { x1: x0, x2: x0, y1: 4, y2: data.length * rh + 4, stroke: C.lineStrong, "stroke-width": 1.2 }, s);
    data.forEach(([n, v], i) => {
      const y = 12 + i * rh;
      const es = n === "España";
      const w = Math.max(2, Math.abs(v) * sc);
      svg("text", { x: x0 - 14 - (v < 0 ? w : 0), y: y + 25, "text-anchor": "end", fill: C.text, "font-size": 21, "font-weight": es ? 600 : 400, text: n }, s);
      const r = svg("rect", { x: v >= 0 ? x0 + 1 : x0 - w - 1, y: y + 6, width: w, height: 28, rx: 3, fill: es ? C.markA : C.markN }, s);
      const label = v < 0 ? "superávit 0,5 %" : v < 0.1 ? "≈ 0 %" : `${fmt(v)} %`;
      const t = svg("text", { x: v >= 0 ? x0 + w + 10 : x0 + 12, y: y + 27, fill: C.text, "font-size": 19, "font-weight": es ? 600 : 400, "font-family": Deck.MONO, text: label }, s);
      tl.from(r, { attr: { width: 0, x: x0 }, duration: 0.7, ease: "power3.out" }, 0.4 + i * 0.1);
      tl.from(t, { opacity: 0, duration: 0.3 }, 0.8 + i * 0.1);
    });
    svg("text", { x: 0, y: H - 10, fill: C.muted, "font-size": 15, text: "España: terminadas − hogares; resto: visados (t−2) − hogares." }, s);
    tl.from(slide.querySelectorAll(".grid-2 > div:first-child > *"), { opacity: 0, y: 14, stagger: 0.15, duration: 0.45 }, 0);
    tl.from(slide.querySelector(".verdict"), { opacity: 0, scale: 0.9, duration: 0.4 }, 1.8);
    return { tl };
  };

  /* Empty homes by municipality size (INE Census 2021). */
  anims.vacias = function (slide) {
    const W = 800,
      H = 500;
    const s = Deck.stageSvg(slide.querySelector("#vac-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const data = [
      ["< 1.000", 33.3, 14.4],
      ["1.000-10.000", 21.6, 30.6],
      ["10.000-50.000", 13.9, 25.9],
      ["50.000-250.000", 10.2, 18.6],
      ["> 250.000", 7.5, 10.5],
    ];
    const x0 = 60,
      yB = 380,
      yT = 40,
      y = (v) => yB - (v / 35) * (yB - yT),
      gw = (W - x0) / data.length,
      bw = 86;
    svg("text", { x: 0, y: 16, fill: C.text2, "font-size": 18, text: "% del parque de cada grupo que está vacío" }, s);
    [0, 10, 20, 30].forEach((v) => {
      svg("line", { x1: x0, x2: W, y1: y(v), y2: y(v), stroke: C.line }, s);
      svg("text", { x: x0 - 10, y: y(v) + 5, "text-anchor": "end", fill: C.muted, "font-size": 15, "font-family": Deck.MONO, text: `${v}` }, s);
    });
    const ref = svg("line", { x1: x0, x2: W, y1: y(14.4), y2: y(14.4), stroke: C.text2, "stroke-width": 1.4, "stroke-dasharray": "6 5" }, s);
    const refT = svg("text", { x: W, y: y(14.4) - 8, "text-anchor": "end", fill: C.text2, "font-size": 16, "font-family": Deck.MONO, text: "media 14,4 %" }, s);
    data.forEach(([n, v, share], i) => {
      const cx = x0 + gw * i + gw / 2;
      const small = i < 2;
      const r = svg("rect", { x: cx - bw / 2, y: y(v), width: bw, height: yB - y(v), rx: 3, fill: small ? C.markA : C.markN }, s);
      const t = svg("text", { x: cx, y: y(v) - 10, "text-anchor": "middle", fill: C.text, "font-size": 19, "font-weight": 600, "font-family": Deck.MONO, text: `${fmt(v)} %` }, s);
      svg("text", { x: cx, y: yB + 28, "text-anchor": "middle", fill: C.text, "font-size": 16, text: n }, s);
      const sh = svg("text", { x: cx, y: yB + 58, "text-anchor": "middle", fill: C.muted, "font-size": 15, text: `${fmt(share)} % del total` }, s);
      tl.from(r, { attr: { y: yB, height: 0 }, duration: 0.7, ease: "power3.out" }, 0.2 + i * 0.12);
      tl.from([t, sh], { opacity: 0, duration: 0.3 }, 0.7 + i * 0.12);
    });
    svg("text", { x: W / 2, y: H - 8, "text-anchor": "middle", fill: C.muted, "font-size": 15, text: "Habitantes del municipio" }, s);
    tl.from([ref, refT], { opacity: 0, duration: 0.4 }, 1.2);
    tl.from(slide.querySelectorAll(".grid-2 > div:last-child > *"), { opacity: 0, y: 14, stagger: 0.25, duration: 0.5 }, 1.0);
    return { tl };
  };

  /* 10.000 homes as dots; ~6 highlighted (squatting complaints per year). */
  anims.okupacion = function (slide) {
    const W = 600,
      H = 520;
    const s = Deck.stageSvg(slide.querySelector("#oku-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const n = 100,
      pitch = 4.6,
      ox = (W - n * pitch) / 2,
      oy = 6;
    const field = svg("g", {}, s);
    // One path per row keeps the DOM light (10.000 dots).
    for (let r = 0; r < n; r++) {
      let d = "";
      for (let c = 0; c < n; c++) d += `M${ox + c * pitch + pitch / 2},${oy + r * pitch + pitch / 2}h0.01`;
      svg("path", { d, stroke: C.markN, "stroke-width": 2.6, "stroke-linecap": "round" }, field);
    }
    const rng = Deck.rng(7);
    const hits = [];
    for (let i = 0; i < 6; i++) {
      const cx = ox + Math.floor(rng() * n) * pitch + pitch / 2,
        cy = oy + Math.floor(rng() * n) * pitch + pitch / 2;
      hits.push(svg("circle", { cx, cy, r: 5.5, fill: C.markA, stroke: C.bg, "stroke-width": 2 }, s));
    }
    svg("text", { x: W / 2, y: H - 34, "text-anchor": "middle", fill: C.text2, "font-size": 18, text: "Cada punto: 1 vivienda de cada 10.000" }, s);
    svg("text", { x: W / 2, y: H - 8, "text-anchor": "middle", fill: C.accent, "font-size": 18, "font-weight": 600, text: "● ~6 con una denuncia por okupación en un año" }, s);
    tl.from(field.children, { opacity: 0, duration: 0.25, stagger: 0.008 }, 0);
    tl.from(hits, { scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.12, ease: "back.out(3)" }, 1.1);
    Deck.count(tl, slide.querySelector(".stat .big-num"), 14875, 0.2, { duration: 1.2, format: int });
    tl.from(slide.querySelectorAll(".grid-2 > div:last-child > :not(.stat)"), { opacity: 0, y: 14, stagger: 0.25, duration: 0.5 }, 1.4);
    return { tl };
  };

  anims.ley = Deck.simple([".card", ".verdict"], { stagger: 0.3 });
  anims.veredictos = Deck.simple(["tbody tr"], { stagger: 0.3 });
  anims.preguntas = Deck.simple([".takeaways .item"], { stagger: 0.45 });
  anims.fuentes = Deck.simple(["li"], { stagger: 0.05 });
})();
