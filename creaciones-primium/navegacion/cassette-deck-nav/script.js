(function () {
  var deck = document.getElementById('deck');
  var list = document.getElementById('tracks');
  var bar = document.getElementById('tracksBar');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });
  var prev = document.getElementById('prev');
  var play = document.getElementById('play');
  var stop = document.getElementById('stop');
  var next = document.getElementById('next');
  var eject = document.getElementById('eject');
  var liner = document.getElementById('liner');
  var linerClose = document.getElementById('linerClose');
  var mode = document.getElementById('mode');
  var counter = document.getElementById('counter');
  var jumps = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var ids = ['sessions', 'releases', 'masters', 'info'];
  var playing = false;
  var ticks = 0;
  var timer = null;
  var pending = false;

  function activeIndex() {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('aria-selected') === 'true') return i;
    }
    return 0;
  }

  function placeBar() {
    var tab = tabs[activeIndex()];
    if (!tab) return;
    bar.style.height = tab.offsetHeight + 'px';
    bar.style.transform = 'translateY(' + tab.offsetTop + 'px)';
  }

  function select(index, moveFocus) {
    if (index < 0) index = tabs.length - 1;
    if (index >= tabs.length) index = 0;
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      var panel = panels[i];
      if (!panel) return;
      panel.hidden = !on;
      panel.classList.remove('is-in');
      if (on) {
        void panel.offsetWidth;
        panel.classList.add('is-in');
      }
    });
    if (moveFocus) tabs[index].focus();
    ticks = 0;
    counter.textContent = '000';
    placeBar();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(i, false); });
    tab.addEventListener('focus', function () {
      if (tab.getAttribute('aria-selected') !== 'true') select(i, false);
    });
  });

  list.addEventListener('keydown', function (e) {
    var i = activeIndex();
    var to = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = i + 1;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = i - 1;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = tabs.length - 1;
    if (to > -1) {
      e.preventDefault();
      select(to, true);
    }
  });

  function setPlaying(state) {
    playing = state;
    deck.classList.toggle('is-playing', playing);
    play.classList.toggle('is-on', playing);
    play.setAttribute('aria-pressed', playing ? 'true' : 'false');
    play.setAttribute('aria-label', playing ? 'Pause the deck' : 'Play the deck');
    play.querySelector('span').textContent = playing ? 'Pause' : 'Play';
    mode.textContent = playing ? 'Play' : 'Stop';
    if (playing && !timer) {
      timer = window.setInterval(function () {
        ticks = (ticks + 1) % 1000;
        counter.textContent = ticks < 10 ? '00' + ticks : ticks < 100 ? '0' + ticks : '' + ticks;
      }, 380);
    }
    if (!playing && timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function press(el) {
    el.classList.add('is-down');
    window.setTimeout(function () { el.classList.remove('is-down'); }, 130);
  }

  prev.addEventListener('click', function () {
    press(prev);
    select(activeIndex() - 1, false);
  });
  next.addEventListener('click', function () {
    press(next);
    select(activeIndex() + 1, false);
  });
  play.addEventListener('click', function () {
    press(play);
    setPlaying(!playing);
  });
  stop.addEventListener('click', function () {
    press(stop);
    setPlaying(false);
    ticks = 0;
    counter.textContent = '000';
  });

  function openLiner() {
    liner.hidden = false;
    eject.setAttribute('aria-expanded', 'true');
    linerClose.focus();
  }

  function closeLiner() {
    liner.hidden = true;
    eject.setAttribute('aria-expanded', 'false');
    eject.focus();
  }

  eject.addEventListener('click', function () {
    press(eject);
    if (liner.hidden) openLiner();
    else closeLiner();
  });
  linerClose.addEventListener('click', closeLiner);
  liner.addEventListener('mousedown', function (e) {
    if (e.target === liner) closeLiner();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !liner.hidden) closeLiner();
  });

  function spy() {
    pending = false;
    var current = '';
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 240) current = id;
    });
    jumps.forEach(function (a) {
      if (current && a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }, { passive: true });

  window.addEventListener('resize', placeBar);
  select(activeIndex(), false);
  spy();
})();
