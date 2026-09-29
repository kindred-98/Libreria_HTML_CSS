(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var rows = Array.prototype.slice.call(root.querySelectorAll('.scene'));
  var links = rows.map(function (r) { return r.querySelector('a[data-stop]'); }).filter(Boolean);
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var list = root.querySelector('.scenes');
  var punch = root.querySelector('.punch');
  var readout = root.querySelector('[data-readout]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= links.length) return;
    current = i;
    for (var k = 0; k < links.length; k++) {
      if (k === i) links[k].setAttribute('aria-current', 'true');
      else links[k].removeAttribute('aria-current');
    }
    if (punch && list) punch.style.setProperty('--py', rows[i].offsetTop + 'px');
    if (readout) {
      readout.textContent = 'Sc. ' + (i + 1) + ' of ' + links.length + ' \u00b7 ' + (links[i].getAttribute('data-pages') || '');
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
    for (var j = 0; j < links.length; j++) {
      if (links[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  links.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setPanel(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  root.addEventListener('keydown', function (e) {
    var k = e.key;
    var i = links.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (k === 'ArrowDown' || k === 'ArrowRight') next = (i + 1) % links.length;
    else if (k === 'ArrowUp' || k === 'ArrowLeft') next = (i - 1 + links.length) % links.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = links.length - 1;
    if (next < 0) return;
    e.preventDefault();
    links[next].focus();
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
