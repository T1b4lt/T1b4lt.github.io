/* Block 04 · Startups: VC share, YC RFS evolution, ARR race, boom radar. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  /* Global VC by quarter: total bar with the AI portion filled. */
  anims.vc = function (slide, { signal }) {
    const W = 1000, H = 590;
    const s = Deck.stageSvg(slide.querySelector("#vc-stage"), W, H);
    const HATCH = Deck.hatchDef(s, C.lilac);
    const host = slide.querySelector("#vc-stage");
    const tip = Deck.tooltip(slide.querySelector("#vc-tip"), host);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const q = [
      { l: "Q2-25", tot: 91, ai: 0.48, note: "<50 %" },
      { l: "Q3-25", tot: 104, ai: 0.5, note: "~50 %" },
      { l: "Q1-26", tot: 300, ai: 0.8, note: "~80 % ⚠", est: true },
      { l: "Q2-26", tot: 212, ai: 0.7, note: ">70 %" },
      { l: "Q3-26", tot: 159, ai: 0.64, note: "64 %" },
    ];
    const L = 70, B = H - 70, T = 30;
    const y = Deck.lin(0, 320, B, T);
    [0, 100, 200, 300].forEach((v) => {
      svg("line", { x1: L, x2: W - 10, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: `$${v}` }, s);
    });
    svg("text", { x: L - 10, y: T - 10, "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: "miles de M$ / trimestre" }, s);
    const bw = 120, gap = (W - L - 20 - bw * q.length) / q.length;
    q.forEach((d, i) => {
      const x = L + gap / 2 + i * (bw + gap);
      const tot = Deck.brutBar(s, x, B, bw, C.bg2);
      Deck.growBar(tl, tot, B, B - y(d.tot), 0.5 + i * 0.2, 0.6);
      const ai = svg("rect", { x, y: B, width: bw, height: 0, fill: d.est ? HATCH : C.accent, stroke: C.ink, "stroke-width": 3 }, s);
      const hA = B - y(d.tot * d.ai);
      tl.to(ai, { attr: { y: B - hA, height: hA }, duration: 0.7, ease: "power3.out" }, 1.5 + i * 0.2);
      const pl = svg("g", {}, s);
      svg("rect", { x: x + bw / 2 - 52, y: B - hA / 2 - 18, width: 104, height: 36, fill: C.yellow, stroke: C.ink, "stroke-width": 2.5 }, pl);
      svg("text", { x: x + bw / 2, y: B - hA / 2 + 7, "text-anchor": "middle", "font-size": 18, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: d.note }, pl);
      tl.from(pl, { scale: 0, transformOrigin: `${x + bw / 2}px ${B - hA / 2}px`, duration: 0.3, ease: "back.out(3)" }, 2.0 + i * 0.2);
      const tt = svg("text", { x: x + bw / 2, y: y(d.tot) - 12, "text-anchor": "middle", "font-size": 18, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: `$${d.tot}` }, s);
      tl.from(tt, { opacity: 0, duration: 0.3 }, 1.0 + i * 0.2);
      svg("text", { x: x + bw / 2, y: B + 28, "text-anchor": "middle", "font-size": 17, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: d.l }, s);
      const hit = svg("rect", { x, y: T, width: bw, height: B - T, fill: "transparent" }, s);
      hit.addEventListener("mousemove", (e) => tip.show(e, `<b>${d.l}</b><br>Total: $${d.tot} mil M · IA: ${d.note}`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
    });
    svg("line", { x1: L, x2: W - 10, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, s);
    // legend
    const lg = svg("g", {}, s);
    svg("rect", { x: W - 330, y: 40, width: 22, height: 22, fill: C.accent, stroke: C.ink, "stroke-width": 2 }, lg);
    svg("text", { x: W - 300, y: 57, "font-size": 16, "font-family": Deck.MONO, fill: C.ink, text: "IA" }, lg);
    svg("rect", { x: W - 250, y: 40, width: 22, height: 22, fill: C.bg2, stroke: C.ink, "stroke-width": 2 }, lg);
    svg("text", { x: W - 220, y: 57, "font-size": 16, "font-family": Deck.MONO, fill: C.ink, text: "resto" }, lg);
    svg("text", { x: W - 330, y: 88, "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: "Q1-26: OpenAI $122k M + Anthropic $30k M" }, lg);
    tl.from(lg, { opacity: 0, duration: 0.4 }, 0.6);
    Deck.stamp(tl, slide.querySelectorAll(".vc-s"), 1.2, { stagger: 0.4 });
    return { tl };
  };

  /* YC: RFS themes rain down by batch, colour-coded; then batch metrics grow. */
  anims.yc = function (slide) {
    const W = 1424, H = 300;
    const s = Deck.stageSvg(slide.querySelector("#yc-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const cat = { soft: C.bg2, agent: C.lilac, atoms: C.accent2, cons: C.yellow, svc: C.green };
    const cols = [
      { b: "S25", items: [["AI law firm", "svc"], ["Voice AI", "agent"], ["AI for science", "atoms"], ["AI tutor", "cons"], ["Robotics dev tools", "atoms"]] },
      { b: "F25", items: [["$100B co. · 10 people", "svc"], ["Multi-agent infra", "agent"], ["AI-native Salesforce", "soft"], ["Generative video", "cons"]] },
      { b: "SP26", items: [["AI-Native Agencies", "svc"], ["AI-Native Hedge Funds", "svc"], ["Modern Metal Mills", "atoms"], ["AI for Government", "soft"], ["AI for Physical Work", "atoms"]] },
      { b: "SU26", items: [["Counter-Swarm Defense", "atoms"], ["Inference Chips", "atoms"], ["Electronics in Space", "atoms"], ["Software for Agents", "agent"], ["AI-Native Services", "svc"]] },
      { b: "F26", items: [["American Defense", "atoms"], ["Compute at Sea", "atoms"], ["Physical-World OS", "atoms"], ["Data for Real World", "atoms"], ["Multiplayer AI", "cons"], ["Proving You're Human", "agent"], ["Consumer for 1B", "cons"]] },
    ];
    const colW = 270;
    cols.forEach((c, ci) => {
      const x0 = ci * (colW + 18);
      const hd = svg("g", {}, s);
      svg("rect", { x: x0, y: 0, width: colW, height: 32, fill: C.ink }, hd);
      svg("text", { x: x0 + colW / 2, y: 22, "text-anchor": "middle", "font-size": 17, "font-family": Deck.MONO, fill: C.yellow, "font-weight": 700, text: `RFS ${c.b}` }, hd);
      tl.from(hd, { opacity: 0, y: -20, duration: 0.3 }, 0.4 + ci * 0.1);
      c.items.forEach(([t, k], ii) => {
        const g = Deck.chip(s, x0, 42 + ii * 36, t, { size: 15, fill: cat[k], h: 30, charW: 0.6, textColor: k === "atoms" ? "#fff" : C.ink });
        const w = +g.dataset.w;
        if (w > colW) g.setAttribute("transform", `scale(${colW / w}) translate(${x0 * (w / colW - 1)} 0)`);
        tl.from(g, { opacity: 0, y: -120, rotation: (ii % 2 ? 8 : -8), duration: 0.45, ease: "bounce.out" }, 0.7 + ci * 0.25 + ii * 0.06);
      });
    });
    // legend
    const lg = svg("g", {}, s);
    [["Átomos: defensa, chips, espacio, fábricas", "atoms"], ["Servicios AI-native", "svc"], ["Infra de agentes", "agent"], ["Consumo", "cons"]].forEach(([t, k], i) => {
      const lx = [0, 470, 720, 950][i];
      svg("rect", { x: lx, y: H - 26, width: 20, height: 20, fill: cat[k], stroke: C.ink, "stroke-width": 2 }, lg);
      svg("text", { x: lx + 28, y: H - 10, "font-size": 15, "font-family": Deck.MONO, fill: C.ink, text: t }, lg);
    });
    tl.from(lg, { opacity: 0, duration: 0.4 }, 2.2);
    tl.addLabel("s0");
    // step 1 · batch metrics
    const fills = slide.querySelectorAll("#yc-bars .fill");
    const metrics = slide.querySelectorAll("#yc-bars .lbl, #yc-bars .track, #yc-bars .val, #yc-metrics .callout");
    gsap.set(metrics, { opacity: 0 });
    tl.to(metrics, { opacity: 1, duration: 0.3, stagger: 0.03 }, "s0");
    fills.forEach((f, i) => {
      const a = +f.dataset.a, b = +f.dataset.b, m = +f.dataset.max;
      tl.fromTo(f, { width: `${(a / m) * 100}%` }, { width: `${(b / m) * 100}%`, duration: 0.9, ease: "power3.inOut" }, `s0+=${0.4 + i * 0.12}`);
    });
    tl.from(slide.querySelector("#yc-metrics .callout"), { x: 100, rotation: 3, duration: 0.5, ease: "back.out(2)" }, "s0+=0.3");
    tl.addLabel("s1");
    return { tl };
  };

  /* ARR race: log-scale lines for revenue run-rates. */
  anims.arr = function (slide) {
    const W = 1424, H = 470;
    const s = Deck.stageSvg(slide.querySelector("#ar-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const L = 90, R = 1180, B = H - 40, T = 20;
    const x = Deck.lin(2025.6, 2026.75, L, R);
    const y = Deck.logScale(0.08, 100, B, T);
    [[0.1, "$100 M"], [1, "$1.000 M"], [10, "$10.000 M"], [100, "$100.000 M"]].forEach(([v, l]) => {
      svg("line", { x1: L, x2: R, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: l }, s);
    });
    [[2025 + 9 / 12, "oct-25"], [2026, "ene-26"], [2026 + 3 / 12, "abr-26"], [2026 + 6 / 12, "jul-26"], [2026 + 9 / 12, "oct-26"]].forEach(([v, l]) =>
      svg("text", { x: x(v), y: B + 28, "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: C.ink, text: l }, s),
    );
    svg("line", { x1: L, x2: R, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, s);
    const m = (yy, mm) => yy + (mm - 1) / 12;
    const series = [
      { n: "Anthropic", c: C.accent2, pts: [[m(2025, 12), 9], [m(2026, 2), 14], [m(2026, 4), 30], [m(2026, 5), 47], [m(2026, 7), 65]] },
      { n: "OpenAI*", c: C.ink, pts: [[m(2026, 3), 25], [m(2026, 8), 40], [m(2026, 10), 50]] },
      { n: "Cursor", c: C.accent, pts: [[m(2025, 11), 1], [m(2026, 2), 2], [m(2026, 6), 4]] },
      { n: "Claude Code", c: C.warm, pts: [[m(2025, 9), 0.5], [m(2025, 11), 1], [m(2026, 2), 2.5]] },
      { n: "Cognition", c: C.green, pts: [[m(2026, 5), 0.49], [m(2026, 9), 0.9]] },
      { n: "Lovable", c: C.lilac, pts: [[m(2026, 3), 0.1], [m(2026, 9), 0.55]] },
    ];
    series.forEach((sr, i) => {
      const d = "M" + sr.pts.map((p) => `${x(p[0])},${y(p[1])}`).join(" L");
      const sh = svg("path", { d, fill: "none", stroke: C.ink, "stroke-width": 9, "stroke-linecap": "square" }, s);
      const p = svg("path", { d, fill: "none", stroke: sr.c, "stroke-width": 5, "stroke-linecap": "square" }, s);
      if (sr.c === C.ink) p.setAttribute("stroke", C.yellow);
      Deck.draw(tl, sh, 0.6 + i * 0.25, 1.0);
      Deck.draw(tl, p, 0.6 + i * 0.25, 1.0);
      const last = sr.pts[sr.pts.length - 1];
      const lab = svg("g", {}, s);
      const txt = `${sr.n} · $${Deck.fmt(last[1], last[1] < 10 && last[1] % 1 ? (last[1] < 1 ? 2 : 1) : 0)} mil M`;
      const lw = txt.length * 10 + 16;
      const dy = sr.n === "Claude Code" ? 34 : sr.n === "Lovable" ? 14 : sr.n === "Cognition" ? -14 : 0;
      const dx = sr.n === "Claude Code" ? -150 : 0;
      svg("rect", { x: x(last[0]) + 14 + dx, y: y(last[1]) - 15 + dy, width: lw, height: 30, fill: sr.c === C.ink ? C.yellow : sr.c, stroke: C.ink, "stroke-width": 2.5 }, lab);
      svg("text", { x: x(last[0]) + 22 + dx, y: y(last[1]) + 6 + dy, "font-size": 16, "font-weight": 700, "font-family": Deck.MONO, fill: [C.accent, C.accent2].includes(sr.c) ? "#fff" : C.ink, text: txt }, lab);
      tl.from(lab, { opacity: 0, x: -20, duration: 0.3 }, 1.5 + i * 0.25);
    });
    svg("text", { x: R, y: B - 12, "text-anchor": "end", "font-size": 13, "font-family": Deck.MONO, fill: C.muted, text: "* OpenAI: ~$50 mil M tras la corrección (Axios)" }, s);
    return { tl };
  };

  /* Radar table: rows stamp; signal cells fill with blocks. */
  anims.radar = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const rows = slide.querySelectorAll("#rd-tbl tbody tr");
    tl.from(slide.querySelector("#rd-tbl thead"), { opacity: 0, y: -20, duration: 0.3 }, 0.4);
    rows.forEach((r, i) => {
      r.querySelectorAll("td[data-v]").forEach((td) => {
        const v = +td.dataset.v;
        td.textContent = "■".repeat(v) + "□".repeat(2 - v);
        td.style.color = v === 2 ? C.accent : v === 1 ? C.ink : C.muted;
      });
      tl.from(r, { opacity: 0, x: i % 2 ? 60 : -60, duration: 0.35, ease: "back.out(2)" }, 0.5 + i * 0.12);
      tl.from(r.querySelector(".conf"), { scale: 0, duration: 0.3, ease: "back.out(4)" }, 0.75 + i * 0.12);
    });
    const hl = [rows[0], rows[1], rows[2], rows[3]];
    tl.to(hl.map((r) => r.querySelector("td")), { backgroundColor: C.yellow, duration: 0.3, stagger: 0.1 }, 2.0);
    return { tl };
  };
})();
