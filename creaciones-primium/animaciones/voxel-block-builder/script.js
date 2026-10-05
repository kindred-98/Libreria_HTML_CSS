const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d', { alpha: false });
const stageEl = document.getElementById('stageLabel');
const countEl = document.getElementById('countLabel');
const pctEl = document.getElementById('pctLabel');
const metaEl = document.getElementById('metaStamp');
const segsEl = document.getElementById('segs');

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const YAW0 = 0.7854;
const PITCH0 = 0.6109;
const TCX = 3;
const TCY = 2.5;
const TCZ = 3;
const SPAN = 7;
const TOPY = 7;

const BUILD_STAG = 0.034;
const BUILD_DUR = 0.42;
const HOLD_T = 1.7;
const RELEASE_STAG = 0.016;
const RELEASE_DUR = 0.34;
const GAP_T = 0.42;

const SPARKS = 160;
const LABELS = ['Standby', 'Assembling', 'Structure Locked', 'Releasing'];

const BX = [];
const BY = [];
const BZ = [];
const FACE_T = [];
const FACE_X = [];
const FACE_Z = [];
const EDGE = [];
const BEACON = [];
const ORD = [];
const DELAY = [];
const segs = [];
const sparks = [];
const motes = [];
const PX = new Float64Array(8);
const PY = new Float64Array(8);

let N = 0;
let T_BUILD = 0;
let T_REL0 = 0;
let T_REL = 0;
let CYCLE = 0;
let W = 0;
let H = 0;
let baseZoom = 1;
let baseOx = 0;
let baseOy = 0;
let scv = 1;
let oxv = 0;
let oyv = 0;
let cyv = 1;
let syv = 0;
let cpv = 1;
let spv = 0;
let vignette = null;
let grainPattern = null;
let sparkPtr = 0;
let segOn = 0;
let lastPct = -1;
let lastLabel = '';
let placedPrev = -1;
let clock = 0;

for (let i = 0; i < SPARKS; i++) sparks.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, t0: 0, life: 1, r: 1 });

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5 | 0);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad(v, w) {
  let s = '' + v;
  while (s.length < w) s = '0' + s;
  return s;
}

function shade(hex, k) {
  const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * k));
  const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * k));
  const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * k));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function makeStructure() {
  const cells = [];
  for (let x = 0; x < 7; x++) for (let z = 0; z < 7; z++) cells.push([x, 0, z]);
  const posts = [[0, 0], [0, 6], [6, 0], [6, 6]];
  for (const post of posts) cells.push([post[0], 1, post[1]]);
  for (let x = 1; x < 6; x++) for (let z = 1; z < 6; z++) cells.push([x, 1, z]);
  for (let x = 2; x < 5; x++) for (let z = 2; z < 5; z++) cells.push([x, 2, z]);
  for (let x = 2; x < 5; x++) for (let z = 2; z < 5; z++) cells.push([x, 3, z]);
  for (let y = 4; y <= 6; y++) cells.push([3, y, 3]);
  cells.sort(function (a, b) {
    if (a[1] !== b[1]) return a[1] - b[1];
    const s = a[0] + a[2] - (b[0] + b[2]);
    if (s !== 0) return s;
    return a[0] - b[0];
  });
  return cells;
}

