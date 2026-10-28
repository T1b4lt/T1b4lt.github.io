/* Shared helpers for slide animations. Classic script (no ES modules) so the
   deck also works when opened straight from disk (file://). Everything hangs
   off window.Deck; animations register themselves in Deck.anims. */
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const Deck = (window.Deck = window.Deck || {});
  Deck.anims = Deck.anims || {};

  /** Colours used from JS. Keep them in sync with the CSS variables in theme.css. */
  Deck.colors = {
    bg: "#f3efe4",
    bg2: "#fffdf7",
    ink: "#0b0b0b",
    text: "#0b0b0b",
    text2: "#2c2a26",
    muted: "#6b665c",
    line: "rgba(11,11,11,0.16)",
    lineStrong: "#0b0b0b",
    accent: "#2b4bff",
    accent2: "#ff4f9a",
    warm: "#ff6a1f",
    yellow: "#ffd60a",
    green: "#16c784",
    lilac: "#b8a4ff",
    markA: "#2b4bff", // chart series A (validated against bg2)
    markB: "#e2540f", // chart series B (validated against bg2)
    good: "#0f9d63",
    warn: "#c98a00",
    bad: "#e5243b",
  };

  Deck.MONO = "JetBrains Mono";
  Deck.DISPLAY = "Space Grotesk";
  Deck.BLACK = "Archivo Black";
  Deck.BODY = "Inter";

  /* ---------- Neo-brutalist motion vocabulary ---------- */

  /** Wrap every word of an element in <span class="w"> (restores the original markup first). */
  Deck.splitWords = function (el) {
    if (!el.dataset.orig) el.dataset.orig = el.innerHTML;
    el.innerHTML = el.dataset.orig;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const out = [];
    nodes.forEach((n) => {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
        else {
          const s = document.createElement("span");
          s.className = "w";
          s.textContent = part;
          frag.appendChild(s);
          out.push(s);
        }
      });
      n.parentNode.replaceChild(frag, n);
    });
    return out;
  };

  /** Standard slide intro: kicker slams in, h2 words rise, footnote fades. */
  Deck.intro = function (tl, slide) {
    const k = slide.querySelector(":scope > .kicker");
    if (k) tl.from(k, { x: -80, opacity: 0, skewX: -12, duration: 0.5, ease: "back.out(2)" }, 0);
    const h = slide.querySelector(":scope > h2");
    if (h) {
      const ws = Deck.splitWords(h);
      tl.from(ws, { yPercent: 90, opacity: 0, rotation: 5, duration: 0.5, stagger: 0.03, ease: "power4.out" }, 0.12);
    }
    const f = slide.querySelector(":scope > .footnote");
    if (f) tl.from(f, { opacity: 0, duration: 0.5 }, 0.7);
    return tl;
  };

  /** "Stamp" entrance: blocks drop in slightly rotated and snap flat. */
  Deck.stamp = function (tl, els, at, opts) {
    const o = Object.assign({ stagger: 0.12, y: -36, rot: 4, duration: 0.5 }, opts);
    const list = typeof els === "string" ? [] : Array.from(els.length !== undefined ? els : [els]);
    if (!list.length) return tl;
    tl.from(
      list,
      {
        opacity: 0,
        y: o.y,
        scale: 1.08,
        rotation: (i) => (i % 2 ? o.rot : -o.rot),
        duration: o.duration,
        ease: "back.out(2.2)",
        stagger: o.stagger,
      },
      at,
    );
    return tl;
  };

  /** Generic deck entrance: intro + stamped groups in order. */
  Deck.brut = function (selectors, opts) {
    const o = Object.assign({ stagger: 0.12, gap: 0.25, start: 0.45 }, opts);
    return function (slide) {
      const tl = gsap.timeline({ paused: true });
      Deck.intro(tl, slide);
      let at = o.start;
      selectors.forEach((sel) => {
        const els = slide.querySelectorAll(sel);
        if (!els.length) return;
        Deck.stamp(tl, els, at, { stagger: o.stagger });
        at += o.gap + els.length * o.stagger * 0.6;
      });
      return { tl };
    };
  };

  /** Infinite horizontal marquee; returns the tween (kill it in destroy). */
  Deck.marquee = function (el, speed) {
    const track = el.querySelector(".track");
    if (!track || Deck.isPrint) return null;
    if (!track.dataset.dup) {
      track.innerHTML += track.innerHTML;
      track.dataset.dup = "1";
    }
    const w = track.scrollWidth / 2;
    return gsap.fromTo(track, { x: 0 }, { x: -w, duration: w / (speed || 80), ease: "none", repeat: -1 });
  };

  /** Linear and log scales for hand-built charts. */
  Deck.lin = (d0, d1, r0, r1) => (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  Deck.logScale = (d0, d1, r0, r1) => (v) => r0 + ((Math.log(v) - Math.log(d0)) / (Math.log(d1) - Math.log(d0))) * (r1 - r0);

  /** Format numbers the Spanish way (1.234,5). */
  Deck.fmt = (v, dec) => {
    const [i, f] = Number(v).toFixed(dec || 0).split(".");
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return f ? `${g},${f}` : g;
  };

  /** Create an SVG element with attributes (key "text" sets textContent). */
  Deck.svg = function (tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "text") el.textContent = v;
      else el.setAttribute(k, v);
    }
    if (parent) parent.appendChild(el);
    return el;
  };

  /** Create an HTML element from a string. */
  Deck.html = function (str) {
    const t = document.createElement("template");
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  };

  /** Adds reusable glow filters (#glow, #glow-soft) to an svg. */
  Deck.glowFilter = function (svg) {
    const defs = Deck.svg("defs", {}, svg);
    for (const [id, dev] of [
      ["glow", 4],
      ["glow-soft", 10],
    ]) {
      const f = Deck.svg("filter", { id, x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
      Deck.svg("feGaussianBlur", { stdDeviation: dev, result: "b" }, f);
      const m = Deck.svg("feMerge", {}, f);
      Deck.svg("feMergeNode", { in: "b" }, m);
      Deck.svg("feMergeNode", { in: "SourceGraphic" }, m);
    }
    return defs;
  };

  /** Empty a stage element and put a fresh <svg viewBox="0 0 w h"> in it. */
  Deck.stageSvg = function (stage, w, h) {
    const keep = Array.from(stage.querySelectorAll(":scope > .viz-tip"));
    stage.innerHTML = "";
    const svg = Deck.svg("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", height: "100%" }, stage);
    keep.forEach((k) => stage.appendChild(k));
    Deck.glowFilter(svg);
    return svg;
  };

  /** Clear an existing <svg> element in the markup and give it glow filters. */
  Deck.prepSvg = function (el) {
    el.innerHTML = "";
    Deck.glowFilter(el);
    return el;
  };

  /** Deterministic pseudo-random generator: visuals look the same on every run. */
  Deck.rng = function (seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  /** Rounded text chip; width estimated from the text. Returns the <g> (g.dataset.w = width). */
  Deck.chip = function (parent, x, y, text, opts) {
    const o = Object.assign({ size: 16, color: Deck.colors.ink, fill: Deck.colors.bg2, textColor: Deck.colors.text, h: 32, charW: 0.6, font: Deck.MONO }, opts);
    const w = Math.round(text.length * o.size * o.charW + 18);
    const g = Deck.svg("g", {}, parent);
    Deck.svg("rect", { x: x + 3, y: y + 3, width: w, height: o.h, fill: Deck.colors.ink }, g);
    Deck.svg("rect", { x, y, width: w, height: o.h, fill: o.fill, stroke: o.color, "stroke-width": 2 }, g);
    Deck.svg("text", { x: x + w / 2, y: y + o.h / 2 + o.size * 0.35, "text-anchor": "middle", fill: o.textColor, "font-size": o.size, "font-family": o.font, text }, g);
    g.dataset.w = w;
    return g;
  };

  /** Generic entrance: stagger the matched elements in document order. */
  Deck.simple = function (selectors, opts) {
    return function (slide) {
      const tl = gsap.timeline({ paused: true });
      const els = selectors.flatMap((s) => Array.from(slide.querySelectorAll(s)));
      if (els.length) tl.from(els, { opacity: 0, y: 26, duration: 0.6, stagger: (opts && opts.stagger) || 0.12, ease: "power3.out" });
      return { tl };
    };
  };

  /** Draw a path progressively (stroke-dash) inside timeline tl at time `at`. */
  Deck.draw = function (tl, el, at, duration) {
    const L = el.getTotalLength();
    tl.fromTo(el, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: duration || 1, ease: "power2.inOut" }, at);
  };

  /** Move a glowing dot along an SVG path inside timeline tl (reversible). */
  Deck.pulse = function (tl, parent, path, at, opts) {
    const o = Object.assign({ r: 6, color: Deck.colors.accent, duration: 0.9 }, opts);
    const dot = Deck.svg("circle", { r: o.r, fill: o.color, filter: "url(#glow)", opacity: 0, cx: -50, cy: -50 }, parent);
    const L = path.getTotalLength();
    const state = { t: 0 };
    tl.set(dot, { opacity: 1 }, at);
    tl.fromTo(
      state,
      { t: 0 },
      {
        t: 1,
        duration: o.duration,
        ease: "power1.inOut",
        onUpdate: () => {
          const p = path.getPointAtLength(state.t * L);
          dot.setAttribute("cx", p.x);
          dot.setAttribute("cy", p.y);
        },
      },
      at,
    );
    tl.set(dot, { opacity: 0 }, at + o.duration);
    return dot;
  };

  /** Typewriter effect into an element; returns a tween to add to a timeline. */
  Deck.type = function (el, text, cps) {
    const o = { n: 0 };
    return gsap.to(o, {
      n: text.length,
      duration: text.length / (cps || 40),
      ease: "none",
      onUpdate: () => (el.textContent = text.slice(0, Math.round(o.n))),
    });
  };

  /** Animated counter written by onUpdate (reversible, unlike tl.call). */
  Deck.count = function (tl, el, to, at, opts) {
    const o = Object.assign({ from: 0, duration: 1, decimals: 0, steps: false, format: (v) => v }, opts);
    const st = { v: o.from };
    tl.fromTo(
      st,
      { v: o.from },
      {
        v: to,
        duration: o.duration,
        ease: o.steps ? `steps(${Math.max(1, Math.round(to - o.from))})` : "power2.out",
        onUpdate: () => (el.textContent = o.format(st.v.toFixed(o.decimals))),
      },
      at,
    );
  };

  /** Animate HTML probability-style bars (.bars .fill[data-v] with v in 0..1). */
  Deck.fillBars = function (tl, container, at) {
    container.querySelectorAll(".fill").forEach((f, i) => {
      const v = parseFloat(f.dataset.v || "0");
      tl.fromTo(f, { width: "0%" }, { width: `${v * 100}%`, duration: 0.9, ease: "power3.out" }, (at || 0) + i * 0.12);
    });
  };

  /**
   * Cross-faded captions for stepped diagrams. Fills `host` with one absolutely
   * positioned div per caption and returns show(i, at) to add the fade to tl.
   */
  Deck.captions = function (tl, host, list) {
    host.style.position = "relative";
    host.innerHTML = list.map((c) => `<div class="step-cap" style="position:absolute;inset:8px 0 0 22px;opacity:0">${c}</div>`).join("");
    const caps = host.querySelectorAll(".step-cap");
    return (i, at) => {
      if (i > 0) tl.to(caps[i - 1], { opacity: 0, duration: 0.3 }, at);
      tl.to(caps[i], { opacity: 1, duration: 0.4 }, typeof at === "number" ? at + 0.15 : `${at}+=0.15`);
    };
  };

  /** Syntax-highlight a JSON-ish text block, one <span class="ln"> per line. */
  Deck.highlightJson = function (el) {
    const src = el.textContent;
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const tok = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|([{}\[\],])/g;
    const lines = src.split("\n").map((line) => {
      const out = line.replace(tok, (m, str, colon, num, punct) => {
        if (str && colon) return `<span class="k">${esc(str)}</span><span class="p">${colon}</span>`;
        if (str) return `<span class="s">${esc(str)}</span>`;
        if (num) return `<span class="n">${num}</span>`;
        return `<span class="p">${punct}</span>`;
      });
      return `<span class="ln">${out || " "}</span>`;
    });
    el.innerHTML = lines.join("\n");
  };

  /** Hover tooltip for charts; positions correctly under Reveal's scaling. */
  Deck.tooltip = function (tip, host) {
    return {
      show(evt, html) {
        const r = host.getBoundingClientRect();
        const scale = r.width / host.offsetWidth || 1;
        tip.innerHTML = html;
        tip.style.left = `${(evt.clientX - r.left) / scale + 14}px`;
        tip.style.top = `${(evt.clientY - r.top) / scale - 10}px`;
        tip.style.opacity = 1;
      },
      hide() {
        tip.style.opacity = 0;
      },
    };
  };

  /** Convert a mouse event to SVG user coordinates (for charts with hit areas). */
  Deck.svgPoint = function (svgEl, evt) {
    const pt = svgEl.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svgEl.getScreenCTM().inverse());
  };

  /* ---------- Ambient background: a slow field of connected points ---------- */
  Deck.startBackground = function () {
    const canvas = document.getElementById("bg-field");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rgbA = getComputedStyle(document.documentElement).getPropertyValue("--bg-dot-a").trim() || "34,211,238";
    const rgbB = getComputedStyle(document.documentElement).getPropertyValue("--bg-dot-b").trim() || "167,139,250";
    let w, h, pts;
    const N = 70;
    function resize() {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      pts = Array.from({ length: N }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
        c: Math.random() < 0.6 ? rgbA : rgbB,
      }));
    }
    resize();
    window.addEventListener("resize", resize);
    const maxD = 160 * devicePixelRatio;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i],
            b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(${a.c},${0.07 * (1 - d / maxD)})`;
            ctx.lineWidth = devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = `rgba(${p.c},0.35)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6 * devicePixelRatio, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    frame();
  };
})();
