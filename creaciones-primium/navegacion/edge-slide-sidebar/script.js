(function () {
  var edge = document.getElementById("edge");
  var panel = document.getElementById("panel");
  var scrim = document.getElementById("scrim");
  var closeBtn = document.getElementById("close");
  var menu = document.getElementById("menu");
  var marker = document.getElementById("marker");
  var links = Array.prototype.slice.call(menu.querySelectorAll(".menu__link"));
  var open = false;

  function current() {
    for (const link of links) {
      if (link.getAttribute("aria-current") === "page") return link;
    }
    return links[0];
  }

  function place(el) {
    if (!el) return;
    var item = el.parentNode;
    marker.style.height = item.offsetHeight + "px";
    marker.style.transform = "translateY(" + item.offsetTop + "px)";
  }

  function setCurrent(el) {
    links.forEach(function (l) {
      if (l === el) l.setAttribute("aria-current", "page");
      else l.removeAttribute("aria-current");
    });
    place(el);
  }

  function setOpen(state) {
    open = state;
    panel.classList.toggle("is-open", state);
    scrim.classList.toggle("is-on", state);
    edge.setAttribute("aria-expanded", state ? "true" : "false");
    edge.setAttribute("aria-label", state ? "Close issue menu" : "Open issue menu");
    if (state) {
      var first = current();
      if (first) first.focus();
      window.setTimeout(function () { place(current()); }, 60);
    } else {
      edge.focus();
    }
  }

  function focusables() {
    return Array.prototype.slice.call(
      panel.querySelectorAll('a[href],button:not([disabled])')
    ).filter(function (el) { return el.offsetWidth || el.offsetHeight; });
  }

  edge.addEventListener("click", function () { setOpen(!open); });
  closeBtn.addEventListener("click", function () { setOpen(false); });
  scrim.addEventListener("click", function () { setOpen(false); });

  panel.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== panel) {
      if (t.classList && t.classList.contains("menu__link")) {
        setCurrent(t);
        setOpen(false);
        return;
      }
      t = t.parentNode;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!open) {
      if (e.key === "Escape" && document.activeElement === edge) return;
      return;
    }
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

  links.forEach(function (l) {
    l.addEventListener("pointerenter", function () { place(l); });
    l.addEventListener("focus", function () { place(l); });
    l.addEventListener("pointerleave", function () { place(current()); });
    l.addEventListener("blur", function () { place(current()); });
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
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });
    links.forEach(function (l) {
      var sec = document.getElementById((l.getAttribute("href") || "").slice(1));
      if (sec) io.observe(sec);
    });
  }

  window.addEventListener("resize", function () { place(current()); });
  window.addEventListener("load", function () { place(current()); });

  setCurrent(current());
  window.setTimeout(function () { place(current()); }, 120);
})();
