(function () {
  var dock = document.getElementById("dock");
  var items = Array.prototype.slice.call(dock.querySelectorAll(".dock__list a"));
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .sec[id]"));
  var RADIUS = 132;
  var active = null;

  function reset() {
    for (const item of items) {
      item.style.setProperty("--sc", 1);
      item.style.setProperty("--ty", "0px");
      item.style.setProperty("--rot", "0deg");
    }
  }

  function apply(offsets) {
    for (var i = 0; i < items.length; i++) {
      var d = offsets[i];
      var f = Math.max(0, 1 - Math.abs(d) / RADIUS);
      var ease = f * f * (3 - 2 * f);
      items[i].style.setProperty("--sc", (1 + ease * 0.52).toFixed(3));
      items[i].style.setProperty("--ty", (-ease * 16).toFixed(1) + "px");
      items[i].style.setProperty("--rot", (d * -0.028).toFixed(3) + "deg");
    }
  }

  function offsetsFromX(x) {
    var out = [];
    for (const item of items) {
      var r = item.getBoundingClientRect();
      out.push(x - (r.left + r.width / 2));
    }
    return out;
  }

  dock.addEventListener("pointermove", function (e) {
    apply(offsetsFromX(e.clientX));
  });
  dock.addEventListener("pointerleave", reset);

  for (const item of items) {
    item.addEventListener("focus", function () {
      var x = this.getBoundingClientRect().left + this.getBoundingClientRect().width / 2;
      apply(offsetsFromX(x));
    });
    item.addEventListener("blur", reset);
    item.addEventListener("pointerenter", function () {
      var x = this.getBoundingClientRect().left + this.getBoundingClientRect().width / 2;
      apply(offsetsFromX(x));
    });
    item.addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      var target = document.querySelector(href);
      setActive(this);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", href);
      }
    });
  }

  function setActive(link) {
    if (!link || link === active) return;
    active = link;
    for (const item of items) {
      if (item === link) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    }
  }

  dock.addEventListener("keydown", function (e) {
    var idx = items.indexOf(document.activeElement);
    if (idx < 0) return;
    var next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      items[next].focus();
      setActive(items[next]);
    }
  });

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var mark = window.scrollY + window.innerHeight * 0.34;
      var current = null;
      for (const section of sections) {
        if (section.offsetTop <= mark) current = section;
      }
      if (!current) return;
      var id = "#" + current.id;
      for (const item of items) {
        if (item.getAttribute("href") === id) { setActive(item); break; }
      }
    });
  }, { passive: true });

  window.addEventListener("resize", reset);

  setActive(items[0]);
})();
