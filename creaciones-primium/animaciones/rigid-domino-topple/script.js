const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d', { alpha: false });
const stateEl = document.getElementById('chainState');
const barEl = document.getElementById('chainBar');
const downEl = document.getElementById('downCount');
const impactEl = document.getElementById('impactCount');
const metaEl = document.getElementById('metaStamp');
const replayBtn = document.getElementById('replay');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const G_ACC = 30;
const REST = 1.5;
const MAX_OM = 9.2;
const ACENTOS = ['#ff9d5c', '#ffd08a', '#7fd8e6'];
const STEP = 1 / 240;
const IDLE_T = 0.8;
const HOLD_T = 1.5;
const RESET_STAGGER = 0.019;
const RESET_DUR = 0.44;
const RINGS = 72;
const DUST = 190;

const STATE_IDLE = 0;
const STATE_RUN = 1;
const STATE_HOLD = 2;
const STATE_RESET = 3;
const LABELS = ['Primed', 'Cascading', 'Settled', 'Rebuilding'];

const D = [];
let order = [];
let motes = [];
let W = 0;
let H = 0;
let yJ = 0;
let slabGrad = null;
let grainPattern = null;
let vignette = null;
let state = STATE_IDLE;
let stateT = 0;
let clock = 0;
let acc = 0;
let impacts = 0;
let lastDown = -1;
let lastImpacts = -1;
let lastLabel = '';
let lastPct = -1;

const ring = new Array(RINGS);
for (let i = 0; i < RINGS; i++) ring[i] = { on: false, x: 0, y: 0, t0: 0, life: 1 };
const mote = new Array(DUST);
for (let i = 0; i < DUST; i++) mote[i] = { on: false, x: 0, y: 0, vx: 0, vy: 0, r: 0, t0: 0, life: 1 };
let ringPtr = 0;
let motePtr = 0;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5 | 0);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function easeOutBack(p) {
  const c1 = 1.7;
  const c3 = c1 + 1;
  const q = p - 1;
  return 1 + c3 * q * q * q + c1 * q * q;
}

function rrect(x, y, w, h, r) {
  const k = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.lineTo(x + w - k, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + k);
  ctx.lineTo(x + w, y + h - k);
  ctx.quadraticCurveTo(x + w, y + h, x + w - k, y + h);
  ctx.lineTo(x + k, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - k);
  ctx.lineTo(x, y + k);
  ctx.quadraticCurveTo(x, y, x + k, y);
  ctx.closePath();
}

function buildGrain() {
  const tile = document.createElement('canvas');
  const size = 146;
  tile.width = size;
  tile.height = size;
  const g = tile.getContext('2d');
  const im = g.createImageData(size, size);
  const rnd = mulberry32(0x51aa);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = (rnd() * 255 | 0);
    im.data[i] = v;
    im.data[i + 1] = v;
    im.data[i + 2] = v;
    im.data[i + 3] = rnd() > 0.45 ? 255 : 0;
  }
  g.putImageData(im, 0, 0);
  grainPattern = ctx.createPattern(tile, 'repeat');
}

