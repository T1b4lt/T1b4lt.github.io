/* Animations · blocks "El mundo JEPA" and "Qué aporta el paper" (slides 10–17). */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  /** Small embedding vector: a row of cells with deterministic opacities. */
  function emb(parent, x, y, seed, color, n) {
    const g = svg("g", {}, parent);
    const r = Deck.rng(seed);
    for (let i = 0; i < (n || 5); i++) {
      svg("rect", { x: x + i * 20, y: y - 9, width: 16, height: 18, rx: 3, fill: color || C.accent, opacity: (0.25 + 0.75 * r()).toFixed(2) }, g);
    }
    return g;
  }

  function box(parent, x, y, w, h, label, dark) {
    const g = svg("g", {}, parent);
    svg("rect", { x, y, width: w, height: h, rx: 8, fill: dark ? "#18181b" : "#fff", stroke: dark ? "#18181b" : C.text, "stroke-width": 1.5 }, g);
    Deck.text(g, x + w / 2, y + h / 2 + 7, label, { size: 19, anchor: "middle", color: dark ? "#fff" : C.text, weight: 500 });
    return g;
  }

  /* ---------- 10 · Two ways to learn ---------- */
  anims.twoways = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#tw-stage"), 1424, 530);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#tw-cap"), [
      "Dos maneras de aprender <strong>sin etiquetas humanas</strong>, solo a partir de los datos.",
      "<strong>Generativo (LLMs)</strong>: predice el siguiente token exacto. Para acertar tiene que modelar también el estilo, la palabra concreta… todo.",
      "<strong>JEPA</strong>: dos vistas pasan por un encoder y se predice la <em>representación</em> de una a partir de la otra. Lo impredecible se puede ignorar.",
      "Para que no haga trampa (mandarlo todo al mismo punto) se añade un término <strong>anti-colapso</strong>. Esos dos ingredientes son los que analiza el paper.",
    ]);
    const L1 = Deck.text(s, 0, 30, "1 · GENERATIVO · next-token prediction", { size: 16, font: Deck.MONO, color: C.muted, weight: 500 });
    const L2 = Deck.text(s, 0, 285, "2 · JEPA · predice representaciones", { size: 16, font: Deck.MONO, color: C.accent, weight: 500 });
    const sep = svg("line", { x1: 0, y1: 250, x2: 1424, y2: 250, stroke: C.line, "stroke-width": 1.5 }, s);
    tl.from([L1, L2, sep], { opacity: 0, duration: 0.5, stagger: 0.15 }, 0.1);
    show(0, 0.1);
    tl.addLabel("s0", 0.8);

    // Lane 1
    const g1 = svg("g", { opacity: 0 }, s);
    Deck.chip(g1, 20, 100, "«Un perro corre por la …»", { size: 19, font: Deck.BODY, charW: 0.5, h: 44 });
    const p1 = Deck.arrow(g1, 300, 122, 410, 122, { color: C.faint });
    box(g1, 420, 97, 170, 50, "LLM", true);
    Deck.arrow(g1, 600, 122, 700, 122, { color: C.faint });
    const bars = [["playa", 0.62], ["arena", 0.18], ["orilla", 0.09]];
    const fills = [];
    bars.forEach(([w, v], i) => {
      const y = 82 + i * 34;
      Deck.text(g1, 790, y + 20, w, { size: 19, anchor: "end", font: Deck.MONO, color: C.text });
      svg("rect", { x: 805, y: y + 4, width: 300, height: 18, rx: 4, fill: C.panel }, g1);
      fills.push([svg("rect", { x: 805, y: y + 4, width: 0, height: 18, rx: 4, fill: i === 0 ? C.text : C.faint }, g1), v]);
      Deck.text(g1, 1120, y + 20, v.toFixed(2), { size: 17, font: Deck.MONO, color: C.muted });
    });
    Deck.text(g1, 1180, 112, "acertar la", { size: 19, color: C.text2 });
    Deck.text(g1, 1180, 138, "palabra exacta", { size: 19, color: C.text2, weight: 600 });
    tl.to(g1, { opacity: 1, duration: 0.5 }, "s0");
    Deck.pulse(tl, s, p1.path, 0.8 + 0.3, { color: C.text, duration: 0.5 });
    fills.forEach(([f, v], i) => tl.to(f, { attr: { width: 300 * v }, duration: 0.6 }, `s0+=${0.6 + i * 0.1}`));
    show(1, "s0");
    tl.addLabel("s1", "s0+=1.4");

    // Lane 2
    const g2 = svg("g", { opacity: 0 }, s);
    Deck.chip(g2, 20, 318, "vista A: «Un perro corre por la playa»", { size: 18, font: Deck.BODY, charW: 0.5, h: 42 });
    Deck.chip(g2, 20, 438, "vista B: «Un cachorro juega junto al mar»", { size: 18, font: Deck.BODY, charW: 0.5, h: 42 });
    Deck.arrow(g2, 365, 339, 430, 339, { color: C.faint });
    Deck.arrow(g2, 385, 459, 430, 459, { color: C.faint });
    box(g2, 440, 314, 150, 50, "encoder", false);
    box(g2, 440, 434, 150, 50, "encoder", false);
    Deck.arrow(g2, 600, 339, 640, 339, { color: C.faint });
    emb(g2, 650, 339, 3, C.accent);
    Deck.arrow(g2, 755, 339, 800, 339, { color: C.faint });
    box(g2, 810, 314, 150, 50, "predictor", false);
    Deck.arrow(g2, 970, 339, 1010, 339, { color: C.faint });
    emb(g2, 1020, 339, 9, C.accent);
    Deck.text(g2, 1070, 312, "predicción", { size: 15, anchor: "middle", font: Deck.MONO, color: C.muted });
    Deck.arrow(g2, 600, 459, 1010, 459, { color: C.faint });
    emb(g2, 1020, 459, 10, C.accent);
    Deck.text(g2, 1070, 500, "representación real de B", { size: 15, anchor: "middle", font: Deck.MONO, color: C.muted });
    Deck.text(g2, 1070, 408, "≈", { size: 40, anchor: "middle", color: C.accent, weight: 600 });
    tl.to(g2, { opacity: 1, duration: 0.6 }, "s1");
    show(2, "s1");
    tl.addLabel("s2", "s1+=0.9");

    const ac = svg("g", { opacity: 0 }, s);
    svg("rect", { x: 1150, y: 380, width: 250, height: 46, rx: 23, fill: "#18181b" }, ac);
    Deck.text(ac, 1275, 410, "+ anti-colapso", { size: 19, anchor: "middle", color: "#fff", weight: 500 });
    const hl = svg("rect", { x: 1005, y: 318, width: 130, height: 162, rx: 10, fill: "none", stroke: C.accent, "stroke-width": 2, "stroke-dasharray": "6 5", opacity: 0 }, s);
    tl.to([hl, ac], { opacity: 1, duration: 0.5, stagger: 0.25 }, "s2");
    show(3, "s2");
    tl.addLabel("s3", "s2+=0.9");
    return { tl };
  };

  /* ---------- 11 · LeCun ---------- */
  anims.lecun = Deck.simple([".lc-tbl tr", ".lc-card"], { stagger: 0.12 });

  /* ---------- 12 · Good views vs bad views ---------- */
  anims.views = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#vw-stage"), 1424, 520);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#vw-cap"), [
      "Un JEPA aprende lo que tienen en común sus <strong>pares positivos</strong>: las dos «vistas» que le decimos que son lo mismo.",
      "<strong>Buenas vistas</strong>: dos observaciones distintas de la misma escena. Lo único que comparten es el mundo.",
      "<strong>Malas vistas</strong>: dos corrupciones de una sola observación. Comparten la escena… y también la redacción, el estilo y el encuadre (el <em>nuisance</em>).",
      "El modelo aprende lo compartido: con buenas vistas, <strong>el mundo</strong>; con malas, el mundo <strong>más los detalles de su modalidad</strong>.",
    ]);
    const panelL = svg("rect", { x: 0, y: 0, width: 690, height: 510, rx: 12, fill: "#fff", stroke: C.line, "stroke-width": 1.5 }, s);
    const panelR = svg("rect", { x: 734, y: 0, width: 690, height: 510, rx: 12, fill: "#fff", stroke: C.line, "stroke-width": 1.5 }, s);
    const hL = svg("g", {}, s);
    Deck.text(hL, 30, 44, "Buenas vistas", { size: 28, weight: 600, color: C.accent });
    Deck.text(hL, 30, 74, "dos observaciones de la misma escena", { size: 18, color: C.muted });
    const hR = svg("g", {}, s);
    Deck.text(hR, 764, 44, "Malas vistas", { size: 28, weight: 600, color: C.text });
    Deck.text(hR, 764, 74, "dos corrupciones de una sola observación", { size: 18, color: C.muted });
    tl.from([panelL, panelR, hL, hR], { opacity: 0, duration: 0.5, stagger: 0.1 }, 0.1);
    show(0, 0.1);
    tl.addLabel("s0", 0.8);

    // good
    const gl = svg("g", { opacity: 0 }, s);
    Deck.chip(gl, 30, 102, "«Un perro corre por la playa»", { size: 19, font: Deck.BODY, charW: 0.5, h: 42 });
    Deck.chip(gl, 30, 160, "«Un cachorro juega junto al mar»", { size: 19, font: Deck.BODY, charW: 0.5, h: 42 });
    svg("path", { d: "M410,110 L422,110 L422,194 L410,194", stroke: C.accent, fill: "none", "stroke-width": 2 }, gl);
    Deck.text(gl, 432, 158, "par positivo", { size: 16, font: Deck.MONO, color: C.accent });
    Deck.text(gl, 30, 248, "dos fotos de la escena", { size: 15, font: Deck.MONO, color: C.muted });
    Deck.scenePic(gl, 30, 262, 180, 120, 0);
    Deck.scenePic(gl, 230, 262, 180, 120, 1);
    svg("rect", { x: 30, y: 420, width: 630, height: 60, rx: 8, fill: C.accentSoft }, gl);
    Deck.text(gl, 50, 458, "Comparten: solo la escena", { size: 22, color: C.accent, weight: 600 });
    tl.to(gl, { opacity: 1, duration: 0.6 }, "s0");
    show(1, "s0");
    tl.addLabel("s1", "s0+=0.8");

    // bad
    const bl = svg("g", { opacity: 0 }, s);
    Deck.chip(bl, 764, 102, "«Un perro [M] por la playa»", { size: 19, font: Deck.BODY, charW: 0.5, h: 42 });
    Deck.chip(bl, 764, 160, "«Un perro corre [M] la playa»", { size: 19, font: Deck.BODY, charW: 0.5, h: 42 });
    svg("path", { d: "M1120,110 L1132,110 L1132,194 L1120,194", stroke: C.muted, fill: "none", "stroke-width": 2 }, bl);
    Deck.text(bl, 1142, 158, "par positivo", { size: 16, font: Deck.MONO, color: C.muted });
    Deck.text(bl, 764, 248, "dos recortes de una foto", { size: 15, font: Deck.MONO, color: C.muted });
    [[764, 0], [964, 1]].forEach(([x, k]) => {
      Deck.scenePic(bl, x, 262, 180, 120, 0);
      // grey out what the crop leaves out
      const cx = k === 0 ? x : x + 70;
      svg("rect", { x: k === 0 ? x + 110 : x, y: 262, width: 70, height: 120, fill: "rgba(255,255,255,0.78)" }, bl);
      svg("rect", { x: cx + 2, y: 264, width: 106, height: 116, rx: 4, fill: "none", stroke: C.text, "stroke-width": 2, "stroke-dasharray": "6 4" }, bl);
    });
    svg("rect", { x: 764, y: 420, width: 630, height: 60, rx: 8, fill: C.panel }, bl);
    Deck.text(bl, 784, 458, "Comparten: la escena + redacción, estilo, encuadre", { size: 22, color: C.text, weight: 600 });
    tl.to(bl, { opacity: 1, duration: 0.6 }, "s1");
    show(2, "s1");
    tl.addLabel("s2", "s1+=0.8");

    tl.to(panelL, { attr: { stroke: C.accent, "stroke-width": 2.5 }, duration: 0.4 }, "s2");
    tl.to(bl, { opacity: 0.55, duration: 0.4 }, "s2");
    show(3, "s2");
    tl.addLabel("s3", "s2+=0.7");
    return { tl };
  };

  /* ---------- 13 · The theorem ---------- */
  anims.theorem = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#th-stage"), 1424, 480);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#th-cap"), [
      "Dos JEPA, una por modalidad, entrenadas <strong>por separado</strong> con buenas vistas del mismo mundo.",
      "Cada una aprende su mapa. Parecen distintos… pero son <strong>la misma forma, girada</strong>.",
      "Teorema 1: con buenas vistas, el óptimo es <strong>el mismo embedding salvo una rotación</strong>, para cualquier número de modalidades.",
      "Teorema 2: si los positivos difieren, queda una <strong>desalineación acotada</strong>. Cuanto más distintos sean, mayor el error.",
    ]);
    const world = svg("g", {}, s);
    svg("rect", { x: 612, y: 0, width: 200, height: 84, rx: 10, fill: C.panel, stroke: C.text, "stroke-width": 1.5 }, world);
    Deck.text(world, 628, 24, "MUNDO", { size: 13, color: C.muted, font: Deck.MONO });
    svg("polygon", { points: "690,30 674,74 706,74", fill: "#3f3f46" }, world);
    svg("circle", { cx: 735, cy: 60, r: 14, fill: C.accent }, world);
    const jl = svg("g", {}, s);
    Deck.arrow(jl, 612, 50, 420, 115, { color: C.faint });
    Deck.arrow(jl, 812, 50, 1004, 115, { color: C.faint });
    box(jl, 220, 120, 200, 50, "JEPA de imagen", true);
    box(jl, 1004, 120, 200, 50, "JEPA de texto", true);
    Deck.text(jl, 320, 196, "buenas vistas: 2 fotos", { size: 15, anchor: "middle", font: Deck.MONO, color: C.muted });
    Deck.text(jl, 1104, 196, "buenas vistas: 2 captions", { size: 15, anchor: "middle", font: Deck.MONO, color: C.muted });
    tl.from([world, jl], { opacity: 0, duration: 0.6, stagger: 0.2 }, 0.1);
    show(0, 0.1);
    tl.addLabel("s0", 0.9);

    const base = Deck.cloudBase(31, 12, 125);
    const edges = Deck.knnEdges(base, 2);
    const A = Deck.cloud(s, base, { color: C.text, r: 6, edges });
    const B = Deck.cloud(s, base, { color: C.accent, r: 6, edges, edgeColor: "rgba(37,99,235,0.35)", hollow: true });
    const sa = { cx: 320, cy: 340 };
    const sb = { cx: 1104, cy: 340, rot: 2.2 };
    const rA = () => A.update({ cx: sa.cx, cy: sa.cy, rot: 0 });
    const rB = () => B.update({ cx: sb.cx, cy: sb.cy, rot: sb.rot });
    rA();
    rB();
    gsap.set([A.g, B.g], { opacity: 0 });
    tl.to([A.g, B.g], { opacity: 1, duration: 0.6, stagger: 0.15 }, "s0");
    show(1, "s0");
    tl.addLabel("s1", "s0+=0.9");

    const ql = Deck.text(s, 500, 218, "Q · una rotación", { size: 20, anchor: "middle", color: C.accent, weight: 600 });
    const okl = Deck.text(s, 500, 465, "buenas vistas → encajan (Thm. 1)", { size: 18, anchor: "middle", color: C.accent, font: Deck.MONO });
    gsap.set([ql, okl], { opacity: 0 });
    tl.to(sa, { cx: 500, duration: 1.6, ease: "power2.inOut", onUpdate: rA }, "s1");
    tl.to(sb, { cx: 500, rot: 0, duration: 1.6, ease: "power2.inOut", onUpdate: rB }, "s1");
    tl.to([ql, okl], { opacity: 1, duration: 0.4 }, "s1+=1.2");
    show(2, "s1");
    tl.addLabel("s2", "s1+=1.8");

    // bad-view inset
    const jit = base.map((_, i) => [((i * 47) % 41) - 20, ((i * 31) % 37) - 18]);
    const bad = svg("g", { opacity: 0 }, s);
    const C1 = Deck.cloud(bad, base, { color: C.text, r: 6, edges: [] });
    const C2 = Deck.cloud(bad, base, { color: C.muted, r: 6, edges: [], jitter: jit, hollow: true });
    C1.update({ cx: 1104, cy: 340, rot: 0 });
    C2.update({ cx: 1104, cy: 340, rot: 0, j: 1 });
    base.forEach((_, i) => svg("line", { x1: C1.pos[i][0], y1: C1.pos[i][1], x2: C2.pos[i][0], y2: C2.pos[i][1], stroke: C.faint, "stroke-width": 1.5, "stroke-dasharray": "3 3" }, bad));
    Deck.text(bad, 1104, 465, "malas vistas → error residual (Thm. 2)", { size: 18, anchor: "middle", color: C.muted, font: Deck.MONO });
    tl.to(bad, { opacity: 1, duration: 0.6 }, "s2");
    show(3, "s2");
    tl.addLabel("s3", "s2+=0.8");
    return { tl };
  };

  /* ---------- 14 · Next-token prediction is a bad-view JEPA ---------- */
  anims.nexttoken = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#nt-stage"), 1424, 500);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#nt-cap"), [
      "Así aprende un LLM: lee un trozo de documento y predice cómo sigue.",
      "Visto como JEPA, sus dos «vistas» son <strong>un prefijo y su continuación</strong> dentro del mismo documento: comparten autor, estilo y redacción.",
      "La pérdida de next-token tiene literalmente la forma de una JEPA: un término de <strong>predicción</strong> y otro de <strong>anti-colapso</strong> (Prop. 4).",
      "Consecuencia (Thm. 3): gasta parte de su representación en detalles de su modalidad que <strong>ninguna rotación puede alinear</strong> con la visión.",
    ]);
    const doc = svg("g", {}, s);
    svg("rect", { x: 250, y: 10, width: 924, height: 84, rx: 10, fill: C.panel, stroke: C.lineStrong, "stroke-width": 1.5 }, doc);
    Deck.text(doc, 270, 32, "UN DOCUMENTO", { size: 13, font: Deck.MONO, color: C.muted });
    const t1 = Deck.text(doc, 640, 72, "Un perro corre por la", { size: 32, anchor: "end", color: C.text, weight: 500 });
    const t2 = Deck.text(doc, 660, 72, "playa", { size: 32, color: C.accent, weight: 600 });
    Deck.text(doc, 755, 72, "y juega con la pelota…", { size: 32, color: C.faint });
    tl.from(doc, { opacity: 0, y: -10, duration: 0.5 }, 0.1);
    tl.from(t2, { opacity: 0, duration: 0.4 }, 0.7);
    show(0, 0.1);
    tl.addLabel("s0", 1.2);

    const br = svg("g", { opacity: 0 }, s);
    svg("path", { d: "M330,104 L330,116 L640,116 L640,104", stroke: C.text, fill: "none", "stroke-width": 2 }, br);
    Deck.text(br, 485, 142, "vista A: el prefijo", { size: 18, anchor: "middle", font: Deck.MONO, color: C.text });
    svg("path", { d: "M660,104 L660,116 L742,116 L742,104", stroke: C.accent, fill: "none", "stroke-width": 2 }, br);
    Deck.text(br, 701, 142, "vista B", { size: 18, anchor: "middle", font: Deck.MONO, color: C.accent });
    Deck.text(br, 860, 142, "→ mismo autor, mismo estilo", { size: 18, font: Deck.MONO, color: C.muted });
    tl.to(br, { opacity: 1, duration: 0.5 }, "s0");
    show(1, "s0");
    tl.addLabel("s1", "s0+=0.7");

    const fm = svg("g", { opacity: 0 }, s);
    const f = svg("text", { x: 712, y: 220, "text-anchor": "middle", "font-size": 30, "font-family": Deck.MONO, fill: C.text }, fm);
    f.innerHTML = `<tspan fill="${C.muted}">−log softmax  =  </tspan><tspan fill="${C.accent}">−⟨h(c), w_y⟩</tspan><tspan>  +  </tspan><tspan>log Σ exp⟨h(c), w_v⟩</tspan>`;
    gsap.set(fm, { opacity: 0 });
    tl.to(fm, { opacity: 1, duration: 0.4 }, "s1");
    // underbraces positioned after the text is laid out
    const spans = f.querySelectorAll("tspan");
    const seg = (span, label, col) => {
      const b = span.getBBox();
      const xa = b.x + 4;
      const xb = b.x + b.width - 4;
      svg("path", { d: `M${xa},236 L${xa},246 L${xb},246 L${xb},236`, stroke: col, fill: "none", "stroke-width": 2 }, fm);
      Deck.text(fm, (xa + xb) / 2, 272, label, { size: 18, anchor: "middle", font: Deck.MONO, color: col, weight: 600 });
    };
    seg(spans[1], "predicción", C.accent);
    seg(spans[3], "anti-colapso", C.text);
    show(2, "s1");
    tl.addLabel("s2", "s1+=0.6");

    const bars = svg("g", { opacity: 0 }, s);
    Deck.text(bars, 300, 318, "Qué parte de la representación explica la escena (ρ)", { size: 17, font: Deck.MONO, color: C.muted });
    const rows = [["JEPA, buenas vistas", 0.804, true], ["JEPA, malas vistas", 0.655], ["next-token", 0.608]];
    const fills = [];
    rows.forEach(([lab, v, good], i) => {
      const y = 338 + i * 48;
      Deck.text(bars, 280, y + 25, lab, { size: 20, anchor: "end", color: C.text, weight: good ? 600 : 400 });
      svg("rect", { x: 300, y: y + 6, width: 700, height: 26, rx: 4, fill: C.panel }, bars);
      fills.push([svg("rect", { x: 300, y: y + 6, width: 0, height: 26, rx: 4, fill: good ? C.accent : C.muted }, bars), v]);
      Deck.text(bars, 1015, y + 26, v.toFixed(3).replace(/^0/, ""), { size: 19, font: Deck.MONO, color: C.text });
    });
    Deck.text(bars, 1070, 370, "■ escena (mundo)", { size: 17, color: C.accent, font: Deck.MONO });
    Deck.text(bars, 1070, 400, "□ resto: estilo,", { size: 17, color: C.muted, font: Deck.MONO });
    Deck.text(bars, 1070, 424, "   redacción…", { size: 17, color: C.muted, font: Deck.MONO });
    tl.to(bars, { opacity: 1, duration: 0.4 }, "s2");
    fills.forEach(([r, v], i) => tl.to(r, { attr: { width: 700 * v }, duration: 0.7 }, `s2+=${0.2 + i * 0.12}`));
    show(3, "s2");
    tl.addLabel("s3", "s2+=1.2");
    return { tl };
  };

  /* ---------- 15 · Evidence (real figure + numbered marks) ---------- */
  anims.evidence = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector("#ev-shot"), { opacity: 0, y: 20, duration: 0.6 }, 0.1);
    tl.from(slide.querySelectorAll(".shot-mark"), { opacity: 0, scale: 1.15, stagger: 0.5, duration: 0.4 }, 0.8);
    tl.from(slide.querySelectorAll(".ev-li"), { opacity: 0, x: 20, stagger: 0.5, duration: 0.5 }, 0.8);
    return { tl };
  };

  anims.apps = Deck.simple([".ap-el"], { stagger: 0.18 });
  anims.caveats = Deck.simple([".cv-card"], { stagger: 0.15 });
})();
