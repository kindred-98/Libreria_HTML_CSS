(function () {
  var ring = document.querySelector('.ring');
  var hub = document.querySelector('.hub');
  if (!ring || !hub) return;

  var orbs = Array.prototype.slice.call(ring.querySelectorAll('.orb'));
  var phaseName = document.getElementById('phaseName');
  var elAlt = document.getElementById('elAlt');
  var elInc = document.getElementById('elInc');
  var elVel = document.getElementById('elVel');
  var elMet = document.getElementById('elMet');
  var dialHand = document.getElementById('dialHand');
  var hubState = document.getElementById('hubState');
  var angles = [-42, -18, 8, 26, 48, 66];
  var mets = ['T minus 00:04:12', 'T plus 00:02:10', 'T plus 00:09:26', 'Day 1 · 06:00',
    'Day 3 · 11:40', 'Day 9 · 04:12'];
  var states = ['Orbit nominal', 'Ascent in progress', 'Insertion confirmed',
    'Trim burn scheduled', 'Coast, two burns set', 'Corridor locked'];
  var current = -1;

  function select(index) {
    if (index < 0 || index >= orbs.length) return;
    current = index;
    for (var i = 0; i < orbs.length; i++) {
      var on = i === index;
      orbs[i].classList.toggle('is-on', on);
      if (on) orbs[i].setAttribute('aria-current', 'true');
      else orbs[i].removeAttribute('aria-current');
    }
    var a = orbs[index].dataset.alt || '';
    if (phaseName) phaseName.textContent = orbs[index].dataset.phase || '';
    if (elAlt) elAlt.textContent = a;
    if (elInc) elInc.textContent = orbs[index].dataset.inc || '';
    if (elVel) elVel.textContent = orbs[index].dataset.vel || '';
    if (elMet) elMet.textContent = mets[index] || '';
    if (hubState) hubState.textContent = states[index] || 'Orbit nominal';
    if (dialHand) dialHand.style.setProperty('--a', angles[index] + 'deg');
  }

  for (const orb of orbs) {
    orb.addEventListener('click', function () {
      select(orbs.indexOf(this));
    });
    orb.addEventListener('focus', function () {
      select(orbs.indexOf(this));
    });
    orb.addEventListener('keydown', function (event) {
      var here = orbs.indexOf(this);
      var next = null;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': next = here + 1; break;
        case 'ArrowLeft': case 'ArrowUp': next = here - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = orbs.length - 1; break;
        case 'Escape': next = -1; break;
        default: break;
      }
      if (next === null) return;
      event.preventDefault();
      if (next < 0) { hub.focus(); return; }
      orbs[(next + orbs.length) % orbs.length].focus();
    });
  }

  hub.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      orbs[current >= 0 ? current : 0].focus();
    }
  });

  select(0);
})();
