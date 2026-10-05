const view = document.getElementById('view');
const city = document.getElementById('city');
const skyline = document.getElementById('skyline');
const grainEl = document.querySelector('.grain');
const zvalEl = document.getElementById('zval');
const distEl = document.getElementById('dist');
const apEl = document.getElementById('ap');
const countEl = document.getElementById('count');
const tstopEl = document.getElementById('tstop');
const barEl = document.getElementById('bar');
const railmarkEl = document.getElementById('railmark');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (v) => {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
};
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const TAU = Math.PI * 2;
const LOOP = 13.6;
const SKY_Z = 0.95;
const SPREAD = 0.3;

const TINTS = [
  ['hsla(38,94%,74%,.5)','hsla(32,98%,56%,.62)','hsla(48,100%,84%,.85)'],
  ['hsla(26,92%,68%,.48)','hsla(16,96%,50%,.6)','hsla(38,98%,80%,.82)'],
  ['hsla(332,84%,76%,.46)','hsla(314,90%,58%,.58)','hsla(342,94%,88%,.8)'],
  ['hsla(348,88%,70%,.48)','hsla(354,94%,52%,.6)','hsla(12,96%,82%,.82)'],
  ['hsla(190,92%,72%,.46)','hsla(198,94%,52%,.58)','hsla(184,98%,86%,.8)'],
  ['hsla(206,84%,76%,.44)','hsla(214,90%,56%,.56)','hsla(200,94%,88%,.78)'],
  ['hsla(162,74%,68%,.44)','hsla(172,80%,48%,.56)','hsla(150,86%,84%,.76)'],
  ['hsla(50,68%,92%,.48)','hsla(44,76%,74%,.58)','hsla(52,92%,98%,.82)']
];
const WEIGHTS = [4, 3, 3, 2, 2, 2, 1, 2];

const PLANES = [
  { z: 0.06, blur: 22,  n: 7,  smin: 0.30, smax: 0.62, amin: 0.2,  amax: 0.44, k: 5 },
  { z: 0.15, blur: 18,  n: 11, smin: 0.22, smax: 0.46, amin: 0.24, amax: 0.5,  k: 5 },
  { z: 0.26, blur: 14,  n: 15, smin: 0.15, smax: 0.32, amin: 0.3,  amax: 0.58, k: 4 },
  { z: 0.38, blur: 10.5,n: 19, smin: 0.1,  smax: 0.22, amin: 0.36, amax: 0.66, k: 4 },
  { z: 0.5,  blur: 7.5,n: 22, smin: 0.062,smax: 0.145,amin: 0.42, amax: 0.74, k: 3 },
  { z: 0.63, blur: 5,   n: 22, smin: 0.036,smax: 0.086,amin: 0.48, amax: 0.82, k: 2 },
  { z: 0.77, blur: 3.4, n: 20, smin: 0.019,smax: 0.048,amin: 0.54, amax: 0.9,  k: 2 },
  { z: 0.9,  blur: 2.2, n: 16, smin: 0.009,smax: 0.028,amin: 0.6,  amax: 0.96, k: 1 }
];

const TRAILS = [
  { p: 1, n: 9,  len: 0.62, ang: -0.32, sy: 0.36, t: 0 },
  { p: 2, n: 11, len: 0.78, ang: 0.18,  sy: 0.3,  t: 1 },
  { p: 3, n: 12, len: 0.9,  ang: -0.13, sy: 0.26, t: 0 },
  { p: 4, n: 12, len: 0.84, ang: 0.26,  sy: 0.28, t: 3 },
  { p: 5, n: 11, len: 0.7,  ang: -0.2,  sy: 0.32, t: 4 },
  { p: 6, n: 10, len: 0.6,  ang: 0.12,  sy: 0.34, t: 2 }
];

let pool = [];
let W = 900, H = 600, M = 600;
let planes = [];
let discs = 0;
let ptr = 0, ptrT = 0;
let t0 = performance.now();
let lastMark = -1, lastBar = -1, lastCount = -1, lastSky = -1;

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

