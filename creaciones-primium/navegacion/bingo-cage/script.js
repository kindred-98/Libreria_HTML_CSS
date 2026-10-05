(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var balls = Array.prototype.slice.call(hall.querySelectorAll('.ball'));
  var sections = balls.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var called = hall.querySelector('[data-called]');
  var left = hall.querySelector('[data-left]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var current = -1;
  var queued = false;
  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five'];

  function rollOut(ball) {
    if (calm.matches) return;
    ball.classList.remove('is-out');
    ball.getBoundingClientRect();
    ball.classList.add('is-out');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= balls.length) return;
    var moved = balls[i];
    var first = current < 0;
    current = i;
    for (var k = 0; k < balls.length; k++) {
      if (k === i) balls[k].setAttribute('aria-current', 'true');
      else balls[k].removeAttribute('aria-current');
    }
    balls.forEach(function (b) { b.classList.remove('is-out'); });
    if (!first) rollOut(moved);
    hall.dataset.at = i;
    if (called) called.textContent = balls[i].dataset.no;
    if (left) left.textContent = WORDS[balls.length - 1 - i] + (balls.length - 1 - i === 1 ? ' still in' : ' still in the cage');
    if (say) say.textContent = balls[i].dataset.say || '';
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
    for (var j = 0; j < balls.length; j++) {
      if (balls[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
    hall.dataset.open = open ? 'true' : 'false';
  }

  balls.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
    a.addEventListener('animationend', function () { a.classList.remove('is-out'); });
  });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = balls.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % balls.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + balls.length) % balls.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = balls.length - 1;
    if (next < 0) return;
    e.preventDefault();
    balls[next].focus();
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
