const cine = document.getElementById('cine');
const grainEl = document.querySelector('.grain');
const outEl = document.getElementById('out');
const ghostsEl = document.getElementById('ghosts');
const anaEl = document.getElementById('ana');
const bloomEl = document.getElementById('bloom');
const barEl = document.getElementById('bar');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const clamp01 = (v) => {
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
};
const TAU = Math.PI * 2;
const LOOP = 12.9;
const GHOSTS = 11;

let tx = 0, ty = 0, px = 0, py = 0;
let t0 = performance.now();
let lastOut = -1, lastBar = -1, lastBloom = -1, lastAna = -1, lastGhosts = -1;

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

function pulse(ph){
  const a = Math.sin(TAU * ph / LOOP);
  const b = Math.sin(TAU * ph / (LOOP * 1.6) + 1.3);
  const c = Math.sin(TAU * ph / (LOOP * 0.6) + 2.6);
  return clamp01(0.5 + 0.5 * (a * 0.62 + b * 0.28 + c * 0.16));
}

function steer(ev){
  const r = cine.getBoundingClientRect();
  if (!r.width || !r.height) return;
  tx = ((ev.clientX - r.left) / r.width - 0.5) * r.width * 0.085;
  ty = ((ev.clientY - r.top) / r.height - 0.5) * r.height * 0.085;
}

function apply(out, ox, oy){
  cine.style.setProperty('--out', out.toFixed(3));
  cine.style.setProperty('--px', ox.toFixed(2) + 'px');
  cine.style.setProperty('--py', oy.toFixed(2) + 'px');
}

function readouts(out){
  const o = Math.round(out * 100);
  setText(outEl, o + '%');
  const b = (0.55 + out * 0.95).toFixed(2);
  if (b !== lastBloom){
    lastBloom = b;
    setText(bloomEl, b);
  }
  const a = (1.9 + out * 0.35).toFixed(2) + 'x';
  if (a !== lastAna){
    lastAna = a;
    setText(anaEl, a);
  }
  if (GHOSTS !== lastGhosts){
    lastGhosts = GHOSTS;
    setText(ghostsEl, String(GHOSTS));
  }
  const q = Math.round(out * 200) / 200;
  if (q !== lastBar){
    lastBar = q;
    barEl.style.transform = 'scaleX(' + q + ')';
  }
}

function frame(now){
  const ph = ((now - t0) / 1000) % LOOP;
  const out = pulse(ph);
  px += (tx - px) * 0.055;
  py += (ty - py) * 0.055;
  apply(out, px, py);
  readouts(out);
  requestAnimationFrame(frame);
}

seedGrain();

if (reduced){
  apply(0.58, 0, 0);
  readouts(0.58);
}else{
  cine.addEventListener('pointermove', steer, { passive: true });
  cine.addEventListener('pointerleave', function(){ tx = 0; ty = 0; }, { passive: true });
  window.addEventListener('pointermove', function(ev){
    const r = cine.getBoundingClientRect();
    if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom){
      tx = 0;
      ty = 0;
    }
  }, { passive: true });
  t0 = performance.now();
  requestAnimationFrame(frame);
}
