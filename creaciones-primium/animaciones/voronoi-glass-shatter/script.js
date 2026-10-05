const cv = document.getElementById('pane');
const ctx = cv.getContext('2d');
const grainEl = document.querySelector('.grain');
const phaseEl = document.getElementById('phase');
const cellsEl = document.getElementById('cells');
const frontsEl = document.getElementById('fronts');
const integrityEl = document.getElementById('integrity');
const barEl = document.getElementById('bar');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (v) => {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
};
const ramp = (t, a, b) => clamp01((t - a) / (b - a));
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eSm = x => x * x * (3 - 2 * x);
const rnd = (a, b) => a + Math.random() * (b - a);

const CYCLE = 11.6;
const T_IMPACT = 1.5;
const T_CRACK = 1.9;
const T_HOLD = 5.4;
const T_SPLIT = 6.2;
const T_RESID = 9.4;
const T_REFORM = 10.4;
const SLOT = 80;

const pane = { x: 0, y: 0, w: 0, h: 0, ci: 0, co: 0 };
const impact = { x: 0, y: 0 };

let W = 0, H = 0, dpr = 1, F = 12, world = 200;
let shards = [];
let trails = [];
let parts = [];
let live = 0;
let gGlass = null, gShard = null, gFrame = null, gRim = null;
let geo = null;
let counts = null;
let t0 = performance.now();
let lastBar = -1, lastCells = -1;

function seedGrain(){
  const g = document.createElement('canvas');
  g.width = 128;
  g.height = 128;
  const gx = g.getContext('2d');
  const im = gx.createImageData(128, 128);
  const d = im.data;
  for (let i = 0; i < d.length; i += 4){
    const v = (Math.random() * 255 | 0);
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  gx.putImageData(im, 0, 0);
  grainEl.style.backgroundImage = 'url(' + g.toDataURL() + ')';
}

function chamferPath(x, y, w, h, c){
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

function chamfer(x, y, w, h, c){
  return [
    { x: x + c, y: y },
    { x: x + w - c, y: y },
    { x: x + w, y: y + c },
    { x: x + w, y: y + h - c },
    { x: x + w - c, y: y + h },
    { x: x + c, y: y + h },
    { x: x, y: y + h - c },
    { x: x, y: y + c }
  ];
}

function polyPath(pts){
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

function clipHalf(poly, mx, my, nx, ny){
  const out = [];
  const n = poly.length;
  for (let i = 0; i < n; i++){
    const a = poly[i];
    const b = poly[(i + 1) % n];
    const da = (a.x - mx) * nx + (a.y - my) * ny;
    const db = (b.x - mx) * nx + (b.y - my) * ny;
    if (da <= 0) out.push(a);
    if ((da <= 0) !== (db <= 0)){
      const k = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });
    }
  }
  return out;
}

function makeSeeds(cx, cy){
  const R = Math.hypot(pane.w, pane.h) * 0.5;
  const list = [{ x: cx, y: cy }];
  const rings = [0.075, 0.16, 0.27, 0.41, 0.6];
  const counts = [5, 7, 9, 11, 12];
  for (let r = 0; r < rings.length; r++){
    const n = counts[r];
    const base = r * 0.41 + rnd(0, 0.3);
    for (let i = 0; i < n; i++){
      const a = base + (i / n) * Math.PI * 2 + rnd(-0.09, 0.09);
      const rad = rings[r] * R * rnd(0.9, 1.12);
      list.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad * 0.9 });
    }
  }
  return list;
}

function voronoi(outline, pts){
  const out = [];
  for (let i = 0; i < pts.length; i++){
    let poly = outline;
    for (let j = 0; j < pts.length && poly.length; j++){
      if (i === j) continue;
      const mx = (pts[i].x + pts[j].x) * 0.5;
      const my = (pts[i].y + pts[j].y) * 0.5;
      poly = clipHalf(poly, mx, my, pts[j].x - pts[i].x, pts[j].y - pts[i].y);
    }
    if (poly.length >= 3) out.push(poly);
  }
  return out;
}

