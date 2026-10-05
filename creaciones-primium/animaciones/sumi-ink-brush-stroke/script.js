const CYCLE = 15000;

const STAGES = [
  [0.02, 'rest'],
  [0.09, 'entry'],
  [0.18, 'press'],
  [0.25, 'flick'],
  [0.33, 'bleed'],
  [0.41, 'bloom'],
  [0.5, 'seal'],
  [0.62, 'settling'],
  [0.78, 'drying'],
  [0.86, 'rinse'],
  [1.01, 'blank']
];

function cubic(x1, y1, x2, y2) {
  if (x1 === y1 && x2 === y2) return function (t) { return t; };
  const ax = 1 - 3 * x2 + 3 * x1, bx = 3 * x2 - 6 * x1, cx = 3 * x1;
  const ay = 1 - 3 * y2 + 3 * y1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
  const fx = function (t) { return ((ax * t + bx) * t + cx) * t; };
  const dfx = function (t) { return (3 * ax * t + 2 * bx) * t + cx; };
  const fy = function (t) { return ((ay * t + by) * t + cy) * t; };
  return function (u) {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let t = u;
    for (let i = 0; i < 6; i += 1) {
      const d = dfx(t);
      if (!d) break;
      const e = fx(t) - u;
      if (e > -0.0005 && e < 0.0005) break;
      t -= e / d;
    }
    return fy(t);
  };
}

const EASE = {
  io: cubic(0.45, 0, 0.55, 1),
  brush: cubic(0.42, 0.02, 0.22, 1),
  flick: cubic(0.3, 0.04, 0.16, 1),
  wick: cubic(0.34, 0.06, 0.2, 1),
  mark: cubic(0.4, 0.04, 0.22, 1),
  settle: cubic(0.32, 0.5, 0.4, 1),
  blot: cubic(0.22, 0.86, 0.26, 1),
  press: cubic(0.24, 0.9, 0.28, 1),
  pop: cubic(0.3, 1.5, 0.5, 1),
  stamp: cubic(0.2, 0.9, 0.2, 1),
  sweep: cubic(0.5, 0, 0.5, 1)
};

function sample(stops, p, ease) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i += 1) {
    if (p <= stops[i][0]) {
      const a = stops[i - 1];
      const b = stops[i];
      const span = b[0] - a[0];
      const u = ease(span > 0 ? (p - a[0]) / span : 1);
      if (Array.isArray(a[1])) {
        const out = [];
        for (let k = 0; k < a[1].length; k += 1) out.push(a[1][k] + (b[1][k] - a[1][k]) * u);
        return out;
      }
      return a[1] + (b[1] - a[1]) * u;
    }
  }
  return stops[stops.length - 1][1];
}

const find = function (sel) { return document.querySelector(sel); };

const el = {
  pigment: find('.pigment'),
  haloFar: find('.halo--far'),
  haloNear: find('.halo--near'),
  ground: find('.ground'),
  fine: find('.fine'),
  swipe: find('.swipe'),
  grain: find('.body-grain'),
  speck: find('.body-speck'),
  belly: find('.belly'),
  wickings: find('.wickings'),
  bristles: find('.flicker'),
  pool: find('.pool-press'),
  blot: find('.blot'),
  tendrils: find('.tendrils'),
  beads: find('.beads'),
  beadsB: find('.beads--b'),
  sheen: find('.sheen'),
  seal: find('.seal'),
  rinse: find('.rinse'),
  light: find('.paper-light'),
  wBody: find('.w-body'),
  wTail: find('.w-tail'),
  wFlick: find('.w-flick'),
  wWick: find('.w-wick'),
  wFan: find('.w-fan'),
  wSwipe: find('.w-swipe'),
  wFine: find('.w-fine')
};

const scale = function (v) { return 'scale(' + v[0].toFixed(4) + ')'; };
const spin = function (v) { return 'scale(' + v[0].toFixed(4) + ') rotate(' + v[1].toFixed(3) + 'deg)'; };
const slide = function (v) { return 'translate3d(' + v[0].toFixed(2) + '%,0,0)'; };

