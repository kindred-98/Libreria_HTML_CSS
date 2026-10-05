const view = document.getElementById('view');
const grainEl = document.querySelector('.grain');
const fstopEl = document.getElementById('fstop');
const focusEl = document.getElementById('focus');
const splitEl = document.getElementById('split');
const barEl = document.getElementById('bar');
const tcodeEl = document.getElementById('tcode');
const tshutterEl = document.getElementById('tshutter');
const tirisEl = document.getElementById('tiris');
const tdistEl = document.getElementById('tdist');
const fmarkEl = document.getElementById('fmark');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (v) => {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
};
const lerp = (a, b, t) => a + (b - a) * t;
const eIO = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const eOut = x => 1 - Math.pow(1 - x, 4);

const LOOP = 7.6;
const STOPS = ['T1.4', 'T2', 'T2.8', 'T4', 'T5.6', 'T8', 'T11', 'T16'];

let unit = 180;
let t0 = performance.now();
let prev = 0;
let bf = 0;
let vel = 0;
let prx = 0, pry = 0, trx = 0, try_ = 0;
let manual = -1;
let lastOpenRaw = 1;
let lastOpen = -1, lastBf = -1, lastCa = -1, lastMark = -1, lastBar = -1;

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

function setText(el, v){
  if (el && el.textContent !== v) el.textContent = v;
}

function aperture(u){
  if (u >= 0.84) return 1.4;
  if (u >= 0.44) return 1.4 + (0.84 - u) / 0.4 * 10.6;
  if (u >= 0.14) return 12 + (0.44 - u) / 0.3 * 4;
  return 16;
}

function shape(x){
  if (x < 0.16) return 1;
  if (x < 0.42) return 1 - eIO((x - 0.16) / 0.26) * 0.94;
  if (x < 0.58) return 0.06;
  if (x < 0.86) return 0.06 + eOut((x - 0.58) / 0.28) * 0.94;
  return 1;
}

function measure(){
  const r = view.getBoundingClientRect();
  const m = Math.min(r.width, r.height);
  unit = Math.max(72, m * 0.36);
  view.style.setProperty('--r', unit.toFixed(2) + 'px');
}

function steer(ev){
  const r = view.getBoundingClientRect();
  if (!r.width || !r.height) return;
  trx = ((ev.clientX - r.left) / r.width - 0.5) * 15;
  try_ = ((ev.clientY - r.top) / r.height - 0.5) * 9;
}

const BLADES = Array.prototype.slice.call(document.querySelectorAll('.blade'));
const LAGS = [0, 0.007, 0.015, 0.023, 0.032, 0.041, 0.05, 0.059, 0.068];
const TAIL = BLADES.length > 1 ? LAGS[BLADES.length - 1] : 0;
const OPEN_MAX = 0.58;
const OPEN_MIN = 0.015;
let lastK = -1;

function paintIris(open){
  const q = Math.round(open * 500) / 500;
  if (q === lastK) return;
  lastK = q;
  for (let i = 0; i < BLADES.length; i++){
    let o = (q - LAGS[i]) / (1 - TAIL);
    if (o < 0) o = 0;
    if (o > 1) o = 1;
    const k = OPEN_MIN + (OPEN_MAX - OPEN_MIN) * o;
    const ix = 50 + 50 * k;
    const iy = 50 * k * 0.36397;
    BLADES[i].style.clipPath = 'polygon(' + ix.toFixed(2) + '% ' + (50 - iy).toFixed(2) + '%,100% 30.2%,100% 69.8%,' + ix.toFixed(2) + '% ' + (50 + iy).toFixed(2) + '%)';
  }
}

function applyState(open, blur, ca, rack){
  const s = view.style;
  const q = Math.round(open * 400) / 400;
  paintIris(q);
  if (q !== lastOpen){
    lastOpen = q;
    s.setProperty('--open', String(q));
  }
  const b = Math.round(blur * 100) / 100;
  if (b !== lastBf){
    lastBf = b;
    s.setProperty('--bf', b + 'px');
  }
  const c = Math.round(ca * 100) / 100;
  if (c !== lastCa){
    lastCa = c;
    s.setProperty('--ca', c + 'px');
  }
  s.setProperty('--rack', (Math.round(rack * 100) / 100).toFixed(2));
}

function readouts(open, blur, ca){
  const f = aperture(open);
  const fs = 'T' + f.toFixed(1);
  setText(fstopEl, fs);
  setText(tirisEl, fs);
  const fo = (0.34 + blur * 0.42).toFixed(2) + ' m';
  setText(focusEl, fo);
  setText(tdistEl, fo);
  setText(splitEl, ca.toFixed(1) + ' px');
  const idx = Math.min(STOPS.length - 1, Math.round((Math.log(f / 1.4) / Math.log(16 / 1.4)) * (STOPS.length - 1)));
  setText(tshutterEl, STOPS[idx]);
  const now = performance.now();
  const total = Math.floor((now - t0) / 1000 * 24);
  setText(tcodeEl, '00:00:' + String(total % 24).padStart(2, '0') + ':' + String(Math.floor(total / 24) % 60).padStart(2, '0'));
  const mk = Math.round(clamp01(1 - blur / 6.4) * 1000) / 1000;
  if (mk !== lastMark){
    lastMark = mk;
    fmarkEl.style.left = (8 + mk * 84).toFixed(2) + '%';
  }
  const bar = Math.round(open * 200) / 200;
  if (bar !== lastBar){
    lastBar = bar;
    barEl.style.transform = 'scaleX(' + bar + ')';
  }
}

function frame(now){
  const dt = prev ? Math.min(0.05, (now - prev) / 1000) : 1 / 60;
  prev = now;
  let x = ((now - t0) / 1000 % LOOP) / LOOP;
  if (manual >= 0){
    x = clamp01(manual);
    manual += dt / 0.9;
    if (manual > 1.06) manual = -1;
  }
  const open = shape(x);
  const target = (1 - open) * 6.4;
  const rate = open > bf / 6.4 ? 5.2 : 2.6;
  bf += (target - bf) * Math.min(1, rate * dt);
  const inst = Math.abs(open - lastOpenRaw) / Math.max(dt, 0.001);
  lastOpenRaw = open;
  vel = lerp(vel, clamp01(inst / 3.4), Math.min(1, 8 * dt));
  const ca = 0.4 + vel * 7.2 + (1 - open) * 1.7;
  const moving = x > 0.14 && x < 0.44 || x > 0.56 && x < 0.88;
  const rack = moving ? clamp01(vel * 2.6) : Math.max(0, 0.34 - Math.abs(open - 0.06) * 0.4);
  prx = lerp(prx, trx, Math.min(1, 3.4 * dt));
  pry = lerp(pry, try_, Math.min(1, 3.4 * dt));
  view.style.setProperty('--pr', prx.toFixed(2) + 'deg');
  view.style.setProperty('--pa', pry.toFixed(2) + 'deg');
  applyState(open, bf, ca, rack);
  readouts(open, bf, ca);
  requestAnimationFrame(frame);
}

seedGrain();

if (reduced){
  measure();
  applyState(0.32, 2.2, 2.4, 0.4);
  readouts(0.32, 2.2, 2.4);
  window.addEventListener('resize', measure);
}else{
  measure();
  window.addEventListener('resize', measure);
  view.addEventListener('pointermove', steer, { passive: true });
  view.addEventListener('pointerleave', function(){ trx = 0; try_ = 0; }, { passive: true });
  view.addEventListener('pointerdown', function(){
    manual = 0;
  });
  t0 = performance.now();
  requestAnimationFrame(frame);
}
