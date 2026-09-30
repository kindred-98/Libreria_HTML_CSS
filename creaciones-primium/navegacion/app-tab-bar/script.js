(function () {
  var bar = document.getElementById("tabbar");
  var pill = document.getElementById("pill");
  var compose = document.getElementById("compose");
  var tabs = Array.prototype.slice.call(bar.querySelectorAll(".tab"));

  function paneOf(tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  }

  function place(tab) {
    var w = bar.offsetWidth;
    if (!w || !tab.offsetWidth) return;
    pill.style.transform = "translateX(" + tab.offsetLeft + "px) scaleX(" + (tab.offsetWidth / w) + ")";
  }

  function select(tab, moveFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = paneOf(t);
      if (p) p.hidden = !on;
    });
    if (moveFocus) tab.focus();
    place(tab);
  }

  function active() {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute("aria-selected") === "true") return tabs[i];
    }
    return tabs[0];
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () { select(tab, false); });
    tab.addEventListener("focus", function () { place(tab); });
    tab.addEventListener("pointerenter", function () { place(tab); });
    tab.addEventListener("pointerleave", function () { place(active()); });
    tab.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(tab);
      var n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) {
        e.preventDefault();
        select(n, true);
      }
    });
  });

  compose.addEventListener("click", function () {
    var drafts = document.getElementById("tab-drafts");
    select(drafts, false);
    var pane = paneOf(drafts);
    if (pane) pane.focus();
  });

  Array.prototype.slice.call(document.querySelectorAll(".toggle")).forEach(function (t) {
    t.addEventListener("click", function () {
      var on = !t.classList.contains("is-on");
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });

  window.addEventListener("resize", function () { place(active()); });
  window.addEventListener("load", function () { place(active()); });

  select(active(), false);
  window.setTimeout(function () { place(active()); }, 150);
})();