function initStructure() {
  const cells = makeStructure();
  N = cells.length;
  const rnd = mulberry32(0x4b21f);
  BX.length = 0;
  BY.length = 0;
  BZ.length = 0;
  FACE_T.length = 0;
  FACE_X.length = 0;
  FACE_Z.length = 0;
  EDGE.length = 0;
  BEACON.length = 0;
  ORD.length = 0;
  DELAY.length = 0;

  for (let i = 0; i < N; i++) {
    const x = cells[i][0];
    const y = cells[i][1];
    const z = cells[i][2];
    BX.push(x);
    BY.push(y);
    BZ.push(z);
    const beacon = y === 6;
    const post = y === 1 && (x === 0 || x === 6) && (z === 0 || z === 6);
    const shell = y === 2 && (x === 2 || x === 4 || z === 2 || z === 4);
    let base = '#2f6ea8';
    if (beacon) base = '#c07a34';
    else if (post) base = '#2b6f88';
    else if (shell) base = '#22507e';
    else if ((x * 3 + z * 5 + y * 7) % 9 === 0) base = '#3a86c4';
    const v = 0.88 + rnd() * 0.24;
    FACE_T.push(shade(base, 1.34 * v));
    FACE_X.push(shade(base, 0.58 * v));
    FACE_Z.push(shade(base, 0.95 * v));
    let edgeCol = 'rgba(150,220,255,0.22)';
    if (beacon) edgeCol = 'rgba(255,205,140,0.55)';
    else if (post) edgeCol = 'rgba(120,235,255,0.44)';
    EDGE.push(edgeCol);
    BEACON.push(beacon ? 1 : 0);
    ORD.push(i);
    DELAY.push(i * BUILD_STAG);
  }

  const key = new Float64Array(N);
  const cy = Math.cos(YAW0);
  const sy = Math.sin(YAW0);
  const cp = Math.cos(PITCH0);
  const sp = Math.sin(PITCH0);
  for (let i = 0; i < N; i++) {
    const dx = BX[i] + 0.5 - TCX;
    const dy = BY[i] + 0.5 - TCY;
    const dz = BZ[i] + 0.5 - TCZ;
    key[i] = dy * sp + (dx * sy + dz * cy) * cp;
  }
  ORD.sort(function (a, b) {
    return key[a] - key[b];
  });

  T_BUILD = (N - 1) * BUILD_STAG + BUILD_DUR;
  T_REL0 = T_BUILD + HOLD_T;
  T_REL = (N - 1) * RELEASE_STAG + RELEASE_DUR;
  CYCLE = T_REL0 + T_REL + GAP_T;

  segsEl.textContent = '';
  segs.length = 0;
  for (let i = 0; i < N; i++) {
    const s = document.createElement('i');
    if (BEACON[i]) s.className = 'beacon';
    segsEl.appendChild(s);
    segs.push(s);
  }
  segOn = 0;
  placedPrev = -1;
  lastPct = -1;
  metaEl.textContent = SPAN + ' x ' + SPAN + ' x ' + TOPY;
}

function initMotes() {
  const rnd = mulberry32(0x7c31);
  motes.length = 0;
  for (let i = 0; i < 26; i++) {
    motes.push({
      nx: rnd(),
      ny: rnd(),
      r: 0.7 + rnd() * 1.7,
      a: 0.1 + rnd() * 0.3,
      h: 1 + ((rnd() * 2 | 0)),
      p: rnd() * 6.2831853,
      c: rnd() > 0.78 ? '#ffd7a0' : '#a8e4ff'
    });
  }
}

function buildGrain() {
  const tile = document.createElement('canvas');
  const size = 146;
  tile.width = size;
  tile.height = size;
  const g = tile.getContext('2d');
  const im = g.createImageData(size, size);
  const rnd = mulberry32(0x3ab7);
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

function setCamera(yaw, pitch, zoom) {
  cyv = Math.cos(yaw);
  syv = Math.sin(yaw);
  cpv = Math.cos(pitch);
  spv = Math.sin(pitch);
  scv = zoom;
}

function proj(x, y, z, i) {
  const dx = x - TCX;
  const dy = y - TCY;
  const dz = z - TCZ;
  const x1 = dx * cyv - dz * syv;
  const z1 = dx * syv + dz * cyv;
  PX[i] = oxv + x1 * scv;
  PY[i] = oyv - (dy * cpv - z1 * spv) * scv;
}

function quad(a, b, c, d) {
  ctx.moveTo(PX[a], PY[a]);
  ctx.lineTo(PX[b], PY[b]);
  ctx.lineTo(PX[c], PY[c]);
  ctx.lineTo(PX[d], PY[d]);
  ctx.closePath();
}

const BOX = [
  [0, 0, 0],
  [SPAN, 0, 0],
  [SPAN, TOPY, 0],
  [0, TOPY, 0],
  [0, 0, SPAN],
  [SPAN, 0, SPAN],
  [SPAN, TOPY, SPAN],
  [0, TOPY, SPAN]
];

function fit() {
  let x0 = 1e9;
  let y0 = 1e9;
  let x1 = -1e9;
  let y1 = -1e9;
  for (let s = 0; s < 3; s++) {
    setCamera(YAW0 + (s - 1) * 0.15, PITCH0 + (s - 1) * 0.05, 1);
    oxv = 0;
    oyv = 0;
    for (let i = 0; i < 8; i++) {
      proj(BOX[i][0], BOX[i][1], BOX[i][2], i);
      if (PX[i] < x0) x0 = PX[i];
      if (PX[i] > x1) x1 = PX[i];
      if (PY[i] < y0) y0 = PY[i];
      if (PY[i] > y1) y1 = PY[i];
    }
  }
  baseZoom = Math.min((W * 0.78) / (x1 - x0), (H * 0.68) / (y1 - y0));
  baseOx = W * 0.5 - ((x0 + x1) / 2) * baseZoom;
  baseOy = H * 0.5 - ((y0 + y1) / 2) * baseZoom;
}

function layout() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(160, Math.round(rect.width));
  H = Math.max(140, Math.round(rect.height));
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  fit();
  vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.22, W * 0.5, H * 0.52, Math.max(W, H) * 0.8);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.6, 'rgba(3,7,16,0.26)');
  vignette.addColorStop(1, 'rgba(2,4,10,0.88)');
  if (!grainPattern) buildGrain();
}

