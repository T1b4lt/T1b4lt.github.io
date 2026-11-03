/* Animations · block "Hacia dónde nos lleva" and closing (slides 18–24). */
(function () {
  const Deck = window.Deck;
  const { anims } = Deck;

  anims.lever = function (slide) {
    const tl = gsap.timeline({ paused: true });
    tl.from(slide.querySelector(".lv-l"), { opacity: 0, x: -30, duration: 0.6 }, 0.1)
      .from(slide.querySelector(".lv-a"), { opacity: 0, x: -20, duration: 0.5 }, 0.7)
      .from(slide.querySelector(".lv-r"), { opacity: 0, x: 30, duration: 0.6 }, 1)
      .from(slide.querySelectorAll(".lv-r li"), { opacity: 0, x: 14, stagger: 0.15, duration: 0.4 }, 1.3)
      .from(slide.querySelectorAll(".lv-q"), { opacity: 0, y: 14, stagger: 0.2, duration: 0.6 }, 2);
    return { tl };
  };

  anims.bet = Deck.simple([".bt-card"], { stagger: 0.18 });
  anims.others = Deck.simple([".ot-card"], { stagger: 0.18 });
  anims.reception = Deck.simple([".rc-card"], { stagger: 0.2 });
  anims.watch = Deck.simple([".wt-card"], { stagger: 0.15 });
  anims.takeaways = Deck.simple([".takeaways .item"], { stagger: 0.3 });
  anims.sources = Deck.simple([".sources-cols > div"], { stagger: 0.15 });
})();
