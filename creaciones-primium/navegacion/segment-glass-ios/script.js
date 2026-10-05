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
    return (el.dataset.cat === cat) && (!len || el.dataset.len === len);
  }

  function apply() {
    var shown = 0;
    var step = 0;
    for (const item of items) {
      var ok = matches(item);
      item.hidden = !ok;
      if (ok) shown++;
    }
    for (const section of sections) {
      var good = matches(section);
      section.hidden = !good;
      section.classList.remove('is-in');
      if (good) {
        section.style.setProperty('--d', (step * 0.055).toFixed(3) + 's');
        section.getBoundingClientRect();
        section.classList.add('is-in');
        step++;
      }
    }
    if (count) {
      // textContent en vez de innerHTML: el contenido son numeros y la
      // longitud de la sesion, pero CodeQL no lo sabe y marcaba la cadena
      // como "DOM text reinterpreted as HTML".
      count.textContent = 'Showing ' + shown + ' of ' + total + ' classes' +
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
    cat = opts[index].dataset.cat;
    place();
    apply();
    if (focus) opts[index].focus();
  }

  for (const opt of opts) {
    opt.addEventListener('click', function () {
      setCat(opts.indexOf(this), false);
    });
    opt.addEventListener('keydown', function (event) {
      var here = opts.indexOf(this);
      var next = null;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': next = here + 1; break;
        case 'ArrowLeft': case 'ArrowUp': next = here - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = opts.length - 1; break;
        case 'Escape': next = 0; break;
        default: break;
      }
      if (next === null) return;
      event.preventDefault();
      setCat((next + opts.length) % opts.length, true);
    });
  }

  for (const chip of chips) {
    chip.addEventListener('click', function () {
      var on = this.getAttribute('aria-pressed') === 'true';
      for (const other of chips) other.setAttribute('aria-pressed', 'false');
      if (on) {
        len = '';
        this.setAttribute('aria-pressed', 'false');
      } else {
        len = this.dataset.len;
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
