/* Animations: context and "what is it" slides. */
(function () {
  const { anims, svg, colors: C } = window.DM;
  const DM = window.DM;

  /** Generic entrance: stagger the matched elements in order. */
  DM.simple = function (selectors, opts) {
    return function (slide) {
      const tl = gsap.timeline({ paused: true });
      const els = selectors.flatMap((s) => Array.from(slide.querySelectorAll(s)));
      tl.from(els, { opacity: 0, y: 26, duration: 0.6, stagger: (opts && opts.stagger) || 0.12, ease: "power3.out" });
      return { tl };
    };
  };

  /** Moves a glowing dot along an SVG path inside timeline `tl`. */
  DM.pulse = function (tl, parent, path, at, opts) {
    const o = Object.assign({ r: 6, color: C.cyan, duration: 0.9 }, opts);
    const dot = svg("circle", { r: o.r, fill: o.color, filter: "url(#glow)", opacity: 0, cx: -50, cy: -50 }, parent);
    const L = path.getTotalLength();
    const state = { t: 0 };
    tl.set(dot, { opacity: 1 }, at);
    tl.fromTo(
      state,
      { t: 0 },
      {
        t: 1,
        duration: o.duration,
        ease: "power1.inOut",
        onUpdate: () => {
          const p = path.getPointAtLength(state.t * L);
          dot.setAttribute("cx", p.x);
          dot.setAttribute("cy", p.y);
        },
      },
      at,
    );
    tl.set(dot, { opacity: 0 }, at + o.duration);
    return dot;
  };

  /** Draws a path progressively (stroke-dash). */
  DM.draw = function (tl, el, at, duration) {
    const L = el.getTotalLength();
    tl.fromTo(el, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: duration || 1, ease: "power2.inOut" }, at);
  };

  /* 1 · Cover */
  anims.cover = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".kicker"), { opacity: 0, x: -30, duration: 0.6 })
      .from(slide.querySelector("h1"), { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, 0.15)
      .from(slide.querySelector(".sub"), { opacity: 0, y: 20, duration: 0.7 }, 0.55)
      .from(slide.querySelectorAll(".names .tag"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 }, 0.85)
      .from(slide.querySelector(".replay-hint"), { opacity: 0, duration: 0.6 }, 1.6);
    return { tl };
  };

  /* 2 · LLM writes, software needs a decision */
  anims["chat-vs-code"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const typed = slide.querySelector("#cv-typed");
    const slot = slide.querySelector("#cv-slot");
    typed.textContent = "";
    slot.textContent = "???";
    const reply =
      "Parece que se trata de un problema relacionado con los pagos, así que probablemente el equipo de facturación sería el más adecuado, aunque también podría ser una incidencia técnica si el fallo viene de la integración…";
    tl.from(slide.querySelector(".cv-user"), { opacity: 0, y: 20, duration: 0.5 }, 0.2);
    tl.add(DM.type(typed, reply, 70), 0.8);
    tl.from(slide.querySelectorAll(".cv-problem"), { opacity: 0, x: 20, stagger: 0.5, duration: 0.5 }, 1.6);
    tl.addLabel("s0");
    tl.to(slide.querySelectorAll(".cv-problem"), { opacity: 0.35, duration: 0.4 });
    tl.fromTo(slide.querySelector("#cv-answer"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.4)" }, "<");
    // Text swap driven by a tweened value, so it also works backwards.
    const sw = { v: 0 };
    tl.to(sw, { v: 1, duration: 0.5, onUpdate: () => (slot.textContent = sw.v > 0.5 ? '"billing"  # p = 0.87' : "???") });
    tl.fromTo(slot, { opacity: 0.2 }, { opacity: 1, duration: 0.3, textShadow: "0 0 12px rgba(252,211,77,0.7)" });
    tl.addLabel("s1");
    return { tl };
  };

  /* 3 · System 1 / System 2 */
  anims.systems = function (slide) {
    const tl = gsap.timeline({ paused: true });
    // System 2: two slow interlocking gears
    const s2 = slide.querySelector("#sys2-icon");
    s2.innerHTML = "";
    const g2 = svg("svg", { viewBox: "0 0 160 160", width: 160, height: 160 }, s2);
    const gear = (cx, cy, r, teeth, color) => {
      const g = svg("g", { transform: `translate(${cx} ${cy})` }, g2);
      const inner = svg("g", {}, g);
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * 360;
        svg("rect", { x: -5, y: -r - 9, width: 10, height: 14, rx: 2, fill: color, transform: `rotate(${a})` }, inner);
      }
      svg("circle", { r, fill: "none", stroke: color, "stroke-width": 7 }, inner);
      svg("circle", { r: r * 0.3, fill: color, opacity: 0.5 }, inner);
      return inner;
    };
    const ga = gear(62, 62, 34, 10, C.orange);
    const gb = gear(112, 110, 24, 8, "rgba(251,146,60,0.6)");
    // System 1: a lightning bolt that flashes
    const s1 = slide.querySelector("#sys1-icon");
    s1.innerHTML = "";
    const g1 = svg("svg", { viewBox: "0 0 160 160", width: 160, height: 160 }, s1);
    DM.glowFilter(g1);
    const bolt = svg("path", { d: "M92 12 L44 88 L76 88 L62 148 L118 64 L84 64 Z", fill: C.cyan, filter: "url(#glow)" }, g1);

    tl.from(slide.querySelectorAll(".sys-card"), { opacity: 0, y: 30, stagger: 0.25, duration: 0.7 }, 0.1);
    tl.from(slide.querySelectorAll(".sys-q"), { opacity: 0, y: 20, stagger: 0.3, duration: 0.6 }, 1.1);
    tl.addLabel("s0");
    // Loops live outside the step timeline.
    const loops = [
      gsap.to(ga, { rotation: 360, svgOrigin: "0 0", duration: 9, repeat: -1, ease: "none" }),
      gsap.to(gb, { rotation: -360, svgOrigin: "0 0", duration: 6.2, repeat: -1, ease: "none" }),
      gsap.fromTo(bolt, { opacity: 0.35 }, { opacity: 1, duration: 0.08, repeat: -1, repeatDelay: 1.4, yoyo: true }),
    ];
    return { tl, destroy: () => loops.forEach((l) => l.kill()) };
  };

  /* 4 · Timeline */
  anims.timeline = function (slide) {
    const stage = slide.querySelector("#tl-stage");
    const W = 1424,
      H = 470;
    const s = DM.stageSvg(stage, W, H);
    const x = (day) => 70 + (day - 13) * 64; // September days; October 2 = day 32
    const Y = 235;
    const axis = svg("path", { d: `M${x(13)} ${Y} L${x(32.6)} ${Y}`, stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, s);
    const lit = svg("path", { d: `M${x(13)} ${Y} L${x(32.6)} ${Y}`, stroke: C.cyan, "stroke-width": 3, fill: "none", filter: "url(#glow)", opacity: 0.8 }, s);
    for (let d = 13; d <= 32; d++) {
      const label = d <= 30 ? `${d}` : `${d - 30}`;
      svg("line", { x1: x(d), x2: x(d), y1: Y - 6, y2: Y + 6, stroke: C.line, "stroke-width": 1.5, class: "tl-tick" }, s);
      if (d % 2 === 1 || d === 32) svg("text", { x: x(d), y: Y + 30, "text-anchor": "middle", fill: C.muted, "font-size": 15, "font-family": "JetBrains Mono", text: label, class: "tl-tick" }, s);
    }
    svg("text", { x: x(13), y: Y + 56, fill: C.muted, "font-size": 15, "font-family": "JetBrains Mono", text: "sep 2026", class: "tl-tick" }, s);
    svg("text", { x: x(31), y: Y + 56, fill: C.muted, "font-size": 15, "font-family": "JetBrains Mono", text: "oct", class: "tl-tick" }, s);

    const events = [
      { d: 15, name: "Jev", by: "TypeSafe · cerrado", note: "Define la categoría", color: C.orange, up: true },
      { d: 17, name: "Kev", by: "open source", note: "LLM Qwen + LoRA", color: C.cyan, up: false },
      { d: 18, name: "Laya", by: "open source", note: "Encoder compacto", color: C.cyan, up: true },
      { d: 21, name: "CLM", by: "open source", note: "Contrastivo", color: C.cyan, up: false },
      { d: 29, name: "Decisions API", by: "OpenAI · preview", note: "Sobre GPT-6 Luna", color: C.violet, up: true },
      { d: 32, name: "Hoy", by: "", note: "", color: C.text2, up: false, today: true },
    ];
    const tl = gsap.timeline({ paused: true });
    tl.from(s.querySelectorAll(".tl-tick"), { opacity: 0, duration: 0.4, stagger: 0.01 }, 0);
    DM.draw(tl, lit, 0.2, 2.6);
    events.forEach((e, i) => {
      const g = svg("g", {}, s);
      const cx = x(e.d);
      const dir = e.up ? -1 : 1;
      const stemEnd = Y + dir * (e.today ? 80 : 100);
      svg("line", { x1: cx, x2: cx, y1: e.up ? Y : Y + 40, y2: stemEnd, stroke: e.color, "stroke-width": 1.5, opacity: 0.6 }, g);
      const node = svg("circle", { cx, cy: Y, r: e.today ? 6 : 10, fill: C.bg, stroke: e.color, "stroke-width": 3, filter: "url(#glow)" }, g);
      const ty = e.up ? stemEnd - 70 : stemEnd + 34;
      if (e.today) {
        svg("text", { x: cx, y: stemEnd + 24, "text-anchor": "middle", fill: C.text2, "font-size": 19, "font-family": "JetBrains Mono", text: "hoy" }, g);
      } else {
        svg("text", { x: cx, y: ty, "text-anchor": "middle", fill: "#fff", "font-size": 34, "font-weight": 600, "font-family": "Space Grotesk", text: e.name }, g);
        svg("text", { x: cx, y: ty + 28, "text-anchor": "middle", fill: e.color, "font-size": 16, "font-family": "JetBrains Mono", text: e.by }, g);
        svg("text", { x: cx, y: ty + 52, "text-anchor": "middle", fill: C.text2, "font-size": 17, "font-family": "Inter", text: e.note }, g);
      }
      const at = 0.3 + ((e.d - 13) / 20) * 2.6;
      tl.from(g, { opacity: 0, y: dir * 16, duration: 0.5, ease: "back.out(1.6)" }, at);
      tl.from(node, { attr: { r: 0 }, duration: 0.4 }, at);
    });
    // Bracket over the open-source burst
    const br = svg("path", { d: `M${x(16.4)} ${Y + 198} L${x(16.4)} ${Y + 208} L${x(21.6)} ${Y + 208} L${x(21.6)} ${Y + 198}`, stroke: C.cyan, fill: "none", "stroke-width": 1.5, opacity: 0.7 }, s);
    const brt = svg("text", { x: x(19), y: Y + 230, "text-anchor": "middle", fill: C.cyan, "font-size": 16, "font-family": "JetBrains Mono", text: "3 alternativas abiertas en 6 días" }, s);
    tl.from([br, brt], { opacity: 0, duration: 0.6 }, 2.2);
    tl.from(slide.querySelectorAll(".tl-phases > div"), { opacity: 0, y: 20, stagger: 0.25, duration: 0.6 }, 2.8);
    return { tl };
  };

  /* 5 · The contract */
  anims.contract = function (slide) {
    const stage = slide.querySelector("#ct-stage");
    const s = DM.stageSvg(stage, 1424, 300);
    const tl = gsap.timeline({ paused: true });
    const chip = (x0, y0, w, h, label, sub, color) => {
      const g = svg("g", {}, s);
      svg("rect", { x: x0, y: y0, width: w, height: h, rx: 16, fill: "rgba(148,163,184,0.06)", stroke: color, "stroke-width": 1.5 }, g);
      svg("text", { x: x0 + 24, y: y0 + 40, fill: "#fff", "font-size": 26, "font-weight": 600, "font-family": "Space Grotesk", text: label }, g);
      svg("text", { x: x0 + 24, y: y0 + 68, fill: C.text2, "font-size": 16, "font-family": "JetBrains Mono", text: sub }, g);
      return g;
    };
    const gState = chip(30, 30, 320, 92, "estado", '"Help! My payouts…"', C.violet);
    const gQ = chip(30, 170, 320, 92, "preguntas", "choice · score · noul", C.cyan);
    // Model box
    const gM = svg("g", {}, s);
    const box = svg("rect", { x: 540, y: 60, width: 320, height: 180, rx: 22, fill: "rgba(34,211,238,0.06)", stroke: C.cyan, "stroke-width": 2 }, gM);
    svg("text", { x: 700, y: 140, "text-anchor": "middle", fill: "#fff", "font-size": 30, "font-weight": 600, "font-family": "Space Grotesk", text: "Modelo de decisión" }, gM);
    svg("text", { x: 700, y: 176, "text-anchor": "middle", fill: C.cyan, "font-size": 17, "font-family": "JetBrains Mono", text: "una sola pasada" }, gM);
    // Output
    const gO = svg("g", {}, s);
    svg("rect", { x: 1050, y: 40, width: 350, height: 220, rx: 18, fill: "rgba(148,163,184,0.06)", stroke: C.lineStrong, "stroke-width": 1.5 }, gO);
    svg("text", { x: 1074, y: 80, fill: "#fff", "font-size": 24, "font-weight": 600, "font-family": "Space Grotesk", text: "respuestas" }, gO);
    const bars = [
      ["billing", 0.87],
      ["technical", 0.13],
      ["sales", 0.0],
    ];
    const fills = bars.map(([lbl, v], i) => {
      const y = 110 + i * 46;
      svg("text", { x: 1074, y: y + 15, fill: C.text2, "font-size": 16, "font-family": "JetBrains Mono", text: lbl }, gO);
      svg("rect", { x: 1180, y, width: 160, height: 16, rx: 4, fill: "rgba(148,163,184,0.12)" }, gO);
      svg("text", { x: 1352, y: y + 15, fill: C.text, "font-size": 16, "font-family": "JetBrains Mono", text: v.toFixed(2) }, gO);
      return svg("rect", { x: 1180, y, width: 0, height: 16, rx: 4, fill: i === 0 ? C.cyan : C.markDm, "data-w": 160 * v }, gO);
    });
    const w1 = svg("path", { d: "M350 76 C 450 76, 450 130, 540 130", stroke: C.line, "stroke-width": 2, fill: "none" }, s);
    const w2 = svg("path", { d: "M350 216 C 450 216, 450 170, 540 170", stroke: C.line, "stroke-width": 2, fill: "none" }, s);
    const w3 = svg("path", { d: "M860 150 L1050 150", stroke: C.line, "stroke-width": 2, fill: "none" }, s);

    tl.from(gState, { opacity: 0, x: -40, duration: 0.6 }, 0.1);
    tl.from(gQ, { opacity: 0, x: -40, duration: 0.6 }, 0.3);
    tl.from(gM, { opacity: 0, scale: 0.9, transformOrigin: "700px 150px", duration: 0.6 }, 0.5);
    DM.draw(tl, w1, 0.9, 0.5);
    DM.draw(tl, w2, 0.9, 0.5);
    DM.pulse(tl, s, w1, 1.3, { color: C.violet });
    DM.pulse(tl, s, w2, 1.3, { color: C.cyan });
    tl.to(box, { attr: { fill: "rgba(34,211,238,0.18)" }, duration: 0.25, yoyo: true, repeat: 1 }, 2.1);
    DM.draw(tl, w3, 2.4, 0.4);
    DM.pulse(tl, s, w3, 2.5, { color: C.cyan, duration: 0.5 });
    tl.from(gO, { opacity: 0, x: 30, duration: 0.5 }, 2.8);
    fills.forEach((f, i) => tl.to(f, { attr: { width: f.getAttribute("data-w") }, duration: 0.8, ease: "power3.out" }, 3.0 + i * 0.1));
    tl.from(slide.querySelectorAll(".ct-cols .card"), { opacity: 0, y: 24, stagger: 0.18, duration: 0.6 }, 3.2);
    return { tl };
  };

  /* 6 · Primitives */
  anims.primitives = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".prim-card"), { opacity: 0, y: 30, stagger: 0.2, duration: 0.6 }, 0.1);
    DM.fillBars(tl, slide.querySelector("#pr-choice"), 0.8);

    // Score: three ordered levels, probability columns and a marker at 1.04
    const sc = slide.querySelector("#pr-score");
    sc.innerHTML = "";
    DM.glowFilter(sc);
    const lv = ["Calm", "Frustrated", "Very angry"];
    const pv = [0, 0.96, 0.04];
    const lx = (i) => 50 + i * 150;
    svg("line", { x1: 40, x2: 360, y1: 110, y2: 110, stroke: C.lineStrong, "stroke-width": 2 }, sc);
    const cols = lv.map((l, i) => {
      svg("circle", { cx: lx(i), cy: 110, r: 4, fill: C.muted }, sc);
      svg("text", { x: lx(i), y: 138, "text-anchor": "middle", fill: C.text2, "font-size": 15, "font-family": "JetBrains Mono", text: `${i} · ${l}` }, sc);
      return svg("rect", { x: lx(i) - 18, y: 104, width: 36, height: 0, rx: 4, fill: i === 1 ? C.cyan : C.markDm, "data-h": pv[i] * 80 }, sc);
    });
    const marker = svg("g", { transform: `translate(${lx(0)} 0)` }, sc);
    svg("path", { d: "M0 6 L-8 -8 L8 -8 Z", transform: "translate(0 8)", fill: "#fff" }, marker);
    svg("text", { x: 0, y: -4, "text-anchor": "middle", fill: "#fff", "font-size": 16, "font-family": "JetBrains Mono", text: "1.04" }, marker);
    cols.forEach((c, i) => tl.to(c, { attr: { height: c.getAttribute("data-h"), y: 104 - c.getAttribute("data-h") }, duration: 0.8, ease: "power3.out" }, 1.0 + i * 0.1));
    tl.to(marker, { attr: { transform: `translate(${lx(1.04)} 0)` }, duration: 1.2, ease: "power2.inOut" }, 1.2);

    // Noul: semicircle gauge, needle to 0.95
    const nu = slide.querySelector("#pr-noul");
    nu.innerHTML = "";
    DM.glowFilter(nu);
    const cx = 200,
      cy = 140,
      R = 110;
    const arc = (a0, a1) => {
      const p = (a) => [cx + R * Math.cos(Math.PI * (1 - a)), cy - R * Math.sin(Math.PI * (1 - a))];
      const [x0, y0] = p(a0),
        [x1, y1] = p(a1);
      return `M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`;
    };
    svg("path", { d: arc(0, 1), stroke: "rgba(148,163,184,0.18)", "stroke-width": 16, fill: "none", "stroke-linecap": "round" }, nu);
    const val = svg("path", { d: arc(0, 0.95), stroke: C.cyan, "stroke-width": 16, fill: "none", "stroke-linecap": "round", filter: "url(#glow)" }, nu);
    svg("text", { x: cx - R, y: cy + 26, "text-anchor": "middle", fill: C.text2, "font-size": 15, "font-family": "JetBrains Mono", text: "no · 0" }, nu);
    svg("text", { x: cx + R, y: cy + 26, "text-anchor": "middle", fill: C.text2, "font-size": 15, "font-family": "JetBrains Mono", text: "sí · 1" }, nu);
    const num = svg("text", { x: cx, y: cy - 10, "text-anchor": "middle", fill: "#fff", "font-size": 44, "font-weight": 700, "font-family": "Space Grotesk", text: "0.00" }, nu);
    DM.draw(tl, val, 1.0, 1.4);
    const o = { v: 0 };
    tl.to(o, { v: 0.95, duration: 1.4, ease: "power2.inOut", onUpdate: () => (num.textContent = o.v.toFixed(2)) }, 1.0);
    return { tl };
  };

  /* 7 · Real request / response */
  anims.api = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const req = slide.querySelectorAll("#api-req .ln");
    const res = slide.querySelectorAll("#api-res .ln");
    res.forEach((l) => {
      l.classList.toggle("hl", /"(probabilities|noul|score|choice)":/.test(l.textContent));
    });
    const wire = slide.querySelector("#api-wire");
    wire.innerHTML = "";
    DM.glowFilter(wire);
    const path = svg("path", { d: "M10 300 L140 300", stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, wire);
    svg("path", { d: "M128 290 L142 300 L128 310", stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, wire);
    const t1 = svg("text", { x: 75, y: 280, "text-anchor": "middle", fill: C.cyan, "font-size": 15, "font-family": "JetBrains Mono", text: "1 llamada" }, wire);
    const t2 = svg("text", { x: 75, y: 330, "text-anchor": "middle", fill: C.muted, "font-size": 14, "font-family": "JetBrains Mono", text: "70–500 ms" }, wire);

    tl.from(req, { opacity: 0, x: -10, stagger: 0.04, duration: 0.25 }, 0.1);
    tl.from([path, t1, t2], { opacity: 0, duration: 0.4 }, 1.2);
    DM.pulse(tl, wire, path, 1.4, { color: C.cyan, r: 7, duration: 0.6 });
    DM.pulse(tl, wire, path, 1.6, { color: C.violet, r: 5, duration: 0.6 });
    tl.from(res, { opacity: 0, x: 10, stagger: 0.04, duration: 0.25 }, 2.1);
    tl.from(slide.querySelectorAll("#api-res .hl"), { backgroundColor: "rgba(34,211,238,0)", boxShadow: "0 0 0 0 rgba(34,211,238,0)", duration: 0.6, stagger: 0.1 }, 3.0);
    return { tl };
  };
})();
