/* Sections 06 (basic portfolio) and 07 (core and satellites). */
(function () {
  const Deck = window.Deck;
  const F = Deck.F;
  const C = Deck.colors;
  const A = Deck.anims;

  A["motor"] = Deck.simple([".card", ".callout"], { stagger: 0.25 });

  // Risk profiles: composition, worst year (left) and average annual return (right).
  A["perfiles"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 540;
    const svg = F.stage(slide, "#pf-stage", W, H);
    const d = [
      [100, 10.1, -43.1, "1931"],
      [80, 9.5, -34.9, "1931"],
      [60, 8.8, -26.6, "1931"],
      [40, 7.8, -18.4, "1931"],
      [0, 5.3, -13.1, "2022"],
    ];
    const cx0 = 150,
      cw = 260;
    const sx = F.scale(-50, 15, 520, W - 70);
    const g = F.el("g", {}, svg);
    F.text(g, cx0, 26, "Renta variable / renta fija", { size: 18, fill: C.heading, weight: 600 });
    F.text(g, sx(-25), 26, "Peor año", { size: 18, fill: C.warm, weight: 700, anchor: "middle" });
    F.text(g, sx(7.5), 26, "Media anual", { size: 18, fill: C.accent, weight: 700, anchor: "middle" });
    [-40, -20, 0, 10].forEach((t) => {
      F.line(g, sx(t), 44, sx(t), H - 34, { stroke: t === 0 ? C.text : C.line, w: t === 0 ? 1.6 : 1, dash: t === 0 ? null : "3 5" });
      F.text(g, sx(t), H - 10, (t > 0 ? "+" : "") + t + " %", { size: 15, anchor: "middle", fill: C.muted, font: Deck.MONO });
    });
    F.fade(tl, g, 0, { dur: 0.3 });
    const rowH = 92,
      y0 = 56;
    d.forEach(([rv, avg, worst, yr], i) => {
      const y = y0 + i * rowH;
      F.text(svg, cx0 - 20, y + 42, `${rv}/${100 - rv}`, { size: 28, anchor: "end", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      const a = F.rect(svg, cx0, y + 18, (cw * rv) / 100, 36, { fill: C.markA, rx: 2 });
      const b = F.rect(svg, cx0 + (cw * rv) / 100 + (rv > 0 && rv < 100 ? 2 : 0), y + 18, (cw * (100 - rv)) / 100 - (rv > 0 && rv < 100 ? 2 : 0), 36, { fill: C.markC, rx: 2 });
      const wr = F.rect(svg, sx(worst), y + 16, sx(0) - sx(worst), 40, { fill: C.markB });
      const ar = F.rect(svg, sx(0), y + 16, sx(avg) - sx(0), 40, { fill: C.markA });
      const wt = F.text(svg, sx(worst) - 10, y + 44, F.num(worst, 1) + " % (" + yr + ")", { size: 18, anchor: "end", fill: C.heading, font: Deck.MONO, weight: 600 });
      const at = F.text(svg, sx(avg) + 10, y + 44, (i === 1 ? "≈" : "") + F.num(avg, 1) + " %", { size: 18, fill: C.heading, font: Deck.MONO, weight: 600 });
      const t0 = 0.3 + i * 0.3;
      F.fade(tl, [a, b], t0);
      F.growH(tl, wr, t0 + 0.1, 0.7, true);
      F.growH(tl, ar, t0 + 0.1, 0.7);
      F.fade(tl, [wt, at], t0 + 0.5);
    });
    const leg = F.el("g", {}, svg);
    F.rect(leg, cx0, H - 26, 14, 14, { fill: C.markA });
    F.text(leg, cx0 + 20, H - 14, "bolsa", { size: 15, fill: C.text2 });
    F.rect(leg, cx0 + 90, H - 26, 14, 14, { fill: C.markC });
    F.text(leg, cx0 + 110, H - 14, "bonos", { size: 15, fill: C.text2 });
    F.fade(tl, leg, 0.3);
    return { tl };
  };

  // "Would you sleep?": 10.000 € hit by each mix's worst year.
  A["dormir"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 460;
    const svg = F.stage(slide, "#dm-stage", W, H);
    const d = [
      ["100 % bolsa", -43.1, C.markA],
      ["60 / 40", -26.6, C.markC],
      ["40 / 60", -18.4, C.markD],
    ];
    const base = H - 50,
      top = 60;
    const sy = F.scale(0, 10000, base, top);
    const bw = 200;
    const cols = d.map(([name, w, col], i) => {
      const cx = 260 + i * 420;
      F.text(svg, cx, base + 34, name, { size: 24, anchor: "middle", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
      F.rect(svg, cx - bw / 2, sy(10000), bw, base - sy(10000), { fill: "none", stroke: C.lineStrong, sw: 2, dash: "6 5" });
      const r = F.rect(svg, cx - bw / 2, sy(10000), bw, base - sy(10000), { fill: col });
      const v = F.text(svg, cx, sy(10000) - 14, "10.000 €", { size: 28, anchor: "middle", fill: C.heading, font: Deck.MONO, weight: 600 });
      const loss = F.text(svg, cx + bw / 2 + 14, sy(10000) + 30, F.num(w, 1) + " %", { size: 26, fill: C.warm, font: Deck.DISPLAY, weight: 700, opacity: 0 });
      const end = 10000 * (1 + w / 100);
      return { r, v, loss, end, cx };
    });
    F.line(svg, 40, base, W - 40, base, { stroke: C.text, w: 1.5 });
    const cap = Deck.captions(tl, slide.querySelector("#dm-cap"), [
      "Tienes 10.000 € invertidos. Te sientes inteligente: llevas tres años ganando.",
      "Llega un año como 1931 o 2008. Esto es lo que ves en la app. Ahora mismo, ¿vendes o aguantas?",
      "Si vendes, la caída se convierte en pérdida real. Si no podrías soportarlo, necesitas más renta fija: tu perfil es el que te deja dormir, no el que más rinde.",
    ]);
    cols.forEach((c, i) => F.pop(tl, [c.r, c.v], 0.2 + i * 0.15));
    cap(0, 0.3);
    tl.addLabel("s0");
    cols.forEach((c) => {
      tl.to(c.r, { attr: { y: sy(c.end), height: base - sy(c.end) }, duration: 1.2, ease: "power3.in" }, "s0");
      tl.to(c.v, { attr: { y: sy(c.end) - 14 }, duration: 1.2, ease: "power3.in" }, "s0");
      const st = { v: 10000 };
      tl.fromTo(st, { v: 10000 }, { v: c.end, duration: 1.2, ease: "power3.in", onUpdate: () => (c.v.textContent = F.num(Math.round(st.v / 10) * 10) + " €") }, "s0");
      tl.to(c.loss, { opacity: 1, duration: 0.4 }, "s0+=1.2");
    });
    cap(1, "s0");
    tl.addLabel("s1");
    const sell = F.el("g", { opacity: 0 }, svg);
    F.text(sell, 700, 40, "¿Vender?  ✕", { size: 30, anchor: "middle", fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    tl.to(sell, { opacity: 1, duration: 0.4 }, "s1");
    tl.to(cols.map((c) => c.r), { opacity: 0.55, duration: 0.4 }, "s1");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Equity split: world market → example 80/10/10 → one global fund.
  A["reparto"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 692,
      H = 560;
    const svg = F.stage(slide, "#rp-stage", W, H);
    const cx = 300,
      cy = 280,
      r = 190,
      sw = 80;
    const circ = 2 * Math.PI * r;
    const cols = [C.markA, C.markC, C.markD];
    const names = ["Desarrollados", "Emergentes", "Small caps"];
    const segs = cols.map((col) => F.el("circle", { cx, cy, r, fill: "none", stroke: col, "stroke-width": sw }, svg));
    const lbls = cols.map(() => F.text(svg, 0, 0, "", { size: 22, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 }));
    const c1 = F.text(svg, cx, cy - 6, "Bolsa mundial", { size: 26, anchor: "middle", fill: C.heading, font: Deck.DISPLAY, weight: 700 });
    const c2 = F.text(svg, cx, cy + 24, "MSCI ACWI IMI", { size: 17, anchor: "middle", fill: C.muted, font: Deck.MONO });
    const leg = F.el("g", {}, svg);
    names.forEach((n, i) => {
      F.rect(leg, 540, 200 + i * 44, 18, 18, { fill: cols[i] });
      F.text(leg, 566, 215 + i * 44, n, { size: 18, fill: C.text });
    });
    const st = { a: 0, b: 0, c: 0 };
    const render = () => {
      const vals = [st.a, st.b, st.c];
      const tot = 100;
      let acc = 0;
      vals.forEach((v, i) => {
        const len = Math.max(0, (v / tot) * circ - (v > 0.5 ? 3 : 0));
        segs[i].setAttribute("stroke-dasharray", `${len} ${circ}`);
        segs[i].setAttribute("transform", `rotate(${-90 + (acc / tot) * 360} ${cx} ${cy})`);
        const mid = ((acc + v / 2) / tot) * 2 * Math.PI - Math.PI / 2;
        lbls[i].setAttribute("x", cx + Math.cos(mid) * r);
        lbls[i].setAttribute("y", cy + Math.sin(mid) * r + 8);
        lbls[i].textContent = v >= 4 ? Math.round(v) + " %" : "";
        acc += v;
      });
    };
    render();
    const cap = Deck.captions(tl, slide.querySelector("#rp-cap"), [
      '<span class="k">Así está repartido el mundo</span>Grandes y medianas de países desarrollados ~79 %, emergentes ~11 %, empresas pequeñas ~10 %.<small>Peso según el valor en bolsa de cada empresa (aproximado).</small>',
      '<span class="k">Cartera ejemplo</span>80 % MSCI World · 10 % Emergentes · 10 % Small Caps.<small>Tres fondos indexados que, juntos, copian casi todo el mercado mundial. Variantes habituales: 85/15/0 o 70/20/10.</small>',
      '<span class="k">La versión perezosa</span>Un solo fondo global (MSCI ACWI o FTSE All-World): ~89 % desarrollados y ~11 % emergentes.<small>Sin small caps, pero con una sola pieza y sin rebalancear entre fondos. Perfectamente válida.</small>',
    ]);
    tl.to(st, { a: 78.8, b: 10.7, c: 10.5, duration: 1.4, ease: "power2.out", onUpdate: render }, 0.2);
    F.fade(tl, leg, 0.6);
    cap(0, 0.3);
    tl.addLabel("s0");
    tl.to(st, { a: 80, b: 10, c: 10, duration: 0.8, ease: "power2.inOut", onUpdate: render }, "s0");
    const flip = { v: 0 };
    tl.to(flip, { v: 1, duration: 0.4, onUpdate: () => ((c1.textContent = flip.v > 0.5 ? "Cartera ejemplo" : "Bolsa mundial"), (c2.textContent = flip.v > 0.5 ? "3 fondos indexados" : "MSCI ACWI IMI")) }, "s0");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to(st, { a: 89, b: 11, c: 0, duration: 0.9, ease: "power2.inOut", onUpdate: render }, "s1");
    tl.to(flip, { v: 2, duration: 0.4, onUpdate: () => ((c1.textContent = flip.v > 1.5 ? "Un solo fondo" : "Cartera ejemplo"), (c2.textContent = flip.v > 1.5 ? "ACWI / All-World" : "3 fondos indexados")) }, "s1");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  // Rebalancing an 80/20 portfolio.
  A["rebalanceo"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 1424,
      H = 460;
    const svg = F.stage(slide, "#rb-stage", W, H);
    const x0 = 120,
      k = 0.085,
      y = 150,
      bh = 130;
    const rv = F.rect(svg, x0, y, 0, bh, { fill: C.markA, rx: 3 });
    const rf = F.rect(svg, x0, y, 0, bh, { fill: C.markC, rx: 3 });
    const rvT = F.text(svg, 0, y + bh / 2 + 10, "", { size: 26, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 });
    const rfT = F.text(svg, 0, y + bh / 2 + 10, "", { size: 20, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 });
    const pctT = F.text(svg, x0, y - 24, "", { size: 26, fill: C.heading, font: Deck.DISPLAY, weight: 700 });
    const totT = F.text(svg, 0, y + bh + 50, "", { size: 22, anchor: "end", fill: C.text2, font: Deck.MONO });
    const tgt = F.line(svg, 0, y - 14, 0, y + bh + 14, { stroke: C.heading, w: 3, dash: "6 4" });
    const tgtT = F.text(svg, 0, y - 22, "objetivo 80 %", { size: 16, anchor: "middle", fill: C.heading, font: Deck.MONO });
    const legend = F.el("g", {}, svg);
    F.rect(legend, x0, 40, 16, 16, { fill: C.markA });
    F.text(legend, x0 + 24, 54, "Renta variable", { size: 18, fill: C.text });
    F.rect(legend, x0 + 190, 40, 16, 16, { fill: C.markC });
    F.text(legend, x0 + 214, 54, "Renta fija", { size: 18, fill: C.text });
    const opT = F.text(svg, x0, y + bh + 100, "", { size: 26, fill: C.warm, font: Deck.DISPLAY, weight: 700 });
    const ops = ["", "Vendes 368 € de bolsa (cara) → compras renta fija", "Mueves 496 € de renta fija → compras bolsa (barata)"];
    const st = { rv: 8000, rf: 2000, op: 0 };
    const render = () => {
      opT.textContent = ops[Math.round(st.op)];
      const a = st.rv * k,
        b = st.rf * k;
      rv.setAttribute("width", Math.max(0, a - 2));
      rf.setAttribute("x", x0 + a);
      rf.setAttribute("width", b);
      rvT.setAttribute("x", x0 + a / 2);
      rvT.textContent = F.num(Math.round(st.rv)) + " €";
      rfT.setAttribute("x", x0 + a + b / 2);
      rfT.textContent = F.num(Math.round(st.rf)) + " €";
      const tot = st.rv + st.rf;
      const pct = (st.rv / tot) * 100;
      pctT.textContent = `${F.num(pct, 1)} % / ${F.num(100 - pct, 1)} %`;
      pctT.setAttribute("fill", Math.abs(pct - 80) > 2.5 ? C.warm : C.heading);
      totT.setAttribute("x", x0 + tot * k);
      totT.textContent = "Total: " + F.num(Math.round(tot)) + " €";
      const tx = x0 + 0.8 * tot * k;
      tgt.setAttribute("x1", tx);
      tgt.setAttribute("x2", tx);
      tgtT.setAttribute("x", tx);
    };
    render();
    const cap = Deck.captions(tl, slide.querySelector("#rb-cap"), [
      "Empiezas con 10.000 €: 8.000 € en bolsa y 2.000 € en renta fija (80/20).",
      "Año bueno: la bolsa sube un 25 % y la renta fija un 2 %. Sin tocar nada, ahora tienes un 83 % en bolsa: más riesgo del que elegiste.",
      "Rebalanceas: vendes 368 € de bolsa (cara) y compras renta fija. Vuelves al 80/20. Mejor aún: hazlo dirigiendo la aportación nueva a lo que se ha quedado corto.",
      "Año malo (bolsa −30 %): te quedas en 73,5 %. Rebalancear te obliga a comprar bolsa barata justo cuando da miedo. Es la disciplina automática.",
    ]);
    tl.fromTo(st, { rv: 0, rf: 0 }, { rv: 8000, rf: 2000, duration: 1.0, ease: "power2.out", onUpdate: render }, 0.2);
    F.fade(tl, legend, 0.2);
    cap(0, 0.2);
    tl.addLabel("s0");
    tl.to(st, { rv: 10000, rf: 2040, duration: 1.2, ease: "power2.inOut", onUpdate: render }, "s0");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to(st, { op: 1, duration: 0.3, onUpdate: render }, "s1");
    tl.to(st, { rv: 9632, rf: 2408, duration: 1.0, ease: "power2.inOut", onUpdate: render }, "s1+=0.3");
    cap(2, "s1");
    tl.addLabel("s2");
    tl.to(st, { op: 0, duration: 0.2, onUpdate: render }, "s2");
    tl.to(st, { rv: 8000, rf: 2000, duration: 0.5, ease: "power1.inOut", onUpdate: render }, "s2");
    tl.to(st, { rv: 5600, rf: 2020, duration: 1.0, ease: "power2.in", onUpdate: render }, "s2+=0.6");
    tl.to(st, { op: 2, duration: 0.3, onUpdate: render }, "s2+=1.7");
    tl.to(st, { rv: 6096, rf: 1524, duration: 0.9, ease: "power2.inOut", onUpdate: render }, "s2+=1.9");
    cap(3, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  // Core and satellites, with where each piece can be bought.
  A["nucleo"] = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const W = 755,
      H = 580;
    const svg = F.stage(slide, "#nu-stage", W, H);
    const cx = 320,
      cy = 290;
    const orbit = F.el("circle", { cx, cy, r: 232, fill: "none", stroke: C.lineStrong, "stroke-width": 1.5, "stroke-dasharray": "6 6" }, svg);
    const core = F.el("g", {}, svg);
    F.el("circle", { cx, cy, r: 150, fill: C.accent }, core);
    F.text(core, cx, cy - 46, "NÚCLEO", { size: 18, anchor: "middle", fill: "#d6e4f5", font: Deck.MONO, spacing: 4 });
    F.text(core, cx, cy + 6, "90–100 %", { size: 46, anchor: "middle", fill: "#fffaf5", font: Deck.DISPLAY, weight: 900 });
    F.text(core, cx, cy + 40, "fondos indexados", { size: 19, anchor: "middle", fill: "#fffaf5" });
    F.text(core, cx, cy + 64, "y ETFs globales", { size: 19, anchor: "middle", fill: "#fffaf5" });
    const sats = [
      ["Acciones", -135, "#5f86b8"],
      ["Oro y materias", -45, C.gold],
      ["Cripto", 45, C.warm],
      ["Private equity", 135, C.accent2],
    ].map(([name, ang, col]) => {
      const a = (ang * Math.PI) / 180;
      const x = cx + Math.cos(a) * 232,
        y = cy + Math.sin(a) * 232;
      const g = F.el("g", {}, svg);
      F.el("circle", { cx: x, cy: y, r: 56, fill: "#fffaf5", stroke: col, "stroke-width": 4 }, g);
      const parts = name.split(" ");
      if (parts.length > 1 && name.length > 9) {
        F.text(g, x, y - 2, parts[0], { size: 17, anchor: "middle", fill: C.heading, weight: 700 });
        F.text(g, x, y + 20, parts.slice(1).join(" "), { size: 17, anchor: "middle", fill: C.heading, weight: 700 });
      } else F.text(g, x, y + 6, name, { size: 18, anchor: "middle", fill: C.heading, weight: 700 });
      return { g, x, y };
    });
    const satPct = F.text(svg, cx, H - 4, "satélites: 0–10 % en total", { size: 18, anchor: "middle", fill: C.warm, font: Deck.MONO, weight: 600 });
    const badge = (x, y, text, col) => {
      const g = F.el("g", { opacity: 0 }, svg);
      const w = text.length * 9.4 + 22;
      F.rect(g, x - w / 2, y - 16, w, 30, { fill: col, rx: 15 });
      F.text(g, x, y + 5, text, { size: 15, anchor: "middle", fill: "#fffaf5", font: Deck.MONO, weight: 600 });
      return g;
    };
    const coreBadges = [badge(cx, cy + 105, "MyInvestor", C.heading), badge(cx, cy + 140, "Trade Republic", C.heading)];
    const satBadges = sats.map((s) => badge(s.x, s.y + (s.y < cy ? -76 : 76), "Trade Republic", C.heading));

    const cap = Deck.captions(tl, slide.querySelector("#nu-cap"), [
      '<span class="k">El núcleo</span>Casi todo tu dinero, en fondos indexados o ETFs globales y baratos.<small>Es la parte aburrida que hace el trabajo: diversificada, automática y para décadas.</small>',
      '<span class="k">Los satélites</span>Si te apetece, un trozo pequeño para ideas concretas: acciones, oro, cripto, private equity.<small>Para aprender o por convicción. Que no superen el 10 % del total, y si sale mal, que no te arruine.</small>',
      '<span class="k">¿Dónde se compra?</span>Fondos indexados y ETFs: en MyInvestor y en Trade Republic, entre otros. Acciones, ETC de materias primas, cripto y private equity (ELTIF): en Trade Republic.<small>Mención por producto, no recomendación. Compara comisiones y condiciones.</small>',
    ]);
    F.hide([orbit, satPct, ...sats.map((s) => s.g)]);
    tl.fromTo(core, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.6)" }, 0.2);
    cap(0, 0.3);
    tl.addLabel("s0");
    tl.to(orbit, { opacity: 1, duration: 0.4 }, "s0");
    sats.forEach((s, i) => tl.fromTo(s.g, { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, `s0+=${0.2 + i * 0.18}`));
    tl.to(satPct, { opacity: 1, duration: 0.4 }, "s0+=0.9");
    cap(1, "s0");
    tl.addLabel("s1");
    tl.to(coreBadges, { opacity: 1, duration: 0.4, stagger: 0.2 }, "s1");
    tl.to(satBadges, { opacity: 1, duration: 0.4, stagger: 0.12 }, "s1+=0.5");
    cap(2, "s1");
    tl.addLabel("s2");
    return { tl };
  };

  A["satelites"] = Deck.simple([".card", ".callout"], { stagger: 0.15 });
})();
