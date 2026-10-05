(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var stamps = Array.prototype.slice.call(root.querySelectorAll('.stamp[data-stop]'));
  var sections = stamps.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var fill = root.querySelector('[data-fill]');
  var readout = root.querySelector('[data-readout]');
  var lastUsed = root.querySelector('[data-lastused]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= stamps.length) return;
    current = i;
    for (var k = 0; k < stamps.length; k++) {
      if (k === i) stamps[k].setAttribute('aria-current', 'true');
      else stamps[k].removeAttribute('aria-current');
    }
    if (fill) fill.style.width = ((i + 1) / stamps.length * 100).toFixed(2) + '%';
    if (readout) {
      var raw = stamps[i].dataset.say || '';
      var cut = raw.split(',');
      readout.textContent = (cut[0] || '') + (cut[1] ? ' \u00b7 ' + cut[1] : '');
    }
    if (lastUsed) {
      var date = stamps[i].querySelector('.stamp-date');
      if (date) lastUsed.textContent = date.textContent;
    }
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
    for (var j = 0; j < stamps.length; j++) {
      if (stamps[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  stamps.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = stamps.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % stamps.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + stamps.length) % stamps.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = stamps.length - 1;
    if (next < 0) return;
    e.preventDefault();
    stamps[next].focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setPanel(false);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
})();
