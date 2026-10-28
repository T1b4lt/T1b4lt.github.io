/* Bloque 3 · historia: tulipanes y Mares del Sur, Railway Mania, vías,
   años 20, dot-com, fibra (stepped), Cisco vs NVIDIA y supervivientes. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C, label } = Deck;

  /** Small sparkline through key values; returns the path for drawing. */
  function spark(s, W, H, vals, labels, color, crashFrom) {
    const max = Math.max(...vals);
    const pad = 70;
    const pts = vals.map((v, i) => [pad + (i * (W - 2 * pad)) / (vals.length - 1), H - 34 - ((v / max) * (H - 70))]);
    const up = svg("path", { d: Deck.pathD(pts.slice(0, crashFrom + 1)), stroke: color, "stroke-width": 4, fill: "none", "stroke-linejoin": "round" }, s);
    const down = svg("path", { d: Deck.pathD(pts.slice(crashFrom)), stroke: C.warm, "stroke-width": 4, fill: "none" }, s);
    const lbls = pts.map((p, i) =>
      label(s, i === 0 ? p[0] - 10 : i === pts.length - 1 ? p[0] + 10 : p[0], i === crashFrom ? p[1] - 12 : p[1] + 5, labels[i], { anchor: i === 0 ? "end" : i === pts.length - 1 ? "start" : "middle", font: Deck.MONO, size: 16, fill: i === crashFrom ? C.text : C.text2 }),
    );
    svg("line", { x1: pad, x2: W - pad, y1: H - 30, y2: H - 30, stroke: C.line, "stroke-width": 1 }, s);
    return { up, down, lbls };
  }

  /* ---------- 9 · Tulipanes y Mares del Sur ---------- */
  anims.southsea = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const a = spark(Deck.stageSvg(slide.querySelector("#tu-stage"), 600, 170), 600, 170, [64, 1668, 37.5], ["64", "1.668 (5-feb-1637)", "37,5"], C.muted, 1);
    const b = spark(Deck.stageSvg(slide.querySelector("#ss-stage"), 600, 170), 600, 170, [130, 1050, 175], ["£130", "~£1.050 (1720)", "£175"], C.accent, 1);
    tl.from(slide.querySelectorAll(".card"), { opacity: 0, y: 26, stagger: 0.3, duration: 0.6 }, 0);
    [a, b].forEach((sp, i) => {
      Deck.draw(tl, sp.up, 0.5 + i * 0.5, 0.9);
      Deck.draw(tl, sp.down, 1.4 + i * 0.5, 0.6);
      tl.from(sp.lbls, { opacity: 0, stagger: 0.3, duration: 0.3 }, 0.6 + i * 0.5);
    });
    tl.from(slide.querySelector(".quote-line"), { opacity: 0, y: 14, duration: 0.7 }, 2.8);
    return { tl };
  };

  /* ---------- 10 · Railway Mania: millas autorizadas ---------- */
  anims.railway = function (slide, { signal }) {
    const W = 730, H = 420;
    const s = Deck.stageSvg(slide.querySelector("#rw-stage"), W, H);
    const tip = Deck.tooltip(slide.querySelector("#rw-tip"), slide.querySelector(".rw-grid"));
    const data = [["1843", 91], ["1844", 805], ["1845", 2700], ["1846", 4538], ["1847", 1354], ["…", null], ["1850", 8]];
    const base = 370, top = 40, max = 5000, x0 = 70, bw = 62, gap = 30;
    const y = (v) => base - (v / max) * (base - top);
    [0, 1000, 2000, 3000, 4000, 5000].forEach((v) => {
      svg("line", { x1: x0 - 10, x2: W - 10, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1, opacity: v ? 0.6 : 1 }, s);
      label(s, x0 - 16, y(v) + 6, Deck.fmt(v), { anchor: "end", font: Deck.MONO, size: 15, fill: C.muted });
    });
    const tl = gsap.timeline({ paused: true });
    data.forEach(([yr, v], i) => {
      const x = x0 + 10 + i * (bw + gap);
      label(s, x + bw / 2, base + 28, yr, { anchor: "middle", font: Deck.MONO, size: 16, fill: C.text2 });
      if (v === null) return;
      const peak = v === 4538;
      const r = svg("rect", { x, y: base, width: bw, height: 0, rx: 4, fill: peak ? C.markA : C.markB }, s);
      const vl = label(s, x + bw / 2, y(v) - 10, Deck.fmt(v), { anchor: "middle", font: Deck.MONO, size: 16, fill: C.text, opacity: 0 });
      tl.to(r, { attr: { y: y(v), height: base - y(v) }, duration: 0.7, ease: "power3.out" }, 0.3 + i * 0.18);
      tl.to(vl, { opacity: 1, duration: 0.3 }, 0.8 + i * 0.18);
      const hit = svg("rect", { x: x - 8, y: top, width: bw + 16, height: base - top, fill: "transparent" }, s);
      hit.addEventListener("mousemove", (e) => tip.show(e, `${yr}: <b>${Deck.fmt(v)}</b> millas autorizadas`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
    });
    const peakL = label(s, x0 + 10 + 3 * (bw + gap) + bw + 14, y(4538) + 22, "récord", { font: Deck.MONO, size: 16, fill: C.accent, opacity: 0 });
    tl.to(peakL, { opacity: 1, duration: 0.4 }, 1.6);
    tl.from(slide.querySelectorAll(".rw-facts > *"), { opacity: 0, x: 24, stagger: 0.3, duration: 0.5 }, 1.0);
    return { tl };
  };

  /* ---------- 11 · Las vías se quedaron ---------- */
  anims.tracks = function (slide) {
    const W = 1424, H = 300;
    const s = Deck.stageSvg(slide.querySelector("#tr-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    // Track with sleepers
    const ties = [];
    for (let x = 20; x <= 1400; x += 28) ties.push(svg("line", { x1: x, x2: x, y1: 48, y2: 82, stroke: "rgba(236,226,205,0.35)", "stroke-width": 5 }, s));
    const r1 = svg("line", { x1: 10, x2: 1410, y1: 56, y2: 56, stroke: C.text2, "stroke-width": 3 }, s);
    const r2 = svg("line", { x1: 10, x2: 1410, y1: 74, y2: 74, stroke: C.text2, "stroke-width": 3 }, s);

    // Two bars: network (grows) vs investors' capital (loses ~1/3)
    const bx = 330, bwMax = 1060;
    label(s, 20, 158, "Red ferroviaria británica", { size: 21, fill: C.text });
    label(s, 20, 182, "millas en servicio", { size: 16, fill: C.muted, font: Deck.MONO });
    const net = svg("rect", { x: bx, y: 140, width: (2441 / 10433) * bwMax, height: 36, rx: 4, fill: C.accent2 }, s);
    const netV = label(s, bx + 14, 165, "2.441 (1845)", { size: 19, fill: C.bg, weight: 600, font: Deck.MONO });
    label(s, 20, 248, "Capital de los inversores", { size: 21, fill: C.text });
    label(s, 20, 272, "~£250 M aportados en la manía", { size: 16, fill: C.muted, font: Deck.MONO });
    const cap = svg("rect", { x: bx, y: 230, width: bwMax * 0.6, height: 36, rx: 4, fill: C.markA }, s);
    const lost = svg("rect", { x: bx + bwMax * 0.4, y: 230, width: bwMax * 0.2, height: 36, rx: 4, fill: "rgba(239,91,79,0.15)", stroke: C.warm, "stroke-width": 2, "stroke-dasharray": "6 5", opacity: 0 }, s);
    const lostL = label(s, bx + bwMax * 0.5, 255, "−⅓", { anchor: "middle", size: 22, fill: C.warm, weight: 700, opacity: 0 });

    tl.from(ties, { opacity: 0, stagger: 0.012, duration: 0.2 }, 0);
    tl.from([r1, r2], { attr: { x2: 10 }, duration: 1.4, ease: "power1.inOut" }, 0);
    const st = { m: 2441 };
    tl.to(net, { attr: { width: bwMax }, duration: 2.2, ease: "power1.inOut" }, 0.8);
    tl.to(st, { m: 10433, duration: 2.2, ease: "power1.inOut", onUpdate: () => (netV.textContent = st.m > 10400 ? "10.433 (1860)" : `${Deck.fmt(st.m)}`) }, 0.8);
    tl.to(cap, { attr: { width: bwMax * 0.4 }, duration: 1.2, ease: "power2.in" }, 1.6);
    tl.to([lost, lostL], { opacity: 1, duration: 0.4 }, 2.6);
    tl.from(slide.querySelectorAll(".tr-card"), { opacity: 0, y: 20, stagger: 0.25, duration: 0.5 }, 2.8);
    tl.from(slide.querySelector(".quote-line"), { opacity: 0, duration: 0.6 }, 3.8);
    return { tl };
  };

  /* ---------- 12 · Años 20: 253 → 44 → 3 ---------- */
  anims.twenties = function (slide) {
    const W = 730, H = 400;
    const s = Deck.stageSvg(slide.querySelector("#tw-stage"), W, H);
    const title = slide.querySelector("#tw-title");
    const tl = gsap.timeline({ paused: true });
    const cols = 23, rows = 11, cell = 30;
    const rng = Deck.rng(1929);
    const idx = Array.from({ length: cols * rows }, (_, i) => i).sort(() => rng() - 0.5);
    const keep44 = new Set(idx.slice(0, 44));
    const big3 = idx.slice(0, 3);
    const dots = [];
    for (let i = 0; i < cols * rows; i++) {
      const cx = 22 + (i % cols) * cell, cy = 22 + Math.floor(i / cols) * cell;
      dots.push(svg("circle", { cx, cy, r: 10, fill: C.markA }, s));
    }
    const names = ["Ford", "GM", "Chrysler"];
    const nameL = big3.map((i, k) => {
      const cx = 22 + (i % cols) * cell, cy = 22 + Math.floor(i / cols) * cell;
      return label(s, cx, cy - 16, names[k], { anchor: "middle", font: Deck.MONO, size: 15, fill: C.accent2, weight: 600, opacity: 0 });
    });
    const st = { n: 253, yr: 0 };
    const render = () => (title.innerHTML = `Fabricantes de automóviles en EE. UU. · ${st.yr > 0.5 ? "1929" : "1908"}: <span class="c-accent">${Math.round(st.n)}</span>`);
    render();
    tl.from(dots, { scale: 0, transformOrigin: "50% 50%", stagger: { each: 0.004, from: "random" }, duration: 0.3 }, 0);
    const gone = dots.filter((_, i) => !keep44.has(i));
    tl.to(gone, { opacity: 0.08, duration: 0.6, stagger: { each: 0.004, from: "random" } }, 1.8);
    tl.to(st, { n: 44, yr: 1, duration: 1.4, ease: "power1.inOut", onUpdate: render }, 1.8);
    const rest = dots.filter((_, i) => keep44.has(i) && !big3.includes(i));
    tl.to(rest, { attr: { fill: C.muted }, opacity: 0.5, duration: 0.6 }, 3.6);
    tl.to(big3.map((i) => dots[i]), { attr: { fill: C.accent2, r: 12 }, duration: 0.5 }, 3.6);
    tl.to(nameL, { opacity: 1, duration: 0.4, stagger: 0.15 }, 3.9);
    tl.from(slide.querySelectorAll(".rw-facts > *"), { opacity: 0, x: 24, stagger: 0.3, duration: 0.5 }, 0.6);
    return { tl };
  };

  /* ---------- 13 · Dot-com: Nasdaq esquemático ---------- */
  anims.dotcom = function (slide) {
    const W = 680, H = 400;
    const s = Deck.stageSvg(slide.querySelector("#dc-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const x = (yr) => 40 + ((yr - 1996) / (2016 - 1996)) * (W - 80);
    const y = (v) => 350 - (v / 5500) * 300;
    [1000, 3000, 5000].forEach((v) => {
      svg("line", { x1: 40, x2: W - 30, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1, opacity: 0.6 }, s);
      label(s, 34, y(v) + 5, Deck.fmt(v), { anchor: "end", font: Deck.MONO, size: 14, fill: C.muted });
    });
    svg("line", { x1: 40, x2: W - 30, y1: 350, y2: 350, stroke: C.lineStrong }, s);
    [1996, 2000, 2005, 2010, 2015].forEach((yr) => label(s, x(yr), 376, yr, { anchor: "middle", font: Deck.MONO, size: 15, fill: C.text2 }));
    const P = { g: [x(1996.93), y(1300)], peak: [x(2000.19), y(5048.62)], low: [x(2002.77), y(1114.11)], rec: [x(2015.31), y(5048.62)] };
    const up = svg("path", { d: `M${P.g[0]} ${P.g[1]} C ${x(1998.5)} ${y(1500)}, ${x(1999.4)} ${y(2600)}, ${P.peak[0]} ${P.peak[1]}`, stroke: C.accent, "stroke-width": 4, fill: "none" }, s);
    const down = svg("path", { d: `M${P.peak[0]} ${P.peak[1]} C ${x(2000.8)} ${y(3000)}, ${x(2001.8)} ${y(1500)}, ${P.low[0]} ${P.low[1]}`, stroke: C.warm, "stroke-width": 4, fill: "none" }, s);
    const back = svg("path", { d: `M${P.low[0]} ${P.low[1]} C ${x(2007)} ${y(2600)}, ${x(2010)} ${y(2300)}, ${P.rec[0]} ${P.rec[1]}`, stroke: C.accent2, "stroke-width": 3, fill: "none", "stroke-dasharray": "2 7", "stroke-linecap": "round" }, s);
    const ref = svg("line", { x1: P.peak[0], x2: P.rec[0], y1: P.peak[1], y2: P.rec[1], stroke: C.lineStrong, "stroke-dasharray": "4 6" }, s);
    const dots = [
      [P.g, "Greenspan, dic-96", "start", -40, 36],
      [P.peak, "5.048 · 10-mar-2000", "start", 14, 0],
      [P.low, "1.114 · −78 %", "start", 12, 26],
      [P.rec, "15 años después", "end", -12, -14],
    ].map(([p, t, a, dx, dy], i) => {
      const g = svg("g", { opacity: 0 }, s);
      svg("circle", { cx: p[0], cy: p[1], r: 7, fill: C.bg, stroke: [C.text2, C.accent, C.warm, C.accent2][i], "stroke-width": 3 }, g);
      label(g, p[0] + dx, p[1] + dy, t, { anchor: a, font: Deck.MONO, size: 15, fill: C.text });
      return g;
    });
    tl.to(dots[0], { opacity: 1, duration: 0.3 }, 0.1);
    Deck.draw(tl, up, 0.3, 1.2);
    tl.to(dots[1], { opacity: 1, duration: 0.3 }, 1.4);
    Deck.draw(tl, down, 1.6, 0.8);
    tl.to(dots[2], { opacity: 1, duration: 0.3 }, 2.3);
    tl.from(ref, { opacity: 0, duration: 0.4 }, 2.5);
    tl.from(back, { opacity: 0, duration: 1.2 }, 2.6);
    tl.to(dots[3], { opacity: 1, duration: 0.3 }, 3.4);
    Deck.fillBars(tl, slide.querySelector("#dc-bars"), 0.6);
    tl.from(slide.querySelectorAll(".dc-grid > div:last-child > p, .dc-grid .quote-card"), { opacity: 0, y: 14, stagger: 0.3, duration: 0.5 }, 1.4);
    return { tl };
  };

  /* ---------- 14 · Fibra: lo prometido vs lo real (stepped, escala log) ---------- */
  anims.fiber = function (slide) {
    const W = 730, H = 400;
    const s = Deck.stageSvg(slide.querySelector("#fb-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#fb-caption"), [
      "1997–2000: se repite que el tráfico de internet <strong>se duplica cada 3–4 meses</strong>. Con esa previsión se tiende fibra por medio planeta… a crédito.",
      "Coffman y Odlyzko (2001): «no hay evidencia real». El tráfico crecía <strong class='c-accent-2'>~100 % al año</strong>; el ritmo explosivo solo se vio en 1995–96.",
      "En cuatro años la diferencia es de <strong>más de mil veces</strong>. La mayoría de la fibra se quedó apagada y la deuda que la pagó no se pudo devolver.",
    ]);
    const x0 = 80, x1 = 690, yb = 350, yt = 30;
    const x = (t) => x0 + (t / 4) * (x1 - x0);
    const y = (v) => yb - (Math.log10(v) / 5) * (yb - yt);
    [1, 10, 100, 1000, 10000, 100000].forEach((v) => {
      svg("line", { x1: x0, x2: x1, y1: y(v), y2: y(v), stroke: C.line, "stroke-width": 1, opacity: 0.6 }, s);
      label(s, x0 - 12, y(v) + 5, `×${Deck.fmt(v)}`, { anchor: "end", font: Deck.MONO, size: 14, fill: C.muted });
    });
    [1997, 1998, 1999, 2000, 2001].forEach((yr, i) => label(s, x(i), yb + 28, yr, { anchor: "middle", font: Deck.MONO, size: 15, fill: C.text2 }));
    const prom = [], real = [];
    for (let t = 0; t <= 4.001; t += 0.05) {
      prom.push([x(t), y(Math.pow(2, (t * 365) / 100))]);
      real.push([x(t), y(Math.pow(2, t))]);
    }
    const area = svg("path", { d: Deck.pathD(prom) + " " + real.slice().reverse().map((p) => `L${p[0]} ${p[1]}`).join(" ") + " Z", fill: "rgba(239,91,79,0.12)", opacity: 0 }, s);
    const pP = svg("path", { d: Deck.pathD(prom), stroke: C.accent, "stroke-width": 4, fill: "none" }, s);
    const rP = svg("path", { d: Deck.pathD(real), stroke: C.accent2, "stroke-width": 4, fill: "none", opacity: 0 }, s);
    const pL = label(s, x(2.1), y(Math.pow(2, (2.1 * 365) / 100)) - 18, "lo prometido: ×2 cada 100 días", { font: Deck.MONO, size: 16, fill: C.accent, anchor: "end" });
    const rL = label(s, x(2), y(4) + 34, "lo real: ×2 al año", { font: Deck.MONO, size: 16, fill: C.accent2, anchor: "middle", opacity: 0 });
    const gL = label(s, x(3.2), y(300), "fibra oscura", { font: Deck.DISPLAY, size: 28, italic: true, fill: C.warm, anchor: "middle", opacity: 0 });
    const facts = slide.querySelectorAll("#fb-facts .fact");
    gsap.set(facts, { opacity: 0.12 });

    Deck.draw(tl, pP, 0.1, 1.6);
    tl.from(pL, { opacity: 0, duration: 0.4 }, 1.2);
    show(0, 0.1);
    tl.addLabel("s0");
    show(1, "s0");
    tl.set(rP, { opacity: 1 }, "s0");
    Deck.draw(tl, rP, tl.labels.s0, 1.2);
    tl.to(rL, { opacity: 1, duration: 0.4 }, "s0+=0.9");
    tl.addLabel("s1");
    show(2, "s1");
    tl.to(area, { opacity: 1, duration: 0.8 }, "s1");
    tl.to(gL, { opacity: 1, duration: 0.5 }, "s1+=0.4");
    tl.to(facts, { opacity: 1, stagger: 0.2, duration: 0.4 }, "s1+=0.5");
    tl.addLabel("s2");
    return { tl };
  };

  /* ---------- 15 · Cisco vs NVIDIA ---------- */
  anims.cisco = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".cs-tbl thead, .cs-tbl tbody tr"), { opacity: 0, y: 16, stagger: 0.3, duration: 0.5 }, 0.1);
    tl.from(slide.querySelectorAll(".cs-tbl .pill"), { opacity: 0, scale: 0.7, stagger: 0.3, duration: 0.35 }, 0.5);
    return { tl };
  };

  /* ---------- 16 · Flotas: quién quedó a flote ---------- */
  anims.boats = function (slide) {
    const W = 1424, H = 470;
    const s = Deck.stageSvg(slide.querySelector("#bt-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const fleets = [
      { name: "Ferrocarril RU · 1840s", n: 10, keep: { 3: "líneas consolidadas", 7: "" } },
      { name: "Coches EE. UU. · 1908–29", n: 10, keep: { 1: "Ford", 4: "GM", 8: "Chrysler" } },
      { name: "Dot-com · 1995–2002", n: 10, keep: { 2: "Amazon", 5: "eBay", 9: "Priceline" } },
      { name: "Telecom · 1997–2002", n: 10, keep: {}, late: ["Google", "YouTube"] },
    ];
    const rowH = 112, x0 = 330, step = 104;
    const boat = (g, x, y, col) => {
      svg("path", { d: `M${x - 30} ${y} L${x + 30} ${y} L${x + 20} ${y + 16} L${x - 20} ${y + 16} Z`, fill: col }, g);
      svg("line", { x1: x, x2: x, y1: y, y2: y - 30, stroke: col, "stroke-width": 3 }, g);
      svg("path", { d: `M${x + 2} ${y - 28} L${x + 22} ${y - 6} L${x + 2} ${y - 6} Z`, fill: col, opacity: 0.8 }, g);
    };
    fleets.forEach((f, r) => {
      const y = 50 + r * rowH;
      label(s, 20, y + 4, f.name, { font: Deck.MONO, size: 17, fill: C.text });
      const water = svg("path", { d: `M${x0 - 50} ${y + 20} q 26 -8 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0 t 52 0`, stroke: "rgba(61,143,208,0.45)", "stroke-width": 2, fill: "none" }, s);
      tl.from(water, { opacity: 0, duration: 0.4 }, 0.1 + r * 0.1);
      const sinkers = [];
      const keepers = [];
      for (let i = 0; i < f.n; i++) {
        const g = svg("g", {}, s);
        const kept = f.keep[i] !== undefined;
        boat(g, x0 + i * step, y, C.markA);
        (kept ? keepers : sinkers).push({ g, i });
        tl.from(g, { opacity: 0, x: -40, duration: 0.4 }, 0.2 + r * 0.15 + i * 0.03);
        if (kept && f.keep[i]) {
          const t = label(s, x0 + i * step, y + 42, f.keep[i], { anchor: "middle", font: Deck.MONO, size: 15, fill: C.accent2, opacity: 0 });
          tl.to(t, { opacity: 1, duration: 0.4 }, 3.2 + r * 0.2);
        }
      }
      sinkers.forEach(({ g }, k) => {
        tl.to(g, { y: 26, opacity: 0.14, rotation: k % 2 ? 18 : -18, transformOrigin: "50% 100%", duration: 0.7, ease: "power2.in" }, 1.6 + r * 0.25 + k * 0.05);
      });
      keepers.forEach(({ g }) => tl.to(g.querySelectorAll("path"), { attr: { fill: C.accent2 }, duration: 0.4 }, 3.0 + r * 0.2));
      keepers.forEach(({ g }) => tl.to(g.querySelectorAll("line"), { attr: { stroke: C.accent2 }, duration: 0.4 }, 3.0 + r * 0.2));
      if (f.late) {
        const lateL = label(s, x0 + 6.4 * step, y + 6, "llegaron después del crash →", { anchor: "end", font: Deck.BODY, size: 17, italic: true, fill: C.accent2, opacity: 0 });
        tl.to(lateL, { opacity: 1, duration: 0.4 }, 3.7);
        f.late.forEach((nm, k) => {
          const g = svg("g", {}, s);
          const bx = x0 + (7.2 + k * 1.8) * step;
          boat(g, bx, y, C.accent2);
          label(g, bx, y + 42, nm, { anchor: "middle", font: Deck.MONO, size: 15, fill: C.accent2 });
          tl.from(g, { opacity: 0, x: 300, duration: 1.0, ease: "power2.out" }, 3.8 + k * 0.3);
        });
      }
    });
    return { tl };
  };
})();
