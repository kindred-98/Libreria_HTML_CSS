(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var stubs = Array.prototype.slice.call(root.querySelectorAll('.stub[data-stop]'));
  var sections = stubs.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var comb = root.querySelector('.comb');
  var readout = root.querySelector('[data-readout]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function place(i) {
    if (!comb || !stubs[i]) return;
    var roll = stubs[i].parentNode;
    var left = stubs[i].offsetLeft - roll.offsetLeft;
    comb.style.width = stubs[i].offsetWidth + 'px';
    comb.style.setProperty('--cx', left + 'px');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= stubs.length) return;
    current = i;
    for (var k = 0; k < stubs.length; k++) {
      if (k === i) stubs[k].setAttribute('aria-current', 'true');
      else stubs[k].removeAttribute('aria-current');
    }
    place(i);
    if (readout) {
      var raw = stubs[i].getAttribute('data-say') || '';
      var cut = raw.split(',');
      readout.textContent = (cut[0] || '') + (cut[1] ? ' \u00b7 ' + cut[1] : '') + (cut[2] ? ' \u00b7 ' + cut[2] : '');
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
    for (var j = 0; j < stubs.length; j++) {
      if (stubs[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  stubs.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = stubs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % stubs.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + stubs.length) % stubs.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = stubs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    stubs[next].focus();
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