function pick(){
  return pool[(Math.random() * pool.length | 0)];
}

function makePool(){
  pool = [];
  for (let i = 0; i < TINTS.length; i++){
    for (let k = 0; k < WEIGHTS[i]; k++) pool.push(TINTS[i]);
  }
}

function fill(host, list){
  const frag = document.createDocumentFragment();
  for (const d of list){
    const el = document.createElement('i');
    el.className = 'disc';
    el.style.setProperty('--x', d.x.toFixed(1) + 'px');
    el.style.setProperty('--y', d.y.toFixed(1) + 'px');
    el.style.setProperty('--d', d.d.toFixed(1) + 'px');
    el.style.setProperty('--o', d.o.toFixed(3));
    el.style.setProperty('--rz', d.rz + 'deg');
    el.style.setProperty('--sx', d.sx.toFixed(3));
    el.style.setProperty('--sy', d.sy.toFixed(3));
    el.style.setProperty('--c1', d.c[0]);
    el.style.setProperty('--c2', d.c[1]);
    el.style.setProperty('--c3', d.c[2]);
    frag.appendChild(el);
  }
  host.appendChild(frag);
}

function spread(n, rx, ry){
  const cols = Math.max(1, Math.round(Math.sqrt(n * rx / ry)));
  const rows = Math.max(1, Math.ceil(n / cols));
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r]);
  for (let i = cells.length - 1; i > 0; i--){
    const j = ((Math.random() * (i + 1)) | 0);
    const t = cells[i];
    cells[i] = cells[j];
    cells[j] = t;
  }
  const cw = (rx * 2) / cols;
  const ch = (ry * 2) / rows;
  const out = [];
  for (let i = 0; i < n; i++){
    const cell = cells[i % cells.length];
    out.push({
      x: -rx + (cell[0] + 0.5 + (Math.random() - 0.5) * 0.95) * cw,
      y: -ry + (cell[1] + 0.5 + (Math.random() - 0.5) * 0.95) * ch
    });
  }
  return out;
}

function build(){
  const r = view.getBoundingClientRect();
  W = r.width || 900;
  H = r.height || 600;
  M = Math.min(W, H);
  city.textContent = '';
  planes = [];
  discs = 0;
  const rx = W * 0.76;
  const ry = H * 0.76;
  for (const P of PLANES){
    const el = document.createElement('div');
    el.className = 'plane';
    const sh = document.createElement('div');
    sh.className = 'sh';
    const bl = document.createElement('div');
    bl.className = 'bl';
    bl.style.filter = 'blur(' + P.blur + 'px)';
    const spots = spread(P.n, rx, ry);
    const list = [];
    for (let k = 0; k < spots.length; k++){
      list.push({
        x: spots[k].x,
        y: spots[k].y,
        d: (P.smin + Math.pow((k + 0.35) / spots.length, 0.75) * (P.smax - P.smin)) * M,
        o: P.amin + Math.random() * (P.amax - P.amin),
        rz: Math.random() * 180,
        sx: 1,
        sy: 1,
        c: pick()
      });
    }
    fill(sh, list);
    fill(bl, list);
    discs += list.length;
    el.appendChild(sh);
    el.appendChild(bl);
    city.appendChild(el);
    planes.push({
      el: el,
      z: P.z,
      k: P.k,
      sh: sh,
      bl: bl,
      ph: Math.random() * TAU,
      ph2: Math.random() * TAU
    });
  }
  for (const T of TRAILS){
    const P = PLANES[T.p];
    const pl = planes[T.p];
    if (!pl) continue;
    const list = [];
    const a = T.ang;
    const base = (P.smax - P.smin) * M * 0.8;
    const span = W * 0.5;
    let x = -span + Math.random() * span * 1.6;
    let y = (Math.random() * 2 - 1) * ry * 0.7;
    const gap = base * 0.42;
    for (let k = 0; k < T.n; k++){
      const f = 1 - k / T.n * 0.45;
      list.push({
        x: x,
        y: y,
        d: base * f,
        o: (P.amin + 0.32) * (0.78 + (1 - f) * 0.4),
        rz: (a * 180 / Math.PI).toFixed(1),
        sx: 1.45,
        sy: T.sy,
        c: TINTS[T.t]
      });
      x += Math.cos(a) * gap;
      y += Math.sin(a) * gap;
    }
    fill(pl.sh, list);
    fill(pl.bl, list);
    discs += list.length;
  }
  countEl.textContent = String(discs);
}

