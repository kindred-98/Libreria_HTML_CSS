(function () {
  var rail = document.getElementById('rail');
  var list = document.getElementById('railList');
  var ink = document.getElementById('railInk');
  var fill = document.getElementById('railFill');
  var micro = document.getElementById('railMicro');
  var progTxt = document.getElementById('progTxt');
  var progBar = document.getElementById('progBar');
  var cantoHead = document.getElementById('cantoHead');
  var cantoMarks = document.getElementById('cantoMarks');
  var links = Array.prototype.slice.call(list.querySelectorAll('.ch'));
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var notes = [
    'Sheet 01 of 08 - resin edge, polished face, no structure yet',
    'Sheet 02 of 08 - boundary network etched in nital 2%',
    'Sheet 03 of 08 - eutectoid at 727 C and 0.76 per cent C',
    'Sheet 04 of 08 - lamellar pearlite, coarse pearlite spacing',
    'Sheet 05 of 08 - acicular martensite after tempering',
    'Sheet 06 of 08 - dimpled overload surface, shear lip present',
    'Sheet 07 of 08 - electrolytic etch, 10 volts for 12 seconds',
    'Sheet 08 of 08 - three cases, closed and filed'
  ];
  var stack = document.querySelector('.book');
  var current = -1;
  var ticking = false;

  for (var m = 0; m < 8; m++) cantoMarks.appendChild(document.createElement('i'));

  function placeInk(i) {
    var link = links[i];
    var lr = link.getBoundingClientRect();
    var rr = rail.getBoundingClientRect();
    var vertical = window.matchMedia('(min-width: 901px)').matches;
    ink.style.opacity = '1';
    if (vertical) {
      ink.style.width = lr.width + 'px';
      ink.style.height = lr.height + 'px';
      ink.style.left = (lr.left - rr.left) + 'px';
      ink.style.top = (lr.top - rr.top) + 'px';
    } else {
      ink.style.width = lr.width + 'px';
      ink.style.height = '2px';
      ink.style.left = (lr.left - rr.left) + 'px';
      ink.style.top = (lr.bottom - rr.top - 2) + 'px';
    }
  }

  function setActive(i) {
    if (i === current) return;
    current = i;
    links.forEach(function (a, k) {
      if (k === i) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    placeInk(i);
    fill.style.transform = 'scaleY(' + ((i + 1) / 8).toFixed(3) + ')';
    micro.textContent = notes[i];
    if (cantoHead) {
      var rule = cantoHead.parentElement.getBoundingClientRect().height;
      cantoHead.style.transform = 'translateY(' + (rule * (i + 0.5) / 8).toFixed(1) + 'px)';
    }
    if (!window.matchMedia('(min-width: 901px)').matches) {
      var l = links[i];
      var lo = list.scrollLeft;
      var lw = list.clientWidth;
      if (l.offsetLeft < lo + 8 || l.offsetLeft + l.offsetWidth > lo + lw - 8) {
        list.scrollLeft = l.offsetLeft - (lw - l.offsetWidth) / 2;
      }
    }
  }

  function measure() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset) / max)) : 0;
    progBar.style.transform = 'scaleX(' + (0.04 + p * 0.96).toFixed(4) + ')';
    progTxt.textContent = Math.round(p * 100) + '%';
    var mid = window.innerHeight * 0.42;
    var idx = 0;
    sections.forEach(function (s, k) {
      if (s && s.getBoundingClientRect().top <= mid) idx = k;
    });
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 4) idx = 7;
    setActive(idx);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { measure(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { placeInk(Math.max(current, 0)); onScroll(); });

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
    setActive(next);
  });

  list.addEventListener('click', function (e) {
    var a = e.target.closest('.ch');
    if (!a) return;
    setActive(links.indexOf(a));
  });

  list.addEventListener('focusin', function (e) {
    var a = e.target.closest('.ch');
    if (a) placeInk(links.indexOf(a));
  });

  if (stack) stack.style.setProperty('--read', '8');
  setActive(0);
  window.setTimeout(function () { placeInk(0); measure(); }, 80);
  placeInk(0);
}());
