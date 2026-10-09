const LIMIT = 6;

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
  front: cubic(0.16, 0.84, 0.32, 1),
  soak: cubic(0.4, 0, 0.6, 1),
  pool: cubic(0.3, 0.6, 0.3, 1),
  dry: cubic(0.5, 0, 0.7, 0.5)
};

function sample(stops, p, ease) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i += 1) {
    if (p <= stops[i][0]) {
      const a = stops[i - 1];
      const b = stops[i];
      const span = b[0] - a[0];
      const u = ease(span > 0 ? (p - a[0]) / span : 1);
      return a[1] + (b[1] - a[1]) * u;
    }
  }
  return stops[stops.length - 1][1];
}

const WET_SCALE = [[0, 0.1], [0.1, 0.46], [0.24, 0.82], [0.42, 1], [1, 1.06]];
const WET_ALPHA = [[0, 0], [0.04, 0.34], [0.16, 0.6], [0.42, 0.42], [0.7, 0.2], [0.9, 0], [1, 0]];
const RIM_SCALE = [[0, 0.16], [0.12, 0.58], [0.3, 0.94], [0.48, 1.05], [0.86, 1.06], [1, 1.08]];
const RIM_ALPHA = [[0, 0], [0.08, 0], [0.18, 0.5], [0.34, 0.72], [0.5, 0.82], [0.86, 0.8], [0.95, 0], [1, 0]];
const MASS_SCALE = [[0, 0.07], [0.1, 0.3], [0.22, 0.7], [0.34, 1], [0.43, 1.04], [0.86, 1.02], [1, 1.03]];
const MASS_ALPHA = [[0, 0], [0.03, 0.85], [0.14, 0.93], [0.4, 0.9], [0.7, 0.84], [0.86, 0.8], [0.95, 0], [1, 0]];
const SED_ALPHA = [[0, 0], [0.3, 0], [0.46, 0.7], [0.7, 0.9], [0.86, 0.86], [0.95, 0], [1, 0]];
const SED_SCALE = [[0, 0.6], [0.4, 0.92], [0.6, 1.02], [1, 1.04]];
const FLICK_ALPHA = [[0, 0], [0.24, 0], [0.36, 0.5], [0.62, 0.55], [0.86, 0.45], [0.95, 0], [1, 0]];
const FLICK_SCALE = [[0, 0.7], [0.36, 1], [0.7, 1.1], [1, 1.14]];
const VEIL_SCALE = [[0, 0.94], [0.5, 1], [1, 1.07]];
const VEIL_ALPHA = [[0, 0.5], [0.5, 0.92], [1, 0.62]];

const field = document.querySelector('.bloom-field');
const sheet = document.querySelector('.sheet');
const wetLabel = document.getElementById('wetLabel');
const quiet = window.matchMedia('(prefers-reduced-motion: reduce)');
const glaze = document.querySelector('.glaze');
const veil = document.querySelector('.veil-in');
const veilDur = veil ? 46000 : 0;
const veilOff = veil ? 7000 : 0;

const live = [];

function read(node) {
  return {
    node: node,
    dur: (Number(node.dataset.dur) || 24) * 1000,
    off: (Number(node.dataset.off) || 0) * 1000,
    sq: (node.dataset.sq || '1,1').split(',').map(Number),
    rot: Number(node.dataset.rot) || 0,
    wet: node.querySelector('.wet'),
    rim: node.querySelector('.rim'),
    mass: node.querySelector('.mass'),
    sed: node.querySelector('.sed'),
    flick: node.querySelector('.flick')
  };
}

function setScale(node, s, sq, rot) {
  if (!node) return;
  node.style.transform = 'scale(' + (s * sq[0]).toFixed(4) + ',' + (s * sq[1]).toFixed(4) + ') rotate(' + rot + 'deg)';
}

function setAlpha(node, v) {
  if (node) node.style.opacity = v.toFixed(3);
}

function stage(b, p) {
  setScale(b.wet, sample(WET_SCALE, p, EASE.soak), b.sq, b.rot);
  setAlpha(b.wet, sample(WET_ALPHA, p, EASE.soak));
  setScale(b.rim, sample(RIM_SCALE, p, EASE.front), b.sq, b.rot * 0.6);
  setAlpha(b.rim, sample(RIM_ALPHA, p, EASE.pool));
  setScale(b.mass, sample(MASS_SCALE, p, EASE.front), b.sq, b.rot);
  setAlpha(b.mass, sample(MASS_ALPHA, p, EASE.dry));
  setScale(b.sed, sample(SED_SCALE, p, EASE.dry), b.sq, b.rot * 1.7);
  setAlpha(b.sed, sample(SED_ALPHA, p, EASE.dry));
  setScale(b.flick, sample(FLICK_SCALE, p, EASE.front), b.sq, b.rot * 1.3);
  setAlpha(b.flick, sample(FLICK_ALPHA, p, EASE.dry));
}