function network(cells){
  const nodes = [];
  const index = new Map();
  const segs = [];
  const seen = new Set();
  const key = v => Math.round(v.x * 2) + '_' + Math.round(v.y * 2);
  const node = v => {
    const k = key(v);
    let i = index.get(k);
    if (i === undefined){
      i = nodes.length;
      index.set(k, i);
      nodes.push({ x: v.x, y: v.y, e: [] });
    }
    return i;
  };
  for (const cell of cells){
    // El bucle interno necesita el indice porque cierra el anillo con
    // cell[(i + 1) % cell.length], asi que no puede ser un for-of.
    for (let i = 0; i < cell.length; i++){
      const a = node(cell[i]);
      const b = node(cell[(i + 1) % cell.length]);
      if (a === b) continue;
      const lo = Math.min(a, b);
      const hi = a < b ? b : a;
      const k = lo + '-' + hi;
      if (seen.has(k)) continue;
      seen.add(k);
      segs.push([lo, hi]);
    }
  }
  for (const seg of segs){
    nodes[seg[0]].e.push(seg[1]);
    nodes[seg[1]].e.push(seg[0]);
  }
  return { nodes: nodes, segs: segs };
}

function prep(pts){
  const lens = new Float32Array(pts.length);
  let total = 0;
  for (let i = 1; i < pts.length; i++){
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    lens[i] = Math.hypot(dx, dy);
    total += lens[i];
  }
  pts.lens = lens;
  pts.total = total;
  return pts;
}

function crackTrails(net, cx, cy){
  const used = new Set();
  const list = [];
  const sk = (a, b) => (a < b ? a + '-' + b : b + '-' + a);
  const order = [];
  for (let i = 0; i < net.nodes.length; i++){
    const n = net.nodes[i];
    const d = Math.sqrt((n.x - cx) * (n.x - cx) + (n.y - cy) * (n.y - cy));
    order.push({ i: i, d: n.e.length === 1 ? d - 1e5 : d });
  }
  order.sort(function(a, b){ return a.d - b.d; });
  for (const src of order){
    let cur = src.i;
    let prev = null;
    const pts = [];
    let guard = 0;
    while (guard++ < 600){
      const n = net.nodes[cur];
      let pick = -1;
      let best = -3;
      for (let k = 0; k < n.e.length; k++){
        const nb = n.e[k];
        if (used.has(sk(cur, nb))) continue;
        const p = net.nodes[nb];
        let dx = p.x - n.x;
        let dy = p.y - n.y;
        const L = Math.hypot(dx, dy) || 1;
        dx /= L;
        dy /= L;
        const s = prev ? dx * prev.x + dy * prev.y : rnd(-0.1, 0.3);
        if (s > best){ best = s; pick = k; }
      }
      if (pick < 0) break;
      const nb = n.e[pick];
      const p = net.nodes[nb];
      let dx = p.x - n.x;
      let dy = p.y - n.y;
      const L = Math.hypot(dx, dy) || 1;
      used.add(sk(cur, nb));
      pts.push({ x: n.x, y: n.y });
      prev = { x: dx / L, y: dy / L };
      cur = nb;
      if (net.nodes[cur].e.length <= 1 && pts.length > 1) break;
    }
    if (!pts.length) continue;
    const end = net.nodes[cur];
    pts.push({ x: end.x, y: end.y });
    if (pts.length < 2) continue;
    list.push(prep(pts));
  }
  return list;
}

