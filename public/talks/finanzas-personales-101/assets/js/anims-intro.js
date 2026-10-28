/* Opening slides: cover, disclaimer, hook, agenda, section dividers. */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  // Cover: masthead + sparkline of the MSCI World (1 $ of 1969, log scale).
  A["cover"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 120;
    const svg = F.stage(slide, "#cover-spark", W, H);
    const cum = F.cumulative(F.msciWorld);
    const sx = F.scale(0, cum.length - 1, 0, W - 190);
    const sy = F.logScale(0.8, 260, H - 8, 8);
    const pts = cum.map((v, i) => [sx(i), sy(v)]);
    F.line(svg, 0, sy(1), W - 190, sy(1), { stroke: C.lineStrong, dash: "3 5" });
    const p = F.path(svg, F.poly(pts), { stroke: C.accent, w: 2.5 });
    const dot = F.el("circle", { cx: pts[pts.length - 1][0], cy: pts[pts.length - 1][1], r: 6, fill: C.accent }, svg);
    const lbl = F.text(svg, W - 175, sy(cum[cum.length - 1]) + 6, "1 $ → 217 $", { size: 22, fill: C.heading, font: Deck.MONO, weight: 600 });
    const sub = F.text(svg, W - 175, sy(cum[cum.length - 1]) + 32, "MSCI World 1970-2025", { size: 14, fill: C.muted });

    tl.from(slide.querySelector(".masthead"), { opacity: 0, y: -16, duration: 0.6, ease: "power2.out" }, 0);
    tl.from(slide.querySelector("h1"), { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, 0.15);
    tl.from(slide.querySelector(".sub"), { opacity: 0, y: 16, duration: 0.6 }, 0.45);
    Deck.draw(tl, p, 0.6, 2.2);
    F.fade(tl, [dot, lbl, sub], 2.6);
    tl.from(slide.querySelector(".byline"), { opacity: 0, duration: 0.6 }, 1.2);
    return { tl };
  };

  A["disclaimer"] = Deck.simple([".disclaimer-box", ".callout"], { stagger: 0.25 });
  A["agenda"] = Deck.simple([".ag"], { stagger: 0.08 });
  A["divider"] = Deck.simple([".num", "h2", "p"], { stagger: 0.15 });

  // Hook: a 1.000 € note whose purchasing power shrinks from 2000 to 2026.
  A["hook"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 740,
      H = 560;
    const svg = F.stage(slide, "#hk-stage", W, H);
    const yearEl = slide.querySelector("#hk-year");
    const valEl = slide.querySelector("#hk-val");
    const call = slide.querySelector("#hk-call");

    // Ghost outline = the note itself (unchanged); solid = what it buys.
    const nw = 600,
      nh = 320,
      nx = (W - nw) / 2,
      ny = 40;
    F.rect(svg, nx, ny, nw, nh, { fill: "none", stroke: C.lineStrong, sw: 2, dash: "8 6", rx: 10 });
    F.text(svg, nx + 14, ny - 12, "Los billetes: siguen siendo 1.000 €", { size: 17, fill: C.muted, font: Deck.MONO });

    const g = F.el("g", {}, svg);
    const note = F.rect(g, nx, ny, nw, nh, { fill: "#e9d3bd", stroke: C.warm, sw: 2.5, rx: 10 });
    const inner = F.rect(g, nx + 18, ny + 18, nw - 36, nh - 36, { fill: "none", stroke: "rgba(153,15,61,0.35)", sw: 1.5, rx: 6 });
    const big = F.text(g, nx + nw / 2, ny + nh / 2 + 34, "1.000 €", { size: 104, anchor: "middle", fill: C.warm, font: Deck.DISPLAY, weight: 900 });
    const seal = F.el("circle", { cx: nx + 78, cy: ny + 78, r: 36, fill: "none", stroke: C.warm, "stroke-width": 2 }, g);
    F.text(g, nx + 78, ny + 84, "€", { size: 30, anchor: "middle", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    const lab = F.text(svg, W / 2, ny + nh + 70, "Lo que compran: 100 %", { size: 26, anchor: "middle", fill: C.heading, font: Deck.DISPLAY, weight: 700 });

    // Shrink around the note's bottom-left corner.
    gsap.set(g, { svgOrigin: `${nx} ${ny + nh}` });

    // Purchasing power of 1.000 € of 2000 (INE CPI, own calc): year -> €
    const keys = [
      [2000, 1000],
      [2010, 759],
      [2015, 708],
      [2020, 673],
      [2022, 631],
      [2025, 560],
      [2026.6, 527],
    ];
    const st = { y: 2000, v: 1000 };
    const render = () => {
      yearEl.textContent = Math.min(2026, Math.floor(st.y));
      valEl.textContent = F.num(st.v);
      const s = Math.sqrt(st.v / 1000);
      gsap.set(g, { scale: s });
      lab.textContent = `Lo que compran: ${Math.round(st.v / 10)} %`;
    };
    render();
    let t = 0.6;
    for (let i = 1; i < keys.length; i++) {
      const dur = ((keys[i][0] - keys[i - 1][0]) / 26.6) * 4;
      tl.to(st, { y: keys[i][0], v: keys[i][1], duration: dur, ease: "none", onUpdate: render }, t);
      t += dur;
    }
    tl.from(call, { opacity: 0, y: 14, duration: 0.6 }, t + 0.1);
    return { tl };
  };
})();
