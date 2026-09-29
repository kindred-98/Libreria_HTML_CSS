(function () {
  var nav = document.querySelector('[data-organism]');
  if (!nav) { return; }

  var links = Array.prototype.slice.call(nav.querySelectorAll('.pad a[href^="#"]'));
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
  var current = -1;
  var queued = false;

  function drop(link) {
    link.removeAttribute('data-press');
    void link.offsetWidth;
    link.setAttribute('data-press', '');
    window.setTimeout(function () { link.removeAttribute('data-press'); }, 2200);
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

  function apply(index, pressed) {
    if (index < 0) { return; }
    var changed = index !== current;
    current = index;
    for (var i = 0; i < links.length; i++) {
      if (i === index) { links[i].setAttribute('aria-current', 'true'); }
      else { links[i].removeAttribute('aria-current'); }
      if (i <= index) { links[i].setAttribute('data-reached', ''); }
      else { links[i].removeAttribute('data-reached'); }
    }
    nav.style.setProperty('--pos', String(index));
    nav.setAttribute('data-at', String(index + 1));
    var text = 'Spot ' + (index + 1) + ' of ' + links.length + ' · ' + names[index];
    for (var r = 0; r < readouts.length; r++) { readouts[r].textContent = text; }
    if (changed || pressed) { drop(links[index]); }
  }

  function onScroll() {
    if (queued) { return; }
    queued = true;
    window.requestAnimationFrame(measure);
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function () { apply(i, true); });
    a.addEventListener('focus', function () { apply(i, false); });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  apply(0, false);
  measure();
})();
