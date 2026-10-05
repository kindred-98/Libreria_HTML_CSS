(function () {
  var THEMES = [
    { id: "daylight", name: "Daylight", sub: "window light", chip: "#efe9dc", ink: "#1e1b16", accent: "#b8442c" },
    { id: "sepia", name: "Uncoated", sub: "sepia stock", chip: "#e3d3b2", ink: "#3a2b1b", accent: "#8a4a1c" },
    { id: "night", name: "Night desk", sub: "reverse type", chip: "#0f1119", ink: "#e7ecf8", accent: "#d8b45c" },
    { id: "contrast", name: "Proof lamp", sub: "high contrast", chip: "#000000", ink: "#ffffff", accent: "#ffe500" }
  ];

  var wheelBtn = document.getElementById("wheelBtn");
  var wheel = document.getElementById("wheel");
  var scrim = document.getElementById("scrim");
  var panel = wheel.querySelector(".wheel__panel");
  var closeBtn = document.getElementById("wheelClose");
  var set = document.getElementById("dialSet");
  var ptr = document.getElementById("ptr");
  var hubName = document.getElementById("hubName");
  var proofName = document.getElementById("proofName");
  var flash = document.getElementById("heroFlash");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__i"));
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var buttons = [];
  var current = 0;
  var isOpen = false;
  var backFocus = null;
  var pending = false;
  var store = null;
  try { store = window.sessionStorage; } catch (e) { store = null; }

  function build() {
    var out = "";
    for (var k = 0; k < THEMES.length; k++) {
      var t = THEMES[k];
      out += '<div class="sec" style="--a:' + (k * 90) + 'deg">' +
        '<button class="sw" type="button" role="radio" aria-checked="false" tabindex="-1" data-k="' + k + '">' +
        '<span class="sw__chip" style="background:linear-gradient(145deg,' + t.chip + ',' + t.chip + ');' +
        'box-shadow:inset 0 0 0 1px ' + t.accent + '66"></span>' +
        '<span class="sw__nm">' + t.name + '</span>' +
        '<span class="sw__sub">' + t.sub + "</span></button></div>";
    }
    set.innerHTML = out;
    buttons = Array.prototype.slice.call(set.querySelectorAll(".sw"));
    for (var n = 0; n < buttons.length; n++) {
      (function (btn, i) {
        btn.addEventListener("click", function () { apply(i); });
        btn.addEventListener("keydown", function (e) {
          var next = -1;
          if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % THEMES.length;
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + THEMES.length) % THEMES.length;
          if (e.key === "Home") next = 0;
          if (e.key === "End") next = THEMES.length - 1;
          if (next > -1) {
            e.preventDefault();
            setCursor(next);
            apply(next);
          } else if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            apply(i);
          }
        });
      })(buttons[n], n);
    }
  }

  function setCursor(k) {
    if (k < 0) k = buttons.length - 1;
    if (k >= buttons.length) k = 0;
    for (var n = 0; n < buttons.length; n++) buttons[n].setAttribute("tabindex", n === k ? "0" : "-1");
    buttons[k].focus();
  }

  function apply(k) {
    var t = THEMES[k];
    document.documentElement.dataset.theme = t.id;
    proofName.textContent = t.name;
    hubName.textContent = t.name;
    ptr.style.transform = "rotate(" + (90 + k * 90) + "deg)";
    for (var n = 0; n < buttons.length; n++) {
      buttons[n].setAttribute("aria-checked", n === k ? "true" : "false");
      if (n === k) buttons[n].setAttribute("tabindex", "0");
    }
    current = k;
    flash.classList.remove("go");
    flash.getBoundingClientRect();
    flash.classList.add("go");
    if (store) { try { store.setItem("proofTheme", t.id); } catch {} }
  }

  function focusables() {
    var out = [];
    for (const btn of buttons) if (btn.offsetParent !== null) out.push(btn);
    if (closeBtn.offsetParent !== null) out.push(closeBtn);
    return out;
  }

  function open() {
    if (isOpen) return;
    backFocus = document.activeElement;
    scrim.style.display = "block";
    wheel.hidden = false;
    isOpen = true;
    wheelBtn.setAttribute("aria-expanded", "true");
    setCursor(current);
  }

  function close(back) {
    if (!isOpen) return;
    wheel.hidden = true;
    scrim.style.display = "none";
    isOpen = false;
    wheelBtn.setAttribute("aria-expanded", "false");
    if (back) {
      if (backFocus?.focus) backFocus.focus();
      else wheelBtn.focus();
    }
  }

  wheelBtn.addEventListener("click", function () {
    if (isOpen) close(true);
    else open();
  });
  closeBtn.addEventListener("click", function () { close(true); });
  scrim.addEventListener("click", function () { close(false); });

  wheel.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) { e.preventDefault(); close(true); }
  });

  function spy() {
    pending = false;
    var markY = window.innerHeight * 0.36;
    var now = "";
    for (const sheet of sheets) {
      if (sheet.getBoundingClientRect().top <= markY) now = sheet.id;
    }
    for (const link of navLinks) {
      if (link.getAttribute("href") === "#" + now) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    for (const s of sheets) s.classList.toggle("is-here", s.id === now);
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  build();
  var start = 0;
  if (store) {
    var saved = null;
    try { saved = store.getItem("proofTheme"); } catch (e) { saved = null; }
    for (var k = 0; k < THEMES.length; k++) {
      if (saved && THEMES[k].id === saved) start = k;
    }
  }
  apply(start);
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    flash.classList.remove("go");
  }
  spy();
})();
