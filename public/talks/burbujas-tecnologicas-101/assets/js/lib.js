/* Shared helpers for slide animations. Classic script (no ES modules) so the
   deck also works when opened straight from disk (file://). Everything hangs
   off window.Deck; animations register themselves in Deck.anims. */
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const Deck = (window.Deck = window.Deck || {});
  Deck.anims = Deck.anims || {};

  /** Colours used from JS. Keep them in sync with the CSS variables in theme.css. */
  Deck.colors = {
    bg: "#0d0c0a",
    bg2: "#14120f",
    text: "#ece4d4",
    text2: "#c2b8a5",
    muted: "#8f8676",
    line: "rgba(236,226,205,0.18)",
    lineStrong: "rgba(236,226,205,0.36)",
    accent: "#f0b34a", // euphoria / the bubble
    accent2: "#5fc39a", // survivors / real economy
    warm: "#ef5b4f", // panic
    markA: "#c08418", // chart series A (validated against bg2)
    markB: "#3d8fd0", // chart series B
    markC: "#d04a6a", // chart series C
    good: "#5fc39a",
    warn: "#f0b34a",
    bad: "#ef5b4f",
  };

  Deck.MONO = "IBM Plex Mono";
  Deck.DISPLAY = "Fraunces";
  Deck.BODY = "Inter";

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
    stage.innerHTML = "";
    const svg = Deck.svg("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", height: "100%" }, stage);
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
    const o = Object.assign({ size: 16, color: Deck.colors.lineStrong, fill: "rgba(236,226,205,0.06)", textColor: Deck.colors.text, h: 32, charW: 0.6, font: Deck.MONO }, opts);
    const w = Math.round(text.length * o.size * o.charW + 18);
    const g = Deck.svg("g", {}, parent);
    Deck.svg("rect", { x, y, width: w, height: o.h, rx: 8, fill: o.fill, stroke: o.color, "stroke-width": 1.2 }, g);
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


  /* ---------- Deck-specific helpers (Burbujas tecnológicas 101) ---------- */

  /** Spanish number format with a fixed number of decimals. */
  Deck.fmt = function (v, dec) {
    return Number(v).toLocaleString("es-ES", { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0, useGrouping: "always" }).replace("-", "−");
  };

  /** Animate every .cnt[data-to] inside root (data-dec = decimals). */
  Deck.counters = function (tl, root, at, opts) {
    root.querySelectorAll(".cnt[data-to]").forEach((el, i) => {
      const dec = parseInt(el.dataset.dec || "0", 10);
      const to = parseFloat(el.dataset.to);
      const st = { v: 0 };
      el.textContent = Deck.fmt(0, dec);
      tl.to(st, { v: to, duration: (opts && opts.duration) || 1.2, ease: "power2.out", onUpdate: () => (el.textContent = Deck.fmt(st.v, dec)) }, at + i * ((opts && opts.stagger) || 0.15));
    });
  };

  /** Catmull-Rom interpolation of key points -> dense [[x,y],...]. */
  Deck.smooth = function (pts, n) {
    const out = [];
    const N = n || 16;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < N; k++) {
        const t = k / N, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };

  /** Polyline path data from [[x,y],...]. */
  Deck.pathD = function (pts) {
    return pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  };

  /** SVG text shortcut with deck defaults. */
  Deck.label = function (parent, x, y, text, o) {
    o = o || {};
    return Deck.svg("text", {
      x, y, text,
      fill: o.fill || Deck.colors.text2,
      "font-size": o.size || 18,
      "font-family": o.font || Deck.BODY,
      "font-weight": o.weight || 400,
      "text-anchor": o.anchor || "start",
      "font-style": o.italic ? "italic" : "normal",
      opacity: o.opacity === undefined ? 1 : o.opacity,
    }, parent);
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
