(function () {
  var list = document.getElementById('tabs');
  var rule = document.getElementById('rule');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (tab) {
    return document.getElementById(tab.getAttribute('aria-controls'));
  });
  var pending = false;

  function isRow() {
    return window.matchMedia('(max-width: 900px)').matches;
  }

  function activeIndex() {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('aria-selected') === 'true') return i;
    }
    return 0;
  }

  function place() {
    var tab = tabs[activeIndex()];
    if (!tab) return;
    if (isRow()) {
      list.setAttribute('aria-orientation', 'horizontal');
      rule.style.width = tab.offsetWidth + 'px';
      rule.style.height = '2px';
      rule.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
      rule.style.setProperty('--rw', tab.offsetWidth + 'px');
    } else {
      list.setAttribute('aria-orientation', 'vertical');
      rule.style.width = '2px';
      rule.style.height = tab.offsetHeight + 'px';
      rule.style.transform = 'translateY(' + tab.offsetTop + 'px)';
      rule.style.setProperty('--rh', tab.offsetHeight + 'px');
    }
  }

  function schedule() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      place();
    });
  }

  function select(index, moveFocus) {
    if (index < 0 || index >= tabs.length) return;
    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
      tab.tabIndex = on ? 0 : -1;
      var panel = panels[i];
      if (!panel) return;
      panel.hidden = !on;
      panel.classList.remove('is-in');
      if (on) {
        void panel.offsetWidth;
        panel.classList.add('is-in');
      }
    });
    if (moveFocus) tabs[index].focus();
    schedule();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      select(i, false);
    });
    tab.addEventListener('focus', function () {
      if (tab.getAttribute('aria-selected') !== 'true') select(i, false);
    });
  });

  list.addEventListener('keydown', function (e) {
    var i = activeIndex();
    var next = -1;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next > -1) {
      e.preventDefault();
      select(next, true);
    }
  });

  window.addEventListener('resize', schedule);
  window.addEventListener('load', schedule);
  select(activeIndex(), false);
  place();
})();
