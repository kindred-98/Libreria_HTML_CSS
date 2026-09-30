(function () {
  var rail = document.getElementById('rail');
  var list = document.getElementById('railList');
  var body = document.getElementById('railBody');
  var foldBtn = document.getElementById('foldBtn');
  var micro = document.getElementById('micro');
  var tallyNum = document.getElementById('tallyNum');
  var pips = document.getElementById('pips');
  var resetBtn = document.getElementById('resetBtn');
  var links = Array.prototype.slice.call(list.querySelectorAll('.stop'));
  var notes = [
    'Tap hole, 1897. Steel on a twenty four hour cycle.',
    'Two mill pairs, 1903. Six millimetres in, 0.8 out.',
    'Quay 2 still takes a wagon at spring tide.',
    'One of three boilers is lit at six bar.',
    'Four point eight kilometres, two locomotives on the rails.',
    'Nine hundred bottles an hour, crate for crate.',
    'Silent since 1979. The hall still answers to 88 decibels.',
    'The drawings in the cases are the originals.'
  ];
  var stops = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var seen = [false, false, false, false, false, false, false, false];
  var timers = [0, 0, 0, 0, 0, 0, 0, 0];
  var total = 0;
  var shown = -1;
  var ticking = false;

  for (var p = 0; p < 8; p++) pips.appendChild(document.createElement('i'));
  var pipsEls = Array.prototype.slice.call(pips.children);

  function say(text) {
    micro.textContent = '';
    var words = text.split(' ');
    for (var i = 0; i < words.length; i++) {
      var s = document.createElement('span');
      s.style.setProperty('--i', i);
      s.textContent = words[i];
      micro.appendChild(s);
      if (i < words.length - 1) micro.appendChild(document.createTextNode(' '));
    }
  }

  function refreshTally() {
    total = 0;
    for (var i = 0; i < 8; i++) if (seen[i]) total++;
    tallyNum.textContent = String(total);
    for (var k = 0; k < 8; k++) {
      pipsEls[k].classList.toggle('on', seen[k]);
      links[k].classList.toggle('seen', seen[k]);
    }
  }

  function markSeen(i) {
    if (seen[i]) return;
    seen[i] = true;
    refreshTally();
  }

  function clearSeen() {
    for (var i = 0; i < 8; i++) {
      seen[i] = false;
      if (timers[i]) { window.clearTimeout(timers[i]); timers[i] = 0; }
    }
    refreshTally();
  }

  function aimTip(a) {
    var tip = a.querySelector('.tip');
    if (!tip) return;
    var r = a.getBoundingClientRect();
    var x = (r.left + r.width / 2).toFixed(1) + 'px';
    var y = (r.top + r.height / 2).toFixed(1) + 'px';
    tip.style.setProperty('--tx', x);
    tip.style.setProperty('--ty', y);
  }

  function setCurrent(i) {
    if (i === shown) return;
    shown = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (i >= 0) say(notes[i]);
    var wide = window.matchMedia('(max-width: 960px)').matches;
    if (wide && i >= 0) {
      var l = links[i];
      var lo = list.parentNode.scrollLeft;
      var lw = list.parentNode.clientWidth;
      if (l.offsetLeft < lo + 6 || l.offsetLeft + l.offsetWidth > lo + lw - 6) {
        list.parentNode.scrollLeft = l.offsetLeft - (lw - l.offsetWidth) / 2;
      }
    }
  }

  function setFolded(folded) {
    if (folded) {
      body.hidden = true;
      rail.classList.add('folded');
      document.body.classList.add('folded');
      foldBtn.setAttribute('aria-expanded', 'false');
      foldBtn.setAttribute('aria-label', 'Expand the trail rail');
    } else {
      body.hidden = false;
      rail.classList.remove('folded');
      document.body.classList.remove('folded');
      foldBtn.setAttribute('aria-expanded', 'true');
      foldBtn.setAttribute('aria-label', 'Collapse the trail rail');
    }
  }

  foldBtn.addEventListener('click', function () {
    setFolded(foldBtn.getAttribute('aria-expanded') === 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && foldBtn.getAttribute('aria-expanded') === 'false') {
      e.preventDefault();
      setFolded(false);
      foldBtn.focus();
    }
  });

  list.addEventListener('keydown', function (e) {
    var i = links.indexOf(document.activeElement);
    if (i < 0) return;
    var next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % links.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + links.length) % links.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = links.length - 1;
    if (next === null) return;
    e.preventDefault();
    links[next].focus();
    setCurrent(next);
  });

  list.addEventListener('focusin', function (e) {
    var a = e.target.closest('.stop');
    if (a) { setCurrent(links.indexOf(a)); aimTip(a); }
  });

  list.addEventListener('pointerover', function (e) {
    var a = e.target.closest('.stop');
    if (a) aimTip(a);
  });

  list.addEventListener('click', function (e) {
    var a = e.target.closest('.stop');
    if (a) { setCurrent(links.indexOf(a)); aimTip(a); }
  });

  resetBtn.addEventListener('click', function () {
    clearSeen();
    micro.textContent = '';
    say('Trail reset. Eight stops, ninety minutes, one lit boiler.');
    resetBtn.focus();
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var i = stops.indexOf(entry.target);
        if (i < 0) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.42) {
          if (!timers[i]) {
            timers[i] = window.setTimeout(function () { timers[i] = 0; markSeen(i); }, 1100);
          }
        } else if (timers[i]) {
          window.clearTimeout(timers[i]);
          timers[i] = 0;
        }
      });
    }, { threshold: [0, 0.42, 0.8] });
    stops.forEach(function (s) { if (s) io.observe(s); });
  } else {
    stops.forEach(function (s, i) {
      if (!s) return;
      s.addEventListener('focusin', function () { markSeen(i); });
    });
  }

  function measure() {
    var mid = window.innerHeight * 0.45;
    var idx = -1;
    stops.forEach(function (s, k) {
      if (s && s.getBoundingClientRect().top <= mid) idx = k;
    });
    setCurrent(idx);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { measure(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', onScroll);

  setFolded(false);
  say('Eight stops, ninety minutes, one lit boiler. Press a number to walk in.');
  refreshTally();
  measure();
  window.setTimeout(measure, 120);
}());
