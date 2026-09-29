(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var chips = Array.prototype.slice.call(hall.querySelectorAll('.chip'));
  var sections = chips.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var vals = chips.map(function (a) { return Number(a.getAttribute('data-val')) || 0; });
  var pot = hall.querySelector('[data-pot]');
  var count = hall.querySelector('[data-chips]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

  function apply(i) {
    if (i === current || i < 0 || i >= chips.length) return;
    current = i;
    var total = 0;
    for (var k = 0; k < chips.length; k++) {
      var slot = k === i ? 'L' : (k < i ? 'p' + k : 'r' + (k - i - 1));
      chips[k].setAttribute('data-slot', slot);
      if (k === i) {
        chips[k].setAttribute('aria-current', 'true');
        total += vals[k];
      } else {
        chips[k].removeAttribute('aria-current');
        if (k < i) total += vals[k];
      }
    }
    hall.setAttribute('data-at', i);
    if (pot) pot.textContent = total;
    if (count) count.textContent = WORDS[i + 1] + (i === 0 ? ' chip in the stack' : ' chips in the stack');
    if (say) say.textContent = chips[i].getAttribute('data-say') || '';
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

  function onResize() {
    onScroll();
  }

  function fromHash() {
    var id = window.location.hash.slice(1);
    if (!id) return false;
    for (var j = 0; j < chips.length; j++) {
      if (chips[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  chips.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = chips.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % chips.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + chips.length) % chips.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = chips.length - 1;
    if (next < 0) return;
    e.preventDefault();
    chips[next].focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setPanel(false);
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
})();
