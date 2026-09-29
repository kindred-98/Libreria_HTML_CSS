(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('.tab[data-stop]'));
  var sections = tabs.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var book = root.querySelector('.book');
  var marker = root.querySelector('.marker');
  var fill = root.querySelector('[data-fill]');
  var readout = root.querySelector('[data-readout]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  var current = -1;
  var queued = false;

  function place(i) {
    if (!marker || !book || !tabs[i]) return;
    var b = book.getBoundingClientRect();
    var t = tabs[i].getBoundingClientRect();
    marker.style.setProperty('--mx', (t.left + t.width / 2 - b.left) + 'px');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= tabs.length) return;
    current = i;
    for (var k = 0; k < tabs.length; k++) {
      if (k === i) tabs[k].setAttribute('aria-current', 'true');
      else tabs[k].removeAttribute('aria-current');
    }
    if (fill) fill.style.width = ((i + 1) / tabs.length * 100).toFixed(2) + '%';
    if (readout) {
      var raw = tabs[i].getAttribute('data-say') || '';
      var cut = raw.split(',');
      readout.textContent = 'Tab ' + (letters[i] || i + 1) + ' of VI \u00b7 section ' + (i + 1) + (cut[2] ? ' \u00b7 ' + cut[2] : '');
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
    for (var j = 0; j < tabs.length; j++) {
      if (tabs[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  tabs.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    tabs[next].focus();
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
