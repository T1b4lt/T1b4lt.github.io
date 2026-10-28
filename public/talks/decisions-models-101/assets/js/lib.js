/* Shared helpers for the slide animations. Classic script (no modules) so the
   deck also works when opened straight from disk (file://). */
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const DM = (window.DM = window.DM || {});
  DM.anims = DM.anims || {};

  DM.colors = {
    bg: "#060a13",
    bg2: "#0b1020",
    text: "#e6edf7",
    text2: "#b6c2d4",
    muted: "#7d8aa0",
    line: "rgba(148,163,184,0.22)",
    lineStrong: "rgba(148,163,184,0.4)",
    cyan: "#22d3ee",
    orange: "#fb923c",
    violet: "#a78bfa",
    markDm: "#14a3c7",
    markLlm: "#e8590c",
    good: "#4ade80",
    warn: "#fbbf24",
    bad: "#f87171",
  };

  /** Create an SVG element with attributes, optionally appended to a parent. */
  DM.svg = function (tag, attrs, parent) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "text") el.textContent = v;
      else el.setAttribute(k, v);
    }
    if (parent) parent.appendChild(el);
    return el;
  };

  /** Create an HTML element from a string. */
  DM.html = function (str) {
    const t = document.createElement("template");
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  };

  /** Fresh <svg> filling a stage element. */
  DM.stageSvg = function (stage, w, h) {
    stage.innerHTML = "";
    const svg = DM.svg("svg", { viewBox: `0 0 ${w} ${h}`, width: "100%", height: "100%" }, stage);
    DM.glowFilter(svg);
    return svg;
  };

  /** Adds reusable glow filters (#glow, #glow-soft) to an svg. */
  DM.glowFilter = function (svg) {
    const defs = DM.svg("defs", {}, svg);
    for (const [id, dev] of [
      ["glow", 4],
      ["glow-soft", 10],
    ]) {
      const f = DM.svg("filter", { id, x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
      DM.svg("feGaussianBlur", { stdDeviation: dev, result: "b" }, f);
      const m = DM.svg("feMerge", {}, f);
      DM.svg("feMergeNode", { in: "b" }, m);
      DM.svg("feMergeNode", { in: "SourceGraphic" }, m);
    }
    return defs;
  };

  DM.softmax = function (scores, t) {
    const z = scores.map((s) => s / (t || 1));
    const m = Math.max(...z);
    const e = z.map((v) => Math.exp(v - m));
    const sum = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / sum);
  };

  /** Choice confidence as defined by TypeSafe: (p_max - 1/n) / (1 - 1/n). */
  DM.choiceConfidence = function (p) {
    const n = p.length;
    const sum = p.reduce((a, b) => a + b, 0) || 1;
    const top = Math.max(...p) / sum;
    return Math.max(0, Math.min(1, (top - 1 / n) / (1 - 1 / n)));
  };

  DM.fmt = (v, d = 2) => v.toFixed(d);
  DM.pct = (v) => `${Math.round(v * 100)} %`;

  /** Syntax-highlight a JSON-ish text block, one <span class="ln"> per line. */
  DM.highlightJson = function (el) {
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

  /** Animate HTML probability bars (.pbars .fill[data-v]). */
  DM.fillBars = function (tl, container, at) {
    container.querySelectorAll(".fill").forEach((f, i) => {
      const v = parseFloat(f.dataset.v || "0");
      tl.fromTo(f, { width: "0%" }, { width: `${v * 100}%`, duration: 0.9, ease: "power3.out" }, (at || 0) + i * 0.12);
    });
  };

  /** Typewriter effect into an element (returns a tween). */
  DM.type = function (el, text, cps) {
    const o = { n: 0 };
    return gsap.to(o, {
      n: text.length,
      duration: text.length / (cps || 40),
      ease: "none",
      onUpdate: () => (el.textContent = text.slice(0, Math.round(o.n))),
    });
  };

  /** Simple hover tooltip helper for SVG charts. */
  DM.tooltip = function (tip, host) {
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

  /* ---------- Ambient background: a slow "latent field" of points ---------- */
  DM.startBackground = function () {
    const canvas = document.getElementById("bg-field");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
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
        c: Math.random() < 0.6 ? "34,211,238" : "167,139,250",
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