function branchTrails(net, cx, cy){
  const out = [];
  const cand = [];
  for (let i = 0; i < net.nodes.length; i++){
    if (net.nodes[i].e.length >= 3) cand.push(i);
  }
  for (let i = cand.length - 1; i > 0; i--){
    const j = ((Math.random() * (i + 1)) | 0);
    const s = cand[i];
    cand[i] = cand[j];
    cand[j] = s;
  }
  const L0 = Math.min(pane.w, pane.h);
  let made = 0;
  for (let c = 0; c < cand.length && made < 22; c++){
    if (Math.random() < 0.42) continue;
    const n = net.nodes[cand[c]];
    if (n.x < pane.x + L0 * 0.07 || n.x > pane.x + pane.w - L0 * 0.07) continue;
    if (n.y < pane.y + L0 * 0.07 || n.y > pane.y + pane.h - L0 * 0.07) continue;
    let a = Math.atan2(n.y - cy, n.x - cx) + (Math.random() < 0.5 ? 1 : -1) * (Math.PI * 0.5 + rnd(-0.55, 0.55));
    const step = L0 * rnd(0.018, 0.055);
    const steps = 3 + ((Math.random() * 3 | 0));
    const pts = [{ x: n.x, y: n.y }];
    let x = n.x;
    let y = n.y;
    for (let s = 0; s < steps; s++){
      a += rnd(-0.55, 0.55);
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      if (x < pane.x + 2 || x > pane.x + pane.w - 2 || y < pane.y + 2 || y > pane.y + pane.h - 2) break;
      pts.push({ x: x, y: y });
    }
    if (pts.length < 2) continue;
    out.push(prep(pts));
    made++;
  }
  return out;
}

function shardFor(cell){
  let area = 0, cx = 0, cy = 0;
  const L = cell.length;
  for (let i = 0; i < L; i++){
    const a = cell[i];
    const b = cell[(i + 1) % L];
    const f = a.x * b.y - b.x * a.y;
    area += f;
    cx += (a.x + b.x) * f;
    cy += (a.y + b.y) * f;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-3) area = area < 0 ? -1e-3 : 1e-3;
  cx /= 6 * area;
  cy /= 6 * area;
  const dx = cx - impact.x;
  const dy = cy - impact.y;
  const d = Math.hypot(dx, dy) || 1;
  const dn = clamp01(d / world);
  return {
    pts: cell,
    cx: cx,
    cy: cy,
    dn: dn,
    ux: dx / d,
    uy: dy / d,
    push: rnd(0.34, 1.05),
    fall: rnd(0.22, 0.6),
    spin: rnd(0.18, 0.48) * (Math.random() < 0.5 ? -1 : 1),
    delay: 0.05 + 0.3 * dn + rnd(0, 0.12),
    glow: rnd(0.7, 1.3)
  };
}

