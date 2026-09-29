(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var snaps = Array.prototype.slice.call(root.querySelectorAll('.snap[data-stop]'));
  var sections = snaps.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var wall = root.querySelector('.wall');
  var bead = root.querySelector('.bead');
  var readout = root.querySelector('[data-readout]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function place(i) {
    if (!bead || !wall || !snaps[i]) return;
    var pin = snaps[i].querySelector('.pin');
    if (!pin) return;
    var w = wall.getBoundingClientRect();
    var p = pin.getBoundingClientRect();
    bead.style.setProperty('--bx', (p.left + p.width / 2 - w.left) + 'px');
    bead.style.setProperty('--by', (p.top + 4 - w.top) + 'px');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= snaps.length) return;
    current = i;
    for (var k = 0; k < snaps.length; k++) {
      if (k === i) snaps[k].setAttribute('aria-current', 'true');
      else snaps[k].removeAttribute('aria-current');
    }
    if (readout) {
      var raw = snaps[i].getAttribute('data-say') || '';
      var cut = raw.split(',');
      readout.textContent = 'Frame ' + (i + 1) + ' of ' + snaps.length + (cut[1] ? ' \u00b7 ' + cut[1] : '');
    }
    place(i);
  }

  function scan() {
    queued = false;
    var line = window.innerHeight * 0.44;
    var atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    var found = 0;
    for (var j = 0; j < sections.length; j++) {
      if (sections[j] && sections[j].getBoundingClientRect().top <= line) found = j;
    }
    apply(atEnd ? sections.length - 1 : found);
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(scan);
  }

  function fromHash() {
    var id = window.location.hash.slice(1);
    if (!id) return false;
    for (var j = 0; j < snaps.length; j++) {
      if (snaps[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  snaps.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = snaps.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % snaps.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + snaps.length) % snaps.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = snaps.length - 1;
    if (next < 0) return;
    e.preventDefault();
    snaps[next].focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setPanel(false);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { if (current >= 0) place(current); onScroll(); });
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
})();
