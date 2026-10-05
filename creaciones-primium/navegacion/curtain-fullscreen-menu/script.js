(function () {
  var btn = document.getElementById("menuBtn");
  var curtain = document.getElementById("curtain");
  var closeBtn = document.getElementById("curtainClose");
  var nav = document.getElementById("cnav");
  var links = Array.prototype.slice.call(nav.querySelectorAll(".cnav__link"));
  var open = false;

  function current() {
    for (const link of links) {
      if (link.getAttribute("aria-current") === "page") return link;
    }
    return links[0];
  }

  function setCurrent(el) {
    links.forEach(function (l) {
      if (l === el) l.setAttribute("aria-current", "page");
      else l.removeAttribute("aria-current");
    });
  }

  function setOpen(state) {
    open = state;
    curtain.classList.toggle("is-open", state);
    btn.setAttribute("aria-expanded", state ? "true" : "false");
    btn.setAttribute("aria-label", state ? "Close festival menu" : "Open festival menu");
    document.body.style.overflow = state ? "hidden" : "";
    if (state) {
      window.setTimeout(function () {
        var f = current();
        if (f) f.focus();
      }, 220);
    } else {
      btn.focus();
    }
  }

  function focusables() {
    return Array.prototype.slice.call(
      curtain.querySelectorAll('a[href],button:not([disabled])')
    ).filter(function (el) { return el.offsetWidth || el.offsetHeight; });
  }

  btn.addEventListener("click", function () { setOpen(!open); });
  closeBtn.addEventListener("click", function () { setOpen(false); });

  nav.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== nav) {
      if (t.classList && t.classList.contains("cnav__link")) {
        setCurrent(t);
        setOpen(false);
        return;
      }
      t = t.parentNode;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "Tab") {
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        for (const link of links) {
          if (link.getAttribute("href") === "#" + id) {
            setCurrent(link);
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

  setCurrent(current());
})();
