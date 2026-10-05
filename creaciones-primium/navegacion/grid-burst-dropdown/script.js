(function () {
  var trigger = document.getElementById('trigger');
  var dock = document.getElementById('dock');
  var mosaic = document.getElementById('mosaic');
  if (!trigger || !dock || !mosaic) return;

  var topItems = Array.prototype.slice.call(mosaic.querySelectorAll(':scope > a.cell, :scope > .cell > .cell__btn'));
  var subs = Array.prototype.slice.call(mosaic.querySelectorAll('.sub'));
  var open = false;

  function itemsOf(menu) {
    if (menu.id === 'mosaic') return topItems;
    return Array.prototype.slice.call(menu.querySelectorAll(':scope > .sub__item, :scope > .sub__row > .sub__item'));
  }

  function closeOne(sub) {
    if (!sub.classList.contains('is-open')) return;
    sub.classList.remove('is-open');
    sub.hidden = true;
    var owner = document.querySelector('[aria-controls="' + sub.id + '"]');
    if (owner) owner.setAttribute('aria-expanded', 'false');
    var host = sub.parentNode;
    if (host?.classList) {
      var stillOpen = host.querySelector('.sub.is-open');
      if (!stillOpen && host.parentNode && host.parentNode.classList &&
        host.parentNode.classList.contains('cell')) host.parentNode.classList.remove('is-host');
    }
  }

  function closeSubs() {
    for (var i = subs.length - 1; i >= 0; i--) closeOne(subs[i]);
  }

  function ancestors(sub) {
    var chain = [];
    var node = sub.parentNode;
    while (node && node !== document.body) {
      if (node.classList && node.classList.contains('sub')) chain.push(node.id);
      node = node.parentNode;
    }
    return chain;
  }

  function openSub(sub) {
    var keep = ancestors(sub);
    for (const other of subs) {
      if (other === sub) continue;
      if (keep.includes(other.id)) continue;
      closeOne(other);
    }
    sub.hidden = false;
    sub.classList.add('is-open');
    var owner = document.querySelector('[aria-controls="' + sub.id + '"]');
    if (owner) owner.setAttribute('aria-expanded', 'true');
    if (owner?.classList && owner.classList.contains('cell__btn')) {
      owner.parentNode.classList.add('is-host');
    }
  }

  function focusIn(menu, index) {
    var list = itemsOf(menu);
    if (!list.length) return;
    var i = (index + list.length) % list.length;
    list[i].focus();
  }

  function openMenu(focusFirst) {
    if (open) return;
    open = true;
    dock.hidden = false;
    mosaic.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    if (focusFirst) {
      window.setTimeout(function () { focusIn(mosaic, 0); }, 0);
    }
  }

  function closeMenu(returnFocus) {
    if (!open) return;
    open = false;
    closeSubs();
    dock.hidden = true;
    mosaic.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  trigger.addEventListener('click', function () {
    if (open) closeMenu(true); else openMenu(false);
  });

  trigger.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu(true);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu(true);
      window.setTimeout(function () { focusIn(mosaic, topItems.length - 1); }, 0);
    } else if (event.key === 'Escape') {
      closeMenu(false);
    }
  });

  for (const item of topItems) {
    var tag = item.tagName.toLowerCase();
    if (tag === 'a') {
      item.addEventListener('click', function () { closeMenu(false); });
    } else {
      item.addEventListener('click', function () {
        var sub = document.getElementById(this.getAttribute('aria-controls'));
        if (!sub) return;
        if (sub.classList.contains('is-open')) closeOne(sub);
        else openSub(sub);
      });
      item.addEventListener('pointerenter', function () {
        var sub = document.getElementById(this.getAttribute('aria-controls'));
        if (sub) openSub(sub);
      });
    }
    item.addEventListener('keydown', function (event) {
      var list = itemsOf(event.currentTarget.closest('[role="menu"]'));
      var here = list.indexOf(event.currentTarget);
      var handled = true;
      switch (event.key) {
        case 'ArrowDown': focusIn(event.currentTarget.closest('[role="menu"]'), here + 1); break;
        case 'ArrowUp': focusIn(event.currentTarget.closest('[role="menu"]'), here - 1); break;
        case 'Home': focusIn(event.currentTarget.closest('[role="menu"]'), 0); break;
        case 'End': focusIn(event.currentTarget.closest('[role="menu"]'), list.length - 1); break;
        case 'Escape':
          var sub = event.currentTarget.closest('.sub');
          if (sub) {
            var owner = document.querySelector('[aria-controls="' + sub.id + '"]');
            closeOne(sub);
            if (owner) owner.focus();
          } else {
            closeMenu(true);
          }
          break;
        case 'Tab':
          closeMenu(false);
          handled = false;
          break;
        default:
          handled = false;
      }
      if (handled) event.preventDefault();
    });
  }

  var subOwners = Array.prototype.slice.call(mosaic.querySelectorAll('.sub [aria-controls^="sub-"]'));
  for (const owner of subOwners) {
    owner.addEventListener('click', function () {
      var target = document.getElementById(this.getAttribute('aria-controls'));
      if (!target) return;
      if (target.classList.contains('is-open')) closeOne(target);
      else openSub(target);
    });
    owner.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
        var sub = document.getElementById(this.getAttribute('aria-controls'));
        if (!sub) return;
        event.preventDefault();
        openSub(sub);
        focusIn(sub, 0);
      } else if (event.key === 'ArrowLeft' || event.key === 'Escape') {
        event.preventDefault();
        var parent = this.closest('.sub');
        var owner = document.querySelector('[aria-controls="' + (parent ? parent.id : 'mosaic') + '"]');
        if (parent) {
          closeOne(parent);
          if (owner) owner.focus();
        } else {
          closeMenu(true);
        }
      }
    });
  }

  document.addEventListener('click', function (event) {
    if (!open) return;
    if (mosaic.contains(event.target) || trigger.contains(event.target)) return;
    closeMenu(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && open) closeMenu(true);
  });

  window.addEventListener('resize', function () {
    if (open) closeSubs();
  });
})();
