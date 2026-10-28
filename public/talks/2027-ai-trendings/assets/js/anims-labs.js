/* Block 01 · Labs: METR explorer, benchmark graveyard, AI-builds-AI loop, pacing gates. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const t = (y, m) => y + (m - 1) / 12; // decimal year

  /* METR time horizon: log chart + interactive doubling-time projection to Dec 2027. */
  anims.metr = function (slide, { signal }) {
    const W = 1000, H = 560;
    const s = Deck.stageSvg(slide.querySelector("#mt-stage"), W, H);
    const host = slide.querySelector("#mt-stage");
    const tip = Deck.tooltip(slide.querySelector("#mt-tip"), host);
    const L = 90, R = W - 30, T = 20, B = H - 50;
    const x = Deck.lin(2023, 2028, L, R);
    const y = Deck.logScale(1 / 60, 2000, B, T);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);

    // grid
    const grid = svg("g", {}, s);
    [[1 / 60, "1 min"], [1, "1 h"], [8, "1 jornada"], [40, "1 semana"], [167, "1 mes"], [1000, "6 meses"]].forEach(([v, lab]) => {
      svg("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, grid);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: lab }, grid);
    });
    for (let yr = 2023; yr <= 2028; yr++) {
      svg("text", { x: x(yr), y: B + 30, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.text, text: yr }, grid);
      svg("line", { x1: x(yr), x2: x(yr), y1: B, y2: B + 8, stroke: C.ink, "stroke-width": 2 }, grid);
    }
    svg("line", { x1: L, x2: R, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, grid);
    svg("line", { x1: L, x2: L, y1: T, y2: B, stroke: C.ink, "stroke-width": 3 }, grid);
    tl.from(grid, { opacity: 0, duration: 0.4 }, 0.3);

    // suite ceiling band
    const band = svg("rect", { x: L, y: y(2000), width: R - L, height: y(16) - y(2000), fill: C.yellow, opacity: 0.18 }, s);
    const bandL = svg("text", { x: L + 12, y: y(2000) + 24, "font-size": 15, "font-family": Deck.MONO, fill: C.ink, text: "▒ zona > 16 h: la suite de METR «no es fiable»" }, s);
    tl.from([band, bandL], { opacity: 0, duration: 0.4 }, 1.6);

    // data points (METR TH1.0 paper + 2026 reports)
    const pts = [
      { n: "GPT-4", d: t(2023, 3), h: 5.4 / 60, src: "METR 2025" },
      { n: "Claude 3.7 Sonnet", d: t(2025, 2), h: 59 / 60, src: "METR 2025" },
      { n: "o3", d: t(2025, 4), h: 1.53, src: "METR 2025" },
      { n: "GPT-5", d: t(2025, 8), h: 2.28, src: "METR FAQ" },
      { n: "Opus 4.6", d: t(2026, 2), h: 12, src: "METR / Epoch" },
      { n: "Mythos Preview", d: t(2026, 5), h: 16, src: "METR may-26 · IC 8,5–55 h", ge: true },
    ];
    const path = svg("path", { d: "M" + pts.map((p) => `${x(p.d)},${y(p.h)}`).join(" L"), fill: "none", stroke: C.ink, "stroke-width": 3 }, s);
    Deck.draw(tl, path, 0.5, 1.2);
    pts.forEach((p, i) => {
      const g = svg("g", {}, s);
      svg("rect", { x: x(p.d) - 9 + 3, y: y(p.h) - 9 + 3, width: 18, height: 18, fill: C.ink }, g);
      svg("rect", { x: x(p.d) - 9, y: y(p.h) - 9, width: 18, height: 18, fill: p.ge ? C.accent2 : C.accent, stroke: C.ink, "stroke-width": 2 }, g);
      const lab = svg("text", { x: x(p.d) - 14, y: y(p.h) - 16, "text-anchor": "end", "font-size": 16, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: p.n + (p.ge ? " ≥16 h" : "") }, g);
      if (i === 0) lab.setAttribute("text-anchor", "start"), lab.setAttribute("x", x(p.d) + 4);
      if (p.n === "Opus 4.6") lab.setAttribute("text-anchor", "start"), lab.setAttribute("x", x(p.d) + 16), lab.setAttribute("y", y(p.h) + 28);
      if (p.ge) lab.setAttribute("x", x(p.d) - 4), lab.setAttribute("y", y(p.h) - 22);
      const hit = svg("circle", { cx: x(p.d), cy: y(p.h), r: 22, fill: "transparent" }, g);
      hit.addEventListener("mousemove", (e) => tip.show(e, `<b>${p.n}</b><br>${p.h < 1 ? Math.round(p.h * 60) + " min" : Deck.fmt(p.h, 1) + " h"} · ${p.src}`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
      tl.from(g, { scale: 0, transformOrigin: `${x(p.d)}px ${y(p.h)}px`, duration: 0.35, ease: "back.out(3)" }, 0.6 + i * 0.18);
    });

    // projection
    const proj = svg("path", { fill: "none", stroke: C.accent2, "stroke-width": 4, "stroke-dasharray": "10 8" }, s);
    const end = svg("g", {}, s);
    const endR = svg("rect", { width: 22, height: 22, fill: C.yellow, stroke: C.ink, "stroke-width": 3 }, end);
    const endT = svg("text", { "font-size": 18, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, "text-anchor": "end" }, end);
    const out = slide.querySelector("#mt-h");
    const outW = slide.querySelector("#mt-w");
    const input = slide.querySelector("#mt-d");
    const outD = slide.querySelector("#mt-d-out");
    const st = { d: 6.5, p: 0 };
    const x0 = t(2026, 5), h0 = 16, x1 = t(2027, 12);
    function render() {
      const months = (x1 - x0) * 12 * st.p;
      const hEnd = h0 * Math.pow(2, months / st.d);
      const N = 30;
      let d = "";
      for (let i = 0; i <= N; i++) {
        const m = (months * i) / N;
        const hv = Math.min(h0 * Math.pow(2, m / st.d), 2000);
        d += `${i ? "L" : "M"}${x(x0 + m / 12)},${y(hv)}`;
      }
      proj.setAttribute("d", d);
      const ex = x(x0 + months / 12), ey = y(Math.min(hEnd, 2000));
      endR.setAttribute("x", ex - 11);
      endR.setAttribute("y", ey - 11);
      endT.setAttribute("x", ex - 18);
      endT.setAttribute("y", ey + 6);
      endT.textContent = st.p > 0.98 ? "dic-2027" : "";
      end.style.opacity = st.p > 0.02 ? 1 : 0;
      const hFull = h0 * Math.pow(2, ((x1 - x0) * 12) / st.d);
      const shown = st.p * hFull + (1 - st.p) * h0;
      out.textContent = `${Deck.fmt(shown)} h`;
      outW.textContent = `≈ ${Deck.fmt(shown / 40, shown < 400 ? 1 : 0)} semanas laborales de 40 h`;
      outD.textContent = `${Deck.fmt(st.d, 1)} m`;
      input.value = Math.round(st.d * 10);
      slide.querySelectorAll("[data-d]").forEach((b) => b.classList.toggle("on", Math.abs(b.dataset.d / 10 - st.d) < 0.05));
    }
    input.addEventListener("input", () => ((st.d = input.value / 10), (st.p = 1), render()), { signal });
    slide.querySelectorAll("[data-d]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { d: b.dataset.d / 10, p: 1, duration: 0.8, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    render();
    tl.to(st, { p: 1, duration: 1.4, ease: "power2.inOut", onUpdate: render }, 1.9);
    tl.to(st, { d: 3.5, duration: 1.6, ease: "power2.inOut", onUpdate: render }, 3.6);
    return { tl };
  };

  /* Benchmarks: bars race from the earlier score to the latest; SATURADO stamps. */
  anims.bench = function (slide) {
    const W = 1424, H = 500;
    const s = Deck.stageSvg(slide.querySelector("#bn-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const rows = [
      { n: "ARC-AGI-3", sub: "harness estándar", a: 1.5, aL: "jun-26: 1,5 %", b: 62.7, bL: "sep-26: 62,7 %", sat: false, tag: "3 MESES" },
      { n: "ARC-AGI-2", sub: "", a: 60.4, aL: "feb-26: 60,4 %", b: 91.3, bL: "oct-26: 91,3 %", sat: true },
      { n: "SWE-bench Verified", sub: "código real", a: 74.5, aL: "fin-25: 74,5 %", b: 97, bL: "2026: ~97 %", sat: true },
      { n: "FrontierMath T4", sub: "matemática experta", a: null, b: 100, bL: "todos resueltos por alguna IA", sat: true },
      { n: "Humanity's Last Exam", sub: "", a: null, b: 62, bL: "59–65 % (según el harness)", sat: false },
      { n: "Erdős (FrontierMath)", sub: "problemas ABIERTOS", a: 0, aL: "", b: 7.4, bL: "5 de 68 resueltos", sat: false, tag: "LA NUEVA VARA" },
    ];
    const L = 330, R = 1140, rowH = 78, top = 22;
    const xs = Deck.lin(0, 100, L, R);
    rows.forEach((r, i) => {
      const yy = top + i * rowH;
      const g = svg("g", {}, s);
      svg("text", { x: 0, y: yy + 26, "font-size": 25, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: r.n }, g);
      if (r.sub) svg("text", { x: 0, y: yy + 50, "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: r.sub }, g);
      svg("rect", { x: L, y: yy + 6, width: R - L, height: 40, fill: C.bg2, stroke: C.ink, "stroke-width": 2.5 }, g);
      tl.from(g, { opacity: 0, x: -40, duration: 0.4 }, 0.4 + i * 0.08);
      const fill = svg("rect", { x: L, y: yy + 6, width: 0, height: 40, fill: i === 5 ? C.accent2 : r.sat ? C.yellow : C.accent, stroke: C.ink, "stroke-width": 2.5 }, s);
      const start = r.a != null ? xs(r.a) - L : 0;
      gsap.set(fill, { attr: { width: start } });
      if (r.a != null && r.a > 0) {
        const m = svg("line", { x1: xs(r.a), x2: xs(r.a), y1: yy, y2: yy + 52, stroke: C.ink, "stroke-width": 4 }, s);
        const ml = svg("text", { x: xs(r.a), y: yy + 66, "text-anchor": "middle", "font-size": 14, "font-family": Deck.MONO, fill: C.ink, text: "▲ " + r.aL }, s);
        tl.from([m, ml], { opacity: 0, duration: 0.3 }, 0.9 + i * 0.1);
      }
      const at = 1.3 + i * 0.28;
      tl.to(fill, { attr: { width: xs(r.b) - L }, duration: 1.0, ease: "power3.inOut" }, at);
      const vl = svg("text", { x: Math.min(xs(r.b), R) + 14, y: yy + 33, "font-size": 18, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: r.bL }, s);
      if (r.b > 90) vl.setAttribute("x", R + 14);
      tl.from(vl, { opacity: 0, x: -20, duration: 0.3 }, at + 0.9);
      if (r.sat || r.tag) {
        const sg = svg("g", {}, s);
        const label = r.sat ? "SATURADO" : r.tag;
        const w = label.length * 13 + 26;
        const sx = r.sat ? L + 24 : xs(r.b) + r.bL.length * 11 + 40;
        svg("rect", { x: sx + 4, y: yy + 4 + 4, width: w, height: 36, fill: C.ink }, sg);
        svg("rect", { x: sx, y: yy + 4, width: w, height: 36, fill: r.sat ? C.accent2 : C.ink, stroke: C.ink, "stroke-width": 2.5 }, sg);
        svg("text", { x: sx + w / 2, y: yy + 28, "text-anchor": "middle", "font-size": 17, "font-family": Deck.BLACK, fill: r.sat ? "#fff" : C.yellow, text: label }, sg);
        sg.setAttribute("transform", `rotate(${i % 2 ? -4 : 3} ${sx + w / 2} ${yy + 22})`);
        tl.from(sg, { scale: 3, opacity: 0, transformOrigin: `${sx + w / 2}px ${yy + 22}px`, duration: 0.35, ease: "power4.in" }, at + 1.0);
      }
    });
    tl.from(slide.querySelector(".callout"), { y: 40, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 3.4);
    return { tl };
  };

  /* AI builds AI: research loop that speeds up, then gets a speed limit. */
  anims.rsi = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#rs-stage"), 640, 520);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const show = Deck.captions(tl, slide.querySelector("#rs-cap"), [
      "Hasta 2025: <b>personas</b> investigan y entrenan el siguiente modelo.",
      "2026: los <b>agentes hacen parte del I+D</b> (3,1 jornadas de agente por cada humana en OpenAI).",
      "El bucle se cierra: el modelo N ayuda a crear el N+1, y <b>cada vuelta es más rápida</b>.",
      "Los laboratorios piden un <b>«límite de velocidad»</b>: evaluadores dentro del bucle.",
    ]);
    const cx = 320, cy = 250, R = 170;
    const ring = svg("circle", { cx, cy, r: R, fill: "none", stroke: C.ink, "stroke-width": 4, "stroke-dasharray": "14 10" }, s);
    const node = (ang, label, sub, fill, txt) => {
      const nx = cx + R * Math.cos(ang), ny = cy + R * Math.sin(ang);
      const g = svg("g", {}, s);
      svg("rect", { x: nx - 85 + 6, y: ny - 38 + 6, width: 170, height: 76, fill: C.ink }, g);
      svg("rect", { x: nx - 85, y: ny - 38, width: 170, height: 76, fill, stroke: C.ink, "stroke-width": 3 }, g);
      svg("text", { x: nx, y: ny - 4, "text-anchor": "middle", "font-size": 19, "font-weight": 700, "font-family": Deck.DISPLAY, fill: txt || C.ink, text: label }, g);
      svg("text", { x: nx, y: ny + 22, "text-anchor": "middle", "font-size": 14, "font-family": Deck.MONO, fill: txt || C.ink, text: sub }, g);
      return g;
    };
    const nH = node(-Math.PI / 2, "Personas", "investigan", C.bg2);
    const nM = node(0, "Modelo N", "entrenado", C.accent, "#fff");
    const nA = node(Math.PI / 2, "Agentes de I+D", "experimentos, código", C.yellow);
    const nN = node(Math.PI, "Modelo N+1", "mejor y antes", C.accent2, "#fff");
    const dot = svg("rect", { width: 20, height: 20, x: -10, y: -10, fill: C.yellow, stroke: C.ink, "stroke-width": 3 }, s);
    const ang = { a: 0 };
    const placeDot = () => {
      const a = -Math.PI / 2 + ang.a * Math.PI * 2;
      dot.setAttribute("transform", `translate(${cx + R * Math.cos(a)},${cy + R * Math.sin(a)}) rotate(${ang.a * 360})`);
    };
    placeDot();
    const loop = Deck.isPrint ? null : gsap.to(ang, { a: 1, duration: 4, ease: "none", repeat: -1, onUpdate: placeDot });
    const speed = { v: 0.4 };
    const applySpeed = () => loop && loop.timeScale(speed.v);
    applySpeed();
    const center = svg("text", { x: cx, y: cy + 14, "text-anchor": "middle", "font-size": 44, "font-family": Deck.BLACK, fill: C.ink, text: "×1" }, s);
    const brake = svg("g", {}, s);
    svg("rect", { x: cx - 72 + 5, y: cy - 40 + 5, width: 144, height: 80, fill: C.ink }, brake);
    svg("rect", { x: cx - 72, y: cy - 40, width: 144, height: 80, fill: C.bad, stroke: C.ink, "stroke-width": 3 }, brake);
    svg("text", { x: cx, y: cy - 6, "text-anchor": "middle", "font-size": 17, "font-family": Deck.BLACK, fill: "#fff", text: "LÍMITE DE" }, brake);
    svg("text", { x: cx, y: cy + 22, "text-anchor": "middle", "font-size": 17, "font-family": Deck.BLACK, fill: "#fff", text: "VELOCIDAD" }, brake);
    const cards = ["#rs-c1", "#rs-c2", "#rs-c3"].map((q) => slide.querySelector(q));
    gsap.set([nA, nN, brake, ...cards], { opacity: 0 });
    gsap.set(ring, { opacity: 0.25 });

    tl.from([nH, nM], { scale: 0, transformOrigin: "50% 50%", duration: 0.4, stagger: 0.15, ease: "back.out(2)" }, 0.4);
    show(0, 0.4);
    tl.addLabel("s0");
    tl.to(nA, { opacity: 1, duration: 0.01 }, "s0");
    tl.from(nA, { y: 80, duration: 0.5, ease: "back.out(2)" }, "s0");
    tl.to(cards[0], { opacity: 1, duration: 0.01 }, "s0");
    tl.from(cards[0], { x: 120, rotation: 4, duration: 0.5, ease: "back.out(2)" }, "s0");
    tl.to(speed, { v: 1, duration: 0.6, onUpdate: applySpeed }, "s0");
    show(1, "s0");
    tl.addLabel("s1");
    tl.to(nN, { opacity: 1, duration: 0.01 }, "s1");
    tl.from(nN, { x: -80, duration: 0.5, ease: "back.out(2)" }, "s1");
    tl.to(ring, { opacity: 1, duration: 0.4 }, "s1");
    tl.to(speed, { v: 3.2, duration: 1.2, onUpdate: applySpeed }, "s1");
    const cnt = { v: 1 };
    tl.to(cnt, { v: 3, duration: 1.2, onUpdate: () => (center.textContent = `×${cnt.v.toFixed(1).replace(".", ",")}`) }, "s1");
    tl.to(cards[1], { opacity: 1, duration: 0.01 }, "s1");
    tl.from(cards[1], { x: 120, rotation: -4, duration: 0.5, ease: "back.out(2)" }, "s1+=0.2");
    show(2, "s1");
    tl.addLabel("s2");
    tl.to(center, { opacity: 0, duration: 0.2 }, "s2");
    tl.to(brake, { opacity: 1, duration: 0.01 }, "s2");
    tl.from(brake, { scale: 3, rotation: -20, transformOrigin: `${cx}px ${cy}px`, duration: 0.4, ease: "power4.in" }, "s2");
    tl.to(speed, { v: 1.2, duration: 0.8, onUpdate: applySpeed }, "s2+=0.3");
    tl.to(cards[2], { opacity: 1, duration: 0.01 }, "s2");
    tl.from(cards[2], { x: 120, duration: 0.5, ease: "back.out(2)" }, "s2+=0.2");
    show(3, "s2");
    tl.addLabel("s3");
    return { tl, destroy: () => loop && loop.kill() };
  };

  /* Pacing: three frontier models meet four access gates. */
  anims.pacing = function (slide) {
    const W = 1424, H = 470;
    const s = Deck.stageSvg(slide.querySelector("#pc-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const show = Deck.captions(tl, slide.querySelector("#pc-cap"), [
      "<b>GPT-6.1 Astra</b> ni siquiera salió: OpenAI lo canceló el 28-sep porque «no cumplía el listón» de seguridad.",
      "<b>Claude Mythos</b> se queda en acceso restringido (Project Glasswing): encontró miles de zero-days.",
      "<b>Gemini 4 Argon</b> llegó primero a ciberdefensores (Fairwind, 30-sep) y al público el 13-oct.",
      "<b>Predicción 2027 (alta):</b> los mejores modelos llegarán por fases, con un desfase de semanas o meses entre el acceso verificado y el público.",
    ]);
    const gates = [
      { x: 300, n: "① Evaluación interna", c: C.bg2 },
      { x: 580, n: "② Acceso verificado", c: C.yellow },
      { x: 860, n: "③ Empresas / API", c: C.lilac },
      { x: 1140, n: "④ Público", c: C.green },
    ];
    const gG = svg("g", {}, s);
    gates.forEach((g) => {
      svg("rect", { x: g.x - 14 + 5, y: 46 + 5, width: 28, height: 330, fill: C.ink }, gG);
      svg("rect", { x: g.x - 14, y: 46, width: 28, height: 330, fill: g.c, stroke: C.ink, "stroke-width": 3 }, gG);
      svg("text", { x: g.x, y: 30, "text-anchor": "middle", "font-size": 18, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: g.n }, gG);
    });
    tl.from(gG.children, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.4, stagger: 0.03, ease: "back.out(2)" }, 0.3);
    const token = (y, label, fill, txt) => {
      const g = svg("g", {}, s);
      svg("rect", { x: 5, y: y - 26 + 5, width: 210, height: 52, fill: C.ink }, g);
      svg("rect", { x: 0, y: y - 26, width: 210, height: 52, fill, stroke: C.ink, "stroke-width": 3 }, g);
      svg("text", { x: 105, y: y + 7, "text-anchor": "middle", "font-size": 20, "font-weight": 700, "font-family": Deck.DISPLAY, fill: txt || C.ink, text: label }, g);
      return g;
    };
    const stamp = (x, y, label, fill) => {
      const g = svg("g", { transform: `rotate(-6 ${x} ${y})` }, s);
      const w = label.length * 12 + 26;
      svg("rect", { x: x - w / 2, y: y - 20, width: w, height: 40, fill, stroke: C.ink, "stroke-width": 3 }, g);
      svg("text", { x, y: y + 6, "text-anchor": "middle", "font-size": 16, "font-family": Deck.BLACK, fill: "#fff", text: label }, g);
      gsap.set(g, { opacity: 0 });
      return g;
    };
    const tA = token(110, "GPT-6.1 Astra", C.bg2);
    const tM = token(220, "Claude Mythos", C.accent, "#fff");
    const tG = token(330, "Gemini 4 Argon", C.accent2, "#fff");
    gsap.set([tA, tM, tG], { opacity: 0 });
    const sA = stamp(175, 168, "✕ CANCELADO", C.bad);
    const sM = stamp(455, 278, "SOLO GLASSWING", C.ink);
    const sG = stamp(1279, 270, "13 DÍAS DESPUÉS → GA", C.good);

    tl.to(tA, { opacity: 1, duration: 0.01 }, 0.8);
    tl.fromTo(tA, { x: -240 }, { x: 300 - 230, duration: 0.7, ease: "power2.in" }, 0.8);
    tl.to(tA, { x: 300 - 250, duration: 0.15, yoyo: true, repeat: 1 }, 1.5);
    tl.fromTo(sA, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 1.75);
    tl.to(tA, { opacity: 0.35, duration: 0.3 }, 2.0);
    show(0, 0.8);
    tl.addLabel("s0");
    tl.to(tM, { opacity: 1, duration: 0.01 }, "s0");
    tl.fromTo(tM, { x: -240 }, { x: 580 - 230, duration: 1.0, ease: "power2.inOut" }, "s0");
    tl.fromTo(sM, { opacity: 0 }, { opacity: 1, duration: 0.2 }, "s0+=1.0");
    show(1, "s0");
    tl.addLabel("s1");
    tl.to(tG, { opacity: 1, duration: 0.01 }, "s1");
    tl.fromTo(tG, { x: -240 }, { x: 580 - 230, duration: 0.8, ease: "power2.inOut" }, "s1");
    tl.to(tG, { x: 1140 + 34, duration: 1.2, ease: "power2.inOut" }, "s1+=1.0");
    tl.fromTo(sG, { opacity: 0 }, { opacity: 1, duration: 0.2 }, "s1+=2.1");
    show(2, "s1");
    tl.addLabel("s2");
    const br = svg("path", { d: `M580 430 L580 450 L1140 450 L1140 430`, fill: "none", stroke: C.accent2, "stroke-width": 5 }, s);
    const brT = svg("text", { x: 860, y: 445 - 26, "text-anchor": "middle", "font-size": 20, "font-family": Deck.BLACK, fill: C.accent2, text: "2027 → SEMANAS O MESES DE DESFASE" }, s);
    gsap.set([br, brT], { opacity: 0 });
    tl.to([br, brT], { opacity: 1, duration: 0.01 }, "s2");
    Deck.draw(tl, br, tl.labels.s2, 0.7);
    tl.from(brT, { y: 20, duration: 0.4, ease: "back.out(2)" }, "s2+=0.4");
    show(3, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  anims.labs = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const labs = slide.querySelectorAll(".lab");
    labs.forEach((l, i) => {
      tl.from(l, { opacity: 0, y: i < 4 ? -60 : 60, rotation: (i % 3) - 1 * 3, duration: 0.45, ease: "back.out(2)" }, 0.4 + i * 0.1);
    });
    tl.from(slide.querySelectorAll(".lab .conf"), { scale: 0, duration: 0.3, stagger: 0.06, ease: "back.out(4)" }, 1.3);
    return { tl };
  };
})();
