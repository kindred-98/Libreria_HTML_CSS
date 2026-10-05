(function () {
  var top = document.getElementById("top");
  var burger = document.getElementById("burger");
  var nav = document.getElementById("primary-nav");
  var list = document.getElementById("navList");
  var ink = document.getElementById("ink");
  var clock = document.getElementById("clock");
  var links = Array.prototype.slice.call(list.querySelectorAll(".nav__link"));
  var open = false;
  var mqSmall = window.matchMedia("(max-width: 760px)");

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
    moveInk(el);
  }

  function moveInk(el) {
    if (!el || !ink.offsetWidth) return;
    var w = el.offsetWidth;
    if (!w) return;
    ink.style.transform = "translateX(" + el.offsetLeft + "px) scaleX(" + (w / ink.offsetWidth) + ")";
  }

  function onScroll() {
    if (window.scrollY > 26) top.classList.add("is-stuck");
    else top.classList.remove("is-stuck");
  }

  function setOpen(state) {
    open = state;
    nav.classList.toggle("is-open", state);
    burger.setAttribute("aria-expanded", state ? "true" : "false");
    burger.setAttribute("aria-label", state ? "Close primary menu" : "Open primary menu");
    if (state) {
      var first = current();
      if (first) first.focus();
    }
  }

  burger.addEventListener("click", function () {
    setOpen(!open);
  });

  nav.addEventListener("click", function (e) {
    var t = e.target;
    if (t?.classList && t.classList.contains("nav__link")) {
      setCurrent(t);
      if (mqSmall.matches) setOpen(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) {
      setOpen(false);
      burger.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (!open) return;
    if (nav.contains(e.target) || burger.contains(e.target)) return;
    setOpen(false);
  });

  links.forEach(function (l) {
    l.addEventListener("pointerenter", function () { moveInk(l); });
    l.addEventListener("focus", function () { moveInk(l); });
    l.addEventListener("pointerleave", function () { moveInk(current()); });
    l.addEventListener("blur", function () { moveInk(current()); });
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = en.target.id;
          for (const link of links) {
            if (link.getAttribute("href") === "#" + id) {
              setCurrent(link);
              return;
            }
          }
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    links.forEach(function (l) {
      var id = (l.getAttribute("href") || "").slice(1);
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  function tick() {
    var d = new Date();
    function p(n) { return n < 10 ? "0" + n : String(n); }
    clock.textContent = p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { moveInk(current()); });
  window.addEventListener("load", function () { moveInk(current()); });
  // MediaQueryList.addEventListener no existe en navegadores viejos: se registra
  // el listener solo cuando la API esta, en vez de dejar un ternario suelto.
  if (mqSmall.addEventListener) {
    mqSmall.addEventListener("change", function () {
      if (mqSmall.matches) { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); open = false; }
      moveInk(current());
    });
  }

  onScroll();
  setCurrent(current());
  tick();
  window.setInterval(tick, 1000);
})();
