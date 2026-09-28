const host = document.getElementById('school');
const vCount = document.getElementById('vCount');
const vCoh = document.getElementById('vCoh');
const vForm = document.getElementById('vForm');
const vThreat = document.getElementById('vThreat');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const N = 40;
const MAXSP = 2.4;
const MINSP = 0.9;
const LOOP = 13;
const DEG = 180 / Math.PI;

const px = new Float32Array(N);
const py = new Float32Array(N);
const vx = new Float32Array(N);
const vy = new Float32Array(N);
const ph = new Float32Array(N);
const nodes = new Array(N);

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
    el.style.setProperty('--fs', (16 + (i % 5) * 4).toFixed(0) + 'px');
    el.style.opacity = (0.66 + (i % 4) * 0.1).toFixed(2);
    el.style.animationDelay = (-(i % 7) * 0.09).toFixed(2) + 's';
    frag.appendChild(el);
    nodes[i] = el;
    ph[i] = i * 0.6;
  }
  host.appendChild(frag);
}

function seed(){
  const cx = W * 0.34;
  const cy = H * 0.5;
  for (let i = 0; i < N; i++){
    const a = (i / N) * Math.PI * 2;
    const r = 40 + (i % 6) * 12;
    px[i] = cx + Math.cos(a) * r;
    py[i] = cy + Math.sin(a) * r * 0.6;
    vx[i] = MINSP + (i % 3) * 0.3;
    vy[i] = 0;
  }
}

function formation(){
  const p = (t % LOOP) / LOOP;
  if (p < 0.34) return 'ball';
  if (p < 0.52) return 'opening';
  if (p < 0.78) return 'shield';
  return 'closing';
}

function step(dt){
  t += dt;
  const p = (t % LOOP) / LOOP;
  const cx = W * (0.3 + 0.1 * Math.sin(t * 0.2));
  const cy = H * (0.5 + 0.08 * Math.sin(t * 0.31));

  let open = 0;
  if (p > 0.34 && p < 0.78) {
    const k = p < 0.52 ? (p - 0.34) / 0.18 : 1 - (p - 0.52) / 0.26;
    open = Math.max(0, Math.min(1, k));
  }

  const hookX = W * (1.25 - ((p + 0.1) % 1) * 1.5);
  const hookY = H * (0.42 + 0.1 * Math.sin(t * 0.5));

  for (let i = 0; i < N; i++){
    const side = i % 2 === 0 ? -1 : 1;
    const row = (i >> 1) / (N / 2);
    const tx = cx + side * open * (60 + row * 170);
    const ty = cy + (row - 0.5) * (34 + open * 230);

    let ax = (tx - px[i]) * 0.0034;
    let ay = (ty - py[i]) * 0.0034;

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
      if (d2 > 3600) continue;
      n++;
      coX += px[j];
      coY += py[j];
      alX += vx[j];
      alY += vy[j];
      if (d2 < 220 && d2 > 0.5){
        const inv = 26 / d2;
        sepX -= dx * inv;
        sepY -= dy * inv;
      }
    }

    if (n){
      ax += (coX / n - px[i]) * 0.0026 + (alX / n - vx[i]) * 0.06 + sepX * 0.02;
      ay += (coY / n - py[i]) * 0.0026 + (alY / n - vy[i]) * 0.06 + sepY * 0.02;
    }

    const hx = px[i] - hookX;
    const hy = py[i] - hookY;
    const hd = Math.sqrt(hx * hx + hy * hy) + 0.001;
    if (hd < 190){
      ax += (hx / hd) * (190 - hd) * 0.02;
      ay += (hy / hd) * (190 - hd) * 0.02;
    }

    ax += 0.014 + Math.sin(t * 0.7 + ph[i]) * 0.004;

    const m = 40;
    if (px[i] < m) ax += (m - px[i]) * 0.008;
    else if (px[i] > W - m) ax -= (px[i] - (W - m)) * 0.008;
    if (py[i] < m) ay += (m - py[i]) * 0.008;
    else if (py[i] > H - m) ay -= (py[i] - (H - m)) * 0.008;

    let nvx = (vx[i] + ax * dt) * 0.95;
    let nvy = (vy[i] + ay * dt) * 0.95;
    const sp = Math.hypot(nvx, nvy);
    if (sp > MAXSP){
      nvx = (nvx / sp) * MAXSP;
      nvy = (nvy / sp) * MAXSP;
    } else if (sp < MINSP && sp > 0.001){
      nvx = (nvx / sp) * MINSP;
      nvy = (nvy / sp) * MINSP;
    }
    vx[i] = nvx;
    vy[i] = nvy;
    px[i] += nvx * dt;
    py[i] += nvy * dt;
  }
}

function render(){
  for (let i = 0; i < N; i++){
    const a = Math.atan2(vy[i], vx[i]) * DEG;
    nodes[i].style.transform =
      'translate3d(' + (px[i] - 6).toFixed(1) + 'px,' + (py[i] - 3).toFixed(1) + 'px,0) rotate(' + a.toFixed(1) + 'deg)';
  }

  let sx = 0;
  let sy = 0;
  for (let i = 0; i < N; i++){
    sx += px[i];
    sy += py[i];
  }
  const cx = sx / N;
  const cy = sy / N;
  let spread = 0;
  for (let i = 0; i < N; i++){
    const dx = px[i] - cx;
    const dy = py[i] - cy;
    spread += Math.sqrt(dx * dx + dy * dy);
  }
  spread /= N;

  tick++;
  if (tick % 8 === 1){
    vCount.textContent = String(N);
    vCoh.textContent = (1 - spread / (Math.min(W, H) * 0.5)).toFixed(2);
    vForm.textContent = formation();
    vThreat.textContent = t % LOOP > 4.4 && t % LOOP < 10.2 ? 'near' : 'clear';
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
  for (let i = 0; i < 200; i++) step(1);
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
