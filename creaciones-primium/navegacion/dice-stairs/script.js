(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var steps = Array.prototype.slice.call(hall.querySelectorAll('.step'));
  var sections = steps.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var counter = hall.querySelector('[data-step]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= steps.length) return;
    current = i;
    for (var k = 0; k < steps.length; k++) {
      if (k === i) steps[k].setAttribute('aria-current', 'true');
      else steps[k].removeAttribute('aria-current');
    }
    hall.setAttribute('data-at', i);
    if (counter) counter.textContent = steps[i].getAttribute('data-no');
    if (say) say.textContent = steps[i].getAttribute('data-say') || '';
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
    for (var j = 0; j < steps.length; j++) {
      if (steps[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  steps.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = steps.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowUp') next = (i + 1) % steps.length;
    else if (k === 'ArrowLeft' || k === 'ArrowDown') next = (i - 1 + steps.length) % steps.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = steps.length - 1;
    if (next < 0) return;
    e.preventDefault();
    steps[next].focus();
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
