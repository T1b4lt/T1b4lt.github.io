/* Bloque 1–2 · gancho y mecánica de una burbuja.
   Portada, gancho, hoy, divisores, definición (stepped), cinco actos (stepped),
   apalancamiento (interactiva), Minsky y Perez. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C, label } = Deck;

  /* ---------- Portada: una línea que sube, se infla y revienta ---------- */
  anims.cover = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#cover-stage"), 760, 640);
    const tl = gsap.timeline({ paused: true });

    for (let i = 0; i <= 8; i++) svg("line", { x1: 0, x2: 760, y1: 40 + i * 70, y2: 40 + i * 70, stroke: C.line, "stroke-width": 1, opacity: 0.5 }, s);

    // Technology keeps growing (green), price inflates (amber) and pops (red).
    const tech = svg("path", { d: "M20 590 C 260 560, 480 470, 740 330", stroke: C.accent2, "stroke-width": 3, fill: "none", opacity: 0.85 }, s);
    const rng = Deck.rng(7);
    const rise = [];
    for (let i = 0; i <= 60; i++) rise.push([20 + i * 9, 585 - 12 * Math.exp((i / 60) * 3.6) + (rng() - 0.5) * 14]);
    const peak = rise[rise.length - 1];
    const crash = [peak];
    for (let i = 1; i <= 18; i++) {
      const u = i / 18;
      crash.push([peak[0] + u * 180, peak[1] + (490 - peak[1]) * Math.pow(u, 0.55) + (rng() - 0.5) * 16]);
    }
    const up = svg("path", { d: Deck.pathD(rise), stroke: C.accent, "stroke-width": 4, fill: "none", "stroke-linejoin": "round" }, s);
    const down = svg("path", { d: Deck.pathD(crash), stroke: C.warm, "stroke-width": 4, fill: "none", "stroke-linejoin": "round" }, s);
    const bubble = svg("circle", { cx: peak[0], cy: peak[1], r: 70, fill: "rgba(240,179,74,0.10)", stroke: C.accent, "stroke-width": 2, filter: "url(#glow)" }, s);
    const shine = svg("path", { d: `M${peak[0] - 40} ${peak[1] - 28} q 14 -22 40 -26`, stroke: "rgba(255,240,210,0.6)", "stroke-width": 4, fill: "none", "stroke-linecap": "round" }, s);
    const shards = [];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      shards.push(svg("line", { x1: peak[0] + Math.cos(a) * 60, y1: peak[1] + Math.sin(a) * 60, x2: peak[0] + Math.cos(a) * 84, y2: peak[1] + Math.sin(a) * 84, stroke: C.accent, "stroke-width": 3, "stroke-linecap": "round", opacity: 0 }, s));
    }
    const lTech = label(s, 740, 312, "tecnología", { fill: C.accent2, font: Deck.MONO, size: 17, anchor: "end" });
    const lPrice = label(s, peak[0] - 90, peak[1] - 8, "precio", { fill: C.accent, font: Deck.MONO, size: 17, anchor: "end" });

    tl.from(slide.querySelector(".kicker"), { opacity: 0, x: -30, duration: 0.6 }, 0)
      .from(slide.querySelector("h1"), { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, 0.15)
      .from(slide.querySelector(".sub"), { opacity: 0, y: 20, duration: 0.7 }, 0.55)
      .from(slide.querySelectorAll(".tags .tag"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 }, 0.85)
      .from(slide.querySelector(".replay-hint"), { opacity: 0, duration: 0.6 }, 1.6);
    Deck.draw(tl, tech, 0.4, 3.2);
    Deck.draw(tl, up, 0.5, 2.2);
    tl.from(lTech, { opacity: 0, duration: 0.5 }, 2.6);
    tl.from(lPrice, { opacity: 0, duration: 0.5 }, 1.8);
    tl.from([bubble, shine], { scale: 0, transformOrigin: `${peak[0]}px ${peak[1]}px`, duration: 1.2, ease: "power1.in" }, 1.6);
    tl.to([bubble, shine], { scale: 1.25, opacity: 0, duration: 0.18, transformOrigin: `${peak[0]}px ${peak[1]}px` }, 2.9);
    tl.to(shards, { opacity: 1, duration: 0.05 }, 2.9);
    shards.forEach((l, k) => {
      const a = (k / 10) * Math.PI * 2;
      tl.to(l, { x: Math.cos(a) * 40, y: Math.sin(a) * 40, opacity: 0, duration: 0.6, ease: "power2.out" }, 2.95);
    });
    tl.to(lPrice, { attr: { fill: C.warm }, duration: 0.2 }, 2.9);
    Deck.draw(tl, down, 3.0, 0.7);
    return { tl };
  };

  anims.hook = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".hook-card"), { opacity: 0, y: 30, stagger: 0.3, duration: 0.6, ease: "power3.out" }, 0.1);
    Deck.counters(tl, slide, 0.3, { stagger: 0.3, duration: 1.4 });
    tl.from(slide.querySelectorAll(".survived"), { opacity: 0, x: -12, stagger: 0.3, duration: 0.5 }, 1.8);
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 16, duration: 0.6 }, 2.8);
    return { tl };
  };

  anims.today = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".stat"), { opacity: 0, y: 30, stagger: 0.25, duration: 0.6, ease: "power3.out" }, 0.1);
    Deck.counters(tl, slide, 0.25, { stagger: 0.25, duration: 1.4 });
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 16, duration: 0.6 }, 2.2);
    return { tl };
  };

  anims.divider = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".num"), { opacity: 0, x: -30, duration: 0.5 }, 0)
      .from(slide.querySelector("h2"), { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, 0.15)
      .from(slide.querySelector("p"), { opacity: 0, y: 16, duration: 0.6 }, 0.5);
    return { tl };
  };

  /* ---------- 4 · Definición (stepped): valor vs precio ---------- */
  anims.balloon = function (slide) {
    const W = 1424, H = 440;
    const s = Deck.stageSvg(slide.querySelector("#bl-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#bl-caption"), [
      "<strong class='c-accent-2'>Valor fundamental</strong>: lo que justifican los beneficios que razonablemente generará el activo. Crece, pero despacio.",
      "<strong class='c-accent'>Expectativas</strong>: el precio se despega porque cada comprador espera vender más caro a otro. El hueco amarillo no lo pagan beneficios: lo paga el siguiente comprador.",
      "<strong class='c-warm'>Estallido</strong>: cuando faltan compradores nuevos, el precio cae de golpe y suele pasarse por debajo del valor. La tecnología, mientras, sigue su camino.",
    ]);

    const x0 = 80, x1 = 1380;
    const f = (x) => 360 - ((x - x0) / (x1 - x0)) * 110;
    svg("line", { x1: x0, x2: x1, y1: 400, y2: 400, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    svg("line", { x1: x0, x2: x0, y1: 20, y2: 400, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    label(s, x1, 428, "tiempo →", { anchor: "end", font: Deck.MONO, size: 16, fill: C.muted });
    label(s, x0 + 10, 30, "precio", { font: Deck.MONO, size: 16, fill: C.muted });

    const fund = [];
    for (let x = x0; x <= x1; x += 20) fund.push([x, f(x)]);
    const fundP = svg("path", { d: Deck.pathD(fund), stroke: C.accent2, "stroke-width": 4, fill: "none" }, s);
    const fundL = label(s, 360, f(360) + 34, "valor fundamental (beneficios)", { fill: C.accent2, font: Deck.MONO, size: 18 });

    const A = (f(900) - 40) / (Math.exp(3) - 1);
    const rise = [];
    for (let x = x0; x <= 900; x += 10) rise.push([x, x < 300 ? f(x) - 4 : f(x) - A * (Math.exp((3 * (x - 300)) / 600) - 1)]);
    const crash = [[900, 40]];
    for (let x = 910; x <= 1040; x += 10) {
      const u = (x - 900) / 140;
      crash.push([x, 40 + (f(1040) + 52 - 40) * Math.pow(u, 0.5)]);
    }
    for (let x = 1050; x <= x1; x += 10) {
      const v = (x - 1040) / (x1 - 1040);
      crash.push([x, f(x) + 52 * Math.pow(1 - v, 2)]);
    }
    const gap = rise.filter((p) => p[0] >= 300);
    const area = svg("path", { d: Deck.pathD(gap) + " " + gap.slice().reverse().map((p) => `L${p[0]} ${f(p[0])}`).join(" ") + " Z", fill: "rgba(240,179,74,0.16)", stroke: "none" }, s);
    const riseP = svg("path", { d: Deck.pathD(rise), stroke: C.accent, "stroke-width": 4, fill: "none" }, s);
    const crashP = svg("path", { d: Deck.pathD(crash), stroke: C.warm, "stroke-width": 4, fill: "none" }, s);
    const gapL = label(s, 820, 228, "expectativas", { fill: C.accent, font: Deck.DISPLAY, size: 28, italic: true, anchor: "middle" });
    const gapL2 = label(s, 820, 254, "«mañana alguien pagará más»", { fill: C.text2, size: 16, anchor: "middle" });
    const popL = label(s, 1000, 46, "¡pum!", { fill: C.warm, font: Deck.DISPLAY, size: 34, weight: 700 });
    const overL = label(s, 1090, f(1060) + 76, "se pasa por debajo", { fill: C.warm, font: Deck.MONO, size: 16 });
    gsap.set([area, riseP, crashP, gapL, gapL2, popL, overL], { opacity: 0 });

    // s0
    Deck.draw(tl, fundP, 0.1, 1.4);
    tl.from(fundL, { opacity: 0, duration: 0.5 }, 0.9);
    show(0, 0.2);
    tl.addLabel("s0");
    // s1
    show(1, "s0");
    tl.set(riseP, { opacity: 1 }, "s0");
    Deck.draw(tl, riseP, tl.labels.s0, 1.6);
    tl.to(area, { opacity: 1, duration: 0.8 }, "s0+=1.0");
    tl.to([gapL, gapL2], { opacity: 1, duration: 0.6, stagger: 0.2 }, "s0+=1.3");
    tl.addLabel("s1");
    // s2
    show(2, "s1");
    tl.to(popL, { opacity: 1, duration: 0.15 }, "s1");
    tl.from(popL, { scale: 0.4, transformOrigin: "1000px 40px", duration: 0.3, ease: "back.out(3)" }, "s1");
    tl.set(crashP, { opacity: 1 }, "s1+=0.1");
    Deck.draw(tl, crashP, tl.labels.s1 + 0.1, 1.2);
    tl.to(area, { opacity: 0.35, duration: 0.6 }, "s1+=0.2");
    tl.to(overL, { opacity: 1, duration: 0.5 }, "s1+=0.9");
    tl.addLabel("s2");
    return { tl };
  };

  /* ---------- 5 · Cinco actos (stepped) ---------- */
  anims.stages = function (slide) {
    const W = 1424, H = 430;
    const s = Deck.stageSvg(slide.querySelector("#st-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#st-caption"), [
      "La forma típica del precio en una manía. Vamos acto por acto.",
      "<strong>1 · Desplazamiento.</strong> Una innovación cambia lo que parece posible: ferrocarril (1830), radio (1920), web (1995), ChatGPT (nov-2022).",
      "<strong>2 · Boom.</strong> Llegan crédito y primeros beneficios; la historia se contagia. «Nada perturba tanto el juicio como ver a un amigo hacerse rico» (Kindleberger).",
      "<strong>3 · Euforia.</strong> Se compra porque sube. «Todo el mundo es más crédulo cuando es más feliz» (Bagehot, 1873).",
      "<strong>4 · Toma de beneficios.</strong> Los mejor informados venden. El precio se estanca, aparecen dudas… y algún fraude contable.",
      "<strong class='c-warm'>5 · Pánico.</strong> Todos quieren salir a la vez y los prestamistas cierran el grifo. El precio cae por debajo de su valor.",
    ]);
    const keys = [[60, 380], [250, 362], [420, 322], [600, 240], [780, 118], [880, 66], [960, 92], [1010, 120], [1150, 335], [1290, 388], [1380, 378]];
    const dense = Deck.smooth(keys, 20);
    const mainPts = dense.filter((p) => p[0] <= 1010);
    const panicPts = dense.filter((p) => p[0] >= 1005);
    svg("line", { x1: 40, x2: 1400, y1: 405, y2: 405, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    const ghost = svg("path", { d: Deck.pathD(dense), stroke: C.line, "stroke-width": 2, fill: "none", "stroke-dasharray": "4 8" }, s);
    const main = svg("path", { d: Deck.pathD(mainPts), stroke: C.accent, "stroke-width": 5, fill: "none", "stroke-linejoin": "round" }, s);
    const panic = svg("path", { d: Deck.pathD(panicPts), stroke: C.warm, "stroke-width": 5, fill: "none" }, s);
    const L = main.getTotalLength();
    const lenAt = (x) => {
      let len = 0;
      for (let i = 1; i < mainPts.length && mainPts[i][0] <= x; i++) len += Math.hypot(mainPts[i][0] - mainPts[i - 1][0], mainPts[i][1] - mainPts[i - 1][1]);
      return len;
    };
    gsap.set(main, { strokeDasharray: L, strokeDashoffset: L });
    const PL = panic.getTotalLength();
    gsap.set(panic, { strokeDasharray: PL, strokeDashoffset: PL });

    const stages = [
      { x: 230, name: "Desplazamiento", end: 420, dx: 0, dy: -40, a: "middle" },
      { x: 560, name: "Boom", end: 700, dx: 22, dy: 30, a: "start" },
      { x: 800, name: "Euforia", end: 890, dx: -24, dy: 0, a: "end" },
      { x: 965, name: "Toma de beneficios", end: 1010, dx: 24, dy: -40, a: "start" },
      { x: 1130, name: "Pánico", end: null, dx: 26, dy: 0, a: "start" },
    ];
    const yAt = (x) => {
      let best = dense[0];
      for (const p of dense) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
      return best[1];
    };
    const marks = stages.map((st, i) => {
      const g = svg("g", { opacity: 0 }, s);
      const y = yAt(st.x);
      const col = i === 4 ? C.warm : C.accent;
      svg("circle", { cx: st.x, cy: y, r: 9, fill: C.bg, stroke: col, "stroke-width": 3 }, g);
      const lx = st.x + st.dx, ly = y + st.dy;
      label(g, lx, ly - 4, `${i + 1}`, { fill: col, font: Deck.DISPLAY, size: 30, weight: 700, anchor: st.a });
      label(g, lx, ly + 22, st.name, { fill: C.text, font: Deck.MONO, size: 17, anchor: st.a });
      return g;
    });

    tl.from(ghost, { opacity: 0, duration: 0.8 }, 0.1);
    show(0, 0.1);
    tl.addLabel("s0");
    stages.forEach((st, i) => {
      const lab = `s${i}`;
      show(i + 1, lab);
      if (st.end) tl.to(main, { strokeDashoffset: L - lenAt(st.end), duration: 0.9, ease: "power1.inOut" }, lab);
      else tl.to(panic, { strokeDashoffset: 0, duration: 0.9, ease: "power2.in" }, lab);
      tl.to(marks[i], { opacity: 1, duration: 0.4 }, `${lab}+=0.5`);
      tl.addLabel(`s${i + 1}`);
    });
    return { tl };
  };

  /* ---------- 6 · Apalancamiento (interactiva) ---------- */
  anims.leverage = function (slide, { signal }) {
    const W = 680, H = 400;
    const s = Deck.stageSvg(slide.querySelector("#lev-stage"), W, H);
    const inD = slide.querySelector("#lev-d"), inP = slide.querySelector("#lev-p");
    const outD = slide.querySelector("#lev-d-out"), outP = slide.querySelector("#lev-p-out");
    const res = slide.querySelector("#lev-res"), msg = slide.querySelector("#lev-msg");
    const st = { d: 0, p: 0.2 };
    const base = 360, full = 300, bw = 170;
    svg("line", { x1: 40, x2: 640, y1: base, y2: base, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    const mk = (x) => ({
      debt: svg("rect", { x, width: bw, rx: 4, fill: C.markB }, s),
      eq: svg("rect", { x, width: bw, rx: 4, fill: C.accent2 }, s),
      lost: svg("rect", { x, width: bw, rx: 4, fill: "rgba(239,91,79,0.12)", stroke: C.warm, "stroke-width": 2, "stroke-dasharray": "6 5" }, s),
      hole: svg("rect", { x, width: bw, rx: 4, fill: C.warm, opacity: 0.85 }, s),
    });
    const A = mk(110), B = mk(400);
    label(s, 195, 390, "antes", { anchor: "middle", font: Deck.MONO, size: 17, fill: C.text2 });
    label(s, 485, 390, "después de la caída", { anchor: "middle", font: Deck.MONO, size: 17, fill: C.text2 });
    const lEqA = label(s, 195, 0, "tu capital", { anchor: "middle", size: 18, fill: C.bg, weight: 600 });
    const lDebtA = label(s, 195, 0, "deuda", { anchor: "middle", size: 18, fill: "#fff", weight: 600 });
    const lLost = label(s, 485, 0, "pérdida", { anchor: "middle", size: 18, fill: C.warm, weight: 600 });
    const lHole = label(s, 485, 0, "deuda sin cubrir", { anchor: "middle", size: 16, fill: "#fff", weight: 600 });
    const setR = (r, y, h) => { r.setAttribute("y", y); r.setAttribute("height", Math.max(0, h)); };

    function render() {
      const d = st.d, p = st.p;
      const debtH = d * full, eqH = (1 - d) * full;
      setR(A.debt, base - debtH, debtH);
      setR(A.eq, base - full, eqH);
      [A.lost, A.hole].forEach((r) => setR(r, base, 0));
      const asset = (1 - p) * full;
      const eqAfter = Math.max(0, asset - debtH);
      const covered = Math.min(asset, debtH);
      setR(B.debt, base - covered, covered);
      setR(B.eq, base - covered - eqAfter, eqAfter);
      setR(B.lost, base - full, full - asset);
      const holeH = Math.max(0, debtH - asset);
      setR(B.hole, base - debtH, holeH);
      lEqA.setAttribute("y", base - full + eqH / 2 + 6);
      lEqA.setAttribute("opacity", eqH > 30 ? 1 : 0);
      lDebtA.setAttribute("y", base - debtH / 2 + 6);
      lDebtA.setAttribute("opacity", debtH > 30 ? 1 : 0);
      lLost.setAttribute("y", base - full - 12);
      lLost.setAttribute("opacity", p > 0.005 ? 1 : 0);
      lHole.setAttribute("y", base - debtH + holeH / 2 + 6);
      lHole.setAttribute("opacity", holeH > 26 ? 1 : 0);
      const loss = d >= 1 ? 1 : Math.min(1, p / (1 - d));
      res.textContent = loss >= 1 ? "−100 %" : `−${Deck.fmt(loss * 100, 0)} %`;
      res.style.color = loss >= 1 ? C.warm : loss > p + 0.01 ? C.accent : C.text;
      msg.innerHTML = loss >= 1 ? "<strong class='c-warm'>Liquidado.</strong> Pierdes todo; el prestamista se queda con lo que queda." : d < 0.01 ? "Pierdes lo mismo que el activo." : `La deuda multiplica tu pérdida <strong>×${Deck.fmt(1 / (1 - d), 1)}</strong>.`;
      outD.textContent = `${Math.round(d * 100)} %`;
      outP.textContent = `${Math.round(p * 100)} %`;
      inD.value = Math.round(d * 100);
      inP.value = Math.round(p * 100);
    }
    inD.addEventListener("input", () => ((st.d = inD.value / 100), render()), { signal });
    inP.addEventListener("input", () => ((st.p = inP.value / 100), render()), { signal });
    slide.querySelectorAll("[data-d]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { d: b.dataset.d / 100, duration: 0.8, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    render();
    const tl = gsap.timeline({ paused: true });
    tl.to(st, { d: 0.5, duration: 1.2, ease: "power2.inOut", onUpdate: render }, 0.8);
    tl.to(st, { d: 0.9, duration: 1.2, ease: "power2.inOut", onUpdate: render }, 2.6);
    return { tl };
  };

  /* ---------- 7 · Minsky ---------- */
  anims.minsky = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".lede"), { opacity: 0, y: 14, duration: 0.5 }, 0);
    tl.from(slide.querySelectorAll(".mk-card"), { opacity: 0, y: 30, stagger: 0.35, duration: 0.6, ease: "power3.out" }, 0.3);
    tl.from(slide.querySelector(".mk-fill"), { scaleX: 0, duration: 2, ease: "power1.inOut" }, 0.6);
    tl.from(slide.querySelectorAll(".mk-l, .mk-r"), { opacity: 0, duration: 0.5 }, 1.2);
    return { tl };
  };

  /* ---------- 8 · Perez: instalación → punto de inflexión → despliegue ---------- */
  anims.perez = function (slide) {
    const W = 1424, H = 470;
    const s = Deck.stageSvg(slide.querySelector("#pz-stage"), W, H);
    const tl = gsap.timeline({ paused: true });
    const x0 = 60, x1 = 1380, xm = 700;
    const logistic = (x) => 1 / (1 + Math.exp(-(x - xm) / 140));
    const bump = (x) => 70 * Math.exp(-Math.pow((x - 600) / 70, 2)) - 40 * Math.exp(-Math.pow((x - 720) / 50, 2));
    const pts = [];
    for (let x = x0; x <= x1; x += 6) pts.push([x, 300 - logistic(x) * 220 - bump(x)]);

    const bandA = svg("rect", { x: x0, y: 10, width: xm - x0 - 20, height: 300, fill: "rgba(240,179,74,0.05)", rx: 10 }, s);
    const bandB = svg("rect", { x: xm + 20, y: 10, width: x1 - xm - 20, height: 300, fill: "rgba(95,195,154,0.05)", rx: 10 }, s);
    const tA = label(s, x0 + 20, 40, "INSTALACIÓN · manda el capital financiero", { fill: C.accent, font: Deck.MONO, size: 17 });
    const tB = label(s, x1 - 20, 40, "DESPLIEGUE · manda el capital productivo", { fill: C.accent2, font: Deck.MONO, size: 17, anchor: "end" });
    const curve = svg("path", { d: Deck.pathD(pts), stroke: C.text, "stroke-width": 4, fill: "none" }, s);
    const phases = [
      [200, "irrupción", 0], [520, "frenesí", -60], [960, "sinergia", 0], [1250, "madurez", 0],
    ].map(([x, t, dx]) => {
      const p = pts.reduce((a, b) => (Math.abs(b[0] - x) < Math.abs(a[0] - x) ? b : a));
      const g = svg("g", { opacity: 0 }, s);
      svg("circle", { cx: x, cy: p[1], r: 6, fill: C.text }, g);
      label(g, x + dx, p[1] + 34, t, { anchor: "middle", font: Deck.DISPLAY, size: 24, italic: true, fill: C.text });
      return g;
    });
    const tp = svg("g", { opacity: 0 }, s);
    svg("line", { x1: xm, x2: xm, y1: 20, y2: 310, stroke: C.warm, "stroke-width": 2, "stroke-dasharray": "6 6" }, tp);
    label(tp, xm, 330, "PUNTO DE INFLEXIÓN", { anchor: "middle", font: Deck.MONO, size: 16, fill: C.warm });
    label(tp, xm, 352, "crash + recesión", { anchor: "middle", size: 17, fill: C.warm });
    const bubbleL = label(s, 640, 118, "burbuja", { anchor: "middle", font: Deck.MONO, size: 16, fill: C.accent, opacity: 0 });

    // Past surges: big bang → bubble collapse
    const rows = [
      ["1771", "Revolución Industrial", "manía de canales → 1797"],
      ["1829", "Vapor y ferrocarril", "Railway Mania → 1848"],
      ["1875", "Acero y electricidad", "→ 1890–95"],
      ["1908", "Petróleo y automóvil", "años 20 → 1929"],
      ["1971", "Informática y telecom.", "dot-com → 2000–03"],
    ];
    const rowG = rows.map((r, i) => {
      const x = x0 + i * 268;
      const g = svg("g", { opacity: 0 }, s);
      label(g, x, 400, r[0], { font: Deck.DISPLAY, size: 30, weight: 700, fill: C.accent });
      label(g, x + 82, 392, r[1], { size: 17, fill: C.text });
      label(g, x + 82, 414, r[2], { size: 15, fill: C.muted, font: Deck.MONO });
      return g;
    });
    const q = label(s, W / 2, 458, "¿Es la IA una sexta oleada… o el despliegue tardío de la de 1971? Debate abierto.", { anchor: "middle", size: 19, fill: C.text2, italic: true, opacity: 0 });

    tl.from([bandA, bandB], { opacity: 0, duration: 0.6 }, 0);
    tl.from([tA, tB], { opacity: 0, duration: 0.5, stagger: 0.3 }, 0.2);
    Deck.draw(tl, curve, 0.4, 2.6);
    phases.forEach((g, i) => tl.to(g, { opacity: 1, duration: 0.4 }, 0.8 + i * 0.6 + (i > 1 ? 0.5 : 0)));
    tl.to(bubbleL, { opacity: 1, duration: 0.4 }, 1.6);
    tl.to(tp, { opacity: 1, duration: 0.5 }, 2.0);
    tl.to(rowG, { opacity: 1, duration: 0.4, stagger: 0.18 }, 3.2);
    tl.to(q, { opacity: 1, duration: 0.6 }, 4.4);
    return { tl };
  };
})();
