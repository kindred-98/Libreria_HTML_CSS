(function () {
  var pages = Array.prototype.slice.call(document.querySelectorAll(".page"));
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav__i"));
  var topbar = document.querySelector(".topbar");
  var nav = document.getElementById("nav");
  var map = document.getElementById("keymap");
  var mapBtn = document.getElementById("mapBtn");
  var mapClose = document.getElementById("keymapClose");
  var bareBtn = document.getElementById("bareBtn");
  var stPage = document.getElementById("stPage");
  var stSave = document.getElementById("stSave");
  var stKey = document.getElementById("stKey");
  var stClock = document.getElementById("stClock");
  var toggles = Array.prototype.slice.call(document.querySelectorAll("[data-toggle]"));
  var cmds = Array.prototype.slice.call(document.querySelectorAll("[data-go]"));
  var clockBase = new Date(2026, 8, 28, 9, 41, 0);
  var mapOpen = false;
  var lastFocus = null;
  var savePhase = 0;
  var pending = false;

  function light(el) {
    if (!el) return;
    var chip = el.classList.contains("key") ? el : el.querySelector(".key");
    if (!chip) return;
    chip.classList.remove("is-lit");
    void chip.offsetWidth;
    chip.classList.add("is-lit");
    stKey.textContent = chip.textContent.trim();
    stKey.classList.remove("is-lit");
    void stKey.offsetWidth;
    stKey.classList.add("is-lit");
  }

  function go(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (location.hash !== "#" + id) location.hash = id;
  }

  function jump(i) {
    var item = navItems[i];
    if (!item) return;
    var id = item.getAttribute("href").slice(1);
    light(item);
    go(id);
  }

  function flash(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add("is-here");
  }

  for (var t = 0; t < toggles.length; t++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var on = btn.getAttribute("aria-pressed") !== "true";
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        var kind = btn.getAttribute("data-toggle");
        if (kind === "ruler") document.body.classList.toggle("is-noruler", !on);
        if (kind === "focus") document.body.classList.toggle("is-focus", on);
        if (kind === "grid") document.body.classList.toggle("is-grid", on);
        light(btn);
      });
    })(toggles[t]);
  }

  for (var c = 0; c < cmds.length; c++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        light(btn);
        go(btn.getAttribute("data-go").slice(1));
      });
    })(cmds[c]);
  }

  for (var n = 0; n < navItems.length; n++) {
    (function (a, i) {
      a.addEventListener("click", function () { light(a); });
      a.addEventListener("keydown", function (e) {
        var next = -1;
        if (e.key === "ArrowRight") next = (i + 1) % navItems.length;
        if (e.key === "ArrowLeft") next = (i - 1 + navItems.length) % navItems.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = navItems.length - 1;
        if (next > -1) { e.preventDefault(); navItems[next].focus(); }
      });
    })(navItems[n], n);
  }

  bareBtn.addEventListener("click", function () {
    var on = bareBtn.getAttribute("aria-pressed") !== "true";
    bareBtn.setAttribute("aria-pressed", on ? "true" : "false");
    document.body.classList.toggle("is-bare", on);
    light(bareBtn);
  });

  function openMap() {
    if (mapOpen) return;
    lastFocus = document.activeElement;
    map.hidden = false;
    mapOpen = true;
    mapBtn.setAttribute("aria-expanded", "true");
    mapClose.focus();
  }

  function closeMap(back) {
    if (!mapOpen) return;
    map.hidden = true;
    mapOpen = false;
    mapBtn.setAttribute("aria-expanded", "false");
    if (back) {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      else mapBtn.focus();
    }
  }

  mapBtn.addEventListener("click", function () {
    if (mapOpen) closeMap(true);
    else openMap();
  });
  mapClose.addEventListener("click", function () { closeMap(true); });
  map.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closeMap(true); return; }
    if (e.key !== "Tab") return;
    var f = map.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  map.addEventListener("mousedown", function (e) {
    if (e.target === map) closeMap(false);
  });

  document.addEventListener("keydown", function (e) {
    var tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
    if (mapOpen) return;
    if (e.ctrlKey && e.shiftKey && (e.key === "G" || e.key === "g")) {
      e.preventDefault();
      var grid = document.querySelector('[data-toggle="grid"]');
      grid.click();
      return;
    }
    if (e.altKey) {
      var low = e.key.toLowerCase();
      if (low === "h") { e.preventDefault(); bareBtn.click(); return; }
      if (low === "r") { e.preventDefault(); document.querySelector('[data-toggle="ruler"]').click(); return; }
      if (low === "z") { e.preventDefault(); document.querySelector('[data-toggle="focus"]').click(); return; }
      if (low === "f") { e.preventDefault(); go("figures"); light(document.querySelector('[data-go="#figures"]')); return; }
      if (low === "s") { e.preventDefault(); go("summary"); light(document.querySelector('[data-go="#summary"]')); return; }
      if (low === "l") { e.preventDefault(); go("glossary"); light(document.querySelector('[data-go="#glossary"]')); return; }
      return;
    }
    if (e.key === "?") { e.preventDefault(); openMap(); return; }
    if (e.key === "Escape") { closeMap(true); return; }
    if (/^[1-6]$/.test(e.key)) {
      e.preventDefault();
      jump(parseInt(e.key, 10) - 1);
    }
  });

  function spy() {
    pending = false;
    var mark = window.innerHeight * 0.36;
    var current = 0;
    for (var k = 0; k < pages.length; k++) {
      if (pages[k].getBoundingClientRect().top <= mark) current = k;
    }
    for (var n = 0; n < navItems.length; n++) {
      if (n === current) {
        navItems[n].classList.add("is-here");
        navItems[n].setAttribute("aria-current", "true");
      } else {
        navItems[n].classList.remove("is-here");
        navItems[n].removeAttribute("aria-current");
      }
    }
    for (var p = 0; p < pages.length; p++) pages[p].classList.toggle("is-here", p === current);
    stPage.textContent = (current + 1) + " / " + pages.length;
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }

  window.addEventListener("scroll", function () {
    topbar.classList.toggle("is-tight", (window.scrollY || 0) > 40);
    queue();
  }, { passive: true });
  window.addEventListener("resize", queue);

  var last = 0;
  function loop(now) {
    var dt = last ? Math.min(0.06, (now - last) / 1000) : 0.016;
    last = now;
    savePhase += dt;
    if (savePhase > 3.1) {
      savePhase = 0;
      stSave.textContent = stSave.textContent === "Stored" ? "Saving" : "Stored";
    }
    clockBase = new Date(clockBase.getTime() + dt * 1000 * 42);
    var hh = String(clockBase.getHours()).padStart(2, "0");
    var mm = String(clockBase.getMinutes()).padStart(2, "0");
    var ss = String(clockBase.getSeconds()).padStart(2, "0");
    stClock.textContent = hh + ":" + mm + ":" + ss;
    window.requestAnimationFrame(loop);
  }

  spy();
  if (!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    window.requestAnimationFrame(loop);
  } else {
    stSave.textContent = "Stored";
  }
  flash("cover");
})();