function layout() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(160, Math.round(rect.width));
  H = Math.max(140, Math.round(rect.height));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  yJ = H * 0.46;

  const h = Math.min(H * 0.46, W * 0.3);
  const t = Math.max(3.4, h * 0.15);
  const step = h * 0.245;
  const x0 = W * 0.055;
  const x1 = W * 0.945;
  const yB = H * 0.775;
  const NS = 1400;
  const px = new Float64Array(NS + 1);
  const py = new Float64Array(NS + 1);
  for (let i = 0; i <= NS; i++) {
    const u = i / NS;
    px[i] = x0 + u * (x1 - x0);
    py[i] = yB - H * 0.08 * Math.sin(u * Math.PI) + H * 0.015 * Math.sin(u * Math.PI * 2);
  }

  D.length = 0;
  let run = 0;
  const rnd = mulberry32(0x2c4f);
  for (let i = 1; i <= NS; i++) {
    run += Math.hypot(px[i] - px[i - 1], py[i] - py[i - 1]);
    if (run >= step) {
      const ia = Math.max(0, i - 3);
      const ib = Math.min(NS, i + 3);
      const a = Math.atan2(py[ib] - py[ia], px[ib] - px[ia]);
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      D.push({
        x: px[i],
        y: py[i],
        a: a,
        px: px[i] + ca * t * 0.5,
        py: py[i] + sa * t * 0.5,
        tx: ca,
        ty: sa,
        h: h,
        t: t,
        th: 0,
        om: 0,
        tau: 0,
        sq: 1,
        hit: -1,
        on: false,
        // El acento se repite cada tres fichas; la tabla evita el ternario anidado.
        accent: ACENTOS[i % 3]
      });
      run = 0;
      if (D.length >= 48) break;
    }
  }

  const n = D.length;
  order.length = 0;
  for (let i = 0; i < n; i++) order.push(i);
  order.sort(function (p, q) {
    return D[p].y + (n - 1 - p) * 0.5 - (D[q].y + (n - 1 - q) * 0.5);
  });

  const nr = Math.round(Math.min(34, Math.max(12, W / 46)));
  motes = [];
  for (let i = 0; i < nr; i++) {
    motes.push({
      x: rnd() * W,
      y: rnd() * yJ,
      r: 0.6 + rnd() * 1.5,
      sp: 3 + rnd() * 9,
      dx: (rnd() - 0.5) * 7,
      a: 0.1 + rnd() * 0.24,
      ph: rnd() * 6.283
    });
  }

  slabGrad = ctx.createLinearGradient(-t * 0.5, -h, t * 0.5, 0);
  slabGrad.addColorStop(0, '#fdf4e6');
  slabGrad.addColorStop(0.34, '#e7d8c7');
  slabGrad.addColorStop(0.78, '#c0a898');
  slabGrad.addColorStop(1, '#8e7686');

  vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.24, W * 0.5, H * 0.52, Math.max(W, H) * 0.76);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.62, 'rgba(9,5,10,0.24)');
  vignette.addColorStop(1, 'rgba(6,3,7,0.86)');

  if (!grainPattern) buildGrain();
  downEl.textContent = '0 / ' + n + ' down';
  lastDown = 0;
  metaEl.textContent = G_ACC.toFixed(1) + ' rad/s²';
}

function armRun() {
  for (const d of D) {
    d.th = 0;
    d.om = 0;
    d.tau = 0;
    d.sq = 1;
    d.hit = -1;
    d.on = false;
  }
  for (let i = 0; i < RINGS; i++) ring[i].on = false;
  for (let i = 0; i < DUST; i++) mote[i].on = false;
  impacts = 0;
  acc = 0;
  state = STATE_RUN;
  stateT = 0;
}

function pushRing(x, y, delay, life) {
  const r = ring[ringPtr];
  ringPtr = (ringPtr + 1) % RINGS;
  r.on = true;
  r.x = x;
  r.y = y;
  r.t0 = clock + delay;
  r.life = life;
}

function pushDust(x, y, seed) {
  const rnd = mulberry32(0x1000 + seed * 977);
  for (let k = 0; k < 7; k++) {
    const p = mote[motePtr];
    motePtr = (motePtr + 1) % DUST;
    const ang = -0.5 + rnd() * 1.0;
    const sp = 14 + rnd() * 46;
    p.on = true;
    p.x = x + (rnd() - 0.5) * 6;
    p.y = y;
    p.vx = Math.cos(ang) * sp * 0.5;
    p.vy = Math.sin(ang) * sp;
    p.r = 0.7 + rnd() * 1.7;
    p.t0 = clock;
    p.life = 0.45 + rnd() * 0.5;
  }
}

