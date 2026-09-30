(function () {
  var track = document.getElementById('segTrack');
  var slider = document.getElementById('segSlider');
  var count = document.getElementById('count');
  var none = document.getElementById('none');
  if (!track || !slider) return;

  var opts = Array.prototype.slice.call(track.querySelectorAll('[role="radio"]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var items = Array.prototype.slice.call(document.querySelectorAll('#indexList li'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.cls'));
  var total = sections.length;
  var cat = 'cardio';
  var len = '';

  function place() {
    var active = track.querySelector('[role="radio"][aria-checked="true"]') || opts[0];
    var a = active.getBoundingClientRect();
    var b = track.getBoundingClientRect();
    slider.style.width = a.width + 'px';
    slider.style.height = a.height + 'px';
    slider.style.setProperty('--sx', (a.left - b.left) + 'px');
    slider.style.setProperty('--sy', (a.top - b.top) + 'px');
  }

  function matches(el) {
    return (el.getAttribute('data-cat') === cat) && (!len || el.getAttribute('data-len') === len);
  }

  function apply() {
    var shown = 0;
    var step = 0;
    for (var i = 0; i < items.length; i++) {
      var ok = matches(items[i]);
      items[i].hidden = !ok;
      if (ok) shown++;
    }
    for (var s = 0; s < sections.length; s++) {
      var good = matches(sections[s]);
      sections[s].hidden = !good;
      sections[s].classList.remove('is-in');
      if (good) {
        sections[s].style.setProperty('--d', (step * 0.055).toFixed(3) + 's');
        void sections[s].offsetWidth;
        sections[s].classList.add('is-in');
        step++;
      }
    }
    if (count) {
      count.innerHTML = 'Showing ' + shown + ' of ' + total + ' classes' +
        (len ? ' · ' + len + ' sessions' : ' · any length');
    }
    if (none) none.hidden = shown !== 0;
  }

  function setCat(index, focus) {
    for (var i = 0; i < opts.length; i++) {
      var on = i === index;
      opts[i].setAttribute('aria-checked', on ? 'true' : 'false');
      opts[i].tabIndex = on ? 0 : -1;
    }
    cat = opts[index].getAttribute('data-cat');
    place();
    apply();
    if (focus) opts[index].focus();
  }

  for (var i = 0; i < opts.length; i++) {
    opts[i].addEventListener('click', function () {
      setCat(opts.indexOf(this), false);
    });
    opts[i].addEventListener('keydown', function (event) {
      var here = opts.indexOf(this);
      var next = null;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': next = here + 1; break;
        case 'ArrowLeft': case 'ArrowUp': next = here - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = opts.length - 1; break;
        case 'Escape': next = 0; break;
        default: next = null;
      }
      if (next === null) return;
      event.preventDefault();
      setCat((next + opts.length) % opts.length, true);
    });
  }

  for (var c = 0; c < chips.length; c++) {
    chips[c].addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') === 'true';
      for (var k = 0; k < chips.length; k++) chips[k].setAttribute('aria-pressed', 'false');
      if (on) {
        len = '';
        this.setAttribute('aria-pressed', 'false');
      } else {
        len = this.getAttribute('data-len');
        this.setAttribute('aria-pressed', 'true');
      }
      apply();
    });
  }

  window.addEventListener('resize', place);
  window.addEventListener('load', place);

  setCat(0, false);
  apply();
})();
