(function () {
  var list = document.getElementById('tablist');
  var node = document.getElementById('node');
  var rail = document.querySelector('.rail');
  var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
  var more = [].slice.call(document.querySelectorAll('.more'));
  var refs = [].slice.call(document.querySelectorAll('.refs__list a'));
  var index = 0;
  var narrow = window.matchMedia('(max-width: 700px)');

  function place() {
    var tab = tabs[index];
    if (!tab) return;
    var vertical = !narrow.matches;
    list.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
    var t = tab.getBoundingClientRect();
    var r = rail.getBoundingClientRect();
    if (vertical) {
      node.style.transform = 'translateY(' + (t.top + t.height / 2 - r.top - 6.5) + 'px)';
    } else {
      node.style.transform = 'translateX(' + (t.left + t.width / 2 - r.left - 12 - 6.5) + 'px)';
    }
  }

  function show(next, moveFocus) {
    if (next < 0) next = tabs.length - 1;
    if (next >= tabs.length) next = 0;
    index = next;
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
      var panel = document.getElementById(tab.getAttribute('aria-controls'));
      if (panel) {
        if (on) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      }
    });
    refs.forEach(function (a) {
      if (a.getAttribute('href') === '#' + tabs[index].getAttribute('aria-controls')) {
        a.setAttribute('aria-current', 'true');
      } else {
        a.removeAttribute('aria-current');
      }
    });
    place();
    if (moveFocus) tabs[index].focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      show(i, false);
    });
    tab.addEventListener('keydown', function (e) {
      var k = e.key;
      var next = -1;
      if (k === 'ArrowDown' || k === 'ArrowRight') next = i + 1;
      else if (k === 'ArrowUp' || k === 'ArrowLeft') next = i - 1;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      show(next, true);
    });
  });

  refs.forEach(function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('href').slice(1);
      tabs.forEach(function (tab, i) {
        if (tab.getAttribute('aria-controls') === id) show(i, false);
      });
    });
  });

  more.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    more.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true') {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  window.addEventListener('resize', place);
  show(0, false);
})();
