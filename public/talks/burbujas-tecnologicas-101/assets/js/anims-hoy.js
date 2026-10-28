/* Bloque 4–5 · la IA hoy y cierre: receta, capex/PIB, hueco de ingresos,
   financiación circular (stepped), vendor financing, deuda, SPV (stepped),
   reloj de las GPU (interactiva), señales y cierre. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C, label } = Deck;

  /** Rounded node box with a title and an optional subtitle. */
  function node(s, cx, cy, w, h, title, sub, color) {
    const g = svg("g", {}, s);
    svg("rect", { x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 14, fill: "rgba(236,226,205,0.05)", stroke: color, "stroke-width": 2 }, g);
    label(g, cx, cy + (sub ? -4 : 9), title, { anchor: "middle", font: Deck.DISPLAY, size: 27, weight: 600, fill: C.text });
    if (sub) label(g, cx, cy + 24, sub, { anchor: "middle", font: Deck.MONO, size: 15, fill: color });
    return g;
  }

  /** Arrow path with a small head; returns { path, head }. */
  function arrow(s, d, color, opts) {
    const o = Object.assign({ width: 2.5, dash: null }, opts);
    const path = svg("path", { d, stroke: color, "stroke-width": o.width, fill: "none" }, s);
    if (o.dash) path.setAttribute("stroke-dasharray", o.dash);
    const L = path.getTotalLength();
    const p1 = path.getPointAtLength(L), p0 = path.getPointAtLength(L - 12);
    const a = Math.atan2(p1.y - p0.y, p1.x - p0.x);
    const hx = (k, r) => `${p1.x - 14 * Math.cos(a + k) } ${p1.y - 14 * Math.sin(a + k)}`;
    const head = svg("path", { d: `M${p1.x} ${p1.y} L${hx(0.45)} L${hx(-0.45)} Z`, fill: color }, s);
    return { path, head };
  }

  /** Simple vertical bar chart on one scale. */
  function vbars(s, W, H, data, max, fmt) {
    const base = H - 50, top = 40, n = data.length;
    const bw = Math.min(110, (W - 60) / n - 30);
    const out = [];
    svg("line", { x1: 10, x2: W - 10, y1: base, y2: base, stroke: C.lineStrong }, s);
    data.forEach((d, i) => {
      const x = 20 + i * ((W - 40) / n) + ((W - 40) / n - bw) / 2;
      const h = (d.v / max) * (base - top);
      const r = svg("rect", { x, y: base, width: bw, height: 0, rx: 4, fill: d.color || C.markB }, s);
      const v = label(s, x + bw / 2, base - h - 12, d.label || fmt(d.v), { anchor: "middle", font: Deck.DISPLAY, size: 30, weight: 700, fill: C.text, opacity: 0 });
      label(s, x + bw / 2, base + 26, d.k, { anchor: "middle", font: Deck.MONO, size: 15, fill: C.text2 });
      out.push({ r, v, h, base });
    });
    return out;
  }

  anims.recipe = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".rc-tbl thead"), { opacity: 0, duration: 0.4 }, 0);
    tl.from(slide.querySelectorAll(".rc-tbl tbody tr"), { opacity: 0, x: -20, stagger: 0.28, duration: 0.45 }, 0.2);
    return { tl };
  };

  /* ---------- 18 · Capex / PIB (rango) + cobertura de ingresos ---------- */
  anims.capexgdp = function (slide, { signal }) {
    const W = 746, H = 400;
    const s = Deck.stageSvg(slide.querySelector("#cg-stage"), W, H);
    const tip = Deck.tooltip(slide.querySelector("#cg-tip"), slide.querySelector(".cg-grid"));
    const tl = gsap.timeline({ paused: true });
    const x0 = 250, x1 = 720, max = 8;
    const x = (v) => x0 + (v / max) * (x1 - x0);
    [0, 2, 4, 6, 8].forEach((v) => {
      svg("line", { x1: x(v), x2: x(v), y1: 20, y2: 350, stroke: C.line, opacity: v ? 0.6 : 1 }, s);
      label(s, x(v), 378, `${v} %`, { anchor: "middle", font: Deck.MONO, size: 15, fill: C.muted });
    });
    const rows = [
      { k: "Ferrocarril RU · 1847", lo: 7.3, hi: 7.3, t: "7,3 %", src: "Odlyzko (2010), PIB británico" },
      { k: "Ferrocarril EE. UU. · pico", lo: 3.6, hi: 6, t: "3,6–6 %", src: "Azhar (3,6 %) · Kedrosky (~6 %)" },
      { k: "Telecom · 2000", lo: 1, hi: 1.2, t: "1–1,2 %", src: "Azhar · Kedrosky" },
      { k: "IA · 2025", lo: 1.2, hi: 2, t: "1,2–2 %", src: "Kedrosky (jul-2025), cota alta discutible", ai: true },
    ];
    rows.forEach((r, i) => {
      const y = 50 + i * 82;
      label(s, 0, y + 6, r.k, { size: 19, fill: r.ai ? C.text : C.text2, weight: r.ai ? 600 : 400 });
      const w = Math.max(14, x(r.hi) - x(r.lo));
      const bar = svg("rect", { x: x(r.lo) - (r.lo === r.hi ? 7 : 0), y: y - 12, width: w, height: 24, rx: 12, fill: r.ai ? C.markA : C.markB }, s);
      const t = label(s, x(r.hi) + 14, y + 6, r.t, { font: Deck.MONO, size: 17, fill: C.text, opacity: 0 });
      if (r.hi > 6.5) t.setAttribute("x", x(r.lo) - 20), t.setAttribute("text-anchor", "end");
      if (r.lo === r.hi) bar.setAttribute("rx", 7), bar.setAttribute("width", 14);
      tl.from(bar, { attr: { width: 0 }, duration: 0.7, ease: "power3.out" }, 0.2 + i * 0.25);
      tl.to(t, { opacity: 1, duration: 0.3 }, 0.6 + i * 0.25);
      const hit = svg("rect", { x: 0, y: y - 30, width: W, height: 60, fill: "transparent" }, s);
      hit.addEventListener("mousemove", (e) => tip.show(e, `${r.k}: <b>${r.t}</b><br>${r.src}`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
    });

    const s2 = Deck.stageSvg(slide.querySelector("#cv-stage"), 600, 400);
    const bars = vbars(s2, 600, 400, [
      { k: "Ferrocarril", v: 67, label: "~⅔" },
      { k: "Telecom 2000", v: 25, label: "~¼" },
      { k: "IA 2025", v: 15, label: "~15 %", color: C.markA },
    ], 80, (v) => `${v} %`);
    bars.forEach((b, i) => {
      tl.to(b.r, { attr: { y: b.base - b.h, height: b.h }, duration: 0.7, ease: "power3.out" }, 1.4 + i * 0.25);
      tl.to(b.v, { opacity: 1, duration: 0.3 }, 1.9 + i * 0.25);
    });
    return { tl };
  };

  /* ---------- 19 · Hueco de ingresos (OpenAI) ---------- */
  anims.gap = function (slide) {
    const W = 1424, H = 430;
    const s = Deck.stageSvg(slide.querySelector("#gp-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const x0 = 430, sc = (1424 - x0 - 140) / 856;
    const rows = [
      { k: "Cómputo comprometido 2026–2030", v: 856, color: C.markA, t: "~856 mil M$" },
      { k: "Ingresos previstos 2026", v: 36, color: C.markB, t: "~36 mil M$" },
      { k: "Objetivo de ingresos 2030", v: 350, color: "none", stroke: C.markB, t: "~350 mil M$ (objetivo)" },
      { k: "Caja quemada acumulada 2026–30", v: 278, color: "rgba(239,91,79,0.25)", stroke: C.warm, t: "~−278 mil M$" },
    ];
    svg("line", { x1: x0, x2: x0, y1: 20, y2: 400, stroke: C.lineStrong }, s);
    rows.forEach((r, i) => {
      const y = 50 + i * 96;
      label(s, x0 - 20, y + 8, r.k, { anchor: "end", size: 21, fill: C.text });
      const bar = svg("rect", { x: x0, y: y - 22, width: 0, height: 44, rx: 4, fill: r.color, stroke: r.stroke || "none", "stroke-width": 2, "stroke-dasharray": r.stroke ? "7 5" : null }, s);
      const t = label(s, x0 + r.v * sc + 14, y + 8, r.t, { font: Deck.MONO, size: 19, fill: C.text, opacity: 0 });
      tl.to(bar, { attr: { width: r.v * sc }, duration: 0.9, ease: "power3.out" }, 0.3 + i * 0.5);
      tl.to(t, { opacity: 1, duration: 0.3 }, 0.9 + i * 0.5);
    });
    const ratio = label(s, x0 + 36 * sc + 280, 50 + 96 + 8, "", { font: Deck.DISPLAY, size: 30, weight: 700, fill: C.accent, opacity: 0 });
    ratio.textContent = "← el cómputo equivale a ~24× los ingresos de este año";
    ratio.setAttribute("font-size", 22);
    ratio.setAttribute("x", x0 + 36 * sc + 200);
    tl.to(ratio, { opacity: 1, duration: 0.5 }, 2.6);
    const tag = label(s, W - 10, 420, "Todas las cifras son proyecciones internas de OpenAI publicadas por el FT", { anchor: "end", size: 16, fill: C.muted, italic: true });
    tl.from(tag, { opacity: 0, duration: 0.4 }, 2.4);
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 14, duration: 0.6 }, 3.0);
    return { tl };
  };

  /* ---------- 20 · Financiación circular (stepped) ---------- */
  anims.circular = function (slide) {
    const W = 1424, H = 470;
    const s = Deck.stageSvg(slide.querySelector("#cc-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#cc-caption"), [
      "<strong>1 ·</strong> Oracle y CoreWeave <strong>compran GPU a NVIDIA</strong> (a menudo con deuda) para construir centros de datos.",
      "<strong>2 ·</strong> Alquilan esa capacidad a <strong>OpenAI</strong> con contratos de varios años: OpenAI es ~50 % de la cartera de pedidos de Oracle (&gt; 600 mil M$).",
      "<strong>3 ·</strong> Y <strong>NVIDIA invierte en sus clientes</strong>: 30 mil M$ en OpenAI, acciones de CoreWeave y garantías. Parte de ese dinero vuelve a NVIDIA en forma de pedidos.",
      "<strong>4 · La pregunta clave:</strong> ¿cuánto dinero <strong class='c-accent-2'>entra desde fuera</strong> del círculo (clientes que pagan) y cuánto solo da vueltas? Y el famoso «acuerdo de 100 mil M$» nunca se firmó.",
    ]);
    const N = { x: 712, y: 60 }, O = { x: 712, y: 400 }, OR = { x: 250, y: 230 }, CW = { x: 1174, y: 230 };
    const money = C.accent, chips = C.markB;
    // Step 1: chips NVIDIA -> Oracle/CoreWeave, money back
    const a1 = arrow(s, `M${N.x - 130} ${N.y + 10} Q ${OR.x + 40} ${N.y + 10} ${OR.x} ${OR.y - 46}`, chips);
    const a2 = arrow(s, `M${N.x + 130} ${N.y + 10} Q ${CW.x - 40} ${N.y + 10} ${CW.x} ${CW.y - 46}`, chips);
    const m1 = svg("path", { d: `M${OR.x + 60} ${OR.y - 46} Q ${OR.x + 160} ${N.y + 60} ${N.x - 130} ${N.y + 30}`, stroke: money, "stroke-width": 2, fill: "none", "stroke-dasharray": "3 6", opacity: 0.6 }, s);
    const m2 = svg("path", { d: `M${CW.x - 60} ${CW.y - 46} Q ${CW.x - 160} ${N.y + 60} ${N.x + 130} ${N.y + 30}`, stroke: money, "stroke-width": 2, fill: "none", "stroke-dasharray": "3 6", opacity: 0.6 }, s);
    const l1 = label(s, 400, 70, "GPU", { font: Deck.MONO, size: 16, fill: chips });
    const l1b = label(s, 1024, 70, "GPU", { font: Deck.MONO, size: 16, fill: chips, anchor: "end" });
    // Step 2: compute to OpenAI, money from OpenAI
    const a3 = arrow(s, `M${OR.x} ${OR.y + 46} Q ${OR.x + 40} ${O.y} ${O.x - 150} ${O.y}`, chips);
    const a4 = arrow(s, `M${CW.x} ${CW.y + 46} Q ${CW.x - 40} ${O.y} ${O.x + 150} ${O.y}`, chips);
    const m3 = svg("path", { d: `M${O.x - 150} ${O.y - 24} Q ${OR.x + 140} ${O.y - 40} ${OR.x + 90} ${OR.y + 46}`, stroke: money, "stroke-width": 2, fill: "none", "stroke-dasharray": "3 6", opacity: 0.6 }, s);
    const m4 = svg("path", { d: `M${O.x + 150} ${O.y - 24} Q ${CW.x - 140} ${O.y - 40} ${CW.x - 90} ${CW.y + 46}`, stroke: money, "stroke-width": 2, fill: "none", "stroke-dasharray": "3 6", opacity: 0.6 }, s);
    const l3 = label(s, 240, 432, "capacidad de cómputo", { font: Deck.MONO, size: 16, fill: chips });
    const l3b = label(s, 395, 300, "contratos ($)", { font: Deck.MONO, size: 16, fill: money });
    // Step 3: NVIDIA invests in OpenAI & CoreWeave
    const a5 = arrow(s, `M${N.x} ${N.y + 46} L ${O.x} ${O.y - 46}`, money, { width: 3.5 });
    const a6 = arrow(s, `M${N.x + 60} ${N.y + 46} Q ${CW.x - 260} ${CW.y - 20} ${CW.x - 130} ${CW.y}`, money, { width: 3.5 });
    const l5 = label(s, N.x + 14, 210, "30 mil M$ en acciones", { font: Deck.MONO, size: 16, fill: money });
    const l5b = label(s, N.x + 14, 232, "+ garantías hasta 105 mil M$", { font: Deck.MONO, size: 16, fill: money });
    const l6 = label(s, 940, 156, "acciones + 6,3 mil M$", { font: Deck.MONO, size: 16, fill: money, anchor: "middle" });
    // Step 4: outside money
    const ext = arrow(s, `M${O.x} ${O.y + 70} L ${O.x} ${O.y + 36}`, C.accent2, { width: 4 });
    const extL = label(s, O.x + 160, O.y + 58, "clientes que pagan: OpenAI > 40 mil M$/año", { font: Deck.MONO, size: 16, fill: C.accent2 });
    const debt = arrow(s, `M${OR.x - 180} ${OR.y + 140} Q ${OR.x - 100} ${OR.y + 80} ${OR.x - 80} ${OR.y + 46}`, C.warm, { width: 3 });
    const debtL = label(s, OR.x - 196, OR.y + 166, "deuda y bonos", { font: Deck.MONO, size: 16, fill: C.warm });
    const stamp = svg("g", {}, s);
    svg("rect", { x: 900, y: 286, width: 300, height: 66, rx: 8, fill: "#1d1210", stroke: C.warm, "stroke-width": 2.5, transform: "rotate(-4 1050 319)" }, stamp);
    label(stamp, 1050, 313, "100 mil M$ anunciados", { anchor: "middle", font: Deck.MONO, size: 17, fill: C.warm }).setAttribute("transform", "rotate(-4 1050 319)");
    label(stamp, 1050, 338, "NUNCA FIRMADO → 30", { anchor: "middle", font: Deck.MONO, size: 17, fill: C.warm, weight: 600 }).setAttribute("transform", "rotate(-4 1050 319)");

    // Dark halo so labels stay legible where they cross the flow lines.
    [l5, l5b, l6, l3, l3b, extL].forEach((t) => {
      t.setAttribute("stroke", C.bg);
      t.setAttribute("stroke-width", 6);
      t.setAttribute("paint-order", "stroke");
    });
    const nN = node(s, N.x, N.y, 260, 92, "NVIDIA", "vende GPU", chips);
    const nOR = node(s, OR.x, OR.y, 240, 92, "Oracle", "BBB− · deuda", C.text2);
    const nCW = node(s, CW.x, CW.y, 240, 92, "CoreWeave", "neocloud · deuda", C.text2);
    const nO = node(s, O.x, O.y, 300, 92, "OpenAI", "pierde dinero hoy", C.accent);

    const g1 = [a1.path, a1.head, a2.path, a2.head, m1, m2, l1, l1b];
    const g2 = [a3.path, a3.head, a4.path, a4.head, m3, m4, l3, l3b];
    const g3 = [a5.path, a5.head, a6.path, a6.head, l5, l5b, l6];
    const g4 = [ext.path, ext.head, extL, debt.path, debt.head, debtL, stamp];
    gsap.set([...g1, ...g2, ...g3, ...g4, nO], { opacity: 0 });

    tl.from([nN, nOR, nCW], { opacity: 0, y: 14, stagger: 0.15, duration: 0.5 }, 0);
    tl.to(g1, { opacity: 1, duration: 0.5 }, 0.5);
    Deck.pulse(tl, s, a1.path, 0.9, { color: chips });
    Deck.pulse(tl, s, a2.path, 0.9, { color: chips });
    Deck.pulse(tl, s, m1, 1.6, { color: money });
    Deck.pulse(tl, s, m2, 1.6, { color: money });
    show(0, 0.2);
    tl.addLabel("s0");

    show(1, "s0");
    tl.to(nO, { opacity: 1, duration: 0.5 }, "s0");
    tl.to(g2, { opacity: 1, duration: 0.5 }, "s0+=0.3");
    Deck.pulse(tl, s, a3.path, tl.labels.s0 + 0.7, { color: chips });
    Deck.pulse(tl, s, a4.path, tl.labels.s0 + 0.7, { color: chips });
    Deck.pulse(tl, s, m3, tl.labels.s0 + 1.4, { color: money });
    Deck.pulse(tl, s, m4, tl.labels.s0 + 1.4, { color: money });
    tl.addLabel("s1", "s0+=2.4");

    show(2, "s1");
    tl.to(g3, { opacity: 1, duration: 0.5, stagger: 0.1 }, "s1");
    Deck.pulse(tl, s, a5.path, tl.labels.s1 + 0.6, { color: money, r: 8 });
    Deck.pulse(tl, s, m3, tl.labels.s1 + 1.5, { color: money, r: 8 });
    Deck.pulse(tl, s, m1, tl.labels.s1 + 2.4, { color: money, r: 8 });
    tl.addLabel("s2", "s1+=3.4");

    show(3, "s2");
    tl.to(g4, { opacity: 1, duration: 0.5, stagger: 0.15 }, "s2");
    tl.from(stamp, { scale: 1.6, transformOrigin: "1050px 319px", duration: 0.4, ease: "back.out(2)" }, "s2+=0.9");
    tl.addLabel("s3", "s2+=1.4");
    return { tl };
  };

  anims.vendor = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".vd-grid .card"), { opacity: 0, y: 24, stagger: 0.5, duration: 0.6 }, 0);
    Deck.fillBars(tl, slide.querySelector(".vd-bars"), 0.4);
    tl.from(slide.querySelectorAll(".vd-grid .card:first-child p"), { opacity: 0, duration: 0.4, stagger: 0.2 }, 1.2);
    tl.from(slide.querySelectorAll(".vd-list li"), { opacity: 0, x: 20, stagger: 0.25, duration: 0.4 }, 1.0);
    tl.from(slide.querySelector(".vd-grid .card:last-child > p"), { opacity: 0, y: 10, duration: 0.5 }, 2.3);
    return { tl };
  };

  /* ---------- 22 · De caja a deuda ---------- */
  anims.debt = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const sets = [
      ["#db1", [{ k: "FY2024", v: 9, label: "9 %" }, { k: "12 m a jun-26", v: 32, label: "32 %", color: C.markA }], 40],
      ["#db2", [{ k: "2020–24 media", v: 28, label: "~28" }, { k: "2025", v: 121, label: "~121" }, { k: "2026 (10-ago)", v: 220, label: "~220", color: C.markA }], 240],
      ["#db3", [{ k: "feb-2026", v: 5, label: "5x" }, { k: "jul-2026", v: 1.9, label: "<2x", color: C.markA }], 6],
    ];
    sets.forEach(([sel, data, max], j) => {
      const s = Deck.stageSvg(slide.querySelector(sel), 440, 360);
      vbars(s, 440, 360, data, max).forEach((b, i) => {
        tl.to(b.r, { attr: { y: b.base - b.h, height: b.h }, duration: 0.7, ease: "power3.out" }, 0.3 + j * 0.7 + i * 0.25);
        tl.to(b.v, { opacity: 1, duration: 0.3 }, 0.8 + j * 0.7 + i * 0.25);
      });
    });
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 14, duration: 0.6 }, 2.8);
    return { tl };
  };

  /* ---------- 23 · SPV (stepped) ---------- */
  anims.spv = function (slide) {
    const W = 1424, H = 470;
    const s = Deck.stageSvg(slide.querySelector("#sp-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#sp-caption"), [
      "Meta necesita un centro de datos gigante, pero no quiere <strong>~27.000 M$ más de deuda</strong> en su balance.",
      "Crea con Blue Owl una <strong>sociedad aparte (SPV)</strong>. Meta solo tiene el 20 %, así que la deuda del SPV <strong>no aparece en su balance</strong>.",
      "El SPV emite <strong>27.300 M$ en bonos a 2049 al 6,58 %</strong> (más de lo que pagaría la propia Meta) y construye el centro de datos.",
      "Meta <strong>alquila</strong> el edificio. Con ese alquiler, el SPV paga a los bonistas.",
      "<strong class='c-warm'>La letra pequeña:</strong> Meta garantiza el valor residual. Si se va, paga. El riesgo sigue siendo de Meta, pero fuera de la vista: el BIS lo llama <em>shadow borrowing</em>.",
    ]);
    const bal = svg("g", {}, s);
    svg("rect", { x: 20, y: 30, width: 400, height: 400, rx: 18, fill: "rgba(236,226,205,0.03)", stroke: C.lineStrong, "stroke-width": 2, "stroke-dasharray": "8 7" }, bal);
    label(bal, 40, 62, "BALANCE DE META", { font: Deck.MONO, size: 16, fill: C.muted });
    const meta = node(s, 220, 230, 260, 100, "Meta", "inquilino", C.markB);
    const spv = node(s, 712, 150, 330, 100, "SPV «Beignet»", "80 % Blue Owl · 20 % Meta", C.accent);
    const bonds = node(s, 1200, 150, 300, 100, "Bonistas", "Pimco ~18 mil M$ y otros", C.text2);
    const dc = node(s, 712, 380, 360, 90, "Centro de datos", "Hyperion · Luisiana", C.accent2);

    const bMoney = arrow(s, "M1050 150 L 880 150", C.accent, { width: 3 });
    const bMoneyL = label(s, 965, 132, "27.300 M$", { anchor: "middle", font: Deck.MONO, size: 17, fill: C.accent });
    const build = arrow(s, "M712 200 L 712 334", C.accent2, { width: 3 });
    const buildL = label(s, 726, 272, "construye", { font: Deck.MONO, size: 16, fill: C.accent2 });
    const rent = arrow(s, "M350 210 Q 450 140 545 150", C.markB, { width: 3 });
    const rentL = label(s, 452, 132, "alquiler", { anchor: "middle", font: Deck.MONO, size: 16, fill: C.markB });
    const use = arrow(s, "M530 380 Q 400 380 300 282", C.markB, { width: 2, dash: "4 6" });
    const useL = label(s, 405, 410, "usa", { anchor: "middle", font: Deck.MONO, size: 16, fill: C.markB });
    const coupon = arrow(s, "M880 175 L 1050 175", C.text2, { width: 2.5, dash: "5 5" });
    const couponL = label(s, 965, 200, "intereses 6,58 %", { anchor: "middle", font: Deck.MONO, size: 16, fill: C.text2 });
    const rvg = arrow(s, "M220 180 C 300 -40, 1150 -40, 1210 100", C.warm, { width: 3, dash: "8 6" });
    const rvgL = label(s, 712, 58, "garantía de valor residual", { anchor: "middle", font: Deck.MONO, size: 17, fill: C.warm, weight: 600 });

    const g1 = [spv];
    const g2 = [bonds, bMoney.path, bMoney.head, bMoneyL, dc, build.path, build.head, buildL];
    const g3 = [rent.path, rent.head, rentL, use.path, use.head, useL, coupon.path, coupon.head, couponL];
    const g4 = [rvg.path, rvg.head, rvgL];
    gsap.set([...g1, ...g2, ...g3, ...g4], { opacity: 0 });

    tl.from([bal, meta], { opacity: 0, duration: 0.6, stagger: 0.2 }, 0);
    show(0, 0.1);
    tl.addLabel("s0");
    show(1, "s0");
    tl.to(g1, { opacity: 1, duration: 0.5 }, "s0");
    tl.from(spv, { x: -420, duration: 0.9, ease: "power2.out" }, "s0");
    tl.addLabel("s1");
    show(2, "s1");
    tl.to(g2, { opacity: 1, duration: 0.5, stagger: 0.12 }, "s1");
    Deck.pulse(tl, s, bMoney.path, tl.labels.s1 + 0.8, { color: C.accent, r: 8 });
    tl.addLabel("s2", "s1+=1.8");
    show(3, "s2");
    tl.to(g3, { opacity: 1, duration: 0.5, stagger: 0.08 }, "s2");
    Deck.pulse(tl, s, rent.path, tl.labels.s2 + 0.6, { color: C.markB, r: 8 });
    Deck.pulse(tl, s, coupon.path, tl.labels.s2 + 1.4, { color: C.text2, r: 7 });
    tl.addLabel("s3", "s2+=2.4");
    show(4, "s3");
    tl.to(g4, { opacity: 1, duration: 0.5 }, "s3");
    Deck.draw(tl, rvg.path, tl.labels.s3, 1.0);
    tl.set(rvg.path, { strokeDasharray: "8 6" }, "s3+=1.05");
    tl.addLabel("s4", "s3+=1.2");
    return { tl };
  };

  /* ---------- 24 · Reloj de las GPU (interactiva) ---------- */
  anims.gpu = function (slide, { signal }) {
    const W = 760, H = 380;
    const s = Deck.stageSvg(slide.querySelector("#gpu-stage"), W, H);
    const input = slide.querySelector("#gpu-y"), out = slide.querySelector("#gpu-y-out");
    const st = { y: 6 };
    const REV = 40, OTHER = 10, FLEET = 100;
    // Book value chart (top)
    const cx0 = 60, cx1 = 740, cy0 = 30, cy1 = 160;
    const xY = (yr) => cx0 + (yr / 6) * (cx1 - cx0);
    const yV = (v) => cy1 - (v / 100) * (cy1 - cy0);
    label(s, 0, 16, "VALOR CONTABLE DE LA FLOTA", { font: Deck.MONO, size: 14, fill: C.muted });
    svg("line", { x1: cx0, x2: cx1, y1: cy1, y2: cy1, stroke: C.lineStrong }, s);
    for (let i = 0; i <= 6; i++) label(s, xY(i), cy1 + 22, `${i}`, { anchor: "middle", font: Deck.MONO, size: 14, fill: C.muted });
    label(s, cx1, cy1 + 22, "años", { anchor: "start", font: Deck.MONO, size: 14, fill: C.muted }).setAttribute("x", cx1 + 12);
    const book = svg("path", { stroke: C.accent, "stroke-width": 3, fill: "rgba(240,179,74,0.10)" }, s);
    // Bars (bottom)
    const zx = 330, k = 9;
    label(s, 0, 222, "Amortización anual", { size: 19, fill: C.text });
    const dep = svg("rect", { x: zx, y: 232, height: 34, rx: 4, fill: C.markB }, s);
    const depV = label(s, 0, 256, "", { font: Deck.MONO, size: 17, fill: C.text });
    label(s, 0, 302, "Beneficio declarado", { size: 19, fill: C.text });
    const prof = svg("rect", { y: 312, height: 34, rx: 4 }, s);
    const profV = label(s, 0, 336, "", { font: Deck.MONO, size: 17, fill: C.text });
    svg("line", { x1: zx, x2: zx, y1: 226, y2: 354, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    label(s, zx, 372, "0", { anchor: "middle", font: Deck.MONO, size: 14, fill: C.muted });

    function render() {
      const y = st.y;
      const d = FLEET / y, p = REV - OTHER - d;
      book.setAttribute("d", `M${xY(0)} ${yV(100)} L${xY(y)} ${yV(0)} L${xY(0)} ${yV(0)} Z`);
      dep.setAttribute("width", d * k);
      depV.setAttribute("x", zx + d * k + 12);
      depV.textContent = Deck.fmt(d, 1);
      const w = Math.abs(p) * k;
      prof.setAttribute("x", p >= 0 ? zx : zx - w);
      prof.setAttribute("width", Math.max(1, w));
      prof.setAttribute("fill", p >= 0 ? C.accent2 : C.warm);
      profV.setAttribute("x", p >= 0 ? zx + w + 12 : zx + 12);
      profV.textContent = (p >= 0 ? "+" : "−") + Deck.fmt(Math.abs(p), 1);
      profV.setAttribute("fill", p >= 0 ? C.text : C.warm);
      out.textContent = `${Deck.fmt(y, 1)} años`;
      input.value = Math.round(y * 10);
    }
    input.addEventListener("input", () => ((st.y = input.value / 10), render()), { signal });
    slide.querySelectorAll("[data-y]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { y: b.dataset.y / 10, duration: 0.9, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".gpu-grid .fact"), { opacity: 0, x: 20, stagger: 0.2, duration: 0.4 }, 0.2);
    tl.to(st, { y: 3, duration: 2.0, ease: "power2.inOut", onUpdate: render }, 1.2);
    return { tl };
  };

  anims.stress = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".sig:not(.ok)"), { opacity: 0, y: 24, stagger: 0.25, duration: 0.5 }, 0.1);
    tl.from(slide.querySelectorAll(".sig.ok"), { opacity: 0, y: 24, stagger: 0.25, duration: 0.5 }, 1.4);
    return { tl };
  };

  anims.different = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const cols = slide.querySelectorAll(".df-grid > div");
    tl.from(cols[0].children, { opacity: 0, x: -20, stagger: 0.25, duration: 0.45 }, 0.1);
    tl.from(cols[1].children, { opacity: 0, x: 20, stagger: 0.25, duration: 0.45 }, 1.4);
    return { tl };
  };

  anims.dashboard = Deck.simple([".dsh", ".callout"], { stagger: 0.18 });
  anims.takeaways = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".takeaways .item"), { opacity: 0, y: 26, stagger: 0.45, duration: 0.6 }, 0.1);
    tl.from(slide.querySelector(".closing"), { opacity: 0, y: 12, duration: 0.8 }, 1.8);
    return { tl };
  };
  anims.sources = Deck.simple(["li"], { stagger: 0.04 });
})();
