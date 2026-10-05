const trace = document.getElementById('trace');
const tctx = trace.getContext('2d', { alpha: false });
const strip = document.getElementById('strip');
const sctx = strip.getContext('2d', { alpha: false });
const bpmEl = document.getElementById('bpm');
const rrEl = document.getElementById('rrVal');
const beatEl = document.getElementById('beatVal');
const heartEl = document.getElementById('heart');
const ringEl = document.getElementById('ring');
const phaseEl = document.getElementById('phaseBar');
const phaseSpans = phaseEl.querySelectorAll('span');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const GAUSS = [
  [0.155, 0.03, 0.13],
  [0.243, 0.0105, -0.11],
  [0.264, 0.0118, 1.0],
  [0.288, 0.0148, -0.31],
  [0.445, 0.048, 0.27]
];
const R_LO = 0.256;
const R_HI = 0.284;
const TAU = 6.283185307179586;
const BASE_BPM = 72;
const LABELS = [
  [0.1, 0.215, 0],
  [0.215, 0.352, 1],
  [0.352, 0.585, 2]
];
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

let cols = 0;
let W = 0;
let H = 0;
let SW = 0;
let SH = 0;
let minor = 9;
let baseY = 0;
let amp = 0;
let YS = new Float32Array(0);
let paperLayer = document.createElement('canvas');
let stripLayer = document.createElement('canvas');
let vignette = null;
let headX = 0;
let bpmNow = BASE_BPM;
let bpmTarget = BASE_BPM;
let beats = 0;
let rFired = true;
let lastBpm = -1;
let lastPhase = -1;
let lastBeat = -1;
let clock = 0;
let stripX0 = 0;
let stripX1 = 0;
let stripYS = new Float32Array(0);
let stripAmp = 0;
let stripBase = 0;
let grainPattern = null;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5 | 0);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wave(u) {
  let v = 0;
  for (let i = 0; i < 5; i++) {
    const g = GAUSS[i];
    const d = u - g[0];
    v += g[2] * Math.exp(-(d * d) / (2 * g[1] * g[1]));
  }
  v += 0.014 * Math.sin(TAU * u) + 0.008 * Math.sin(3 * TAU * u + 1.1) + 0.0042 * Math.sin(7 * TAU * u + 2.3);
  return v;
}

function sizeCanvas(cv, ctx, w, h) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function buildGrain() {
  const tile = document.createElement('canvas');
  const size = 144;
  tile.width = size;
  tile.height = size;
  const g = tile.getContext('2d');
  const im = g.createImageData(size, size);
  const rnd = mulberry32(0x8e21);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = (rnd() * 255 | 0);
    im.data[i] = v;
    im.data[i + 1] = v;
    im.data[i + 2] = v;
    im.data[i + 3] = rnd() > 0.45 ? 255 : 0;
  }
  g.putImageData(im, 0, 0);
  grainPattern = tctx.createPattern(tile, 'repeat');
}

function buildPaper(w, h) {
  sizeCanvas(paperLayer, paperLayer.getContext('2d'), w, h);
  const g = paperLayer.getContext('2d');
  g.clearRect(0, 0, w, h);
  const tone = g.createLinearGradient(0, 0, 0, h);
  tone.addColorStop(0, '#071a20');
  tone.addColorStop(0.5, '#050f18');
  tone.addColorStop(1, '#040b13');
  g.fillStyle = tone;
  g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(94,242,196,0.07)';
  for (let x = 0; x <= w; x += minor) g.fillRect(x, 0, 1, h);
  for (let y = 0; y <= h; y += minor) g.fillRect(0, y, w, 1);
  g.fillStyle = 'rgba(94,242,196,0.17)';
  for (let x = 0; x <= w; x += minor * 5) g.fillRect(x, 0, 1, h);
  for (let y = 0; y <= h; y += minor * 5) g.fillRect(0, y, w, 1);
  g.fillStyle = 'rgba(122,215,255,0.16)';
  g.fillRect(0, baseY, w, 1);
  g.fillStyle = 'rgba(94,242,196,0.1)';
  for (let x = 0; x < w; x += minor * 25) g.fillRect(x, baseY - minor * 2, 1, minor * 4);
}

