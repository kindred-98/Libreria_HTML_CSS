(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var stops = Array.prototype.slice.call(hall.querySelectorAll('.st'));
  var sections = stops.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var beads = Array.prototype.slice.call(hall.querySelectorAll('.bead'));
  var lead = hall.querySelector('[data-lead]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function line() {
    for (var k = 0; k < beads.length; k++) {
      var at = k === current ? 'L' : (k < current ? k : k - 1);
      beads[k].setAttribute('data-slot', at);
    }
  }

  function apply(i) {
    if (i === current || i < 0 || i >= stops.length) return;
    current = i;
    for (var k = 0; k < stops.length; k++) {
      if (k === i) {
        stops[k].setAttribute('aria-current', 'true');
        beads[k].classList.add('is-lead');
      } else {
        stops[k].removeAttribute('aria-current');
        beads[k].classList.remove('is-lead');
      }
    }
    line();
    hall.setAttribute('data-at', i);
    if (lead) lead.textContent = stops[i].getAttribute('data-no');
    if (say) say.textContent = stops[i].getAttribute('data-say') || '';
  }

  function scan() {
    queued = false;
    var line2 = window.innerHeight * 0.4;
    var atEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    var found = 0;
    for (var j = 0; j < sections.length; j++) {
      if (sections[j] && sections[j].getBoundingClientRect().top <= line2) found = j;
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
    for (var j = 0; j < stops.length; j++) {
      if (stops[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  stops.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = stops.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % stops.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + stops.length) % stops.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = stops.length - 1;
    if (next < 0) return;
    e.preventDefault();
    stops[next].focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setPanel(false);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
  line();
})();
