/* Animations: advantages, practice and closing slides. */
(function () {
  const DM = window.DM;
  const { anims, svg, colors: C } = DM;
  const MONO = "JetBrains Mono";

  /* 18 · vs LLM */
  anims["vs-llm"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".vs-table thead th"), { opacity: 0, duration: 0.4, stagger: 0.1 }, 0.1);
    slide.querySelectorAll(".vs-table tbody tr").forEach((tr, i) => {
      const [a, b, c] = tr.children;
      tl.from(a, { opacity: 0, x: -14, duration: 0.35 }, 0.4 + i * 0.32);
      tl.from(b, { opacity: 0, duration: 0.35 }, 0.5 + i * 0.32);
      tl.from(c, { opacity: 0, x: 14, duration: 0.35 }, 0.6 + i * 0.32);
    });
    return { tl };
  };

  /* 19 · vs classic classifier: a spectrum */
  anims["vs-classifier"] = function (slide) {
    const s = DM.stageSvg(slide.querySelector("#vc-stage"), 1424, 120);
    const defs = s.querySelector("defs");
    const grad = svg("linearGradient", { id: "vc-grad", x1: "0", x2: "1", y1: "0", y2: "0" }, defs);
    svg("stop", { offset: "0", "stop-color": "#64748b" }, grad);
    svg("stop", { offset: "0.5", "stop-color": C.cyan }, grad);
    svg("stop", { offset: "1", "stop-color": C.orange }, grad);
    const bar = svg("rect", { x: 40, y: 52, width: 1344, height: 8, rx: 4, fill: "url(#vc-grad)", opacity: 0.85 }, s);
    svg("text", { x: 40, y: 34, fill: C.text2, "font-size": 17, "font-family": MONO, text: "← especializado · rápido · barato" }, s);
    svg("text", { x: 1384, y: 34, "text-anchor": "end", fill: C.text2, "font-size": 17, "font-family": MONO, text: "generalista · lento · caro →" }, s);
    const xs = [219, 712, 1205];
    const dots = xs.map((x, i) => svg("circle", { cx: x, cy: 56, r: i === 1 ? 14 : 9, fill: i === 1 ? C.cyan : C.bg2, stroke: i === 1 ? "#fff" : C.text2, "stroke-width": 2, filter: i === 1 ? "url(#glow-soft)" : "" }, s));
    const pin = svg("path", { d: "M712 76 L712 112", stroke: C.cyan, "stroke-width": 2 }, s);
    const tl = gsap.timeline({ paused: true });
    tl.from(bar, { attr: { width: 0 }, duration: 1.0, ease: "power2.out" }, 0.1);
    tl.from(dots, { scale: 0, transformOrigin: "50% 50%", stagger: 0.2, duration: 0.4, ease: "back.out(2)" }, 0.6);
    tl.from(pin, { opacity: 0, duration: 0.3 }, 1.1);
    tl.from(slide.querySelectorAll(".vc-card"), { opacity: 0, y: 24, stagger: 0.2, duration: 0.5 }, 1.1);
    tl.from(slide.querySelectorAll(".callout"), { opacity: 0, y: 20, stagger: 0.25, duration: 0.5 }, 1.9);
    return { tl };
  };

  /* 20 · Confidence-gated routing: a live stream of requests */
  anims.routing = function (slide) {
    const s = DM.stageSvg(slide.querySelector("#rt-stage"), 1424, 560);
    const MX = 560,
      MY = 280;
    // Source
    const src = svg("g", {}, s);
    for (let i = 0; i < 4; i++) svg("rect", { x: 40 + i * 6, y: 220 - i * 6, width: 150, height: 110, rx: 12, fill: C.bg2, stroke: C.lineStrong, "stroke-width": 1.2 }, src);
    svg("text", { x: 133, y: 260, "text-anchor": "middle", fill: "#fff", "font-size": 22, "font-weight": 600, "font-family": "Space Grotesk", text: "Peticiones" }, src);
    svg("text", { x: 133, y: 288, "text-anchor": "middle", fill: C.muted, "font-size": 14, "font-family": MONO, text: "tickets, correos…" }, src);
    const inPath = svg("path", { d: `M200 ${MY} L${MX - 80} ${MY}`, stroke: C.line, "stroke-width": 2, fill: "none" }, s);
    // Model
    const model = svg("g", {}, s);
    const ring = svg("circle", { cx: MX, cy: MY, r: 80, fill: "rgba(34,211,238,0.07)", stroke: C.cyan, "stroke-width": 2, filter: "url(#glow)" }, model);
    svg("text", { x: MX, y: MY - 4, "text-anchor": "middle", fill: "#fff", "font-size": 21, "font-weight": 600, "font-family": "Space Grotesk", text: "Modelo de" }, model);
    svg("text", { x: MX, y: MY + 22, "text-anchor": "middle", fill: "#fff", "font-size": 21, "font-weight": 600, "font-family": "Space Grotesk", text: "decisión" }, model);
    const confTxt = svg("text", { x: MX, y: MY + 118, "text-anchor": "middle", fill: C.text, "font-size": 18, "font-family": MONO, text: "" }, s);
    // Lanes
    const lanes = [
      { y: 90, color: C.good, icon: "✓", title: "Automático", sub: "confianza alta (≥ 0,9)", min: 0.9 },
      { y: 280, color: C.warn, icon: "⚠", title: "Confirmar o revisar", sub: "confianza media (0,5–0,9)", min: 0.5 },
      { y: 470, color: C.bad, icon: "✋", title: "Persona o LLM razonador", sub: "confianza baja (< 0,5)", min: 0 },
    ];
    lanes.forEach((l) => {
      l.path = svg("path", { d: `M${MX + 80} ${MY} C ${MX + 260} ${MY}, ${MX + 220} ${l.y}, ${MX + 420} ${l.y} L1020 ${l.y}`, stroke: C.line, "stroke-width": 2, fill: "none" }, s);
      const g = svg("g", {}, s);
      svg("rect", { x: 1030, y: l.y - 52, width: 390, height: 104, rx: 16, fill: C.bg2, stroke: l.color, "stroke-width": 1.5 }, g);
      svg("text", { x: 1056, y: l.y - 10, fill: l.color, "font-size": 24, "font-family": "Inter", text: l.icon }, g);
      svg("text", { x: 1092, y: l.y - 10, fill: "#fff", "font-size": 22, "font-weight": 600, "font-family": "Space Grotesk", text: l.title }, g);
      svg("text", { x: 1092, y: l.y + 20, fill: C.text2, "font-size": 15, "font-family": MONO, text: l.sub }, g);
      l.count = svg("text", { x: 1400, y: l.y + 12, "text-anchor": "end", fill: "#fff", "font-size": 34, "font-weight": 700, "font-family": "Space Grotesk", text: "0" }, g);
      l.n = 0;
      l.g = g;
    });
    const tl = gsap.timeline({ paused: true });
    tl.from(src, { opacity: 0, x: -30, duration: 0.5 }, 0.1);
    tl.from(model, { opacity: 0, scale: 0.85, transformOrigin: `${MX}px ${MY}px`, duration: 0.5 }, 0.3);
    tl.from([inPath, ...lanes.map((l) => l.path)], { opacity: 0, duration: 0.5 }, 0.5);
    tl.from(lanes.map((l) => l.g), { opacity: 0, x: 30, stagger: 0.15, duration: 0.5 }, 0.6);

    // Endless stream (outside the step timeline). Deterministic confidences.
    const seq = [0.97, 0.93, 0.71, 0.99, 0.95, 0.42, 0.91, 0.98, 0.64, 0.96, 0.92, 0.88, 0.99, 0.31, 0.94, 0.97, 0.83, 0.9];
    let k = 0;
    const live = new Set();
    const follow = (path, dot, o) => {
      const L = path.getTotalLength();
      const p = path.getPointAtLength(o.t * L);
      dot.setAttribute("cx", p.x);
      dot.setAttribute("cy", p.y);
    };
    function emit() {
      const conf = seq[k++ % seq.length];
      const lane = lanes.find((l) => conf >= l.min);
      const dot = svg("circle", { r: 7, fill: C.text, filter: "url(#glow)", cx: -20, cy: -20 }, s);
      const o1 = { t: 0 },
        o2 = { t: 0 };
      const t = gsap.timeline({
        onComplete: () => {
          dot.remove();
          live.delete(t);
        },
      });
      t.to(o1, { t: 1, duration: 0.9, ease: "power1.in", onUpdate: () => follow(inPath, dot, o1) });
      t.to(ring, { attr: { fill: "rgba(34,211,238,0.22)" }, duration: 0.12, yoyo: true, repeat: 1 });
      t.call(() => {
        confTxt.textContent = `confianza ${conf.toFixed(2).replace(".", ",")}`;
        confTxt.setAttribute("fill", lane.color);
        dot.setAttribute("fill", lane.color);
      });
      t.to(o2, { t: 1, duration: 1.1, ease: "power1.inOut", onUpdate: () => follow(lane.path, dot, o2) });
      t.call(() => {
        lane.n += 1;
        lane.count.textContent = lane.n;
      });
      live.add(t);
    }
    if (DM.isPrint) {
      // Static, illustrative counts for the PDF.
      [14, 4, 2].forEach((n, i) => (lanes[i].count.textContent = n));
      return { tl };
    }
    const timer = setInterval(emit, 650);
    const first = gsap.delayedCall(1.0, emit);
    return {
      tl,
      destroy: () => {
        clearInterval(timer);
        first.kill();
        live.forEach((t) => t.kill());
      },
    };
  };

  /* 21 · Live example (game captures) */
  anims.game = function (slide) {
    const a = slide.querySelector("#gm-a");
    a.querySelectorAll(".game-mark").forEach((m) => m.remove());
    const marks = [
      { l: 66.8, t: 49, w: 26.5, h: 26, label: "1 · el estado, en texto", cls: "below" },
      { l: 35.8, t: 82, w: 29.6, h: 16, label: "2 · probabilidades · confianza 0,97", cls: "" },
      { l: 66.8, t: 3, w: 22.5, h: 44, label: "3 · historial", cls: "left" },
    ];
    const b = slide.querySelector("#gm-b");
    b.querySelectorAll(".game-mark").forEach((m) => m.remove());
    const els = marks.map((m) => {
      const d = DM.html(`<div class="game-mark ${m.cls}" style="left:${m.l}%;top:${m.t}%;width:${m.w}%;height:${m.h}%"><span>${m.label}</span></div>`);
      a.appendChild(d);
      return d;
    });
    const doubt = DM.html(`<div class="game-mark" style="left:35.8%;top:82%;width:29.6%;height:16%;border-color:var(--orange);box-shadow:0 0 18px rgba(251,146,60,.45)"><span style="background:var(--orange)">confianza 0,33 · «no lo tengo claro»</span></div>`);
    b.appendChild(doubt);
    els.push(doubt);
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".game-shot"), { opacity: 0, y: 30, stagger: 0.3, duration: 0.6 }, 0.1);
    tl.from(els, { opacity: 0, scale: 1.08, stagger: 0.45, duration: 0.45 }, 1.0);
    return { tl };
  };

  anims.map = DM.simple([".map-table thead th", ".map-table tbody tr"], { stagger: 0.12 });
  anims.when = DM.simple([".when-card"], { stagger: 0.25 });
  anims.patterns = DM.simple([".pt-card", ".callout"], { stagger: 0.2 });
  anims.takeaways = DM.simple([".tk-item"], { stagger: 0.45 });
  anims.sources = DM.simple(["li"], { stagger: 0.05 });
})();