function drawFloor(u) {
  const g0 = -5;
  const g1 = SPAN + 6;
  const gy = -0.14;
  const gd = ctx.createRadialGradient(baseOx, baseOy, 0, baseOx, baseOy, scv * 10);
  gd.addColorStop(0, 'rgba(120,205,255,0.2)');
  gd.addColorStop(0.55, 'rgba(90,170,255,0.08)');
  gd.addColorStop(1, 'rgba(70,140,255,0)');
  ctx.strokeStyle = gd;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let ax;
  let ay;
  let bx;
  let by;
  for (let v = g0; v <= g1; v++) {
    proj(v, gy, g0, 0);
    proj(v, gy, g1, 1);
    ax = PX[0];
    ay = PY[0];
    bx = PX[1];
    by = PY[1];
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  for (let v = g0; v <= g1; v++) {
    proj(g0, gy, v, 0);
    proj(g1, gy, v, 1);
    ax = PX[0];
    ay = PY[0];
    bx = PX[1];
    by = PY[1];
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  ctx.stroke();

  proj(0, gy, 0, 0);
  proj(SPAN, gy, 0, 1);
  proj(SPAN, gy, SPAN, 2);
  proj(0, gy, SPAN, 3);
  ctx.beginPath();
  quad(0, 1, 2, 3);
  const pg = ctx.createLinearGradient(PX[0], PY[0], PX[2], PY[2]);
  pg.addColorStop(0, 'rgba(24,58,96,0.9)');
  pg.addColorStop(1, 'rgba(8,20,42,0.92)');
  ctx.fillStyle = pg;
  ctx.fill();
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(110,220,255,0.45)';
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';

  proj(-1.5, gy + 0.04, -1.5, 0);
  proj(SPAN + 1.5, gy + 0.04, -1.5, 1);
  proj(SPAN + 1.5, gy + 0.04, SPAN + 1.5, 2);
  proj(-1.5, gy + 0.04, SPAN + 1.5, 3);
  ctx.beginPath();
  quad(0, 1, 2, 3);
  const sh = ctx.createRadialGradient(PX[0], PY[0], 0, PX[0], PY[0], scv * 7);
  sh.addColorStop(0, 'rgba(0,4,12,0.6)');
  sh.addColorStop(1, 'rgba(0,4,12,0)');
  ctx.fillStyle = sh;
  ctx.fill();

  const pulse = 0.5 + 0.5 * Math.sin(6.2831853 * u);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = 'rgba(120,230,255,' + (0.1 + 0.18 * pulse).toFixed(3) + ')';
  ctx.lineWidth = 2.6;
  proj(0, gy, 0, 0);
  proj(SPAN, gy, 0, 1);
  proj(SPAN, gy, SPAN, 2);
  proj(0, gy, SPAN, 3);
  ctx.beginPath();
  quad(0, 1, 2, 3);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

function drawMotes(u) {
  for (const m of motes) {
    const k = 6.2831853 * m.h * u;
    const x = m.nx * W + Math.sin(k + m.p) * W * 0.012;
    const y = m.ny * H + Math.cos(k * 1.3 + m.p) * H * 0.014;
    ctx.globalAlpha = m.a * (0.55 + 0.45 * Math.sin(k * 2 + m.p));
    ctx.fillStyle = m.c;
    ctx.beginPath();
    ctx.arc(x, y, m.r, 0, 6.2831853);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function spawnSparks(x, y, seed) {
  const rnd = mulberry32(0x9a1 + seed * 131);
  for (let i = 0; i < 6; i++) {
    const p = sparks[sparkPtr];
    sparkPtr = (sparkPtr + 1) % SPARKS;
    const a = -2.1 + rnd() * 2.1;
    const sp = 24 + rnd() * 74;
    p.on = true;
    p.x = x;
    p.y = y;
    p.vx = Math.cos(a) * sp;
    p.vy = Math.sin(a) * sp;
    p.r = 0.5 + rnd() * 1.2;
    p.t0 = clock;
    p.life = 0.26 + rnd() * 0.32;
  }
}

function drawSparks() {
  for (let i = 0; i < SPARKS; i++) {
    const p = sparks[i];
    if (!p.on) continue;
    const q = (clock - p.t0) / p.life;
    if (q >= 1 || q < 0) {
      p.on = false;
      continue;
    }
    ctx.globalAlpha = (1 - q) * 0.85;
    ctx.fillStyle = '#dff6ff';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (1 - q * 0.5), 0, 6.2831853);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawScanPlane(alpha, y, warm) {
  if (alpha <= 0.01) return;
  proj(0, y, 0, 0);
  proj(SPAN, y, 0, 1);
  proj(SPAN, y, SPAN, 2);
  proj(0, y, SPAN, 3);
  ctx.globalCompositeOperation = 'lighter';
  ctx.beginPath();
  quad(0, 1, 2, 3);
  ctx.fillStyle = warm ? 'rgba(255,180,90,' + (alpha * 0.1).toFixed(3) + ')' : 'rgba(90,215,255,' + (alpha * 0.09).toFixed(3) + ')';
  ctx.fill();
  ctx.strokeStyle = warm ? 'rgba(255,205,140,' + alpha.toFixed(3) + ')' : 'rgba(150,240,255,' + alpha.toFixed(3) + ')';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
}

function drawBlock(i, scale, lift, flash) {
  const x = BX[i];
  const y = BY[i];
  const z = BZ[i];
  proj(x, y, z, 0);
  proj(x + 1, y, z, 1);
  proj(x, y + 1, z, 2);
  proj(x + 1, y + 1, z, 3);
  proj(x, y, z + 1, 4);
  proj(x + 1, y, z + 1, 5);
  proj(x, y + 1, z + 1, 6);
  proj(x + 1, y + 1, z + 1, 7);

  ctx.save();
  if (scale !== 1 || lift !== 0) {
    const cxp = (PX[2] + PX[7]) * 0.5;
    const cyp = (PY[2] + PY[7]) * 0.5;
    ctx.translate(cxp, cyp + lift);
    ctx.scale(scale, scale);
    ctx.translate(-cxp, -cyp);
  }

  ctx.fillStyle = FACE_X[i];
  ctx.beginPath();
  quad(1, 3, 7, 5);
  ctx.fill();

  ctx.fillStyle = FACE_Z[i];
  ctx.beginPath();
  quad(4, 6, 7, 5);
  ctx.fill();

  ctx.fillStyle = FACE_T[i];
  ctx.beginPath();
  quad(2, 3, 7, 6);
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = EDGE[i];
  ctx.beginPath();
  quad(2, 3, 7, 6);
  ctx.moveTo(PX[3], PY[3]);
  ctx.lineTo(PX[7], PY[7]);
  ctx.lineTo(PX[5], PY[5]);
  ctx.stroke();

  if (flash > 0.02) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = BEACON[i]
      ? 'rgba(255,225,170,' + (flash * 0.85).toFixed(3) + ')'
      : 'rgba(190,245,255,' + (flash * 0.8).toFixed(3) + ')';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    quad(2, 3, 7, 6);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function draw(tt) {
  const u = tt / CYCLE;
  const yaw = YAW0 + 0.14 * Math.sin(6.2831853 * u + 0.7);
  const pitch = PITCH0 + 0.05 * Math.sin(12.5663706 * u);
  const zoom = baseZoom * (1 + 0.02 * Math.sin(18.8495559 * u + 1.3));
  setCamera(yaw, pitch, zoom);
  oxv = baseOx + 9 * Math.sin(12.5663706 * u + 2.1);
  oyv = baseOy + 6 * Math.sin(18.8495559 * u);

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#050a16';
  ctx.fillRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(W * 0.5, H * 0.56, 0, W * 0.5, H * 0.56, Math.max(W, H) * 0.46);
  halo.addColorStop(0, 'rgba(56,140,220,0.24)');
  halo.addColorStop(0.5, 'rgba(40,90,180,0.08)');
  halo.addColorStop(1, 'rgba(20,40,90,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  drawFloor(u);
  drawMotes(u);

  let phase = 0;
  let placed = 0;
  if (tt < T_BUILD) {
    phase = 1;
    placed = Math.min(N, Math.floor(tt / BUILD_STAG) + 1);
  } else if (tt < T_REL0) {
    phase = 2;
    placed = N;
  } else if (tt < T_REL0 + T_REL) {
    phase = 3;
    placed = Math.max(0, N - Math.floor((tt - T_REL0) / RELEASE_STAG) - 1);
  }

  if (phase === 1) {
    const k = Math.min(N - 1, Math.floor(tt / BUILD_STAG));
    drawScanPlane(0.5 * (1 - (tt - DELAY[k]) / BUILD_DUR), BY[k] + 1, false);
  } else if (phase === 3) {
    const k = Math.max(0, N - 1 - Math.floor((tt - T_REL0) / RELEASE_STAG));
    const local = tt - T_REL0 - (N - 1 - k) * RELEASE_STAG;
    drawScanPlane(0.45 * (1 - local / RELEASE_DUR), BY[k] + 1, true);
  }

  for (let n = 0; n < N; n++) {
    const i = ORD[n];
    let scale = 1;
    let lift = 0;
    let flash = 0;
    if (phase === 1) {
      const p = (tt - DELAY[i]) / BUILD_DUR;
      if (p <= 0) continue;
      if (p < 1) {
        const e = 1 - Math.pow(1 - p, 3);
        lift = e * scv * 2.1;
        scale = 0.8 + 0.2 * e;
        flash = Math.max(0, 1 - p * 1.8);
      }
    } else if (phase === 2) {
      if (BEACON[i]) flash = 0.1 + 0.26 * (0.5 + 0.5 * Math.sin(6.2831853 * u));
    } else if (phase === 3) {
      const p = (tt - T_REL0 - (N - 1 - i) * RELEASE_STAG) / RELEASE_DUR;
      if (p <= 0 || p >= 1) continue;
      const e = p * p;
      scale = 1 - e * 0.85;
      lift = e * scv * 0.85;
      flash = (1 - p) * 0.5;
    } else {
      continue;
    }
    drawBlock(i, scale, lift, flash);
  }

  if (placed > placedPrev) {
    for (let i = Math.max(placedPrev, 0); i < placed; i++) {
      proj(BX[i] + 0.5, BY[i] + 1, BZ[i] + 0.5, 7);
      spawnSparks(PX[7], PY[7], i + Math.floor(tt * 11));
    }
  }
  placedPrev = placed;

  drawSparks();

  ctx.globalAlpha = 1;
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);

  if (grainPattern) {
    const gx = (Math.random() * 146 | 0);
    const gy = (Math.random() * 146 | 0);
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.05;
    ctx.translate(gx, gy);
    ctx.fillStyle = grainPattern;
    ctx.fillRect(-gx, -gy, W, H);
    ctx.restore();
  }

  if (placed !== segOn) {
    if (placed > segOn) for (let i = segOn; i < placed; i++) segs[i].classList.add('on');
    else for (let i = placed; i < segOn; i++) segs[i].classList.remove('on');
    segOn = placed;
    countEl.textContent = pad(placed, 3) + ' / ' + pad(N, 3) + ' voxels';
  }
  const pct = Math.round((placed / N) * 100);
  if (pct !== lastPct) {
    lastPct = pct;
    pctEl.textContent = pct + '%';
  }
  const label = LABELS[phase];
  if (label !== lastLabel) {
    lastLabel = label;
    stageEl.textContent = label;
  }
}

function updateSparks(dt) {
  for (let i = 0; i < SPARKS; i++) {
    const p = sparks[i];
    if (!p.on) continue;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 130 * dt;
    p.vx *= 0.94;
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
    clock += dt;
    updateSparks(dt);
    draw(clock % CYCLE);
  }
  requestAnimationFrame(frame);
}

initStructure();
initMotes();
layout();

if (REDUCED) {
  draw(T_REL0 - 0.1);
} else {
  requestAnimationFrame(frame);
}

let resizeTimer = 0;
window.addEventListener('resize', function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(function () {
    layout();
    if (REDUCED) draw(T_REL0 - 0.1);
  }, 140);
});
