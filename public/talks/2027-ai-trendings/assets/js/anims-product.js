/* Block 05 · Product & society: AI-written code, agentic commerce, junior jobs, 2027 calendar. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  /* Google: % of new code written by AI, rendered as a filling code editor. */
  anims.code = function (slide) {
    const W = 860, H = 590;
    const s = Deck.stageSvg(slide.querySelector("#cd-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const pts = [
      { l: "oct-24", v: 25, c: C.bg2 },
      { l: "otoño-25", v: 50, c: C.lilac },
      { l: "abr-26", v: 75, c: C.accent },
      { l: "2027 · pred.", v: 82, c: null },
    ];
    svg("text", { x: 0, y: 24, "font-size": 21, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: "% del código nuevo de Google generado por IA" }, s);
    const B = H - 60, T = 70, bw = 150, gap = 50;
    const y = Deck.lin(0, 100, B, T);
    const HATCH = Deck.hatchDef(s, C.accent2);
    svg("line", { x1: 0, x2: W, y1: y(100), y2: y(100), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
    pts.forEach((p, i) => {
      const x = 20 + i * (bw + gap);
      // "editor" frame
      const g = svg("g", {}, s);
      svg("rect", { x: x + 6, y: T + 6, width: bw, height: B - T, fill: C.ink }, g);
      svg("rect", { x, y: T, width: bw, height: B - T, fill: C.bg2, stroke: C.ink, "stroke-width": 3 }, g);
      const rnd = Deck.rng(i * 31 + 7);
      for (let k = 0; k < 18; k++) svg("rect", { x: x + 12 + (rnd() < 0.3 ? 14 : 0), y: T + 14 + k * 24, width: 30 + rnd() * (bw - 70), height: 9, fill: C.line }, g);
      tl.from(g, { opacity: 0, y: 30, duration: 0.4 }, 0.4 + i * 0.12);
      const fill = svg("rect", { x, y: B, width: bw, height: 0, fill: p.c || HATCH, stroke: C.ink, "stroke-width": 3, opacity: 0.92 }, s);
      tl.to(fill, { attr: { y: y(p.v), height: B - y(p.v) }, duration: 0.9, ease: "power3.inOut" }, 0.9 + i * 0.35);
      const t = svg("text", { x: x + bw / 2, y: y(p.v) - 14, "text-anchor": "middle", "font-size": 34, "font-family": Deck.BLACK, fill: C.ink, text: "0 %" }, s);
      const cs = { v: 0 };
      tl.to(cs, { v: p.v, duration: 0.9, ease: "power3.inOut", onUpdate: () => (t.textContent = i === 3 ? `>${Math.round(cs.v * 80 / 82)} %` : `${Math.round(cs.v)} %`) }, 0.9 + i * 0.35);
      svg("text", { x: x + bw / 2, y: B + 30, "text-anchor": "middle", "font-size": 17, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: p.l }, s);
    });
    Deck.stamp(tl, slide.querySelectorAll(".cd-s"), 1.0, { stagger: 0.35 });
    Deck.fillBars(tl, slide.querySelector("#cd-share"), 2.0);
    return { tl };
  };

  /* Agentic commerce: protocol soup chips drop into a funnel labelled "rules". */
  anims.commerce = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#co-stage"), 480, 380);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    Deck.stamp(tl, slide.querySelectorAll(".co-c .sticker"), 0.5, { stagger: 0.3 });
    tl.from(slide.querySelectorAll(".co-c.card"), { opacity: 0, y: 60, duration: 0.5, stagger: 0.3, ease: "back.out(2)" }, 0.4);
    svg("text", { x: 240, y: 22, "text-anchor": "middle", "font-size": 18, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: "La sopa de protocolos de pago" }, s);
    const protos = ["ACP", "AP2", "UCP", "MPP", "x402", "Visa TAP", "MC Agent Pay", "KYA"];
    const rnd = Deck.rng(5);
    protos.forEach((p, i) => {
      const g = Deck.chip(s, 20 + (i % 3) * 150 + rnd() * 20, 50 + Math.floor(i / 3) * 46, p, { size: 16, fill: [C.yellow, C.lilac, C.green, C.bg2][i % 4], h: 34 });
      tl.from(g, { y: -200, opacity: 0, rotation: rnd() * 40 - 20, duration: 0.6, ease: "bounce.out" }, 1.2 + i * 0.08);
    });
    const fn = svg("g", {}, s);
    svg("path", { d: "M6 200 L476 200 L310 300 L172 300 Z", fill: C.ink }, fn);
    svg("path", { d: "M0 194 L470 194 L304 294 L166 294 Z", fill: C.accent2, stroke: C.ink, "stroke-width": 3 }, fn);
    svg("text", { x: 234, y: 240, "text-anchor": "middle", "font-size": 22, "font-family": Deck.BLACK, fill: "#fff", text: "REGLAS 2027" }, fn);
    svg("text", { x: 234, y: 266, "text-anchor": "middle", "font-size": 13, "font-family": Deck.MONO, fill: "#fff", text: "disputas · identidad · responsab." }, fn);
    const out = svg("g", {}, s);
    svg("rect", { x: 174, y: 316, width: 120, height: 40, fill: C.green, stroke: C.ink, "stroke-width": 3 }, out);
    svg("text", { x: 234, y: 342, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.ink, text: "confianza" }, out);
    tl.from(fn, { scaleY: 0, transformOrigin: "50% 0%", duration: 0.5, ease: "back.out(2)" }, 2.0);
    tl.from(out, { y: -40, opacity: 0, duration: 0.4, ease: "bounce.out" }, 2.5);
    tl.from(slide.querySelector("#co-call"), { y: 50, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 2.8);
    return { tl };
  };

  /* Junior jobs: two diverging lines (exposed vs non-exposed), endpoints real, curve illustrative. */
  anims.jobs = function (slide) {
    const W = 1000, H = 560;
    const s = Deck.stageSvg(slide.querySelector("#jb-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const L = 90, R = 740, B = H - 60, T = 40;
    const x = Deck.lin(2022.9, 2026.6, L, R);
    const y = Deck.lin(85, 115, B, T);
    [90, 100, 110].forEach((v) => {
      svg("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: v }, s);
    });
    svg("text", { x: L - 10, y: T - 16, "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: "empleo 22–25 años · índice (fin-2022 = 100)" }, s);
    [2023, 2024, 2025, 2026].forEach((yr) => svg("text", { x: x(yr), y: B + 28, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.ink, text: yr }, s));
    svg("line", { x1: L, x2: R, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, s);
    const ch = svg("line", { x1: x(2022.92), x2: x(2022.92), y1: T, y2: B, stroke: C.ink, "stroke-width": 2, "stroke-dasharray": "3 5" }, s);
    svg("text", { x: x(2022.92) + 6, y: B - 10, "font-size": 13, "font-family": Deck.MONO, fill: C.ink, text: "ChatGPT" }, s);
    const lo = [[2022.9, 100], [2023.5, 103], [2024, 104.5], [2024.6, 106.5], [2025.2, 108], [2025.8, 109], [2026.5, 110]];
    const hi = [[2022.9, 100], [2023.5, 101], [2024, 98], [2024.6, 95], [2025.2, 92.5], [2025.8, 90.5], [2026.5, 89]];
    const mk = (pts, col, name) => {
      const d = "M" + pts.map((p) => `${x(p[0])},${y(p[1])}`).join(" L");
      const sh = svg("path", { d, fill: "none", stroke: C.ink, "stroke-width": 10 }, s);
      const p = svg("path", { d, fill: "none", stroke: col, "stroke-width": 6 }, s);
      Deck.draw(tl, sh, 0.6, 1.6);
      Deck.draw(tl, p, 0.6, 1.6);
      const last = pts[pts.length - 1];
      const g = svg("g", {}, s);
      svg("rect", { x: x(last[0]) + 12, y: y(last[1]) - 17, width: 236, height: 34, fill: col, stroke: C.ink, "stroke-width": 2.5 }, g);
      svg("text", { x: x(last[0]) + 22, y: y(last[1]) + 6, "font-size": 16, "font-weight": 700, "font-family": Deck.MONO, fill: col === C.accent2 ? "#fff" : C.ink, text: name }, g);
      tl.from(g, { opacity: 0, x: -20, duration: 0.3 }, 2.2);
    };
    mk(lo, C.green, "menos expuestas +10 %");
    mk(hi, C.accent2, "más expuestas −11 %");
    const gap = svg("g", {}, s);
    svg("line", { x1: x(2026.5), x2: x(2026.5), y1: y(110) + 8, y2: y(89) - 8, stroke: C.ink, "stroke-width": 4 }, gap);
    svg("text", { x: x(2026.5) - 12, y: y(99.5), "text-anchor": "end", "font-size": 26, "font-family": Deck.BLACK, fill: C.ink, text: "BRECHA" }, gap);
    tl.from(gap, { opacity: 0, scaleY: 0, transformOrigin: `${x(2026.5)}px ${y(99.5)}px`, duration: 0.5, ease: "back.out(2)" }, 2.5);
    Deck.stamp(tl, slide.querySelectorAll(".jb-s"), 1.0, { stagger: 0.4 });
    return { tl };
  };

  /* 2027 calendar: timeline axis with events falling into place. */
  anims.cal = function (slide) {
    const W = 1424, H = 560;
    const s = Deck.stageSvg(slide.querySelector("#ca-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const L = 40, R = 1390, AX = 280;
    const x = Deck.lin(2026.83, 2028.0, L, R);
    const axis = svg("path", { d: `M${L} ${AX} L${R} ${AX}`, stroke: C.ink, "stroke-width": 8, fill: "none" }, s);
    Deck.draw(tl, axis, 0.4, 0.9);
    const months = ["N", "D", "E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    months.forEach((mn, i) => {
      const xv = x(2026.83 + i / 12);
      const g = svg("g", {}, s);
      svg("line", { x1: xv, x2: xv, y1: AX - 10, y2: AX + 10, stroke: C.ink, "stroke-width": 3 }, g);
      svg("text", { x: xv, y: AX + 32, "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: i < 2 ? C.muted : C.ink, "font-weight": 700, text: mn }, g);
      tl.from(g, { opacity: 0, duration: 0.2 }, 0.5 + i * 0.04);
    });
    const yr = svg("g", {}, s);
    svg("rect", { x: x(2027) - 4, y: AX - 30, width: 80, height: 22, fill: C.ink }, yr);
    svg("text", { x: x(2027) + 36, y: AX - 14, "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: C.yellow, text: "2027" }, yr);
    tl.from(yr, { opacity: 0, duration: 0.3 }, 1.1);
    const k = { reg: C.lilac, launch: C.yellow, money: C.accent2, robot: C.green };
    const ev = [
      { d: 2026.9, t: "IPO Anthropic (prev.)", c: "money", lane: 0 },
      { d: 2026.93, t: "UE: fin gracia watermark", c: "reg", lane: 2 },
      { d: 2027.08, t: "Dispositivo OpenAI ≥ feb", c: "launch", lane: 1 },
      { d: 2027.04, t: "Huawei Ascend 960DT", c: "launch", lane: 3 },
      { d: 2027.12, t: "IPO Moonshot (HK)", c: "money", lane: 0 },
      { d: 2027.17, t: "Agility Digit 5 · early", c: "robot", lane: 2 },
      { d: 2027.3, t: "Meta VR Glasses", c: "launch", lane: 1 },
      { d: 2027.35, t: "AMD MI450 → Anthropic 1 GW", c: "launch", lane: 3 },
      { d: 2027.45, t: "Crane / Clinton nuclear", c: "robot", lane: 0 },
      { d: 2027.58, t: "UE: sandboxes (2-ago)", c: "reg", lane: 2 },
      { d: 2027.62, t: "Rubin Ultra (2S)", c: "launch", lane: 1 },
      { d: 2027.7, t: "Waymo Tokio", c: "robot", lane: 3 },
      { d: 2027.88, t: "TPU 8 en 2 nm", c: "launch", lane: 0 },
      { d: 2027.92, t: "UE: ALTO RIESGO (2-dic)", c: "reg", lane: 2, big: true },
      { d: 2027.92, t: "1X: 100k NEO/año (obj.)", c: "robot", lane: 1 },
    ];
    const laneY = [AX - 200, AX - 110, AX + 70, AX + 160];
    ev.forEach((e, i) => {
      const xv = x(e.d);
      const ly = laneY[e.lane];
      const g = svg("g", {}, s);
      const w = e.t.length * 9.4 + 24;
      const bx = Math.min(Math.max(xv - w / 2, 0), W - w - 6);
      svg("line", { x1: xv, x2: xv, y1: e.lane < 2 ? ly + 40 : AX, y2: e.lane < 2 ? AX : ly, stroke: C.ink, "stroke-width": 2.5 }, g);
      svg("rect", { x: bx + 5, y: ly + 5, width: w, height: 40, fill: C.ink }, g);
      svg("rect", { x: bx, y: ly, width: w, height: 40, fill: e.big ? C.bad : k[e.c], stroke: C.ink, "stroke-width": e.big ? 4 : 2.5 }, g);
      svg("text", { x: bx + w / 2, y: ly + 26, "text-anchor": "middle", "font-size": 16, "font-weight": 700, "font-family": Deck.MONO, fill: e.big || e.c === "money" ? "#fff" : C.ink, text: e.t }, g);
      svg("rect", { x: xv - 7, y: AX - 7, width: 14, height: 14, fill: C.bg2, stroke: C.ink, "stroke-width": 3 }, g);
      tl.from(g, { opacity: 0, y: e.lane < 2 ? -80 : 80, duration: 0.45, ease: "bounce.out" }, 1.3 + i * 0.13);
    });
    tl.from(slide.querySelectorAll(".row .tag"), { opacity: 0, y: 20, stagger: 0.08, duration: 0.3 }, 1.0);
    return { tl };
  };
})();
