(function () {
  var track = document.getElementById('track');
  var fill = document.getElementById('fill');
  var play = document.getElementById('play');
  var copy = document.getElementById('copy');
  var tape = document.querySelector('.tape');
  var marks = Array.prototype.slice.call(document.querySelectorAll('#marks .mark'));
  var chapters = Array.prototype.slice.call(document.querySelectorAll('.ch[id]'));
  var more = Array.prototype.slice.call(document.querySelectorAll('.ch__more'));
  var out = document.getElementById('scaleOut');
  var ylds = Array.prototype.slice.call(document.querySelectorAll('.yld'));
  var current = '';
  var ticking = false;

  function setActive(id, announce) {
    if (id === current) return;
    current = id;
    var node = document.getElementById(id);
    if (!node) return;
    var head = node.querySelector('h2');
    var num = node.querySelector('.ch__no');
    var time = node.dataset.time || '';
    marks.forEach(function (m) {
      if (m.getAttribute('href') === '#' + id) m.setAttribute('aria-current', 'true');
      else m.removeAttribute('aria-current');
    });
    copy.textContent = '';
    var pill = document.createElement('span');
    pill.className = 'tape__pill';
    pill.textContent = 'Chapter ' + (num ? num.textContent : '');
    var label = document.createElement('span');
    label.textContent = head ? head.textContent : id;
    var clock = document.createElement('span');
    clock.className = 'tape__time';
    clock.textContent = time;
    copy.appendChild(pill);
    copy.appendChild(label);
    copy.appendChild(clock);
    if (announce) {
      tape.classList.remove('is-turn');
      copy.getBoundingClientRect();
      tape.classList.add('is-turn');
    }
  }

  function paint() {
    ticking = false;
    var span = document.documentElement.scrollHeight - window.innerHeight;
    var p = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
    var room = Math.max(0, track.clientWidth - play.offsetWidth);
    play.style.transform = 'translateX(' + p * room + 'px)';
    fill.style.transform = 'scaleX(' + Math.max(0.012, p) + ')';

    var line = window.scrollY + window.innerHeight * 0.5;
    var active = chapters[0];
    for (const chapter of chapters) {
      if (chapter.offsetTop <= line) active = chapter;
    }
    if (active) setActive(active.id, false);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paint);
  }

  more.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    more.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true') {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  function scaleBy(step) {
    var n = Number.parseInt(out.textContent, 10) + step;
    if (n < 1) n = 1;
    if (n > 24) n = 24;
    out.textContent = String(n);
    ylds.forEach(function (b) {
      var base = Number.parseInt(b.dataset.base || '1', 10);
      b.textContent = String(Math.max(1, Math.round(base * n / 4)));
    });
  }

  document.getElementById('more').addEventListener('click', function () { scaleBy(1); });
  document.getElementById('less').addEventListener('click', function () { scaleBy(-1); });

  ylds.forEach(function (b) { b.dataset.base = b.textContent; });

  marks.forEach(function (m) {
    m.addEventListener('click', function () {
      var id = m.getAttribute('href').slice(1);
      window.setTimeout(function () { setActive(id, true); }, 60);
    });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  paint();
})();
