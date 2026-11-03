/* Animations · block "De dónde venimos" (slides 1–9) + shared helpers for this deck. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  /* ---------- Shared helpers (also used by anims-jepa.js / anims-futuro.js) ---------- */

  let arrowId = 0;
  /** Straight arrow from (x1,y1) to (x2,y2). Returns { g, path }. */
  Deck.arrow = function (parent, x1, y1, x2, y2, opts) {
    const o = Object.assign({ color: C.faint, width: 2, dash: null, head: 9 }, opts);
    const g = svg("g", {}, parent);
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const ex = x2 - Math.cos(ang) * o.head * 0.6;
    const ey = y2 - Math.sin(ang) * o.head * 0.6;
    const path = svg("path", { d: `M${x1},${y1} L${ex},${ey}`, stroke: o.color, "stroke-width": o.width, fill: "none", "stroke-linecap": "round" }, g);
    if (o.dash) path.setAttribute("stroke-dasharray", o.dash);
    const h = o.head;
    const p1 = [x2 - Math.cos(ang - 0.45) * h, y2 - Math.sin(ang - 0.45) * h];
    const p2 = [x2 - Math.cos(ang + 0.45) * h, y2 - Math.sin(ang + 0.45) * h];
    svg("polygon", { points: `${x2},${y2} ${p1.join(",")} ${p2.join(",")}`, fill: o.color }, g);
    g.dataset.id = ++arrowId;
    return { g, path };
  };

  /** Label text helper. */
  Deck.text = function (parent, x, y, text, opts) {
    const o = Object.assign({ size: 18, color: C.text2, font: Deck.BODY, anchor: "start", weight: 400 }, opts);
    return svg("text", { x, y, fill: o.color, "font-size": o.size, "font-family": o.font, "text-anchor": o.anchor, "font-weight": o.weight, text }, parent);
  };

  /** A base "concept cloud": the same relative shape reused by every map in the deck. */
  Deck.cloudBase = function (seed, n, spread) {
    const r = Deck.rng(seed || 7);
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = (0.25 + 0.75 * Math.sqrt(r())) * (spread || 90);
      pts.push([Math.cos(a) * d, Math.sin(a) * d * 0.8]);
    }
    return pts;
  };

  /** Nearest-neighbour edges of a point set (k per point, deduplicated). */
  Deck.knnEdges = function (pts, k) {
    const edges = new Set();
    pts.forEach((p, i) => {
      pts
        .map((q, j) => [j, Math.hypot(p[0] - q[0], p[1] - q[1])])
        .filter(([j]) => j !== i)
        .sort((a, b) => a[1] - b[1])
        .slice(0, k)
        .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
    });
    return [...edges].map((e) => e.split("-").map(Number));
  };

  /**
   * Draw a cloud (points + kNN edges) whose pose is set by update({cx, cy, rot, s}).
   * jitter: optional per-point offsets (in base units) to make an imperfect copy.
   */
  Deck.cloud = function (parent, base, opts) {
    const o = Object.assign({ color: C.text, r: 6, edgeColor: C.lineStrong, edges: Deck.knnEdges(base, 2), jitter: null, hollow: false, edgeWidth: 1.4 }, opts);
    const g = svg("g", {}, parent);
    const eg = svg("g", {}, g);
    const lines = o.edges.map(() => svg("line", { stroke: o.edgeColor, "stroke-width": o.edgeWidth }, eg));
    const dots = base.map(() =>
      svg("circle", o.hollow ? { r: o.r + 2, fill: "none", stroke: o.color, "stroke-width": 2.2 } : { r: o.r, fill: o.color }, g),
    );
    const pos = base.map((p) => [p[0], p[1]]);
    function update(st) {
      const c = Math.cos(st.rot || 0);
      const s = Math.sin(st.rot || 0);
      const k = st.s || 1;
      base.forEach((p, i) => {
        const j = o.jitter ? o.jitter[i] : [0, 0];
        const jx = j[0] * (st.j === undefined ? 1 : st.j);
        const jy = j[1] * (st.j === undefined ? 1 : st.j);
        const x = p[0] + jx;
        const y = p[1] + jy;
        pos[i] = [st.cx + k * (c * x - s * y), st.cy + k * (s * x + c * y)];
        dots[i].setAttribute("cx", pos[i][0]);
        dots[i].setAttribute("cy", pos[i][1]);
      });
      o.edges.forEach(([a, b], i) => {
        lines[i].setAttribute("x1", pos[a][0]);
        lines[i].setAttribute("y1", pos[a][1]);
        lines[i].setAttribute("x2", pos[b][0]);
        lines[i].setAttribute("y2", pos[b][1]);
      });
    }
    return { g, dots, lines, pos, update };
  };

  /** Small picture frame with a sphere + cone scene (the paper's toy world). */
  Deck.scenePic = function (parent, x, y, w, h, variant) {
    const g = svg("g", {}, parent);
    svg("rect", { x, y, width: w, height: h, rx: 6, fill: "#fff", stroke: C.lineStrong, "stroke-width": 1.5 }, g);
    const v = variant || 0;
    const cx = x + w * (v === 1 ? 0.62 : 0.42);
    const sx = x + w * (v === 1 ? 0.38 : 0.64);
    const base = y + h * 0.82;
    const ch = h * (v === 1 ? 0.5 : 0.62);
    const cw = w * (v === 1 ? 0.13 : 0.16);
    svg("polygon", { points: `${cx},${base - ch} ${cx - cw},${base} ${cx + cw},${base}`, fill: "#3f3f46" }, g);
    svg("circle", { cx: sx, cy: base - h * (v === 1 ? 0.14 : 0.17), r: h * (v === 1 ? 0.14 : 0.17), fill: C.accent }, g);
    return g;
  };

  /* ---------- 1 · Cover ---------- */
  anims.cover = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#cover-stage"), 460, 460);
    const base = Deck.cloudBase(11, 16, 150);
    const jit = base.map((_, i) => [((i * 37) % 11) - 5, ((i * 53) % 9) - 4]);
    const a = Deck.cloud(s, base, { color: C.faint, r: 7, edgeColor: C.line });
    const b = Deck.cloud(s, base, { color: C.accent, r: 5, edgeColor: "rgba(37,99,235,0.35)", jitter: jit });
    const sa = { cx: 230, cy: 230, rot: 0 };
    const sb = { cx: 300, cy: 260, rot: 1.25, j: 1 };
    a.update(sa);
    b.update(sb);
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".kicker"), { opacity: 0, x: -30, duration: 0.6 })
      .from(slide.querySelector("h1"), { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, 0.15)
      .from(slide.querySelector(".sub"), { opacity: 0, y: 20, duration: 0.7 }, 0.55)
      .from(slide.querySelectorAll(".tags .tag"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 }, 0.85)
      .from([a.g, b.g], { opacity: 0, duration: 0.8, stagger: 0.2 }, 0.4)
      .to(sb, { cx: 230, cy: 230, rot: 0, j: 0.25, duration: 2.2, ease: "power2.inOut", onUpdate: () => b.update(sb) }, 1.4)
      .from(slide.querySelector(".replay-hint"), { opacity: 0, duration: 0.6 }, 1.6);
    return { tl };
  };

  /* ---------- 2 · Hook ---------- */
  anims.hook = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".hook-nums .card"), { opacity: 0, y: 30, stagger: 0.2, duration: 0.6, ease: "power3.out" }, 0.1);
    Deck.count(tl, slide.querySelector("#hk-a"), 109, 0.3, { duration: 1.2 });
    Deck.count(tl, slide.querySelector("#hk-b"), 72, 0.5, { duration: 1.2 });
    Deck.count(tl, slide.querySelector("#hk-c"), 42, 0.7, { duration: 1.2 });
    tl.from(slide.querySelector(".callout"), { opacity: 0, x: -20, duration: 0.6 }, 1.8);
    return { tl };
  };

  /* ---------- 3 · Embeddings ---------- */
  anims.embeddings = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#emb-stage"), 840, 560);
    // faint axes
    svg("line", { x1: 40, y1: 530, x2: 820, y2: 530, stroke: C.line, "stroke-width": 1.5 }, s);
    svg("line", { x1: 40, y1: 530, x2: 40, y2: 20, stroke: C.line, "stroke-width": 1.5 }, s);
    Deck.text(s, 820, 552, "dimensión 1", { anchor: "end", size: 15, color: C.faint, font: Deck.MONO });
    Deck.text(s, 52, 30, "dimensión 2", { size: 15, color: C.faint, font: Deck.MONO });
    const groups = [
      { name: "animales", cx: 230, cy: 175, rx: 140, ry: 105, w: [["perro", 200, 150], ["cachorro", 285, 185], ["gato", 160, 215], ["gatito", 240, 245]] },
      { name: "vehículos", cx: 620, cy: 170, rx: 125, ry: 95, w: [["coche", 575, 140], ["autobús", 670, 175], ["bici", 595, 225]] },
      { name: "playa", cx: 430, cy: 420, rx: 150, ry: 90, w: [["playa", 385, 395], ["mar", 480, 410], ["ola", 445, 470], ["arena", 345, 455]] },
    ];
    const tl = gsap.timeline({ paused: true });
    const halos = [];
    const pts = {};
    groups.forEach((gr, gi) => {
      const halo = svg("ellipse", { cx: gr.cx, cy: gr.cy, rx: gr.rx, ry: gr.ry, fill: "none", stroke: C.lineStrong, "stroke-width": 1.5, "stroke-dasharray": "5 6", opacity: 0 }, s);
      const hl = Deck.text(s, gr.cx, gr.cy - gr.ry - 10, gr.name, { anchor: "middle", size: 15, color: C.muted, font: Deck.MONO });
      hl.setAttribute("opacity", 0);
      halos.push(halo, hl);
      gr.w.forEach(([w, x, y], i) => {
        const g = svg("g", {}, s);
        svg("circle", { cx: x, cy: y, r: 7, fill: w === "perro" ? C.accent : C.text }, g);
        Deck.text(g, w === "perro" ? x - 12 : x + 12, y + 6, w, { size: 20, color: w === "perro" ? C.accent : C.text, anchor: w === "perro" ? "end" : "start", weight: w === "perro" ? 600 : 400 });
        pts[w] = [x, y];
        tl.from(g, { opacity: 0, scale: 0.4, transformOrigin: `${x}px ${y}px`, duration: 0.45, ease: "back.out(2)" }, 0.2 + gi * 0.35 + i * 0.08);
      });
    });
    tl.to(halos, { opacity: 1, duration: 0.6, stagger: 0.05 }, 1.6);
    // near / far
    // Both lines grow from "perro" (attribute tween, so the dashed one animates too).
    const [px, py] = pts.perro;
    const near = svg("line", { x1: px, y1: py, x2: px, y2: py, stroke: C.accent, "stroke-width": 2.5, opacity: 0 }, s);
    const far = svg("line", { x1: px, y1: py, x2: px, y2: py, stroke: C.faint, "stroke-width": 2, "stroke-dasharray": "6 6", opacity: 0 }, s);
    const nl = Deck.text(s, 204, 192, "cerca", { size: 16, color: C.accent, font: Deck.MONO, weight: 600 });
    const fl = Deck.text(s, 435, 148, "lejos", { size: 16, color: C.muted, font: Deck.MONO });
    tl.set(near, { opacity: 1 }, 2.3);
    tl.to(near, { attr: { x2: pts.cachorro[0], y2: pts.cachorro[1] }, duration: 0.6, ease: "power2.inOut" }, 2.3);
    tl.set(far, { opacity: 1 }, 2.5);
    tl.to(far, { attr: { x2: pts["autobús"][0], y2: pts["autobús"][1] }, duration: 0.9, ease: "power2.inOut" }, 2.5);
    tl.from([nl, fl], { opacity: 0, duration: 0.4, stagger: 0.2 }, 2.8);
    tl.from(slide.querySelectorAll(".emb-card"), { opacity: 0, x: 24, stagger: 0.25, duration: 0.6 }, 0.6);
    return { tl };
  };

  /* ---------- 4 · Cave: one world, two shadows, two models ---------- */
  anims.cave = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#cave-stage"), 1424, 520);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#cave-cap"), [
      "<strong>El mundo</strong>: una escena real. Ningún modelo la ve directamente.",
      "Solo vemos <strong>sombras</strong> de ella: fotos desde un ángulo, frases con unas palabras concretas. Como en la caverna de Platón.",
      "Entrenamos <strong>un modelo por modalidad, por separado</strong>: el de visión nunca lee texto y el de lenguaje nunca ve fotos.",
      "La pregunta de fondo: si las sombras vienen del mismo mundo, <strong>¿acaban los dos modelos dibujando el mismo mapa?</strong>",
    ]);
    // world
    const world = svg("g", {}, s);
    svg("rect", { x: 572, y: 8, width: 280, height: 130, rx: 10, fill: C.panel, stroke: C.text, "stroke-width": 1.5 }, world);
    Deck.text(world, 590, 34, "EL MUNDO · una escena", { size: 14, color: C.muted, font: Deck.MONO });
    svg("polygon", { points: "690,60 668,124 712,124", fill: "#3f3f46" }, world);
    svg("circle", { cx: 745, cy: 104, r: 20, fill: C.accent }, world);
    tl.from(world, { opacity: 0, y: -16, duration: 0.6 }, 0.1);
    show(0, 0.1);
    tl.addLabel("s0");

    // shadows
    const sh = svg("g", { opacity: 0 }, s);
    const a1 = Deck.arrow(sh, 572, 90, 380, 180, { color: C.faint });
    const a2 = Deck.arrow(sh, 852, 90, 1044, 180, { color: C.faint });
    Deck.text(sh, 340, 190, "Fotos", { size: 18, color: C.muted, font: Deck.MONO, anchor: "middle" });
    Deck.scenePic(sh, 180, 205, 150, 100, 0);
    Deck.scenePic(sh, 350, 205, 150, 100, 1);
    Deck.text(sh, 1084, 190, "Textos", { size: 18, color: C.muted, font: Deck.MONO, anchor: "middle" });
    Deck.chip(sh, 930, 210, "«Una esfera junto a un cono»", { size: 17, font: Deck.BODY, charW: 0.5, h: 38 });
    Deck.chip(sh, 930, 262, "«Un cono detrás de una bola»", { size: 17, font: Deck.BODY, charW: 0.5, h: 38 });
    tl.to(sh, { opacity: 1, duration: 0.6 }, "s0");
    tl.from([a1.g, a2.g], { opacity: 0, duration: 0.4 }, "s0");
    show(1, "s0");
    tl.addLabel("s1", "s0+=0.8");

    // models + wall
    const md = svg("g", { opacity: 0 }, s);
    Deck.arrow(md, 340, 315, 340, 350, { color: C.faint });
    Deck.arrow(md, 1084, 312, 1084, 350, { color: C.faint });
    svg("rect", { x: 220, y: 355, width: 240, height: 52, rx: 8, fill: "#18181b" }, md);
    Deck.text(md, 340, 388, "Modelo de visión", { size: 19, color: "#fff", anchor: "middle", weight: 500 });
    svg("rect", { x: 964, y: 355, width: 240, height: 52, rx: 8, fill: "#18181b" }, md);
    Deck.text(md, 1084, 388, "Modelo de lenguaje", { size: 19, color: "#fff", anchor: "middle", weight: 500 });
    svg("line", { x1: 712, y1: 170, x2: 712, y2: 515, stroke: C.lineStrong, "stroke-width": 2, "stroke-dasharray": "8 8" }, md);
    svg("rect", { x: 622, y: 290, width: 180, height: 30, fill: "#fff" }, md);
    Deck.text(md, 712, 311, "nunca se ven", { size: 16, color: C.muted, anchor: "middle", font: Deck.MONO });
    tl.to(md, { opacity: 1, duration: 0.6 }, "s1");
    show(2, "s1");
    tl.addLabel("s2", "s1+=0.8");

    // two maps + question
    const base = Deck.cloudBase(5, 9, 52);
    const c1 = Deck.cloud(s, base, { color: C.text, r: 5 });
    const c2 = Deck.cloud(s, base, { color: C.accent, r: 5, edgeColor: "rgba(37,99,235,0.35)" });
    c1.update({ cx: 340, cy: 462, rot: 0, s: 1.25 });
    c2.update({ cx: 1084, cy: 462, rot: 1.9, s: 1.25 });
    const q = svg("g", {}, s);
    svg("rect", { x: 602, y: 446, width: 220, height: 40, rx: 20, fill: "#fff", stroke: C.accent, "stroke-width": 1.5 }, q);
    Deck.text(q, 712, 473, "¿el mismo mapa?", { size: 19, color: C.accent, anchor: "middle", weight: 600 });
    gsap.set([c1.g, c2.g, q], { opacity: 0 });
    tl.to([c1.g, c2.g], { opacity: 1, duration: 0.6, stagger: 0.15 }, "s2");
    tl.to(q, { opacity: 1, duration: 0.5 }, "s2+=0.5");
    show(3, "s2");
    tl.addLabel("s3", "s2+=1");
    return { tl };
  };

  /* ---------- 5 · Rotation between two languages ---------- */
  anims.rotation = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#rot-stage"), 1424, 520);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#rot-cap"), [
      "Entrenamos word2vec en inglés y en español <strong>por separado</strong>. Cada idioma produce su propia nube de palabras.",
      "Mikolov et al. (2013): con un <strong>diccionario pequeño</strong> de pares conocidos se aprende una transformación lineal entre las dos nubes.",
      "Basta <strong>girar</strong> una nube para que caiga sobre la otra: la estructura interna es casi la misma. Traducía inglés→español con ~90 % de acierto (precision@5).",
      "Conneau et al. (2017): <strong>ni siquiera hace falta diccionario</strong>; la forma de las nubes basta para encontrar el giro. Recuerda esta rotación: volverá.",
    ]);
    const words = [
      ["one", "uno", -170, -80],
      ["two", "dos", -120, -130],
      ["three", "tres", -20, -80],
      ["cat", "gato", 95, -10],
      ["dog", "perro", 150, 40],
      ["house", "casa", -95, 85],
      ["car", "coche", 25, 125],
    ];
    const base = words.map((w) => [w[2], w[3]]);
    const jit = [[6, -4], [-5, 5], [4, 6], [-6, -3], [5, 4], [-4, -6], [6, 3]];
    const edges = Deck.knnEdges(base, 2);
    const en = Deck.cloud(s, base, { color: C.text, r: 7, edges });
    const es = Deck.cloud(s, base, { color: C.accent, r: 7, edges, edgeColor: "rgba(37,99,235,0.35)", jitter: jit, hollow: true });
    const enL = words.map((w) => Deck.text(s, 0, 0, w[0], { size: 19, color: C.text, anchor: "end", font: Deck.MONO }));
    const esL = words.map((w) => Deck.text(s, 0, 0, w[1], { size: 19, color: C.accent, font: Deck.MONO, weight: 500 }));
    const dict = [0, 4, 5].map(() => svg("line", { stroke: C.faint, "stroke-width": 1.6, "stroke-dasharray": "5 6", opacity: 0 }, s));
    const ten = Deck.text(s, 330, 50, "Inglés", { size: 24, color: C.text, anchor: "middle", weight: 600 });
    const tes = Deck.text(s, 1090, 50, "Español", { size: 24, color: C.accent, anchor: "middle", weight: 600 });
    const st = { ex: 330, ey: 270, sx: 1090, sy: 270, rot: -1.35 };
    function render() {
      en.update({ cx: st.ex, cy: st.ey, rot: 0, s: 1.3 });
      es.update({ cx: st.sx, cy: st.sy, rot: st.rot, j: 1, s: 1.3 });
      words.forEach((_, i) => {
        enL[i].setAttribute("x", en.pos[i][0] - 13);
        enL[i].setAttribute("y", en.pos[i][1] - 9);
        esL[i].setAttribute("x", es.pos[i][0] + 13);
        esL[i].setAttribute("y", es.pos[i][1] + 22);
      });
      [0, 4, 5].forEach((k, i) => {
        dict[i].setAttribute("x1", en.pos[k][0]);
        dict[i].setAttribute("y1", en.pos[k][1]);
        dict[i].setAttribute("x2", es.pos[k][0]);
        dict[i].setAttribute("y2", es.pos[k][1]);
      });
    }
    render();
    tl.from([en.g, ...enL, ten], { opacity: 0, duration: 0.6 }, 0.1);
    tl.from([es.g, ...esL, tes], { opacity: 0, duration: 0.6 }, 0.4);
    show(0, 0.1);
    tl.addLabel("s0", 1.1);

    tl.to(dict, { opacity: 1, duration: 0.5, stagger: 0.15 }, "s0");
    const dl = Deck.text(s, 710, 250, "diccionario pequeño", { size: 17, color: C.muted, anchor: "middle", font: Deck.MONO });
    gsap.set(dl, { opacity: 0 });
    tl.to(dl, { opacity: 1, duration: 0.4 }, "s0+=0.3");
    show(1, "s0");
    tl.addLabel("s1", "s0+=0.9");

    const rl = Deck.text(s, 712, 40, "↻  una rotación", { size: 22, color: C.accent, anchor: "middle", weight: 600 });
    gsap.set(rl, { opacity: 0 });
    tl.to([dl, ...dict], { opacity: 0, duration: 0.3 }, "s1");
    tl.to([ten, tes], { opacity: 0, duration: 0.3 }, "s1");
    tl.to(st, { ex: 712, sx: 712, sy: 270, rot: 0, duration: 2, ease: "power2.inOut", onUpdate: render }, "s1+=0.2");
    tl.to(rl, { opacity: 1, duration: 0.4 }, "s1+=0.4");
    show(2, "s1");
    tl.addLabel("s2", "s1+=2.3");

    const badge = svg("g", { opacity: 0 }, s);
    svg("rect", { x: 1040, y: 200, width: 300, height: 92, rx: 10, fill: "#fff", stroke: C.accent, "stroke-width": 1.5 }, badge);
    Deck.text(badge, 1060, 236, "2017 · sin pares", { size: 21, color: C.accent, weight: 600 });
    Deck.text(badge, 1060, 268, "solo la forma de las nubes", { size: 18, color: C.text2 });
    tl.to(badge, { opacity: 1, duration: 0.5 }, "s2");
    tl.fromTo(es.dots, { attr: { r: 7 } }, { attr: { r: 11 }, duration: 0.3, yoyo: true, repeat: 1, stagger: 0.05 }, "s2+=0.2");
    show(3, "s2");
    tl.addLabel("s3", "s2+=1");
    return { tl };
  };

  /* ---------- 6 · CLIP contrastive matrix ---------- */
  anims.clip = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#clip-stage"), 680, 520);
    const n = 5;
    const cell = 72;
    const x0 = 170;
    const y0 = 120;
    const tl = gsap.timeline({ paused: true });
    const texts = ["perro", "playa", "coche", "tarta", "surf"];
    const heads = [];
    texts.forEach((t, j) => {
      const tx = Deck.text(s, x0 + j * cell + cell / 2, y0 - 16, t, { size: 16, color: C.text2, anchor: "middle", font: Deck.MONO });
      heads.push(tx);
    });
    Deck.text(s, x0 + (n * cell) / 2, y0 - 52, "textos →", { size: 15, color: C.muted, anchor: "middle", font: Deck.MONO });
    const thumbs = [];
    for (let i = 0; i < n; i++) {
      const g = svg("g", {}, s);
      const y = y0 + i * cell + 8;
      svg("rect", { x: 90, y, width: 56, height: 56, rx: 6, fill: C.panel, stroke: C.lineStrong }, g);
      const cx = 118;
      const cy = y + 28;
      if (i === 0) svg("circle", { cx, cy, r: 14, fill: "#3f3f46" }, g);
      if (i === 1) svg("path", { d: `M${cx - 20},${cy + 6} q10,-14 20,0 t20,0`, stroke: C.accent, "stroke-width": 3, fill: "none" }, g);
      if (i === 2) svg("rect", { x: cx - 18, y: cy - 8, width: 36, height: 18, rx: 4, fill: "#3f3f46" }, g);
      if (i === 3) svg("polygon", { points: `${cx},${cy - 16} ${cx - 16},${cy + 14} ${cx + 16},${cy + 14}`, fill: "#3f3f46" }, g);
      if (i === 4) svg("path", { d: `M${cx - 20},${cy + 10} q20,-34 40,0`, stroke: "#3f3f46", "stroke-width": 3, fill: "none" }, g);
      thumbs.push(g);
    }
    const yl = Deck.text(s, 60, y0 + (n * cell) / 2, "imágenes ↓", { size: 15, color: C.muted, anchor: "middle", font: Deck.MONO });
    yl.setAttribute("transform", `rotate(-90 60 ${y0 + (n * cell) / 2})`);
    const cells = [];
    const diag = [];
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const r = svg("rect", { x: x0 + j * cell + 3, y: y0 + i * cell + 3, width: cell - 6, height: cell - 6, rx: 6, fill: C.panel }, s);
        cells.push(r);
        if (i === j) diag.push(r);
      }
    const lab = Deck.text(s, x0 + (n * cell) / 2, y0 + n * cell + 44, "×400 millones de pares, entrenados a la vez", { size: 18, color: C.text2, anchor: "middle", weight: 500 });
    tl.from([...heads, ...thumbs], { opacity: 0, y: 10, stagger: 0.05, duration: 0.4 }, 0.1);
    tl.from(cells, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%", stagger: 0.02, duration: 0.3 }, 0.5);
    tl.to(diag, { fill: C.accent, duration: 0.4, stagger: 0.15 }, 1.2);
    tl.from(lab, { opacity: 0, duration: 0.5 }, 2);
    tl.from(slide.querySelectorAll(".clip-card"), { opacity: 0, x: 24, stagger: 0.25, duration: 0.6 }, 0.6);
    return { tl };
  };

  /* ---------- 7 · PRH: mutual k-NN ---------- */
  anims.prh = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#prh-stage"), 800, 470);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#prh-cap"), [
      "Dos modelos entrenados por separado colocan los mismos conceptos en <strong>su propio espacio</strong>.",
      "Para compararlos sin alinear nada, se miran los <strong>k vecinos más cercanos</strong> de cada concepto en cada espacio (aquí k = 3).",
      "La <strong>mutual k-NN</strong> mide cuántos vecinos coinciden. Huh et al. vieron que crece cuanto mejor es el LLM.",
    ]);
    // Hand-placed so that "perro" shares 2 of its 3 nearest neighbours across spaces.
    const base = [[0, 0], [-62, -32], [56, -42], [22, 66], [-150, -118], [128, -128], [158, 38], [-160, 60], [-92, 138], [112, 138], [-20, -150], [168, -62]];
    const bpos = [[0, 0], [-56, -36], [62, -30], [34, 112], [-148, -110], [124, -132], [160, 30], [-158, 70], [-96, 132], [72, 72], [-26, -148], [164, -70]];
    const jit = base.map((p, i) => [bpos[i][0] - p[0], bpos[i][1] - p[1]]);
    const A = Deck.cloud(s, base, { color: C.text, r: 6, edges: [] });
    const B = Deck.cloud(s, base, { color: C.text, r: 6, edges: [], jitter: jit });
    A.update({ cx: 195, cy: 235, rot: 0, s: 1.05 });
    B.update({ cx: 605, cy: 235, rot: 0.35, j: 1, s: 1.05 });
    Deck.text(s, 195, 40, "Modelo de visión", { size: 20, anchor: "middle", weight: 600, color: C.text });
    Deck.text(s, 605, 40, "Modelo de lenguaje", { size: 20, anchor: "middle", weight: 600, color: C.text });
    svg("line", { x1: 400, y1: 60, x2: 400, y2: 440, stroke: C.line, "stroke-width": 1.5 }, s);
    const q = 0;
    [A, B].forEach((M) => M.dots[q].setAttribute("fill", C.accent));
    const knn = (pos) =>
      pos
        .map((p, j) => [j, Math.hypot(p[0] - pos[q][0], p[1] - pos[q][1])])
        .filter(([j]) => j !== q)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([j]) => j);
    const nA = knn(A.pos);
    const nB = knn(B.pos);
    const shared = nA.filter((j) => nB.includes(j));
    const qa = Deck.text(s, A.pos[q][0] - 14, A.pos[q][1] + 6, "perro", { size: 17, anchor: "end", color: C.accent, font: Deck.MONO, weight: 600 });
    const qb = Deck.text(s, B.pos[q][0] - 14, B.pos[q][1] + 6, "«perro»", { size: 17, anchor: "end", color: C.accent, font: Deck.MONO, weight: 600 });
    tl.from([A.g, B.g], { opacity: 0, duration: 0.6, stagger: 0.2 }, 0.1);
    tl.from([qa, qb], { opacity: 0, duration: 0.4 }, 0.6);
    show(0, 0.1);
    tl.addLabel("s0", 1.1);

    const linesA = nA.map((j) => svg("line", { x1: A.pos[q][0], y1: A.pos[q][1], x2: A.pos[j][0], y2: A.pos[j][1], stroke: C.accent, "stroke-width": 2 }, s));
    const linesB = nB.map((j) => svg("line", { x1: B.pos[q][0], y1: B.pos[q][1], x2: B.pos[j][0], y2: B.pos[j][1], stroke: C.accent, "stroke-width": 2 }, s));
    [...linesA, ...linesB].forEach((l, i) => Deck.draw(tl, l, i < 3 ? "s0" : "s0+=0.3", 0.5));
    // hide lines before s0 (Deck.draw uses fromTo, so set dash beforehand)
    show(1, "s0");
    tl.addLabel("s1", "s0+=0.9");

    const rings = [];
    shared.forEach((j) => {
      [A, B].forEach((M) => {
        rings.push(svg("circle", { cx: M.pos[j][0], cy: M.pos[j][1], r: 13, fill: "none", stroke: C.accent, "stroke-width": 2.5, opacity: 0 }, s));
      });
    });
    const score = svg("g", { opacity: 0 }, s);
    svg("rect", { x: 230, y: 412, width: 340, height: 46, rx: 23, fill: "#fff", stroke: C.accent, "stroke-width": 1.5 }, score);
    Deck.text(score, 400, 442, `${shared.length} de 3 vecinos en común → ${(shared.length / 3).toFixed(2).replace(".", ",")}`, { size: 19, anchor: "middle", color: C.accent, weight: 600 });
    tl.to(rings, { opacity: 1, duration: 0.4, stagger: 0.08 }, "s1");
    tl.to(score, { opacity: 1, duration: 0.5 }, "s1+=0.4");
    show(2, "s1");
    tl.addLabel("s2", "s1+=1");
    tl.from(slide.querySelectorAll(".prh-q"), { opacity: 0, y: 16, stagger: 0.2, duration: 0.6 }, 0);
    return { tl };
  };

  /* ---------- 8 · Observation cards ---------- */
  anims.observation = Deck.simple([".obs-card"], { stagger: 0.18 });

  /* ---------- 9 · Timeline ---------- */
  anims.timeline = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#tl-stage"), 1424, 600);
    const tl = gsap.timeline({ paused: true });
    const ev = [
      ["2013", "Mapas lineales", "entre idiomas"],
      ["2017", "MUSE: traducir", "sin pares"],
      ["2020", "Scaling laws:", "escalar funciona"],
      ["2021", "CLIP: 400M", "de pares"],
      ["2022", "LeCun propone", "JEPA"],
      ["2023", "I-JEPA", "y DINOv2"],
      ["2024", "Hipótesis", "Platónica", true],
      ["2025", "vec2vec, Blind", "Match, LeJEPA"],
      ["2026", "Críticas: ¿cuánto", "converge?"],
      ["oct 2026", "El teorema", "(este paper)", true, true],
    ];
    const y = 300;
    const x0 = 110;
    const step = 134;
    const axis = svg("line", { x1: 50, y1: y, x2: 1380, y2: y, stroke: C.lineStrong, "stroke-width": 2 }, s);
    Deck.draw(tl, axis, 0, 1);
    ev.forEach(([yr, l1, l2, hl, main], i) => {
      const x = x0 + i * step;
      const up = i % 2 === 0;
      const g = svg("g", {}, s);
      const col = main ? C.accent : hl ? C.text : C.text2;
      svg("line", { x1: x, y1: y, x2: x, y2: up ? y - 70 : y + 70, stroke: hl ? col : C.lineStrong, "stroke-width": 1.5 }, g);
      svg("circle", { cx: x, cy: y, r: main ? 11 : hl ? 9 : 7, fill: main ? C.accent : hl ? C.text : "#fff", stroke: main ? C.accent : C.text, "stroke-width": 2 }, g);
      const ty = up ? y - 160 : y + 108;
      Deck.text(g, x, ty, yr, { size: 19, anchor: "middle", font: Deck.MONO, color: main ? C.accent : C.muted, weight: 500 });
      Deck.text(g, x, ty + 30, l1, { size: 23, anchor: "middle", color: col, weight: hl ? 600 : 500 });
      Deck.text(g, x, ty + 57, l2, { size: 23, anchor: "middle", color: col, weight: hl ? 600 : 500 });
      tl.from(g, { opacity: 0, y: up ? 12 : -12, duration: 0.45 }, 0.6 + i * 0.22);
    });
    const brk = svg("g", {}, s);
    svg("path", { d: `M${x0 - 20},500 L${x0 - 20},515 L${x0 + 6 * step + 20},515 L${x0 + 6 * step + 20},500`, stroke: C.faint, fill: "none", "stroke-width": 1.5 }, brk);
    Deck.text(brk, x0 + 3 * step, 545, "observación: «parece que convergen»", { size: 18, anchor: "middle", color: C.muted, font: Deck.MONO });
    svg("path", { d: `M${x0 + 7 * step - 20},500 L${x0 + 7 * step - 20},515 L${x0 + 9 * step + 20},515 L${x0 + 9 * step + 20},500`, stroke: C.accent, fill: "none", "stroke-width": 1.5 }, brk);
    Deck.text(brk, x0 + 8 * step, 545, "uso, crítica y teoría", { size: 18, anchor: "middle", color: C.accent, font: Deck.MONO });
    tl.from(brk, { opacity: 0, duration: 0.6 }, 3);
    return { tl };
  };
})();