function build(ix, iy){
  if (W < 24 || H < 24) return;
  world = Math.min(pane.w, pane.h) * 0.92;
  const cx = ix !== undefined ? Math.max(pane.x + pane.w * 0.1, Math.min(pane.x + pane.w * 0.9, ix)) : pane.x + pane.w * rnd(0.4, 0.56);
  const cy = iy !== undefined ? Math.max(pane.y + pane.h * 0.1, Math.min(pane.y + pane.h * 0.9, iy)) : pane.y + pane.h * rnd(0.34, 0.54);
  impact.x = cx;
  impact.y = cy;

  const outline = chamfer(pane.x, pane.y, pane.w, pane.h, pane.ci);
  const cells = voronoi(outline, makeSeeds(cx, cy));
  const net = network(cells);

  const list = crackTrails(net, cx, cy);
  const extra = branchTrails(net, cx, cy);
  for (const e of extra) list.push(e);
  for (const tr of list){
    let near = Infinity;
    for (const p of tr){
      const d = Math.sqrt((p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy));
      if (d < near) near = d;
    }
    tr.d = near;
  }
  list.sort(function(a, b){ return a.d - b.d; });
  const last = list.length > 1 ? list.length - 1 : 1;
  for (let i = 0; i < list.length; i++){
    const tr = list[i];
    tr.delay = 0.02 + 0.46 * Math.pow(i / last, 1.25) + rnd(0, 0.04);
    tr.dur = 0.32 + 0.12 * Math.random();
    tr.rev = 0;
    tr.fresh = false;
  }
  trails = list;
  geo = new Float32Array(trails.length * SLOT);
  counts = new Int32Array(trails.length);

  shards = [];
  for (const cell of cells) shards.push(shardFor(cell));
  shards.sort(function(a, b){ return b.dn - a.dn; });
  parts = [];

  gGlass = ctx.createLinearGradient(pane.x, pane.y, pane.x + pane.w, pane.y + pane.h);
  gGlass.addColorStop(0, 'rgba(198,230,250,0.22)');
  gGlass.addColorStop(0.3, 'rgba(118,172,212,0.09)');
  gGlass.addColorStop(0.52, 'rgba(216,242,255,0.19)');
  gGlass.addColorStop(0.74, 'rgba(84,138,180,0.08)');
  gGlass.addColorStop(1, 'rgba(170,208,238,0.16)');
  gShard = ctx.createLinearGradient(pane.x, pane.y + pane.h, pane.x + pane.w, pane.y);
  gShard.addColorStop(0, 'rgba(178,222,252,0.2)');
  gShard.addColorStop(0.5, 'rgba(226,246,255,0.3)');
  gShard.addColorStop(1, 'rgba(122,178,220,0.14)');
  gFrame = ctx.createLinearGradient(0, 0, 0, H);
  gFrame.addColorStop(0, '#0d1a26');
  gFrame.addColorStop(0.28, '#16293a');
  gFrame.addColorStop(0.6, '#0b1721');
  gFrame.addColorStop(1, '#132334');
  gRim = ctx.createLinearGradient(pane.x, pane.y, pane.x + pane.w * 0.4, pane.y + pane.h);
  gRim.addColorStop(0, 'rgba(233,250,255,0.95)');
  gRim.addColorStop(0.5, 'rgba(120,206,246,0.55)');
  gRim.addColorStop(1, 'rgba(198,238,255,0.8)');
}

function size(){
  const w = cv.clientWidth || 900;
  const h = cv.clientHeight || 600;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = w;
  H = h;
  cv.width = Math.max(1, Math.round(w * dpr));
  cv.height = Math.max(1, Math.round(h * dpr));
  F = Math.round(Math.min(w, h) * 0.048) + 7;
  pane.x = F;
  pane.y = F;
  pane.w = Math.max(20, w - F * 2);
  pane.h = Math.max(20, h - F * 2);
  pane.ci = Math.min(pane.w, pane.h) * 0.055;
  pane.co = Math.min(W, H) * 0.03;
  build();
}

function fillSlot(i, rev){
  const tr = trails[i];
  const base = i * SLOT;
  const want = tr.total * rev;
  let acc = 0;
  let n = 0;
  geo[base] = tr[0].x;
  geo[base + 1] = tr[0].y;
  n = 2;
  const lens = tr.lens;
  for (let k = 1; k < tr.length && n < SLOT - 1; k++){
    const L = lens[k];
    if (acc + L >= want){
      const f = L > 0 ? (want - acc) / L : 0;
      geo[base + n] = tr[k - 1].x + (tr[k].x - tr[k - 1].x) * f;
      geo[base + n + 1] = tr[k - 1].y + (tr[k].y - tr[k - 1].y) * f;
      n += 2;
      break;
    }
    geo[base + n] = tr[k].x;
    geo[base + n + 1] = tr[k].y;
    n += 2;
    acc += L;
  }
  counts[i] = n;
}

function strokeSlot(i){
  const base = i * SLOT;
  const n = counts[i];
  if (n < 4) return;
  ctx.beginPath();
  ctx.moveTo(geo[base], geo[base + 1]);
  for (let k = 2; k < n; k += 2) ctx.lineTo(geo[base + k], geo[base + k + 1]);
  ctx.stroke();
}

