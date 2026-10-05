(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var tiles = Array.prototype.slice.call(hall.querySelectorAll('.tile'));
  var sections = tiles.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var fallen = hall.querySelector('[data-fallen]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= tiles.length) return;
    current = i;
    for (var k = 0; k < tiles.length; k++) {
      if (k === i) {
        tiles[k].setAttribute('aria-current', 'true');
        delete tiles[k].dataset.down;
      } else {
        tiles[k].removeAttribute('aria-current');
        if (k < i) tiles[k].dataset.down = 'true';
        else delete tiles[k].dataset.down;
      }
    }
    hall.dataset.at = i;
    if (fallen) fallen.textContent = i;
    if (say) say.textContent = tiles[i].dataset.say || '';
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
    for (var j = 0; j < tiles.length; j++) {
      if (tiles[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  tiles.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = tiles.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % tiles.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + tiles.length) % tiles.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = tiles.length - 1;
    if (next < 0) return;
    e.preventDefault();
    tiles[next].focus();
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
