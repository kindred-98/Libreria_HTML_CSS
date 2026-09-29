(function () {
  var hall = document.querySelector('[data-nav]');
  if (!hall) return;

  var nums = Array.prototype.slice.call(hall.querySelectorAll('.num'));
  var sections = nums.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var wheel = hall.querySelector('.wheel');
  var up = hall.querySelector('[data-up]');
  var turn = hall.querySelector('[data-turn]');
  var say = hall.querySelector('[data-say]');
  var key = hall.querySelector('[data-panel]');
  var panel = key ? document.getElementById(key.getAttribute('aria-controls')) : null;
  var current = -1;
  var queued = false;
  var angle = 0;
  var STEP = 60;
  var SPINS = [6, 5, 4, 3, 2, 1];

  function settle() {
    if (!wheel) return;
    wheel.classList.remove('is-set');
    void wheel.offsetWidth;
    wheel.classList.add('is-set');
  }

  function apply(i) {
    if (i === current || i < 0 || i >= nums.length) return;
    var first = current < 0;
    var back = current > -1 && i < current;
    current = i;
    for (var k = 0; k < nums.length; k++) {
      if (k === i) nums[k].setAttribute('aria-current', 'true');
      else nums[k].removeAttribute('aria-current');
    }
    if (wheel) {
      if (first) wheel.style.transition = 'none';
      if (first) angle = i * STEP;
      else angle += (back ? 1 + (current - i) : (SPINS[i] || 1)) * 360 + i * STEP;
      wheel.style.transform = 'rotate(' + angle + 'deg)';
      if (first) { void wheel.offsetWidth; wheel.style.transition = ''; }
    }
    hall.setAttribute('data-at', i);
    if (up) up.textContent = 'no.' + nums[i].getAttribute('data-no');
    if (turn) turn.textContent = first ? 'first spin' : (back ? 'back one house' : 'turn ' + (SPINS[i] || 1));
    if (say) say.textContent = nums[i].getAttribute('data-say') || '';
    settle();
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
    for (var j = 0; j < nums.length; j++) {
      if (nums[j].getAttribute('href') === '#' + id) { apply(j); return true; }
    }
    return false;
  }

  function setPanel(open) {
    if (!key || !panel) return;
    key.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.hidden = !open;
  }

  nums.forEach(function (a, k) {
    a.addEventListener('click', function () { apply(k); });
  });

  if (wheel) wheel.addEventListener('animationend', function () { wheel.classList.remove('is-set'); });

  if (key) {
    key.addEventListener('click', function () {
      setPanel(key.getAttribute('aria-expanded') !== 'true');
    });
  }

  hall.addEventListener('keydown', function (e) {
    var i = nums.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown') next = (i + 1) % nums.length;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') next = (i - 1 + nums.length) % nums.length;
    else if (k === 'Home') next = 0;
    else if (k === 'End') next = nums.length - 1;
    if (next < 0) return;
    e.preventDefault();
    nums[next].focus();
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
