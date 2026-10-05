const host = document.getElementById('flock');
const ret = document.getElementById('reticle');
const barsHost = document.getElementById('bars');
const vCount = document.getElementById('vCount');
const vSpeed = document.getElementById('vSpeed');
const vSpread = document.getElementById('vSpread');
const vCoh = document.getElementById('vCoh');
const vHead = document.getElementById('vHead');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const N = 72;
const BARS = 30;
const MAXSP = 3.6;
const MINSP = 1.15;
const RAD2 = Math.PI * 180;

const px = new Float32Array(N);
const py = new Float32Array(N);
const vx = new Float32Array(N);
const vy = new Float32Array(N);
const size = new Float32Array(N);
const nodes = new Array(N);
const hist = new Float32Array(BARS);
const barEls = new Array(BARS);

let W = 800;
let H = 600;
let t = 0;
let tick = 0;
let last = 0;

function measure(){
  const r = host.getBoundingClientRect();
  W = Math.max(240, r.width || window.innerWidth);
  H = Math.max(240, r.height || window.innerHeight);
}

function build(){
  const frag = document.createDocumentFragment();
  for (let i = 0; i < N; i++){
    const el = document.createElement('i');
    const inner = document.createElement('b');
    el.appendChild(inner);
    const s = 8 + Math.random() * 11;
    size[i] = s;
    el.style.setProperty('--bs', s.toFixed(1) + 'px');
    el.style.opacity = (0.5 + (s - 8) / 11 * 0.5).toFixed(2);
    inner.style.animationDuration = (0.36 + (i % 6) * 0.05).toFixed(2) + 's';
    inner.style.animationDelay = (-(i % 9) * 0.041).toFixed(3) + 's';
    frag.appendChild(el);
    nodes[i] = el;
  }
  host.appendChild(frag);

  const bf = document.createDocumentFragment();
  for (let i = 0; i < BARS; i++){
    const b = document.createElement('b');
    b.style.transform = 'scaleY(0.34)';
    bf.appendChild(b);
    barEls[i] = b;
  }
  barsHost.appendChild(bf);
}

function seed(){
  const cx = W * 0.5;
  const cy = H * 0.5;
  for (let i = 0; i < N; i++){
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * Math.min(W, H) * 0.24;
    px[i] = cx + Math.cos(a) * r;
    py[i] = cy + Math.sin(a) * r * 0.7;
    const sp = MINSP + Math.random() * 1.4;
    vx[i] = Math.cos(a + 1.7) * sp;
    vy[i] = Math.sin(a + 1.7) * sp;
  }
  for (let i = 0; i < BARS; i++) hist[i] = 0.3;
}

function step(dt){
  t += dt;
  const tx = W * 0.5 + Math.cos(t * 0.21) * W * 0.26 + Math.cos(t * 0.57) * W * 0.05;
  const ty = H * 0.5 + Math.sin(t * 0.33) * H * 0.13 + Math.sin(t * 0.74) * H * 0.04;
  const mx = 46;
  const my = Math.max(56, H * 0.35);

  for (let i = 0; i < N; i++){
    let ax = (tx - px[i]) * 0.00044;
    let ay = (ty - py[i]) * 0.00044;
    let sepX = 0;
    let sepY = 0;
    let alX = 0;
    let alY = 0;
    let coX = 0;
    let coY = 0;
    let n = 0;

    for (let j = 0; j < N; j++){
      if (j === i) continue;
      const dx = px[j] - px[i];
      const dy = py[j] - py[i];
      const d2 = dx * dx + dy * dy;
      if (d2 > 8200) continue;
      n++;
      coX += px[j];
      coY += py[j];
      alX += vx[j];
      alY += vy[j];
      if (d2 < 520 && d2 > 0.5){
        const inv = 34 / d2;
        sepX -= dx * inv;
        sepY -= dy * inv;
      }
    }

    if (n){
      ax += (coX / n - px[i]) * 0.0017 + (alX / n - vx[i]) * 0.05 + sepX * 0.02;
      ay += (coY / n - py[i]) * 0.0017 + (alY / n - vy[i]) * 0.05 + sepY * 0.02;
    }

    if (px[i] < mx) ax += (mx - px[i]) * 0.006;
    else if (px[i] > W - mx) ax -= (px[i] - (W - mx)) * 0.006;
    if (py[i] < my) ay += (my - py[i]) * 0.006;
    else if (py[i] > H - my) ay -= (py[i] - (H - my)) * 0.006;

    let nvx = (vx[i] + ax * dt) * 0.94;
    let nvy = (vy[i] + ay * dt) * 0.94;
    let sp = Math.hypot(nvx, nvy);
    if (sp > MAXSP){
      const k = MAXSP / sp;
      nvx *= k;
      nvy *= k;
      sp = MAXSP;
    } else if (sp < MINSP && sp > 0.001){
      const k = MINSP / sp;
      nvx *= k;
      nvy *= k;
      sp = MINSP;
    }
    vx[i] = nvx;
    vy[i] = nvy;
    px[i] += nvx * dt;
    py[i] += nvy * dt;
  }
}

