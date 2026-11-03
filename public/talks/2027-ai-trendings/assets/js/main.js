/* Deck bootstrap: Reveal.js navigation + lifecycle of the per-slide animations.

   Contract
   - A slide may declare data-anim="name". Deck.anims[name](slide, { signal })
     builds its visuals and returns { tl, destroy? } where tl is a PAUSED GSAP
     timeline. Use `signal` for every addEventListener so listeners die with
     the slide; use `destroy` to kill infinite loops, intervals, etc.
   - Stepped slides contain invisible fragments
     <span class="fragment step" data-step="1"></span> … and the timeline puts
     labels "s0", "s1", … at the END of each step. → advances one step,
     ← rewinds quickly. Without labels, the timeline simply plays on entry.
   - Everything a slide creates is rebuilt from scratch on every entry, and
     gsap.context reverts inline styles once the outgoing slide has finished
     its transition (it is frozen, not reset, while it fades out), so
     animations always restart
     cleanly ("R" replays the current slide).
   - ?print-pdf renders every timeline in its final state (Deck.isPrint lets
     animations skip live loops and show static values instead). */
(function () {
  const Deck = window.Deck;
  const isPrint = /print-pdf/gi.test(window.location.search);
  Deck.isPrint = isPrint;
  let current = null;

  function visibleSteps(slide) {
    return slide.querySelectorAll(".fragment.step.visible").length;
  }

  function kill(c) {
    if (!c || c.dead) return;
    c.dead = true;
    clearTimeout(c.timer);
    if (c.stepTween) c.stepTween.kill();
    c.ac.abort();
    if (c.api.tl) c.api.tl.kill();
    if (c.api.destroy) c.api.destroy();
    c.ctx.revert();
  }

  // Leaving a slide: freeze its animation where it is and revert it only once
  // the slide transition has finished, so the outgoing slide never flashes its
  // initial (pre-animation) state while it fades out.
  const RETIRE_DELAY = 900;
  const retiring = [];
  function stop(next) {
    if (!current) return;
    const c = current;
    current = null;
    if (!next || next === c.slide) {
      kill(c);
      return;
    }
    if (c.api.tl) c.api.tl.pause();
    c.timer = setTimeout(() => kill(c), RETIRE_DELAY);
    retiring.push(c);
  }
  function flushRetiring(slide) {
    // Re-entering a slide that is still waiting to be reverted: revert it now.
    for (let i = retiring.length - 1; i >= 0; i--) {
      if (retiring[i].dead || retiring[i].slide === slide) {
        kill(retiring[i]);
        retiring.splice(i, 1);
      }
    }
  }

  function build(slide) {
    const fn = Deck.anims[slide.dataset.anim];
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
    if (current.stepTween) current.stepTween.kill();
    if (jump) {
      // suppressEvents=false so onUpdate-driven text (counters, captions) renders.
      tl.seek(label, false).pause();
    } else if (tl.labels[label] < tl.time()) {
      // Going back: rewind quickly instead of replaying the step in reverse.
      current.stepTween = tl.tweenTo(label, { duration: 0.5, ease: "power2.out" });
    } else {
      current.stepTween = tl.tweenTo(label);
    }
  }

  function start(slide) {
    stop(slide);
    flushRetiring(slide);
    if (!slide) return;
    current = build(slide);
    if (!current) return;
    const n = visibleSteps(slide);
    if (n > 0) goStep(n, true);
    else goStep(0, false);
  }

  function replay() {
    const slide = Reveal.getCurrentSlide();
    slide.querySelectorAll(".fragment.step.visible").forEach((f) => f.classList.remove("visible", "current-fragment"));
    Reveal.sync();
    start(slide);
  }

  document.querySelectorAll("[data-json]").forEach(Deck.highlightJson);

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
    keyboard: { 82: replay }, // R
    pdfSeparateFragments: false,
  }).then(() => {
    if (isPrint) {
      document.querySelectorAll(".slides section[data-anim]").forEach((slide) => {
        const b = build(slide);
        if (b && b.api.tl) b.api.tl.progress(1, false).pause();
      });
      return;
    }
    Deck.startBackground();
    start(Reveal.getCurrentSlide());
  });

  Reveal.on("slidechanged", (e) => !isPrint && start(e.currentSlide));

  // Reveal may show/hide several fragments in one event (e.g. when jumping).
  const steps = (e) =>
    (e.fragments || [e.fragment]).filter((f) => f.classList.contains("step")).map((f) => parseInt(f.dataset.step, 10));

  Reveal.on("fragmentshown", (e) => {
    const s = steps(e);
    if (s.length) goStep(Math.max(...s), false);
  });

  Reveal.on("fragmenthidden", (e) => {
    const s = steps(e);
    if (s.length) goStep(Math.min(...s) - 1, false);
  });
})();
