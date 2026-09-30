(function () {
  var desk = document.getElementById("desk");
  var trigger = document.getElementById("ctxTrigger");
  var menu = document.getElementById("ctxMenu");
  var dds = [];
  var all = document.querySelectorAll(".dd");
  var subs = document.querySelectorAll(".sub");
  var cards = document.querySelectorAll(".card");
  var rootList = menu.querySelectorAll(":scope > .ctx__i, :scope > .ctx__grp > .ctx__i");
  var open = false;
  var backFocus = null;
  var cursor = -1;
  var frames = 12 * 24 + 4;
  var last = 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = "0" + s;
    return s;
  }

  for (var i = 0; i < all.length; i++) {
    if (all[i].querySelector(".dd__btn")) dds.push(all[i]);
  }

  function closeSub(sub) {
    sub.classList.remove("is-open");
    var b = sub.querySelector(".sub__btn");
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function closeDd(dd, back) {
    dd.classList.remove("is-open");
    dd.classList.remove("is-pinned");
    var b = dd.querySelector(".dd__btn");
    if (b) b.setAttribute("aria-expanded", "false");
    var inner = dd.querySelectorAll(".sub");
    for (var k = 0; k < inner.length; k++) closeSub(inner[k]);
    if (back && b) b.focus();
  }

  function closeAllDds(except) {
    for (var k = 0; k < dds.length; k++) {
      if (dds[k] !== except) closeDd(dds[k], false);
    }
  }

  function openDd(dd) {
    closeAllDds(dd);
    dd.classList.add("is-open");
    var b = dd.querySelector(".dd__btn");
    if (b) b.setAttribute("aria-expanded", "true");
  }

  for (i = 0; i < dds.length; i++) {
    (function (dd) {
      var btn = dd.querySelector(".dd__btn");
      var links = dd.querySelectorAll(".dd__panel a");

      btn.addEventListener("click", function () {
        if (dd.classList.contains("is-pinned") && dd.classList.contains("is-open")) closeDd(dd, false);
        else {
          openDd(dd);
          dd.classList.add("is-pinned");
        }
      });
      dd.addEventListener("mouseenter", function () { openDd(dd); });
      dd.addEventListener("mouseleave", function () {
        if (!dd.classList.contains("is-pinned")) closeDd(dd, false);
      });
      dd.addEventListener("focusin", function () { openDd(dd); });
      dd.addEventListener("focusout", function (e) {
        if (!dd.contains(e.relatedTarget)) closeDd(dd, false);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          openDd(dd);
          dd.classList.add("is-pinned");
          if (links.length) links[e.key === "ArrowDown" ? 0 : links.length - 1].focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeDd(dd, true);
        }
      });
      dd.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); closeDd(dd, true); }
      });
    })(dds[i]);
  }

  for (i = 0; i < subs.length; i++) {
    (function (sub) {
      var sbtn = sub.querySelector(".sub__btn");
      if (!sbtn) return;
      function sync() {
        var on = sub.className.indexOf("is-open") > -1 || sub.contains(document.activeElement);
        sbtn.setAttribute("aria-expanded", on ? "true" : "false");
      }
      sub.addEventListener("mouseenter", sync);
      sub.addEventListener("mouseleave", sync);
      sub.addEventListener("focusin", sync);
      sub.addEventListener("focusout", sync);
      sbtn.addEventListener("click", function () {
        sub.classList.toggle("is-open");
        sync();
      });
    })(subs[i]);
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dd")) closeAllDds(null);
  });

  function levelItems(scope) {
    var out = [];
    var kids = scope.children;
    for (var k = 0; k < kids.length; k++) {
      if (kids[k].classList.contains("ctx__i")) out.push(kids[k]);
      if (kids[k].classList.contains("ctx__grp")) {
        var inner = kids[k].querySelector(".ctx__i");
        if (inner) out.push(inner);
      }
    }
    return out;
  }

  function setCursor(list, i) {
    for (var k = 0; k < list.length; k++) list[k].setAttribute("tabindex", k === i ? "0" : "-1");
    cursor = i;
    if (i >= 0) list[i].focus();
  }

  function closeCtxGrp(grp) {
    grp.classList.remove("is-open");
    var b = grp.querySelector(".ctx__i");
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function paintTabs() {
    var list = levelItems(menu);
    for (var k = 0; k < list.length; k++) {
      if (list[k].parentNode.classList.contains("ctx__grp")) continue;
      list[k].setAttribute("tabindex", k === cursor ? "0" : "-1");
    }
  }

  function closeMenu(restore) {
    if (!open) return;
    open = false;
    menu.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
    var grps = menu.querySelectorAll(".ctx__grp");
    for (var k = 0; k < grps.length; k++) closeCtxGrp(grps[k]);
    var list = levelItems(menu);
    for (var j = 0; j < list.length; j++) list[j].setAttribute("tabindex", "-1");
    if (restore && backFocus && backFocus.focus) backFocus.focus();
  }

  function place(x, y) {
    menu.style.left = "0px";
    menu.style.top = "0px";
    var r = menu.getBoundingClientRect();
    var left = Math.min(x, window.innerWidth - r.width - 10);
    var top = Math.min(y, window.innerHeight - r.height - 10);
    menu.style.left = Math.max(8, left) + "px";
    menu.style.top = Math.max(8, top) + "px";
  }

  function openMenu(x, y, source) {
    backFocus = source || document.activeElement;
    closeAllDds(null);
    var grps = menu.querySelectorAll(".ctx__grp");
    for (var k = 0; k < grps.length; k++) closeCtxGrp(grps[k]);
    var list = levelItems(menu);
    cursor = 0;
    for (var j = 0; j < list.length; j++) list[j].setAttribute("tabindex", j === 0 ? "0" : "-1");
    menu.classList.add("is-open");
    open = true;
    trigger.setAttribute("aria-expanded", "true");
    place(x, y);
    list[0].focus();
  }

  desk.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    openMenu(e.clientX, e.clientY, desk.contains(document.activeElement) ? document.activeElement : trigger);
  });

  desk.addEventListener("keydown", function (e) {
    if ((e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) && !open) {
      e.preventDefault();
      var r = desk.getBoundingClientRect();
      openMenu(Math.min(r.left + 40, window.innerWidth - 270), r.top + 60, desk);
    }
  });

  trigger.addEventListener("click", function () {
    if (open) { closeMenu(true); return; }
    var r = trigger.getBoundingClientRect();
    openMenu(r.left - 8, r.bottom + 8, trigger);
  });

  menu.addEventListener("keydown", function (e) {
    var item = e.target.closest ? e.target.closest(".ctx__i") : null;
    if (!item) return;
    var grp = item.parentNode.classList.contains("ctx__grp") ? item.parentNode : null;
    var scope = grp ? grp.querySelector(".ctx__panel") : menu;
    var list = levelItems(scope);
    var i = list.indexOf(item);
    var next = -1;

    if (e.key === "ArrowDown") next = i < list.length - 1 ? i + 1 : 0;
    if (e.key === "ArrowUp") next = i > 0 ? i - 1 : list.length - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = list.length - 1;

    if (next > -1) {
      e.preventDefault();
      if (scope === menu) {
        cursor = next;
        setCursor(levelItems(menu), next);
      } else {
        setCursor(list, next);
      }
      return;
    }

    if (e.key === "ArrowRight" && grp) {
      e.preventDefault();
      grp.classList.add("is-open");
      item.setAttribute("aria-expanded", "true");
      var deep = levelItems(grp.querySelector(".ctx__panel"));
      setCursor(deep, 0);
      return;
    }

    if (e.key === "ArrowLeft" && grp) {
      e.preventDefault();
      closeCtxGrp(grp);
      setCursor(levelItems(menu), levelItems(menu).indexOf(item));
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      if (grp) {
        closeCtxGrp(grp);
        setCursor(levelItems(menu), levelItems(menu).indexOf(item));
      } else {
        closeMenu(true);
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      var allItems = menu.querySelectorAll(".ctx__i");
      var order = [];
      for (var k = 0; k < allItems.length; k++) {
        if (allItems[k].offsetParent !== null) order.push(allItems[k]);
      }
      var at = order.indexOf(item);
      var to = order[(at + (e.shiftKey ? -1 : 1) + order.length) % order.length];
      to.focus();
    }
  });

  menu.addEventListener("click", function (e) {
    var item = e.target.closest ? e.target.closest(".ctx__i") : null;
    if (!item) return;
    if (item.getAttribute("aria-haspopup") === "menu") {
      var grp = item.parentNode;
      if (grp.classList.contains("is-open")) closeCtxGrp(grp);
      else {
        closeCtxGrp(grp);
        grp.classList.add("is-open");
        item.setAttribute("aria-expanded", "true");
        setCursor(levelItems(grp.querySelector(".ctx__panel")), 0);
      }
      return;
    }
    if (item.getAttribute("role") === "menuitemradio") {
      var all = item.parentNode.querySelectorAll('[role="menuitemradio"]');
      for (var k = 0; k < all.length; k++) all[k].setAttribute("aria-checked", "false");
      item.setAttribute("aria-checked", "true");
    }
    if (item.getAttribute("role") === "menuitemcheckbox") {
      var on = item.getAttribute("aria-checked") === "true";
      item.setAttribute("aria-checked", on ? "false" : "true");
      hit(item.hasAttribute("data-go") ? item.getAttribute("data-go") : "#cut");
    }
    if (item.hasAttribute("data-go")) {
      var id = item.getAttribute("data-go").slice(1);
      var target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        hit("#" + id);
      }
      if (location.hash !== "#" + id) location.hash = id;
    }
    closeMenu(true);
  });

  function hit(hash) {
    var el = document.querySelector(hash);
    if (!el) return;
    el.classList.remove("is-hit");
    void el.offsetWidth;
    el.classList.add("is-hit");
  }

  document.addEventListener("mousedown", function (e) {
    if (!open) return;
    if (menu.contains(e.target) || trigger.contains(e.target)) return;
    closeMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) { e.preventDefault(); closeMenu(true); }
  });

  window.addEventListener("resize", function () { if (open) closeMenu(false); });

  function showTime() {
    var f = frames;
    var ff = f % 24;
    var total = Math.floor(f / 24);
    var ss = total % 60;
    var mm = Math.floor(total / 60);
    document.getElementById("tc").textContent =
      "00:" + pad(mm, 2) + ":" + pad(ss, 2) + ":" + pad(ff, 2);
  }

  function spy() {
    var mark = window.innerHeight * 0.42;
    var current = "";
    for (var k = 0; k < cards.length; k++) {
      if (cards[k].getBoundingClientRect().top <= mark) current = cards[k].id;
    }
    var links = document.querySelectorAll('a[href^="#"]');
    for (var n = 0; n < links.length; n++) {
      var id = links[n].getAttribute("href").slice(1);
      if (id && id === current) links[n].setAttribute("aria-current", "true");
      else links[n].removeAttribute("aria-current");
    }
    for (var s = 0; s < cards.length; s++) cards[s].classList.toggle("is-here", cards[s].id === current);
  }

  var queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () { queued = false; spy(); });
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  if (!reduce) {
    var loop = function (now) {
      var dt = last ? Math.min(0.06, (now - last) / 1000) : 0.016;
      last = now;
      frames += dt * 24;
      if (frames > 60 * 24) frames = 12 * 24;
      showTime();
      window.requestAnimationFrame(loop);
    };
    window.requestAnimationFrame(loop);
  } else {
    showTime();
  }

  var list = levelItems(menu);
  for (var s = 0; s < list.length; s++) list[s].setAttribute("tabindex", s === 0 ? "0" : "-1");
  cursor = 0;
  spy();
  paintTabs();
})();
