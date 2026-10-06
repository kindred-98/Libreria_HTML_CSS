const canvas = document.getElementById('plate');
const ctx = canvas ? canvas.getContext('2d', { alpha: false }) : null;
const modeOut = document.getElementById('modeOut');
const freqOut = document.getElementById('freqOut');
const waveOut = document.getElementById('waveOut');
const symOut = document.getElementById('symOut');
const loopOut = document.getElementById('loopOut');
const driveBar = document.getElementById('driveBar');
const bufOut = document.getElementById('bufOut');
const spectrum = document.getElementById('spectrum');
const rig = document.querySelector('.plate');
const still = window.matchMedia('(prefers-reduced-motion: reduce)');

const MODES = [
  { m: 1, n: 2 },
  { m: 1, n: 3 },
  { m: 2, n: 3 },
  { m: 1, n: 4 },
  { m: 2, n: 4 },
  { m: 3, n: 4 },
  { m: 1, n: 5 },
  { m: 2, n: 5 },
  { m: 3, n: 5 },
  { m: 4, n: 5 }
];

if (spectrum) {
  // Solo se necesita una barra por modo; el dato del modo no se usa aqui.
  MODES.forEach(function () {
    spectrum.appendChild(document.createElement('span'));
  });
}
const bars = spectrum ? spectrum.children : [];

const HOLD = 3.4;
const MORPH = 1.6;
const STEP = HOLD + MORPH;
const CYCLE = STEP * MODES.length;
const STIFF = 0.008;
const STILL_T = 2 * STEP + 0.2;

const PI = Math.PI;
const BASE_R = 9;
const BASE_G = 15;
const BASE_B = 26;
const ANT_R = 26;
const ANT_G = 56;
const ANT_B = 98;
const SAND_R = 241;
const SAND_G = 227;
const SAND_B = 193;

let N = 0;
let target = 0;
let fields = [];
let grain = new Float32Array(0);
let cache = {};
let imgData = null;
let ctxSize = 0;
let energy = 0;
let shown = -1;
let lastLoop = '';
let lastDrive = -1;

const buffer = document.createElement('canvas');
const bctx = buffer.getContext('2d', { alpha: false });

function frequency(mode) {
  return 30 * (mode.m * mode.m + mode.n * mode.n) + 60;
}

function tables(index) {
  const mode = MODES[index];
  const key = mode.m + ':' + mode.n + ':' + N;
  const hit = cache[key];
  if (hit) return hit;
  while (fields.length <= index) fields.push({ ax: new Float32Array(0), ay: new Float32Array(0) });
  const ax = new Float32Array(N);
  const ay = new Float32Array(N);
  const denom = N - 1;
  for (let k = 0; k < N; k += 1) {
    const x = k / denom;
    ax[k] = Math.cos(mode.m * PI * x);
    ay[k] = Math.cos(mode.n * PI * x);
  }
  fields[index].ax = ax;
  fields[index].ay = ay;
  const entry = { ax: ax, ay: ay, k: Math.pow(2 / (PI * (mode.m + mode.n) * STIFF), 2) };
  cache[key] = entry;
  return entry;
}

function buildGrain() {
  grain = new Float32Array(N * N);
  let seed = 20110417;
  for (let i = 0; i < grain.length; i += 1) {
    seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
    grain[i] = 0.5 + ((seed >>> 7) & 0xffff) / 65535 * 0.7;
  }
}

function resize() {
  if (!ctx) return;
  const rect = canvas.getBoundingClientRect();
  const side = Math.max(80, Math.min(rect.width, rect.height) || 480);
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  ctxSize = Math.max(1, Math.round(side * ratio));
  if (canvas.width !== ctxSize || canvas.height !== ctxSize) {
    canvas.width = ctxSize;
    canvas.height = ctxSize;
  }
  const next = Math.max(120, Math.min(228, Math.round(side / 2.3)));
  if (next !== N) {
    N = next;
    fields = [];
    cache = {};
    buildGrain();
    if (bufOut) bufOut.textContent = N + ' px';
  }
  buffer.width = N;
  buffer.height = N;
  imgData = bctx.createImageData(N, N);
  ctx.imageSmoothingEnabled = true;
  if (ctx.imageSmoothingQuality) ctx.imageSmoothingQuality = 'high';
}

