(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var squares = Array.prototype.slice.call(hall.querySelectorAll('.row-near .sq'));
  var sections = squares.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var man = hall.querySelector('.man');
  var move = hall.querySelector('[data-move]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = -1;
  var queued = false;

  function clear() {
    if (man) man.classList.remove('is-leap');
  }

  function leap() {
    if (!man || calm.matches) return;
    man.classList.remove('is-leap');
    void man.offsetWidth;
    man.classList.add('is-leap');
  }

  if (man) man.addEventListener('animationend', clear);

  function apply(i) {
    if (i === current || i < 0 || i >= squares.length) return;
    var first = current < 0;
    current = i;
    for (var k = 0; k < squares.length; k++) {
      if (k === i) {
        squares[k].setAttribute('aria-current', 'true');
        squares[k].classList.remove('is-taken');
      } else {
        squares[k].removeAttribute('aria-current');
        if (k < i) squares[k].classList.add('is-taken');
        else squares[k].classList.remove('is-taken');
      }
    }
    hall.setAttribute('data-at', i);
    if (move) move.textContent = squares[i].querySelector('.sq__n').textContent;
    if (say) say.textContent = squares[i].getAttribute('data-say') || '';
    if (!first) leap();
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
    for (var j = 0; j < squares.length; j++) {
      if (squares[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  squares.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = squares.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % squares.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + squares.length) % squares.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = squares.length - 1;
    if (next < 0) return;
    e.preventDefault();
    squares[next].focus();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setPanel(false); clear(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
})();
