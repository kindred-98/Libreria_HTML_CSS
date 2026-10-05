const canvas = document.getElementById('mosaic');
const ctx = canvas.getContext('2d', { alpha: false });
const phaseEl = document.getElementById('phaseLabel');
const barEl = document.getElementById('barFill');
const cellEl = document.getElementById('cellCount');
const pctEl = document.getElementById('pctLabel');
const gridEl = document.getElementById('gridStamp');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const HOLD_A = 900;
const SPREAD_D = 1180;
const DUR_D = 640;
const HOLD_B = 470;
const SPREAD_R = 1280;
const DUR_R = 660;
const HOLD_C = 840;
const CYCLE = HOLD_A + SPREAD_D + DUR_D + HOLD_B + SPREAD_R + DUR_R + HOLD_C;
const T_DISSOLVE = HOLD_A;
const T_REFORM = HOLD_A + SPREAD_D + DUR_D + HOLD_B;
const DIM_D = SPREAD_D + DUR_D;
const DIM_R = SPREAD_R + DUR_R;
const PHASES = ['Assembled', 'Dissolving', 'Scattered', 'Reforming'];

const HEX = [];
for (let i = 0; i < 256; i++) HEX[i] = (i < 16 ? '0' : '') + i.toString(16);

const srcCv = document.createElement('canvas');
const srcCtx = srcCv.getContext('2d', { willReadFrequently: true });
const ghostCv = document.createElement('canvas');
const ghostCtx = ghostCv.getContext('2d', { alpha: true });

let W = 0;
let H = 0;
let base = 0;
let cols = 0;
let rows = 0;
let cellW = 1;
let cellH = 1;
let gap = 1;
let n = 0;
let maxR = 1;
let FX = new Float32Array(0);
let FY = new Float32Array(0);
let DOUT = new Float32Array(0);
let DIN = new Float32Array(0);
let DIRX = new Float32Array(0);
let DIRY = new Float32Array(0);
let ARC = new Float32Array(0);
let LIFT = new Float32Array(0);
let CR = new Uint8Array(0);
let CG = new Uint8Array(0);
let CB = new Uint8Array(0);
let CS = [];
let vignette = null;
let grainPattern = null;
let lastPct = -1;
let lastCells = '';
let lastGrid = '';

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5 | 0);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintSource(cw, ch) {
  srcCv.width = cw;
  srcCv.height = ch;
  const g = srcCtx;
  const rnd = mulberry32(0x51f0c3);
  const hz = Math.round(ch * 0.73);

  const sky = g.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, '#07091c');
  sky.addColorStop(0.32, '#151142');
  sky.addColorStop(0.6, '#3a1462');
  sky.addColorStop(0.83, '#7c2461');
  sky.addColorStop(1, '#c8515a');
  g.fillStyle = sky;
  g.fillRect(0, 0, cw, hz);

  const stars = Math.round(cw * 1.1);
  for (let i = 0; i < stars; i++) {
    const x = rnd() * cw;
    const y = rnd() * hz * 0.7;
    const b = rnd();
    g.fillStyle =
      'rgba(' + (198 + ((rnd() * 57 | 0))) + ',' + (216 + ((rnd() * 39 | 0))) + ',255,' + (0.22 + b * 0.62).toFixed(3) + ')';
    g.fillRect(x, y, b > 0.9 ? 2 : 1, b > 0.9 ? 2 : 1);
  }

  const sx = cw * 0.635;
  const sy = hz * 0.83;
  const sr = Math.max(2, ch * 0.082);
  const halo = g.createRadialGradient(sx, sy, 0, sx, sy, sr * 3.4);
  halo.addColorStop(0, 'rgba(255,214,152,0.5)');
  halo.addColorStop(0.34, 'rgba(255,150,112,0.18)');
  halo.addColorStop(1, 'rgba(255,120,150,0)');
  g.fillStyle = halo;
  g.fillRect(0, 0, cw, hz);
  g.beginPath();
  g.arc(sx, sy, sr, 0, 6.2831853);
  g.fillStyle = '#ffdca8';
  g.fill();

  const ridges = [
    { amp: ch * 0.155, col: '#43195a', seed: 0.37 },
    { amp: ch * 0.108, col: '#25103f', seed: 1.71 },
    { amp: ch * 0.062, col: '#100724', seed: 3.13 }
  ];
  for (const rg of ridges) {
    g.beginPath();
    g.moveTo(0, ch);
    for (let x = 0; x <= cw; x++) {
      const u = x / cw;
      const s =
        Math.sin(u * 5.7 + rg.seed) * 0.5 + Math.sin(u * 13.3 + rg.seed * 2.3) * 0.26 + Math.sin(u * 27.1 + rg.seed * 0.7) * 0.12;
      const shape = Math.pow(Math.min(1, Math.abs(s) * 1.9), 0.62);
      g.lineTo(x, hz - rg.amp * (0.34 + 0.66 * shape));
    }
    g.lineTo(cw, ch);
    g.closePath();
    g.fillStyle = rg.col;
    g.fill();
  }

  const water = g.createLinearGradient(0, hz, 0, ch);
  water.addColorStop(0, '#250e3c');
  water.addColorStop(0.45, '#100b2b');
  water.addColorStop(1, '#06061a');
  g.fillStyle = water;
  g.fillRect(0, hz, cw, ch - hz);

  for (let y = hz; y < ch; y++) {
    const t = (y - hz) / Math.max(1, ch - hz);
    const w = (1 - t) * sr * 2.9 + 1;
    const a = 0.52 * (1 - t) * (1 - t);
    g.fillStyle = 'rgba(255,' + (176 - ((t * 66 | 0))) + ',' + (128 + ((t * 40 | 0))) + ',' + a.toFixed(3) + ')';
    g.fillRect(sx - w / 2 + (rnd() - 0.5) * (1 + t) * sr * 0.85, y, w, 1);
  }
  for (let y = hz + 1; y < ch; y += 2) {
    if (rnd() > 0.48) {
      g.fillStyle = 'rgba(126,178,255,' + (0.04 + rnd() * 0.13).toFixed(3) + ')';
      const w = cw * (0.2 + rnd() * 0.8);
      g.fillRect(rnd() * (cw - w), y, w, 1);
    }
  }

  g.fillStyle = 'rgba(255,198,152,0.32)';
  g.fillRect(0, hz, cw, 1);
  g.fillStyle = 'rgba(18,11,38,0.6)';
  g.fillRect(0, hz - 1, cw, 1);

  g.strokeStyle = 'rgba(10,7,22,0.9)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(cw * 0.3, hz * 0.68);
  g.lineTo(cw * 0.3, hz * 0.32);
  g.lineTo(cw * 0.275, hz * 0.32);
  g.moveTo(cw * 0.3, hz * 0.44);
  g.lineTo(cw * 0.315, hz * 0.44);
  g.stroke();
  g.beginPath();
  g.moveTo(cw * 0.19, hz * 0.3);
  g.quadraticCurveTo(cw * 0.215, hz * 0.255, cw * 0.24, hz * 0.3);
  g.moveTo(cw * 0.225, hz * 0.315);
  g.quadraticCurveTo(cw * 0.25, hz * 0.27, cw * 0.275, hz * 0.315);
  g.stroke();

  return g.getImageData(0, 0, cw, ch).data;
}

