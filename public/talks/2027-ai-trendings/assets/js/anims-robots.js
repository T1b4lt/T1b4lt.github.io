/* Block 03 · Robotics: humanoid waffle + price drop, Waymo line, one-brain-many-bodies. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  anims.humanoids = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    // waffle 10×10: 97 China, 3 rest
    const s = Deck.stageSvg(slide.querySelector("#hu-waffle"), 430, 430);
    const cells = [];
    const sz = 38, gap = 5;
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10), c = i % 10;
      const china = i < 97;
      const cell = svg("rect", { x: c * (sz + gap), y: r * (sz + gap), width: sz, height: sz, fill: china ? C.accent2 : C.bg2, stroke: C.ink, "stroke-width": 2.5 }, s);
      cells.push(cell);
    }
    tl.from(cells, { scale: 0, transformOrigin: "50% 50%", duration: 0.25, stagger: { each: 0.012, from: "start" }, ease: "back.out(3)" }, 0.5);


    // price drop chart (Unitree average humanoid price, prospectus)
    const W = 860, H = 300;
    const p = Deck.stageSvg(slide.querySelector("#hu-price"), W, H);
    svg("text", { x: 0, y: 22, "font-size": 20, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: "Precio medio de un humanoide de Unitree (yuanes)" }, p);
    const B = 260, L = 10;
    const y = Deck.lin(0, 650000, B, 50);
    const bars = [["2023", 593400, C.bg2], ["2025", 166400, C.yellow]];
    bars.forEach(([l, v, f], i) => {
      const x = L + i * 300;
      const b = Deck.brutBar(p, x, B, 200, f);
      Deck.growBar(tl, b, B, B - y(v), 1.0 + i * 0.4, 0.6);
      const t = svg("text", { x: x + 100, y: y(v) - 10, "text-anchor": "middle", "font-size": 22, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: `¥${Deck.fmt(v)}` }, p);
      tl.from(t, { opacity: 0, duration: 0.3 }, 1.5 + i * 0.4);
      svg("text", { x: x + 100, y: B + 28, "text-anchor": "middle", "font-size": 18, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: l }, p);
    });
    svg("line", { x1: 0, x2: 520, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, p);
    const badge = svg("g", {}, p);
    svg("rect", { x: 600 + 6, y: 100 + 6, width: 220, height: 110, fill: C.ink }, badge);
    svg("rect", { x: 600, y: 100, width: 220, height: 110, fill: C.accent2, stroke: C.ink, "stroke-width": 3 }, badge);
    svg("text", { x: 710, y: 166, "text-anchor": "middle", "font-size": 56, "font-family": Deck.BLACK, fill: "#fff", text: "−72 %" }, badge);
    svg("text", { x: 710, y: 196, "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: "#fff", text: "en dos años" }, badge);
    badge.setAttribute("transform", "rotate(-5 710 155)");
    tl.from(badge, { scale: 3, opacity: 0, transformOrigin: "710px 155px", duration: 0.4, ease: "power4.in" }, 2.3);
    tl.from(slide.querySelectorAll(".hu-chips .tag"), { opacity: 0, y: 30, rotation: (i) => (i % 2 ? 6 : -6), stagger: 0.1, duration: 0.4, ease: "back.out(2)" }, 2.5);
    return { tl };
  };

  anims.waymo = function (slide, { signal }) {
    const W = 1000, H = 590;
    const s = Deck.stageSvg(slide.querySelector("#wy-stage"), W, H);
    const host = slide.querySelector("#wy-stage");
    const tip = Deck.tooltip(slide.querySelector("#wy-tip"), host);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const L = 90, R = W - 20, B = H - 60, T = 30;
    const x = Deck.lin(2024.25, 2028, L, R);
    const y = Deck.lin(0, 1300, B, T);
    [0, 250, 500, 750, 1000, 1250].forEach((v) => {
      svg("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: v ? `${Deck.fmt(v)}k` : "0" }, s);
    });
    [2025, 2026, 2027, 2028].forEach((yr) => svg("text", { x: x(yr), y: B + 30, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.ink, text: yr }, s));
    svg("line", { x1: L, x2: R, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, s);
    svg("text", { x: L - 10, y: T - 10, "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: "viajes de pago / semana" }, s);
    // "today" marker
    const today = 2026 + 9.7 / 12;
    const tg = svg("g", {}, s);
    svg("line", { x1: x(today), x2: x(today), y1: T, y2: B, stroke: C.ink, "stroke-width": 2, "stroke-dasharray": "3 5" }, tg);
    svg("text", { x: x(today) - 6, y: B - 10, "text-anchor": "end", "font-size": 14, "font-family": Deck.MONO, fill: C.ink, text: "hoy" }, tg);
    // 2027 band (prediction)
    const band = svg("g", {}, s);
    svg("path", { d: `M${x(2026.3)} ${y(500)} L${x(2027.95)} ${y(750)} L${x(2027.95)} ${y(1200)} Z`, fill: C.yellow, opacity: 0.55, stroke: C.ink, "stroke-width": 2, "stroke-dasharray": "6 5" }, band);
    const bl = svg("g", {}, band);
    svg("rect", { x: x(2027.95) - 250, y: y(750) + 20, width: 240, height: 34, fill: C.ink }, bl);
    svg("text", { x: x(2027.95) - 130, y: y(750) + 43, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.yellow, text: "2027: 0,75–1,2 M (pred.)" }, bl);
    const goal = svg("g", {}, s);
    svg("line", { x1: x(2026.95), x2: x(2026.95), y1: y(1000) - 18, y2: y(1000) + 18, stroke: C.bad, "stroke-width": 4 }, goal);
    svg("line", { x1: x(2026.95) - 18, x2: x(2026.95) + 18, y1: y(1000), y2: y(1000), stroke: C.bad, "stroke-width": 4 }, goal);
    svg("text", { x: x(today) - 10, y: y(1000) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.bad, text: "meta Waymo fin-26: 1 M (difícil)" }, goal);
    const pts = [
      [2024 + 4.5 / 12, 50, "may-24"], [2024 + 9.5 / 12, 150, "oct-24"], [2025 + 3.5 / 12, 250, "abr-25 ⚠"],
      [2026 + 1.5 / 12, 400, "feb-26"], [2026 + 3.5 / 12, 500, "abr-26"],
    ];
    const line = svg("path", { d: "M" + pts.map((p) => `${x(p[0])},${y(p[1])}`).join(" L"), fill: "none", stroke: C.green, "stroke-width": 7 }, s);
    const line2 = svg("path", { d: line.getAttribute("d"), fill: "none", stroke: C.ink, "stroke-width": 2 }, s);
    Deck.draw(tl, line, 0.5, 1.4);
    Deck.draw(tl, line2, 0.5, 1.4);
    pts.forEach((p, i) => {
      const g = svg("g", {}, s);
      svg("rect", { x: x(p[0]) - 10, y: y(p[1]) - 10, width: 20, height: 20, fill: C.green, stroke: C.ink, "stroke-width": 3 }, g);
      svg("text", { x: x(p[0]) - 8, y: y(p[1]) - 18, "text-anchor": "end", "font-size": 18, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: `${p[1]}k` }, g);
      const hit = svg("circle", { cx: x(p[0]), cy: y(p[1]), r: 22, fill: "transparent" }, g);
      hit.addEventListener("mousemove", (e) => tip.show(e, `<b>${p[2]}</b><br>${p[1]}.000 viajes/semana`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
      tl.from(g, { scale: 0, transformOrigin: `${x(p[0])}px ${y(p[1])}px`, duration: 0.3, ease: "back.out(3)" }, 0.6 + i * 0.28);
    });
    // car icon running along the line
    const car = svg("text", { "font-size": 34, "text-anchor": "middle", text: "🚕" }, s);
    const L2 = line.getTotalLength();
    const cs = { t: 0 };
    tl.to(cs, { t: 1, duration: 1.4, ease: "power2.inOut", onUpdate: () => { const q = line.getPointAtLength(cs.t * L2); car.setAttribute("x", q.x); car.setAttribute("y", q.y - 14); } }, 0.5);
    tl.to(car, { opacity: 0, duration: 0.3 }, 1.9);
    tl.from(tg, { opacity: 0, duration: 0.3 }, 1.9);
    tl.from(band, { opacity: 0, scaleX: 0, transformOrigin: `${x(2026.3)}px ${y(500)}px`, duration: 0.8, ease: "power3.out" }, 2.1);
    tl.from(goal, { opacity: 0, scale: 0, transformOrigin: `${x(2026.95)}px ${y(1000)}px`, duration: 0.4, ease: "back.out(3)" }, 2.7);
    Deck.stamp(tl, slide.querySelectorAll(".wy-s"), 1.0, { stagger: 0.35 });
    return { tl };
  };

  /* One brain, many bodies: hub & spokes with pulses. */
  anims.brains = function (slide) {
    const W = 1000, H = 590;
    const s = Deck.stageSvg(slide.querySelector("#br-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const cx = 500, cy = 280;
    const bodies = [
      { n: "Humanoide", e: "🦾", a: -150 },
      { n: "Brazo industrial", e: "🦿", a: -90 },
      { n: "Robot de almacén", e: "📦", a: -30 },
      { n: "Coche autónomo", e: "🚗", a: 30 },
      { n: "Robot doméstico", e: "🏠", a: 150 },
    ];
    const paths = [];
    const dotLayer = svg("g", {}, s);
    bodies.forEach((b, i) => {
      const r = 230;
      const bx = cx + r * 1.45 * Math.cos((b.a * Math.PI) / 180), by = cy + r * Math.sin((b.a * Math.PI) / 180);
      const path = svg("path", { d: `M${cx} ${cy} L${bx} ${by}`, stroke: C.ink, "stroke-width": 4, fill: "none" }, dotLayer);
      paths.push(path);
      Deck.draw(tl, path, 1.0 + i * 0.08, 0.5);
      const g = svg("g", {}, s);
      svg("rect", { x: bx - 78 + 5, y: by - 40 + 5, width: 156, height: 80, fill: C.ink }, g);
      svg("rect", { x: bx - 78, y: by - 40, width: 156, height: 80, fill: [C.bg2, C.yellow, C.lilac, C.green, C.yellow][i], stroke: C.ink, "stroke-width": 3 }, g);
      svg("text", { x: bx, y: by + 2, "text-anchor": "middle", "font-size": 32, text: b.e }, g);
      svg("text", { x: bx, y: by + 28, "text-anchor": "middle", "font-size": 14, "font-family": Deck.MONO, fill: C.ink, text: b.n }, g);
      tl.from(g, { scale: 0, transformOrigin: `${bx}px ${by}px`, duration: 0.4, ease: "back.out(3)" }, 1.3 + i * 0.1);
    });
    const hub = svg("g", {}, s);
    svg("rect", { x: cx - 120 + 8, y: cy - 70 + 8, width: 240, height: 140, fill: C.ink }, hub);
    const hr = svg("rect", { x: cx - 120, y: cy - 70, width: 240, height: 140, fill: C.accent2, stroke: C.ink, "stroke-width": 4 }, hub);
    svg("text", { x: cx, y: cy - 16, "text-anchor": "middle", "font-size": 24, "font-family": Deck.BLACK, fill: "#fff", text: "1 MODELO" }, hub);
    svg("text", { x: cx, y: cy + 14, "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: "#fff", text: "visión · lenguaje · acción" }, hub);
    svg("text", { x: cx, y: cy + 40, "text-anchor": "middle", "font-size": 14, "font-family": Deck.MONO, fill: "#fff", text: "Gemini Robotics · π · GR00T" }, hub);
    tl.from(hub, { scale: 0, rotation: -20, transformOrigin: `${cx}px ${cy}px`, duration: 0.5, ease: "back.out(2)" }, 0.5);
    // world model feeding the hub
    const wm = svg("g", {}, s);
    svg("rect", { x: cx - 150, y: H - 84, width: 300, height: 56, fill: C.lilac, stroke: C.ink, "stroke-width": 3, "stroke-dasharray": "8 5" }, wm);
    svg("text", { x: cx, y: H - 50, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.ink, text: "🌍 world model = simulador" }, wm);
    const wl = svg("path", { d: `M${cx} ${H - 84} L${cx} ${cy + 70}`, stroke: C.ink, "stroke-width": 3, "stroke-dasharray": "6 5", fill: "none" }, wm);
    tl.from(wm, { opacity: 0, y: 30, duration: 0.4 }, 2.1);
    let loops = [];
    if (!Deck.isPrint) {
      const lp = gsap.timeline({ repeat: -1, delay: 2.4 });
      paths.forEach((p, i) => Deck.pulse(lp, dotLayer, p, i * 0.15, { color: C.yellow, r: 8, duration: 0.8 }));
      lp.to(hr, { attr: { fill: C.accent }, duration: 0.15, yoyo: true, repeat: 1 }, 0);
      lp.to({}, { duration: 0.6 });
      loops.push(lp);
    }
    Deck.stamp(tl, slide.querySelectorAll(".br-s"), 1.2, { stagger: 0.35 });
    return { tl, destroy: () => loops.forEach((l) => l.kill()) };
  };
})();