function step(dt) {
  const n = D.length;
  for (let i = 0; i < n; i++) {
    const d = D[i];
    if (d.hit >= 0) {
      d.tau += dt;
      const amp = 0.145 * Math.exp(-6.2 * d.tau);
      d.th = REST - (d.tau < 0.55 ? amp * Math.sin(24 * d.tau) : 0);
      d.sq = d.tau < 0.4 ? 1 - 0.08 * Math.exp(-11 * d.tau) : 1;
      continue;
    }
    if (!d.on) {
      if (i === 0) {
        d.on = true;
        d.om = 1;
      } else {
        const pr = D[i - 1];
        const ang = pr.a + pr.th;
        const wx = pr.px + pr.h * Math.sin(ang);
        const wy = pr.py - pr.h * Math.cos(ang);
        if ((wx - d.px) * d.tx + (wy - d.py) * d.ty >= -d.t * 0.95) {
          d.on = true;
          d.om = Math.min(1.3, 0.3 * pr.om + 0.62);
        }
      }
      if (!d.on) continue;
    }
    d.om += G_ACC * Math.sin(d.th) * dt;
    if (d.om > MAX_OM) d.om = MAX_OM;
    d.th += d.om * dt;
    if (d.th >= REST) {
      d.th = REST;
      d.hit = 0;
      d.tau = 0;
      d.sq = 0.9;
      impacts++;
      pushRing(d.px, d.py, 0, 0.62);
      pushRing(d.px, d.py, 0.07, 0.8);
      pushDust(d.px, d.py, i + impacts * 31);
    }
  }
}

function allDown() {
  for (const d of D) if (d.hit < 0) return false;
  return true;
}

