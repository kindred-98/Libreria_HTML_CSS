(() => {
  const svg = document.getElementById('mobius');
  if (!svg) return;

  const elBody = document.getElementById('body');
  const elEdge = document.getElementById('edge');
  const elEdgeHalo = document.getElementById('edgeHalo');
  const elSpine = document.getElementById('spine');
  const elSpineHalo = document.getElementById('spineHalo');
  const elRibsMajor = document.getElementById('ribsMajor');
  const elRibsMinor = document.getElementById('ribsMinor');
  const elReveal = document.getElementById('reveal');
  const elComet = document.getElementById('comet');
  const lobeBack = document.getElementById('lobeBack');
  const lobeFront = document.getElementById('lobeFront');
  const outReveal = document.getElementById('revealOut');
  const barReveal = document.getElementById('revealBar');
  const outBands = document.getElementById('bandOut');

  const TAU = Math.PI * 2;
  const SEG = 168;
  const RIB_MAJOR = 12;
  const RIB_MINOR = 48;
  const R = 196;
  const W = 84;
  const CX = 500;
  const CY = 322;
  const SCALE = 1.02;
  const FOCAL = 900;

  const CYCLE = 16;
  const REVEAL = 4.2;
  const HOLD = 2.6;
  const FADE = 2.2;

  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  const cosA = new Float64Array(SEG + 1);
  const sinA = new Float64Array(SEG + 1);
  for (let i = 0; i <= SEG; i++) {
    const t = (i / SEG) * TAU;
    cosA[i] = Math.cos(t);
    sinA[i] = Math.sin(t);
  }

  const P = new Float64Array((SEG + 1) * 2);
  const Z = new Float64Array(SEG + 1);
  const Pm = new Float64Array((SEG + 1) * 2);
  const Zm = new Float64Array(SEG + 1);
  // C se guarda por parejas x/y, igual que P y Pm: con (SEG + 1) solo cabian
  // las x, los Float64Array no crecen al escribir fuera de rango y las
  // lecturas de la i = 85 en adelante devolvian undefined. fmt() les ponia
  // "NaN" y el navegador quejaba del atributo d del <path> del lomo.
  const C = new Float64Array((SEG + 1) * 2);
  const Zc = new Float64Array(SEG + 1);

  function rot(x, y, z, ax, ay, az, out) {
    const cx = Math.cos(ax), sx = Math.sin(ax);
    const cy = Math.cos(ay), sy = Math.sin(ay);
    const cz = Math.cos(az), sz = Math.sin(az);
    const y1 = y * cx - z * sx;
    const z1 = y * sx + z * cx;
    const x2 = x * cy + z1 * sy;
    const z2 = -x * sy + z1 * cy;
    const x3 = x2 * cz - y1 * sz;
    const y3 = x2 * sz + y1 * cz;
    out[0] = x3;
    out[1] = y3;
    out[2] = z2;
  }

  const tmp = [0, 0, 0];
  let ax = 0, ay = 0, az = 0;

  function surface(rotX, rotY, rotZ) {
    for (let i = 0; i <= SEG; i++) {
      const ch = Math.cos((i / SEG) * Math.PI);
      const sh = Math.sin((i / SEG) * Math.PI);
      const rr = R + W * ch;
      rot(rr * cosA[i], rr * sinA[i], W * sh, rotX, rotY, rotZ, tmp);
      const k = FOCAL / (FOCAL + tmp[2]);
      P[i * 2] = CX + tmp[0] * k * SCALE;
      P[i * 2 + 1] = CY - tmp[1] * k * SCALE;
      Z[i] = tmp[2];

      const rm = R - W * ch;
      rot(rm * cosA[i], rm * sinA[i], -W * sh, rotX, rotY, rotZ, tmp);
      const km = FOCAL / (FOCAL + tmp[2]);
      Pm[i * 2] = CX + tmp[0] * km * SCALE;
      Pm[i * 2 + 1] = CY - tmp[1] * km * SCALE;
      Zm[i] = tmp[2];

      rot(R * cosA[i], R * sinA[i], 0, rotX, rotY, rotZ, tmp);
      const kc = FOCAL / (FOCAL + tmp[2]);
      C[i * 2] = CX + tmp[0] * kc * SCALE;
      C[i * 2 + 1] = CY - tmp[1] * kc * SCALE;
      Zc[i] = tmp[2];
    }
  }

  function fmt(n) {
    return (Math.round(n * 10) / 10).toString();
  }

  function loopPath(buf, from, to, close) {
    let d = '';
    const a = Math.max(0, from);
    const b = Math.min(SEG, to);
    if (b <= a) return 'M0 0';
    for (let i = a; i <= b; i++) {
      d += (i === a ? 'M' : 'L') + fmt(buf[i * 2]) + ' ' + fmt(buf[i * 2 + 1]);
    }
    if (close) d += 'Z';
    return d;
  }

  function buildRibs(count, out) {
    let front = '';
    let back = '';
    for (let n = 0; n < count; n++) {
      const t = (n / count) * TAU;
      const idx = Math.round((t / TAU) * SEG) % SEG;
      const i = idx;
      const zf = (Z[i] + Zm[i]) * 0.5;
      const seg = 'M' + fmt(Pm[i * 2]) + ' ' + fmt(Pm[i * 2 + 1]) +
        'L' + fmt(P[i * 2]) + ' ' + fmt(P[i * 2 + 1]);
      if (zf >= 0) front += seg;
      else back += seg;
    }
    out[0] = front;
    out[1] = back;
    return out;
  }

  const ribBuf = ['', ''];
  let lastLobe = '';

  const surf = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  surf.setAttribute('class', 'surf');
  if (elBody && elBody.parentNode) elBody.parentNode.insertBefore(surf, elBody);
  const surfPool = [];
  for (let i = 0; i < SEG; i++) {
    const q = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    surf.appendChild(q);
    surfPool.push(q);
  }

  const quads = new Array(SEG);
  for (let i = 0; i < SEG; i++) quads[i] = { i: i, d: '', z: 0, c: '' };
  let surfKey = '';

  function shade(t, lam) {
    const a = 0.5 + 0.5 * Math.sin(t * 2.0);
    const b = 0.5 + 0.5 * Math.sin(t * 2.0 + 2.1);
    const c = 0.5 + 0.5 * Math.sin(t * 2.0 + 4.2);
    const r = Math.round((26 + 150 * a) * lam + 12 * lam);
    const g = Math.round((14 + 60 * b) * lam + 8 * lam);
    const bl = Math.round((48 + 170 * c) * lam + 22 * lam);
    return 'rgb(' + Math.min(255, r) + ',' + Math.min(255, g) + ',' + Math.min(255, bl) + ')';
  }

  function buildSurface(t) {
    for (let i = 0; i < SEG; i++) {
      const j = i + 1;
      const q = quads[i];
      const ax0 = Pm[i * 2], ay0 = Pm[i * 2 + 1];
      const bx0 = P[i * 2], by0 = P[i * 2 + 1];
      const ax1 = Pm[j * 2], ay1 = Pm[j * 2 + 1];
      const bx1 = P[j * 2], by1 = P[j * 2 + 1];
      q.d = 'M' + fmt(ax0) + ' ' + fmt(ay0) + 'L' + fmt(bx0) + ' ' + fmt(by0) +
        'L' + fmt(bx1) + ' ' + fmt(by1) + 'L' + fmt(ax1) + ' ' + fmt(ay1) + 'Z';
      q.z = (Z[i] + Zm[i] + Z[j] + Zm[j]) * 0.25;
      const ux = bx0 - ax0, uy = by0 - ay0;
      const vx = bx1 - ax0, vy = by1 - ay0;
      let nx = uy * vx - ux * vy;
      let ny = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny) || 1;
      nx /= nl;
      ny /= nl;
      const lam = 0.24 + 0.76 * Math.max(0, nx * 0.42 - ny * 0.5 + 0.62);
      q.c = shade((i / SEG) * TAU, lam);
      q.k = Math.round(lam * 90);
    }
    quads.sort(function (p, r) { return p.z - r.z; });
    let key = '';
    for (let n = 0; n < SEG; n++) key += quads[n].k + ',';
    if (key === surfKey) return;
    surfKey = key;
    for (let n = 0; n < SEG; n++) {
      const q = quads[n];
      const el = surfPool[n];
      el.setAttribute('d', q.d);
      el.setAttribute('fill', q.c);
    }
  }

  function draw(sec) {
    const u = ((sec % CYCLE) + CYCLE) % CYCLE;
    let ax0, ay0, az0;
    if (u < REVEAL + HOLD + FADE) {
      ax0 = 1.02 - 0.16 * Math.sin(u * 0.5);
      ay0 = -0.62 + u * 0.055;
      az0 = 0.12 * Math.sin(u * 0.42);
    } else {
      const v = (u - REVEAL - HOLD - FADE) / (CYCLE - REVEAL - HOLD - FADE);
      ax0 = 1.02;
      ay0 = -0.62 + (REVEAL + HOLD + FADE) * 0.055 + v * 0.5;
      az0 = 0.12 * Math.sin(u * 0.42);
    }
    ax = ax0;
    ay = ay0;
    az = az0;
    surface(ax, ay, az);

    const edgeD = loopPath(P, 0, SEG, true);
    buildSurface(u);
    elBody.setAttribute('d', edgeD);
    elEdge.setAttribute('d', edgeD);
    elEdgeHalo.setAttribute('d', edgeD);

    const spineD = loopPath(C, 0, SEG, true);
    elSpine.setAttribute('d', spineD);
    elSpineHalo.setAttribute('d', spineD);

    const mid = Math.round(SEG / 2);
    buildRibs(RIB_MINOR, ribBuf);
    elRibsMinor.setAttribute('d', ribBuf[0] + ribBuf[1]);
    buildRibs(RIB_MAJOR, ribBuf);
    elRibsMajor.setAttribute('d', ribBuf[0]);

    let pct = 100;
    if (u < REVEAL) pct = (u / REVEAL) * 100;
    else if (u < REVEAL + HOLD) {
      // la fase de espera mantiene pct en 100, el valor con el que se declara
    } else if (u < REVEAL + HOLD + FADE) pct = 100 - ((u - REVEAL - HOLD) / FADE) * 100;
    const cut = Math.round(((pct / 100) * SEG));
    elReveal.setAttribute('d', pct >= 99.5 ? edgeD : loopPath(P, 0, cut, false));
    elReveal.style.opacity = pct >= 99.5 || pct > 0.5 ? '1' : '0';

    const ct = (u * 0.42) % TAU;
    const ci = Math.round((ct / TAU) * SEG) % SEG;
    const cn = (ci + 7) % SEG;
    elComet.setAttribute('d', 'M' + fmt(P[ci * 2]) + ' ' + fmt(P[ci * 2 + 1]) +
      'L' + fmt(P[cn * 2]) + ' ' + fmt(P[cn * 2 + 1]));
    elComet.style.opacity = pct > 4 ? '1' : '0';

    const lt = [];
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const f = (i / steps) * TAU;
      const lx = 150 * Math.sin(f);
      const ly = 104 * Math.sin(f) * Math.cos(f);
      const lz = 78 * Math.cos(2 * f);
      rot(lx, ly, lz, ax * 0.72, ay * 0.72 + 0.9, az * 0.72, tmp);
      const k = FOCAL / (FOCAL + tmp[2]);
      const x = CX + tmp[0] * k * SCALE;
      const y = CY - tmp[1] * k * SCALE;
      lt.push({ x: fmt(x), y: fmt(y), z: tmp[2] });
    }
    let whole = 'M';
    for (let i = 0; i < lt.length; i++) {
      whole += (i === 0 ? '' : 'L') + lt[i].x + ' ' + lt[i].y;
    }
    whole += 'Z';
    if (whole !== lastLobe) {
      lastLobe = whole;
      lobeBack.innerHTML = '<path d="' + whole + '"/>';
      lobeFront.innerHTML = '';
    }

    if (outReveal) outReveal.textContent = Math.round(pct) + '%';
    if (barReveal) barReveal.style.transform = 'scaleX(' + (pct / 100).toFixed(3) + ')';
    if (outBands) outBands.textContent = (W * 2).toFixed(0) + ' px';
  }

  let last = 0;
  let acc = 0;
  let raf = 0;
  let t0 = 0;

  function frame(now) {
    if (!t0) t0 = now;
    const dt = Math.min(50, now - last || 16);
    last = now;
    acc += dt;
    draw(acc / 1000);
    raf = requestAnimationFrame(frame);
  }

  function still() {
    draw(REVEAL * 0.62);
  }

  function start() {
    if (raf) return;
    last = 0;
    t0 = 0;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function sync() {
    if (calm.matches) {
      stop();
      still();
    } else {
      start();
    }
  }

  if (calm.addEventListener) calm.addEventListener('change', sync);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (!calm.matches) start();
  });

  sync();
})();
