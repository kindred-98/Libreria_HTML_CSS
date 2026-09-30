(function () {
  var view = document.getElementById("panoView");
  var track = document.getElementById("panoTrack");
  var mark = document.getElementById("panoMark");
  var prog = document.getElementById("progFill");
  var km = document.getElementById("km");
  var links = Array.prototype.slice.call(track.querySelectorAll(".pano__link"));
  var trackX = 0;
  var manual = null;

  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    var p = window.scrollY / max;
    return p < 0 ? 0 : p > 1 ? 1 : p;
  }

  function maxShift() {
    var d = track.scrollWidth - view.clientWidth;
    return d > 0 ? d : 0;
  }

  function current() {
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute("aria-current") === "page") return links[i];
    }
    return links[0];
  }

  function setCurrent(el) {
    links.forEach(function (l) {
      if (l === el) l.setAttribute("aria-current", "page");
      else l.removeAttribute("aria-current");
    });
    placeMark();
  }

  function placeMark() {
    var el = current();
    if (!el || !el.offsetWidth) return;
    mark.style.transform = "translateX(" + (el.offsetLeft + trackX) + "px) scaleX(" +
      (el.offsetWidth / 100) + ")";
  }

  function apply() {
    var p = progress();
    var max = maxShift();
    var x = p * max;
    if (manual !== null) {
      x = manual < 0 ? 0 : manual > max ? max : manual;
    }
    trackX = -x;
    track.style.transform = "translateX(" + trackX + "px)";
    prog.style.transform = "scaleX(" + p + ")";
    var v = (p * 18).toFixed(1);
    while (v.length < 4) v = "0" + v;
    km.textContent = v;
    placeMark();
  }

  track.addEventListener("focusin", function (e) {
    var t = e.target;
    var a = null;
    while (t && t !== track) {
      if (t.classList && t.classList.contains("pano__link")) { a = t; break; }
      t = t.parentNode;
    }
    if (!a) return;
    manual = a.offsetLeft - (view.clientWidth - a.offsetWidth) / 2;
    apply();
  });

  track.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== track) {
      if (t.classList && t.classList.contains("pano__link")) {
        setCurrent(t);
        manual = null;
        return;
      }
      t = t.parentNode;
    }
  });

  window.addEventListener("scroll", function () {
    manual = null;
    apply();
  }, { passive: true });
  window.addEventListener("resize", function () {
    manual = null;
    apply();
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        for (var i = 0; i < links.length; i++) {
          if (links[i].getAttribute("href") === "#" + id) {
            setCurrent(links[i]);
            return;
          }
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    links.forEach(function (l) {
      var sec = document.getElementById((l.getAttribute("href") || "").slice(1));
      if (sec) io.observe(sec);
    });
  }

  apply();
  window.addEventListener("load", apply);
  window.setTimeout(apply, 200);
})();
