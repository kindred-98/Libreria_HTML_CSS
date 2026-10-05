(function () {
  var toggle = document.getElementById("toggle");
  var drawer = document.getElementById("drawer");
  var closeBtn = document.getElementById("close");
  var scrim = document.getElementById("scrim");
  var nav = document.getElementById("drawerNav");
  var marker = document.getElementById("marker");
  var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
  var chips = Array.prototype.slice.call(document.querySelectorAll(".rooms a[href^='#']"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .sec[id]"));
  var views = Array.prototype.slice.call(document.querySelectorAll(".view"));
  var frame = document.getElementById("previewFrame");
  var label = document.getElementById("previewLabel");
  var open = false;
  var active = null;

  function placeMarker(link) {
    if (!link) return;
    marker.style.height = link.offsetHeight + "px";
    marker.style.transform = "translateY(" + link.offsetTop + "px)";
  }

  function setActive(link) {
    if (!link || link === active) return;
    active = link;
    var href = link.getAttribute("href");
    for (const item of links) {
      if (item === link) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
    for (const chip of chips) {
      if (chip.getAttribute("href") === href) chip.setAttribute("aria-current", "page");
      else chip.removeAttribute("aria-current");
    }
    placeMarker(link);
  }

  function spy() {
    var mark = window.scrollY + window.innerHeight * 0.34;
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

  function setOpen(next, restore) {
    open = next;
    drawer.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      scrim.hidden = false;
      window.requestAnimationFrame(function () { scrim.classList.add("is-on"); });
      placeMarker(active);
      if (links[0]) links[0].focus();
    } else {
      scrim.classList.remove("is-on");
      window.setTimeout(function () { if (!open) scrim.hidden = true; }, 450);
      if (restore) toggle.focus();
    }
  }

  toggle.addEventListener("click", function () { setOpen(!open, false); });
  closeBtn.addEventListener("click", function () { setOpen(false, true); });
  scrim.addEventListener("click", function () { setOpen(false, true); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) setOpen(false, true);
  });

  for (const link of links) {
    link.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      var target = document.querySelector(href);
      setActive(this);
      setOpen(false, false);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", href);
      }
    });
  }

  for (const view of views) {
    view.addEventListener("click", function () {
      for (const other of views) other.setAttribute("aria-pressed", "false");
      this.setAttribute("aria-pressed", "true");
      frame.style.aspectRatio = this.dataset.ratio;
      label.textContent = this.dataset.label;
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; spy(); });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { placeMarker(active); });

  setActive(links[0]);
  spy();
  placeMarker(active);
})();
