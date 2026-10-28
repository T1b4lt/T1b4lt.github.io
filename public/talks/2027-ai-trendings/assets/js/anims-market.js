/* Block 02 · Market: capex staircase, NVIDIA DC bars, bottleneck pipe, scenarios. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  /** Neo-brutalist bar with a hard shadow. Returns {g, bar, sh}. */
  function brutBar(parent, x, y0, w, fill, opts) {
    const o = Object.assign({ hatch: false }, opts);
    const g = svg("g", {}, parent);
    const sh = svg("rect", { x: x + 6, y: y0, width: w, height: 0, fill: C.ink }, g);
    const root = parent.ownerSVGElement || parent;
    const bar = svg("rect", { x, y: y0, width: w, height: 0, fill: o.hatch ? `url(#${root.dataset.hatch})` : fill, stroke: C.ink, "stroke-width": 3 }, g);
    return { g, bar, sh };
  }
  function growBar(tl, b, y0, h, at, dur) {
    tl.to(b.bar, { attr: { y: y0 - h, height: h }, duration: dur || 0.6, ease: "back.out(1.4)" }, at);
    tl.to(b.sh, { attr: { y: y0 - h + 6, height: h - 6 }, duration: dur || 0.6, ease: "back.out(1.4)" }, at);
  }
  function hatchDef(svgEl, color) {
    const defs = svgEl.querySelector("defs");
    const id = "hatch-" + Math.random().toString(36).slice(2, 8);
    svgEl.dataset.hatch = id;
    const p = svg("pattern", { id, width: 12, height: 12, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    svg("rect", { width: 12, height: 12, fill: C.bg2 }, p);
    svg("rect", { width: 5, height: 12, fill: color }, p);
    return `url(#${id})`;
  }
  Deck.brutBar = brutBar;
  Deck.growBar = growBar;
  Deck.hatchDef = hatchDef;

  /* Capex staircase: 2025 → 2026 guidance revisions → 2027 range. */
  anims.capex = function (slide, { signal }) {
    const W = 1000, H = 590;
    const s = Deck.stageSvg(slide.querySelector("#cx-stage"), W, H);
    hatchDef(s, C.accent2);
    const host = slide.querySelector("#cx-stage");
    const tip = Deck.tooltip(slide.querySelector("#cx-tip"), host);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const L = 70, B = H - 70, T = 30;
    const y = Deck.lin(0, 1700, B, T);
    [0, 500, 1000, 1500].forEach((v) => {
      svg("line", { x1: L, x2: W - 10, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: v === 0 ? "0" : `$${Deck.fmt(v)}` }, s);
    });
    svg("text", { x: L - 10, y: T - 10, "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: "miles de M$" }, s);
    // 1 trillion line
    const tr = svg("line", { x1: L, x2: W - 10, y1: y(1000), y2: y(1000), stroke: C.accent2, "stroke-width": 4 }, s);
    const trT = svg("text", { x: L + 8, y: y(1000) - 10, "font-size": 19, "font-family": Deck.BLACK, fill: C.accent2, text: "1 BILLÓN $" }, s);
    const data = [
      { l: "2025", sub: "real", v: 410, c: C.bg2, src: "Statista / analysis-atlas ⚠" },
      { l: "2026", sub: "guía ene", v: 640, c: C.lilac, src: "Platformonomics" },
      { l: "2026", sub: "guía abr", v: 710, c: C.lilac, src: "Platformonomics (695–725)" },
      { l: "2026", sub: "guía jul", v: 745, c: C.yellow, src: "Platformonomics (735–750)" },
      { l: "2027", sub: "consenso", v: 1100, c: C.accent, src: "Consenso, vía Goldman/Bloomberg" },
      { l: "2027", sub: "Goldman", v: 1200, c: C.accent, src: "Goldman Sachs, 25-sep-2026" },
      { l: "2027", sub: "M. Stanley", v: 1580, c: null, src: "Morgan Stanley ⚠ (incl. neoclouds y leasing)" },
    ];
    const bw = 92, gap = (W - L - 20 - bw * data.length) / data.length;
    data.forEach((d, i) => {
      const x = L + 14 + i * (bw + gap);
      const b = brutBar(s, x, B, bw, d.c || C.accent2, { hatch: !d.c });
      const h = B - y(d.v);
      growBar(tl, b, B, h, 0.6 + i * 0.28, 0.6);
      const vt = svg("text", { x: x + bw / 2, y: y(d.v) - 12, "text-anchor": "middle", "font-size": 20, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: `$${Deck.fmt(d.v)}` }, s);
      tl.from(vt, { opacity: 0, y: 10, duration: 0.3 }, 1.0 + i * 0.28);
      svg("text", { x: x + bw / 2, y: B + 26, "text-anchor": "middle", "font-size": 18, "font-weight": 700, "font-family": Deck.DISPLAY, fill: C.ink, text: d.l }, s);
      svg("text", { x: x + bw / 2, y: B + 46, "text-anchor": "middle", "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: d.sub }, s);
      const hit = svg("rect", { x, y: T, width: bw, height: B - T, fill: "transparent" }, s);
      hit.addEventListener("mousemove", (e) => tip.show(e, `<b>${d.l} · ${d.sub}</b><br>$${Deck.fmt(d.v)} mil M · ${d.src}`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
    });
    svg("line", { x1: L, x2: W - 10, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, s);
    tl.from([tr, trT], { opacity: 0, duration: 0.4 }, 2.0);
    Deck.draw(tl, tr, 2.0, 0.6);
    // +50% arrow
    const ar = svg("g", {}, s);
    const ax = L + 14 + 3 * (bw + gap) + bw / 2, bx = L + 14 + 5 * (bw + gap) + bw / 2;
    svg("path", { d: `M${ax} ${y(745) - 40} Q ${(ax + bx) / 2} ${y(1560)} ${bx} ${y(1200) - 44}`, fill: "none", stroke: C.ink, "stroke-width": 3, "stroke-dasharray": "8 6" }, ar);
    const lbl = svg("g", {}, ar);
    svg("rect", { x: (ax + bx) / 2 - 50, y: y(1470) - 4, width: 100, height: 36, fill: C.yellow, stroke: C.ink, "stroke-width": 3 }, lbl);
    svg("text", { x: (ax + bx) / 2, y: y(1470) + 21, "text-anchor": "middle", "font-size": 20, "font-family": Deck.BLACK, fill: C.ink, text: "+50 %" }, lbl);
    tl.from(ar, { opacity: 0, scale: 0.6, transformOrigin: `${(ax + bx) / 2}px ${y(1470)}px`, duration: 0.5, ease: "back.out(3)" }, 2.7);
    Deck.stamp(tl, slide.querySelectorAll(".cx-q"), 1.2, { stagger: 0.5 });
    return { tl };
  };

  /* NVIDIA Data Center revenue by quarter, with Q3 total-revenue guide. */
  anims.nvda = function (slide, { signal }) {
    const W = 1000, H = 590;
    const s = Deck.stageSvg(slide.querySelector("#nv-stage"), W, H);
    hatchDef(s, C.green);
    const host = slide.querySelector("#nv-stage");
    const tip = Deck.tooltip(slide.querySelector("#nv-tip"), host);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const q = [
      ["Q1 FY25", 22.6], ["Q2", 26.3], ["Q3", 30.8], ["Q4", 35.6],
      ["Q1 FY26", 39.1], ["Q2", 41.1], ["Q3", 51.2], ["Q4", 62.3],
      ["Q1 FY27", 75.2], ["Q2", 89.0], ["Q3 guía", 108, true],
    ];
    const L = 60, B = H - 70, T = 30;
    const y = Deck.lin(0, 120, B, T);
    [0, 25, 50, 75, 100].forEach((v) => {
      svg("line", { x1: L, x2: W - 10, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1.5, "stroke-dasharray": "4 6" }, s);
      svg("text", { x: L - 10, y: y(v) + 5, "text-anchor": "end", "font-size": 15, "font-family": Deck.MONO, fill: C.muted, text: `$${v}` }, s);
    });
    svg("text", { x: L - 10, y: T - 10, "font-size": 14, "font-family": Deck.MONO, fill: C.muted, text: "miles de M$" }, s);
    const bw = 64, gap = (W - L - 20 - bw * q.length) / q.length;
    q.forEach(([l, v, guide], i) => {
      const x = L + 10 + i * (bw + gap);
      const fill = guide ? null : i >= 8 ? C.green : i >= 4 ? C.yellow : C.bg2;
      const b = brutBar(s, x, B, bw, fill, { hatch: guide });
      growBar(tl, b, B, B - y(v), 0.5 + i * 0.13, 0.5);
      if (i >= 7 || i === 0) {
        const t = svg("text", { x: x + bw / 2, y: y(v) - 10, "text-anchor": "middle", "font-size": 16, "font-weight": 700, "font-family": Deck.MONO, fill: C.ink, text: `$${Deck.fmt(v, v % 1 ? 1 : 0)}` }, s);
        tl.from(t, { opacity: 0, duration: 0.3 }, 0.9 + i * 0.13);
      }
      svg("text", { x: x + bw / 2, y: B + 24, "text-anchor": "middle", "font-size": 13, "font-family": Deck.MONO, fill: l.includes("FY") || guide ? C.ink : C.muted, "font-weight": l.includes("FY") ? 700 : 400, text: l }, s);
      const hit = svg("rect", { x, y: T, width: bw, height: B - T, fill: "transparent" }, s);
      hit.addEventListener("mousemove", (e) => tip.show(e, guide ? "<b>Q3 FY27 · guía</b><br>$108.000 M de ingresos TOTALES ±2 %" : `<b>${l}</b><br>Data Center: $${Deck.fmt(v, 1)} mil M`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
    });
    svg("line", { x1: L, x2: W - 10, y1: B, y2: B, stroke: C.ink, "stroke-width": 3 }, s);
    // ×4 badge
    const bg = svg("g", {}, s);
    svg("rect", { x: 180 + 6, y: 140 + 6, width: 300, height: 88, fill: C.ink }, bg);
    svg("rect", { x: 180, y: 140, width: 300, height: 88, fill: C.accent2, stroke: C.ink, "stroke-width": 3 }, bg);
    svg("text", { x: 330, y: 190, "text-anchor": "middle", "font-size": 40, "font-family": Deck.BLACK, fill: "#fff", text: "×4 en 2 años" }, bg);
    svg("text", { x: 330, y: 216, "text-anchor": "middle", "font-size": 14, "font-family": Deck.MONO, fill: "#fff", text: "Q1 FY25 → Q2 FY27" }, bg);
    bg.setAttribute("transform", "rotate(-4 330 184)");
    tl.from(bg, { scale: 3, opacity: 0, transformOrigin: "330px 184px", duration: 0.4, ease: "power4.in" }, 2.2);
    Deck.stamp(tl, slide.querySelectorAll(".nv-s"), 1.0, { stagger: 0.4 });
    tl.from(slide.querySelectorAll(".nv-road .tag"), { x: -30, opacity: 0, stagger: 0.12, duration: 0.3, ease: "back.out(2)" }, 1.6);
    return { tl };
  };

  /* Bottlenecks: a pipe from money to tokens with three choke points. */
  anims.bottle = function (slide) {
    const W = 1424, H = 440;
    const s = Deck.stageSvg(slide.querySelector("#bt-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const show = Deck.captions(tl, slide.querySelector("#bt-cap"), [
      "El dinero sobra: <b>&gt;$1 billón</b> en capex para 2027. Fluye hacia chips, memoria y energía para producir tokens.",
      "<b>Cuello 1 · Memoria.</b> Micron: HBM de 2027 «vendida casi entera» con fuertes subidas de precio. Margen bruto: ~86 %.",
      "<b>Cuello 2 · Energía.</b> Solo funciona el 29 % de la potencia planificada en los campus de EE. UU. Las turbinas de gas tienen años de espera.",
      "<b>Cuello 3 · Deuda.</b> $1,57 de inversión por cada $1 de caja nueva. Los CDS de CoreWeave rondan los 1.000 pb. La grieta, si llega, será de crédito.",
    ]);
    const Y = 150;
    const pipe = "M150 150 L1290 150";
    const p = svg("path", { d: pipe, fill: "none", stroke: C.ink, "stroke-width": 64, "stroke-linecap": "butt" }, s);
    const p2 = svg("path", { d: pipe, fill: "none", stroke: C.bg2, "stroke-width": 52 }, s);
    const flowP = svg("path", { d: pipe, fill: "none", stroke: C.accent, "stroke-width": 20, "stroke-dasharray": "18 22" }, s);
    const box = (x, w, label, sub, fill, txt) => {
      const g = svg("g", {}, s);
      svg("rect", { x: x + 7, y: Y - 80 + 7, width: w, height: 160, fill: C.ink }, g);
      svg("rect", { x, y: Y - 80, width: w, height: 160, fill, stroke: C.ink, "stroke-width": 4 }, g);
      svg("text", { x: x + w / 2, y: Y - 4, "text-anchor": "middle", "font-size": 30, "font-family": Deck.BLACK, fill: txt || C.ink, text: label }, g);
      svg("text", { x: x + w / 2, y: Y + 26, "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: txt || C.ink, text: sub }, g);
      return g;
    };
    const money = box(0, 170, "$$$", "capex 2027", C.green);
    const tokens = box(1260, 164, "TOKENS", "IA servida", C.accent, "#fff");
    const choke = (x, label, num, sub, fill) => {
      const g = svg("g", {}, s);
      svg("path", { d: `M${x - 70} ${Y - 46} L${x} ${Y - 16} L${x + 70} ${Y - 46} Z`, fill: C.ink }, g);
      svg("path", { d: `M${x - 70} ${Y + 46} L${x} ${Y + 16} L${x + 70} ${Y + 46} Z`, fill: C.ink }, g);
      const card = svg("g", {}, g);
      svg("rect", { x: x - 130 + 6, y: Y + 76 + 6, width: 260, height: 150, fill: C.ink }, card);
      svg("rect", { x: x - 130, y: Y + 76, width: 260, height: 150, fill, stroke: C.ink, "stroke-width": 3 }, card);
      svg("text", { x, y: Y + 110, "text-anchor": "middle", "font-size": 22, "font-family": Deck.BLACK, fill: C.ink, text: label }, card);
      svg("text", { x, y: Y + 166, "text-anchor": "middle", "font-size": 48, "font-family": Deck.BLACK, fill: C.ink, text: num }, card);
      svg("text", { x, y: Y + 200, "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: C.ink, text: sub }, card);
      svg("line", { x1: x, x2: x, y1: Y + 46, y2: Y + 76, stroke: C.ink, "stroke-width": 3 }, g);
      gsap.set(g, { opacity: 0 });
      return g;
    };
    const c1 = choke(430, "MEMORIA · HBM", "~86 %", "margen bruto Micron", C.yellow);
    const c2 = choke(720, "ENERGÍA", "29 %", "de los GW, en marcha", C.accent2);
    const c3 = choke(1010, "DEUDA", "$1,57", "por $1 de caja nueva", C.warm);
    const sat = svg("text", { x: 720, y: 60, "text-anchor": "middle", "font-size": 22, "font-family": Deck.MONO, fill: C.ink, text: "" }, s);
    const flow = { o: 0 };
    const speed = { v: 1 };
    const loop = Deck.isPrint
      ? null
      : gsap.to(flow, { o: -400, duration: 4, ease: "none", repeat: -1, onUpdate: () => flowP.setAttribute("stroke-dashoffset", flow.o) });
    const sp = () => loop && loop.timeScale(speed.v);
    tl.from([p, p2, flowP], { scaleX: 0, transformOrigin: "150px 150px", duration: 0.6, ease: "power3.out" }, 0.4);
    tl.from(money, { x: -200, duration: 0.5, ease: "back.out(2)" }, 0.4);
    tl.from(tokens, { x: 200, duration: 0.5, ease: "back.out(2)" }, 0.6);
    show(0, 0.5);
    tl.addLabel("s0");
    const slowAt = (g, v, lab) => {
      tl.to(g, { opacity: 1, duration: 0.01 }, lab);
      tl.from(g.children[0], { y: -60, duration: 0.4, ease: "bounce.out" }, lab);
      tl.from(g.children[1], { y: 60, duration: 0.4, ease: "bounce.out" }, lab);
      tl.from(g.children[2], { scale: 0, transformOrigin: "50% 0%", duration: 0.4, ease: "back.out(2)" }, `${lab}+=0.3`);
      tl.to(speed, { v, duration: 0.6, onUpdate: sp }, lab);
    };
    slowAt(c1, 0.6, "s0");
    show(1, "s0");
    tl.addLabel("s1");
    slowAt(c2, 0.32, "s1");
    show(2, "s1");
    tl.addLabel("s2");
    slowAt(c3, 0.15, "s2");
    tl.to(flowP, { attr: { stroke: C.warm }, duration: 0.6 }, "s2");
    show(3, "s2");
    tl.addLabel("s3");
    return { tl, destroy: () => loop && loop.kill() };
  };

  /* Scenarios explorer: three presets drive bars + text. */
  anims.scen = function (slide, { signal }) {
    const SC = [
      { capex: 1.2, capexL: "$1,1–1,3 bill.", semis: 1.9, semisL: "~$1,9 bill.", nv: 60, nvL: "+60–70 %", p: 55, txt: "<b>Base.</b> El capex crece ~50 %, la memoria sigue escasa y NVIDIA crece limitada por la oferta. Tensiones de crédito solo en los márgenes (neoclouds)." },
      { capex: 1.55, capexL: "≥$1,5 bill.", semis: 2.1, semisL: "&gt;$2 bill.", nv: 80, nvL: "+80 %", p: 20, txt: "<b>Optimista.</b> La energía se desbloquea antes y los ingresos de los agentes sorprenden. Morgan Stanley ve ~$1,6 billones." },
      { capex: 0.95, capexL: "$0,9–1 bill.", semis: 1.6, semisL: "~$1,6 bill.", nv: 25, nvL: "+20–30 %", p: 25, txt: "<b>Pesimista.</b> Un evento de crédito (CoreWeave, Oracle, un SPV) encarece la financiación: pedidos aplazados y caída de la memoria en el 2S." },
    ];
    const fills = slide.querySelectorAll("#sc-bars .fill");
    const vals = slide.querySelectorAll("#sc-bars .val");
    const txt = slide.querySelector("#sc-txt");
    const btns = slide.querySelectorAll(".sc-b");
    const st = { capex: 0, semis: 0, nv: 0, p: 0, i: 0 };
    function render() {
      fills[0].style.width = `${(st.capex / 1.7) * 100}%`;
      fills[1].style.width = `${(st.semis / 2.3) * 100}%`;
      fills[2].style.width = `${(st.nv / 100) * 100}%`;
      fills[3].style.width = `${st.p}%`;
      const sc = SC[Math.round(st.i)];
      vals[0].innerHTML = sc.capexL;
      vals[1].innerHTML = sc.semisL;
      vals[2].innerHTML = sc.nvL;
      vals[3].innerHTML = `${Math.round(st.p)} %`;
      txt.innerHTML = sc.txt;
      btns.forEach((b, i) => b.classList.toggle("on", i === Math.round(st.i)));
    }
    const go = (i, dur) => gsap.to(st, { capex: SC[i].capex, semis: SC[i].semis, nv: SC[i].nv, p: SC[i].p, i, duration: dur, ease: "power3.out", onUpdate: render });
    btns.forEach((b) => b.addEventListener("click", () => go(+b.dataset.s, 0.7), { signal }));
    render();
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    Deck.stamp(tl, btns, 0.4, { stagger: 0.1 });
    tl.set(btns, { clearProps: "transform" }, 1.1); // hand transform back to CSS so .btn.on can press
    tl.to(st, { capex: SC[0].capex, semis: SC[0].semis, nv: SC[0].nv, p: SC[0].p, duration: 1.2, ease: "power3.out", onUpdate: render }, 0.8);
    Deck.stamp(tl, slide.querySelectorAll(".sc-side"), 1.0, { stagger: 0.25 });
    tl.from(txt, { opacity: 0, y: 20, duration: 0.4 }, 1.4);
    return { tl };
  };
})();
