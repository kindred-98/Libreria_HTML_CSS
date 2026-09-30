(function () {
  var dds = document.querySelectorAll(".dd");
  var items = [];
  var i;
  for (i = 0; i < dds.length; i++) {
    if (dds[i].querySelector(".dd__btn")) items.push(dds[i]);
  }
  var subs = document.querySelectorAll(".sub");
  var sections = document.querySelectorAll(".bin");

  function close(dd, returnFocus) {
    dd.classList.remove("is-open");
    dd.classList.remove("is-pinned");
    var btn = dd.querySelector(".dd__btn");
    if (btn) btn.setAttribute("aria-expanded", "false");
    var subsIn = dd.querySelectorAll(".sub");
    for (var k = 0; k < subsIn.length; k++) {
      subsIn[k].classList.remove("is-open");
      var sb = subsIn[k].querySelector(".sub__btn");
      if (sb) sb.setAttribute("aria-expanded", "false");
    }
    if (returnFocus && btn) btn.focus();
  }

  function closeAll(except) {
    for (var k = 0; k < items.length; k++) {
      if (items[k] !== except) close(items[k], false);
    }
  }

  function open(dd) {
    closeAll(dd);
    dd.classList.add("is-open");
    var btn = dd.querySelector(".dd__btn");
    if (btn) btn.setAttribute("aria-expanded", "true");
  }

  for (i = 0; i < items.length; i++) {
    (function (dd) {
      var btn = dd.querySelector(".dd__btn");
      var links = dd.querySelectorAll(".dd__panel a");

      btn.addEventListener("click", function () {
        if (dd.classList.contains("is-open") && dd.classList.contains("is-pinned")) {
          close(dd, false);
        } else {
          open(dd);
          dd.classList.add("is-pinned");
        }
      });

      dd.addEventListener("mouseenter", function () { open(dd); });
      dd.addEventListener("mouseleave", function () {
        if (!dd.classList.contains("is-pinned")) close(dd, false);
      });

      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          open(dd);
          dd.classList.add("is-pinned");
          if (links.length) links[e.key === "ArrowDown" ? 0 : links.length - 1].focus();
        } else if (e.key === "Escape") {
          close(dd, true);
        }
      });

      dd.addEventListener("focusin", function () { open(dd); });
      dd.addEventListener("focusout", function (e) {
        if (!dd.contains(e.relatedTarget)) close(dd, false);
      });

      dd.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close(dd, true);
      });

      for (var n = 0; n < links.length; n++) {
        links[n].addEventListener("click", function () { close(dd, false); });
      }
    })(items[i]);
  }

  for (i = 0; i < subs.length; i++) {
    (function (sub) {
      var sbtn = sub.querySelector(".sub__btn");
      if (!sbtn) return;
      function sync() {
        var open = sub.matches(":hover") || sub.classList.contains("is-open") ||
          sub.contains(document.activeElement);
        sbtn.setAttribute("aria-expanded", open ? "true" : "false");
      }
      sub.addEventListener("mouseenter", sync);
      sub.addEventListener("mouseleave", sync);
      sub.addEventListener("focusin", sync);
      sub.addEventListener("focusout", sync);
      sbtn.addEventListener("click", function () {
        sub.classList.toggle("is-open");
        sync();
      });
    })(subs[i]);
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".bar")) closeAll(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll(null);
  });

  function spy() {
    var vh = window.innerHeight;
    var mark = vh * 0.4;
    var currentId = "";
    for (var k = 0; k < sections.length; k++) {
      if (sections[k].getBoundingClientRect().top <= mark) currentId = sections[k].id;
    }
    var nav = document.querySelector(".bar");
    var anchors = nav.querySelectorAll("a[href^='#']");
    for (var n = 0; n < anchors.length; n++) {
      var id = anchors[n].getAttribute("href").slice(1);
      if (id && id === currentId) {
        anchors[n].setAttribute("aria-current", "true");
      } else {
        anchors[n].removeAttribute("aria-current");
      }
    }
    for (var s = 0; s < sections.length; s++) {
      sections[s].classList.toggle("is-here", sections[s].id === currentId);
    }
  }

  var queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      spy();
    });
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  spy();
})();
