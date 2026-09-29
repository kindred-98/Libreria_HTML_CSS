(function () {
  var nav = document.querySelector('[data-organism]');
  if (!nav) { return; }

  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
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

  var readout = nav.querySelector('[data-readout]');
  var current = -1;
  var queued = false;

  function measure() {
    queued = false;
    var line = window.innerHeight * 0.38;
    var found = 0;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= line) { found = i; }
    }
    apply(found);
  }

  function apply(index) {
    if (index === current || index < 0) { return; }
    current = index;
    for (var i = 0; i < links.length; i++) {
      if (i === index) { links[i].setAttribute('aria-current', 'true'); }
      else { links[i].removeAttribute('aria-current'); }
      if (i <= index) { links[i].setAttribute('data-reached', ''); }
      else { links[i].removeAttribute('data-reached'); }
    }
    nav.style.setProperty('--pos', String(index));
    nav.setAttribute('data-at', String(index + 1));
    if (readout) {
      readout.textContent = 'Chapter ' + (index + 1) + ' of ' + links.length + ' · ' + names[index];
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

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', onScroll);

  apply(0);
  measure();
})();