const TRACKS = [
  { el: el.pigment, kind: 'op', ease: EASE.io, stops: [[0, 0], [0.016, 1], [0.84, 1], [0.94, 0], [1, 0]] },

  { el: el.wBody, kind: 'dash', ease: EASE.brush, stops: [[0, 1], [0.02, 1], [0.34, 0], [1, 0]] },
  { el: el.wTail, kind: 'dash', ease: EASE.flick, stops: [[0, 1], [0.32, 1], [0.48, 0], [1, 0]] },
  { el: el.wFlick, kind: 'dash', ease: EASE.flick, stops: [[0, 1], [0.36, 1], [0.435, 0], [1, 0]] },
  { el: el.wWick, kind: 'dash', ease: EASE.wick, stops: [[0, 1], [0.4, 1], [0.53, 0], [1, 0]] },
  { el: el.wFan, kind: 'dash', ease: EASE.wick, stops: [[0, 1], [0.55, 1], [0.68, 0], [1, 0]] },
  { el: el.wSwipe, kind: 'dash', ease: EASE.mark, stops: [[0, 1], [0.44, 1], [0.56, 0], [1, 0]] },
  { el: el.wFine, kind: 'dash', ease: EASE.mark, stops: [[0, 1], [0.48, 1], [0.59, 0], [1, 0]] },

  { el: el.haloFar, kind: 'op', ease: EASE.settle, stops: [[0, 0], [0.11, 0], [0.34, 0.14], [0.66, 0.22], [0.84, 0.2], [0.94, 0], [1, 0]] },
  { el: el.haloFar, kind: 'xf', ease: EASE.settle, fmt: scale, stops: [[0, [1]], [0.84, [1.05]], [1, [1.05]]] },
  { el: el.haloNear, kind: 'op', ease: EASE.settle, stops: [[0, 0], [0.09, 0], [0.28, 0.18], [0.48, 0.32], [0.72, 0.39], [0.84, 0.3], [0.94, 0], [1, 0]] },
  { el: el.haloNear, kind: 'xf', ease: EASE.settle, fmt: scale, stops: [[0, [1]], [0.84, [1.04]], [1, [1.04]]] },

  { el: el.ground, kind: 'op', ease: EASE.settle, stops: [[0, 0], [0.14, 0], [0.36, 0.44], [0.84, 0.38], [0.94, 0], [1, 0]] },
  { el: el.ground, kind: 'xf', ease: EASE.settle, fmt: scale, stops: [[0, [0.9]], [0.36, [1]], [0.84, [1.04]], [1, [1.04]]] },

  { el: el.fine, kind: 'op', ease: EASE.mark, stops: [[0, 0], [0.48, 0], [0.59, 0.8], [0.84, 0.72], [0.94, 0], [1, 0]] },
  { el: el.swipe, kind: 'op', ease: EASE.mark, stops: [[0, 0], [0.44, 0], [0.56, 0.72], [0.84, 0.64], [0.94, 0], [1, 0]] },

  { el: el.grain, kind: 'op', ease: EASE.settle, stops: [[0, 0], [0.12, 0], [0.4, 0.5], [0.72, 0.82], [0.84, 0.72], [0.94, 0], [1, 0]] },
  { el: el.speck, kind: 'op', ease: EASE.settle, stops: [[0, 0], [0.22, 0], [0.5, 0.44], [0.8, 0.4], [0.94, 0], [1, 0]] },
  { el: el.belly, kind: 'op', ease: EASE.io, stops: [[0, 0], [0.08, 0], [0.3, 0.95], [0.64, 0.5], [0.84, 0.42], [0.94, 0], [1, 0]] },

  { el: el.wickings, kind: 'op', ease: EASE.mark, stops: [[0, 0], [0.42, 0], [0.54, 0.6], [0.84, 0.48], [0.94, 0], [1, 0]] },
  { el: el.bristles, kind: 'op', ease: EASE.flick, stops: [[0, 0], [0.37, 0], [0.45, 0.88], [0.84, 0.78], [0.94, 0], [1, 0]] },

  { el: el.pool, kind: 'op', ease: EASE.press, stops: [[0, 0], [0.24, 0], [0.29, 1], [0.34, 0.96], [0.84, 0.9], [0.94, 0], [1, 0]] },
  { el: el.pool, kind: 'xf', ease: EASE.press, fmt: scale, stops: [[0, [0.12]], [0.29, [1.14]], [0.34, [1]], [0.84, [1.01]], [1, [1.01]]] },

  { el: el.blot, kind: 'op', ease: EASE.blot, stops: [[0, 0], [0.55, 0], [0.62, 1], [0.67, 1], [0.84, 0.95], [0.94, 0], [1, 0]] },
  { el: el.blot, kind: 'xf', ease: EASE.blot, fmt: scale, stops: [[0, [0.16]], [0.62, [1.12]], [0.67, [0.95]], [0.76, [1.01]], [0.84, [1]], [1, [1]]] },

  { el: el.tendrils, kind: 'op', ease: EASE.mark, stops: [[0, 0], [0.56, 0], [0.68, 0.76], [0.84, 0.64], [0.94, 0], [1, 0]] },

  { el: el.beads, kind: 'op', ease: EASE.pop, stops: [[0, 0], [0.57, 0], [0.62, 1], [0.84, 0.9], [0.94, 0], [1, 0]] },
  { el: el.beads, kind: 'xf', ease: EASE.pop, fmt: scale, stops: [[0, [0.2]], [0.62, [1.2]], [0.67, [1]], [0.84, [1]], [1, [1]]] },
  { el: el.beadsB, kind: 'op', ease: EASE.pop, stops: [[0, 0], [0.59, 0], [0.645, 1], [0.84, 0.9], [0.94, 0], [1, 0]] },
  { el: el.beadsB, kind: 'xf', ease: EASE.pop, fmt: scale, stops: [[0, [0.2]], [0.645, [1.2]], [0.69, [1]], [0.84, [1]], [1, [1]]] },

  { el: el.sheen, kind: 'op', ease: EASE.brush, stops: [[0, 0], [0.04, 1], [0.34, 0.9], [0.37, 0], [1, 0]] },
  { el: el.sheen, kind: 'xf', ease: EASE.brush, fmt: function (v) { return 'translate3d(' + v[0].toFixed(1) + 'px,0,0)'; }, stops: [[0, [0]], [0.34, [730]], [1, [730]]] },

  { el: el.seal, kind: 'op', ease: EASE.stamp, stops: [[0, 0], [0.6, 0], [0.66, 0.95], [0.71, 0.9], [0.84, 0.84], [0.92, 0], [1, 0]] },
  { el: el.seal, kind: 'xf', ease: EASE.stamp, fmt: spin, stops: [[0, [1.34, -5]], [0.66, [0.97, 0.6]], [0.71, [1, 0]], [0.84, [1, 0]], [1, [1, 0]]] },

  { el: el.rinse, kind: 'op', ease: EASE.sweep, stops: [[0, 0], [0.84, 0], [0.88, 0.6], [0.93, 0.5], [0.96, 0], [1, 0]] },
  { el: el.rinse, kind: 'xf', ease: EASE.sweep, fmt: slide, stops: [[0, [-34]], [0.84, [-34]], [0.93, [34]], [1, [34]]] }
];

