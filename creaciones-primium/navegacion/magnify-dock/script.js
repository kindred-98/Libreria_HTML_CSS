(function () {
  var dock = document.getElementById("dock");
  var list = dock.querySelector(".dock__list");
  var ind = document.getElementById("dockInd");
  var apps = Array.prototype.slice.call(list.querySelectorAll(".dock__app"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var sigma = 108;

  function current() {
    for (const app of apps) {
      if (app.classList.contains("is-active")) return app;
    }
    return apps[0];
  }

  function place(app) {
    if (!app || !ind.offsetWidth) return;
    var dx = app.offsetLeft + (app.offsetWidth - ind.offsetWidth) / 2;
    ind.style.transform = "translateX(" + dx + "px)";
    ind.style.opacity = "1";
  }

  function setCurrent(el) {
    apps.forEach(function (a) {
      var on = a === el;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    place(el);
  }

  function clearScale() {
    apps.forEach(function (a) { a.style.removeProperty("--k"); });
  }

  function magnify(x) {
    apps.forEach(function (a) {
      var r = a.getBoundingClientRect();
      var d = x - (r.left + r.width / 2);
      var k = 1 + 0.78 * Math.exp(-(d * d) / (2 * sigma * sigma));
      a.style.setProperty("--k", k.toFixed(3));
    });
  }

  if (!reduce) {
    dock.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      magnify(e.clientX);
    });
    dock.addEventListener("pointerleave", function () { clearScale(); });
    dock.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      magnify(e.clientX);
      window.setTimeout(clearScale, 420);
    });
  }

  apps.forEach(function (a) {
    a.addEventListener("focus", function () {
      if (reduce) return;
      apps.forEach(function (o) { o.style.setProperty("--k", o === a ? "1.34" : "1"); });
    });
    a.addEventListener("blur", function () { clearScale(); });
    a.addEventListener("click", function () { setCurrent(a); });
    a.addEventListener("keydown", function (e) {
      var i = apps.indexOf(a);
      var n = null;
      if (e.key === "ArrowRight") n = apps[(i + 1) % apps.length];
      else if (e.key === "ArrowLeft") n = apps[(i - 1 + apps.length) % apps.length];
      else if (e.key === "Home") n = apps[0];
      else if (e.key === "End") n = apps[apps.length - 1];
      if (n) {
        e.preventDefault();
        n.focus();
      }
    });
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        for (const app of apps) {
          if (app.getAttribute("href") === "#" + id) {
            setCurrent(app);
            return;
          }
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    apps.forEach(function (a) {
      var sec = document.getElementById((a.getAttribute("href") || "").slice(1));
      if (sec) io.observe(sec);
    });
  }

  window.addEventListener("resize", function () { place(current()); });
  window.addEventListener("load", function () { place(current()); });

  setCurrent(current());
  window.setTimeout(function () { place(current()); }, 150);
})();
