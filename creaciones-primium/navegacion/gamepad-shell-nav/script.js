(function () {
  var pad = document.getElementById('pad');
  var dir = {
    up: document.getElementById('dU'),
    left: document.getElementById('dL'),
    right: document.getElementById('dR'),
    down: document.getElementById('dD')
  };
  var order = [dir.up, dir.left, dir.right, dir.down];
  var rooms = [].slice.call(document.querySelectorAll('.room[id]'));
  var mapDots = [].slice.call(document.querySelectorAll('#sMap i'));
  var boardLinks = [].slice.call(document.querySelectorAll('.board-nav__list a'));
  var sNo = document.getElementById('sNo');
  var sTitle = document.getElementById('sTitle');
  var sSub = document.getElementById('sSub');
  var sPos = document.getElementById('sPos');
  var say = document.getElementById('say');
  var start = document.getElementById('start');
  var sel = document.getElementById('sel');
  var manual = document.getElementById('manual');
  var manX = document.getElementById('manX');
  var openLink = document.getElementById('openManual');
  var index = 0;
  var cols = 2;

  function padFlash(node) {
    if (!node) return;
    node.classList.add('is-hit');
    window.setTimeout(function () { node.classList.remove('is-hit'); }, 150);
  }

  function paint() {
    var room = rooms[index];
    if (!room) return;
    var no = room.querySelector('.room__no').textContent;
    var title = room.querySelector('.room__t').textContent;
    sNo.textContent = no.replace(/\D/g, '');
    sTitle.textContent = title;
    sSub.textContent = room.querySelector('.room__lede').textContent;
    sPos.textContent = 'Room ' + (index + 1) + ' of ' + rooms.length;
    say.textContent = 'Room ' + (index + 1) + ' of ' + rooms.length + ': ' + title;
    mapDots.forEach(function (dot, i) {
      if (i === index) dot.classList.add('on');
      else dot.classList.remove('on');
    });
    rooms.forEach(function (r, i) {
      if (i === index) r.classList.add('is-lit');
      else r.classList.remove('is-lit');
    });
    boardLinks.forEach(function (a) {
      if (a.getAttribute('href') === '#' + room.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  function move(step, node) {
    var next = index + step;
    if (next < 0) next = 0;
    if (next > rooms.length - 1) next = rooms.length - 1;
    if (next !== index) {
      index = next;
      paint();
    }
    padFlash(node);
  }

  function steer(key, node) {
    if (key === 'ArrowUp') { move(-cols, dir.up); return true; }
    if (key === 'ArrowDown') { move(cols, dir.down); return true; }
    if (key === 'ArrowLeft') { move(-1, dir.left); return true; }
    if (key === 'ArrowRight') { move(1, dir.right); return true; }
    return false;
  }

  order.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn === dir.up ? 'ArrowUp'
        : btn === dir.down ? 'ArrowDown'
        : btn === dir.left ? 'ArrowLeft'
        : 'ArrowRight';
      if (!steer(key, btn)) padFlash(btn);
    });
  });

  function go() {
    var room = rooms[index];
    if (!room) return;
    room.scrollIntoView({ behavior: 'smooth', block: 'start' });
    start.classList.add('is-lit');
    window.setTimeout(function () { start.classList.remove('is-lit'); }, 420);
  }

  start.addEventListener('click', go);

  pad.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
      return;
    }
    if (steer(e.key, document.activeElement)) e.preventDefault();
  });

  function showManual() {
    manual.removeAttribute('hidden');
    sel.setAttribute('aria-expanded', 'true');
    manX.focus();
  }

  function closeManual(refocus) {
    if (manual.hasAttribute('hidden')) return;
    manual.setAttribute('hidden', '');
    sel.setAttribute('aria-expanded', 'false');
    if (refocus) sel.focus();
  }

  sel.addEventListener('click', function () {
    if (sel.getAttribute('aria-expanded') === 'true') closeManual(true);
    else showManual();
  });

  manX.addEventListener('click', function () { closeManual(true); });

  if (openLink) {
    openLink.addEventListener('click', function (e) {
      e.preventDefault();
      showManual();
    });
  }

  manual.addEventListener('click', function (e) {
    if (e.target === manual) closeManual(true);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!manual.hasAttribute('hidden')) {
      closeManual(true);
      return;
    }
    if (pad.contains(document.activeElement)) padFlash(document.activeElement);
  });

  boardLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('href').slice(1);
      rooms.forEach(function (r, i) {
        if (r.id === id) {
          index = i;
          paint();
        }
      });
    });
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth <= 720) cols = 1;
    else cols = 2;
  });

  paint();
})();
