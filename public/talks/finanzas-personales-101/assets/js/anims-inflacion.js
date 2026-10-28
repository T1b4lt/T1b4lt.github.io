/* Section 01: inflation. */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  // Shopping cart: items drop in, then the receipt total climbs 100 € → 127,70 €.
  A["cesta"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 749,
      H = 520;
    const svg = F.stage(slide, "#ce-stage", W, H);

    // Cart
    const cart = F.el("g", {}, svg);
    F.path(cart, "M30 90 L90 90 L130 330 L420 330 L455 150 L105 150", { stroke: C.text, w: 5 });
    F.el("circle", { cx: 160, cy: 380, r: 22, fill: "none", stroke: C.text, "stroke-width": 5 }, cart);
    F.el("circle", { cx: 390, cy: 380, r: 22, fill: "none", stroke: C.text, "stroke-width": 5 }, cart);

    const items = [
      ["Pan", 120, 255, 92, 70, C.gold],
      ["Luz", 222, 255, 92, 70, C.accent],
      ["Alquiler", 324, 255, 108, 70, C.warm],
      ["Gasolina", 140, 178, 118, 70, C.accent2],
      ["Café", 268, 178, 84, 70, C.gold],
      ["Viajes", 360, 178, 86, 70, C.accent],
    ];
    const itemGroups = items.map(([name, x, y, w, h, col]) => {
      const g = F.el("g", {}, svg);
      F.rect(g, x, y, w, h, { fill: "#fffaf5", stroke: col, sw: 2.5, rx: 6 });
      F.text(g, x + w / 2, y + h / 2 + 7, name, { size: 19, anchor: "middle", fill: C.heading, weight: 600 });
      return g;
    });

    // Receipt
    const rx = 500,
      ry = 40,
      rw = 230,
      rh = 380;
    const rc = F.el("g", {}, svg);
    F.path(rc, `M${rx} ${ry} H${rx + rw} V${ry + rh} l-19 -12 l-19 12 l-19 -12 l-19 12 l-19 -12 l-19 12 l-19 -12 l-19 12 l-19 -12 l-19 12 l-19 -12 l-21 12 Z`, {
      fill: "#fffaf5",
      stroke: C.lineStrong,
      w: 1.5,
    });
    F.text(rc, rx + rw / 2, ry + 40, "TICKET", { size: 18, anchor: "middle", font: Deck.MONO, fill: C.muted, spacing: 4 });
    F.line(rc, rx + 20, ry + 58, rx + rw - 20, ry + 58, { stroke: C.lineStrong, dash: "4 4" });
    const when = F.text(rc, rx + rw / 2, ry + 96, "enero 2020", { size: 22, anchor: "middle", font: Deck.MONO, fill: C.text });
    items.forEach((it, i) => F.text(rc, rx + 24, ry + 136 + i * 24, it[0].toLowerCase(), { size: 15, font: Deck.MONO, fill: C.muted }));
    F.line(rc, rx + 20, ry + 286, rx + rw - 20, ry + 286, { stroke: C.lineStrong, dash: "4 4" });
    F.text(rc, rx + 24, ry + 308, "TOTAL", { size: 16, font: Deck.MONO, fill: C.muted });
    const tot = F.text(rc, rx + rw - 22, ry + 350, "100,00 €", { size: 34, anchor: "end", font: Deck.MONO, fill: C.heading, weight: 600 });
    const up = F.text(svg, rx + rw / 2, ry + rh + 50, "+27,7 %", { size: 40, anchor: "middle", font: Deck.DISPLAY, weight: 700, fill: C.warm });

    F.fade(tl, cart, 0, { dur: 0.4 });
    tl.from(itemGroups, { y: -260, opacity: 0, duration: 0.55, stagger: 0.12, ease: "bounce.out" }, 0.3);
    F.pop(tl, rc, 1.3);
    const months = ["enero 2020", "enero 2021", "enero 2022", "enero 2023", "enero 2024", "enero 2025", "enero 2026", "agosto 2026"];
    const idx = { i: 0 };
    tl.fromTo(idx, { i: 0 }, { i: 7, duration: 2.6, ease: "none", onUpdate: () => (when.textContent = months[Math.round(idx.i)]) }, 1.8);
    F.count(tl, tot, 100, 127.7, 1.8, { dur: 2.6, ease: "none", fmt: (v) => F.num(v, 2) + " €" });
    F.pop(tl, up, 4.5);
    return { tl };
  };

  // Purchasing power of 1 € at 2 / 3 / 5 % inflation after 10 / 20 / 30 years.
  A["erosion"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 520;
    const svg = F.stage(slide, "#er-stage", W, H);
    const rates = [2, 3, 5];
    const yrs = [0, 10, 20, 30];
    const top = 90,
      base = 430;
    const sy = F.scale(0, 1, base, top);
    const gw = 420,
      gap = 82,
      bw = 72,
      bgap = 24;
    F.line(svg, 0, base, W, base, { stroke: C.lineStrong, w: 1.4 });
    F.line(svg, 0, sy(1), W, sy(1), { stroke: C.line, dash: "4 6" });
    F.text(svg, W, sy(1) - 8, "1 € de hoy", { size: 15, anchor: "end", fill: C.muted, font: Deck.MONO });

    rates.forEach((r, gi) => {
      const gx = gi * (gw + gap) + 20;
      const head = F.text(svg, gx + gw / 2, 26, `Inflación del ${r} %`, { size: 26, anchor: "middle", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      F.fade(tl, head, gi * 0.15);
      yrs.forEach((n, i) => {
        const v = 1 / Math.pow(1 + r / 100, n);
        const x = gx + i * (bw + bgap) + 8;
        const col = n === 0 ? C.lineStrong : C.warm;
        const rect = F.rect(svg, x, sy(v), bw, base - sy(v), { fill: n === 0 ? "rgba(51,48,46,0.18)" : col, rx: 3, opacity: n === 0 ? 1 : 0.35 + (i / 3) * 0.65 });
        const val = F.text(svg, x + bw / 2, sy(v) - 12, F.num(v, 2) + " €", { size: 20, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
        F.text(svg, x + bw / 2, base + 30, n === 0 ? "hoy" : `${n} años`, { size: 17, anchor: "middle", fill: C.muted });
        // Bars start at 1 € and shrink to their value.
        const at = 0.4 + gi * 0.35 + i * 0.12;
        tl.fromTo(rect, { attr: { y: sy(1), height: base - sy(1) } }, { attr: { y: sy(v), height: base - sy(v) }, duration: 0.9, ease: "power2.inOut" }, at);
        const st = { v: 1 };
        tl.fromTo(st, { v: 1 }, { v, duration: 0.9, ease: "power2.inOut", onUpdate: () => (val.textContent = F.num(st.v, 2) + " €") }, at);
        tl.fromTo(val, { attr: { y: sy(1) - 12 } }, { attr: { y: sy(v) - 12 }, duration: 0.9, ease: "power2.inOut" }, at);
      });
    });
    const msg = F.text(svg, W / 2, base + 84, "Al 2 % (el objetivo «bueno» del BCE), en 30 años cada euro compra un 45 % menos.", {
      size: 26,
      anchor: "middle",
      fill: C.warm,
      font: Deck.DISPLAY,
      style: "italic",
    });
    F.pop(tl, msg, 2.4);
    return { tl };
  };

  // Spain & euro area inflation, stepped by episode.
  A["ipc"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#ipc-stage", W, H);
    const m = (y, mo) => y + (mo - 1) / 12;
    // [date, Spain IPC, euro area HICP] (research/inflacion-y-dinero-fiat.md §4.1-4.2)
    const d = [
      [m(2015, 12), 0.0, 0.3],
      [m(2016, 12), 1.6, 1.1],
      [m(2017, 12), 1.1, 1.3],
      [m(2018, 12), 1.2, 1.5],
      [m(2019, 12), 0.8, 1.3],
      [m(2020, 12), -0.5, -0.3],
      [m(2021, 12), 6.5, 5.0],
      [m(2022, 3), 9.8, 7.4],
      [m(2022, 6), 10.2, 8.6],
      [m(2022, 7), 10.8, 8.9],
      [m(2022, 9), 8.9, 9.9],
      [m(2022, 10), 7.3, 10.6],
      [m(2022, 12), 5.7, 9.2],
      [m(2023, 12), 3.1, 2.9],
      [m(2024, 12), 2.8, 2.4],
      [m(2025, 12), 2.9, 1.9],
      [m(2026, 1), 2.3, 1.7],
      [m(2026, 2), 2.3, 1.9],
      [m(2026, 3), 3.4, 2.6],
      [m(2026, 4), 3.2, 3.0],
      [m(2026, 5), 3.2, 3.2],
      [m(2026, 6), 3.2, 2.8],
      [m(2026, 7), 3.6, 2.9],
      [m(2026, 8), 4.3, 3.2],
      [m(2026, 9), 4.9, 3.8],
    ];
    const x0 = 60,
      x1 = W - 70;
    const sx = F.scale(2015.9, 2026.75, x0, x1);
    const sy = F.scale(-1, 12, H - 40, 20);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [0, 2, 4, 6, 8, 10, 12], x0, x1, { fmt: (v) => v + " %" });
    for (let y = 2016; y <= 2026; y++) F.text(g, sx(y), H - 12, String(y), { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO });
    F.line(g, x0, sy(2), x1, sy(2), { stroke: C.muted, dash: "6 6", w: 1.6 });

    // Episode bands
    const band = (a, b, label, col) => {
      const r = F.rect(g, sx(a), 14, sx(b) - sx(a), sy(-1) - 14, { fill: col, rx: 0, opacity: 0 });
      const t = F.text(g, (sx(a) + sx(b)) / 2, sy(-1) - 12, label, { size: 16, anchor: "middle", fill: C.heading, weight: 600, font: Deck.MONO, opacity: 0 });
      return [r, t];
    };
    const bCovid = band(2020.2, 2021.95, "COVID", "rgba(0,144,128,0.10)");
    const bUkr = band(2022.12, 2022.99, "UCRANIA", "rgba(153,15,61,0.09)");
    const bIran = band(2026.15, 2026.75, "IRÁN", "rgba(208,138,0,0.14)");

    const clip = F.clip(svg, "ipc-clip", 0, 0, sx(2020.0), H);
    const lines = F.el("g", { "clip-path": "url(#ipc-clip)" }, svg);
    const pe = F.path(lines, F.poly(d.map((p) => [sx(p[0]), sy(p[2])])), { stroke: C.markA, w: 3 });
    const ps = F.path(lines, F.poly(d.map((p) => [sx(p[0]), sy(p[1])])), { stroke: C.markB, w: 3.5 });

    const marker = (date, v, col, txt, dx, dy, anchor) => {
      const gg = F.el("g", { opacity: 0 }, svg);
      F.el("circle", { cx: sx(date), cy: sy(v), r: 7, fill: col, stroke: C.bg, "stroke-width": 2 }, gg);
      F.text(gg, sx(date) + dx, sy(v) + dy, txt, { size: 19, fill: C.heading, weight: 700, anchor: anchor || "start" });
      return gg;
    };
    const mEs = marker(m(2022, 7), 10.8, C.markB, "España 10,8 % (jul-22)", -14, -4, "end");
    const mEu = marker(m(2022, 10), 10.6, C.markA, "Eurozona 10,6 % (oct-22)", 14, -2);
    const mNow = marker(m(2026, 9), 4.9, C.markB, "4,9 %", -12, -14, "end");
    const tgt = F.text(svg, x0 + 8, sy(2) - 10, "objetivo del BCE: 2 %", { size: 15, fill: C.muted, font: Deck.MONO });

    const cap = Deck.captions(tl, slide.querySelector("#ipc-cap"), [
      "2016-2020: inflación por debajo del 2 %. Los precios casi no se movían y el dinero en el banco «aguantaba».",
      "COVID: cierres, cuellos de botella y dinero público y monetario a raudales. A finales de 2021, España ya está en el 6,5 %.",
      "Ucrania: la energía y los alimentos se disparan. España toca el 10,8 % en julio de 2022 y la eurozona el 10,6 % en octubre.",
      "2023-2025: el BCE sube los tipos hasta el 4 % y la inflación vuelve cerca del 2-3 %. Bajar la inflación no es bajar los precios.",
      "2026: la guerra con Irán dispara el petróleo y la inflación repunta al 4,9 % en septiembre (dato adelantado). El BCE vuelve a subir tipos.",
    ]);

    F.fade(tl, g, 0, { dur: 0.4 });
    F.fade(tl, tgt, 0.2);
    tl.fromTo(clip, { attr: { width: sx(2015.9) } }, { attr: { width: sx(2020.1) }, duration: 1.2, ease: "none" }, 0.3);
    cap(0, 0.3);
    tl.addLabel("s0");
    tl.to(bCovid, { opacity: 1, duration: 0.3 }, "s0");
    tl.to(clip, { attr: { width: sx(2022.0) }, duration: 1.2, ease: "none" }, "s0+=0.2");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to(bUkr, { opacity: 1, duration: 0.3 }, "s1");
    tl.to(clip, { attr: { width: sx(2023.0) }, duration: 1.2, ease: "none" }, "s1+=0.2");
    tl.to([mEs, mEu], { opacity: 1, duration: 0.4, stagger: 0.4 }, "s1+=0.6");
    cap(2, "s1");
    tl.addLabel("s2");
    tl.to(clip, { attr: { width: sx(2026.05) }, duration: 1.2, ease: "none" }, "s2");
    cap(3, "s2");
    tl.addLabel("s3");
    tl.to(bIran, { opacity: 1, duration: 0.3 }, "s3");
    tl.to(clip, { attr: { width: W }, duration: 1.0, ease: "none" }, "s3+=0.2");
    tl.to(mNow, { opacity: 1, duration: 0.4 }, "s3+=1.1");
    cap(4, "s3");
    tl.addLabel("s4");
    return { tl };
  };

  // Three shocks: cards appear one per step, with a mini timeline underneath.
  A["golpes"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 120;
    const svg = F.stage(slide, "#gp-stage", W, H);
    const sx = F.scale(2019.5, 2026.9, 20, W - 20);
    F.line(svg, 20, 60, W - 20, 60, { stroke: C.lineStrong, w: 2 });
    for (let y = 2020; y <= 2026; y++) {
      F.line(svg, sx(y), 52, sx(y), 68, { stroke: C.lineStrong, w: 2 });
      F.text(svg, sx(y), 98, String(y), { size: 16, anchor: "middle", fill: C.muted, font: Deck.MONO });
    }
    const spans = [
      [2020.2, 2021.95, C.accent2],
      [2022.15, 2022.95, C.warm],
      [2026.16, 2026.8, C.gold],
    ].map(([a, b, col]) => F.rect(svg, sx(a), 50, sx(b) - sx(a), 20, { fill: col, rx: 4 }));
    const cards = slide.querySelectorAll(".golpe");
    F.hide([...cards, ...spans]);
    const reveal = (i, at) => {
      tl.fromTo(cards[i], { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, at);
      tl.fromTo(spans[i], { opacity: 0 }, { opacity: 1, duration: 0.5 }, at);
      tl.set(cards, { borderColor: C.line }, at);
      tl.to(cards[i], { borderColor: C.heading, duration: 0.3 }, at);
    };
    reveal(0, 0.2);
    tl.addLabel("s0");
    reveal(1, "s0");
    tl.addLabel("s1");
    reveal(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Price level (Jan-2020 = 100) as a staircase that never steps down.
  A["acumulado"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 763,
      H = 520;
    const svg = F.stage(slide, "#ac-stage", W, H);
    const d = [
      ["ene-20", 100],
      ["dic-20", 100.5],
      ["dic-21", 107.0],
      ["dic-22", 113.1],
      ["dic-23", 116.6],
      ["dic-24", 119.9],
      ["dic-25", 123.5],
      ["ago-26", 127.7],
    ];
    const x0 = 60,
      x1 = W - 10;
    const sy = F.scale(90, 132, H - 50, 50);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [90, 100, 110, 120, 130], x0, x1);
    const bw = (x1 - x0) / d.length - 16;
    const bars = d.map(([lbl, v], i) => {
      const x = x0 + 8 + i * (bw + 16);
      const r = F.rect(svg, x, sy(v), bw, sy(90) - sy(v), { fill: i === d.length - 1 ? C.warm : "rgba(153,15,61,0.55)", rx: 3 });
      const t = F.text(svg, x + bw / 2, sy(v) - 10, F.num(v, 1), { size: 17, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
      F.text(svg, x + bw / 2, H - 24, lbl, { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO });
      return [r, t];
    });
    F.line(svg, x0, sy(100), x1, sy(100), { stroke: C.text, dash: "5 5", w: 1.4 });
    F.line(svg, x0 + 10, 12, x0 + 40, 12, { stroke: C.text, dash: "5 5", w: 1.4 });
    F.text(svg, x0 + 48, 17, "nivel de precios de enero de 2020 = 100", { size: 15, fill: C.muted, font: Deck.MONO });
    F.fade(tl, g, 0, { dur: 0.3 });
    bars.forEach(([r, t], i) => {
      F.growV(tl, r, 0.2 + i * 0.22, 0.5, sy(90));
      F.fade(tl, t, 0.45 + i * 0.22);
    });
    F.count(tl, slide.querySelector("#ac-num"), 0, 27.7, 0.2, { dur: 0.22 * d.length + 0.4, dec: 1, ease: "none" });
    return { tl };
  };

  // Deposit rate vs inflation, 2021-2026, with the real-rate gap.
  A["real"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 470;
    const svg = F.stage(slide, "#re-stage", W, H);
    const d = [
      ["2021", 0.05, 3.1],
      ["2022", 0.25, 8.4],
      ["2023", 1.95, 3.5],
      ["2024", 2.42, 2.8],
      ["2025", 1.76, 2.7],
      ["2026*", 1.84, 3.2],
    ];
    const x0 = 70,
      x1 = W - 20;
    const sy = F.scale(0, 9, H - 50, 80);
    const g = F.el("g", {}, svg);
    F.yAxis(g, sy, [0, 2, 4, 6, 8], x0, x1, { fmt: (v) => v + " %" });
    F.fade(tl, g, 0, { dur: 0.3 });
    const gw = (x1 - x0) / d.length;
    const bw = 70;
    d.forEach(([yr, dep, ipc], i) => {
      const cx = x0 + gw * i + gw / 2;
      const r1 = F.rect(svg, cx - bw - 4, sy(dep), bw, sy(0) - sy(dep), { fill: C.markA });
      const r2 = F.rect(svg, cx + 4, sy(ipc), bw, sy(0) - sy(ipc), { fill: C.markB });
      const t1 = F.text(svg, cx - bw / 2 - 4, sy(dep) - 10, F.num(dep, 2), { size: 17, anchor: "middle", fill: C.heading, font: Deck.MONO });
      const t2 = F.text(svg, cx + bw / 2 + 4, sy(ipc) - 10, F.num(ipc, 1), { size: 17, anchor: "middle", fill: C.heading, font: Deck.MONO });
      F.text(svg, cx, H - 20, yr, { size: 18, anchor: "middle", fill: C.muted, font: Deck.MONO });
      const real = dep - ipc;
      const rt = F.text(svg, cx, 32, "real " + F.num(real, 1), { size: 19, anchor: "middle", fill: C.warm, font: Deck.MONO, weight: 600 });
      const at = 0.3 + i * 0.25;
      F.growV(tl, r1, at, 0.6, sy(0));
      F.growV(tl, r2, at + 0.1, 0.6, sy(0));
      F.fade(tl, [t1, t2], at + 0.4);
      F.pop(tl, rt, at + 0.6);
    });
    F.pop(tl, slide.querySelector(".callout"), 2.2);
    return { tl };
  };
})();
