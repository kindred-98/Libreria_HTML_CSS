(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var mounts = Array.prototype.slice.call(root.querySelectorAll('.mount[data-stop]'));
  var sections = mounts.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var sheet = root.querySelector('.sheet');
  var slider = root.querySelector('.slider');
  var fill = root.querySelector('[data-fill]');
  var readout = root.querySelector('[data-readout]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function place(i) {
    if (!slider || !sheet || !mounts[i]) return;
    var s = sheet.getBoundingClientRect();
    var m = mounts[i].getBoundingClientRect();
    slider.style.setProperty('--sy', (m.top + m.height * 0.34 - s.top) + 'px');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= mounts.length) return;
    current = i;
    for (var k = 0; k < mounts.length; k++) {
      if (k === i) mounts[k].setAttribute('aria-current', 'true');
      else mounts[k].removeAttribute('aria-current');
    }
    if (fill) fill.style.width = ((i + 1) / mounts.length * 100).toFixed(2) + '%';
    if (readout) {
      var raw = mounts[i].dataset.say || '';
      var cut = raw.split(',');
      readout.textContent = 'Stamp ' + (i + 1) + ' of ' + mounts.length + (cut[1] ? ' \u00b7 ' + cut[1] : '') + (cut[2] ? ', ' + cut[2] : '');
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
    for (var j = 0; j < mounts.length; j++) {
      if (mounts[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  mounts.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = mounts.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % mounts.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + mounts.length) % mounts.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = mounts.length - 1;
    if (next < 0) return;
    e.preventDefault();
    mounts[next].focus();
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