function describe(index) {
  const mode = MODES[index];
  if (modeOut) modeOut.textContent = 'm ' + mode.m + ' / n ' + mode.n;
  if (freqOut) freqOut.textContent = frequency(mode) + ' Hz';
  if (waveOut) waveOut.textContent = (2 / mode.m).toFixed(2) + ' L';
  if (symOut) symOut.textContent = Math.min(mode.m, mode.n) + '-fold';
  if (rig) {
    rig.style.setProperty('--res', Math.max(0.9, 2.6 - frequency(mode) / 900).toFixed(2) + 's');
  }
  for (let i = 0; i < bars.length; i += 1) {
    bars[i].style.transform = 'scaleY(' + (i === index ? 1 : 0.13) + ')';
    bars[i].style.opacity = i === index ? '1' : '.4';
  }
}

function render(t) {
  let wrap = t % CYCLE;
  if (wrap < 0) wrap += CYCLE;
  const pos = wrap / STEP;
  const step = Math.floor(pos);
  const from = step % MODES.length;
  const to = (from + 1) % MODES.length;
  const local = (pos - step) * STEP;
  let blend = 0;
  if (local > HOLD) {
    const raw = Math.min(1, (local - HOLD) / MORPH);
    blend = raw * raw * (3 - 2 * raw);
  }
  const inv = 1 - blend;
  const A = tables(from);
  const B = tables(to);
  const axA = A.ax;
  const ayA = A.ay;
  const axB = B.ax;
  const ayB = B.ay;
  const sharp = A.k * inv + B.k * blend;
  const soft = sharp * 0.16;
  const drive = 0.78 + 0.26 * Math.exp(-local * 0.8) + Math.sin(t * 0.0021) * 0.03;
  const data = imgData.data;
  const g = grain;
  let acc = 0;
  let p = 0;
  for (let j = 0; j < N; j += 1) {
    const row = j * N;
    const cA = ayA[j] * inv;
    const dA = axA[j] * -inv;
    const cB = ayB[j] * blend;
    const dB = axB[j] * -blend;
    for (let i = 0; i < N; i += 1) {
      const u = axA[i] * cA + ayA[i] * dA + axB[i] * cB + ayB[i] * dB;
      const d = u < 0 ? -u : u;
      const d2 = d * d;
      const s = (0.7 / (1 + d2 * sharp) + 0.32 / (1 + d2 * soft)) * g[row + i] * drive;
      const ant = d < 1 ? d : 1;
      data[p] = BASE_R + (ANT_R - BASE_R) * ant + (SAND_R - ANT_R) * s;
      data[p + 1] = BASE_G + (ANT_G - BASE_G) * ant + (SAND_G - ANT_G) * s;
      data[p + 2] = BASE_B + (ANT_B - BASE_B) * ant + (SAND_B - ANT_B) * s;
      data[p + 3] = 255;
      acc += s;
      p += 4;
    }
  }
  energy = acc / (N * N);
  bctx.putImageData(imgData, 0, 0);
  ctx.drawImage(buffer, 0, 0, N, N, 0, 0, ctxSize, ctxSize);
  const dominant = blend < 0.5 ? from : to;
  if (dominant !== shown) {
    shown = dominant;
    describe(dominant);
  }
  if (driveBar) {
    const level = Math.min(1, 0.2 + energy * 3.6);
    if (Math.abs(level - lastDrive) > 0.004) {
      lastDrive = level;
      driveBar.style.transform = 'scaleX(' + level.toFixed(3) + ')';
    }
  }
  if (loopOut) {
    const text = Math.round((wrap / CYCLE) * 100) + ' %';
    if (text !== lastLoop) {
      lastLoop = text;
      loopOut.textContent = text;
    }
  }
}

if (canvas && ctx) {
  canvas.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    target += 1;
  });
  window.addEventListener('resize', function () {
    resize();
    if (still.matches) render(STILL_T);
  });
  resize();
  if (still.matches) {
    render(STILL_T);
  } else {
    const base = performance.now();
    const frame = function (now) {
      render(now - base + target * STEP);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
