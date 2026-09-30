(function () {
  var STATUS = [
    { name: "Available", state: 0 },
    { name: "In a meeting", state: 1 },
    { name: "Do not disturb", state: 2 }
  ];

  var whoBtn = document.getElementById("whoBtn");
  var whoStatus = document.getElementById("whoStatus");
  var flyStatus = document.getElementById("flyStatus");
  var fly = document.getElementById("fly");
  var menu = document.getElementById("flyMenu");
  var items = Array.prototype.slice.call(menu.querySelectorAll(".mi"));
  var nav = document.getElementById("nav");
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var bays = Array.prototype.slice.call(document.querySelectorAll(".bay"));
  var isOpen = false;
  var backFocus = null;
  var pending = false;
  var state = 0;

  function setStatus(i) {
    state = i;
    whoBtn.setAttribute("data-state", STATUS[i].state);
    fly.setAttribute("data-state", STATUS[i].state);
    whoStatus.textContent = STATUS[i].name;
    flyStatus.textContent = STATUS[i].name;
    var radios = menu.querySelectorAll('[role="menuitemradio"]');
    for (var n = 0; n < radios.length; n++) {
      radios[n].setAttribute("aria-checked", parseInt(radios[n].getAttribute("data-status"), 10) === i ? "true" : "false");
    }
  }

  function setRoving(i) {
    if (i < 0) i = items.length - 1;
    if (i >= items.length) i = 0;
    for (var n = 0; n < items.length; n++) items[n].setAttribute("tabindex", n === i ? "0" : "-1");
    items[i].focus();
  }

  function open() {
    if (isOpen) return;
    backFocus = document.activeElement;
    fly.hidden = false;
    isOpen = true;
    whoBtn.setAttribute("aria-expanded", "true");
    var first = -1;
    for (var n = 0; n < items.length; n++) {
      if (items[n].getAttribute("role") === "menuitemradio" && items[n].getAttribute("aria-checked") === "true") first = n;
    }
    if (first < 0) first = 0;
    setRoving(first);
  }

  function close(back) {
    if (!isOpen) return;
    fly.hidden = true;
    isOpen = false;
    whoBtn.setAttribute("aria-expanded", "false");
    if (back) {
      if (backFocus && backFocus.focus) backFocus.focus();
      else whoBtn.focus();
    }
  }

  whoBtn.addEventListener("click", function () {
    if (isOpen) close(true);
    else open();
  });

  menu.addEventListener("keydown", function (e) {
    var i = items.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (e.key === "ArrowDown") next = i + 1;
    if (e.key === "ArrowUp") next = i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next > -1) {
      e.preventDefault();
      while (next > -1 && next < items.length && items[next].classList.contains("mi__sep")) {
        next += e.key === "ArrowUp" ? -1 : 1;
      }
      setRoving(next);
      return;
    }
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      var at = items.indexOf(document.activeElement);
      setRoving(at + (e.shiftKey ? -1 : 1));
    }
  });

  menu.addEventListener("click", function (e) {
    var item = e.target.closest ? e.target.closest(".mi") : null;
    if (!item) return;
    if (item.getAttribute("role") === "menuitemradio") {
      setStatus(parseInt(item.getAttribute("data-status"), 10));
    }
    if (item.hasAttribute("data-act")) {
      var card = fly.querySelector(".fly__card");
      card.classList.remove("is-off");
      void card.offsetWidth;
      card.classList.add("is-off");
    }
    if (item.tagName === "A") close(false);
  });

  document.addEventListener("mousedown", function (e) {
    if (!isOpen) return;
    if (fly.contains(e.target) || whoBtn.contains(e.target)) return;
    close(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) { e.preventDefault(); close(true); }
  });

  document.addEventListener("focusin", function (e) {
    if (!isOpen) return;
    if (fly.contains(e.target) || whoBtn.contains(e.target)) return;
    close(false);
  });

  nav.addEventListener("keydown", function (e) {
    var i = navLinks.indexOf(document.activeElement);
    if (i < 0) return;
    var next = -1;
    if (e.key === "ArrowRight") next = i + 1;
    if (e.key === "ArrowLeft") next = i - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = navLinks.length - 1;
    if (next > -1 && next < navLinks.length) { e.preventDefault(); navLinks[next].focus(); }
  });

  function spy() {
    pending = false;
    var markY = window.innerHeight * 0.36;
    var now = "";
    for (var k = 0; k < bays.length; k++) {
      if (bays[k].getBoundingClientRect().top <= markY) now = bays[k].id;
    }
    for (var n = 0; n < navLinks.length; n++) {
      if (navLinks[n].getAttribute("href") === "#" + now) navLinks[n].setAttribute("aria-current", "true");
      else navLinks[n].removeAttribute("aria-current");
    }
    for (var s = 0; s < bays.length; s++) bays[s].classList.toggle("is-here", bays[s].id === now);
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  setStatus(0);
  spy();
})();
