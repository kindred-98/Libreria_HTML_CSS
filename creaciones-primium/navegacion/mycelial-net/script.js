(function () {
  var nav = document.querySelector('[data-organism]');
  if (!nav) { return; }

  var net = nav.querySelector('.net');
  var links = Array.prototype.slice.call(nav.querySelectorAll('.node[href^="#"]'));
  var sections = [];
  var names = [];

  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (!target) { return; }
    a.setAttribute('aria-controls', id);
    sections.push(target);
    names.push(a.textContent.trim());
  });

  if (!sections.length) { return; }

  var readouts = Array.prototype.slice.call(nav.querySelectorAll('[data-readout]'));
  var toggle = nav.querySelector('.card__bar');
  var current = -1;
  var queued = false;

  function setOpen(open) {
    nav.setAttribute('data-open', open ? 'true' : 'false');
    if (toggle) { toggle.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  }

  function measure() {
    queued = false;
    var line = window.innerHeight * 0.42;
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
      }
      nav.style.setProperty('--pos', String(index));
      nav.setAttribute('data-at', String(index + 1));
      var text = 'Node ' + (index + 1) + ' of ' + links.length + ' · ' + names[index];
      for (var r = 0; r < readouts.length; r++) { readouts[r].textContent = text; }
    }
  }

  function onScroll() {
    if (queued) { return; }
    queued = true;
    window.requestAnimationFrame(measure);
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function () {
      apply(i);
      setOpen(false);
    });
    a.addEventListener('pointerenter', function () { nav.setAttribute('data-hot', String(i)); });
    a.addEventListener('pointerleave', function () { nav.removeAttribute('data-hot'); });
    a.addEventListener('focus', function () { nav.setAttribute('data-hot', String(i)); });
    a.addEventListener('blur', function () { nav.removeAttribute('data-hot'); });
  });

  nav.addEventListener('pointerleave', function () { nav.removeAttribute('data-hot'); });

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

  setOpen(false);
  apply(0);
  measure();
})();
