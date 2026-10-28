/* Animations · RLVR, GRPO, DeepSeek-R1, the rest of the map and closing. */
(function () {
  const Deck = window.Deck;
  const { anims, svg, colors: C } = Deck;

  const txt = (parent, x, y, text, o) =>
    svg("text", Object.assign({ x, y, fill: C.text, "font-size": 18, "font-family": Deck.MONO, text }, o || {}), parent);

  /* Group-relative advantage, as in TRL: (r - mean) / (std + 1e-4), std unbiased. */
  function groupAdv(r) {
    const n = r.length;
    const mean = r.reduce((a, b) => a + b, 0) / n;
    const v = r.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(v);
    return { mean, std, adv: r.map((x) => (x - mean) / (std + 1e-4)) };
  }
  const fmt = (v, d = 2) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(d).replace(".", ",");

  anims.rlvr = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".card"), { opacity: 0, x: -20, stagger: 0.14, duration: 0.45 }, 0);
    tl.from(slide.querySelectorAll("#rlvr-json .ln"), { opacity: 0, x: 10, stagger: 0.1, duration: 0.3 }, 0.5);
    tl.from(slide.querySelector(".callout"), { opacity: 0, y: 12, duration: 0.5 }, 1.5);
    return { tl };
  };

  /* Stepped: one prompt → 8 rollouts → verifier → group mean/std → advantages. */
  anims.grpo = function (slide) {
    const s = Deck.stageSvg(slide.querySelector("#grpo-stage"), 1424, 500);
    const tl = gsap.timeline({ paused: true });
    const show = Deck.captions(tl, slide.querySelector("#grpo-cap"), [
      "Un <strong>prompt</strong> con respuesta comprobable y la <strong>política</strong> actual.",
      "La política genera un <strong>grupo</strong> de respuestas al mismo prompt (aquí 8), con temperatura para que varíen.",
      "Un <strong>verificador</strong> puntúa cada una: 1 si es correcta, 0 si no. Sin reward model, sin humanos.",
      "La <strong>media del grupo</strong> hace de baseline: es «lo esperado» para este prompt. No hace falta crítico.",
      "<strong>Ventaja</strong> = (r − media) / std. Las correctas suben y las incorrectas bajan, con un paso tipo PPO (ratio clipeado).",
    ]);
    const answers = ["408", "398", "408", "418", "392", "408", "358", "400"];
    const R = answers.map((a) => (a === "408" ? 1 : 0));
    const { mean, std, adv } = groupAdv(R);

    // prompt and policy
    const pr = svg("g", {}, s);
    svg("rect", { x: 0, y: 190, width: 240, height: 120, rx: 20, fill: C.panel, stroke: C.accent2, "stroke-width": 2 }, pr);
    txt(pr, 120, 232, "prompt", { "text-anchor": "middle", fill: C.accent2, "font-size": 16 });
    txt(pr, 120, 276, "17 × 24 = ?", { "text-anchor": "middle", "font-size": 28, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });
    const po = svg("g", {}, s);
    svg("rect", { x: 290, y: 180, width: 170, height: 140, rx: 22, fill: C.panel, stroke: C.accent, "stroke-width": 2.5 }, po);
    txt(po, 375, 245, "π_θ", { "text-anchor": "middle", "font-size": 34, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });
    txt(po, 375, 280, "política", { "text-anchor": "middle", fill: C.accent, "font-size": 16 });
    svg("path", { d: "M240 250 L290 250", stroke: C.lineStrong, "stroke-width": 2 }, s);

    // headers
    const hdr = svg("g", { opacity: 0 }, s);
    txt(hdr, 560, 20, "respuesta", { fill: C.muted, "font-size": 16 });
    const hdr2 = svg("g", { opacity: 0 }, s);
    txt(hdr2, 760, 20, "verificador", { fill: C.muted, "font-size": 16 });
    txt(hdr2, 900, 20, "r", { fill: C.muted, "font-size": 16 });
    const hdr3 = svg("g", { opacity: 0 }, s);
    txt(hdr3, 1210, 20, "ventaja Â", { fill: C.muted, "font-size": 16, "text-anchor": "middle" });

    const zeroX = 1210;
    const k = 100;
    const rows = answers.map((a, i) => {
      const y = 38 + i * 56;
      const wire = svg("path", { d: `M460 250 C 500 250, 500 ${y + 22}, 545 ${y + 22}`, stroke: C.line, "stroke-width": 1.5, fill: "none" }, s);
      const chip = svg("g", { opacity: 0 }, s);
      svg("rect", { x: 548, y, width: 170, height: 44, rx: 12, fill: C.panel, stroke: C.lineStrong, "stroke-width": 1.2 }, chip);
      txt(chip, 566, y + 29, `#${i + 1}`, { fill: C.muted, "font-size": 15 });
      txt(chip, 700, y + 30, `… = ${a}`, { "text-anchor": "end", "font-size": 20, fill: C.text });
      const ok = R[i] === 1;
      const ver = svg("g", { opacity: 0 }, s);
      txt(ver, 800, y + 30, ok ? "✓" : "✗", { "text-anchor": "middle", "font-size": 24, "font-weight": 600, fill: ok ? C.good : C.bad });
      txt(ver, 905, y + 30, String(R[i]), { "text-anchor": "middle", "font-size": 22, "font-weight": 600, fill: C.text });
      const advG = svg("g", { opacity: 0 }, s);
      const w = Math.abs(adv[i]) * k;
      const bar = svg("rect", { x: adv[i] >= 0 ? zeroX : zeroX - w, y: y + 10, width: w, height: 24, rx: 4, fill: ok ? C.good : C.bad, opacity: 0.85 }, advG);
      txt(advG, adv[i] >= 0 ? zeroX + w + 10 : zeroX - w - 10, y + 29, fmt(adv[i]), { "text-anchor": adv[i] >= 0 ? "start" : "end", "font-size": 18, fill: C.text });
      return { wire, chip, ver, advG, bar };
    });
    const axis = svg("line", { x1: zeroX, x2: zeroX, y1: 30, y2: 490, stroke: C.lineStrong, "stroke-width": 1.5, opacity: 0 }, s);

    // mean / std box under the policy
    const mb = svg("g", { opacity: 0 }, s);
    svg("rect", { x: 950, y: 36, width: 110, height: 444, rx: 18, fill: "rgba(95,138,107,0.10)", stroke: C.accent2, "stroke-width": 1.5, "stroke-dasharray": "6 5" }, mb);
    txt(mb, 1005, 210, "media", { "text-anchor": "middle", fill: C.accent2, "font-size": 16 });
    txt(mb, 1005, 248, mean.toFixed(3).replace(".", ","), { "text-anchor": "middle", "font-size": 30, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });
    txt(mb, 1005, 300, "std", { "text-anchor": "middle", fill: C.accent2, "font-size": 16 });
    txt(mb, 1005, 336, std.toFixed(2).replace(".", ","), { "text-anchor": "middle", "font-size": 30, "font-family": Deck.DISPLAY, "font-weight": 600, fill: C.heading });

    gsap.set(rows.map((r) => r.wire), { opacity: 0 });

    tl.from([pr, po], { opacity: 0, x: -20, stagger: 0.2, duration: 0.5 }, 0);
    show(0, 0);
    tl.addLabel("s0");

    show(1, "s0");
    tl.to(hdr, { opacity: 1, duration: 0.3 }, "s0");
    rows.forEach((r, i) => {
      tl.to(r.wire, { opacity: 1, duration: 0.2 }, `s0+=${0.1 + i * 0.12}`);
      Deck.draw(tl, r.wire, tl.labels.s0 + 0.1 + i * 0.12, 0.4);
      tl.to(r.chip, { opacity: 1, duration: 0.3 }, `s0+=${0.4 + i * 0.12}`);
    });
    tl.addLabel("s1");

    show(2, "s1");
    tl.to(hdr2, { opacity: 1, duration: 0.3 }, "s1");
    tl.to(rows.map((r) => r.ver), { opacity: 1, stagger: 0.12, duration: 0.3 }, "s1+=0.2");
    tl.addLabel("s2");

    show(3, "s2");
    tl.to(mb, { opacity: 1, duration: 0.5 }, "s2");
    tl.addLabel("s3");

    show(4, "s3");
    tl.to([hdr3, axis], { opacity: 1, duration: 0.3 }, "s3");
    rows.forEach((r, i) => {
      tl.to(r.advG, { opacity: 1, duration: 0.2 }, `s3+=${0.2 + i * 0.08}`);
      tl.from(r.bar, { attr: { width: 0, x: zeroX }, duration: 0.6, ease: "power3.out" }, `s3+=${0.2 + i * 0.08}`);
    });
    tl.to(po.querySelector("rect"), { attr: { fill: "rgba(192,88,47,0.18)" }, duration: 0.3, yoyo: true, repeat: 1 }, "s3+=1.2");
    tl.addLabel("s4");
    return { tl };
  };

  /* Interactive: toggle correctness of 8 samples and watch the advantages. */
  anims.grpolive = function (slide, { signal }) {
    const grid = slide.querySelector("#gl-grid");
    const stats = slide.querySelector("#gl-stats");
    const msg = slide.querySelector("#gl-msg");
    const answers = ["408", "398", "408", "418", "392", "408", "358", "400"];
    let R = [1, 0, 1, 0, 0, 1, 0, 0];
    grid.innerHTML = answers
      .map(
        (a, i) => `<div class="sample" data-i="${i}">
          <div class="hd"><span>#${i + 1}</span><span>clic para cambiar</span></div>
          <div class="rw"></div>
          <div class="adv"></div>
          <div class="advbar"><i></i></div>
        </div>`,
      )
      .join("");
    const cards = Array.from(grid.querySelectorAll(".sample"));
    function render() {
      const { mean, std, adv } = groupAdv(R);
      cards.forEach((c, i) => {
        const ok = R[i] === 1;
        c.classList.toggle("ok", ok);
        c.classList.toggle("ko", !ok);
        c.querySelector(".rw").innerHTML = `<span class="${ok ? "ok-c" : "ko-c"}">${ok ? "✓" : "✗"}</span> r = ${R[i]}`;
        c.querySelector(".adv").textContent = `Â = ${fmt(adv[i])}`;
        const bar = c.querySelector(".advbar i");
        const w = Math.min(50, Math.abs(adv[i]) * 18);
        bar.style.width = `${w}%`;
        bar.style.left = adv[i] >= 0 ? "50%" : `${50 - w}%`;
        bar.style.background = ok ? "var(--good)" : "var(--bad)";
      });
      const n = R.reduce((a, b) => a + b, 0);
      stats.innerHTML = `aciertos ${n}/8 · media ${mean.toFixed(2).replace(".", ",")} · std ${std.toFixed(2).replace(".", ",")}`;
      if (n === 0 || n === 8)
        msg.innerHTML = `Todas ${n === 8 ? "aciertan" : "fallan"} → std = 0 → <strong>ventaja 0 para todas</strong>. Este prompt no da señal: DAPO lo descarta y muestrea otro.`;
      else if (n === 1)
        msg.innerHTML = `Un único acierto recibe una ventaja enorme (<strong>${fmt(groupAdv(R).adv[R.indexOf(1)])}</strong>): el modelo aprende mucho de un éxito raro.`;
      else if (n === 7)
        msg.innerHTML = `Si casi todas aciertan, el único fallo recibe el castigo fuerte; las correctas apenas suben. El prompt ya era «fácil».`;
      else msg.innerHTML = `Las ✓ suben (Â &gt; 0) y las ✗ bajan (Â &lt; 0). <strong>Cuanto más raro el acierto, más vale.</strong>`;
    }
    cards.forEach((c) =>
      c.addEventListener(
        "click",
        () => {
          const i = Number(c.dataset.i);
          R[i] = 1 - R[i];
          render();
        },
        { signal },
      ),
    );
    slide.querySelectorAll("[data-p]").forEach((b) =>
      b.addEventListener("click", () => ((R = b.dataset.p.split("").map(Number)), render()), { signal }),
    );
    render();
    const tl = gsap.timeline({ paused: true });
    tl.from(cards, { opacity: 0, y: 16, stagger: 0.06, duration: 0.4 }, 0);
    tl.from([stats, msg], { opacity: 0, duration: 0.5 }, 0.6);
    return { tl };
  };

  /* Chart: AIME 2024 accuracy for DeepSeek-R1-Zero (figures from the paper's abstract). */
  anims.r1 = function (slide, { signal }) {
    const W = 800;
    const H = 360;
    const stage = slide.querySelector("#r1-stage");
    const tip = Deck.tooltip(slide.querySelector("#r1-tip"), stage);
    const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "100%" });
    stage.insertBefore(s, stage.firstChild);
    const data = [
      ["inicio del RL · pass@1", 15.6],
      ["tras el RL · pass@1", 71.0],
      ["tras el RL · votación mayoritaria", 86.7],
    ];
    const l = 0;
    const bx = 330;
    const bw = W - bx - 90;
    [0, 25, 50, 75, 100].forEach((v) => {
      svg("line", { x1: bx + (bw * v) / 100, x2: bx + (bw * v) / 100, y1: 10, y2: H - 40, stroke: C.line, "stroke-width": 1 }, s);
      txt(s, bx + (bw * v) / 100, H - 14, `${v} %`, { "text-anchor": "middle", fill: C.muted, "font-size": 15 });
    });
    const tl = gsap.timeline({ paused: true });
    data.forEach(([lab, v], i) => {
      const y = 30 + i * 100;
      txt(s, l, y + 34, lab, { "font-size": 18, fill: C.text, "font-family": Deck.BODY });
      const bar = svg("rect", { x: bx, y: y + 10, width: (bw * v) / 100, height: 40, rx: 4, fill: C.markA, opacity: i === 0 ? 0.55 : 1 }, s);
      const val = txt(s, bx + (bw * v) / 100 + 12, y + 38, `${v.toFixed(1).replace(".", ",")} %`, { "font-size": 22, "font-weight": 600, fill: C.heading });
      const hit = svg("rect", { x: 0, y, width: W, height: 60, fill: "transparent" }, s);
      hit.addEventListener("mousemove", (e) => tip.show(e, `${lab}: ${v} %`), { signal });
      hit.addEventListener("mouseleave", () => tip.hide(), { signal });
      tl.from(bar, { attr: { width: 0 }, duration: 0.9, ease: "power3.out" }, 0.3 + i * 0.35);
      tl.from(val, { opacity: 0, duration: 0.3 }, 0.9 + i * 0.35);
    });
    svg("line", { x1: bx, x2: bx, y1: 10, y2: H - 40, stroke: C.lineStrong, "stroke-width": 1.5 }, s);
    tl.from(slide.querySelectorAll("ul li, .callout"), { opacity: 0, x: 16, stagger: 0.15, duration: 0.4 }, 0.2);
    return { tl };
  };

  anims.variants = Deck.simple(["tbody tr", ".callout"], { stagger: 0.12 });
  anims.agentic = Deck.simple([".grid-3 .card", ".callout"], { stagger: 0.18 });
  anims.others = Deck.simple([".others .card"], { stagger: 0.07 });
  anims.recipe = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelectorAll(".pipe > *"), { opacity: 0, x: -18, stagger: 0.1, duration: 0.45 }, 0);
    tl.from(slide.querySelectorAll(".grid-2 .card"), { opacity: 0, y: 18, stagger: 0.2, duration: 0.5 }, 1.2);
    return { tl };
  };
  anims.open = Deck.simple([".grid-3 .card", ".callout"], { stagger: 0.18 });
  anims.takeaways = Deck.simple([".takeaways .item"], { stagger: 0.45 });
  anims.sources = Deck.simple(["li"], { stagger: 0.05 });
})();
