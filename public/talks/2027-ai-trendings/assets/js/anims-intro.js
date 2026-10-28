/* Intro, dividers, prediction grids and closing slides. */
(function () {
  const Deck = window.Deck;
  const { anims, colors: C } = Deck;

  /* Cover: year digits slam in, the last digit flips 6 → 7, the ticket lands. */
  anims.cover = function (slide) {
    const tl = gsap.timeline({ paused: true });
    const digits = slide.querySelectorAll(".yr .d");
    const last = slide.querySelector("#cv-last");
    const st = { v: 0 };
    last.textContent = "6";
    tl.from(slide.querySelector(".kicker"), { x: -120, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 0)
      .from(slide.querySelector("h1"), { opacity: 0, x: -60, duration: 0.6, ease: "power4.out" }, 0.1)
      .from(digits, { y: -260, rotation: (i) => [-14, 9, -6, 12][i], opacity: 0, duration: 0.7, stagger: 0.12, ease: "bounce.out" }, 0.35)
      .to(last, { rotationX: 90, duration: 0.18, ease: "power2.in" }, 1.6)
      .to(st, { v: 1, duration: 0.01, onUpdate: () => (last.textContent = st.v > 0.5 ? "7" : "6") }, 1.78)
      .to(last, { rotationX: 0, duration: 0.3, ease: "back.out(3)" }, 1.79)
      .from(last, { backgroundColor: C.yellow, color: C.ink, duration: 0.01 }, 1.78)
      .from(slide.querySelector(".sub"), { opacity: 0, y: 30, duration: 0.6 }, 1.2)
      .from(slide.querySelectorAll(".tags .tag"), { opacity: 0, y: 30, rotation: (i) => (i % 2 ? 8 : -8), stagger: 0.07, duration: 0.45, ease: "back.out(2)" }, 1.5)
      .from(slide.querySelector("#cv-ticket"), { x: 700, rotation: 25, duration: 0.9, ease: "power4.out" }, 0.9)
      .from(slide.querySelector("#cv-marquee"), { yPercent: 100, duration: 0.5 }, 1.9);
    const plane = slide.querySelector(".plane");
    const loops = [];
    if (!Deck.isPrint) {
      loops.push(gsap.to(plane, { x: 14, y: -6, rotation: -8, duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut" }));
      loops.push(Deck.marquee(slide.querySelector("#cv-marquee"), 70));
    }
    return { tl, destroy: () => loops.forEach((l) => l && l.kill()) };
  };

  /* Hook: six stat blocks stamp in and their numbers count up. */
  anims.hook = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const stats = slide.querySelectorAll(".stat");
    Deck.stamp(tl, stats, 0.5, { stagger: 0.14 });
    stats.forEach((s, i) => {
      const v = s.querySelector(".v");
      const to = parseFloat(v.dataset.to);
      const pre = v.dataset.pre || "";
      const suf = v.dataset.suf || "";
      Deck.count(tl, v, to, 0.65 + i * 0.14, { duration: 1.3, format: (x) => pre + Deck.fmt(x) + suf });
    });
    return { tl };
  };

  /* Method: signal → trend → prediction built step by step. */
  anims.method = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const cols = slide.querySelectorAll("#me-stp .col");
    const arrs = slide.querySelectorAll("#me-stp .arr");
    const legend = slide.querySelectorAll("#me-legend .card");
    gsap.set([cols[1], cols[2], ...arrs, ...legend], { opacity: 0 });
    Deck.stamp(tl, cols[0], 0.5);
    tl.addLabel("s0");
    tl.fromTo(arrs[0], { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(3)" }, "s0");
    tl.fromTo(cols[1], { opacity: 0, y: -40, rotation: 4 }, { opacity: 1, y: 0, rotation: 0, duration: 0.5, ease: "back.out(2)" }, "s0+=0.2");
    tl.addLabel("s1");
    tl.fromTo(arrs[1], { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(3)" }, "s1");
    tl.fromTo(cols[2], { opacity: 0, y: -40, rotation: -4, scale: 1.1 }, { opacity: 1, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: "back.out(2)" }, "s1+=0.2");
    tl.from(cols[2].querySelector(".conf"), { scale: 0, rotation: -30, duration: 0.4, ease: "back.out(4)" }, "s1+=0.7");
    tl.addLabel("s2");
    tl.fromTo(legend, { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.45, ease: "back.out(2)" }, "s2");
    tl.addLabel("s3");
    return { tl };
  };

  anims.agenda = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const stops = slide.querySelectorAll(".stop");
    Deck.stamp(tl, stops, 0.45, { stagger: 0.12 });
    tl.from(slide.querySelectorAll(".stop .n"), { rotation: -180, scale: 0, duration: 0.5, stagger: 0.12, ease: "back.out(2)" }, 0.6);
    return { tl };
  };

  /* Section divider: giant outlined number slams, random blocks float. */
  anims.divider = function (slide) {
    slide.querySelectorAll(".shape").forEach((s) => s.remove());
    const rnd = Deck.rng(slide.querySelector(".num").textContent.charCodeAt(1) * 97);
    const fills = [C.yellow, C.bg2, C.accent2, C.green, C.lilac, C.accent, C.warm];
    const shapes = [];
    for (let i = 0; i < 6; i++) {
      const d = document.createElement("div");
      d.className = "shape";
      const w = 60 + rnd() * 120;
      Object.assign(d.style, {
        width: `${w}px`,
        height: `${rnd() < 0.5 ? w : w * 0.5}px`,
        left: `${1060 + rnd() * 380}px`,
        top: `${70 + rnd() * 660}px`,
        background: fills[Math.floor(rnd() * fills.length)],
        borderRadius: rnd() < 0.3 ? "50%" : "0",
      });
      slide.appendChild(d);
      shapes.push(d);
    }
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".num"), { scale: 3, opacity: 0, rotation: -12, duration: 0.6, ease: "power4.out" }, 0);
    const ws = Deck.splitWords(slide.querySelector("h2"));
    tl.from(ws, { yPercent: 110, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power4.out" }, 0.35);
    tl.from(slide.querySelector("p"), { opacity: 0, x: -40, duration: 0.5 }, 0.8);
    tl.from(shapes, { scale: 0, rotation: (i) => (i % 2 ? 90 : -90), duration: 0.6, stagger: 0.07, ease: "back.out(2)" }, 0.3);
    const loops = [];
    if (!Deck.isPrint) shapes.forEach((s, i) => loops.push(gsap.to(s, { y: (i % 2 ? 1 : -1) * (14 + i * 3), rotation: (i % 2 ? 6 : -6), duration: 2 + i * 0.3, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 })));
    return { tl, destroy: () => loops.forEach((l) => l.kill()) };
  };

  /* Prediction grids: cards stamp in, confidence badges pop. */
  anims.preds = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const preds = slide.querySelectorAll(".pred");
    Deck.stamp(tl, preds, 0.5, { stagger: 0.22 });
    tl.from(slide.querySelectorAll(".pred .conf"), { scale: 0, rotation: 25, duration: 0.4, stagger: 0.22, ease: "back.out(4)" }, 0.85);
    tl.from(slide.querySelectorAll(".pred .ev"), { opacity: 0, duration: 0.4, stagger: 0.22 }, 0.95);
    return { tl };
  };

  /* Departures board: split-flap scramble that resolves row by row. */
  anims.board = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const CH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%>–";
    const rows = slide.querySelectorAll(".bd-row:not(.bd-h)");
    tl.from(slide.querySelector(".board"), { scaleY: 0, transformOrigin: "top", duration: 0.5, ease: "power4.out" }, 0.3);
    rows.forEach((row, r) => {
      row.querySelectorAll("[data-t]").forEach((cell, c) => {
        const txt = cell.dataset.t;
        const st = { p: 0 };
        cell.textContent = "";
        tl.to(
          st,
          {
            p: 1,
            duration: 0.9,
            ease: "none",
            onUpdate: () => {
              const n = Math.floor(st.p * txt.length);
              let s = txt.slice(0, n);
              if (st.p < 1) for (let i = n; i < txt.length; i++) s += txt[i] === " " ? " " : CH[Math.floor(Math.random() * CH.length)];
              cell.textContent = st.p <= 0 ? "" : s;
            },
          },
          0.7 + r * 0.22 + c * 0.12,
        );
      });
      const conf = row.querySelector(".st");
      tl.from(conf, { scale: 0, duration: 0.3, ease: "back.out(4)" }, 1.4 + r * 0.22);
    });
    return { tl };
  };

  anims.takeaways = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    const items = slide.querySelectorAll(".takeaways .item");
    items.forEach((it, i) => {
      tl.from(it, { x: i % 2 ? 300 : -300, opacity: 0, rotation: i % 2 ? 3 : -3, duration: 0.6, ease: "back.out(1.6)" }, 0.5 + i * 0.4);
      tl.from(it.querySelector(".n"), { scale: 0, rotation: -90, duration: 0.45, ease: "back.out(3)" }, 0.75 + i * 0.4);
    });
    const q = slide.querySelector("#tk-q");
    tl.from(q, { scale: 4, opacity: 0, rotation: 30, duration: 0.5, ease: "power4.in" }, 2.4);
    const loop = Deck.isPrint ? null : gsap.to(q, { rotation: 4, scale: 1.06, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 3 });
    return { tl, destroy: () => loop && loop.kill() };
  };

  anims.sources = function (slide) {
    const tl = gsap.timeline({ paused: true });
    Deck.intro(tl, slide);
    tl.from(slide.querySelectorAll(".src-cols h4"), { scaleX: 0, transformOrigin: "left", stagger: 0.1, duration: 0.35 }, 0.4);
    tl.from(slide.querySelectorAll(".src-cols li"), { opacity: 0, x: -14, stagger: 0.03, duration: 0.3 }, 0.5);
    return { tl };
  };
})();
