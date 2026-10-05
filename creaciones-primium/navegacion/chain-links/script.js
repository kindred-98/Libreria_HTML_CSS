(function () {
  var run = document.getElementById('run');
  var gauge = document.getElementById('gauge');
  var tally = document.getElementById('tally');
  var rigBtn = document.getElementById('rigBtn');
  var note = document.getElementById('rigNote');

  var list = document.querySelectorAll('.chain .link');
  var links = Array.prototype.slice.call(list);
  var secs = links.map(function (l) {
    return document.getElementById(l.getAttribute('href').slice(1));
  });
  var cur = -1;
  var last = links.length - 1;

  function pose(i) {
    for (var k = 0; k < links.length; k++) {
      var el = links[k];
      if (k === i) {
        el.setAttribute('aria-current', 'true');
        el.classList.add('is-now');
        el.classList.remove('is-past');
        el.style.setProperty('--ang', '-44deg');
      } else {
        el.removeAttribute('aria-current');
        el.classList.remove('is-now');
        el.style.setProperty('--ang', '-44deg');
        if (k < i) {
          el.classList.add('is-past');
          el.style.setProperty('--ang', '0deg');
        } else {
          el.classList.remove('is-past');
          var d = k - i;
          var swing = (d % 2 === 1 ? 1 : -1) * 28 * Math.pow(0.46, d - 1);
          if (Math.abs(swing) < 2.5) swing = 0;
          el.style.setProperty('--ang', swing.toFixed(2) + 'deg');
        }
      }
    }
    gauge.style.setProperty('--t', last > 0 ? (i / last).toFixed(4) : '1');
    tally.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
  }

  function paint(i) {
    if (i < 0 || i > last) return;
    cur = i;
    pose(i);
  }

  function read() {
    var line = window.innerHeight * 0.42;
    var best = Math.max(cur, 0);
    var gap = Infinity;
    for (var k = 0; k < secs.length; k++) {
      var s = secs[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - line);
      if (d < gap) { gap = d; best = k; }
    }
    paint(best);
  }

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; read(); });
  }

  links.forEach(function (l, k) {
    l.addEventListener('click', function () { paint(k); });
    l.addEventListener('focus', function () { if (k !== cur) paint(k); });
  });

  run.addEventListener('pointermove', function () {
    run.classList.add('is-lit');
  }, { passive: true });
  run.addEventListener('pointerleave', function () {
    run.classList.remove('is-lit');
  }, { passive: true });

  function setNote(open) {
    note.classList.toggle('is-open', open);
    rigBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    rigBtn.querySelector('.key__text').textContent = open ? 'Hide note' : 'Rigging note';
  }

  rigBtn.addEventListener('click', function () {
    setNote(rigBtn.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && rigBtn.getAttribute('aria-expanded') === 'true') {
      setNote(false);
      rigBtn.focus();
      return;
    }
    var key = e.key;
    if (key !== 'ArrowRight' && key !== 'ArrowLeft' && key !== 'ArrowDown' &&
        key !== 'ArrowUp' && key !== 'Home' && key !== 'End') return;
    var from = links.indexOf(document.activeElement);
    if (from < 0) return;
    var cols = window.innerWidth <= 430 ? 2 : (window.innerWidth <= 760 ? 3 : 6);
    var to;
    if (key === 'ArrowRight') to = from + 1;
    else if (key === 'ArrowLeft') to = from - 1;
    else if (key === 'ArrowDown') to = from + cols;
    else if (key === 'ArrowUp') to = from - cols;
    else if (key === 'Home') to = 0;
    else to = links.length - 1;
    if (to < 0) to = 0;
    if (to > last) to = last;
    if (to !== from) { e.preventDefault(); links[to].focus(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = links.map(function (l) { return '#' + l.getAttribute('href').slice(1); })
    .indexOf(location.hash);
  paint(start >= 0 ? start : 0);
  read();
})();
