(function () {
  var pages = document.getElementById('pages');
  var ribbon = document.getElementById('ribbon');
  var mark = document.getElementById('mark');
  var slots = [].slice.call(document.querySelectorAll('.samples__slot'));
  var swatches = slots.map(function (s) { return s.querySelector('a'); });
  var secs = swatches.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function unfold(i) {
    if (i < 0 || i >= slots.length) return;
    cur = i;
    swatches.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      slots[k].classList.toggle('is-on', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
  }

  function read() {
    var line = window.innerHeight * 0.46;
    var best = cur < 0 ? 0 : cur;
    var bestD = Infinity;
    for (var k = 0; k < secs.length; k++) {
      var s = secs[k];
      if (!s) continue;
      var r = s.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var d = Math.abs(r.top - line);
      if (d < bestD) { bestD = d; best = k; }
    }
    unfold(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  swatches.forEach(function (a, k) {
    a.addEventListener('click', function () { unfold(k); });
  });

  function shut(closed) {
    pages.setAttribute('data-open', closed ? 'no' : 'yes');
    ribbon.setAttribute('aria-expanded', closed ? 'false' : 'true');
    ribbon.querySelector('.ribbon__text').textContent = closed ? 'Open the book' : 'Close the book';
  }

  ribbon.addEventListener('click', function () {
    shut(ribbon.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (ribbon.getAttribute('aria-expanded') === 'true') {
      shut(true);
      ribbon.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = swatches.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) unfold(start); else { unfold(0); read(); }
})();
