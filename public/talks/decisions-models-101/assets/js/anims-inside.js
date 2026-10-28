/* Animations: "how it works inside" slides. */
(function () {
  const DM = window.DM;
  const { anims, svg, colors: C } = DM;

  const MONO = "JetBrains Mono";
  const DISPLAY = "Space Grotesk";

  /** Deterministic pseudo-random generator so visuals are stable between runs. */
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /** A rounded text chip; returns the <g>. Width is estimated from the text. */
  function chip(parent, x, y, text, opts) {
    const o = Object.assign({ size: 16, color: C.lineStrong, fill: "rgba(148,163,184,0.08)", textColor: C.text, h: 32, charW: 0.6 }, opts);
    const w = Math.round(text.length * o.size * o.charW + 18);
    const g = svg("g", {}, parent);
    svg("rect", { x, y, width: w, height: o.h, rx: 8, fill: o.fill, stroke: o.color, "stroke-width": 1.2 }, g);
    svg("text", { x: x + w / 2, y: y + o.h / 2 + o.size * 0.35, "text-anchor": "middle", fill: o.textColor, "font-size": o.size, "font-family": MONO, text }, g);
    g.dataset.w = w;
    return g;
  }

  /* 8 · Generate token by token vs decide at once */
  anims.generation = function (slide) {
    const s = DM.stageSvg(slide.querySelector("#gen-stage"), 1424, 600);
    const tl = gsap.timeline({ paused: true });

    // Lane A · LLM
    const gA = svg("g", {}, s);
    svg("text", { x: 0, y: 26, fill: C.orange, "font-size": 18, "font-family": MONO, text: "LLM · GENERACIÓN AUTORREGRESIVA" }, gA);
    const boxA = svg("rect", { x: 0, y: 50, width: 200, height: 150, rx: 18, fill: "rgba(251,146,60,0.06)", stroke: C.orange, "stroke-width": 2 }, gA);
    svg("text", { x: 100, y: 135, "text-anchor": "middle", fill: "#fff", "font-size": 34, "font-weight": 600, "font-family": DISPLAY, text: "LLM" }, gA);
    const words = "Parece que se trata de un problema de pagos, así que probablemente el equipo de facturación sería el más adecuado…".split(" ");
    let cx = 250,
      cy = 62;
    const chips = words.map((w) => {
      const tmpW = Math.round(w.length * 18 * 0.6 + 18);
      if (cx + tmpW > 1424) {
        cx = 250;
        cy += 52;
      }
      const g = chip(gA, cx, cy, w, { size: 18, color: "rgba(251,146,60,0.5)", h: 38 });
      cx += tmpW + 8;
      return g;
    });
    const cntA = svg("text", { x: 0, y: 250, fill: C.text, "font-size": 22, "font-family": MONO, text: "pasadas por el modelo: 0" }, gA);
    svg("text", { x: 420, y: 250, fill: C.text2, "font-size": 19, "font-family": "Inter", text: "Una pasada completa por cada palabra, eligiendo cada vez la siguiente (a menudo, con algo de azar)." }, gA);

    tl.from(gA, { opacity: 0, duration: 0.4 }, 0);
    const dt = 0.22;
    chips.forEach((g, i) => {
      const at = 0.5 + i * dt;
      tl.to(boxA, { attr: { fill: "rgba(251,146,60,0.28)" }, duration: dt / 2, yoyo: true, repeat: 1 }, at - dt);
      tl.from(g, { opacity: 0, y: 8, duration: dt }, at);
    });
    const nA = { v: 0 };
    tl.to(nA, { v: chips.length, duration: chips.length * dt, ease: `steps(${chips.length})`, onUpdate: () => (cntA.textContent = `pasadas por el modelo: ${Math.round(nA.v)}`) }, 0.5);
    tl.addLabel("s0");

    // Lane B · decision model
    const gB = svg("g", {}, s);
    const oy = 320;
    svg("text", { x: 0, y: oy + 26, fill: C.cyan, "font-size": 18, "font-family": MONO, text: "MODELO DE DECISIÓN · UNA PASADA" }, gB);
    const boxB = svg("rect", { x: 0, y: oy + 50, width: 200, height: 150, rx: 18, fill: "rgba(34,211,238,0.06)", stroke: C.cyan, "stroke-width": 2 }, gB);
    svg("text", { x: 100, y: oy + 122, "text-anchor": "middle", fill: "#fff", "font-size": 24, "font-weight": 600, "font-family": DISPLAY, text: "Modelo de" }, gB);
    svg("text", { x: 100, y: oy + 152, "text-anchor": "middle", fill: "#fff", "font-size": 24, "font-weight": 600, "font-family": DISPLAY, text: "decisión" }, gB);
    const opts = [
      ["billing", 0.87],
      ["technical", 0.13],
      ["sales", 0.0],
    ];
    const bars = opts.map(([l, v], i) => {
      const y = oy + 66 + i * 44;
      svg("text", { x: 260, y: y + 20, fill: C.text2, "font-size": 20, "font-family": MONO, text: l }, gB);
      svg("rect", { x: 400, y: y + 4, width: 560, height: 20, rx: 4, fill: "rgba(148,163,184,0.12)" }, gB);
      svg("text", { x: 980, y: y + 21, fill: C.text, "font-size": 20, "font-family": MONO, text: v.toFixed(2) }, gB);
      return svg("rect", { x: 400, y: y + 4, width: 0, height: 20, rx: 4, fill: i === 0 ? C.cyan : C.markDm, "data-w": 560 * v, filter: i === 0 ? "url(#glow)" : "" }, gB);
    });
    const cntB = svg("text", { x: 0, y: oy + 250, fill: C.text, "font-size": 22, "font-family": MONO, text: "pasadas por el modelo: 1" }, gB);
    svg("text", { x: 420, y: oy + 250, fill: C.text2, "font-size": 19, "font-family": "Inter", text: "Puntúa todas las opciones a la vez y devuelve la probabilidad de cada una. Sin azar." }, gB);

    tl.from(gB, { opacity: 0, duration: 0.4 });
    tl.to(boxB, { attr: { fill: "rgba(34,211,238,0.3)" }, duration: 0.2, yoyo: true, repeat: 1 });
    bars.forEach((b, i) => tl.to(b, { attr: { width: b.getAttribute("data-w") }, duration: 0.7, ease: "power3.out" }, i === 0 ? ">" : "<"));
    tl.from(cntB, { opacity: 0, duration: 0.3 }, "<");
    tl.addLabel("s1");
    return { tl };
  };

  /* 9 · The common architecture, step by step */
  anims.architecture = function (slide) {
    const s = DM.stageSvg(slide.querySelector("#arch-stage"), 1424, 560);
    const tl = gsap.timeline({ paused: true });
    const r = rng(7);

    // Captions (cross-faded per step)
    const capHost = slide.querySelector("#arch-caption");
    const captions = [
      "Entra el <strong>estado</strong>: el contexto sobre el que hay que decidir, en texto o en JSON.",
      "Se trocea en <strong>tokens</strong>, las piezas con las que trabaja cualquier modelo de lenguaje.",
      "Un <strong>modelo de lenguaje preentrenado</strong> los lee. Es la parte que «entiende» el texto, igual que en un LLM.",
      "Sale el <strong>estado latente</strong>: números que representan lo que el modelo ha entendido. Se calcula <strong>una sola vez</strong>.",
      "Llega la <strong>pregunta</strong> con sus opciones y se lee junto a ese estado latente.",
      "Un <strong>cabezal de decisión</strong> pequeño compara la pregunta con cada opción y les da una puntuación. <strong>No se genera texto.</strong>",
      "Las puntuaciones se convierten en <strong>probabilidades</strong> que suman 1, y sale una respuesta tipada, lista para el código.",
    ];
    capHost.style.position = "relative";
    capHost.innerHTML = captions.map((c) => `<div class="arch-cap" style="position:absolute;inset:8px 0 0 22px;opacity:0">${c}</div>`).join("");
    const caps = capHost.querySelectorAll(".arch-cap");
    const showCap = (i, at) => {
      if (i > 0) tl.to(caps[i - 1], { opacity: 0, duration: 0.3 }, at);
      tl.to(caps[i], { opacity: 1, duration: 0.4 }, at + 0.15);
    };

    // --- State card
    const gState = svg("g", {}, s);
    svg("rect", { x: 0, y: 10, width: 330, height: 100, rx: 16, fill: "rgba(167,139,250,0.08)", stroke: C.violet, "stroke-width": 1.5 }, gState);
    svg("text", { x: 18, y: 36, fill: C.violet, "font-size": 14, "font-family": MONO, text: "ESTADO" }, gState);
    svg("text", { x: 18, y: 66, fill: "#fff", "font-size": 21, "font-family": "Inter", text: "¡Ayuda! Mis pagos fallan" }, gState);
    svg("text", { x: 18, y: 93, fill: "#fff", "font-size": 21, "font-family": "Inter", text: "desde hace 3 días." }, gState);

    // --- Tokens
    const toks = ["¡", "Ayuda", "!", "Mis", "pagos", "fallan", "desde", "hace", "3", "días", "."];
    let tx = 0,
      ty = 132;
    const tokChips = toks.map((t) => {
      const w = Math.round(t.length * 16 * 0.6 + 18);
      if (tx + w > 330) {
        tx = 0;
        ty += 42;
      }
      const g = chip(s, tx, ty, t, { size: 16, color: "rgba(167,139,250,0.55)", fill: "rgba(167,139,250,0.1)" });
      tx += w + 6;
      return g;
    });

    // --- Backbone (stack of layers)
    const gBone = svg("g", {}, s);
    const layers = [];
    for (let i = 0; i < 6; i++) {
      layers.push(svg("rect", { x: 420, y: 20 + i * 80, width: 220, height: 64, rx: 12, fill: "rgba(148,163,184,0.07)", stroke: C.lineStrong, "stroke-width": 1.2 }, gBone));
      svg("text", { x: 530, y: 58 + i * 80, "text-anchor": "middle", fill: C.muted, "font-size": 13, "font-family": MONO, text: `capa ${6 - i}` }, gBone);
    }
    svg("text", { x: 530, y: 530, "text-anchor": "middle", fill: "#fff", "font-size": 20, "font-weight": 600, "font-family": DISPLAY, text: "Modelo base preentrenado" }, gBone);
    svg("text", { x: 530, y: 553, "text-anchor": "middle", fill: C.muted, "font-size": 14, "font-family": MONO, text: "el «lector»: Qwen, ModernBERT…" }, gBone);

    // --- Latent state grid (one column per token)
    const gLat = svg("g", {}, s);
    svg("text", { x: 720, y: 28, fill: C.violet, "font-size": 14, "font-family": MONO, text: "ESTADO LATENTE" }, gLat);
    const cells = [];
    for (let c = 0; c < 11; c++) {
      for (let row = 0; row < 9; row++) {
        const v = 0.15 + r() * 0.85;
        cells.push(svg("rect", { x: 720 + c * 20, y: 40 + row * 20, width: 16, height: 16, rx: 3, fill: C.violet, opacity: 0, "data-o": v.toFixed(2) }, gLat));
      }
    }
    const latNote = svg("text", { x: 720, y: 246, fill: C.muted, "font-size": 13, "font-family": MONO, text: "un vector de números por token" }, gLat);

    // --- Question card + options
    const gQ = svg("g", {}, s);
    svg("rect", { x: 0, y: 300, width: 330, height: 100, rx: 16, fill: "rgba(34,211,238,0.07)", stroke: C.cyan, "stroke-width": 1.5 }, gQ);
    svg("text", { x: 18, y: 326, fill: C.cyan, "font-size": 14, "font-family": MONO, text: "PREGUNTA · choice" }, gQ);
    svg("text", { x: 18, y: 356, fill: "#fff", "font-size": 21, "font-family": "Inter", text: "¿Qué equipo debe" }, gQ);
    svg("text", { x: 18, y: 383, fill: "#fff", "font-size": 21, "font-family": "Inter", text: "atenderlo?" }, gQ);
    const optNames = ["billing", "technical", "sales"];
    let ox = 0;
    const optChips = optNames.map((o) => {
      const g = chip(gQ, ox, 418, o, { size: 16, color: "rgba(34,211,238,0.55)", fill: "rgba(34,211,238,0.08)" });
      ox += parseInt(g.dataset.w, 10) + 8;
      return g;
    });

    // --- Question/option vectors
    const gVec = svg("g", {}, s);
    svg("text", { x: 720, y: 300, fill: C.cyan, "font-size": 14, "font-family": MONO, text: "PREGUNTA + OPCIONES" }, gVec);
    const vecX = [725, 790, 850, 910];
    const vecLbl = ["pregunta", "billing", "techn.", "sales"];
    const vecCells = [];
    vecX.forEach((vx, k) => {
      for (let row = 0; row < 7; row++) {
        const v = 0.2 + r() * 0.8;
        vecCells.push(svg("rect", { x: vx, y: 316 + row * 20, width: 16, height: 16, rx: 3, fill: k === 0 ? C.cyan : C.markDm, opacity: 0, "data-o": v.toFixed(2) }, gVec));
      }
      svg("text", { x: vx + 8, y: 474, "text-anchor": "middle", fill: C.text2, "font-size": 12, "font-family": MONO, text: vecLbl[k] }, gVec);
    });

    // --- Decision head
    const gHead = svg("g", {}, s);
    const wLat = svg("path", { d: "M944 130 C 980 130, 970 260, 1000 260", stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, gHead);
    const wVec = svg("path", { d: "M944 390 C 980 390, 970 300, 1000 300", stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, gHead);
    const headBox = svg("rect", { x: 1000, y: 220, width: 140, height: 120, rx: 18, fill: "rgba(34,211,238,0.08)", stroke: C.cyan, "stroke-width": 2 }, gHead);
    svg("text", { x: 1070, y: 274, "text-anchor": "middle", fill: "#fff", "font-size": 20, "font-weight": 600, "font-family": DISPLAY, text: "Cabezal de" }, gHead);
    svg("text", { x: 1070, y: 300, "text-anchor": "middle", fill: "#fff", "font-size": 20, "font-weight": 600, "font-family": DISPLAY, text: "decisión" }, gHead);

    // --- Output: scores -> probabilities
    const gOut = svg("g", {}, s);
    const hdrScore = svg("text", { x: 1180, y: 176, fill: C.muted, "font-size": 14, "font-family": MONO, text: "PUNTUACIONES" }, gOut);
    const hdrProb = svg("text", { x: 1180, y: 176, fill: C.cyan, "font-size": 14, "font-family": MONO, text: "PROBABILIDADES (softmax)", opacity: 0 }, gOut);
    const scores = [2.1, 0.2, -4.0];
    const probs = DM.softmax(scores, 1);
    const outRows = optNames.map((o, i) => {
      const y = 210 + i * 62;
      const name = svg("text", { x: 1180, y, fill: C.text2, "font-size": 17, "font-family": MONO, text: o }, gOut);
      const sc = svg("text", { x: 1420, y, "text-anchor": "end", fill: C.text, "font-size": 17, "font-family": MONO, text: scores[i].toFixed(1) }, gOut);
      const pv = svg("text", { x: 1420, y, "text-anchor": "end", fill: C.text, "font-size": 17, "font-family": MONO, text: probs[i].toFixed(2), opacity: 0 }, gOut);
      const track = svg("rect", { x: 1180, y: y + 12, width: 240, height: 14, rx: 4, fill: "rgba(148,163,184,0.12)", opacity: 0 }, gOut);
      const bar = svg("rect", { x: 1180, y: y + 12, width: 0, height: 14, rx: 4, fill: i === 0 ? C.cyan : C.markDm, filter: i === 0 ? "url(#glow)" : "" }, gOut);
      return { name, sc, pv, track, bar, w: 240 * probs[i] };
    });
    const wOut = svg("path", { d: "M1140 280 L1172 280", stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, gOut);
    const gJson = svg("g", {}, s);
    svg("rect", { x: 1180, y: 410, width: 244, height: 84, rx: 14, fill: "rgba(3,7,15,0.8)", stroke: C.cyan, "stroke-width": 1.5 }, gJson);
    svg("text", { x: 1196, y: 444, fill: "#7dd3fc", "font-size": 15, "font-family": MONO, text: '"choice": "billing"' }, gJson);
    svg("text", { x: 1196, y: 474, fill: "#7dd3fc", "font-size": 15, "font-family": MONO, text: '"confidence": 0.8' }, gJson);

    // Initial visibility
    gsap.set([...tokChips, gBone, gLat, latNote, gQ, gVec, gHead, gOut, gJson], { opacity: 0 });

    // s0 · state
    tl.from(gState, { opacity: 0, x: -30, duration: 0.6 }, 0);
    showCap(0, 0);
    tl.addLabel("s0");

    // s1 · tokens
    showCap(1, "s0");
    tl.fromTo(tokChips, { opacity: 0, y: -24 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.4, ease: "back.out(1.6)" }, "s0+=0.2");
    tl.addLabel("s1");

    // s2 · backbone reads the tokens
    showCap(2, "s1");
    tl.to(gBone, { opacity: 1, duration: 0.5 }, "s1");
    tokChips.forEach((g, i) => {
      const bb = g.getBBox();
      tl.to(g, { x: 430 - bb.x, y: 470 - bb.y - (i % 3) * 10, opacity: 0, duration: 0.7, ease: "power2.in" }, `s1+=${0.4 + i * 0.05}`);
    });
    layers
      .slice()
      .reverse()
      .forEach((L, i) => {
        tl.to(L, { attr: { fill: "rgba(167,139,250,0.22)", stroke: C.violet }, duration: 0.25 }, `s1+=${1.2 + i * 0.15}`);
      });
    tl.addLabel("s2");

    // s3 · latent state
    showCap(3, "s2");
    tl.to(gLat, { opacity: 1, duration: 0.2 }, "s2");
    cells.forEach((c, i) => tl.to(c, { opacity: parseFloat(c.getAttribute("data-o")), duration: 0.3 }, `s2+=${0.1 + (i % 11) * 0.06 + Math.floor(i / 11) * 0.02}`));
    tl.to(latNote, { opacity: 1, duration: 0.4 }, "s2+=0.9");
    tl.addLabel("s3");

    // s4 · question joins
    showCap(4, "s3");
    tl.to(layers, { attr: { fill: "rgba(148,163,184,0.07)", stroke: C.lineStrong }, duration: 0.3 }, "s3");
    tl.fromTo(gQ, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5 }, "s3+=0.1");
    optChips.forEach((g, i) => tl.from(g, { opacity: 0, y: 10, duration: 0.3 }, `s3+=${0.5 + i * 0.1}`));
    const qWire = svg("path", { d: "M330 360 C 380 360, 380 300, 420 300", stroke: "none", fill: "none" }, s);
    DM.pulse(tl, s, qWire, tl.duration(), { color: C.cyan, duration: 0.5 });
    layers
      .slice()
      .reverse()
      .forEach((L, i) => tl.to(L, { attr: { fill: "rgba(34,211,238,0.18)", stroke: C.cyan }, duration: 0.2 }, `s3+=${1.4 + i * 0.1}`));
    tl.to(gVec, { opacity: 1, duration: 0.2 }, "s3+=1.9");
    vecCells.forEach((c, i) => tl.to(c, { opacity: parseFloat(c.getAttribute("data-o")), duration: 0.25 }, `s3+=${2.0 + Math.floor(i / 7) * 0.12 + (i % 7) * 0.02}`));
    tl.addLabel("s4");

    // s5 · decision head scores the options
    showCap(5, "s4");
    tl.to(gHead, { opacity: 1, duration: 0.4 }, "s4");
    DM.draw(tl, wLat, tl.labels.s4 + 0.2, 0.5);
    DM.draw(tl, wVec, tl.labels.s4 + 0.2, 0.5);
    DM.pulse(tl, s, wLat, tl.labels.s4 + 0.7, { color: C.violet, duration: 0.5 });
    DM.pulse(tl, s, wVec, tl.labels.s4 + 0.7, { color: C.cyan, duration: 0.5 });
    tl.to(headBox, { attr: { fill: "rgba(34,211,238,0.3)" }, duration: 0.2, yoyo: true, repeat: 1 }, "s4+=1.2");
    tl.to(gOut, { opacity: 1, duration: 0.01 }, "s4+=1.4");
    tl.from([hdrScore, ...outRows.flatMap((o) => [o.name, o.sc])], { opacity: 0, x: -10, stagger: 0.08, duration: 0.3 }, "s4+=1.4");
    tl.from(wOut, { opacity: 0, duration: 0.3 }, "s4+=1.4");
    tl.addLabel("s5");

    // s6 · softmax -> probabilities -> typed answer
    showCap(6, "s5");
    tl.to(hdrScore, { opacity: 0, duration: 0.3 }, "s5");
    tl.to(hdrProb, { opacity: 1, duration: 0.3 }, "s5+=0.2");
    outRows.forEach((o, i) => {
      tl.to(o.sc, { opacity: 0, duration: 0.3 }, "s5");
      tl.to([o.pv, o.track], { opacity: 1, duration: 0.3 }, "s5+=0.2");
      tl.to(o.bar, { attr: { width: o.w }, duration: 0.8, ease: "power3.out" }, `s5+=${0.3 + i * 0.1}`);
    });
    tl.fromTo(gJson, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }, "s5+=1.1");
    tl.addLabel("s6");
    return { tl };
  };

  /* 10 · One state, many questions */
  anims.fanout = function (slide) {
    const s = DM.stageSvg(slide.querySelector("#fan-stage"), 820, 640);
    const tl = gsap.timeline({ paused: true });
    const r = rng(3);
    const cx = 410,
      cy = 320;
    const gC = svg("g", {}, s);
    const dots = [];
    for (let i = 0; i < 46; i++) {
      const a = r() * Math.PI * 2,
        d = Math.sqrt(r()) * 62;
      dots.push(svg("circle", { cx: cx + Math.cos(a) * d, cy: cy + Math.sin(a) * d, r: 2 + r() * 3, fill: r() < 0.7 ? C.violet : C.cyan, opacity: 0.85, filter: "url(#glow)" }, gC));
    }
    svg("text", { x: cx + 78, y: cy + 5, "text-anchor": "start", fill: C.violet, "font-size": 15, "font-family": MONO, text: "estado latente" }, gC);

    const qs = [
      ["¿Es urgente?", "noul", "0.95"],
      ["¿Qué equipo?", "choice", "billing"],
      ["¿Frustración?", "score", "1.04"],
      ["¿Pide reembolso?", "noul", "0.12"],
      ["¿Riesgo de baja?", "score", "0.71"],
      ["¿Idioma?", "choice", "en"],
    ];
    const R = 236;
    const nodes = qs.map(([q, type, ans], i) => {
      const a = (-90 + i * 60) * (Math.PI / 180);
      const nx = cx + Math.cos(a) * R,
        ny = cy + Math.sin(a) * R;
      const ray = svg("path", { d: `M${cx + Math.cos(a) * 72} ${cy + Math.sin(a) * 72} L${cx + Math.cos(a) * (R - 46)} ${cy + Math.sin(a) * (R - 46)}`, stroke: C.lineStrong, "stroke-width": 2, fill: "none" }, s);
      const g = svg("g", {}, s);
      svg("rect", { x: nx - 102, y: ny - 42, width: 204, height: 84, rx: 14, fill: "rgba(11,16,32,0.92)", stroke: C.cyan, "stroke-width": 1.4 }, g);
      svg("text", { x: nx, y: ny - 12, "text-anchor": "middle", fill: "#fff", "font-size": 18, "font-family": "Inter", "font-weight": 500, text: q }, g);
      svg("text", { x: nx - 90, y: ny + 24, fill: C.cyan, "font-size": 13, "font-family": MONO, text: type }, g);
      const an = svg("text", { x: nx + 90, y: ny + 25, "text-anchor": "end", fill: "#fcd34d", "font-size": 17, "font-family": MONO, text: ans }, g);
      return { ray, g, an };
    });
    const qCount = slide.querySelector("#fan-qs");
    const reads = slide.querySelector("#fan-reads");
    qCount.textContent = "0";

    tl.from(dots, { opacity: 0, scale: 0, transformOrigin: "center", stagger: 0.01, duration: 0.4 }, 0);
    tl.from(reads, { opacity: 0, scale: 0.6, duration: 0.5, ease: "back.out(2)" }, 0.6);
    const t0 = 1.3;
    nodes.forEach((n) => {
      DM.draw(tl, n.ray, t0, 0.5);
      DM.pulse(tl, s, n.ray, t0 + 0.1, { color: C.violet, duration: 0.5, r: 5 });
      tl.from(n.g, { opacity: 0, scale: 0.85, transformOrigin: "50% 50%", duration: 0.45, ease: "back.out(1.6)" }, t0 + 0.4);
      tl.from(n.an, { opacity: 0, duration: 0.4 }, t0 + 1.0);
    });
    const qc = { v: 0 };
    tl.to(qc, { v: 6, duration: 0.5, ease: "steps(6)", onUpdate: () => (qCount.textContent = Math.round(qc.v)) }, t0 + 0.6);
    const loops = dots.map((d) => gsap.to(d, { x: (r() - 0.5) * 10, y: (r() - 0.5) * 10, duration: 1.2 + r(), repeat: -1, yoyo: true, ease: "sine.inOut" }));
    return { tl, destroy: () => loops.forEach((l) => l.kill()) };
  };

  /* 11 · Three flavours (+ black box) */
  anims.flavors = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const loops = [];
    tl.from(slide.querySelectorAll(".fl-card"), { opacity: 0, y: 30, stagger: 0.18, duration: 0.6 }, 0.1);
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 20, duration: 0.6 }, 1.0);

    const prep = (id) => {
      const el = slide.querySelector(id);
      el.innerHTML = "";
      DM.glowFilter(el);
      return el;
    };
    const txt = (p, x, y, t, o) => svg("text", Object.assign({ x, y, "text-anchor": "middle", fill: "#fff", "font-size": 18, "font-family": DISPLAY, text: t }, o || {}), p);

    // Kev: frozen LLM + LoRA strip + pointer head
    const k = prep("#fl-kev");
    svg("rect", { x: 8, y: 40, width: 178, height: 120, rx: 14, fill: "rgba(148,163,184,0.07)", stroke: C.lineStrong, "stroke-width": 1.4 }, k);
    txt(k, 97, 98, "LLM Qwen", { "font-weight": 600, "font-size": 20 });
    txt(k, 97, 124, "congelado", { fill: C.muted, "font-size": 14, "font-family": MONO });
    svg("rect", { x: 150, y: 50, width: 22, height: 16, rx: 3, fill: "none", stroke: C.muted, "stroke-width": 2 }, k);
    svg("path", { d: "M154 50 v-6 a7 7 0 0 1 14 0 v6", fill: "none", stroke: C.muted, "stroke-width": 2 }, k);
    const lora = svg("rect", { x: 190, y: 40, width: 14, height: 120, rx: 4, fill: C.cyan, filter: "url(#glow)" }, k);
    txt(k, 197, 30, "LoRA", { fill: C.cyan, "font-size": 13, "font-family": MONO });
    svg("path", { d: "M208 100 L232 100", stroke: C.lineStrong, "stroke-width": 2 }, k);
    const head = svg("circle", { cx: 258, cy: 100, r: 24, fill: "rgba(34,211,238,0.1)", stroke: C.cyan, "stroke-width": 2 }, k);
    txt(k, 258, 106, "p", { fill: C.cyan, "font-family": MONO });
    const kPath = svg("path", { d: "M14 100 L258 100", fill: "none", stroke: "none" }, k);
    const kDot = svg("circle", { r: 5, fill: C.violet, filter: "url(#glow)" }, k);
    const kp = { t: 0 };
    const kL = kPath.getTotalLength();
    loops.push(
      gsap.to(kp, { t: 1, duration: 1.8, repeat: -1, ease: "none", onUpdate: () => { const p = kPath.getPointAtLength(kp.t * kL); kDot.setAttribute("cx", p.x); kDot.setAttribute("cy", p.y); } }),
      gsap.to(lora, { opacity: 0.45, duration: 0.9, yoyo: true, repeat: -1 }),
      gsap.to(head, { attr: { r: 27 }, duration: 0.9, yoyo: true, repeat: -1 }),
    );

    // Laya: bidirectional encoder + typed heads
    const l = prep("#fl-laya");
    svg("rect", { x: 10, y: 40, width: 200, height: 120, rx: 14, fill: "rgba(148,163,184,0.07)", stroke: C.lineStrong, "stroke-width": 1.4 }, l);
    txt(l, 110, 98, "Encoder", { "font-weight": 600, "font-size": 20 });
    txt(l, 110, 124, "lee en ambos sentidos", { fill: C.muted, "font-size": 13, "font-family": MONO });
    const d1 = svg("circle", { cx: 20, cy: 62, r: 5, fill: C.violet, filter: "url(#glow)" }, l);
    const d2 = svg("circle", { cx: 200, cy: 142, r: 5, fill: C.cyan, filter: "url(#glow)" }, l);
    ["choice", "score", "noul"].forEach((t, i) => {
      svg("path", { d: `M210 100 L236 ${62 + i * 38}`, stroke: C.line, "stroke-width": 1.5 }, l);
      svg("rect", { x: 236, y: 50 + i * 38, width: 60, height: 26, rx: 6, fill: "rgba(34,211,238,0.1)", stroke: C.cyan, "stroke-width": 1.2, class: "lh" }, l);
      txt(l, 266, 68 + i * 38, t, { fill: C.text, "font-size": 12, "font-family": MONO });
    });
    loops.push(
      gsap.to(d1, { attr: { cx: 200 }, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" }),
      gsap.to(d2, { attr: { cx: 20 }, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" }),
      gsap.to(l.querySelectorAll(".lh"), { attr: { fill: "rgba(34,211,238,0.35)" }, duration: 0.5, stagger: 0.25, repeat: -1, yoyo: true }),
    );

    // CLM: two towers -> shared space, nearest option wins
    const c = prep("#fl-clm");
    svg("rect", { x: 6, y: 34, width: 70, height: 54, rx: 10, fill: "rgba(167,139,250,0.1)", stroke: C.violet, "stroke-width": 1.3 }, c);
    txt(c, 41, 66, "estado", { "font-size": 11, "font-family": MONO });
    svg("rect", { x: 6, y: 112, width: 70, height: 54, rx: 10, fill: "rgba(34,211,238,0.1)", stroke: C.cyan, "stroke-width": 1.3 }, c);
    txt(c, 41, 144, "opciones", { "font-size": 11, "font-family": MONO });
    svg("path", { d: "M78 61 L104 80 M78 139 L104 120", stroke: C.line, "stroke-width": 1.5 }, c);
    svg("rect", { x: 106, y: 14, width: 188, height: 172, rx: 14, fill: "rgba(148,163,184,0.04)", stroke: C.line, "stroke-width": 1.2, "stroke-dasharray": "4 4" }, c);
    const optsXY = [
      [150, 52],
      [256, 74],
      [178, 156],
    ];
    const optDots = optsXY.map(([x, y]) => svg("circle", { cx: x, cy: y, r: 7, fill: C.markDm }, c));
    const link = svg("line", { x1: 0, y1: 0, x2: 0, y2: 0, stroke: C.cyan, "stroke-width": 2, "stroke-dasharray": "3 3" }, c);
    const st = svg("circle", { cx: 200, cy: 100, r: 8, fill: C.violet, filter: "url(#glow)" }, c);
    const sp = { x: 200, y: 100 };
    const nearest = () => {
      let best = 0,
        bd = 1e9;
      optsXY.forEach(([x, y], i) => {
        const d = Math.hypot(x - sp.x, y - sp.y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      st.setAttribute("cx", sp.x);
      st.setAttribute("cy", sp.y);
      link.setAttribute("x1", sp.x);
      link.setAttribute("y1", sp.y);
      link.setAttribute("x2", optsXY[best][0]);
      link.setAttribute("y2", optsXY[best][1]);
      optDots.forEach((d, i) => {
        d.setAttribute("fill", i === best ? C.cyan : C.markDm);
        d.setAttribute("r", i === best ? 10 : 7);
      });
    };
    nearest();
    const path = [
      [168, 88],
      [236, 104],
      [196, 140],
      [200, 100],
    ];
    const ctl = gsap.timeline({ repeat: -1 });
    path.forEach(([x, y]) => ctl.to(sp, { x, y, duration: 1.1, ease: "sine.inOut", onUpdate: nearest }).to({}, { duration: 0.5 }));
    loops.push(ctl);

    // Black box
    const b = prep("#fl-box");
    svg("rect", { x: 40, y: 26, width: 220, height: 148, rx: 16, fill: "rgba(251,146,60,0.04)", stroke: C.orange, "stroke-width": 1.4, "stroke-dasharray": "6 6" }, b);
    const q = txt(b, 150, 120, "?", { "font-size": 84, "font-weight": 700, fill: C.orange, filter: "url(#glow)" });
    txt(b, 150, 196, "arquitectura no publicada", { fill: C.muted, "font-size": 13, "font-family": MONO });
    loops.push(gsap.fromTo(q, { opacity: 0.35 }, { opacity: 1, duration: 1.2, yoyo: true, repeat: -1, ease: "sine.inOut" }));

    return { tl, destroy: () => loops.forEach((x) => x.kill()) };
  };
})();
