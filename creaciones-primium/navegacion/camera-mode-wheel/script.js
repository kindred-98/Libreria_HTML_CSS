(function () {
  var wheel = document.getElementById('wheel');
  if (!wheel) return;

  var sectors = Array.prototype.slice.call(wheel.querySelectorAll('.sector'));
  var indexMark = document.getElementById('index');
  var expMode = document.getElementById('expMode');
  var expShutter = document.getElementById('expShutter');
  var expAperture = document.getElementById('expAperture');
  var expNote = document.getElementById('expNote');
  var meterSet = document.getElementById('meterSet');
  var data = [
    { name: 'Program', shutter: '1/250', aperture: 'f/5.6', set: 58,
      note: 'The camera measures and picks both. Useful until the light gets worse than the program expects.' },
    { name: 'Aperture priority', shutter: '1/125', aperture: 'f/4', set: 66,
      note: 'You choose the depth of field and the camera finds a matching shutter speed. The usual first step out of program.' },
    { name: 'Shutter priority', shutter: '1/500', aperture: 'f/2.8', set: 50,
      note: 'You choose how motion is drawn and the camera finds the aperture. Watch for slow speeds on a fifty millimetre.' },
    { name: 'Manual', shutter: '1/125', aperture: 'f/8', set: 40,
      note: 'Nothing is decided for you. The bright sun rule, f/16 at 1 over ISO, lands here as f/8 and a third of a stop under.' },
    { name: 'Depth of field', shutter: '1/180', aperture: 'f/8', set: 40,
      note: 'A step back matters more than a stop of aperture. This is the mode for a family group at f/5.6.' },
    { name: 'Night', shutter: '30 sec', aperture: 'f/2.8', set: 74,
      note: 'Tripod, thirty seconds, and bracket the frame. Push the film and choose the print in the darkroom.' }
  ];
  var current = 0;

  function setMark(percent) {
    if (!meterSet) return;
    var track = meterSet.parentNode.clientWidth - 8;
    meterSet.style.setProperty('--sx', Math.max(0, (percent / 100) * track).toFixed(1) + 'px');
  }

  function apply(n, spin) {
    var i = (n + sectors.length) % sectors.length;
    current = i;
    wheel.style.setProperty('--deg', (-i * 60) + 'deg');
    for (var k = 0; k < sectors.length; k++) {
      sectors[k].setAttribute('aria-pressed', k === i ? 'true' : 'false');
    }
    if (expMode) expMode.textContent = data[i].name;
    if (expShutter) expShutter.textContent = data[i].shutter;
    if (expAperture) expAperture.textContent = data[i].aperture;
    if (expNote) expNote.textContent = data[i].note;
    setMark(data[i].set);
    if (indexMark && spin) {
      indexMark.classList.remove('is-set');
      void indexMark.offsetWidth;
      indexMark.classList.add('is-set');
    }
  }

  window.addEventListener('resize', function () {
    setMark(data[current].set);
  });

  for (var i = 0; i < sectors.length; i++) {
    sectors[i].addEventListener('click', function () {
      apply(sectors.indexOf(this), true);
    });
    sectors[i].addEventListener('keydown', function (event) {
      var here = sectors.indexOf(this);
      var next = null;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowUp': next = here + 1; break;
        case 'ArrowLeft': case 'ArrowDown': next = here - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = sectors.length - 1; break;
        default: next = null;
      }
      if (next === null) return;
      event.preventDefault();
      var target = (next + sectors.length) % sectors.length;
      apply(target, true);
      sectors[target].focus();
    });
  }

  apply(0, false);
})();
