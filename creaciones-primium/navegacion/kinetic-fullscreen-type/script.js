(function () {
  var overlay = document.getElementById("overlay");
  var menuBtn = document.getElementById("menuBtn");
  var ovClose = document.getElementById("ovClose");
  var list = document.getElementById("kinList");
  var num = document.getElementById("ovNum");
  var ghost = document.getElementById("ovGhost");
  var dests = [].slice.call(list.querySelectorAll(".dest"));
  var sections = [].slice.call(document.querySelectorAll("main .sec[id]"));
  var open = false;
  var seed = 0;
  var focused = null;
  var active = null;

  function splitLetters() {
    for (var i = 0; i < dests.length; i++) {
      var w = dests[i].querySelector(".dest__w");
      var text = w.textContent;
      w.textContent = "";
      for (var c = 0; c < text.length; c++) {
        var s = document.createElement("span");
        s.className = "l";
        s.style.setProperty("--li", c);
        s.textContent = text.charAt(c);
        w.appendChild(s);
      }
    }
  }

  function scatter(item, out) {
    var letters = item.querySelectorAll(".l");
    seed += out ? 1 : 0;
    for (var i = 0; i < letters.length; i++) {
      var n = Math.sin((seed + 1) * (i + 1) * 2.399);
      var m = Math.cos((seed + 1) * (i + 3) * 1.731);
      if (out) {
        letters[i].style.setProperty("--tx", (n * 46).toFixed(1) + "px");
        letters[i].style.setProperty("--ty", (m * 34 - 12).toFixed(1) + "px");
        letters[i].style.setProperty("--rr", (n * 14).toFixed(1) + "deg");
      } else {
        letters[i].style.setProperty("--tx", (n * 46).toFixed(1) + "px");
        letters[i].style.setProperty("--ty", (m * 34 - 12).toFixed(1) + "px");
        letters[i].style.setProperty("--rr", (n * 14).toFixed(1) + "deg");
        letters[i].offsetHeight;
        letters[i].style.setProperty("--tx", "0px");
        letters[i].style.setProperty("--ty", "0px");
        letters[i].style.setProperty("--rr", "0deg");
      }
    }
  }

  function setOrder(center) {
    var idx = dests.indexOf(center);
    for (var i = 0; i < dests.length; i++) {
      var d = idx < 0 ? 0 : Math.abs(i - idx);
      dests[i].style.setProperty("--d", d);
    }
  }

  function setActive(item, kinetic) {
    if (!item) return;
    if (active && active !== item) scatter(active, true);
    active = item;
    for (var i = 0; i < dests.length; i++) {
      if (dests[i] === item) dests[i].setAttribute("aria-current", "page");
      else dests[i].removeAttribute("aria-current");
    }
    var n = item.querySelector(".dest__n").textContent;
    num.textContent = n;
    ghost.textContent = n;
    if (kinetic) {
      seed += 1;
      item.offsetHeight;
      scatter(item, false);
    }
    setOrder(item);
  }

  function setOpen(next, restore) {
    open = next;
    overlay.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      setOrder(active || dests[0]);
      window.setTimeout(function () {
        (active || dests[0]).focus();
      }, 120);
    } else if (restore) {
      menuBtn.focus();
    }
  }

  function neighbours(item) {
    setOrder(item);
  }

  menuBtn.addEventListener("click", function () { setOpen(!open, false); });
  ovClose.addEventListener("click", function () { setOpen(false, true); });

  document.addEventListener("keydown", function (e) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false, true);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      var idx = dests.indexOf(document.activeElement);
      if (idx < 0) idx = dests.indexOf(active);
      var next = e.key === "ArrowDown" ? idx + 1 : idx - 1;
      if (next < 0) next = dests.length - 1;
      if (next >= dests.length) next = 0;
      dests[next].focus();
      return;
    }
    if (e.key === "Tab") {
      var focusables = [].slice.call(overlay.querySelectorAll("a[href], button"));
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  for (var i = 0; i < dests.length; i++) {
    (function (item) {
      item.addEventListener("pointerenter", function () {
        focused = item;
        setActive(item, true);
      });
      item.addEventListener("focus", function () {
        focused = item;
        setActive(item, true);
      });
      item.addEventListener("pointerleave", function () {
        if (focused === item) focused = null;
      });
      item.addEventListener("click", function (e) {
        var href = item.getAttribute("href");
        var target = document.querySelector(href);
        setActive(item, true);
        setOpen(false, false);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          if (history.replaceState) history.replaceState(null, "", href);
        }
      });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setOpen(false, true);
      });
    })(dests[i]);
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      var mark = window.scrollY + window.innerHeight * 0.32;
      var current = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= mark) current = sections[i];
      }
      if (!current) return;
      var id = "#" + current.id;
      for (var k = 0; k < dests.length; k++) {
        if (dests[k].getAttribute("href") === id) {
          if (dests[k] !== active) setActive(dests[k], false);
          break;
        }
      }
    });
  }, { passive: true });

  splitLetters();
  setActive(dests[0], true);
})();
