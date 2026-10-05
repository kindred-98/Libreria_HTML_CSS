(function () {
  var bar = document.getElementById("bar");
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var ink = document.getElementById("ink");
  var clock = document.getElementById("clock");
  var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .sec[id]"));
  var menuOpen = false;
  var ticking = false;
  var active = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function tick() {
    var d = new Date();
    clock.textContent = pad(d.getUTCHours()) + ":" + pad(d.getUTCMinutes()) + ":" + pad(d.getUTCSeconds());
  }

  function moveInk(link) {
    if (!link) return;
    var r = link.getBoundingClientRect();
    var n = nav.getBoundingClientRect();
    ink.style.width = r.width + "px";
    ink.style.transform = "translateX(" + (r.left - n.left) + "px)";
  }

  function setActive(link) {
    if (!link || link === active) return;
    active = link;
    for (const item of links) {
      if (item === link) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
    moveInk(link);
  }

  function spy() {
    var mark = window.scrollY + window.innerHeight * 0.3;
    var current = sections[0];
    for (const section of sections) {
      if (section.offsetTop <= mark) current = section;
    }
    if (!current) return;
    var id = "#" + current.id;
    for (const link of links) {
      if (link.getAttribute("href") === id) { setActive(link); break; }
    }
  }

  function onScroll() {
    bar.classList.toggle("is-scrolled", window.scrollY > 24);
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      spy();
    });
  }

  function setMenu(open, focusFirst) {
    menuOpen = open;
    bar.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close section menu" : "Open section menu");
    if (open && focusFirst && links[0]) links[0].focus();
    if (!open && focusFirst) burger.focus();
  }

  burger.addEventListener("click", function () { setMenu(!menuOpen, false); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) {
      setMenu(false, true);
      return;
    }
    if (e.key === "ArrowDown" && menuOpen && document.activeElement === burger) {
      e.preventDefault();
      setMenu(true, true);
    }
  });

  document.addEventListener("click", function (e) {
    if (menuOpen && !bar.contains(e.target)) setMenu(false, false);
  });

  for (const link of links) {
    link.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      var target = document.querySelector(href);
      setActive(this);
      if (menuOpen) setMenu(false, false);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", href);
      }
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    moveInk(active);
    if (window.innerWidth > 940 && menuOpen) setMenu(false, false);
  });

  tick();
  window.setInterval(tick, 1000);
  setActive(links[0]);
  onScroll();
  spy();
})();
