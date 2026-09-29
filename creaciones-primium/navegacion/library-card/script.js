(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var rows = Array.prototype.slice.call(root.querySelectorAll('.row[data-stop]'));
  var sections = rows.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var list = root.querySelector('.rows');
  var bead = root.querySelector('.bead');
  var fill = root.querySelector('[data-fill]');
  var readout = root.querySelector('[data-readout]');
  var borrowed = root.querySelector('[data-borrowed]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= rows.length) return;
    current = i;
    for (var k = 0; k < rows.length; k++) {
      if (k === i) rows[k].setAttribute('aria-current', 'true');
      else rows[k].removeAttribute('aria-current');
    }
    if (bead && list) bead.style.setProperty('--by', rows[i].offsetTop + 'px');
    if (fill) fill.style.width = ((i + 1) / rows.length * 100).toFixed(2) + '%';
    if (borrowed) borrowed.textContent = String(i + 1);
    if (readout) {
      var raw = rows[i].getAttribute('data-say') || '';
      var cut = raw.split(',');
      readout.textContent = 'Loan ' + (i + 1) + ' of ' + rows.length + (cut[1] ? ' \u00b7 ' + cut[1] : '') + (cut[2] ? ' \u00b7 ' + cut[2] : '');
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
    for (var j = 0; j < rows.length; j++) {
      if (rows[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  rows.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = rows.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % rows.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + rows.length) % rows.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = rows.length - 1;
    if (next < 0) return;
    e.preventDefault();
    rows[next].focus();
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
