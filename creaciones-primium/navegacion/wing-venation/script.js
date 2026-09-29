(function () {
  var nav = document.querySelector('[data-organism]');
  if (!nav) { return; }

  var links = Array.prototype.slice.call(nav.querySelectorAll('.vein a[href^="#"]'));
  var sections = [];
  var names = [];

  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (!target) { return; }
    a.setAttribute('aria-controls', id);
    sections.push(target);
    names.push(a.getAttribute('data-name') || a.textContent.trim());
  });

  if (!sections.length) { return; }

  var readouts = Array.prototype.slice.call(nav.querySelectorAll('[data-readout]'));
  var toggle = nav.querySelector('.wings__bar');
  var current = -1;
  var queued = false;

  function setOpen(open) {
    nav.setAttribute('data-open', open ? 'true' : 'false');
    if (toggle) { toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  }

  function measure() {
    queued = false;
    var line = window.innerHeight * 0.45;
    var found = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) { found = i; }
    }
    apply(found);
  }

  function apply(index) {
    if (index < 0) { return; }
    if (index !== current) {
      current = index;
      for (var i = 0; i < links.length; i++) {
        if (i === index) { links[i].setAttribute('aria-current', 'true'); }
        else { links[i].removeAttribute('aria-current'); }
        if (i <= index) { links[i].setAttribute('data-drawn', ''); }
        else { links[i].removeAttribute('data-drawn'); }
      }
      nav.style.setProperty('--pos', String(index));
      nav.setAttribute('data-at', String(index + 1));
      var text = 'Vein ' + (index + 1) + ' of ' + links.length + ' · ' + names[index];
      for (var r = 0; r < readouts.length; r++) { readouts[r].textContent = text; }
    }
  }

  function onScroll() {
    if (queued) { return; }
    queued = true;
    window.requestAnimationFrame(measure);
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function () { apply(i); });
  });

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(nav.getAttribute('data-open') !== 'true');
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') { return; }
    if (nav.getAttribute('data-open') === 'false') { return; }
    setOpen(false);
    if (toggle) { toggle.focus(); }
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  setOpen(window.innerWidth > 900);
  apply(0);
  measure();
})();
