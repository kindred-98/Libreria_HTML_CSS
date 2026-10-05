(function () {
  var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-mega]'));
  if (!buttons.length) return;
  var panels = Array.prototype.slice.call(document.querySelectorAll('.mega'));
  var openId = '';

  function linksOf(panel) {
    return Array.prototype.slice.call(panel.querySelectorAll('a[href^="#"]'));
  }

  function close(returnFocus) {
    if (!openId) return;
    var button = document.getElementById(openId.replaceAll('mega-', 'cat-'));
    var panel = document.getElementById(openId);
    if (panel) panel.hidden = true;
    if (button) button.setAttribute('aria-expanded', 'false');
    openId = '';
    if (returnFocus && button) button.focus();
  }

  function open(id, focusFirst) {
    close(false);
    var panel = document.getElementById(id);
    if (!panel) return;
    var button = null;
    for (const candidate of buttons) {
      if (candidate.dataset.mega === id) button = candidate;
    }
    openId = id;
    panel.hidden = false;
    if (button) {
      button.setAttribute('aria-expanded', 'true');
      if (focusFirst) button.focus();
    }
  }

  for (const btn of buttons) {
    btn.addEventListener('click', function () {
      var id = this.dataset.mega;
      if (openId === id) close(true);
      else open(id, false);
    });
    btn.addEventListener('keydown', function (event) {
      var id = this.dataset.mega;
      var panel = document.getElementById(id);
      var list = panel ? linksOf(panel) : [];
      var here = buttons.indexOf(this);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        open(id, true);
        if (list.length) list[0].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        open(id, true);
        if (list.length) list[list.length - 1].focus();
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        var next = event.key === 'ArrowRight' ? here + 1 : here - 1;
        next = (next + buttons.length) % buttons.length;
        buttons[next].focus();
      } else if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault();
        buttons[event.key === 'Home' ? 0 : buttons.length - 1].focus();
      } else if (event.key === 'Escape' && openId) {
        event.preventDefault();
        close(true);
      }
    });
  }

  for (const panel of panels) {
    panel.addEventListener('keydown', function (event) {
      var list = linksOf(this);
      var here = list.indexOf(document.activeElement);
      if (here < 0) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        list[(here + 1) % list.length].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        list[(here - 1 + list.length) % list.length].focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        list[0].focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        list[list.length - 1].focus();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      } else if (event.key === 'Tab') {
        close(false);
      }
    });
  }

  document.addEventListener('click', function (event) {
    if (!openId) return;
    var panel = document.getElementById(openId);
    if (panel.contains(event.target)) return;
    for (const btn of buttons) {
      if (btn.contains(event.target)) return;
    }
    close(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && openId) close(true);
  });

  document.addEventListener('focusin', function (event) {
    if (!openId) return;
    var panel = document.getElementById(openId);
    if (panel.contains(event.target)) return;
    for (const btn of buttons) {
      if (btn.contains(event.target)) return;
    }
    close(false);
  });
})();