function autoFocus(sec){
  const a = Math.sin(TAU * sec / LOOP);
  const b = Math.sin(TAU * sec / (LOOP * 0.4) + 1.1);
  const c = Math.sin(TAU * sec / (LOOP * 0.6) + 2.4);
  return 0.5 + a * 0.3 + b * 0.1 + c * 0.06;
}

function steer(ev){
  const r = view.getBoundingClientRect();
  if (!r.width) return;
  ptrT = (ev.clientX - r.left) / r.width * 2 - 1;
}

function setText(el, v){
  if (el && el.textContent !== v) el.textContent = v;
}

function readouts(z){
  setText(zvalEl, z.toFixed(2));
  setText(distEl, (0.22 + (1 - z) * 2.6).toFixed(2) + ' m');
  const fs = 'T' + (1.2 + (1 - z) * 0.6).toFixed(1);
  setText(apEl, fs);
  setText(tstopEl, fs);
  if (discs !== lastCount){
    lastCount = discs;
    setText(countEl, String(discs));
  }
  const mk = Math.round(z * 500) / 500;
  if (mk !== lastMark){
    lastMark = mk;
    railmarkEl.style.left = (2 + z * 96).toFixed(2) + '%';
  }
  const bar = Math.round(z * 400) / 400;
  if (bar !== lastBar){
    lastBar = bar;
    barEl.style.transform = 'scaleX(' + bar + ')';
  }
}

function applyFocus(zf){
  for (const P of planes){
    const t = smooth(clamp01(Math.abs(P.z - zf) / SPREAD));
    P.sh.style.opacity = (1 - t).toFixed(3);
    P.bl.style.opacity = t.toFixed(3);
  }
  const sk = smooth(clamp01(Math.abs(SKY_Z - zf) / 0.46));
  skyline.style.opacity = (0.4 + (1 - sk) * 0.58).toFixed(3);
  const skb = Math.round((0.8 + sk * 8.6) * 4) / 4;
  if (skb !== lastSky){
    lastSky = skb;
    skyline.style.filter = 'blur(' + (skb * 0.1).toFixed(2) + 'px)';
  }
}

function frame(){
  const sec = (performance.now() - t0) / 1000;
  ptr = lerp(ptr, ptrT, 0.055);
  const zf = clamp01(autoFocus(sec) + ptr * 0.42);
  for (const P of planes){
    const T = LOOP * P.k;
    const near = 1 - P.z;
    const dx = Math.sin(TAU * sec / T + P.ph) * near * 30 + Math.sin(TAU * sec / (T * 0.5) + P.ph2) * near * 9;
    const dy = Math.cos(TAU * sec / (T * 0.8) + P.ph2) * near * 19;
    P.el.style.transform = 'translate3d(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px,0)';
  }
  applyFocus(zf);
  readouts(zf);
  requestAnimationFrame(frame);
}

makePool();
seedGrain();
build();

if (reduced){
  applyFocus(0.42);
  readouts(0.42);
  let rt = 0;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ build(); applyFocus(0.42); }, 160);
  });
}else{
  view.addEventListener('pointermove', steer, { passive: true });
  view.addEventListener('pointerleave', function(){ ptrT = 0; }, { passive: true });
  let rt = 0;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){
      build();
      t0 = performance.now();
    }, 160);
  });
  t0 = performance.now();
  requestAnimationFrame(frame);
}
