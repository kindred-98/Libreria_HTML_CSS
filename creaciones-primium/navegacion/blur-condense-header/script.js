(function () {
  var root = document.documentElement;
  var hdr = document.querySelector('.hdr');
  var wide = document.getElementById('navWide');
  var tight = document.getElementById('navTight');
  var mag = document.getElementById('mag');
  var form = document.getElementById('mini');
  var input = document.getElementById('q');
  var status = document.getElementById('qst');
  var sections = Array.prototype.slice.call(document.querySelectorAll('.sec[id]'));
  var ticks = Array.prototype.slice.call(wide.querySelectorAll('a')).concat(Array.prototype.slice.call(tight.querySelectorAll('a')));
  var condensed = false;
  var ticking = false;

  var INDEX = [
    { id: 'chemistry', keys: 'silver halide crystal electron developer emulsion latent image' },
    { id: 'grain', keys: 'grain noise structure crystal size push scanner texture' },
    { id: 'darkroom', keys: 'darkroom d-76 developer stop bath fixer twenty degrees agitation timing' },
    { id: 'paper', keys: 'paper multigrade fibre pearl surface grade filter print' },
    { id: 'field', keys: 'field notes kettle valley fog heron report rolls light' },
    { id: 'index', keys: 'index departments corrections contents pages' }
  ];

  function measure() {
    ticking = false;
    var next = window.scrollY > 46;
    if (next === condensed) return;
    condensed = next;
    hdr.classList.toggle('is-min', next);
    root.classList.toggle('is-min', next);
    if (next) {
      wide.setAttribute('aria-hidden', 'true');
      wide.setAttribute('inert', '');
      tight.removeAttribute('aria-hidden');
      tight.removeAttribute('inert');
    } else {
      tight.setAttribute('aria-hidden', 'true');
      tight.setAttribute('inert', '');
      wide.removeAttribute('aria-hidden');
      wide.removeAttribute('inert');
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(measure);
  }

  function spy() {
    var line = window.scrollY + window.innerHeight * 0.34;
    var active = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= line) active = section;
    }
    var id = active ? active.id : '';
    ticks.forEach(function (link) {
      var on = link.getAttribute('href') === '#' + id;
      if (on) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function openSearch(focus) {
    hdr.classList.add('is-open');
    mag.setAttribute('aria-expanded', 'true');
    if (focus) {
      input.focus();
      input.select();
    }
  }

  function closeSearch(refocus) {
    if (!hdr.classList.contains('is-open')) return;
    hdr.classList.remove('is-open');
    mag.setAttribute('aria-expanded', 'false');
    if (refocus && window.innerWidth > 700) mag.focus();
  }

  function say(text) {
    status.textContent = text;
    status.classList.add('on');
  }

  function jump() {
    var raw = input.value.trim().toLowerCase();
    if (!raw) {
      say('Type a word to search the issue');
      input.focus();
      return;
    }
    var words = raw.split(/\s+/);
    var best = null;
    var bestScore = 0;
    INDEX.forEach(function (row) {
      var hay = (row.id + ' ' + row.keys).toLowerCase();
      var score = 0;
      words.forEach(function (w) {
        if (hay.includes(w)) score += w.length > 3 ? 2 : 1;
      });
      if (score > bestScore) {
        bestScore = score;
        best = row.id;
      }
    });
    if (!best) {
      say('No department matches that word');
      return;
    }
    var target = document.getElementById(best);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    say('Jumped to ' + (target.querySelector('h2') ? target.querySelector('h2').textContent : best));
  }

  mag.addEventListener('click', function () {
    if (mag.getAttribute('aria-expanded') === 'true') closeSearch(true);
    else openSearch(true);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    jump();
  });

  document.getElementById('go').addEventListener('click', function () {
    jump();
  });

  document.addEventListener('keydown', function (e) {
    var typing = document.activeElement === input;
    if (e.key === 'Escape') {
      if (typing) {
        input.value = '';
        input.blur();
        status.classList.remove('on');
        closeSearch(false);
      } else if (hdr.classList.contains('is-open')) {
        closeSearch(true);
      }
      return;
    }
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      openSearch(true);
    }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  measure();
  spy();
  window.addEventListener('scroll', spy, { passive: true });
})();