const pigments = [
  ['rgba(184,92,54,.88)', 'rgba(146,66,42,0)', 'rgba(216,148,104,.5)', 'rgba(216,148,104,0)', 'rgba(132,58,36,.62)', 'rgba(132,58,36,0)'],
  ['rgba(72,94,150,.86)', 'rgba(48,64,110,0)', 'rgba(126,150,200,.5)', 'rgba(126,150,200,0)', 'rgba(44,58,100,.6)', 'rgba(44,58,100,0)'],
  ['rgba(198,146,54,.88)', 'rgba(158,110,32,0)', 'rgba(230,192,120,.5)', 'rgba(230,192,120,0)', 'rgba(150,102,26,.6)', 'rgba(150,102,26,0)'],
  ['rgba(170,72,66,.86)', 'rgba(128,46,46,0)', 'rgba(212,134,126,.48)', 'rgba(212,134,126,0)', 'rgba(118,40,44,.6)', 'rgba(118,40,44,0)'],
  ['rgba(112,138,96,.84)', 'rgba(80,102,68,0)', 'rgba(160,184,138,.46)', 'rgba(160,184,138,0)', 'rgba(76,96,66,.58)', 'rgba(76,96,66,0)'],
  ['rgba(146,96,140,.8)', 'rgba(104,62,104,0)', 'rgba(190,152,186,.44)', 'rgba(190,152,186,0)', 'rgba(96,58,96,.56)', 'rgba(96,58,96,0)']
];

let dragCount = 0;
let dragging = false;
let lastDrop = 0;

function drop(clientX, clientY, force) {
  if (!field || quiet.matches) return;
  if (!force && dragCount >= LIMIT) return;
  if (!force && performance.now() - lastDrop < 90) return;
  lastDrop = performance.now();
  const box = field.getBoundingClientRect();
  if (box.width < 4 || box.height < 4) return;
  const node = document.createElement('div');
  node.className = 'bloom bloom--touch';
  const p = pigments[Math.floor(Math.random() * pigments.length)];
  const w = 13 + Math.random() * 15;
  const rot = Math.round(Math.random() * 72 - 36);
  node.dataset.dur = '9';
  node.dataset.off = '0';
  node.dataset.sq = (0.9 + Math.random() * 0.22).toFixed(2) + ',' + (0.9 + Math.random() * 0.22).toFixed(2);
  node.dataset.rot = String(rot);
  const x = Math.min(88, Math.max(12, ((clientX - box.left) / box.width) * 100));
  const y = Math.min(88, Math.max(12, ((clientY - box.top) / box.height) * 100));
  node.style.cssText = '--x:' + x.toFixed(2) + '%;--y:' + y.toFixed(2) + '%;--w:' + w.toFixed(2) +
    '%;--ar:' + (0.92 + Math.random() * 0.24).toFixed(2) +
    ';--c1:' + p[0] + ';--c2:' + p[1] + ';--c3:' + p[2] + ';--c4:' + p[3] + ';--c5:' + p[4] + ';--c6:' + p[5];
  node.innerHTML = '<span class="wet"></span><span class="rim"><i></i></span><span class="mass"><i></i></span><span class="sed"></span><span class="flick"><i></i></span>';
  field.appendChild(node);
  const b = read(node);
  b.born = performance.now();
  b.life = 8600;
  live.push(b);
  dragCount += 1;
}

if (sheet && !quiet.matches) {
  const wet = function (event) {
    if (event.buttons !== undefined && event.buttons === 0) return;
    drop(event.clientX, event.clientY, false);
  };
  sheet.addEventListener('pointerdown', function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    drop(event.clientX, event.clientY, true);
  });
  sheet.addEventListener('pointermove', function (event) {
    if (dragging) wet(event);
  });
  window.addEventListener('pointerup', function () { dragging = false; });
  window.addEventListener('pointercancel', function () { dragging = false; });
  window.addEventListener('blur', function () { dragging = false; });
}

if (field) {
  const list = Array.prototype.slice.call(field.querySelectorAll('.bloom')).map(read);
  if (quiet.matches) {
    if (wetLabel) wetLabel.textContent = 'blooms held ' + list.length;
  } else {
    let shown = '';
    let last = 0;
    const frame = function (now) {
      if (now - last > 10 || last === 0) {
        last = now;
        for (const b of list) {
          const p = (((now + b.off) % b.dur) + b.dur) % b.dur / b.dur;
          stage(b, p);
        }
        for (let i = live.length - 1; i >= 0; i -= 1) {
          const b = live[i];
          const age = now - b.born;
          const p = age / b.life;
          if (p >= 1) {
            if (b.node.parentNode) b.node.remove();
            live.splice(i, 1);
            dragCount -= 1;
            continue;
          }
          stage(b, p);
        }
        if (veil) {
          const vp = (((now + veilOff) % veilDur) + veilDur) % veilDur / veilDur;
          const vs = sample(VEIL_SCALE, vp, EASE.soak);
          veil.style.transform = 'scale(' + vs.toFixed(4) + ')';
          veil.style.opacity = sample(VEIL_ALPHA, vp, EASE.soak).toFixed(3);
        }
        if (glaze) {
          const d = ((now % 34000) % 34000) / 34000;
          const s = 0.5 - 0.5 * Math.cos(d * Math.PI * 2);
          glaze.style.transform = 'translate3d(' + (-3 + s * 7).toFixed(2) + '%,' + (-2 + s * 5).toFixed(2) + '%,0) scale(' + (1.04 + s * 0.08).toFixed(3) + ')';
        }
        if (wetLabel) {
          let wetNow = 0;
          for (const b of list) {
            const p = (((now + b.off) % b.dur) + b.dur) % b.dur / b.dur;
            if (p > 0.1 && p < 0.8) wetNow += 1;
          }
          wetNow += live.length;
          const text = 'blooms wet ' + wetNow;
          if (text !== shown) {
            shown = text;
            wetLabel.textContent = text;
          }
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
