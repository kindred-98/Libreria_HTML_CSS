(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var panels = Array.prototype.slice.call(root.querySelectorAll('.panel[data-stop]'));
  var sections = panels.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var arrow = root.querySelector('.strip-arrow');
  var readout = root.querySelector('[data-readout]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panelBox = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= panels.length) return;
    current = i;
    for (var k = 0; k < panels.length; k++) {
      if (k === i) panels[k].setAttribute('aria-current', 'true');
      else panels[k].removeAttribute('aria-current');
    }
    if (arrow) arrow.style.setProperty('--si', i);
    if (readout) {
      var n = i + 1;
      readout.textContent = 'Panel ' + (n < 10 ? '0' + n : n) + ' of ' + panels.length + ' \u00b7 ' + (panels[i].dataset.say || '').split(',')[1];
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
    for (var j = 0; j < panels.length; j++) {
      if (panels[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panelBox) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panelBox.hidden = !open;
  }

  panels.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = panels.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % panels.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + panels.length) % panels.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = panels.length - 1;
    if (next < 0) return;
    e.preventDefault();
    panels[next].focus();
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
