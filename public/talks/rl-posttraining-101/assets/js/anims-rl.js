/* Animations · opening, RL 101 and the RL ↔ LLM bridge. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  const txt = (parent, x, y, text, o) =>
    svg("text", Object.assign({ x, y, fill: C.text, "font-size": 20, "font-family": Deck.BODY, text }, o || {}), parent);

  const box = (parent, x, y, w, h, o) =>
    svg("rect", Object.assign({ x, y, width: w, height: h, rx: 22, fill: C.panel, stroke: C.line, "stroke-width": 1.5 }, o || {}), parent);

  /* ---------- Opening ---------- */

  anims.cover = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".kicker"), { opacity: 0, x: -30, duration: 0.6 })
      .from(slide.querySelector("h1"), { opacity: 0, y: 40, duration: 0.9, ease: "power3.out" }, 0.15)
      .from(slide.querySelector(".sub"), { opacity: 0, y: 20, duration: 0.7 }, 0.55)
      .from(slide.querySelectorAll(".tags .tag"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 }, 0.85)
      .from(slide.querySelector(".replay-hint"), { opacity: 0, duration: 0.6 }, 1.6);
    return { tl };
  };

  anims.divider = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".num"), { opacity: 0, x: -20, duration: 0.5 })
      .from(slide.querySelector("h2"), { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" }, 0.1)
      .from(slide.querySelector("p"), { opacity: 0, y: 16, duration: 0.6 }, 0.45)
      .from(slide.querySelector(".deco"), { opacity: 0, scale: 0.6, rotate: -12, duration: 0.9, ease: "back.out(1.6)" }, 0.3);
    return { tl };
  };

  anims.hook = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const base = slide.querySelector("#hook-base");
    const chat = slide.querySelector("#hook-chat");
    const baseText = "¿Cómo preparo un café espresso? ¿Cómo preparo un café con leche? ¿Cuántos cafés al día son saludables? Ver más preguntas en el foro…";
    const chatText = "1. Muele 15 g de café (grano medio).\n2. Calienta agua a 92–96 °C.\n3. Moja el filtro y vierte en espiral 250 ml.\n4. Espera unos 3 minutos y ¡listo! ☕";
    chat.style.whiteSpace = "pre-line";
    base.textContent = "";
    chat.textContent = "";
    tl.from(slide.querySelectorAll(".chat"), { opacity: 0, y: 24, stagger: 0.15, duration: 0.6 }, 0);
    tl.add(Deck.type(base, baseText, 60), 0.7);
    tl.add(Deck.type(chat, chatText, 60), 0.9);
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 16, duration: 0.6 }, 3.4);
    return { tl };
  };

  anims.where = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const parts = slide.querySelectorAll(".pipe > *");
    tl.from(parts, { opacity: 0, x: -20, stagger: 0.12, duration: 0.5 }, 0);
    tl.from(slide.querySelector(".bracket"), { opacity: 0, scaleX: 0, transformOrigin: "left center", duration: 0.7 }, 1.0);
    tl.from(slide.querySelectorAll(".grid-3 .card"), { opacity: 0, y: 20, stagger: 0.15, duration: 0.5 }, 1.5);
    return { tl };
  };

  /* ---------- RL 101 ---------- */

  /* Stepped: agent ↔ environment loop with the dog-and-cookie analogy. */
  anims.loop = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#loop-stage"), 1424, 440);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#loop-cap"), [
      "El <strong>agente</strong> (el perro) observa el <strong>estado</strong> del <strong>entorno</strong>: tu mano levantada.",
      "Elige una <strong>acción</strong> según su <strong>política</strong>: se sienta.",
      "El entorno responde con un <strong>nuevo estado</strong> y una <strong>recompensa</strong>: 🍪 +1.",
      "Repetido muchas veces, la política aprende <strong>qué acciones traen más galletas</strong> a la larga.",
    ]);

    const ag = svg("g", {}, s);
    box(ag, 170, 120, 330, 200, { stroke: C.accent, "stroke-width": 2.5 });
    txt(ag, 335, 195, "🐕", { "text-anchor": "middle", "font-size": 60 });
    txt(ag, 335, 250, "Agente", { "text-anchor": "middle", "font-size": 32, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });
    txt(ag, 335, 284, "política π(a|s)", { "text-anchor": "middle", "font-size": 18, "font-family": Deck.MONO, fill: C.accent });

    const en = svg("g", {}, s);
    box(en, 924, 120, 330, 200, { stroke: C.accent2, "stroke-width": 2.5 });
    txt(en, 1089, 195, "🌍", { "text-anchor": "middle", "font-size": 60 });
    txt(en, 1089, 250, "Entorno", { "text-anchor": "middle", "font-size": 32, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });
    txt(en, 1089, 284, "el mundo + tú", { "text-anchor": "middle", "font-size": 18, "font-family": Deck.MONO, fill: C.accent2 });

    const top = svg("path", { d: "M500 170 C 640 40, 790 40, 924 170", stroke: C.accent, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, s);
    const bot = svg("path", { d: "M924 270 C 790 400, 640 400, 500 270", stroke: C.accent2, "stroke-width": 3, fill: "none", "stroke-linecap": "round" }, s);
    const lTop = svg("g", { opacity: 0 }, s);
    txt(lTop, 712, 52, "acción aₜ · «se sienta»", { "text-anchor": "middle", "font-size": 22, "font-family": Deck.MONO, fill: C.accent });
    const lBot = svg("g", { opacity: 0 }, s);
    txt(lBot, 712, 418, "estado sₜ₊₁ + recompensa rₜ₊₁ · 🍪 +1", { "text-anchor": "middle", "font-size": 22, "font-family": Deck.MONO, fill: C.accent2 });
    const cookie = txt(s, 470, 135, "🍪", { "font-size": 40, opacity: 0 });
    const cnt = txt(s, 335, 360, "galletas: 0", { "text-anchor": "middle", "font-size": 20, "font-family": Deck.MONO, fill: C.text2, opacity: 0 });

    gsap.set([top, bot], { opacity: 0 });

    tl.from(ag, { opacity: 0, x: -30, duration: 0.6 }, 0);
    tl.from(en, { opacity: 0, x: 30, duration: 0.6 }, 0.15);
    show(0, 0);
    tl.addLabel("s0");

    show(1, "s0");
    tl.set(top, { opacity: 1 }, "s0");
    Deck.draw(tl, top, tl.labels.s0, 0.7);
    tl.to(lTop, { opacity: 1, duration: 0.4 }, "s0+=0.4");
    Deck.pulse(tl, s, top, tl.labels.s0 + 0.6, { color: C.accent, r: 8 });
    tl.addLabel("s1");

    show(2, "s1");
    tl.set(bot, { opacity: 1 }, "s1");
    Deck.draw(tl, bot, tl.labels.s1, 0.7);
    tl.to(lBot, { opacity: 1, duration: 0.4 }, "s1+=0.4");
    Deck.pulse(tl, s, bot, tl.labels.s1 + 0.6, { color: C.accent2, r: 8 });
    tl.fromTo(cookie, { opacity: 0, scale: 0.3, transformOrigin: "center" }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }, "s1+=1.4");
    tl.to(cnt, { opacity: 1, duration: 0.3 }, "s1+=1.4");
    Deck.count(tl, cnt, 1, tl.labels.s1 + 1.4, { duration: 0.2, steps: true, format: (v) => `galletas: ${v}` });
    tl.addLabel("s2");

    show(3, "s2");
    for (let i = 0; i < 4; i++) {
      const t0 = tl.labels.s2 + i * 0.9;
      Deck.pulse(tl, s, top, t0, { color: C.accent, r: 7, duration: 0.45 });
      Deck.pulse(tl, s, bot, t0 + 0.45, { color: C.accent2, r: 7, duration: 0.45 });
    }
    Deck.count(tl, cnt, 5, tl.labels.s2 + 0.9, { from: 1, duration: 3.0, steps: true, format: (v) => `galletas: ${v}` });
    tl.addLabel("s3");
    return { tl };
  };

  anims.vocab = Deck.simple([".vocab .card", ".card.dim"], { stagger: 0.12 });

  /* Interactive: discounted return with a γ slider. */
  anims.gamma = function (slide, { signal }) {
    const s = Deck.stageSvg(slide.querySelector("#gamma-stage"), 1424, 330);
    const input = slide.querySelector("#gamma-in");
    const out = slide.querySelector("#gamma-out");
    const R = [0, 1, 0, 0, 1, 0, 0, 5];
    const colW = 128;
    const x0 = 20;
    const base = 270;
    const maxH = 160;
    const bars = [];
    const contrib = [];
    R.forEach((r, t) => {
      const cx = x0 + t * colW + colW / 2;
      txt(s, cx, 30, `t = ${t}`, { "text-anchor": "middle", "font-size": 17, "font-family": Deck.MONO, fill: C.muted });
      txt(s, cx, 72, r === 0 ? "·" : "🍪".repeat(Math.min(r, 1)) + (r > 1 ? ` ×${r}` : ""), { "text-anchor": "middle", "font-size": r ? 26 : 30, fill: C.text2 });
      svg("rect", { x: cx - 30, y: base - maxH, width: 60, height: maxH, rx: 6, fill: "rgba(92,64,43,0.06)" }, s);
      bars.push(svg("rect", { x: cx - 30, y: base, width: 60, height: 0, rx: 4, fill: C.accent }, s));
      contrib.push(txt(s, cx, base + 34, "", { "text-anchor": "middle", "font-size": 18, "font-family": Deck.MONO, fill: C.text }));
    });
    txt(s, x0, base + 60, "barra = peso γᵗ · debajo: contribución γᵗ·rₜ", { "font-size": 16, "font-family": Deck.MONO, fill: C.muted });
    const gx = x0 + 8 * colW + 40;
    box(s, gx, 70, 1424 - gx - 6, 200, { stroke: C.accent, "stroke-width": 2 });
    txt(s, gx + (1424 - gx) / 2, 130, "retorno G", { "text-anchor": "middle", "font-size": 22, "font-family": Deck.MONO, fill: C.muted });
    const gOut = txt(s, gx + (1424 - gx) / 2, 215, "0.00", { "text-anchor": "middle", "font-size": 72, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.accent });

    const st = { g: 0.5 };
    function render() {
      let G = 0;
      R.forEach((r, t) => {
        const w = Math.pow(st.g, t);
        const h = maxH * w;
        bars[t].setAttribute("y", base - h);
        bars[t].setAttribute("height", h);
        bars[t].setAttribute("fill", r ? C.accent : "rgba(192,88,47,0.35)");
        contrib[t].textContent = r ? (w * r).toFixed(2) : "0";
        G += w * r;
      });
      gOut.textContent = G.toFixed(2);
      out.textContent = st.g.toFixed(2);
      input.value = Math.round(st.g * 100);
    }
    input.addEventListener("input", () => ((st.g = input.value / 100), render()), { signal });
    slide.querySelectorAll("[data-g]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { g: b.dataset.g / 100, duration: 0.8, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(s, { opacity: 0, y: 20, duration: 0.6 }, 0);
    tl.to(st, { g: 0.9, duration: 1.8, ease: "power2.inOut", onUpdate: render }, 0.8);
    return { tl };
  };

  /* Stepped: value as expectation, advantage as surprise (exam grades). */
  anims.advantage = function (slide) {
    const W = 790;
    const s = Deck.stageSvg(slide.querySelector("#adv-stage"), W, 470);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#adv-cap"), [
      "Antes del examen <strong>esperabas un 6</strong>: eso es el valor V(s), lo que sueles sacar desde aquí.",
      "Sacas un <strong>8</strong>: ventaja <strong class='ok-c'>+2</strong>. Lo que hiciste merece <strong>reforzarse</strong>.",
      "Sacas un <strong>4</strong>: ventaja <strong class='ko-c'>−2</strong>. Lo que hiciste merece <strong>debilitarse</strong>.",
      "Sacas justo un <strong>6</strong>: ventaja <strong>0</strong>. Ni premio ni castigo: <strong>nada que aprender</strong>.",
    ]);
    const L = 50;
    const Rr = W - 30;
    const X = (v) => L + ((Rr - L) * v) / 10;
    const axisY = 420;
    svg("line", { x1: L, x2: Rr, y1: axisY, y2: axisY, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    for (let v = 0; v <= 10; v += 2) {
      svg("line", { x1: X(v), x2: X(v), y1: axisY, y2: axisY + 8, stroke: C.lineStrong }, s);
      txt(s, X(v), axisY + 32, String(v), { "text-anchor": "middle", "font-size": 18, "font-family": Deck.MONO, fill: C.muted });
    }
    const exp = svg("g", {}, s);
    svg("line", { x1: X(6), x2: X(6), y1: 40, y2: axisY, stroke: C.accent2, "stroke-width": 2.5, "stroke-dasharray": "8 6" }, exp);
    txt(exp, X(6), 28, "V(s) · esperaba 6", { "text-anchor": "middle", "font-size": 19, "font-family": Deck.MONO, fill: C.accent2 });

    const row = (y, v, label, color) => {
      const g = svg("g", { opacity: 0 }, s);
      txt(g, L - 4, y + 6, label, { "font-size": 18, "font-family": Deck.MONO, fill: C.muted });
      const arr = svg("line", { x1: X(6), x2: X(v), y1: y, y2: y, stroke: color, "stroke-width": 6, "stroke-linecap": "round" }, g);
      svg("circle", { cx: X(v), cy: y, r: 13, fill: color, stroke: C.bg2, "stroke-width": 3 }, g);
      const d = v - 6;
      txt(g, X(v) + (d >= 0 ? 24 : -24), y + 7, d === 0 ? "A = 0" : `A = ${d > 0 ? "+" : "−"}${Math.abs(d)}`, { "text-anchor": d >= 0 ? "start" : "end", "font-size": 22, "font-family": Deck.MONO, "font-weight": 600, fill: C.text });
      return { g, arr };
    };
    const r1 = row(130, 8, "", C.good);
    const r2 = row(230, 4, "", C.bad);
    const r3 = row(330, 6, "", C.muted);

    tl.from(exp, { opacity: 0, duration: 0.6 }, 0.1);
    show(0, 0);
    tl.addLabel("s0");
    [r1, r2, r3].forEach((r, i) => {
      show(i + 1, `s${i}`);
      tl.to(r.g, { opacity: 1, duration: 0.3 }, `s${i}`);
      tl.from(r.arr, { attr: { x2: 0 + (Number(r.arr.getAttribute("x1"))) }, duration: 0.6, ease: "power2.out" }, `s${i}+=0.1`);
      tl.addLabel(`s${i + 1}`);
    });
    return { tl };
  };

  /* Interactive: softmax temperature as the exploration knob. */
  anims.temp = function (slide, { signal }) {
    const input = slide.querySelector("#temp-in");
    const out = slide.querySelector("#temp-out");
    const fills = slide.querySelectorAll("#temp-bars .fill");
    const vals = slide.querySelectorAll("#temp-bars .val");
    const logits = [3.0, 2.2, 1.4, 0.6, -1.0];
    const st = { t: 1 };
    function render() {
      const e = logits.map((z) => Math.exp(z / st.t));
      const sum = e.reduce((a, b) => a + b, 0);
      e.forEach((v, i) => {
        const p = v / sum;
        fills[i].style.width = `${(p * 100).toFixed(1)}%`;
        vals[i].textContent = p.toFixed(2);
      });
      out.textContent = st.t.toFixed(2);
      input.value = Math.round(st.t * 100);
    }
    input.addEventListener("input", () => ((st.t = input.value / 100), render()), { signal });
    slide.querySelectorAll("[data-t]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { t: b.dataset.t / 100, duration: 0.8, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".card"), { opacity: 0, x: 20, stagger: 0.15, duration: 0.5 }, 0);
    tl.to(st, { t: 0.3, duration: 1.2, ease: "power2.inOut", onUpdate: render }, 0.6);
    tl.to(st, { t: 1.8, duration: 1.6, ease: "power2.inOut", onUpdate: render }, 2.0);
    return { tl };
  };

  /* Stepped: policy gradient nudges probabilities by the sign of the advantage. */
  anims.pg = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#pg-stage"), 1424, 400);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#pg-cap"), [
      "La política reparte probabilidad entre posibles respuestas. Al principio, a partes iguales.",
      "Muestreamos <strong>A</strong>: recompensa alta, <strong class='ok-c'>ventaja +</strong> → su probabilidad <strong>sube</strong>.",
      "Muestreamos <strong>C</strong>: recompensa baja, <strong class='ko-c'>ventaja −</strong> → su probabilidad <strong>baja</strong>.",
      "Repetido con miles de prompts y muestras, la política se desplaza hacia lo que puntúa bien. <strong>Eso es todo el RL de LLMs.</strong>",
    ]);
    const labels = ["A · receta clara y correcta", "B · receta correcta pero larga", "C · respuesta grosera", "D · se va por las ramas"];
    const x0 = 430;
    const scale = 1300;
    const rows = labels.map((l, i) => {
      const y = 30 + i * 90;
      const hl = svg("rect", { x: 0, y: y - 12, width: 1190, height: 72, rx: 16, fill: "rgba(192,88,47,0.08)", opacity: 0 }, s);
      txt(s, 16, y + 32, l, { "font-size": 24, fill: C.heading });
      svg("rect", { x: x0, y: y + 10, width: 650, height: 28, rx: 6, fill: "rgba(92,64,43,0.07)" }, s);
      const bar = svg("rect", { x: x0, y: y + 10, width: 0, height: 28, rx: 4, fill: C.markB }, s);
      const val = txt(s, x0, y + 32, "", { "font-size": 20, "font-family": Deck.MONO, fill: C.text });
      return { hl, bar, val };
    });
    const badge = svg("g", { opacity: 0 }, s);
    box(badge, 1220, 110, 200, 170, { stroke: C.accent, "stroke-width": 2 });
    const bTitle = txt(badge, 1320, 160, "", { "text-anchor": "middle", "font-size": 18, "font-family": Deck.MONO, fill: C.muted });
    const bBody = txt(badge, 1320, 215, "", { "text-anchor": "middle", "font-size": 34, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.text });
    const bSub = txt(badge, 1320, 252, "", { "text-anchor": "middle", "font-size": 18, "font-family": Deck.MONO, fill: C.text2 });

    const st = { p0: 0.25, p1: 0.25, p2: 0.25, p3: 0.25, k: 0 };
    function render() {
      [st.p0, st.p1, st.p2, st.p3].forEach((p, i) => {
        const w = p * scale;
        rows[i].bar.setAttribute("width", w);
        rows[i].val.setAttribute("x", x0 + w + 12);
        rows[i].val.textContent = p.toFixed(2);
      });
      const k = Math.round(st.k);
      bTitle.textContent = k === 2 ? "muestra C" : "muestra A";
      bBody.textContent = k === 2 ? "r = 0.1" : "r = 0.9";
      bSub.textContent = k === 2 ? "ventaja −" : "ventaja +";
      bBody.setAttribute("fill", k === 2 ? C.bad : C.good);
    }
    render();

    tl.from(s, { opacity: 0, duration: 0.5 }, 0);
    show(0, 0);
    tl.addLabel("s0");

    show(1, "s0");
    tl.to(st, { k: 1, duration: 0.01, onUpdate: render }, "s0");
    tl.to(badge, { opacity: 1, duration: 0.3 }, "s0");
    tl.to(rows[0].hl, { opacity: 1, duration: 0.3 }, "s0");
    tl.to(st, { p0: 0.4, p1: 0.2, p2: 0.2, p3: 0.2, duration: 1.0, ease: "power2.inOut", onUpdate: render }, "s0+=0.5");
    tl.addLabel("s1");

    show(2, "s1");
    tl.to(rows[0].hl, { opacity: 0, duration: 0.3 }, "s1");
    tl.to(rows[2].hl, { opacity: 1, duration: 0.3 }, "s1");
    tl.to(st, { k: 2, duration: 0.01, onUpdate: render }, "s1");
    tl.to(st, { p0: 0.45, p1: 0.25, p2: 0.07, p3: 0.23, duration: 1.0, ease: "power2.inOut", onUpdate: render }, "s1+=0.5");
    tl.addLabel("s2");

    show(3, "s2");
    tl.to([rows[2].hl, badge], { opacity: 0, duration: 0.3 }, "s2");
    tl.to(st, { p0: 0.62, p1: 0.27, p2: 0.02, p3: 0.09, duration: 1.4, ease: "power2.inOut", onUpdate: render }, "s2+=0.3");
    tl.addLabel("s3");
    return { tl };
  };

  anims.actorcritic = Deck.simple([".grid-3 .card", ".callout"], { stagger: 0.18 });

  /* Interactive: exact PPO clipped objective vs ratio, with ε and sign of A. */
  anims.ppo = function (slide, { signal }) {
    const W = 760;
    const H = 440;
    const stage = slide.querySelector("#ppo-stage");
    const tip = Deck.tooltip(slide.querySelector("#ppo-tip"), stage);
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" });
    stage.insertBefore(s, stage.firstChild);
    Deck.glowFilter(s);
    const m = { l: 64, r: 16, t: 16, b: 56 };
    const X = (r) => m.l + ((W - m.l - m.r) * r) / 2;
    const Y = (v) => m.t + ((H - m.t - m.b) * (2 - v)) / 4;
    const band = svg("rect", { y: m.t, height: H - m.t - m.b, fill: "rgba(95,138,107,0.12)" }, s);
    for (let v = -2; v <= 2; v++) {
      svg("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), stroke: v === 0 ? C.lineStrong : C.line, "stroke-width": v === 0 ? 1.5 : 1 }, s);
      txt(s, m.l - 12, Y(v) + 6, String(v), { "text-anchor": "end", "font-size": 16, "font-family": Deck.MONO, fill: C.muted });
    }
    [0, 0.5, 1, 1.5, 2].forEach((r) => txt(s, X(r), H - m.b + 26, String(r), { "text-anchor": "middle", "font-size": 16, "font-family": Deck.MONO, fill: C.muted }));
    txt(s, (m.l + W - m.r) / 2, H - 6, "ρ = π nuevo / π viejo", { "text-anchor": "middle", "font-size": 17, "font-family": Deck.MONO, fill: C.text2 });
    txt(s, 14, m.t + 4, "L", { "font-size": 18, "font-family": Deck.MONO, fill: C.text2 });
    const bandLbl = txt(s, 0, m.t + 22, "", { "text-anchor": "middle", "font-size": 15, "font-family": Deck.MONO, fill: C.accent2 });
    const raw = svg("path", { stroke: C.muted, "stroke-width": 2, "stroke-dasharray": "6 6", fill: "none" }, s);
    const clipd = svg("path", { stroke: C.accent, "stroke-width": 3.5, fill: "none", "stroke-linejoin": "round" }, s);
    const lblRaw = txt(s, 0, 0, "sin clip: ρ·A", { "font-size": 16, "font-family": Deck.MONO, fill: C.text2 });
    const lblClip = txt(s, 0, 0, "PPO", { "font-size": 18, "font-family": Deck.MONO, "font-weight": 600, fill: C.text });
    const hover = svg("circle", { r: 7, fill: C.accent, stroke: C.bg2, "stroke-width": 2, opacity: 0 }, s);
    const hit = svg("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent" }, s);

    const epsIn = slide.querySelector("#ppo-eps");
    const epsOut = slide.querySelector("#ppo-eps-out");
    const st = { eps: 0.45, a: 1 };
    const f = (r) => Math.min(r * st.a, Math.min(Math.max(r, 1 - st.eps), 1 + st.eps) * st.a);
    function render() {
      let d1 = "";
      let d2 = "";
      for (let i = 0; i <= 200; i++) {
        const r = (2 * i) / 200;
        d1 += `${i ? "L" : "M"}${X(r).toFixed(1)} ${Y(r * st.a).toFixed(1)}`;
        d2 += `${i ? "L" : "M"}${X(r).toFixed(1)} ${Y(f(r)).toFixed(1)}`;
      }
      raw.setAttribute("d", d1);
      clipd.setAttribute("d", d2);
      band.setAttribute("x", X(1 - st.eps));
      band.setAttribute("width", X(1 + st.eps) - X(1 - st.eps));
      bandLbl.setAttribute("x", X(1));
      bandLbl.textContent = `1 ± ε`;
      const up = st.a >= 0;
      lblRaw.setAttribute("x", X(1.62));
      lblRaw.setAttribute("y", Y(1.95 * st.a) + (up ? -8 : 22));
      lblClip.setAttribute("x", X(1.62));
      lblClip.setAttribute("y", Y(f(1.9)) + (up ? 26 : -12));
      epsOut.textContent = st.eps.toFixed(2);
      epsIn.value = Math.round(st.eps * 100);
    }
    epsIn.addEventListener("input", () => ((st.eps = epsIn.value / 100), render()), { signal });
    slide.querySelectorAll("[data-a]").forEach((b) =>
      b.addEventListener("click", () => gsap.to(st, { a: Number(b.dataset.a), duration: 0.9, ease: "power2.inOut", onUpdate: render }), { signal }),
    );
    hit.addEventListener(
      "mousemove",
      (e) => {
        const p = Deck.svgPoint(s, e);
        const r = Math.min(2, Math.max(0, ((p.x - m.l) / (W - m.l - m.r)) * 2));
        hover.setAttribute("cx", X(r));
        hover.setAttribute("cy", Y(f(r)));
        hover.setAttribute("opacity", 1);
        tip.show(e, `ρ = ${r.toFixed(2)} · L = ${f(r).toFixed(2)}`);
      },
      { signal },
    );
    hit.addEventListener("mouseleave", () => (hover.setAttribute("opacity", 0), tip.hide()), { signal });
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(s, { opacity: 0, duration: 0.5 }, 0);
    tl.to(st, { eps: 0.2, duration: 1.4, ease: "power2.inOut", onUpdate: render }, 0.6);
    tl.from(slide.querySelectorAll("ul li"), { opacity: 0, x: 16, stagger: 0.15, duration: 0.4 }, 0.4);
    return { tl };
  };

  /* ---------- The bridge ---------- */

  /* Entrance: tokens as actions, the growing text as state, reward at the end. */
  anims.map = function (slide) {
    const W = 680;
    const s = Deck.stageSvg(slide.querySelector("#map-stage"), W, 520);
    const prompt = "¿Capital de Francia? →";
    const steps = [
      { tok: "La", c: [["La", 0.62], ["París", 0.21], ["Es", 0.09]] },
      { tok: "capital", c: [["capital", 0.71], ["ciudad", 0.18], ["respuesta", 0.05]] },
      { tok: "es", c: [["es", 0.88], ["de", 0.06], [",", 0.03]] },
      { tok: "París", c: [["París", 0.93], ["Lyon", 0.03], ["Roma", 0.01]] },
    ];
    txt(s, 0, 20, "estado sₜ", { "font-size": 17, "font-family": Deck.MONO, fill: C.accent2 });
    box(s, 0, 32, W, 84, { rx: 16, stroke: C.accent2, "stroke-width": 2 });
    const stateTxt = txt(s, 20, 84, prompt, { "font-size": 22, "font-family": Deck.MONO, fill: C.text });
    const down = svg("path", { d: `M${W / 2} 122 L${W / 2} 158`, stroke: C.lineStrong, "stroke-width": 2 }, s);
    box(s, W / 2 - 140, 162, 280, 70, { rx: 18, stroke: C.accent, "stroke-width": 2.5 });
    txt(s, W / 2, 206, "π_θ · el LLM", { "text-anchor": "middle", "font-size": 24, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });
    svg("path", { d: `M${W / 2} 236 L${W / 2} 268`, stroke: C.lineStrong, "stroke-width": 2 }, s);
    txt(s, 0, 290, "acción aₜ ~ π(· | sₜ)", { "font-size": 17, "font-family": Deck.MONO, fill: C.accent });
    const cand = [0, 1, 2].map((i) => {
      const y = 306 + i * 46;
      const l = txt(s, 0, y + 24, "", { "font-size": 21, "font-family": Deck.MONO, fill: C.text });
      svg("rect", { x: 170, y: y + 6, width: 420, height: 24, rx: 6, fill: "rgba(92,64,43,0.07)" }, s);
      const b = svg("rect", { x: 170, y: y + 6, width: 0, height: 24, rx: 4, fill: i === 0 ? C.accent : C.markB }, s);
      const v = txt(s, 604, y + 24, "", { "font-size": 18, "font-family": Deck.MONO, fill: C.text2 });
      return { l, b, v };
    });
    const rw = svg("g", { opacity: 0 }, s);
    svg("rect", { x: 0, y: 452, width: W, height: 58, rx: 16, fill: "rgba(79,138,91,0.12)", stroke: C.good, "stroke-width": 1.5 }, rw);
    txt(rw, W / 2, 489, "fin del episodio → recompensa r = +1 ✓", { "text-anchor": "middle", "font-size": 22, "font-family": Deck.MONO, fill: C.heading });

    const st = { k: 0 };
    function render() {
      const i = Math.min(3, Math.floor(st.k));
      const frac = Math.min(1, (st.k - i) * 2);
      const done = st.k >= 4 ? 4 : i + (st.k - i > 0.75 ? 1 : 0);
      stateTxt.textContent = prompt + " " + steps.slice(0, done).map((x) => x.tok).join(" ");
      steps[i].c.forEach(([t, p], j) => {
        cand[j].l.textContent = t;
        cand[j].b.setAttribute("width", 420 * p * frac);
        cand[j].v.textContent = p.toFixed(2);
      });
    }
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll("tbody tr"), { opacity: 0, x: -16, stagger: 0.12, duration: 0.4 }, 0);
    tl.from(s, { opacity: 0, duration: 0.5 }, 0.2);
    tl.to(st, { k: 3.99, duration: 5.2, ease: "none", onUpdate: render }, 0.9);
    tl.to(st, { k: 4, duration: 0.05, onUpdate: render });
    tl.to(rw, { opacity: 1, duration: 0.5 });
    return { tl };
  };

  /* Stepped: outcome vs process credit assignment over the tokens of a wrong answer. */
  anims.credit = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#credit-stage"), 1424, 400);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#credit-cap"), [
      "Una respuesta <strong>incorrecta</strong>. La recompensa sólo dice ✗ al final, en un único número.",
      "<strong>Supervisión de resultado</strong> (GRPO, RLVR): todos los tokens comparten la misma ventaja negativa, también los que estaban bien.",
      "<strong>Crítico o PRM</strong> (por pasos): el crédito se reparte y señala el error, <code>17×4 = 58</code>. Más preciso, pero hay que entrenar a ese juez.",
    ]);
    const toks = ["Primero", "17×20", "=", "340", ";", "luego", "17×4", "=", "58", ";", "total", "398"];
    const bad = new Set([6, 7, 8, 10, 11]);
    const size = 24;
    const gap = 12;
    const widths = toks.map((t) => Math.round(t.length * size * 0.62 + 28));
    const total = widths.reduce((a, b) => a + b, 0) + gap * (toks.length - 1) + 200;
    let x = (1424 - total) / 2;
    const y = 120;
    const chips = toks.map((t, i) => {
      const g = svg("g", {}, s);
      const r = svg("rect", { x, y, width: widths[i], height: 54, rx: 12, fill: C.panel, stroke: C.lineStrong, "stroke-width": 1.4 }, g);
      txt(g, x + widths[i] / 2, y + 36, t, { "text-anchor": "middle", "font-size": size, "font-family": Deck.MONO, fill: C.text });
      const cx = x + widths[i] / 2;
      x += widths[i] + gap;
      return { g, r, cx };
    });
    const rw = svg("g", {}, s);
    svg("rect", { x: x + 20, y: y - 6, width: 170, height: 66, rx: 16, fill: "rgba(162,59,59,0.12)", stroke: C.bad, "stroke-width": 2 }, rw);
    txt(rw, x + 105, y + 38, "r = 0 ✗", { "text-anchor": "middle", "font-size": 28, "font-family": Deck.MONO, "font-weight": 600, fill: C.bad });
    txt(s, chips[0].cx - widths[0] / 2, y - 26, "respuesta generada, token a token →", { "font-size": 18, "font-family": Deck.MONO, fill: C.muted });

    // outcome row: equal negative advantage under every token
    const outRow = svg("g", { opacity: 0 }, s);
    const procRow = svg("g", { opacity: 0 }, s);
    chips.forEach((c, i) => {
      svg("rect", { x: c.cx - 14, y: 210, width: 28, height: 50, rx: 4, fill: C.bad, opacity: 0.55 }, outRow);
      const neg = bad.has(i);
      svg("rect", { x: c.cx - 14, y: neg ? 210 : 260 - 34, width: 28, height: neg ? 50 : 34, rx: 4, fill: neg ? C.bad : C.good, opacity: neg ? 0.8 : 0.55 }, procRow);
    });
    txt(outRow, chips[0].cx - widths[0] / 2, 300, "misma ventaja para todos", { "font-size": 18, "font-family": Deck.MONO, fill: C.text2 });
    txt(procRow, chips[0].cx - widths[0] / 2, 300, "crédito por paso: el error está localizado", { "font-size": 18, "font-family": Deck.MONO, fill: C.text2 });
    const mark = svg("rect", { x: chips[6].cx - widths[6] / 2 - 8, y: y - 10, width: chips[8].cx + widths[8] / 2 - (chips[6].cx - widths[6] / 2) + 16, height: 74, rx: 16, fill: "none", stroke: C.bad, "stroke-width": 3, "stroke-dasharray": "8 6", opacity: 0 }, s);

    tl.from(chips.map((c) => c.g), { opacity: 0, y: 14, stagger: 0.07, duration: 0.3 }, 0);
    tl.from(rw, { opacity: 0, scale: 0.6, transformOrigin: "center", duration: 0.5, ease: "back.out(2)" }, 1.0);
    show(0, 0);
    tl.addLabel("s0");
    show(1, "s0");
    tl.to(outRow, { opacity: 1, duration: 0.6 }, "s0");
    tl.addLabel("s1");
    show(2, "s1");
    tl.to(outRow, { opacity: 0, duration: 0.4 }, "s1");
    tl.to(procRow, { opacity: 1, duration: 0.6 }, "s1+=0.3");
    tl.to(mark, { opacity: 1, duration: 0.5 }, "s1+=0.6");
    tl.addLabel("s2");
    return { tl };
  };

  anims.sftrl = Deck.simple([".grid-2 .card", ".callout"], { stagger: 0.2 });
})();
