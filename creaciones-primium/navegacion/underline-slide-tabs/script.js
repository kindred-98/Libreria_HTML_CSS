(function () {
  var rail = document.getElementById('rail');
  var underline = document.getElementById('underline');
  if (!rail || !underline) return;

  var tabs = Array.prototype.slice.call(rail.querySelectorAll('[role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('[role="tabpanel"]'));
  var goto = Array.prototype.slice.call(document.querySelectorAll('[data-goto]'));
  var current = 0;

  function place(tab) {
    var box = tab.getBoundingClientRect();
    var base = rail.getBoundingClientRect();
    underline.style.width = box.width - 14 + 'px';
    underline.style.transform = 'translate3d(' + (box.left - base.left + 7) + 'px,0,0)';
  }

  function select(index, focus) {
    if (index < 0 || index >= tabs.length) return;
    current = index;
    for (var i = 0; i < tabs.length; i++) {
      var on = i === index;
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].tabIndex = on ? 0 : -1;
      panels[i].hidden = !on;
      if (on) place(tabs[i]);
    }
    if (focus) tabs[index].focus();
  }

  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function () {
      select(tabs.indexOf(this), false);
    });
    tabs[i].addEventListener('keydown', function (event) {
      var here = tabs.indexOf(this);
      var next = null;
      switch (event.key) {
        case 'ArrowRight': next = here + 1; break;
        case 'ArrowLeft': next = here - 1; break;
        case 'Home': next = 0; break;
        case 'End': next = tabs.length - 1; break;
        case 'ArrowDown': next = here + 1; break;
        case 'ArrowUp': next = here - 1; break;
        default: next = null;
      }
      if (next === null) return;
      event.preventDefault();
      select((next + tabs.length) % tabs.length, true);
      place(tabs[(next + tabs.length) % tabs.length]);
    });
  }

  for (var g = 0; g < goto.length; g++) {
    goto[g].addEventListener('click', function (event) {
      var id = this.getAttribute('data-goto');
      var index = tabs.map(function (t) { return t.id; }).indexOf(id);
      if (index < 0) return;
      event.preventDefault();
      select(index, true);
      var panel = panels[index];
      var top = panel.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
      panel.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', this.getAttribute('href'));
    });
  }

  rail.addEventListener('scroll', function () {
    place(tabs[current]);
  }, { passive: true });

  window.addEventListener('resize', function () {
    place(tabs[current]);
  });

  window.addEventListener('load', function () {
    place(tabs[current]);
  });

  select(0, false);
})();
