(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var squares = Array.prototype.slice.call(hall.querySelectorAll('.sq'));
  var sections = squares.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var token = hall.querySelector('.token');
  var turn = hall.querySelector('[data-turn]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = -1;
  var queued = false;

  function hop() {
    if (!token || calm.matches) return;
    token.classList.remove('is-hop');
    token.getBoundingClientRect();
    token.classList.add('is-hop');
  }

  function clearHop() {
    if (token) token.classList.remove('is-hop');
  }

  if (token) token.addEventListener('animationend', clearHop);

  function apply(i) {
    if (i === current || i < 0 || i >= squares.length) return;
    var first = current < 0;
    current = i;
    for (var k = 0; k < squares.length; k++) {
      if (k === i) {
        squares[k].setAttribute('aria-current', 'true');
        squares[k].classList.remove('is-past');
      } else {
        squares[k].removeAttribute('aria-current');
        if (k < i) squares[k].classList.add('is-past');
        else squares[k].classList.remove('is-past');
      }
    }
    hall.dataset.at = i;
    if (turn) turn.textContent = squares[i].querySelector('.sq__no').textContent;
    if (say) say.textContent = squares[i].dataset.say || '';
    if (!first) hop();
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
    if (e.key === 'Escape') { setPanel(false); clearHop(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('hashchange', function () { fromHash(); onScroll(); });
  window.addEventListener('load', onScroll);

  if (!fromHash()) scan();
})();
