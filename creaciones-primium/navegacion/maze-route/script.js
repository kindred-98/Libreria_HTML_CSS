(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var gates = Array.prototype.slice.call(hall.querySelectorAll('.gate'));
  var sections = gates.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ink = hall.querySelector('.route--ink');
  var counter = hall.querySelector('[data-gate]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function cut() {
    if (!ink) return;
    ink.classList.remove('is-drawn');
    ink.getBoundingClientRect();
    ink.classList.add('is-drawn');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= gates.length) return;
    current = i;
    for (var k = 0; k < gates.length; k++) {
      if (k === i) gates[k].setAttribute('aria-current', 'true');
      else gates[k].removeAttribute('aria-current');
    }
    hall.dataset.at = i;
    if (counter) counter.textContent = gates[i].dataset.no;
    if (say) say.textContent = gates[i].dataset.say || '';
    cut();
  }

  function scan() {
    queued = false;
    var line = window.innerHeight * 0.4;
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
    for (var j = 0; j < gates.length; j++) {
      if (gates[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  gates.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = gates.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % gates.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + gates.length) % gates.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = gates.length - 1;
    if (next < 0) return;
    e.preventDefault();
    gates[next].focus();
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