function drawGlass(a){
  if (a <= 0.004) return;
  ctx.save();
  ctx.beginPath();
  chamferPath(pane.x, pane.y, pane.w, pane.h, pane.ci);
  ctx.clip();
  ctx.globalAlpha = a;
  ctx.fillStyle = gGlass;
  ctx.fillRect(pane.x, pane.y, pane.w, pane.h);
  ctx.globalAlpha = a * 0.4;
  ctx.fillStyle = 'rgba(226,246,255,0.55)';
  ctx.fillRect(pane.x, pane.y, pane.w, Math.max(1, pane.h * 0.05));
  ctx.globalAlpha = a * 0.28;
  ctx.fillRect(pane.x, pane.y + pane.h * 0.95, pane.w, Math.max(1, pane.h * 0.05));
  ctx.restore();
}

function drawShards(a, st){
  if (a <= 0.004) return;
  const K = world * 0.72;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const s of shards){
    const p = clamp01((st - s.delay) / 0.44);
    if (p <= 0) continue;
    const eo = eOut(p);
    const g = p * p;
    const ox = (s.ux * s.push * eo + s.ux * s.fall * g * 0.55) * K;
    const oy = (s.uy * s.push * eo + s.fall * g * 0.42) * K;
    const alpha = a * (1 - clamp01((p - 0.4) / 0.6) * 0.94);
    if (alpha <= 0.005) continue;
    ctx.save();
    ctx.translate(s.cx + ox, s.cy + oy);
    ctx.rotate(s.spin * eo);
    ctx.translate(-s.cx, -s.cy);
    polyPath(s.pts);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = gShard;
    ctx.fill();
    ctx.globalAlpha = alpha * 0.34 * s.glow;
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(96,178,236,0.24)';
    ctx.stroke();
    ctx.globalAlpha = alpha * 0.6 * s.glow;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = 'rgba(178,230,255,0.5)';
    ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = 'rgba(240,252,255,0.95)';
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

function drawCracks(al){
  if (al <= 0.004) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (let g = 0; g < 2; g++){
    const a = g === 0 ? al * 0.92 : al * 0.5;
    if (a <= 0.004) continue;
    ctx.globalAlpha = a * 0.12;
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(90,176,236,1)';
    for (let i = 0; i < trails.length; i++){
      if ((trails[i].fresh ? 0 : 1) !== g) continue;
      strokeSlot(i);
    }
    ctx.globalAlpha = a * 0.32;
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = 'rgba(168,222,255,1)';
    for (let i = 0; i < trails.length; i++){
      if ((trails[i].fresh ? 0 : 1) !== g) continue;
      strokeSlot(i);
    }
    ctx.globalAlpha = a;
    ctx.lineWidth = 0.85;
    ctx.strokeStyle = g === 0 ? 'rgba(246,253,255,1)' : 'rgba(196,228,248,0.9)';
    for (let i = 0; i < trails.length; i++){
      if ((trails[i].fresh ? 0 : 1) !== g) continue;
      strokeSlot(i);
    }
  }
  for (let i = 0; i < trails.length; i++){
    const tr = trails[i];
    if (!tr.fresh || tr.rev <= 0 || tr.rev >= 1) continue;
    const base = i * SLOT;
    const n = counts[i];
    if (n < 4) continue;
    const x = geo[base + n - 2];
    const y = geo[base + n - 1];
    const r = Math.min(pane.w, pane.h) * 0.035;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(255,255,255,0.95)');
    rg.addColorStop(0.32, 'rgba(160,226,255,0.42)');
    rg.addColorStop(1, 'rgba(120,200,255,0)');
    ctx.globalAlpha = al;
    ctx.fillStyle = rg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGlint(a, pos){
  if (a <= 0.005) return;
  const w = pane.w * 0.44;
  const x = pane.x - w + (pane.w + w * 2) * pos;
  ctx.save();
  ctx.beginPath();
  chamferPath(pane.x, pane.y, pane.w, pane.h, pane.ci);
  ctx.clip();
  const g = ctx.createLinearGradient(x - w * 0.7, pane.y, x + w * 0.7, pane.y + pane.h);
  g.addColorStop(0, 'rgba(226,246,255,0)');
  g.addColorStop(0.5, 'rgba(226,246,255,0.5)');
  g.addColorStop(1, 'rgba(226,246,255,0)');
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - w, pane.y);
  ctx.lineTo(x + w * 0.24, pane.y);
  ctx.lineTo(x + w * 1.24, pane.y + pane.h);
  ctx.lineTo(x, pane.y + pane.h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFlash(t){
  const g0 = ramp(t, T_IMPACT, T_IMPACT + 0.85);
  const f = 1 - g0;
  if (f <= 0.005) return;
  const r = Math.min(pane.w, pane.h) * (0.2 + 0.95 * g0);
  const g = ctx.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, r);
  g.addColorStop(0, 'rgba(255,255,255,' + (0.95 * f).toFixed(3) + ')');
  g.addColorStop(0.18, 'rgba(198,240,255,' + (0.6 * f).toFixed(3) + ')');
  g.addColorStop(0.5, 'rgba(96,190,246,' + (0.22 * f).toFixed(3) + ')');
  g.addColorStop(1, 'rgba(64,150,220,0)');
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(impact.x, impact.y, r, 0, Math.PI * 2);
  ctx.fill();
  const rr = ramp(t, T_IMPACT, T_IMPACT + 0.5);
  if (rr > 0 && rr < 1){
    ctx.globalAlpha = (1 - rr) * 0.7;
    ctx.lineWidth = Math.max(1, Math.min(pane.w, pane.h) * 0.006);
    ctx.strokeStyle = 'rgba(226,246,255,0.9)';
    ctx.beginPath();
    ctx.arc(impact.x, impact.y, rr * Math.min(pane.w, pane.h) * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParts(dt){
  if (!parts.length) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineJoin = 'round';
  let n = 0;
  for (let i = 0; i < parts.length; i++){
    const s = parts[i];
    s.life -= dt;
    if (s.life <= 0) continue;
    s.vy += 520 * dt;
    s.vx *= 0.986;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.rot += s.vr * dt;
    parts[n++] = s;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.globalAlpha = clamp01(s.life / s.max) * 0.8;
    ctx.beginPath();
    ctx.moveTo(-s.s, -s.s * 0.6);
    ctx.lineTo(s.s * 0.9, 0);
    ctx.lineTo(-s.s * 0.4, s.s * 0.8);
    ctx.closePath();
    ctx.fillStyle = 'rgba(190,232,255,0.5)';
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(242,253,255,0.9)';
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  parts.length = n;
}

function drawFrame(){
  ctx.save();
  ctx.beginPath();
  chamferPath(0, 0, W, H, pane.co);
  chamferPath(pane.x, pane.y, pane.w, pane.h, pane.ci);
  ctx.fillStyle = gFrame;
  ctx.fill('evenodd');
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1;
  ctx.beginPath();
  chamferPath(pane.x + 0.5, pane.y + 0.5, pane.w - 1, pane.h - 1, pane.ci);
  ctx.strokeStyle = 'rgba(186,226,252,0.5)';
  ctx.stroke();
  ctx.globalAlpha = 0.28;
  ctx.beginPath();
  chamferPath(1, 1, W - 2, H - 2, pane.co);
  ctx.strokeStyle = 'rgba(120,180,220,0.5)';
  ctx.stroke();
  ctx.restore();
}

function drawRim(a){
  if (a <= 0.005) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.beginPath();
  chamferPath(pane.x, pane.y, pane.w, pane.h, pane.ci);
  ctx.strokeStyle = gRim;
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineWidth = 7;
  ctx.globalAlpha = a * 0.13;
  ctx.stroke();
  ctx.lineWidth = 2.6;
  ctx.globalAlpha = a * 0.34;
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = a;
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = a * 0.1;
  ctx.beginPath();
  chamferPath(pane.x + 3, pane.y + 3, pane.w - 6, pane.h - 6, pane.ci * 0.6);
  ctx.strokeStyle = 'rgba(206,238,255,1)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function phaseName(t){
  if (t < T_IMPACT) return 'Intact';
  if (t < T_CRACK) return 'Impact';
  if (t < T_HOLD) return 'Crack Propagation';
  if (t < T_SPLIT) return 'Fracture Hold';
  if (t < T_RESID) return 'Shard Separation';
  if (t < T_REFORM) return 'Residual Rim';
  return 'Reforming';
}

function setText(el, v){
  if (el && el.textContent !== v) el.textContent = v;
}

function updateState(t){
  const split = ramp(t, T_SPLIT, T_RESID);
  const reform = ramp(t, T_REFORM, CYCLE);
  const ct = clamp01((t - T_CRACK) / (T_HOLD - T_CRACK));
  live = 0;
  for (let i = 0; i < trails.length; i++){
    const tr = trails[i];
    tr.rev = clamp01((ct - tr.delay) / tr.dur);
    tr.fresh = tr.rev > 0 && tr.rev < 1;
    if (tr.fresh){
      live++;
      fillSlot(i, tr.rev);
    }else if (tr.rev >= 1){
      fillSlot(i, 1);
    }else{
      counts[i] = 0;
    }
  }
  setText(phaseEl, phaseName(t));
  setText(frontsEl, String(live));
  setText(integrityEl, Math.round(clamp01(1 - 0.88 * split + 0.88 * reform) * 100) + '%');
  const bp = Math.round(clamp01(t / CYCLE) * 400) / 400;
  if (bp !== lastBar){
    lastBar = bp;
    barEl.style.transform = 'scaleX(' + bp + ')';
  }
  if (shards.length !== lastCells){
    lastCells = shards.length;
    setText(cellsEl, String(shards.length));
  }
}

function render(t, dt){
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  updateState(t);

  const split = ramp(t, T_SPLIT, T_RESID);
  const reform = ramp(t, T_REFORM, CYCLE);
  const glassA = 1 - 0.88 * split + 0.88 * reform;
  const shardA = ramp(t, T_SPLIT, T_SPLIT + 0.9) * (1 - 0.94 * reform);
  const netA = ramp(t, T_CRACK, T_CRACK + 0.3) * (1 - 0.96 * reform);
  const flashA = 1 - ramp(t, T_IMPACT, T_IMPACT + 0.85);
  const gs = clamp01(ramp(t, T_HOLD - 0.3, T_SPLIT));
  const glintA = eSm(gs) * 0.5 + eSm(reform) * 0.7;

  drawGlass(clamp01(glassA + flashA * 0.3));
  drawGlint(glintA, eIn(gs) * 0.92 + reform * 0.04);
  drawShards(shardA, split);
  drawCracks(netA);
  drawFlash(t);
  drawParts(dt);
  drawFrame();
  drawRim(ramp(t, T_RESID, T_RESID + 0.5) * (1 - reform));
}

function spawn(t){
  if (t < T_IMPACT || parts.length) return;
  for (let i = 0; i < 30; i++){
    const a = rnd(0, Math.PI * 2);
    const v = rnd(40, 340);
    const life = rnd(0.6, 1.5);
    parts.push({
      x: impact.x,
      y: impact.y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 40,
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-7, 7),
      s: rnd(1.2, 3.6),
      life: life,
      max: life
    });
  }
}

let prev = 0;
function frame(now){
  const t = ((now - t0) / 1000) % CYCLE;
  const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60;
  prev = now;
  spawn(t);
  render(t, dt);
  requestAnimationFrame(frame);
}

function trigger(ev){
  const r = cv.getBoundingClientRect();
  const x = (ev.clientX - r.left) * (W / Math.max(1, r.width));
  const y = (ev.clientY - r.top) * (H / Math.max(1, r.height));
  build(x, y);
  t0 = performance.now() - T_IMPACT * 1000;
  prev = 0;
}

seedGrain();

if (reduced){
  size();
  render(T_SPLIT, 0);
}else{
  size();
  let timer = 0;
  window.addEventListener('resize', function(){
    clearTimeout(timer);
    timer = setTimeout(size, 140);
  });
  cv.addEventListener('pointerdown', trigger);
  t0 = performance.now();
  requestAnimationFrame(frame);
}