function stats(){
  let sx = 0;
  let sy = 0;
  let sp = 0;
  let avx = 0;
  let avy = 0;
  for (let i = 0; i < N; i++){
    sx += px[i];
    sy += py[i];
    sp += Math.hypot(vx[i], vy[i]);
    avx += vx[i];
    avy += vy[i];
  }
  const cx = sx / N;
  const cy = sy / N;
  let vr = 0;
  for (let i = 0; i < N; i++){
    const dx = px[i] - cx;
    const dy = py[i] - cy;
    vr += Math.hypot(dx, dy);
  }
  const spread = vr / N;
  const span = Math.min(W, H) * 0.34;
  const coh = Math.max(0, Math.min(99, 100 - (spread / span) * 100));
  let head = Math.atan2(avy, avx) * RAD2 + 90;
  head = ((head % 360) + 360) % 360;
  return { cx, cy, sp: sp / N, spread, coh, head };
}

function render(){
  for (let i = 0; i < N; i++){
    const a = Math.atan2(vy[i], vx[i]) * RAD2 + 90;
    nodes[i].style.transform =
      'translate3d(' + (px[i] - size[i] * 0.5).toFixed(1) + 'px,' +
      (py[i] - size[i] * 0.5).toFixed(1) + 'px,0) rotate(' + a.toFixed(1) + 'deg)';
  }
  const s = stats();
  ret.style.transform = 'translate3d(' + s.cx.toFixed(1) + 'px,' + s.cy.toFixed(1) + 'px,0)';

  tick++;
  if (tick % 4 === 1){
    for (let i = 0; i < BARS - 1; i++) hist[i] = hist[i + 1];
    hist[BARS - 1] = Math.max(0.08, Math.min(1, (s.coh - 46) / 54));
    for (let i = 0; i < BARS; i++){
      barEls[i].style.transform = 'scaleY(' + hist[i].toFixed(3) + ')';
    }
  }
  if (tick % 8 === 1){
    vCount.textContent = String(N);
    vSpeed.textContent = s.sp.toFixed(2);
    vSpread.textContent = String(Math.round(s.spread));
    vCoh.textContent = String(Math.round(s.coh));
    vHead.textContent = String(Math.round(s.head)).padStart(3, '0');
  }
}

function loop(now){
  if (!last) last = now;
  let dt = (now - last) / 16.6667;
  last = now;
  if (dt > 3) dt = 3;
  if (dt < 0) dt = 0;
  step(dt);
  render();
  requestAnimationFrame(loop);
}

build();
measure();
seed();

if (reduced){
  for (let i = 0; i < 420; i++) step(1);
  render();
} else {
  render();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', function(){
  const ox = W;
  const oy = H;
  measure();
  const kx = W / ox;
  const ky = H / oy;
  for (let i = 0; i < N; i++){
    px[i] *= kx;
    py[i] *= ky;
  }
  render();
});