function drawSlab(d, alpha, flip) {
  const t = d.t;
  const h = d.h * d.sq;
  ctx.save();
  ctx.translate(d.px, d.py);
  if (flip) ctx.scale(1, -1);
  ctx.rotate(d.a + d.th);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = slabGrad;
  rrect(-t, -h, t, h, t * 0.3);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.6;
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.fillRect(-t * 0.8, -h * 0.97, t * 0.15, h * 0.97);
  ctx.globalAlpha = alpha * 0.35;
  ctx.fillStyle = 'rgba(46,24,52,0.7)';
  ctx.fillRect(-t * 0.26, -h * 0.97, t * 0.1, h * 0.97);
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = 'rgba(30,16,34,0.75)';
  ctx.fillRect(-t, -h * 0.5, t, Math.max(1, t * 0.11));
  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = d.accent;
  ctx.beginPath();
  ctx.arc(-t * 0.5, -h * 0.5, t * 0.16, 0, 6.2831853);
  ctx.fill();
  ctx.globalAlpha = alpha * 0.8;
  ctx.strokeStyle = 'rgba(26,14,30,0.7)';
  ctx.lineWidth = 1;
  rrect(-t, -h, t, h, t * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawBackdrop(focus) {
  const wall = ctx.createLinearGradient(0, 0, 0, yJ);
  wall.addColorStop(0, '#140d1d');
  wall.addColorStop(0.5, '#1d1327');
  wall.addColorStop(1, '#251729');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, yJ + 1);

  if (focus > 0) {
    const pool = ctx.createRadialGradient(focus, yJ * 0.98, 0, focus, yJ * 0.98, Math.max(W, H) * 0.34);
    pool.addColorStop(0, 'rgba(255,182,116,' + (0.2 * focus).toFixed(3) + ')');
    pool.addColorStop(0.45, 'rgba(255,132,88,' + (0.07 * focus).toFixed(3) + ')');
    pool.addColorStop(1, 'rgba(255,120,90,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, W, yJ + 1);
  }

  ctx.globalAlpha = 0.055;
  ctx.fillStyle = '#ffcf9e';
  for (let x = 0; x < W; x += Math.max(28, W / 26)) ctx.fillRect(x, 0, 1, yJ);
  ctx.globalAlpha = 1;

  const table = ctx.createLinearGradient(0, yJ, 0, H);
  table.addColorStop(0, '#33202b');
  table.addColorStop(0.18, '#241620');
  table.addColorStop(0.62, '#150e16');
  table.addColorStop(1, '#09070d');
  ctx.fillStyle = table;
  ctx.fillRect(0, yJ, W, H - yJ);

  for (let k = 1; k <= 10; k++) {
    const t = k / 10;
    const y = yJ + (H - yJ) * Math.pow(t, 1.9);
    ctx.globalAlpha = 0.07 * (1 - t * 0.55);
    ctx.fillStyle = '#ffc79a';
    ctx.fillRect(0, y, W, 1);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,190,140,0.14)';
  ctx.fillRect(0, yJ - 1, W, 2);

  const sheen = ctx.createRadialGradient(W * 0.5, H * 0.9, 0, W * 0.5, H * 0.9, Math.max(W, H) * 0.42);
  sheen.addColorStop(0, 'rgba(255,190,140,0.1)');
  sheen.addColorStop(1, 'rgba(255,190,140,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, yJ, W, H - yJ);
}

function drawFX(fade) {
  for (let i = 0; i < RINGS; i++) {
    const r = ring[i];
    if (!r.on) continue;
    const p = (clock - r.t0) / r.life;
    if (p >= 1) {
      r.on = false;
      continue;
    }
    if (p < 0) continue;
    const e = 1 - Math.pow(1 - p, 2.6);
    const rad = 5 + e * 62;
    ctx.globalAlpha = (1 - p) * 0.46 * fade;
    ctx.strokeStyle = 'rgba(255,196,138,1)';
    ctx.lineWidth = 2.4 * (1 - p) + 0.4;
    ctx.beginPath();
    ctx.ellipse(r.x, r.y, rad, rad * 0.29, 0, 0, 6.2831853);
    ctx.stroke();
  }
  for (let i = 0; i < DUST; i++) {
    const p = mote[i];
    if (!p.on) continue;
    const q = (clock - p.t0) / p.life;
    if (q >= 1) {
      p.on = false;
      continue;
    }
    ctx.globalAlpha = (1 - q) * 0.5 * fade;
    ctx.fillStyle = '#f0d2b4';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (0.5 + q * 1.5), 0, 6.2831853);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function draw(dt) {
  let focus = 0;
  let focusX = 0;
  if (state === STATE_RUN || state === STATE_RESET) {
    for (let i = D.length - 1; i >= 0; i--) {
      if (D[i].hit < 0) {
        focusX = D[i].x;
        focus = 1;
        break;
      }
    }
  } else {
    for (const d of D) {
      if (d.hit < 0) {
        focusX = d.x;
        focus = 1;
        break;
      }
    }
  }

  drawBackdrop(focus);

  for (const m of motes) {
    const y = m.y - ((clock * m.sp) % (yJ + 40));
    const x = m.x + Math.sin(clock * 0.5 + m.ph) * 9;
    ctx.globalAlpha = m.a * (0.5 + 0.5 * Math.sin(clock * 1.3 + m.ph));
    ctx.fillStyle = '#ffd9b0';
    ctx.beginPath();
    ctx.arc(x, y < -20 ? y + yJ + 40 : y, m.r, 0, 6.2831853);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  if (focus > 0) {
    const halo = ctx.createRadialGradient(focusX, yJ, 0, focusX, yJ, H * 0.2);
    halo.addColorStop(0, 'rgba(255,170,110,0.14)');
    halo.addColorStop(1, 'rgba(255,170,110,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(focusX - H * 0.2, yJ - 2, H * 0.4, H * 0.24);
  }

  for (const idx of order) {
    const d = D[idx];
    const c = Math.cos(d.th);
    drawSlab(d, c > 0.04 ? 0.16 * Math.pow(c, 1.2) : 0, true);
  }

  const fadeGrad = ctx.createLinearGradient(0, H * 0.7, 0, H);
  fadeGrad.addColorStop(0, 'rgba(10,7,13,0)');
  fadeGrad.addColorStop(1, 'rgba(8,5,11,0.92)');
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(0, H * 0.7, W, H * 0.3);

  for (const idx of order) {
    const d = D[idx];
    const reach = Math.max(0, d.h * Math.sin(d.a + d.th));
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = '#070409';
    ctx.beginPath();
    ctx.ellipse(
      d.px + reach * 0.5 * d.tx,
      d.py + reach * 0.5 * d.ty,
      reach * 0.5 + d.t * 0.8,
      d.t * 0.78,
      d.a,
      0,
      6.2831853
    );
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const idx of order) drawSlab(D[idx], 1, false);

  drawFX(state === STATE_RESET ? Math.max(0, 1 - stateT / 0.3) : 1);

  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  if (grainPattern) {
    const ox = (Math.random() * 146 | 0);
    const oy = (Math.random() * 146 | 0);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.055;
    ctx.translate(ox, oy);
    ctx.fillStyle = grainPattern;
    ctx.fillRect(-ox, -oy, W, H);
    ctx.restore();
  }

  let down = 0;
  for (const d of D) if (d.hit >= 0) down++;
  if (down !== lastDown) {
    lastDown = down;
    downEl.textContent = down + ' / ' + D.length + ' down';
  }
  if (impacts !== lastImpacts) {
    lastImpacts = impacts;
    impactEl.textContent = impacts + ' impacts';
  }
  const label = LABELS[state];
  if (label !== lastLabel) {
    lastLabel = label;
    stateEl.textContent = label;
  }
  let pct;
  if (state === STATE_IDLE) pct = 0;
  else if (state === STATE_HOLD) pct = 100;
  else if (state === STATE_RESET) pct = 0;
  else {
    const lead = D.length ? D[D.length - 1].th / REST : 0;
    pct = Math.max(0, Math.min(100, Math.round(lead * 100)));
  }
  if (pct !== lastPct) {
    lastPct = pct;
    barEl.style.transform = 'scaleX(' + (pct / 100).toFixed(3) + ')';
  }
}

function tick(dt) {
  clock += dt;
  stateT += dt;

  if (state === STATE_IDLE) {
    if (stateT >= IDLE_T) armRun();
  } else if (state === STATE_RUN) {
    acc += dt;
    let guard = 0;
    while (acc >= STEP && guard < 48) {
      step(STEP);
      acc -= STEP;
      guard++;
    }
    if (allDown()) {
      state = STATE_HOLD;
      stateT = 0;
    }
  } else if (state === STATE_HOLD) {
    if (stateT >= HOLD_T) {
      state = STATE_RESET;
      stateT = 0;
    }
  } else if (state === STATE_RESET) {
    const n = D.length;
    for (let i = 0; i < n; i++) {
      const d = D[i];
      let p = (stateT - (n - 1 - i) * RESET_STAGGER) / RESET_DUR;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      if (p >= 1) {
        d.th = 0;
        d.sq = 1;
        d.hit = -1;
        d.on = false;
        d.om = 0;
        d.tau = 0;
      } else {
        d.th = REST * (1 - easeOutBack(p));
        d.sq = 1;
      }
    }
    if (stateT >= (n - 1) * RESET_STAGGER + RESET_DUR + 0.06) {
      state = STATE_IDLE;
      stateT = 0;
    }
  }

  for (let i = 0; i < DUST; i++) {
    const p = mote[i];
    if (!p.on) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
    p.vx *= 0.965;
  }
}

let last = 0;
function frame(now) {
  if (!last) last = now;
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.06) dt = 0.06;
  if (dt < 0) dt = 0;
  if (!document.hidden) {
    tick(dt);
    draw(dt);
  }
  requestAnimationFrame(frame);
}

function replay() {
  if (REDUCED) {
    for (const d of D) {
      d.th = REST;
      d.hit = 0;
      d.sq = 1;
    }
    state = STATE_HOLD;
    stateT = 0;
    draw(0);
    return;
  }
  last = 0;
  armRun();
}

canvas.addEventListener('pointerdown', function (e) {
  e.preventDefault();
  replay();
});

canvas.addEventListener('keydown', function (e) {
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
    e.preventDefault();
    replay();
  }
});

replayBtn.addEventListener('click', function (e) {
  e.stopPropagation();
  replay();
});

layout();

if (REDUCED) {
  for (const d of D) {
    d.th = REST;
    d.hit = 0;
    d.sq = 1;
  }
  state = STATE_HOLD;
  stateT = 0;
  impacts = D.length;
  clock = 0.2;
  draw(0);
} else {
  requestAnimationFrame(frame);
}

let resizeTimer = 0;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    layout();
    if (REDUCED) {
      for (const d of D) {
        d.th = REST;
        d.hit = 0;
        d.sq = 1;
      }
      impacts = D.length;
      state = STATE_HOLD;
      draw(0);
    }
  }, 140);
});