function buildStrip(w, h) {
  sizeCanvas(stripLayer, stripLayer.getContext('2d'), w, h);
  const g = stripLayer.getContext('2d');
  g.clearRect(0, 0, w, h);
  const tone = g.createLinearGradient(0, 0, 0, h);
  tone.addColorStop(0, '#08191f');
  tone.addColorStop(1, '#040d14');
  g.fillStyle = tone;
  g.fillRect(0, 0, w, h);
  const sm = Math.max(5, Math.min(9, h / 11));
  g.fillStyle = 'rgba(94,242,196,0.06)';
  for (let x = 0; x <= w; x += sm) g.fillRect(x, 0, 1, h);
  for (let y = 0; y <= h; y += sm) g.fillRect(0, y, w, 1);
  g.fillStyle = 'rgba(94,242,196,0.14)';
  for (let x = 0; x <= w; x += sm * 5) g.fillRect(x, 0, 1, h);
  for (let y = 0; y <= h; y += sm * 5) g.fillRect(0, y, w, 1);

  const gx = Math.round(w * 0.085);
  g.fillStyle = 'rgba(122,215,255,0.2)';
  g.fillRect(gx, h * 0.22, 1, h * 0.56);
  g.fillStyle = 'rgba(94,242,196,0.5)';
  g.beginPath();
  g.moveTo(gx + sm * 0.5, h * 0.78);
  g.lineTo(gx + sm * 0.5, h * 0.44);
  g.lineTo(gx + sm * 2.5, h * 0.44);
  g.lineTo(gx + sm * 2.5, h * 0.22);
  g.lineTo(gx + sm * 4.5, h * 0.22);
  g.lineTo(gx + sm * 4.5, h * 0.78);
  g.strokeStyle = 'rgba(94,242,196,0.5)';
  g.lineWidth = 1.4;
  g.stroke();
  g.fillStyle = 'rgba(127,159,164,0.9)';
  g.font = '600 8px ' + MONO;
  g.textAlign = 'center';
  g.fillText('1 mV', gx + sm * 2.5, h - 4);

  stripX0 = gx + sm * 6.5;
  stripX1 = w - 6;
  stripBase = h * 0.5;
  stripAmp = h * 0.3;
  const n = Math.max(32, Math.round(stripX1 - stripX0));
  stripYS = new Float32Array(n);
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const y = stripBase - wave(u) * stripAmp;
    stripYS[i] = y;
    if (i === 0) g.moveTo(stripX0 + i, y);
    else g.lineTo(stripX0 + i, y);
  }
  g.strokeStyle = 'rgba(94,242,196,0.6)';
  g.lineWidth = 1.4;
  g.stroke();

  const names = ['P', 'Q', 'R', 'S', 'T'];
  g.font = '600 9px ' + MONO;
  g.textAlign = 'center';
  g.fillStyle = 'rgba(127,159,164,0.95)';
  for (let i = 0; i < 5; i++) {
    const x = stripX0 + GAUSS[i][0] * (n - 1);
    g.fillText(names[i], x, h - 5);
    g.fillStyle = 'rgba(94,242,196,0.35)';
    g.fillRect(x, h - 3, 1, 2);
    g.fillStyle = 'rgba(127,159,164,0.95)';
  }
  g.textAlign = 'left';
  g.fillStyle = 'rgba(127,159,164,0.7)';
  g.fillText('REFERENCE', 8, 12);
}

function layout() {
  const tr = trace.getBoundingClientRect();
  const sr = strip.getBoundingClientRect();
  W = Math.max(160, Math.round(tr.width));
  H = Math.max(120, Math.round(tr.height));
  SW = Math.max(120, Math.round(sr.width));
  SH = Math.max(40, Math.round(sr.height));
  sizeCanvas(trace, tctx, W, H);
  sizeCanvas(strip, sctx, SW, SH);
  minor = Math.max(6, Math.min(13, Math.round(Math.min(W, H) / 34)));
  cols = W;
  baseY = Math.round(H * 0.55);
  amp = H * 0.35;
  YS = new Float32Array(cols);
  for (let i = 0; i < cols; i++) YS[i] = baseY - wave(i / cols) * amp;
  buildPaper(W, H);
  buildStrip(SW, SH);
  vignette = tctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.24, W * 0.5, H * 0.52, Math.max(W, H) * 0.78);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.62, 'rgba(2,8,12,0.24)');
  vignette.addColorStop(1, 'rgba(1,5,8,0.86)');
  if (!grainPattern) buildGrain();
  if (headX > cols) headX = cols * 0.02;
}

