(function () {
  var plait = document.getElementById('plait');
  var bobbin = document.getElementById('bobbin');
  var mark = document.getElementById('mark');
  var nodes = [].slice.call(document.querySelectorAll('.crossings__node'));
  var links = nodes.map(function (n) { return n.querySelector('a'); });
  var roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  var threads = ['linen', 'madder', 'woad'];
  var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var cur = -1;

  function weave(i) {
    if (i < 0 || i >= nodes.length) return;
    cur = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
      nodes[k].classList.toggle('is-on', k === i);
    });
    nodes.forEach(function (n, k) {
      n.setAttribute('data-lead', String(((k + i) % 3 + 3) % 3));
      n.setAttribute('data-thread', threads[((k + i) % 3 + 3) % 3]);
    });
    document.documentElement.style.setProperty('--cur', String(i));
    mark.textContent = roman[i];
  }

  function read() {
    var line = window.innerHeight * 0.45;
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
    weave(best);
  }

  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; read(); });
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { weave(k); });
  });

  function open(loose) {
    plait.setAttribute('data-state', loose ? 'loose' : 'braided');
    bobbin.setAttribute('aria-expanded', loose ? 'false' : 'true');
    bobbin.querySelector('.bobbin__text').textContent = loose ? 'Re-plait the threads' : 'Unpick the plait';
  }

  bobbin.addEventListener('click', function () {
    open(bobbin.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (bobbin.getAttribute('aria-expanded') === 'true') {
      open(true);
      bobbin.focus();
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  var start = links.map(function (a) { return a.getAttribute('href'); }).indexOf('#' + (location.hash || '').slice(1));
  if (start >= 0) weave(start); else { weave(0); read(); }
})();
