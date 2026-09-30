(function () {
  var view = document.getElementById('view');
  var strip = document.getElementById('strip');
  var prog = document.getElementById('prog');
  var nudgeL = document.getElementById('nudgeL');
  var nudgeR = document.getElementById('nudgeR');
  var panCount = document.getElementById('panCount');
  var tiles = Array.prototype.slice.call(strip.querySelectorAll('.tile'));
  var strips = Array.prototype.slice.call(strip.querySelectorAll('.grp'));
  var topNav = Array.prototype.slice.call(document.querySelectorAll('.top nav a'));
  var fine = window.matchMedia('(hover: hover)');
  var groups = [
    { href: '#measure', id: 'measure' },
    { href: '#cut', id: 'cut' },
    { href: '#joint', id: 'joint' },
    { href: '#clamp', id: 'clamp' },
    { href: '#finish', id: 'finish' },
    { href: '#layout', id: 'layout' },
    { href: '#hardware', id: 'hardware' },
    { href: '#coating', id: 'coating' }
  ];
  var sections = groups.map(function (g) { return document.getElementById(g.id); });
  var ticking = false;

  if (panCount) panCount.textContent = tiles.length + ' tools';

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function metrics() {
    var max = view.scrollWidth - view.clientWidth;
    var p = max > 2 ? clamp(view.scrollLeft / max, 0, 1) : 0;
    prog.style.transform = 'scaleX(' + (0.08 + p * 0.92).toFixed(4) + ')';
    nudgeL.disabled = view.scrollLeft < 4;
    nudgeR.disabled = max < 4 || view.scrollLeft > max - 4;
    return p;
  }

  function nudge(dir) {
    var step = Math.max(180, Math.round(view.clientWidth * 0.7));
    view.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  nudgeL.addEventListener('click', function () { nudge(-1); });
  nudgeR.addEventListener('click', function () { nudge(1); });

  view.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { metrics(); ticking = false; });
  }, { passive: true });

  pan.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      var i = tiles.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      var next = e.key === 'ArrowRight'
        ? (i + 1) % tiles.length
        : (i - 1 + tiles.length) % tiles.length;
      tiles[next].focus();
      tiles[next].scrollIntoView({ block: 'nearest', inline: 'center' });
    } else if (e.key === 'Home') {
      e.preventDefault();
      tiles[0].focus();
      tiles[0].scrollIntoView({ block: 'nearest', inline: 'start' });
    } else if (e.key === 'End') {
      e.preventDefault();
      tiles[tiles.length - 1].focus();
      tiles[tiles.length - 1].scrollIntoView({ block: 'nearest', inline: 'end' });
    } else if (e.key === 'PageDown' || e.key === 'PageUp') {
      e.preventDefault();
      nudge(e.key === 'PageDown' ? 1 : -1);
    }
  });

  function spy() {
    var mid = window.innerHeight * 0.4;
    var idx = 0;
    sections.forEach(function (s, k) {
      if (s && s.getBoundingClientRect().top <= mid) idx = k;
    });
    var href = groups[idx].href;
    var lit = false;
    tiles.forEach(function (t) {
      if (t.getAttribute('href') === href && !lit) {
        t.setAttribute('aria-current', 'true');
        lit = true;
      } else {
        t.removeAttribute('aria-current');
      }
    });
    strips.forEach(function (g, k) { g.classList.toggle('is-live', k === idx); });
    topNav.forEach(function (a) {
      if (a.getAttribute('href') === href) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { metrics(); spy(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { metrics(); spy(); });
  window.addEventListener('load', function () { metrics(); spy(); });

  tiles.forEach(function (t) {
    t.addEventListener('click', function () { window.setTimeout(spy, 90); });
  });

  view.addEventListener('wheel', function (e) {
    if (!fine.matches) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) return;
    if (view.scrollWidth - view.clientWidth < 4) return;
    if (view.scrollLeft <= 0 && e.deltaY < 0) return;
    if (view.scrollLeft >= view.scrollWidth - view.clientWidth - 1 && e.deltaY > 0) return;
    e.preventDefault();
    view.scrollLeft += e.deltaY;
  }, { passive: false });

  metrics();
  spy();
  window.setTimeout(function () { metrics(); spy(); }, 120);
}());
