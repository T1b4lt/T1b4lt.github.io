/* Animations: training and calibration slides (several are interactive). */
(function () {
  const DM = window.DM;
  const { anims, svg, colors: C } = DM;
  const MONO = "JetBrains Mono";

  /* 12 · Training recipe */
  anims.recipe = function (slide) {
    const s = DM.stageSvg(slide.querySelector("#rc-stage"), 1424, 110);
    const tl = gsap.timeline({ paused: true });
    const xs = [229, 712, 1195];
    svg("path", { d: `M${xs[0]} 55 L${xs[2]} 55`, stroke: C.line, "stroke-width": 2 }, s);
    const lit = svg("path", { d: `M${xs[0]} 55 L${xs[2]} 55`, stroke: C.cyan, "stroke-width": 3, filter: "url(#glow)" }, s);
    const icons = [
      // book
      (g) => {
        svg("path", { d: "M-22 -14 Q-11 -20 0 -14 Q11 -20 22 -14 L22 16 Q11 10 0 16 Q-11 10 -22 16 Z", fill: "none", stroke: C.text, "stroke-width": 2 }, g);
        svg("path", { d: "M0 -14 L0 16", stroke: C.text, "stroke-width": 2 }, g);
      },
      // target
      (g) => {
        [20, 12, 4].forEach((rr) => svg("circle", { r: rr, fill: "none", stroke: C.text, "stroke-width": 2 }, g));
      },
      // balance scale
      (g) => {
        svg("path", { d: "M0 -18 L0 16 M-14 16 L14 16 M-22 -10 L22 -10 M-22 -10 L-28 4 L-16 4 Z M22 -10 L16 4 L28 4 Z", fill: "none", stroke: C.text, "stroke-width": 2, "stroke-linejoin": "round" }, g);
      },
    ];
    const nodes = xs.map((x, i) => {
      const g = svg("g", { transform: `translate(${x} 55)` }, s);
      svg("circle", { r: 40, fill: C.bg2, stroke: i === 2 ? C.cyan : C.lineStrong, "stroke-width": 2, filter: i === 2 ? "url(#glow)" : "" }, g);
      icons[i](g);
      return g;
    });
    DM.draw(tl, lit, 0.3, 2.0);
    nodes.forEach((g, i) => tl.from(g, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(1.8)" }, 0.2 + i * 0.9));
    tl.from(slide.querySelectorAll(".rc-card"), { opacity: 0, y: 30, stagger: 0.9, duration: 0.6 }, 0.4);
    return { tl };
  };

  /* 13 · RLHF / RLVR / RLCD */
  anims.rl3 = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".rl-table thead th"), { opacity: 0, y: -10, stagger: 0.1, duration: 0.4 }, 0.1);
    tl.from(slide.querySelectorAll(".rl-table tbody tr"), { opacity: 0, y: 16, stagger: 0.35, duration: 0.5 }, 0.5);
    tl.from(slide.querySelectorAll(".rl-hl"), { backgroundColor: "rgba(34,211,238,0)", duration: 0.8, stagger: 0.1 }, 1.8);
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 20, duration: 0.6 }, 2.2);
    return { tl };
  };

  /* 14 · The honest bet (Brier score is strictly proper) */
  anims["honest-bet"] = function (slide, { signal }) {
    const svgEl = slide.querySelector("#hb-chart");
    svgEl.innerHTML = "";
    DM.glowFilter(svgEl);
    const W = 760,
      H = 520,
      m = { l: 76, r: 24, t: 24, b: 70 };
    const X = (p) => m.l + p * (W - m.l - m.r);
    const Y = (v) => H - m.b - v * (H - m.t - m.b);
    // Recessive grid and axes
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
      svg("line", { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), stroke: "rgba(148,163,184,0.1)" }, svgEl);
      svg("text", { x: X(0) - 12, y: Y(v) + 5, "text-anchor": "end", fill: C.muted, "font-size": 15, "font-family": MONO, text: v.toFixed(2) }, svgEl);
    });
    [0, 0.25, 0.5, 0.75, 1].forEach((p) => svg("text", { x: X(p), y: H - m.b + 26, "text-anchor": "middle", fill: C.muted, "font-size": 15, "font-family": MONO, text: `${p * 100} %` }, svgEl));
    svg("line", { x1: X(0), x2: X(1), y1: Y(0), y2: Y(0), stroke: C.lineStrong }, svgEl);
    svg("text", { x: (X(0) + X(1)) / 2, y: H - 12, "text-anchor": "middle", fill: C.text2, "font-size": 17, "font-family": "Inter", text: "probabilidad que anuncias" }, svgEl);
    svg("text", { x: 18, y: Y(0.5), "text-anchor": "middle", fill: C.text2, "font-size": 17, "font-family": "Inter", transform: `rotate(-90 18 ${Y(0.5)})`, text: "penalización media" }, svgEl);

    const curve = svg("path", { fill: "none", stroke: C.markDm, "stroke-width": 3, "stroke-linecap": "round" }, svgEl);
    const minG = svg("g", {}, svgEl);
    const minDot = svg("path", { d: "M0 -8 L8 0 L0 8 L-8 0 Z", fill: C.bg2, stroke: C.text, "stroke-width": 2 }, minG);
    const minTxt = svg("text", { x: 0, y: 30, "text-anchor": "middle", fill: C.text, "font-size": 15, "font-family": MONO, text: "mínimo: decir la verdad" }, minG);
    const vline = svg("line", { stroke: C.cyan, "stroke-width": 1.5, "stroke-dasharray": "5 5" }, svgEl);
    const dot = svg("circle", { r: 9, fill: C.cyan, stroke: C.bg2, "stroke-width": 2, filter: "url(#glow)" }, svgEl);
    const dotTxt = svg("text", { "text-anchor": "middle", fill: "#fff", "font-size": 16, "font-family": MONO }, svgEl);
    const hit = svg("rect", { x: X(0), y: Y(1), width: X(1) - X(0), height: Y(0) - Y(1), fill: "transparent" }, svgEl);

    const qIn = slide.querySelector("#hb-q"),
      pIn = slide.querySelector("#hb-p");
    const loss = (p, q) => q * (1 - p) ** 2 + (1 - q) * p ** 2;
    const state = { p: 1, q: 0.7 };
    function render() {
      const { p, q } = state;
      let d = "";
      for (let i = 0; i <= 100; i++) {
        const pp = i / 100;
        d += `${i ? "L" : "M"}${X(pp).toFixed(1)} ${Y(loss(pp, q)).toFixed(1)} `;
      }
      curve.setAttribute("d", d);
      minG.setAttribute("transform", `translate(${X(q)} ${Y(loss(q, q))})`);
      const l = loss(p, q);
      vline.setAttribute("x1", X(p));
      vline.setAttribute("x2", X(p));
      vline.setAttribute("y1", Y(0));
      vline.setAttribute("y2", Y(l));
      dot.setAttribute("cx", X(p));
      dot.setAttribute("cy", Y(l));
      dotTxt.setAttribute("x", Math.min(Math.max(X(p), X(0) + 60), X(1) - 60));
      dotTxt.setAttribute("y", Y(l) - 20);
      dotTxt.textContent = `tú: ${l.toFixed(3)}`;
      minTxt.setAttribute("opacity", Math.abs(p - q) < 0.04 ? 0 : 1);
      slide.querySelector("#hb-loss").textContent = l.toFixed(3);
      slide.querySelector("#hb-min").textContent = loss(q, q).toFixed(3);
      slide.querySelector("#hb-q-txt").textContent = `${Math.round(q * 100)} %`;
      slide.querySelector("#hb-q-out").textContent = `${Math.round(q * 100)} %`;
      slide.querySelector("#hb-p-out").textContent = `${Math.round(p * 100)} %`;
      qIn.value = Math.round(q * 100);
      pIn.value = Math.round(p * 100);
    }
    qIn.addEventListener("input", () => ((state.q = qIn.value / 100), render()), { signal });
    pIn.addEventListener("input", () => ((state.p = pIn.value / 100), render()), { signal });
    slide.querySelectorAll("[data-p]").forEach((b) =>
      b.addEventListener(
        "click",
        () => {
          const target = b.dataset.p === "q" ? state.q : parseInt(b.dataset.p, 10) / 100;
          gsap.to(state, { p: target, duration: 0.8, ease: "power2.inOut", onUpdate: render });
        },
        { signal },
      ),
    );
    const tip = DM.tooltip(slide.querySelector("#hb-tip"), svgEl.parentElement);
    hit.addEventListener(
      "mousemove",
      (e) => {
        const pt = svgEl.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const loc = pt.matrixTransform(svgEl.getScreenCTM().inverse());
        const pp = Math.min(1, Math.max(0, (loc.x - X(0)) / (X(1) - X(0))));
        tip.show(e, `anuncias ${Math.round(pp * 100)} % → penalización ${loss(pp, state.q).toFixed(3)}`);
      },
      { signal },
    );
    hit.addEventListener("mouseleave", () => tip.hide(), { signal });

    state.p = 1;
    state.q = 0.7;
    render();
    const tl = gsap.timeline({ paused: true });
    DM.draw(tl, curve, 0.2, 1.2);
    tl.from([dot, vline, dotTxt, minG], { opacity: 0, duration: 0.4 }, 1.3);
    tl.to(state, { p: 0.5, duration: 1.4, ease: "power2.inOut", onUpdate: render }, 2.2);
    tl.to(state, { p: 0.7, duration: 1.2, ease: "power2.inOut", onUpdate: render }, 4.0);
    // DM.draw leaves a dash array sized for the first curve; clear it so later shapes are not clipped.
    tl.set(curve, { strokeDasharray: "none" }, 1.45);
    return { tl };
  };

  /* 15 · Temperature scaling */
  anims.temperature = function (slide, { signal }) {
    const scores = [4.0, 0.6, -0.2];
    const fills = slide.querySelectorAll("#tp-bars .fill");
    const vals = slide.querySelectorAll("#tp-bars .val");
    const tIn = slide.querySelector("#tp-t");
    const out = slide.querySelector("#tp-t-out");
    const st = { t: 1 };
    function render() {
      const p = DM.softmax(scores, st.t);
      p.forEach((v, i) => {
        fills[i].style.width = `${(v * 100).toFixed(1)}%`;
        vals[i].textContent = v.toFixed(2);
      });
      out.textContent = st.t.toFixed(2);
      tIn.value = Math.round(st.t * 100);
    }
    tIn.addEventListener("input", () => ((st.t = tIn.value / 100), render()), { signal });
    slide.querySelectorAll("[data-t]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { t: parseInt(b.dataset.t, 10) / 100, duration: 1, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    st.t = 1;
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll("#tp-bars > *"), { opacity: 0, duration: 0.4, stagger: 0.03 }, 0.1);
    tl.to(st, { t: 2.35, duration: 2.0, ease: "power2.inOut", onUpdate: render }, 1.4);
    return { tl };
  };

  /* 16 · Reliability diagram (illustrative synthetic data) */
  anims.reliability = function (slide, { signal }) {
    const el = slide.querySelector("#rl-chart");
    el.innerHTML = "";
    DM.glowFilter(el);
    const W = 820,
      H = 600,
      m = { l: 84, r: 30, t: 70, b: 76 };
    const X = (v) => m.l + v * (W - m.l - m.r);
    const Y = (v) => H - m.b - v * (H - m.t - m.b);
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach((v) => {
      svg("line", { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), stroke: "rgba(148,163,184,0.1)" }, el);
      svg("text", { x: X(0) - 12, y: Y(v) + 5, "text-anchor": "end", fill: C.muted, "font-size": 15, "font-family": MONO, text: `${v * 100} %` }, el);
      svg("text", { x: X(v), y: H - m.b + 26, "text-anchor": "middle", fill: C.muted, "font-size": 15, "font-family": MONO, text: `${v * 100} %` }, el);
    });
    svg("line", { x1: X(0), x2: X(1), y1: Y(0), y2: Y(0), stroke: C.lineStrong }, el);
    svg("text", { x: (X(0) + X(1)) / 2, y: H - 14, "text-anchor": "middle", fill: C.text2, "font-size": 17, "font-family": "Inter", text: "confianza que declara el modelo" }, el);
    svg("text", { x: 20, y: Y(0.5), "text-anchor": "middle", fill: C.text2, "font-size": 17, "font-family": "Inter", transform: `rotate(-90 20 ${Y(0.5)})`, text: "aciertos reales" }, el);

    const diag = svg("path", { d: `M${X(0)} ${Y(0)} L${X(1)} ${Y(1)}`, stroke: C.text2, "stroke-width": 1.5, "stroke-dasharray": "6 6", fill: "none" }, el);
    const diagTxt = svg("text", { x: X(0.3), y: Y(0.3) - 16, fill: C.text2, "font-size": 15, "font-family": MONO, transform: `rotate(-38 ${X(0.3)} ${Y(0.3) - 16})`, text: "calibración perfecta" }, el);

    const xs = [0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95];
    const over = [0.3, 0.36, 0.42, 0.47, 0.53, 0.6, 0.68];
    const cal = [0.36, 0.44, 0.56, 0.64, 0.76, 0.84, 0.93];
    const pathOf = (ys) => xs.map((x, i) => `${i ? "L" : "M"}${X(x)} ${Y(ys[i])}`).join(" ");
    // Gap between the overconfident model and the diagonal
    const gap = svg("path", { d: `${pathOf(xs)} ${xs.slice().reverse().map((x, i) => `L${X(x)} ${Y(over[xs.length - 1 - i])}`).join(" ")} Z`, fill: "rgba(232,89,12,0.12)" }, el);
    const gapTxt = svg("g", {}, el);
    svg("line", { x1: X(0.8), x2: X(0.8), y1: Y(0.45), y2: Y(0.68), stroke: C.text2, "stroke-width": 1.2 }, gapTxt);
    svg("text", { x: X(0.8), y: Y(0.45) + 22, "text-anchor": "middle", fill: C.text, "font-size": 15, "font-family": MONO, text: "exceso de confianza" }, gapTxt);
    const lOver = svg("path", { d: pathOf(over), stroke: C.markLlm, "stroke-width": 2.5, fill: "none" }, el);
    const lCal = svg("path", { d: pathOf(cal), stroke: C.markDm, "stroke-width": 2.5, fill: "none" }, el);
    const tip = DM.tooltip(slide.querySelector("#rl-tip"), el.parentElement);
    const marks = (ys, color, name) =>
      xs.map((x, i) => {
        const c = svg("circle", { cx: X(x), cy: Y(ys[i]), r: 8, fill: color, stroke: C.bg2, "stroke-width": 2 }, el);
        const hit = svg("circle", { cx: X(x), cy: Y(ys[i]), r: 18, fill: "transparent" }, el);
        hit.addEventListener("mousemove", (e) => tip.show(e, `${name}: dice ${Math.round(x * 100)} % · acierta ${Math.round(ys[i] * 100)} %`), { signal });
        hit.addEventListener("mouseleave", () => tip.hide(), { signal });
        return c;
      });
    const mOver = marks(over, C.markLlm, "Sobreconfiado");
    const mCal = marks(cal, C.markDm, "Calibrado");
    // Legend (always present for two series) + direct labels at the line ends
    const leg = svg("g", { transform: `translate(${X(0)} 26)` }, el);
    svg("circle", { cx: 8, cy: 0, r: 7, fill: C.markLlm }, leg);
    svg("text", { x: 24, y: 5, fill: C.text, "font-size": 16, "font-family": "Inter", text: "Modelo sobreconfiado (típico de un LLM tras RLHF)" }, leg);
    svg("circle", { cx: 8, cy: 26, r: 7, fill: C.markDm }, leg);
    svg("text", { x: 24, y: 31, fill: C.text, "font-size": 16, "font-family": "Inter", text: "Modelo de decisión calibrado" }, leg);
    const lbOver = svg("text", { x: X(0.95) + 14, y: Y(0.68) + 5, fill: C.text, "font-size": 15, "font-family": MONO, text: "68 %" }, el);
    const lbCal = svg("text", { x: X(0.95) - 14, y: Y(0.93) - 14, "text-anchor": "end", fill: C.text, "font-size": 15, "font-family": MONO, text: "93 %" }, el);

    const tl = gsap.timeline({ paused: true });
    DM.draw(tl, diag, 0.2, 0.8);
    tl.from(diagTxt, { opacity: 0, duration: 0.4 }, 0.9);
    tl.from(leg, { opacity: 0, duration: 0.4 }, 0.9);
    DM.draw(tl, lOver, 1.3, 1.0);
    tl.from(mOver, { opacity: 0, scale: 0, transformOrigin: "50% 50%", stagger: 0.08, duration: 0.3 }, 1.4);
    tl.from(lbOver, { opacity: 0, duration: 0.3 }, 2.2);
    tl.from([gap, gapTxt], { opacity: 0, duration: 0.6 }, 2.4);
    DM.draw(tl, lCal, 3.2, 1.0);
    tl.from(mCal, { opacity: 0, scale: 0, transformOrigin: "50% 50%", stagger: 0.08, duration: 0.3 }, 3.3);
    tl.from(lbCal, { opacity: 0, duration: 0.3 }, 4.1);
    return { tl };
  };

  /* 17 · Confidence explorer */
  anims.confidence = function (slide, { signal }) {
    const ins = [0, 1, 2].map((i) => slide.querySelector(`#cf-${i}`));
    const outs = [0, 1, 2].map((i) => slide.querySelector(`#cf-${i}-out`));
    const names = ["billing", "technical", "sales"];
    const el = slide.querySelector("#cf-chart");
    el.innerHTML = "";
    DM.glowFilter(el);
    const bw = 140,
      gap = 90,
      base = 210,
      maxH = 170;
    const bars = names.map((n, i) => {
      const x = 60 + i * (bw + gap);
      svg("rect", { x, y: base - maxH, width: bw, height: maxH, rx: 4, fill: "rgba(148,163,184,0.06)" }, el);
      const b = svg("rect", { x, y: base, width: bw, height: 0, rx: 4, fill: C.markDm }, el);
      const v = svg("text", { x: x + bw / 2, y: base - 8, "text-anchor": "middle", fill: C.text, "font-size": 18, "font-family": MONO }, el);
      svg("text", { x: x + bw / 2, y: base + 30, "text-anchor": "middle", fill: C.text2, "font-size": 17, "font-family": MONO, text: n }, el);
      return { b, v };
    });
    // even-split reference line (1/n)
    const ev = base - maxH / 3;
    svg("line", { x1: 40, x2: 680, y1: ev, y2: ev, stroke: C.text2, "stroke-dasharray": "4 6", "stroke-width": 1.2 }, el);
    svg("text", { x: 684, y: ev + 5, fill: C.muted, "font-size": 13, "font-family": MONO, text: "1/3", "text-anchor": "end" }, el);

    const st = { p: [80, 15, 5] };
    const lane = slide.querySelector("#cf-lane");
    function render() {
      const sum = st.p.reduce((a, b) => a + b, 0) || 1;
      const p = st.p.map((v) => v / sum);
      const top = p.indexOf(Math.max(...p));
      p.forEach((v, i) => {
        const h = v * maxH;
        bars[i].b.setAttribute("y", base - h);
        bars[i].b.setAttribute("height", h);
        bars[i].b.setAttribute("fill", i === top ? C.cyan : C.markDm);
        bars[i].b.setAttribute("filter", i === top ? "url(#glow)" : "");
        bars[i].v.setAttribute("y", base - h - 10);
        bars[i].v.textContent = v.toFixed(2);
        outs[i].textContent = `${Math.round(v * 100)} %`;
        ins[i].value = Math.round(v * 100);
      });
      const c = DM.choiceConfidence(p);
      slide.querySelector("#cf-val").textContent = c.toFixed(2);
      let html;
      if (c >= 0.8) html = `<span style="color:var(--good)">✓ Actuar automáticamente</span> <span class="muted">· confianza ≥ 0,8</span>`;
      else if (c >= 0.5) html = `<span style="color:var(--warn)">⚠ Pedir confirmación</span> <span class="muted">· entre 0,5 y 0,8</span>`;
      else html = `<span style="color:var(--bad)">✋ Escalar a una persona</span> <span class="muted">· por debajo de 0,5</span>`;
      lane.innerHTML = html;
    }
    ins.forEach((inp, i) =>
      inp.addEventListener(
        "input",
        () => {
          // Keep the total at 100 by rescaling the other two options.
          const v = parseFloat(inp.value);
          const others = [0, 1, 2].filter((j) => j !== i);
          const rest = st.p[others[0]] + st.p[others[1]];
          const remain = 100 - v;
          st.p[i] = v;
          others.forEach((j) => (st.p[j] = rest > 0 ? (remain * st.p[j]) / rest : remain / 2));
          render();
        },
        { signal },
      ),
    );
    slide.querySelectorAll("[data-preset]").forEach((b) =>
      b.addEventListener(
        "click",
        () => {
          const target = b.dataset.preset.split(",").map(Number);
          gsap.to(st.p, { 0: target[0], 1: target[1], 2: target[2], duration: 0.8, ease: "power2.inOut", onUpdate: render });
        },
        { signal },
      ),
    );
    st.p = [34, 33, 33];
    render();
    const tl = gsap.timeline({ paused: true });
    tl.to(st.p, { 0: 80, 1: 15, 2: 5, duration: 1.6, ease: "power2.inOut", onUpdate: render }, 0.5);
    return { tl };
  };
})();
