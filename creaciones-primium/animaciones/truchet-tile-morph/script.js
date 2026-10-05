(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const lab = document.getElementById('lab');
  const flowBtn = document.getElementById('flowBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const tileOut = document.getElementById('tileOut');
  const linkOut = document.getElementById('linkOut');
  const loopOut = document.getElementById('loopOut');
  const linkBar = document.getElementById('linkBar');
  const turnOut = document.getElementById('turnOut');

  const R2 = 70.7106781;
  const ARC = 'M' + R2.toFixed(4) + ' 0A' + R2.toFixed(4) + ' ' + R2.toFixed(4) + ' 0 0 1 0 ' + R2.toFixed(4) +
    'M100 ' + (100 - R2).toFixed(4) + 'A' + R2.toFixed(4) + ' ' + R2.toFixed(4) + ' 0 0 0 ' + (100 - R2).toFixed(4) + ' 100';
  const BASE = [R2, 0, 100, 100 - R2, 100 - R2, 100, 0, R2];
  const ROT = [1, 0, 0, 1, 0, 1, 1, 0, -1, 0, 0, -1, 0, -1, -1, 0];
  const ENDS = new Float64Array(16);
  for (let k = 0; k < 4; k++) {
    const c = ROT[k * 4];
    const s = ROT[k * 4 + 1];
    for (let e = 0; e < 4; e++) {
      const dx = BASE[e * 2] - 50;
      const dy = BASE[e * 2 + 1] - 50;
      const x = 50 + dx * c - dy * s;
      const y = 50 + dx * s + dy * c;
      let slot;
      if (x < 0.5) slot = 3;
      else if (x > 99.5) slot = 1;
      else if (y < 0.5) slot = 0;
      else slot = 2;
      ENDS[k * 4 + slot] = slot === 1 || slot === 3 ? y : x;
    }
  }

  const GRADS = ['url(#g0)', 'url(#g1)', 'url(#g2)', 'url(#g3)', 'url(#g4)'];
  const PERIOD = 5200;
  const LEAD = 1500;

  let n = 0;
  let tiles = [];
  let parent = new Int16Array(0);
  let turns = 0;
  let flowOn = true;
  let primed = false;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const place = (t, deg) => {
    t.g.style.transform = 'translate(' + (t.i * 100 + 50) + 'px,' + (t.j * 100 + 50) + 'px) rotate(' + deg + 'deg) translate(-50px,-50px)';
  };

  const find = (x) => {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]];
      x = parent[x];
    }
    return x;
  };

  const join = (a, b) => {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    parent[ra] = rb;
  };

  const analyse = () => {
    const count = n * n;
    for (let i = 0; i < count; i++) parent[i] = i;
    let links = 0;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const id = j * n + i;
        const t = tiles[id];
        const e = t.rot * 4;
        if (i < n - 1) {
          const r = tiles[id + 1];
          if (Math.abs(ENDS[e + 1] - ENDS[r.rot * 4 + 3]) < 0.5) {
            links++;
            join(id, id + 1);
          }
        }
        if (j < n - 1) {
          const d = tiles[id + n];
          if (Math.abs(ENDS[e + 2] - ENDS[d.rot * 4]) < 0.5) {
            links++;
            join(id, id + n);
          }
        }
      }
    }
    let loops = 0;
    for (let i = 0; i < count; i++) if (find(i) === i) loops++;
    const max = n * (n - 1) * 2;
    linkOut.textContent = links;
    loopOut.textContent = loops;
    linkBar.style.transform = 'scaleX(' + (max ? links / max : 0).toFixed(3) + ')';
    tileOut.textContent = count;
    turnOut.textContent = turns;
  };

  const flip = (t, quiet) => {
    t.rot = (t.rot + 1) % 4;
    place(t, t.rot * 90);
    turns++;
    if (!quiet) analyse();
  };

  const build = (size) => {
    n = size;
    lab.setAttribute('viewBox', '0 0 ' + n * 100 + ' ' + n * 100);
    parent = new Int16Array(n * n);
    turns = 0;
    primed = false;
    const frag = document.createDocumentFragment();
    tiles = [];
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'tile');
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');
        g.setAttribute('aria-label', 'Labyrinth tile row ' + (j + 1) + ' column ' + (i + 1));
        const grad = GRADS[(i + j) % 5];
        const halo = document.createElementNS(NS, 'path');
        const core = document.createElementNS(NS, 'path');
        const hot = document.createElementNS(NS, 'path');
        halo.setAttribute('class', 'halo');
        core.setAttribute('class', 'core');
        hot.setAttribute('class', 'hot');
        halo.setAttribute('d', ARC);
        core.setAttribute('d', ARC);
        hot.setAttribute('d', ARC);
        halo.setAttribute('stroke', grad);
        core.setAttribute('stroke', grad);
        g.append(halo, core, hot);
        frag.appendChild(g);
        const t = {
          g, i, j,
          rot: Math.random() < 0.5 ? 0 : 1,
          k: -1,
          step: -1
        };
        place(t, t.rot * 90);
        g.style.setProperty('--k', '0');
        tiles.push(t);
      }
    }
    lab.appendChild(frag);
    tileOut.textContent = n * n;
    analyse();
  };

  const enter = () => {
    for (const t of tiles) {
      t.g.style.transitionDelay = ((t.i + t.j) * 18 + (t.i + n - t.j) * 6) + 'ms';
      place(t, (t.rot * 90 + 180) % 360);
    }
    lab.getBoundingClientRect();
    for (const t of tiles) {
      place(t, t.rot * 90);
    }
    window.setTimeout(() => {
      for (const t of tiles) t.g.style.transitionDelay = '0ms';
    }, (n * 2) * 18 + 900);
  };

  const wave = (clock) => {
    const u = (clock - LEAD) / PERIOD;
    for (const t of tiles) {
      const raw = u - (t.i + t.j) / (2 * n);
      const ph = raw - Math.floor(raw);
      const step = Math.floor(ph * 2);
      if (step !== t.step) {
        t.step = step;
        if (primed) flip(t, true);
      }
      const q = ph * 2;
      const f = q - Math.floor(q);
      const k = Math.max(0, 1 - 2.6 * f);
      if (Math.abs(k - t.k) > 0.05) {
        t.k = k;
        t.g.style.setProperty('--k', k.toFixed(3));
      }
    }
  };

  const size = () => {
    const w = window.innerWidth;
    if (w < 520) return 5;
    if (w < 900) return 6;
    return 7;
  };

  const shuffle = () => {
    for (const t of tiles) {
      t.g.style.transitionDelay = ((t.i + t.j) * 12 + Math.floor(Math.random() * 120)) + 'ms';
      t.rot = Math.floor(Math.random() * 4);
      place(t, t.rot * 90);
    }
    analyse();
    window.setTimeout(() => {
      for (const t of tiles) t.g.style.transitionDelay = '0ms';
    }, 900);
  };

  lab.addEventListener('click', (e) => {
    const g = e.target.closest('.tile');
    if (!g) return;
    const idx = tiles.findIndex((t) => t.g === g);
    if (idx < 0) return;
    flip(tiles[idx], false);
  });

  lab.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
    const g = e.target.closest('.tile');
    if (!g) return;
    e.preventDefault();
    const idx = tiles.findIndex((t) => t.g === g);
    if (idx < 0) return;
    flip(tiles[idx], false);
  });

  flowBtn.addEventListener('click', () => {
    flowOn = !flowOn;
    if (flowOn) primed = false;
    flowBtn.classList.toggle('is-on', flowOn);
    flowBtn.setAttribute('aria-pressed', flowOn ? 'true' : 'false');
  });

  shuffleBtn.addEventListener('click', shuffle);

  let running = false;
  let raf = 0;
  let clock = 0;
  let last = 0;
  let dirty = 0;

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!last) last = now;
    const dt = Math.min(50, now - last);
    last = now;
    clock += dt;
    if (flowOn && clock > LEAD) {
      wave(clock);
      primed = true;
    }
    if (++dirty > 20) {
      dirty = 0;
      analyse();
    }
  };

  const start = () => {
    if (running || motion.matches) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const sync = () => {
    if (motion.matches) {
      stop();
      flowOn = false;
      flowBtn.classList.remove('is-on');
      flowBtn.setAttribute('aria-pressed', 'false');
      for (const t of tiles) t.g.style.setProperty('--k', '0');
    } else {
      start();
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  if (motion.addEventListener) {
    motion.addEventListener('change', sync);
  }

  let current = size();
  window.addEventListener('resize', () => {
    const s = size();
    if (s === current) return;
    current = s;
    lab.replaceChildren(lab.querySelector('defs'));
    build(s);
    if (!motion.matches) enter();
  });

  build(current);
  if (!motion.matches) {
    enter();
    start();
  } else {
    sync();
  }
})();