function fireBeat() {
  rFired = true;
  beats++;
  if (REDUCED) return;
  heartEl.animate(
    [
      { transform: 'rotate(-45deg) scale(1)' },
      { transform: 'rotate(-45deg) scale(1.42)', offset: 0.14 },
      { transform: 'rotate(-45deg) scale(0.9)', offset: 0.42 },
      { transform: 'rotate(-45deg) scale(1.08)', offset: 0.66 },
      { transform: 'rotate(-45deg) scale(1)' }
    ],
    { duration: 460, easing: 'cubic-bezier(.2,.85,.3,1)' }
  );
  ringEl.animate(
    [
      { transform: 'scale(.4)', opacity: 0.85 },
      { transform: 'scale(2.3)', opacity: 0 }
    ],
    { duration: 620, easing: 'cubic-bezier(.16,.8,.3,1)' }
  );
}

function drawHeadGlow(x, y, rose) {
  tctx.globalCompositeOperation = 'lighter';
  const r = 34;
  const gr = tctx.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rose ? 'rgba(255,125,156,0.5)' : 'rgba(160,255,226,0.45)');
  gr.addColorStop(1, 'rgba(120,255,220,0)');
  tctx.fillStyle = gr;
  tctx.fillRect(x - r, y - r, r * 2, r * 2);
  tctx.globalCompositeOperation = 'source-over';
}

function draw(dt) {
  tctx.globalCompositeOperation = 'source-over';
  tctx.globalAlpha = 1;
  tctx.drawImage(paperLayer, 0, 0, W, H);

  const period = 60 / bpmNow;
  headX += (cols / period) * dt;
  if (headX >= cols) {
    headX -= cols;
    rFired = false;
  }
  const u = headX / cols;
  if (u > 0.42) rFired = false;
  if (!rFired && u >= R_LO && u < R_HI) fireBeat();

  tctx.beginPath();
  tctx.moveTo(0, YS[0]);
  for (let i = 1; i < cols; i++) tctx.lineTo(i, YS[i]);
  tctx.strokeStyle = 'rgba(94,242,196,0.16)';
  tctx.lineWidth = 1.2;
  tctx.stroke();

  const hi = Math.max(2, Math.floor(headX));
  const grad = tctx.createLinearGradient(headX, 0, 0, 0);
  grad.addColorStop(0, 'rgba(190,255,235,0.98)');
  grad.addColorStop(0.28, 'rgba(94,242,196,0.92)');
  grad.addColorStop(0.7, 'rgba(94,242,196,0.42)');
  grad.addColorStop(1, 'rgba(94,242,196,0.1)');

  tctx.globalCompositeOperation = 'lighter';
  tctx.beginPath();
  tctx.moveTo(0, YS[0]);
  for (let i = 1; i <= hi; i++) {
    const jitter = i > hi - 26 ? Math.sin(clock * 46 + i * 0.9) * 0.9 : 0;
    tctx.lineTo(i, YS[i] + jitter);
  }
  tctx.strokeStyle = grad;
  tctx.lineWidth = 5.2;
  tctx.globalAlpha = 0.16;
  tctx.stroke();
  tctx.globalAlpha = 1;
  tctx.lineWidth = 2;
  tctx.stroke();
  tctx.globalCompositeOperation = 'source-over';

  const hy = YS[Math.min(cols - 1, hi)];
  tctx.globalCompositeOperation = 'lighter';
  const tail = tctx.createLinearGradient(headX - 62, 0, headX + 8, 0);
  tail.addColorStop(0, 'rgba(122,215,255,0)');
  tail.addColorStop(1, 'rgba(160,255,235,0.2)');
  tctx.fillStyle = tail;
  tctx.fillRect(headX - 62, 0, 70, H);
  tctx.fillStyle = 'rgba(200,255,240,0.55)';
  tctx.fillRect(headX, 0, 1, H);
  tctx.globalCompositeOperation = 'source-over';

  drawHeadGlow(headX, hy, u >= R_LO - 0.008 && u < R_HI + 0.03);
  tctx.fillStyle = '#eafff8';
  tctx.beginPath();
  tctx.arc(headX, hy, 2.4, 0, TAU);
  tctx.fill();

  tctx.globalAlpha = 1;
  tctx.fillStyle = vignette;
  tctx.fillRect(0, 0, W, H);

  if (grainPattern) {
    const gx = (Math.random() * 144 | 0);
    const gy = (Math.random() * 144 | 0);
    tctx.save();
    tctx.globalCompositeOperation = 'overlay';
    tctx.globalAlpha = 0.05;
    tctx.translate(gx, gy);
    tctx.fillStyle = grainPattern;
    tctx.fillRect(-gx, -gy, W, H);
    tctx.restore();
  }

  sctx.globalCompositeOperation = 'source-over';
  sctx.globalAlpha = 1;
  sctx.drawImage(stripLayer, 0, 0, SW, SH);
  const n = stripYS.length;
  const sx = stripX0 + u * (n - 1);
  const si = Math.max(0, Math.min(n - 1, Math.round(u * (n - 1))));
  const sy = stripYS[si];
  sctx.globalCompositeOperation = 'lighter';
  sctx.fillStyle = 'rgba(160,255,235,0.75)';
  sctx.fillRect(sx, 2, 1, SH - 4);
  const rg = sctx.createRadialGradient(sx, sy, 0, sx, sy, 14);
  rg.addColorStop(0, 'rgba(190,255,235,0.55)');
  rg.addColorStop(1, 'rgba(120,255,220,0)');
  sctx.fillStyle = rg;
  sctx.fillRect(sx - 14, sy - 14, 28, 28);
  sctx.globalCompositeOperation = 'source-over';
  sctx.fillStyle = '#eafff8';
  sctx.beginPath();
  sctx.arc(sx, sy, 2, 0, TAU);
  sctx.fill();

  bpmTarget = BASE_BPM + 2.4 * Math.sin(TAU * (beats / 4) + 0.6);
  bpmNow += (bpmTarget - bpmNow) * Math.min(1, dt * 2.4);
  const shown = Math.round(bpmNow);
  if (shown !== lastBpm) {
    lastBpm = shown;
    bpmEl.textContent = shown;
    rrEl.textContent = Math.round(60000 / bpmNow) + ' ms';
  }
  if (beats !== lastBeat) {
    lastBeat = beats;
    let s = '' + beats;
    while (s.length < 4) s = '0' + s;
    beatEl.textContent = s;
  }
  let phase = -1;
  for (let i = 0; i < 3; i++) {
    if (u >= LABELS[i][0] && u < LABELS[i][1]) {
      phase = i;
      break;
    }
  }
  if (phase !== lastPhase) {
    lastPhase = phase;
    for (let i = 0; i < phaseSpans.length; i++) phaseSpans[i].classList.toggle('on', i === phase);
  }
}

