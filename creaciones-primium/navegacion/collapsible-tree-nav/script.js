(function () {
  var KEY = 'ferrocarriles-norte-arbol-v1';
  var tree = document.getElementById('tree');
  var nodes = Array.prototype.slice.call(tree.querySelectorAll('.node'));
  var leaves = Array.prototype.slice.call(tree.querySelectorAll('.leaf'));
  var filt = document.getElementById('filt');
  var filtX = document.getElementById('filtX');
  var stat = document.getElementById('stat');
  var empty = document.getElementById('empty');
  var mob = document.getElementById('mob');
  var mobN = document.getElementById('mobN');

  function read() {
    try {
      return window.localStorage.getItem(KEY);
    } catch (e) {
      return null;
    }
  }

  function write(value) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch (e) {
      return;
    }
  }

  function setOpen(node, open) {
    var btn = node.querySelector(':scope > .tw');
    var sub = node.querySelector(':scope > .sub');
    if (!btn || !sub) return;
    node.classList.toggle('is-closed', !open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function isOpen(node) {
    var btn = node.querySelector(':scope > .tw');
    return btn ? btn.getAttribute('aria-expanded') === 'true' : false;
  }

  function save() {
    var open = nodes.filter(isOpen).map(function (n) {
      return n.querySelector(':scope > .tw').getAttribute('aria-controls');
    });
    write(JSON.stringify(open));
  }

  nodes.forEach(function (node) {
    var btn = node.querySelector(':scope > .tw');
    btn.addEventListener('click', function () {
      setOpen(node, !isOpen(node));
      save();
    });
  });

  var stored = read();
  if (stored) {
    try {
      var list = JSON.parse(stored);
      nodes.forEach(function (node) {
        var id = node.querySelector(':scope > .tw').getAttribute('aria-controls');
        setOpen(node, list.includes(id));
      });
    } catch (e) {
      nodes.forEach(function (node) { setOpen(node, node.parentElement === tree); });
    }
  } else {
    nodes.forEach(function (node) { setOpen(node, node.parentElement === tree); });
  }

  document.getElementById('openAll').addEventListener('click', function () {
    nodes.forEach(function (node) { setOpen(node, true); });
    save();
  });

  document.getElementById('closeAll').addEventListener('click', function () {
    nodes.forEach(function (node) { setOpen(node, node.parentElement === tree); });
    save();
  });

  function countIn(node) {
    var total = 0;
    var subs = Array.prototype.slice.call(node.querySelectorAll('.leaf'));
    subs.forEach(function (leaf) {
      if (!leaf.classList.contains('is-off')) total++;
    });
    return total;
  }

  function recount() {
    nodes.forEach(function (node) {
      var badge = node.querySelector(':scope > .tw > .tw__c');
      var n = countIn(node);
      if (badge.textContent !== String(n)) {
        badge.textContent = String(n);
        badge.classList.remove('bump');
        badge.getBoundingClientRect();
        badge.classList.add('bump');
        window.setTimeout(function () { badge.classList.remove('bump'); }, 380);
      }
      node.classList.toggle('is-dim', n === 0 && filt.value.trim().length > 0);
    });
    var shown = leaves.filter(function (l) { return !l.classList.contains('is-off'); }).length;
    stat.textContent = shown + ' documentos visibles · ' + tree.querySelectorAll('.node').length + ' carpetas';
    empty.hidden = shown !== 0 || filt.value.trim().length === 0;
    mobN.textContent = shown + ' documentos visibles';
  }

  filt.addEventListener('input', function () {
    var q = filt.value.trim().toLowerCase();
    filtX.hidden = !q;
    leaves.forEach(function (leaf) {
      var hit = !q || leaf.textContent.toLowerCase().includes(q);
      leaf.classList.toggle('is-off', !hit);
    });
    recount();
  });

  filtX.addEventListener('click', function () {
    filt.value = '';
    filtX.hidden = true;
    filt.dispatchEvent(new Event('input'));
    filt.focus();
  });

  function rows() {
    var out = [];
    Array.prototype.slice.call(tree.querySelectorAll('.tw, .leaf')).forEach(function (el) {
      if (el.classList.contains('is-off')) return;
      var node = el.closest ? el.closest('.node') : null;
      if (el.classList.contains('leaf')) {
        out.push(el);
        return;
      }
      var closed = node && node.classList.contains('is-closed');
      out.push({ el: el, open: el.getAttribute('aria-expanded') === 'true', closed: !!closed });
    });
    return out;
  }

  tree.addEventListener('keydown', function (e) {
    var list = rows();
    var here = null;
    list.forEach(function (row, i) {
      var el = row.el ? row.el : row;
      if (el === document.activeElement) here = i;
    });
    if (here === null) return;
    var row = list[here];
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      var n = list[here + 1];
      if (n) (n.el ? n.el : n).focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      var p = list[here - 1];
      if (p) (p.el ? p.el : p).focus();
    } else if (e.key === 'ArrowRight' && row.el) {
      e.preventDefault();
      if (row.closed) {
        var node = row.el.closest('.node');
        setOpen(node, true);
        save();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (row.el && !row.closed) {
        setOpen(row.el.closest('.node'), false);
        save();
      } else {
        var owner = document.activeElement.closest('.node');
        var parent = owner ? owner.parentElement.closest('.node') : null;
        if (parent) parent.querySelector(':scope > .tw').focus();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      var f = list[0];
      if (f) (f.el ? f.el : f).focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      var l = list[list.length - 1];
      if (l) (l.el ? l.el : l).focus();
    } else if (e.key === 'Escape') {
      var near = document.activeElement.closest('.node');
      if (!near) return;
      e.preventDefault();
      var up = near.parentElement.closest('.node');
      if (up) {
        setOpen(up, false);
        save();
        up.querySelector(':scope > .tw').focus();
      } else {
        setOpen(near, false);
        save();
        near.querySelector(':scope > .tw').focus();
      }
    }
  });

  leaves.forEach(function (leaf) {
    leaf.addEventListener('click', function () {
      leaves.forEach(function (l) { l.removeAttribute('aria-current'); });
      leaf.setAttribute('aria-current', 'true');
    });
  });

  mob.addEventListener('click', function () {
    var open = mob.getAttribute('aria-expanded') === 'true';
    mob.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (mob.getAttribute('aria-expanded') === 'true') {
      mob.setAttribute('aria-expanded', 'false');
      mob.focus();
    }
  });

  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target?.classList && target.classList.contains('leaf')) {
      target.setAttribute('aria-current', 'true');
      var branch = target.closest('.sub');
      while (branch) {
        var host = branch.parentElement;
        if (host && host.classList.contains('node')) setOpen(host, true);
        branch = host ? host.parentElement.closest('.sub') : null;
      }
      save();
    }
  }

  recount();
})();
