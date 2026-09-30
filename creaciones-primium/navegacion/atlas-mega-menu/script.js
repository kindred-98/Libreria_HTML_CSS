(function () {
  var wrap = document.getElementById("barwrap");
  var btn = document.getElementById("megaBtn");
  var mega = document.getElementById("mega");
  var cols = mega.querySelectorAll(".mega__col");
  var scenes = mega.querySelectorAll(".scene");
  var current = "dunes";

  function setScene(name) {
    if (!name) return;
    for (var i = 0; i < cols.length; i++) {
      cols[i].classList.toggle("is-live", cols[i].getAttribute("data-scene") === name);
    }
    if (name === current) return;
    current = name;
    for (var k = 0; k < scenes.length; k++) {
      scenes[k].classList.toggle("is-on", scenes[k].getAttribute("data-scene") === name);
    }
  }

  function isOpen() { return wrap.classList.contains("is-open"); }
  function isPinned() { return wrap.classList.contains("is-pinned"); }

  function open(pin) {
    wrap.classList.add("is-open");
    if (pin) wrap.classList.add("is-pinned");
    btn.setAttribute("aria-expanded", "true");
  }

  function close(returnFocus) {
    wrap.classList.remove("is-open");
    wrap.classList.remove("is-pinned");
    btn.setAttribute("aria-expanded", "false");
    if (returnFocus) btn.focus();
  }

  function focusFirst() {
    var first = mega.querySelector("a");
    if (first) first.focus();
  }

  btn.addEventListener("click", function () {
    if (isOpen() && isPinned()) close(false);
    else if (isOpen()) wrap.classList.add("is-pinned");
    else open(true);
  });

  wrap.addEventListener("mouseenter", function () {
    if (!isOpen()) open(false);
  });

  wrap.addEventListener("mouseleave", function () {
    if (!isPinned() && !mega.contains(document.activeElement)) close(false);
  });

  btn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open(true);
      focusFirst();
    } else if (e.key === "Escape") {
      close(true);
    }
  });

  mega.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    }
  });

  mega.addEventListener("focusin", function (e) {
    var col = e.target.closest(".mega__col");
    if (col) setScene(col.getAttribute("data-scene"));
  });

  mega.addEventListener("mouseover", function (e) {
    var col = e.target.closest(".mega__col");
    if (col) setScene(col.getAttribute("data-scene"));
  });

  mega.addEventListener("click", function (e) {
    if (e.target.closest("a")) close(false);
  });

  mega.addEventListener("focusout", function (e) {
    if (!mega.contains(e.relatedTarget) && e.relatedTarget !== btn) close(false);
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest("#barwrap")) close(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) close(true);
  });

  setScene("dunes");
})();
