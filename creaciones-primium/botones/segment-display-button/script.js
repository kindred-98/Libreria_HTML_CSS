(function () {
  var MAP = {
    0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc',
    5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg'
  };
  var ORDER = 'abcdefg';
  var frames = Array.prototype.slice.call(document.querySelectorAll('.fr'));
  var prog = document.getElementById('prog');
  var edgeState = document.getElementById('edgeState');
  var head = 0;
  var value = 0;
  var walkTimer = 0;
  var ghosts = [];

  function paint(dig, n, ghost) {
    var on = MAP[n] || '';
    var segs = dig.children;
    for (var i = 0; i < segs.length; i++) {
      var el = segs[i];
      var lit = on.includes(ORDER[i]);
      if (lit) {
        el.classList.remove('is-ghost');
        el.classList.add('is-on');
      } else {
        el.classList.remove('is-on');
        if (ghost) {
          el.classList.add('is-ghost');
          if (!ghosts.includes(el)) ghosts.push(el);
        } else {
          el.classList.remove('is-ghost');
        }
      }
    }
  }

  function ghostBake(dig, n) {
    var on = MAP[n] || '';
    var segs = dig.children;
    for (var i = 0; i < segs.length; i++) {
      if (on.includes(ORDER[i]) && !segs[i].classList.contains('is-on')) {
        segs[i].classList.add('is-ghost');
      }
    }
  }

  function dropGhosts() {
    for (var ghost of ghosts) ghost.classList.remove('is-ghost');
    ghosts.length = 0;
  }

  function setValue(n, ghost) {
    var ro = live().querySelector('.ro');
    paint(ro.children[0], Math.floor(n / 10), ghost);
    paint(ro.children[1], n % 10, ghost);
    live().querySelector('.fr__cap i').textContent = (n < 10 ? '0' : '') + n;
  }

  function live() { return frames[head]; }

  function setHead(n) {
    head = ((n % frames.length) + frames.length) % frames.length;
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      f.classList.remove('is-live', 'is-pending', 'is-done');
      if (i === head) f.classList.add('is-live');
      else if (i < head) f.classList.add('is-done');
      else f.classList.add('is-pending');
    }
    edgeState.textContent = 'playhead \ frame ' + (head + 1 < 10 ? '0' : '') + (head + 1);
    prog.style.width = Math.round(((head + 1) / frames.length) * 100) + '%';
  }

  function stepDigit() {
    value = (value + 1) % 100;
    dropGhosts();
    setValue(value, true);
    window.setTimeout(dropGhosts, 640);
  }

  function advance() {
    var f = live();
    var ro = f.querySelector('.ro');
    var shown = value;
    var before = (shown + 99) % 100;
    dropGhosts();
    f.classList.remove('is-live');
    f.classList.add('is-done', 'is-frozen');
    paint(ro.children[0], Math.floor(shown / 10), false);
    paint(ro.children[1], shown % 10, false);
    ghostBake(ro.children[0], Math.floor(before / 10));
    ghostBake(ro.children[1], before % 10);
    if (head >= frames.length - 1) {
      window.clearInterval(walkTimer);
      walkTimer = window.setTimeout(function () {
        for (var fr of frames) {
          fr.classList.remove('is-frozen');
          var r = fr.querySelector('.ro');
          paint(r.children[0], 0, false);
          paint(r.children[1], 0, false);
        }
        setHead(0);
        stepDigit();
        walkTimer = window.setInterval(advance, 1500);
      }, 2500);
      return;
    }
    setHead(head + 1);
    stepDigit();
  }

  function fire(fr) {
    // Nombre distinto a fr porque fr es el parametro de fire().
for (var f of frames) f.classList.remove('is-fire');
    fr.getBoundingClientRect();
    fr.classList.add('is-fire');
    window.setTimeout(function () { fr.classList.remove('is-fire'); }, 460);
    if (frames.indexOf(fr) !== head) {
      window.clearInterval(walkTimer);
      for (var i = 0; i < frames.length; i++) {
        if (i > frames.indexOf(fr) && !frames[i].classList.contains('is-done')) {
          frames[i].classList.remove('is-frozen');
          var r = frames[i].querySelector('.ro');
          paint(r.children[0], 0, false);
          paint(r.children[1], 0, false);
        }
      }
      setHead(frames.indexOf(fr));
      walkTimer = window.setInterval(advance, 1500);
    }
    stepDigit();
  }

  frames.forEach(function (fr) {
    fr.addEventListener('click', function () { fire(fr); });
  });

  setHead(0);
  stepDigit();
  walkTimer = window.setInterval(advance, 1500);
})();
