(function () {
  var root = document.querySelector('[data-nav]');
  if (!root) return;

  var rows = Array.prototype.slice.call(root.querySelectorAll('.chap'));
  var links = rows.map(function (r) { return r.querySelector('a[data-stop]'); }).filter(Boolean);
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var list = root.querySelector('.index-list');
  var ribbon = root.querySelector('.ribbon');
  var readout = root.querySelector('[data-readout]');
  var reading = root.querySelector('[data-reading]');
  var folio = root.querySelector('.reading-folio');
  var blurb = root.querySelector('[data-blurb]');
  var fill = root.querySelector('[data-fill]');
  var toggle = root.querySelector('[data-panel-toggle]');
  var panel = toggle ? document.getElementById(toggle.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function measure(i) {
    var body = rows[i].querySelector('.chap-body');
    if (!body) return;
    body.style.height = body.scrollHeight + 'px';
  }

  function refold(i) {
    for (var k = 0; k < rows.length; k++) {
      var body = rows[k].querySelector('.chap-body');
      if (body) body.style.height = k === i ? body.scrollHeight + 'px' : '0px';
    }
  }

  function apply(i) {
    if (i === current || i < 0 || i >= links.length) return;
    current = i;
    for (var k = 0; k < links.length; k++) {
      if (k === i) links[k].setAttribute('aria-current', 'true');
      else links[k].removeAttribute('aria-current');
    }
    refold(i);
    if (ribbon && list) ribbon.style.setProperty('--ry', rows[i].offsetTop + 'px');
    if (fill) fill.style.width = ((i + 1) / links.length * 100).toFixed(2) + '%';
    var say = links[i].dataset.say || '';
    if (readout) readout.textContent = say;
    if (reading) {
      var name = links[i].querySelector('.chap-name');
      var plain = name ? name.firstChild.textContent.trim() : '';
      reading.textContent = plain;
    }
    if (folio) folio.textContent = links[i].dataset.folio || '';
    if (blurb) {
      var note = rows[i].querySelector('.chap-note');
      blurb.textContent = note ? note.textContent.trim() : '';
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
  window.addEventListener('resize', function () { if (current >= 0) measure(current); onScroll(); });
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
})();
