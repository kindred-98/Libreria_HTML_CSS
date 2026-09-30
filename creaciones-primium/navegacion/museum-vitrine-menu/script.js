(function () {
  'use strict';

  var dialog = document.getElementById('plan');
  var openers = Array.prototype.slice.call(document.querySelectorAll('[aria-controls="plan"]'));
  var closers = Array.prototype.slice.call(dialog.querySelectorAll('.plan-dialog__close'));
  var lastFocused = null;

  function isOpen() {
    return !dialog.hidden;
  }

  function setOpen(open) {
    dialog.hidden = !open;
    openers.forEach(function (btn) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  function openPlan() {
    lastFocused = document.activeElement;
    setOpen(true);
    var close = document.getElementById('planClose');
    if (close) close.focus();
  }

  function closePlan() {
    setOpen(false);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    lastFocused = null;
  }

  openers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (isOpen()) closePlan();
      else openPlan();
    });
  });
  closers.forEach(function (btn) {
    btn.addEventListener('click', closePlan);
  });

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) closePlan();
  });

  document.addEventListener('keydown', function (event) {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePlan();
      return;
    }
    if (event.key !== 'Tab') return;
    var focusables = dialog.querySelectorAll('a[href], button:not([disabled])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var header = document.querySelector('.top');
  window.addEventListener('scroll', function () {
    if (header) header.classList.toggle('is-compact', window.scrollY > 40);
  }, { passive: true });

  var pieceLinks = Array.prototype.slice.call(document.querySelectorAll('.piece'));
  var jumpLinks = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var seen = {};
  var sections = pieceLinks
    .concat(jumpLinks)
    .map(function (link) {
      return link.getAttribute('href');
    })
    .filter(function (href) {
      if (!href || href.charAt(0) !== '#' || seen[href]) return false;
      seen[href] = true;
      return true;
    })
    .map(function (href) {
      return document.querySelector(href);
    })
    .filter(Boolean)
    .sort(function (a, b) {
      return a.offsetTop - b.offsetTop;
    });

  function setCurrent(list, id) {
    list.forEach(function (link) {
      var match = link.getAttribute('href') === '#' + id;
      link.classList.toggle('is-active', match);
      if (match) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function spy() {
    if (isOpen()) return;
    var line = window.scrollY + window.innerHeight * 0.3;
    var current = sections[0] ? sections[0].id : null;
    sections.forEach(function (section) {
      if (section.offsetTop <= line) current = section.id;
    });
    if (current) {
      setCurrent(pieceLinks, current);
      setCurrent(jumpLinks, current);
    }
  }

  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();
})();