function buildGrain() {
  const tile = document.createElement('canvas');
  const size = 148;
  tile.width = size;
  tile.height = size;
  const g = tile.getContext('2d');
  const im = g.createImageData(size, size);
  const rnd = mulberry32(0x1d3f);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = (rnd() * 255 | 0);
    im.data[i] = v;
    im.data[i + 1] = v;
    im.data[i + 2] = v;
    im.data[i + 3] = rnd() > 0.42 ? 255 : 0;
  }
  g.putImageData(im, 0, 0);
  grainPattern = ctx.createPattern(tile, 'repeat');
}

function build() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(120, Math.round(rect.width));
  H = Math.max(100, Math.round(rect.height));
  base = Math.min(W, H);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const target = Math.max(8.5, Math.min(19, W / 50));
  cols = Math.max(14, Math.round(W / target));
  rows = Math.max(12, Math.round(H / target));
  cellW = W / cols;
  cellH = H / rows;
  n = cols * rows;
  gap = Math.max(0.7, Math.min(1.7, Math.min(cellW, cellH) * 0.06));

  const data = paintSource(cols, rows);
  FX = new Float32Array(n);
  FY = new Float32Array(n);
  DOUT = new Float32Array(n);
  DIN = new Float32Array(n);
  DIRX = new Float32Array(n);
  DIRY = new Float32Array(n);
  ARC = new Float32Array(n);
  LIFT = new Float32Array(n);
  CR = new Uint8Array(n);
  CG = new Uint8Array(n);
  CB = new Uint8Array(n);
  CS = new Array(n);

  const aspect = cols / rows;
  const rnd = mulberry32(0x77c1 ^ (cols * 1103515245));
  let far = 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      const p = i * 4;
      FX[i] = (x + 0.5) * cellW;
      FY[i] = (y + 0.5) * cellH;
      CR[i] = data[p];
      CG[i] = data[p + 1];
      CB[i] = data[p + 2];
      CS[i] = '#' + HEX[CR[i]] + HEX[CG[i]] + HEX[CB[i]];
      const dx = (x + 0.5) / cols - 0.52;
      const dy = (y + 0.5) / rows - 0.42;
      const d = Math.sqrt(dx * dx * aspect * aspect + dy * dy);
      if (d > far) far = d;
      const r1 = rnd();
      const r2 = rnd();
      const ang = Math.atan2(dy * H, dx * W);
      DIRX[i] = Math.cos(ang);
      DIRY[i] = Math.sin(ang);
      ARC[i] = (0.05 + 0.17 * r1) * base;
      LIFT[i] = 0.03 + 0.09 * r2;
      let o = d * 0.84 + r1 * r1 * 0.34;
      if (o > 1) o = 1;
      DOUT[i] = o * SPREAD_D;
      DIN[i] = (1 - o) * SPREAD_R;
    }
  }
  maxR = far * base * 0.96;

  vignette = ctx.createRadialGradient(W * 0.5, H * 0.44, base * 0.2, W * 0.5, H * 0.52, Math.max(W, H) * 0.82);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.6, 'rgba(5,3,14,0.26)');
  vignette.addColorStop(1, 'rgba(3,2,9,0.86)');

  ghostCv.width = canvas.width;
  ghostCv.height = canvas.height;
  ghostCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ghostCtx.clearRect(0, 0, W, H);
  ghostCtx.fillStyle = '#93a8ff';
  const gw = cellW - gap;
  const gh = cellH - gap;
  for (let i = 0; i < n; i++) {
    ghostCtx.fillRect(FX[i] - gw / 2, FY[i] - gh / 2, gw, gh);
  }

  if (!grainPattern) buildGrain();

  const cellLabel = n + ' cells';
  if (cellLabel !== lastCells) {
    lastCells = cellLabel;
    cellEl.textContent = cellLabel;
  }
  const gridLabel = (cols < 10 ? '0' : '') + cols + ' x ' + (rows < 10 ? '0' : '') + rows;
  if (gridLabel !== lastGrid) {
    lastGrid = gridLabel;
    gridEl.textContent = gridLabel;
  }
}

