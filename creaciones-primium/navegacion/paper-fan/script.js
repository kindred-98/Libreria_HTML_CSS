(function () {
  var hand = document.querySelector('.hand');
  var fold = document.getElementById('fold');
  var mark = document.getElementById('mark');
  var slots = [].slice.call(document.querySelectorAll('.fan__slot'));
  var links = slots.map(function (s) { return s.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function deal(i) {
    if (i < 0 || i >= slots.length) return;
    cur = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      slots[k].classList.toggle('is-open', k === i);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
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
    deal(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { deal(k); });
  });

  function shut(closed) {
    hand.setAttribute('data-fold', closed ? 'closed' : 'open');
    document.documentElement.style.setProperty('--open', closed ? '0.16' : '1');
    fold.setAttribute('aria-expanded', closed ? 'false' : 'true');
    fold.querySelector('.fold__text').textContent = closed ? 'Open the fan' : 'Fold the fan';
  }

  fold.addEventListener('click', function () {
    shut(fold.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (fold.getAttribute('aria-expanded') === 'true') {
      shut(true);
      fold.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = links.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) deal(start); else { deal(0); read(); }
})();
