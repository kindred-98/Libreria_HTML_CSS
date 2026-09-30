(function () {
  var fill = document.getElementById('progFill');
  var pct = document.getElementById('pct');
  var left = document.getElementById('left');
  var status = document.getElementById('progText');
  var chaptersNav = document.querySelector('.chapters');
  var bar = document.getElementById('chBar');
  var panel = document.getElementById('panel');
  var tocBtn = document.getElementById('tocBtn');
  var panelClose = document.getElementById('panelClose');
  var jumps = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
  var chapters = Array.prototype.slice.call(document.querySelectorAll('.ch'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var total = 17;
  var pending = false;
  var lastStep = -1;
  var lastId = '';

  function markReveal(list) {
    if (!('IntersectionObserver' in window)) {
      list.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    list.forEach(function (el) { io.observe(el); });
  }

  markReveal(chapters);

  function moveBar(id) {
    if (!bar || !chaptersNav) return;
    var link = chaptersNav.querySelector('a[href="#' + id + '"]');
    if (!link) {
      chaptersNav.classList.remove('is-ready');
      return;
    }
    var w = link.offsetWidth || 44;
    bar.style.transform = 'translateX(' + link.offsetLeft + 'px) scaleX(' + (w / 44) + ')';
    chaptersNav.classList.add('is-ready');
  }

  function update() {
    pending = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var p = Math.min(1, Math.max(0, y / max));
    fill.style.transform = 'scaleX(' + p + ')';
    var value = Math.round(p * 100);
    pct.textContent = value;
    var mins = Math.max(0, Math.round(total * (1 - p)));
    left.textContent = mins + (mins === 1 ? ' min left' : ' mins left');
    var step = Math.floor(value / 10);
    if (step !== lastStep) {
      lastStep = step;
      status.textContent = 'Reading progress: ' + value + ' percent, ' + mins + ' minutes left.';
    }

    var current = '';
    chapters.forEach(function (section) {
      if (section.getBoundingClientRect().top <= 140) current = section.id;
    });
    if (current !== lastId) {
      lastId = current;
      moveBar(current);
      jumps.forEach(function (a) {
        if (current && a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      dots.forEach(function (d) {
        var id = d.getAttribute('href').slice(1);
        var index = chapters.findIndex(function (s) { return s.id === id; });
        var activeIndex = chapters.findIndex(function (s) { return s.id === current; });
        d.classList.toggle('is-active', id === current);
        d.classList.toggle('is-past', activeIndex > -1 && index > -1 && index < activeIndex);
        if (id === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }
  }

  function onScroll() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  function openPanel() {
    panel.hidden = false;
    tocBtn.setAttribute('aria-expanded', 'true');
    var first = panel.querySelector('a');
    if (first) first.focus();
  }

  function closePanel(back) {
    panel.hidden = true;
    tocBtn.setAttribute('aria-expanded', 'false');
    if (back) tocBtn.focus();
  }

  tocBtn.addEventListener('click', function () {
    if (panel.hidden) openPanel();
    else closePanel(true);
  });
  panelClose.addEventListener('click', function () { closePanel(true); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) closePanel(true);
  });

  document.addEventListener('mousedown', function (e) {
    if (panel.hidden) return;
    if (!panel.contains(e.target) && !tocBtn.contains(e.target)) closePanel(false);
  });

  panel.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) closePanel(false);
  });

  window.addEventListener('resize', function () {
    if (!panel.hidden && window.innerWidth > 900) closePanel(false);
  });

  if (chaptersNav) {
    chaptersNav.addEventListener('keydown', function (e) {
      var links = Array.prototype.slice.call(chaptersNav.querySelectorAll('a'));
      var i = links.indexOf(document.activeElement);
      if (i < 0) return;
      var next = -1;
      if (e.key === 'ArrowRight') next = (i + 1) % links.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + links.length) % links.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = links.length - 1;
      if (next > -1) {
        e.preventDefault();
        links[next].focus();
      }
    });
  }

  if (reduced) chapters.forEach(function (el) { el.classList.add('in'); });
})();