function modeAt(tt) {
  if (tt >= T_DISSOLVE && tt < T_DISSOLVE + DIM_D) return 1;
  if (tt >= T_DISSOLVE + DIM_D && tt < T_REFORM) return 2;
  if (tt >= T_REFORM && tt < T_REFORM + DIM_R) return 3;
  return 0;
}

function draw(tt) {
  const mode = modeAt(tt);
  // El ternario era anidado; el if/else deja claro que solo hay tres modos.
  let local = 0;
  if (mode === 1) local = tt - T_DISSOLVE;
  else if (mode === 3) local = tt - T_REFORM;
  const outward = mode === 1;

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#08061a';
  ctx.fillRect(0, 0, W, H);

  const bw = cellW - gap;
  const bh = cellH - gap;
  const halfW = bw / 2;
  const halfH = bh / 2;

  let ghost = 0;
  if (mode === 1) {
    const f = (local - SPREAD_D * 0.3) / (DIM_D - SPREAD_D * 0.3);
    // clip de f a [0,1] sin ternario anidado
    let fc = f;
    if (fc < 0) fc = 0;
    else if (fc > 1) fc = 1;
    ghost = fc * 0.34;
  } else if (mode === 2) {
    ghost = 0.34;
  } else if (mode === 3) {
    const f = 1 - local / (DIM_R * 0.6);
    let fc = f;
    if (fc < 0) fc = 0;
    else if (fc > 1) fc = 1;
    ghost = fc * 0.34;
  }

  if (ghost > 0.012) {
    ctx.globalAlpha = ghost;
    ctx.drawImage(ghostCv, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  const dur = outward ? DUR_D : DUR_R;
  const inv = 1 / dur;
  const delay = outward ? DOUT : DIN;
  const intact = mode === 0;
  const t = mode === 0 ? 0 : local;

  for (let i = 0; i < n; i++) {
    if (!intact) {
      const raw = t - delay[i];
      if (outward) {
        if (raw <= 0) {
          ctx.fillStyle = CS[i];
          ctx.fillRect(FX[i] - halfW, FY[i] - halfH, bw, bh);
          continue;
        }
        if (raw >= dur) continue;
      } else {
        if (raw <= 0) continue;
        if (raw >= dur) {
          ctx.fillStyle = CS[i];
          ctx.fillRect(FX[i] - halfW, FY[i] - halfH, bw, bh);
          continue;
        }
      }
    } else {
      ctx.fillStyle = CS[i];
      ctx.fillRect(FX[i] - halfW, FY[i] - halfH, bw, bh);
      continue;
    }
    const p = (t - delay[i]) * inv;

    const e = p * p * (3 - 2 * p);
    const arc = ARC[i] * e;
    const tx = FX[i] + DIRX[i] * arc;
    const ty = FY[i] + DIRY[i] * arc - LIFT[i] * base * Math.sin(p * 3.14159265);
    const w = bw * (1 - e * 0.16);
    const h = bh * (1 - e * 0.88);
    const lit = (1 - p) * (1 - p);
    const r = CR[i];
    const g = CG[i];
    const b = CB[i];
    ctx.globalAlpha = 1 - p * p;
    ctx.fillStyle =
      '#' +
      HEX[Math.min(255, (r + (255 - r) * lit * 0.62 | 0))] +
      HEX[Math.min(255, (g + (238 - g) * lit * 0.5 | 0))] +
      HEX[Math.min(255, (b + (255 - b) * lit * 0.64 | 0))];
    ctx.fillRect(tx - w / 2, ty - h / 2, w, h);
    if (lit > 0.4) {
      ctx.globalAlpha = lit * 0.42;
      ctx.fillRect(tx - w / 2 - 1.5, ty - h / 2 - 1.5, w + 3, h + 3);
    }
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(146,158,255,0.05)';
  for (let x = 0; x <= cols; x++) ctx.fillRect(x * cellW, 0, 1, H);
  for (let y = 0; y <= rows; y++) ctx.fillRect(0, y * cellH, W, 1);

  const span = W * 2.1;
  const px = (((tt / CYCLE) * 2) % 1 - 0.5) * span;
  ctx.save();
  ctx.translate(W * 0.5, H * 0.5);
  ctx.rotate(-0.4);
  const sheen = ctx.createLinearGradient(px - span * 0.3, 0, px + span * 0.3, 0);
  sheen.addColorStop(0, 'rgba(255,255,255,0)');
  sheen.addColorStop(0.5, 'rgba(206,224,255,0.06)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(-W, -H, W * 2, H * 2);
  ctx.restore();

  if (mode === 1 || mode === 3) {
    const f = outward ? local / DIM_D : 1 - local / DIM_R;
    if (f > 0 && f < 1) {
      const a = Math.sin(f * 3.14159265);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a * 0.5;
      ctx.strokeStyle = 'rgba(150,240,255,0.9)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(W * 0.52, H * 0.42, f * maxR, 0, 6.2831853);
      ctx.stroke();
      ctx.globalAlpha = a * 0.14;
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.arc(W * 0.52, H * 0.42, f * maxR, 0, 6.2831853);
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  if (grainPattern) {
    const ox = (Math.random() * 148 | 0);
    const oy = (Math.random() * 148 | 0);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.05;
    ctx.translate(ox, oy);
    ctx.fillStyle = grainPattern;
    ctx.fillRect(-ox, -oy, W, H);
    ctx.restore();
  }
}

let start = 0;

function loop(now) {
  if (!start) start = now;
  const tt = (now - start) % CYCLE;
  if (!document.hidden) {
    draw(tt);
    const label = PHASES[modeAt(tt)];
    if (phaseEl.textContent !== label) phaseEl.textContent = label;
    const pct = Math.round((tt / CYCLE) * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      pctEl.textContent = pct + '%';
    }
    barEl.style.transform = 'scaleX(' + (tt / CYCLE).toFixed(4) + ')';
  }
  requestAnimationFrame(loop);
}

let resizeTimer = 0;
function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    build();
    if (REDUCED) {
      draw(0);
      phaseEl.textContent = PHASES[0];
      pctEl.textContent = '0%';
      barEl.style.transform = 'scaleX(0)';
    }
  }, 140);
}

build();

if (REDUCED) {
  draw(0);
} else {
  requestAnimationFrame(loop);
}

window.addEventListener('resize', onResize);
