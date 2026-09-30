(function () {
  var needle = document.getElementById('needle');
  var knob = document.getElementById('knob');
  var chans = Array.prototype.slice.call(document.querySelectorAll('.chan'));
  var jumps = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var readFreq = document.getElementById('readFreq');
  var readName = document.getElementById('readName');
  var readSub = document.getElementById('readSub');
  var ids = chans.map(function (a) { return a.getAttribute('href').slice(1); });
  var lastId = '';
  var lastIndex = -1;
  var pending = false;

  function tune(index) {
    var chan = chans[index];
    if (!chan) return;
    needle.style.transform = 'translateX(' + (chan.offsetLeft + chan.offsetWidth / 2) + 'px)';
    knob.style.transform = 'rotate(' + (-135 + index * 54) + 'deg)';
  }

  function readout(index) {
    var section = document.getElementById(ids[index]);
    var freq = chans[index].querySelector('b');
    var band = section ? section.querySelector('.prog__band') : null;
    var time = section ? section.querySelector('.prog__time') : null;
    if (freq) readFreq.textContent = freq.textContent;
    readName.textContent = band ? band.textContent : '';
    readSub.textContent = time ? time.textContent : '';
  }

  function update() {
    pending = false;
    var current = '';
    var found = -1;
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 260) {
        current = id;
        found = i;
      }
    });
    if (found < 0) {
      chans.forEach(function (a) { a.removeAttribute('aria-current'); });
      jumps.forEach(function (a) { a.removeAttribute('aria-current'); });
      lastId = '';
      if (lastIndex !== 0) {
        lastIndex = 0;
        tune(0);
        readout(0);
      } else {
        tune(0);
      }
      return;
    }
    if (found !== lastIndex) {
      lastIndex = found;
      tune(found);
      readout(found);
    } else {
      tune(found);
    }
    if (current === lastId) return;
    lastId = current;
    chans.forEach(function (a, i) {
      if (i === found) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    jumps.forEach(function (a) {
      if (a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('resize', function () {
    var index = ids.indexOf(lastId);
    tune(index > -1 ? index : 0);
  });

  document.getElementById('dial').addEventListener('keydown', function (e) {
    var active = document.activeElement;
    var i = chans.indexOf(active);
    if (i < 0) return;
    var to = -1;
    if (e.key === 'ArrowRight') to = (i + 1) % chans.length;
    else if (e.key === 'ArrowLeft') to = (i - 1 + chans.length) % chans.length;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = chans.length - 1;
    if (to > -1) {
      e.preventDefault();
      chans[to].focus();
      tune(to);
      readout(to);
    }
  });

  chans.forEach(function (a, i) {
    a.addEventListener('focus', function () { tune(i); readout(i); });
    a.addEventListener('mouseenter', function () { tune(i); });
  });

  update();
})();
