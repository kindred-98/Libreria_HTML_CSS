(function () {
  var list = document.getElementById('postsList');
  var fill = document.getElementById('threadFill');
  var needle = document.getElementById('gaugeNeedle');
  var gaugeAlt = document.getElementById('gaugeAlt');
  if (!list || !fill) return;

  var links = Array.prototype.slice.call(list.querySelectorAll('.post__link'));
  var posts = Array.prototype.slice.call(list.querySelectorAll('.post'));
  var stages = Array.prototype.slice.call(document.querySelectorAll('.stage'));
  var meta = [
    { alt: '1 840 m', p: 0.02 },
    { alt: '2 260 m', p: 0.3 },
    { alt: '2 940 m', p: 0.62 },
    { alt: '3 410 m', p: 0.95 },
    { alt: '2 105 m', p: 0.4 }
  ];
  var current = -1;
  var queued = false;

  function mark(index) {
    if (index === current || index < 0 || index >= posts.length) return;
    current = index;
    for (var i = 0; i < posts.length; i++) {
      posts[i].classList.toggle('is-on', i === index);
      posts[i].classList.toggle('is-done', i < index);
      if (i === index) {
        links[i].setAttribute('aria-current', 'true');
      } else {
        links[i].removeAttribute('aria-current');
      }
    }
    for (var s = 0; s < stages.length; s++) {
      stages[s].classList.toggle('is-here', s === index);
    }
    fill.style.setProperty('--fill', String(index / (posts.length - 1)));
    if (gaugeAlt) gaugeAlt.textContent = meta[index].alt;
    if (needle) {
      var track = needle.parentNode.getBoundingClientRect().width - 28;
      needle.style.setProperty('--nx', (meta[index].p * Math.max(track, 0)).toFixed(1) + 'px');
    }
  }

  function read() {
    queued = false;
    var probe = window.innerHeight * 0.42;
    var best = 0;
    var bestDist = Infinity;
    for (var i = 0; i < stages.length; i++) {
      var box = stages[i].getBoundingClientRect();
      if (box.bottom < 0) continue;
      var d = Math.abs(box.top - probe);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    mark(best);
  }

  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(read);
  }

  function focusLink(index) {
    var i = (index + links.length) % links.length;
    links[i].focus();
    mark(i);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('keydown', function (event) {
      var here = links.indexOf(event.currentTarget);
      var handled = true;
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          focusLink(here + 1);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          focusLink(here - 1);
          break;
        case 'Home':
          focusLink(0);
          break;
        case 'End':
          focusLink(links.length - 1);
          break;
        case 'Escape':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          links[0].focus();
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    });
    links[i].addEventListener('click', function (event) {
      var id = this.getAttribute('href');
      if (!id || id.charAt(0) !== '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      mark(links.indexOf(this));
      var top = target.getBoundingClientRect().top + window.pageYOffset - 96;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  }

  mark(0);
  read();
})();