function idle() {
  const u = 0.42;
  headX = u * cols;
  tctx.globalCompositeOperation = 'source-over';
  tctx.globalAlpha = 1;
  tctx.drawImage(paperLayer, 0, 0, W, H);
  tctx.beginPath();
  tctx.moveTo(0, YS[0]);
  for (let i = 1; i < cols; i++) tctx.lineTo(i, YS[i]);
  const grad = tctx.createLinearGradient(W, 0, 0, 0);
  grad.addColorStop(0, 'rgba(190,255,235,0.98)');
  grad.addColorStop(0.4, 'rgba(94,242,196,0.85)');
  grad.addColorStop(1, 'rgba(94,242,196,0.3)');
  tctx.strokeStyle = grad;
  tctx.lineWidth = 2.2;
  tctx.stroke();
  drawHeadGlow(headX, YS[Math.min(cols - 1, Math.floor(headX))], false);
  tctx.fillStyle = '#eafff8';
  tctx.beginPath();
  tctx.arc(headX, YS[Math.min(cols - 1, Math.floor(headX))], 2.4, 0, TAU);
  tctx.fill();
  tctx.globalAlpha = 1;
  tctx.fillStyle = vignette;
  tctx.fillRect(0, 0, W, H);
  sctx.globalCompositeOperation = 'source-over';
  sctx.globalAlpha = 1;
  sctx.drawImage(stripLayer, 0, 0, SW, SH);
  bpmEl.textContent = String(BASE_BPM);
  rrEl.textContent = '833 ms';
  beatEl.textContent = '0000';
}

let last = 0;
function frame(now) {
  if (!last) last = now;
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 0.06) dt = 0.06;
  if (dt < 0) dt = 0;
  if (!document.hidden) {
    clock += dt;
    draw(dt);
  }
  requestAnimationFrame(frame);
}

layout();

if (REDUCED) {
  idle();
} else {
  rFired = false;
  requestAnimationFrame(frame);
}

let resizeTimer = 0;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    layout();
    if (REDUCED) idle();
  }, 140);
});
