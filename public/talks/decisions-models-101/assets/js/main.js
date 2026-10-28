/* Deck bootstrap: Reveal.js navigation + lifecycle of the per-slide animations.

   Each slide may declare data-anim="name". DM.anims[name](slide, { signal })
   builds its visuals and returns { tl } with a paused GSAP timeline. When the
   slide has invisible step fragments (.fragment.step[data-step]), the timeline
   carries labels "s0", "s1", … placed at the END of each step, and the deck
   tweens to the label of the current step; otherwise the timeline just plays. */
(function () {
  const DM = window.DM;
  const isPrint = /print-pdf/gi.test(window.location.search);
  DM.isPrint = isPrint;
  let current = null;

  function visibleSteps(slide) {
    return slide.querySelectorAll(".fragment.step.visible").length;
  }

  function stop() {
    if (!current) return;
    current.ac.abort();
    if (current.api.tl) current.api.tl.kill();
    if (current.api.destroy) current.api.destroy();
    current.ctx.revert();
    current = null;
  }

  function build(slide) {
    const fn = DM.anims[slide.dataset.anim];
    if (!fn) return null;
    const ac = new AbortController();
    let api = {};
    const ctx = gsap.context(() => {
      api = fn(slide, { signal: ac.signal }) || {};
    }, slide);
    return { slide, ac, ctx, api };
  }

  function goStep(n, jump) {
    const tl = current && current.api.tl;
    if (!tl) return;
    const label = `s${n}`;
    if (tl.labels[label] === undefined) {
      tl.play();
      return;
    }
    if (jump) {
      tl.seek(label, false).pause();
    } else if (tl.labels[label] < tl.time()) {
      // Going back: rewind quickly instead of replaying the step in reverse.
      tl.tweenTo(label, { duration: 0.5, ease: "power2.out" });
    } else {
      tl.tweenTo(label);
    }
  }

  function start(slide) {
    stop();
    if (!slide) return;
    current = build(slide);
    if (!current) return;
    const n = visibleSteps(slide);
    if (n > 0) {
      goStep(n, true);
    } else {
      goStep(0, false);
    }
  }

  function replay() {
    const slide = Reveal.getCurrentSlide();
    slide.querySelectorAll(".fragment.step.visible").forEach((f) => f.classList.remove("visible", "current-fragment"));
    Reveal.sync();
    start(slide);
  }

  document.querySelectorAll("[data-json]").forEach(DM.highlightJson);

  Reveal.initialize({
    width: 1600,
    height: 900,
    margin: 0.03,
    minScale: 0.2,
    maxScale: 2.0,
    hash: true,
    center: false,
    controls: true,
    controlsTutorial: false,
    progress: true,
    slideNumber: "c/t",
    transition: "fade",
    transitionSpeed: "fast",
    backgroundTransition: "none",
    keyboard: { 82: replay },
    pdfSeparateFragments: false,
  }).then(() => {
    if (isPrint) {
      // Print/PDF: render every animation in its final state.
      document.querySelectorAll(".slides section[data-anim]").forEach((slide) => {
        const b = build(slide);
        if (b && b.api.tl) b.api.tl.progress(1, false).pause();
      });
      return;
    }
    DM.startBackground();
    start(Reveal.getCurrentSlide());
  });

  Reveal.on("slidechanged", (e) => !isPrint && start(e.currentSlide));

  // Reveal may show/hide several fragments in one event (e.g. when jumping).
  const steps = (e) => (e.fragments || [e.fragment]).filter((f) => f.classList.contains("step")).map((f) => parseInt(f.dataset.step, 10));

  Reveal.on("fragmentshown", (e) => {
    const s = steps(e);
    if (s.length) goStep(Math.max(...s), false);
  });

  Reveal.on("fragmenthidden", (e) => {
    const s = steps(e);
    if (s.length) goStep(Math.min(...s) - 1, false);
  });
})();
