/* Chart helpers and shared data for this deck (classic script, hangs off Deck.F).
   SVG stages use viewBoxes equal to their CSS pixel size, so 1 unit = 1 px. */
(function () {
  const Deck = window.Deck;
  const C = Deck.colors;
  const F = (Deck.F = {});

  /** Spanish number format: 1.234,5 with a true minus sign; thousands always grouped. */
  F.num = function (v, dec) {
    const d = dec || 0;
    const s = Math.abs(v).toFixed(d);
    const parts = s.split(".");
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (v < 0 && Math.abs(v) >= Math.pow(10, -d) / 2 ? "−" : "") + int + (parts[1] ? "," + parts[1] : "");
  };

  /** Create an SVG element, skipping null/undefined attributes. */
  F.el = function (tag, attrs, parent) {
    const clean = {};
    for (const [k, v] of Object.entries(attrs || {})) if (v !== null && v !== undefined) clean[k] = v;
    return Deck.svg(tag, clean, parent);
  };

  /** Text with deck defaults. o: size, fill, anchor, weight, font, style, baseline */
  F.text = function (parent, x, y, text, o) {
    o = o || {};
    return F.el(
      "text",
      {
        x,
        y,
        text,
        "font-family": o.font || Deck.BODY,
        "font-size": o.size || 18,
        "font-weight": o.weight || 400,
        "font-style": o.style,
        fill: o.fill || C.text2,
        "text-anchor": o.anchor || "start",
        "dominant-baseline": o.baseline,
        "letter-spacing": o.spacing,
        opacity: o.opacity,
      },
      parent,
    );
  };

  F.line = function (parent, x1, y1, x2, y2, o) {
    o = o || {};
    return F.el(
      "line",
      { x1, y1, x2, y2, stroke: o.stroke || C.line, "stroke-width": o.w || 1, "stroke-dasharray": o.dash, "stroke-linecap": o.cap, opacity: o.opacity },
      parent,
    );
  };

  F.rect = function (parent, x, y, w, h, o) {
    o = o || {};
    return F.el(
      "rect",
      { x, y, width: Math.max(0, w), height: Math.max(0, h), rx: o.rx === undefined ? 3 : o.rx, fill: o.fill || C.accent, stroke: o.stroke, "stroke-width": o.sw, "stroke-dasharray": o.dash, opacity: o.opacity },
      parent,
    );
  };

  F.path = function (parent, d, o) {
    o = o || {};
    return F.el(
      "path",
      { d, fill: o.fill || "none", stroke: o.stroke || C.accent, "stroke-width": o.w || 2, "stroke-linejoin": "round", "stroke-linecap": "round", "stroke-dasharray": o.dash, opacity: o.opacity },
      parent,
    );
  };

  /** Linear scale. */
  F.scale = function (d0, d1, r0, r1) {
    const f = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
    f.inv = (p) => d0 + ((p - r0) / (r1 - r0)) * (d1 - d0);
    return f;
  };

  /** Log10 scale. */
  F.logScale = function (d0, d1, r0, r1) {
    const l0 = Math.log10(d0),
      l1 = Math.log10(d1);
    return (v) => r0 + ((Math.log10(v) - l0) / (l1 - l0)) * (r1 - r0);
  };

  /** Polyline path through points [[x,y],...]. */
  F.poly = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");

  /** Fresh svg in a stage with an explicit size (1 unit = 1 css px). */
  F.stage = function (slide, sel, w, h) {
    const el = slide.querySelector(sel);
    return Deck.stageSvg(el, w, h);
  };

  /** Grow a vertical bar from its baseline. Bar must be drawn at its final geometry. */
  F.growV = function (tl, rect, at, dur, fromY) {
    const y = parseFloat(rect.getAttribute("y"));
    const h = parseFloat(rect.getAttribute("height"));
    const base = fromY === undefined ? y + h : fromY;
    const startY = base > y + h / 2 ? y + h : y; // positive bars grow up, negative grow down
    tl.fromTo(rect, { attr: { y: startY, height: 0 } }, { attr: { y, height: h }, duration: dur || 0.6, ease: "power3.out" }, at);
  };

  /** Grow a horizontal bar from its left (or right if fromRight). */
  F.growH = function (tl, rect, at, dur, fromRight) {
    const x = parseFloat(rect.getAttribute("x"));
    const w = parseFloat(rect.getAttribute("width"));
    tl.fromTo(rect, { attr: { x: fromRight ? x + w : x, width: 0 } }, { attr: { x, width: w }, duration: dur || 0.7, ease: "power3.out" }, at);
  };

  /** Fade + rise for a group of svg/html elements. */
  F.pop = function (tl, els, at, o) {
    o = o || {};
    tl.fromTo(els, { opacity: 0, y: o.y === undefined ? 10 : o.y }, { opacity: 1, y: 0, duration: o.dur || 0.45, stagger: o.stagger || 0, ease: "power2.out" }, at);
  };

  /** Simple fade-in (svg-safe: no transforms). */
  F.fade = function (tl, els, at, o) {
    o = o || {};
    tl.fromTo(els, { opacity: 0 }, { opacity: o.to === undefined ? 1 : o.to, duration: o.dur || 0.45, stagger: o.stagger || 0 }, at);
  };

  /** Hide up front, reveal later (for stepped slides). */
  F.hide = (els) => gsap.set(els, { opacity: 0 });
  F.show = function (tl, els, at, o) {
    o = o || {};
    tl.to(els, { opacity: o.to === undefined ? 1 : o.to, duration: o.dur || 0.45, stagger: o.stagger || 0 }, at);
  };

  /** Counter into a text node / element with Spanish formatting. */
  F.count = function (tl, el, from, to, at, o) {
    o = o || {};
    const st = { v: from };
    const fmt = o.fmt || ((v) => F.num(v, o.dec || 0));
    el.textContent = fmt(from);
    tl.fromTo(st, { v: from }, { v: to, duration: o.dur || 1, ease: o.ease || "power2.out", onUpdate: () => (el.textContent = fmt(st.v)) }, at);
  };

  /** Horizontal gridlines + y labels. */
  F.yAxis = function (g, sy, ticks, x0, x1, o) {
    o = o || {};
    ticks.forEach((t) => {
      F.line(g, x0, sy(t), x1, sy(t), { stroke: t === 0 ? C.lineStrong : C.line, w: t === 0 ? 1.4 : 1 });
      F.text(g, x0 - 10, sy(t) + 6, (o.fmt || ((v) => F.num(v)))(t), { size: o.size || 16, anchor: "end", fill: C.muted, font: Deck.MONO });
    });
  };

  /** Clip-path rect for progressive reveals; returns the rect (animate its width). */
  F.clip = function (svg, id, x, y, w, h) {
    const defs = svg.querySelector("defs") || F.el("defs", {}, svg);
    const cp = F.el("clipPath", { id }, defs);
    return F.el("rect", { x, y, width: w, height: h }, cp);
  };

  /* ---------------- Shared data (see research/) ---------------- */

  // MSCI World, gross annual return in USD, 1970-2025 (research/rentabilidades-historicas.md §2)
  F.msciWorld = [
    -1.98, 19.56, 23.55, -14.51, -24.48, 34.5, 14.71, 5.0, 18.22, 12.67, 27.72, -3.3, 11.27, 23.28, 5.77, 41.77, 42.8, 16.76, 23.95, 17.19, -16.52, 18.97, -4.66,
    23.13, 5.58, 21.32, 14.0, 16.23, 24.8, 25.34, -12.92, -16.52, -19.54, 33.76, 15.25, 10.02, 20.65, 9.57, -40.33, 30.79, 12.34, -5.02, 16.54, 27.37, 5.5, -0.32,
    8.15, 23.07, -8.2, 28.4, 16.5, 22.35, -17.73, 24.42, 19.19, 21.6,
  ];

  /** Cumulative growth of 1 unit with annual returns (%). Returns [1, ...]. */
  F.cumulative = function (rets) {
    const out = [1];
    rets.forEach((r) => out.push(out[out.length - 1] * (1 + r / 100)));
    return out;
  };

  /** Future value of a monthly contribution with annual effective rate r over `years`. */
  F.fvMonthly = function (pmt, r, months) {
    const i = Math.pow(1 + r, 1 / 12) - 1;
    return pmt * ((Math.pow(1 + i, months) - 1) / i);
  };
})();
