(function () {
  var remote = document.getElementById('remote');
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('remoteMenu');
  var items = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));
  var scanBtn = document.getElementById('scanBtn');
  var caretTrack = document.getElementById('track');
  var note = document.getElementById('deckNote');
  var strobe = document.getElementById('strobe');
  var keys = Array.prototype.slice.call(remote.querySelectorAll('.key[href]'));
  var chapters = keys.map(function (k) { return document.getElementById(k.getAttribute('href').slice(1)); });
  var names = ['Chassis', 'Platter', 'Tonearm', 'Cartridge', 'Power', 'Delivery'];
  var speeds = ['33 1/3', '45', '33 1/3 EP'];
  var speed = 0;
  var pos = { x: 0, y: 0 };
  var vel = { x: 0, y: 0 };
  var goal = { x: 0, y: 0 };
  var holding = false;
  var running = false;
  var idle = 0;
  var over = false;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var pad = 14;
  var offX = 30;
  var offY = 26;

  function bounds() {
    var w = remote.offsetWidth;
    var h = remote.offsetHeight;
    return {
      w: w, h: h,
      minX: pad, minY: pad,
      maxX: Math.max(pad, window.innerWidth - w - pad),
      maxY: Math.max(pad, window.innerHeight - h - pad)
    };
  }

  function dockGoal() {
    var b = bounds();
    goal.x = b.maxX;
    goal.y = b.maxY;
  }

  function shelfGoal() {
    var b = bounds();
    goal.x = b.maxX;
    goal.y = Math.min(b.maxY, Math.max(b.minY, Math.round(window.innerHeight * 0.14)));
  }

  function followGoal(px, py) {
    var b = bounds();
    goal.x = Math.min(b.maxX, Math.max(b.minX, px + offX));
    goal.y = Math.min(b.maxY, Math.max(b.minY, py + offY));
  }

  function place() {
    var b = bounds();
    pos.x = b.maxX;
    pos.y = b.maxY;
    remote.style.transform = 'translate3d(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px,0)';
    remote.classList.add('ready');
  }

  function frame() {
    if (!running) return;
    var k = 0.17;
    var d = 0.76;
    var ax = (goal.x - pos.x) * k;
    var ay = (goal.y - pos.y) * k;
    vel.x = (vel.x + ax) * d;
    vel.y = (vel.y + ay) * d;
    pos.x += vel.x;
    pos.y += vel.y;
    if (Math.abs(goal.x - pos.x) < 0.15 && Math.abs(goal.y - pos.y) < 0.15 &&
        Math.abs(vel.x) < 0.1 && Math.abs(vel.y) < 0.1) {
      pos.x = goal.x;
      pos.y = goal.y;
      vel.x = 0;
      vel.y = 0;
      running = false;
    }
    remote.style.transform = 'translate3d(' + pos.x.toFixed(1) + 'px,' + pos.y.toFixed(1) + 'px,0)';
    if (running) window.requestAnimationFrame(frame);
  }

  function wake() {
    if (calm.matches) return;
    if (!running) {
      running = true;
      window.requestAnimationFrame(frame);
    }
  }

  function onMove(e) {
    var x = e.clientX;
    var y = e.clientY;
    var r = remote.getBoundingClientRect();
    var inside = x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    if (r.width > 0 && r.height > 0) {
      var px = ((x - r.left) / r.width) * 100;
      var py = ((y - r.top) / r.height) * 100;
      remote.style.setProperty('--gx', Math.max(-10, Math.min(110, px)).toFixed(1) + '%');
      remote.style.setProperty('--gy', Math.max(-10, Math.min(110, py)).toFixed(1) + '%');
    }
    if (inside) {
      over = true;
    } else if (over) {
      over = false;
    }
    if (calm.matches) return;
    window.clearTimeout(idle);
    if (holding || menuBtn.getAttribute('aria-expanded') === 'true') {
      dockGoal();
      wake();
      return;
    }
    if (inside) {
      dockGoal();
      wake();
      return;
    }
    followGoal(x, y);
    wake();
    idle = window.setTimeout(function () { dockGoal(); wake(); }, 1500);
  }

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerdown', function (e) {
    if (menuBtn.getAttribute('aria-expanded') !== 'true') return;
    if (menu.contains(e.target) || menuBtn.contains(e.target)) return;
    closeMenu(false);
  });

  function openMenu() {
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    holding = true;
    shelfGoal();
    wake();
    if (items[0]) items[0].focus();
  }

  function closeMenu(refocus) {
    menu.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
    holding = false;
    dockGoal();
    wake();
    if (refocus) menuBtn.focus();
  }

  menuBtn.addEventListener('click', function () {
    if (menuBtn.getAttribute('aria-expanded') === 'true') closeMenu(true);
    else openMenu();
  });

  menu.addEventListener('keydown', function (e) {
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      items[(i + 1) % items.length].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i - 1 + items.length) % items.length].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === 'Tab') {
      closeMenu(false);
    }
  });

  menu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-go]');
    if (!b) return;
    var dest = document.querySelector(b.dataset.go);
    closeMenu(true);
    if (dest) dest.scrollIntoView({ block: 'start' });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      e.preventDefault();
      closeMenu(true);
    }
  });

  remote.addEventListener('focusin', function () {
    holding = true;
    window.clearTimeout(idle);
    if (menuBtn.getAttribute('aria-expanded') === 'true') shelfGoal();
    else dockGoal();
    wake();
  });

  remote.addEventListener('focusout', function (e) {
    if (remote.contains(e.relatedTarget)) return;
    holding = menuBtn.getAttribute('aria-expanded') === 'true';
    if (!holding) {
      dockGoal();
      wake();
    }
  });

  remote.addEventListener('keydown', function (e) {
    var all = Array.prototype.slice.call(remote.querySelectorAll('.key'));
    var i = all.indexOf(document.activeElement);
    if (i < 0) return;
    var cols = 4;
    var next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % all.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + all.length) % all.length;
    else if (e.key === 'ArrowDown') next = (i + cols) % all.length;
    else if (e.key === 'ArrowUp') next = (i - cols + all.length) % all.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = all.length - 1;
    if (next === null) return;
    e.preventDefault();
    all[next].focus();
  });

  function press(k) {
    k.classList.add('is-down');
    window.setTimeout(function () { k.classList.remove('is-down'); }, 160);
  }

  keys.forEach(function (k) {
    k.addEventListener('pointerdown', function () { press(k); });
    k.addEventListener('click', function () {
      var i = keys.indexOf(k);
      if (i >= 0) sayChapter(i);
    });
  });

  scanBtn.addEventListener('click', function () {
    speed = (speed + 1) % speeds.length;
    press(scanBtn);
    caretTrack.textContent = 'Mk II \u00b7 ' + speeds[speed] + ' \u00b7 side A';
    if (note) note.textContent = 'Speed set to ' + speeds[speed] + ' rpm. The strobe dots on the platter rim will read steady at this setting.';
    if (strobe) strobe.style.animationDuration = (3.7 + speed * 0.6).toFixed(2) + 's';
  });

  function sayChapter(i) {
    keys.forEach(function (k, k2) {
      if (k2 === i) k.setAttribute('aria-current', 'true');
      else k.removeAttribute('aria-current');
    });
    caretTrack.textContent = 'Ch ' + (i + 1 < 10 ? '0' : '') + (i + 1) + ' \u00b7 ' + names[i];
  }

  var ticking = false;
  function spy() {
    var mid = window.innerHeight * 0.4;
    var idx = 0;
    chapters.forEach(function (s, k) {
      if (s && s.getBoundingClientRect().top <= mid) idx = k;
    });
    sayChapter(idx);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { spy(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { dockGoal(); wake(); place(); });
  window.addEventListener('load', function () { place(); spy(); });

  place();
  window.setTimeout(place, 60);
  spy();
  idle = window.setTimeout(function () { dockGoal(); wake(); }, 900);
  if (calm.matches) {
    dockGoal();
    pos.x = goal.x;
    pos.y = goal.y;
    remote.style.transform = 'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)';
  }
}());
