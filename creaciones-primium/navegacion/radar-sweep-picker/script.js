(function () {
  var scope = document.getElementById('scope');
  var wedge = document.getElementById('wedge');
  var needle = document.getElementById('needle');
  if (!scope || !wedge || !needle) return;

  var blips = Array.prototype.slice.call(scope.querySelectorAll('.blip'));
  var selName = document.getElementById('selName');
  var selBearing = document.getElementById('selBearing');
  var selState = document.getElementById('selState');
  var selRwy = document.getElementById('selRwy');
  var selHdg = document.getElementById('selHdg');
  var selDist = document.getElementById('selDist');
  var selBag = document.getElementById('selBag');
  var selGo = document.getElementById('selGo');
  var targets = ['#sec-rwy27', '#sec-taxy', '#sec-rwy14', '#sec-apron', '#sec-deice', '#sec-feed'];
  var states = ['Line up and wait', 'Taxiing, wet surface', 'Crosswind check',
    'Four stands free', 'Bay 2 in use', 'Two aircraft tracked'];
  var current = -1;

  function bearingOf(blip) {
    var value = Number.parseFloat((blip.style.getPropertyValue('--b') || '0').replace('deg', ''));
    return isNaN(value) ? 0 : value;
  }

  function paint(index) {
    var blip = blips[index];
    var b = bearingOf(blip);
    needle.style.setProperty('--b', b + 'deg');
    wedge.style.setProperty('--b', b + 'deg');
    if (selName) selName.textContent = blip.dataset.name || '';
    if (selBearing) selBearing.textContent = 'Bearing ' + (String(Math.round(b)).padStart(3, '0'));
    if (selState) selState.textContent = states[index] || '';
    if (selRwy) selRwy.textContent = blip.dataset.rwy || '';
    if (selHdg) selHdg.textContent = blip.dataset.hdg || '';
    if (selDist) selDist.textContent = blip.dataset.dist + ' mi';
    if (selBag) selBag.textContent = blip.dataset.bag || '';
    if (selGo) selGo.setAttribute('href', targets[index]);
  }

  function open(index) {
    current = index;
    for (var i = 0; i < blips.length; i++) {
      var on = i === index;
      blips[i].classList.toggle('is-on', on);
      blips[i].setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) blips[i].setAttribute('aria-current', 'true');
      else blips[i].removeAttribute('aria-current');
    }
    wedge.classList.add('is-open');
    paint(index);
  }

  function close() {
    if (current < 0) return;
    blips[current].classList.remove('is-on');
    blips[current].setAttribute('aria-expanded', 'false');
    blips[current].removeAttribute('aria-current');
    wedge.classList.remove('is-open');
    current = -1;
  }

  for (const blip of blips) {
    blip.addEventListener('click', function () {
      var index = blips.indexOf(this);
      if (current === index) close();
      else open(index);
    });
    blip.addEventListener('keydown', function (event) {
      var here = blips.indexOf(this);
      var next = null;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': next = here + 1; break;
        case 'ArrowLeft': case 'ArrowUp': next = here - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = blips.length - 1; break;
        case 'Escape': close(); break;
        default: break;
      }
      if (next === null) return;
      event.preventDefault();
      blips[(next + blips.length) % blips.length].focus();
    });
  }

  if (selGo) {
    selGo.addEventListener('click', function () {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  open(0);
})();
