(function () {
  var tree = document.getElementById('tree');
  var panel = document.getElementById('treePanel');
  var treeBtn = document.getElementById('treeBtn');
  var expandAll = document.getElementById('expandAll');
  var collapseAll = document.getElementById('collapseAll');
  var syncAgo = document.getElementById('syncAgo');
  var jumps = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var leaves = Array.prototype.slice.call(tree.querySelectorAll('a.row'));
  var branches = Array.prototype.slice.call(tree.querySelectorAll('.branch'));
  var mq = window.matchMedia('(max-width: 900px)');
  var KEY = 'alder-tree-open';
  var panelOpen = false;
  var pending = false;
  var started = Date.now();

  function child(li, selector) {
    for (const node of li.children) {
      if (node.matches(selector)) return node;
    }
    return null;
  }

  function parentBranch(li) {
    var p = li.parentElement;
    while (p && p !== tree) {
      if (p.classList.contains('branch')) return p;
      p = p.parentElement;
    }
    return null;
  }

  function setBranch(li, open, save) {
    if (!li) return;
    var btn = child(li, 'button');
    var kids = child(li, 'ul');
    if (!btn || !kids) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    kids.hidden = !open;
    li.classList.toggle('is-open', open);
    if (save !== false) persist();
  }

  function persist() {
    try {
      var open = branches.filter(function (li) {
        var btn = child(li, 'button');
        return btn && btn.getAttribute('aria-expanded') === 'true';
      }).map(function (li) {
        var btn = child(li, 'button');
        return btn.dataset.node;
      });
      window.sessionStorage.setItem(KEY, JSON.stringify(open));
    } catch (err) { // NOSONAR (S2486): storage can be unavailable; the tree still works in memory.
      // Se ignora a proposito: dentro del sandbox del catalogo `sessionStorage`
      // puede lanzar (origen opaco o modo privado) y perder el estado guardado
      // no rompe el arbol, solo se reabre desde cero.
      return;
    }
  }

  function restore() {
    try {
      var raw = window.sessionStorage.getItem(KEY);
      if (!raw) return;
      var open = JSON.parse(raw);
      if (!Array.isArray(open)) return;
      branches.forEach(function (li) {
        var btn = child(li, 'button');
        if (!btn) return;
        var node = btn.dataset.node;
        if (open.includes(node)) setBranch(li, true, false);
        else setBranch(li, false, false);
      });
    } catch (err) { // NOSONAR (S2486): no readable saved state is equivalent to a fresh load.
      // Se ignora a proposito: el `sessionStorage` puede lanzar al leerlo
      // (origen opaco) y sin estado guardado el arbol se muestra entero.
      return;
    }
  }

  function visibleRows() {
    return Array.prototype.slice.call(tree.querySelectorAll('.row')).filter(function (row) {
      var p = row;
      while (p && p !== tree) {
        if (p.hidden) return false;
        p = p.parentElement;
      }
      return true;
    });
  }

  tree.addEventListener('click', function (e) {
    var row = e.target.closest ? e.target.closest('.row') : null;
    if (!row || !tree.contains(row)) return;
    var li = row.parentElement;
    if (!li) return;
    if (row.tagName === 'BUTTON') {
      var kids = child(li, 'ul');
      setBranch(li, kids ? kids.hidden : false);
    } else if (mq.matches && panelOpen) {
      panelOpen = false;
      syncPanel();
    }
  });

  tree.addEventListener('keydown', function (e) {
    var row = document.activeElement;
    if (!row || !row.classList || !row.classList.contains('row')) return;
    var list = visibleRows();
    var i = list.indexOf(row);
    var li = row.parentElement;
    var isBranch = li && li.classList.contains('branch');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (list[i + 1]) list[i + 1].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (list[i - 1]) list[i - 1].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (list[0]) list[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      if (list.length) list[list.length - 1].focus();
    } else if (e.key === 'ArrowRight' && isBranch) {
      e.preventDefault();
      var kids = child(li, 'ul');
      if (kids?.hidden) setBranch(li, true);
      else if (kids) {
        var first = kids.querySelector('.row');
        if (first) first.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isBranch) {
        var open = child(li, 'ul');
        if (open && !open.hidden) setBranch(li, false);
        else {
          var up = parentBranch(li);
          if (up) {
            var upRow = child(up, 'button');
            if (upRow) upRow.focus();
          }
        }
      } else {
        var owner = parentBranch(li);
        if (owner) {
          var ownerRow = child(owner, 'button');
          if (ownerRow) ownerRow.focus();
        }
      }
    }
  });

  expandAll.addEventListener('click', function () {
    branches.forEach(function (li) { setBranch(li, true, false); });
    persist();
  });

  collapseAll.addEventListener('click', function () {
    branches.forEach(function (li) { setBranch(li, false, false); });
    persist();
  });

  function syncPanel() {
    if (mq.matches) panel.classList.toggle('is-open', panelOpen);
    else panel.classList.remove('is-open');
    treeBtn.setAttribute('aria-expanded', mq.matches && panelOpen ? 'true' : 'false');
  }

  treeBtn.addEventListener('click', function () {
    panelOpen = !panelOpen;
    syncPanel();
    if (panelOpen) {
      var first = tree.querySelector('.row');
      if (first) first.focus();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || !mq.matches || !panelOpen) return;
    panelOpen = false;
    syncPanel();
    treeBtn.focus();
  });

  mq.addEventListener('change', function () { panelOpen = false; syncPanel(); });

  function spy() {
    pending = false;
    var current = '';
    leaves.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 200) current = id;
    });
    leaves.forEach(function (a) {
      if (current && a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    jumps.forEach(function (a) {
      if (current && a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }, { passive: true });

  function tick() {
    var secs = Math.floor((Date.now() - started) / 1000);
    if (secs < 5) syncAgo.textContent = 'just now';
    else if (secs < 60) syncAgo.textContent = secs + ' s ago';
    else syncAgo.textContent = Math.floor(secs / 60) + ' min ago';
  }

  restore();
  syncPanel();
  spy();
  tick();
  window.setInterval(tick, 5000);
})();
