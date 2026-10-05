(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var cards = Array.prototype.slice.call(hall.querySelectorAll('.card'));
  var sections = cards.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var counter = hall.querySelector('[data-card]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;

  function apply(i) {
    if (i === current || i < 0 || i >= cards.length) return;
    current = i;
    for (var k = 0; k < cards.length; k++) {
      if (k === i) {
        cards[k].setAttribute('aria-current', 'true');
        cards[k].classList.remove('is-past');
      } else {
        cards[k].removeAttribute('aria-current');
        if (k < i) cards[k].classList.add('is-past');
        else cards[k].classList.remove('is-past');
      }
    }
    hall.dataset.at = i;
    if (counter) counter.textContent = cards[i].querySelector('.card__rank').textContent;
    if (say) say.textContent = cards[i].dataset.say || '';
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
    for (var j = 0; j < cards.length; j++) {
      if (cards[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  cards.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = cards.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowUp') next = (i + 1) % cards.length;
    else if (k === 'ArrowLeft' || k === 'ArrowDown') next = (i - 1 + cards.length) % cards.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = cards.length - 1;
    if (next < 0) return;
    e.preventDefault();
    cards[next].focus();
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