const phaseOut = document.getElementById('phaseLabel');
const lenOut = document.getElementById('lenLabel');
const measure = document.querySelector('.measure');
const quiet = window.matchMedia('(prefers-reduced-motion: reduce)');

if (lenOut && measure && typeof measure.getTotalLength === 'function') {
  const value = measure.getTotalLength();
  if (value > 0) lenOut.textContent = Math.round(value) + ' units';
}

let shown = '';

function paint(p) {
  for (const t of TRACKS) {
    if (!t.el) continue;
    const v = sample(t.stops, p, t.ease);
    if (t.kind === 'op') t.el.style.opacity = v.toFixed(3);
    else if (t.kind === 'dash') t.el.style.strokeDashoffset = v.toFixed(4);
    else t.el.style.transform = t.fmt(v);
  }
  if (phaseOut) {
    let name = STAGES[0][1];
    for (const stage of STAGES) {
      if (p < stage[0]) {
        name = stage[1];
        break;
      }
    }
    const text = name + ' ' + Math.round(p * 100) + '%';
    if (text !== shown) {
      shown = text;
      phaseOut.textContent = text;
    }
  }
}

if (quiet.matches) {
  if (phaseOut) phaseOut.textContent = 'held still';
} else {
  let last = 0;
  const frame = function (now) {
    const t = now || performance.now();
    const drift = (t % 28000) / 28000;
    const swing = 0.5 - 0.5 * Math.cos(drift * Math.PI * 2);
    if (el.light) el.light.style.transform = 'translate3d(' + (-2 + swing * 5).toFixed(2) + '%,' + (-1 + swing * 3).toFixed(2) + '%,0) scale(' + (1.02 + swing * 0.06).toFixed(3) + ')';
    if (t - last > 8 || last === 0) {
      last = t;
      paint(((t % CYCLE) + CYCLE) % CYCLE / CYCLE);
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
