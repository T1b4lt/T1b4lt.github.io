/* Animations · RLHF, the KL leash, reward hacking and DPO. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  const txt = (parent, x, y, text, o) =>
    svg("text", Object.assign({ x, y, fill: C.text, "font-size": 18, "font-family": Deck.MONO, text }, o || {}), parent);

  /* Stepped: the three InstructGPT stages light up one by one. */
  anims.rlhf = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const cards = slide.querySelectorAll("#rlhf-cards .card");
    const show = Deck.captions(tl, slide.querySelector("#rlhf-cap"), [
      "<strong>Paso 1.</strong> Unas decenas de miles de demostraciones bastan para que el modelo base aprenda el formato «pregunta → respuesta».",
      "<strong>Paso 2.</strong> Ordenar es más fácil que escribir: con rankings humanos entrenamos un <strong>reward model</strong> que imita su criterio.",
      "<strong>Paso 3.</strong> Ahora sí, RL: la política genera, el RM puntúa y PPO actualiza. La <strong>KL</strong> evita que se aleje demasiado del SFT.",
      "Resultado: las respuestas del InstructGPT de <strong>1,3B</strong> se prefirieron a las de GPT-3 de <strong>175B</strong>, con 100× menos parámetros.",
    ]);
    gsap.set(cards, { opacity: 0.18, y: 10 });
    tl.to(cards[0], { opacity: 1, y: 0, duration: 0.5 }, 0.1);
    show(0, 0);
    tl.addLabel("s0");
    for (let i = 1; i <= 2; i++) {
      show(i, `s${i - 1}`);
      tl.to(cards[i], { opacity: 1, y: 0, duration: 0.5 }, `s${i - 1}`);
      tl.addLabel(`s${i}`);
    }
    show(3, "s2");
    tl.fromTo(cards, { scale: 1 }, { scale: 1.02, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.1 }, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  anims.rm = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".chat .bubble, .chat .who"), { opacity: 0, y: 12, stagger: 0.12, duration: 0.4 }, 0);
    tl.from(slide.querySelectorAll(".formula, ul li, .callout"), { opacity: 0, x: 16, stagger: 0.15, duration: 0.45 }, 0.6);
    return { tl };
  };

  /* Interactive: exact KL-regularised optimum π* ∝ π_ref · exp(r/β) on a 1-D toy. */
  anims.kl = function (slide, { signal }) {
    const W = 810;
    const H = 460;
    const stage = slide.querySelector("#kl-stage");
    const tip = Deck.tooltip(slide.querySelector("#kl-tip"), stage);
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" });
    stage.insertBefore(s, stage.firstChild);
    Deck.glowFilter(s);
    const m = { l: 20, r: 20, t: 44, b: 120 };
    const N = 240;
    const xs = Array.from({ length: N }, (_, i) => (10 * i) / (N - 1));
    const reward = (x) => 0.35 * x + 3.2 * Math.exp(-((x - 9) ** 2) / 0.18);
    const ref = xs.map((x) => Math.exp(-((x - 4) ** 2) / (2 * 1.3 * 1.3)));
    const refSum = ref.reduce((a, b) => a + b, 0);
    const pRef = ref.map((v) => v / refSum);
    const X = (x) => m.l + ((W - m.l - m.r) * x) / 10;
    const base = H - m.b;

    // legend
    svg("line", { x1: m.l, x2: m.l + 30, y1: 16, y2: 16, stroke: C.accent2, "stroke-width": 3, "stroke-dasharray": "7 5" }, s);
    txt(s, m.l + 40, 22, "π_ref (antes)", { fill: C.text2, "font-size": 17 });
    svg("rect", { x: m.l + 200, y: 8, width: 30, height: 16, rx: 4, fill: "rgba(192,88,47,0.35)", stroke: C.accent, "stroke-width": 2 }, s);
    txt(s, m.l + 240, 22, "π (tras RL)", { fill: C.text2, "font-size": 17 });

    svg("line", { x1: m.l, x2: W - m.r, y1: base, y2: base, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    const areaPi = svg("path", { fill: "rgba(192,88,47,0.22)", stroke: C.accent, "stroke-width": 2.5, "stroke-linejoin": "round" }, s);
    const lineRef = svg("path", { fill: "none", stroke: C.accent2, "stroke-width": 3, "stroke-dasharray": "7 5" }, s);

    // reward strip (sequential: one hue, light → dark)
    const sy = base + 26;
    txt(s, m.l, sy - 8, "recompensa del reward model →", { fill: C.muted, "font-size": 15 });
    const cells = 60;
    const rMax = reward(9);
    for (let i = 0; i < cells; i++) {
      const x0 = (10 * i) / cells;
      const r = reward(x0 + 5 / cells) / rMax;
      svg("rect", { x: X(x0), y: sy, width: (W - m.l - m.r) / cells + 0.5, height: 22, fill: C.warm, opacity: 0.08 + 0.85 * r }, s);
    }
    txt(s, X(0.2), sy + 50, "sobrias", { fill: C.text2, "font-size": 16 });
    txt(s, X(4), sy + 50, "útiles", { fill: C.text2, "font-size": 16, "text-anchor": "middle" });
    txt(s, X(9), sy + 50, "zona rara (hack)", { fill: C.warm, "font-size": 16, "text-anchor": "middle", "font-weight": 600 });
    txt(s, (m.l + W - m.r) / 2, sy + 80, "estilo de respuesta (eje conceptual)", { fill: C.muted, "font-size": 15, "text-anchor": "middle" });

    const hover = svg("line", { y1: m.t, y2: base, stroke: C.lineStrong, "stroke-dasharray": "3 4", opacity: 0 }, s);
    const hit = svg("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: base - m.t, fill: "transparent" }, s);

    const bIn = slide.querySelector("#kl-beta");
    const bOut = slide.querySelector("#kl-beta-out");
    const stats = slide.querySelector("#kl-stats");
    const st = { v: 100 };
    let pi = pRef.slice();
    const betaOf = (v) => Math.pow(10, -1.4 + (2.1 * v) / 100);
    function render() {
      const beta = betaOf(st.v);
      const logw = xs.map((x, i) => Math.log(pRef[i]) + reward(x) / beta);
      const mx = Math.max(...logw);
      const w = logw.map((l) => Math.exp(l - mx));
      const sum = w.reduce((a, b) => a + b, 0);
      pi = w.map((v) => v / sum);
      const yMax = Math.max(Math.max(...pRef), Math.max(...pi)) * 1.08;
      const Y = (p) => base - ((base - m.t) * p) / yMax;
      let dA = `M${X(0)} ${base}`;
      let dR = "";
      xs.forEach((x, i) => {
        dA += `L${X(x).toFixed(1)} ${Y(pi[i]).toFixed(1)}`;
        dR += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(pRef[i]).toFixed(1)}`;
      });
      areaPi.setAttribute("d", dA + `L${X(10)} ${base}Z`);
      lineRef.setAttribute("d", dR);
      let er = 0;
      let kl = 0;
      let hack = 0;
      xs.forEach((x, i) => {
        er += pi[i] * reward(x);
        if (pi[i] > 0) kl += pi[i] * Math.log(pi[i] / pRef[i]);
        if (x > 8.2) hack += pi[i];
      });
      bOut.textContent = beta.toFixed(2);
      bIn.value = Math.round(st.v);
      stats.innerHTML = `E[r] del RM&nbsp;&nbsp;= ${er.toFixed(2)}<br>KL(π‖π_ref) = ${kl.toFixed(2)}<br>en zona rara = <span class="${hack > 0.25 ? "ko-c" : ""}">${(hack * 100).toFixed(0)} %</span>`;
    }
    bIn.addEventListener("input", () => ((st.v = Number(bIn.value)), render()), { signal });
    slide.querySelectorAll("[data-b]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { v: Number(b.dataset.b), duration: 1, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    hit.addEventListener(
      "mousemove",
      (e) => {
        const p = Deck.svgPoint(s, e);
        const x = Math.min(10, Math.max(0, ((p.x - m.l) / (W - m.l - m.r)) * 10));
        const i = Math.round((x / 10) * (N - 1));
        hover.setAttribute("x1", X(xs[i]));
        hover.setAttribute("x2", X(xs[i]));
        hover.setAttribute("opacity", 1);
        tip.show(e, `π_ref ${(pRef[i] * 100).toFixed(2)} % · π ${(pi[i] * 100).toFixed(2)} % · r ${reward(xs[i]).toFixed(2)}`);
      },
      { signal },
    );
    hit.addEventListener("mouseleave", () => (hover.setAttribute("opacity", 0), tip.hide()), { signal });
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(s, { opacity: 0, duration: 0.5 }, 0);
    tl.to(st, { v: 60, duration: 1.8, ease: "power2.inOut", onUpdate: render }, 0.7);
    return { tl };
  };

  anims.fourmodels = Deck.simple([".grid-4 .card", ".grid-2 .callout"], { stagger: 0.14 });

  /* Chart: proxy reward keeps rising while true quality peaks and falls (illustrative). */
  anims.goodhart = function (slide, { signal }) {
    const W = 830;
    const H = 520;
    const stage = slide.querySelector("#gh-stage");
    const tip = Deck.tooltip(slide.querySelector("#gh-tip"), stage);
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" });
    stage.insertBefore(s, stage.firstChild);
    const m = { l: 56, r: 150, t: 50, b: 60 };
    const proxy = (x) => 0.95 * (1 - Math.exp(-x / 3.2));
    const gold = (x) => 1.05 * (1 - Math.exp(-x / 2.2)) - 0.075 * x;
    const X = (x) => m.l + ((W - m.l - m.r) * x) / 10;
    const Y = (v) => H - m.b - (H - m.t - m.b) * v;
    // legend (two series)
    svg("rect", { x: m.l, y: 10, width: 22, height: 4, rx: 2, fill: C.markA }, s);
    txt(s, m.l + 30, 18, "puntuación del reward model (proxy)", { fill: C.text2, "font-size": 16 });
    svg("rect", { x: m.l + 410, y: 10, width: 22, height: 4, rx: 2, fill: C.markB }, s);
    txt(s, m.l + 440, 18, "calidad real", { fill: C.text2, "font-size": 16 });
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => svg("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: C.line, "stroke-width": 1 }, s));
    svg("line", { x1: m.l, x2: W - m.r, y1: Y(0), y2: Y(0), stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    txt(s, (m.l + W - m.r) / 2, H - 18, "cuánto optimizamos (distancia KL desde el modelo inicial) →", { "text-anchor": "middle", fill: C.text2, "font-size": 16 });
    txt(s, m.l - 12, Y(1) + 5, "alta", { "text-anchor": "end", fill: C.muted, "font-size": 14 });
    txt(s, m.l - 12, Y(0) + 5, "baja", { "text-anchor": "end", fill: C.muted, "font-size": 14 });
    const path = (fn) => {
      let d = "";
      for (let i = 0; i <= 100; i++) {
        const x = i / 10;
        d += `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(fn(x)).toFixed(1)}`;
      }
      return d;
    };
    const pA = svg("path", { d: path(proxy), fill: "none", stroke: C.markA, "stroke-width": 3, "stroke-linecap": "round" }, s);
    const pB = svg("path", { d: path(gold), fill: "none", stroke: C.markB, "stroke-width": 3, "stroke-linecap": "round" }, s);
    const lA = txt(s, X(10) + 12, Y(proxy(10)) + 6, "proxy ↑", { fill: C.text, "font-size": 17, "font-weight": 600 });
    const lB = txt(s, X(10) + 12, Y(gold(10)) + 6, "real ↓", { fill: C.text, "font-size": 17, "font-weight": 600 });
    const xPk = 4.07;
    const peak = svg("g", {}, s);
    svg("line", { x1: X(xPk), x2: X(xPk), y1: Y(gold(xPk)) + 12, y2: Y(0), stroke: C.markB, "stroke-dasharray": "4 5", "stroke-width": 1.5 }, peak);
    svg("circle", { cx: X(xPk), cy: Y(gold(xPk)), r: 8, fill: C.markB, stroke: C.bg2, "stroke-width": 2 }, peak);
    txt(peak, X(xPk), Y(gold(xPk)) - 18, "aquí convendría parar", { "text-anchor": "middle", fill: C.text, "font-size": 16 });
    const zone = svg("rect", { x: X(xPk), y: m.t, width: X(10) - X(xPk), height: H - m.t - m.b, fill: "rgba(184,134,27,0.08)" }, s);
    s.insertBefore(zone, s.firstChild);
    const zl = txt(s, X(7.2), Y(0.08), "zona de reward hacking", { "text-anchor": "middle", fill: C.warm, "font-size": 16, "font-weight": 600 });

    const cross = svg("line", { y1: m.t, y2: H - m.b, stroke: C.lineStrong, "stroke-dasharray": "3 4", opacity: 0 }, s);
    const dA = svg("circle", { r: 6, fill: C.markA, stroke: C.bg2, "stroke-width": 2, opacity: 0 }, s);
    const dB = svg("circle", { r: 6, fill: C.markB, stroke: C.bg2, "stroke-width": 2, opacity: 0 }, s);
    const hit = svg("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, s);
    hit.addEventListener(
      "mousemove",
      (e) => {
        const p = Deck.svgPoint(s, e);
        const x = Math.min(10, Math.max(0, ((p.x - m.l) / (W - m.l - m.r)) * 10));
        [cross].forEach((el) => (el.setAttribute("x1", X(x)), el.setAttribute("x2", X(x)), el.setAttribute("opacity", 1)));
        dA.setAttribute("cx", X(x));
        dA.setAttribute("cy", Y(proxy(x)));
        dB.setAttribute("cx", X(x));
        dB.setAttribute("cy", Y(gold(x)));
        dA.setAttribute("opacity", 1);
        dB.setAttribute("opacity", 1);
        tip.show(e, `proxy ${proxy(x).toFixed(2)} · real ${gold(x).toFixed(2)}`);
      },
      { signal },
    );
    hit.addEventListener("mouseleave", () => ([cross, dA, dB].forEach((el) => el.setAttribute("opacity", 0)), tip.hide()), { signal });

    const tl = gsap.timeline({ paused: true });
    gsap.set([lA, lB, peak, zone, zl], { opacity: 0 });
    Deck.draw(tl, pA, 0.3, 2.2);
    Deck.draw(tl, pB, 0.3, 2.2);
    tl.to([lA, lB], { opacity: 1, duration: 0.4 }, 2.4);
    tl.to(peak, { opacity: 1, duration: 0.5 }, 2.7);
    tl.to([zone, zl], { opacity: 1, duration: 0.6 }, 3.1);
    tl.from(slide.querySelectorAll(".callout, ul li"), { opacity: 0, x: 16, stagger: 0.15, duration: 0.4 }, 0.4);
    return { tl };
  };

  anims.dpo = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".formula"), { opacity: 0, y: 14, duration: 0.6 }, 0);
    tl.from(slide.querySelectorAll(".pipe .stg"), { opacity: 0, x: -20, stagger: 0.3, duration: 0.5 }, 0.5);
    tl.from(slide.querySelectorAll("ul li"), { opacity: 0, x: 12, stagger: 0.15, duration: 0.4 }, 1.2);
    tl.from(slide.querySelectorAll("#dpo-json .ln"), { opacity: 0, x: 10, stagger: 0.08, duration: 0.3 }, 1.0);
    return { tl };
  };

  anims.onoff = Deck.simple([".grid-3 .card", ".callout"], { stagger: 0.18 });
})();
