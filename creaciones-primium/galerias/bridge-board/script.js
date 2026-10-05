(function () {
  "use strict";

  var board = document.getElementById("board");
  var slots = Array.prototype.slice.call(board.querySelectorAll(".slot"));
  var ledger = document.getElementById("ledger");
  var total = document.getElementById("total");
  var spread = document.getElementById("spread");
  var viewer = document.getElementById("viewer");
  var vimg = document.getElementById("vimg");
  var vcap = document.getElementById("vcap");
  var vcount = document.getElementById("vcount");
  var order = slots.slice();
  var focus = 0;
  var viewerOpen = false;
  var lastFocus = null;

  function load(el) {
    return Number(el.dataset.load);
  }

  function rated(el, n) {
    var pips = el.querySelectorAll(".slot__pips i");
    for (var i = 0; i < pips.length; i++) {
      pips[i].classList.toggle("lit", i < n);
    }
    var name = el.querySelector(".slot__name").textContent;
    el.setAttribute("aria-label", name + ". " + el.querySelector(".slot__kind").textContent + ". Load " + n + " of 5.");
  }

  function rank(a, b) {
    var d = load(b) - load(a);
    if (d !== 0) return d;
    return Number(a.dataset.k) - Number(b.dataset.k);
  }

  function render() {
    var sum = 0;
    var hi = 0;
    var lo = 5;
    order.forEach(function (el) {
      var n = load(el);
      sum += n;
      if (n > hi) hi = n;
      if (n < lo) lo = n;
      rated(el, n);
    });
    total.textContent = sum;
    spread.textContent = hi - lo;
    document.documentElement.style.setProperty("--spread", hi - lo);

    // Se construye cada <li> con createElement y se le anade al ledger:
    // antes era una cadena concatenada en `ledger.innerHTML = rows`, y CodeQL
    // marcaba "DOM text reinterpreted as HTML" al ver el `.slot__name` del
    // HTML del propio demo.
    ledger.replaceChildren();
    order.forEach(function (el) {
      var li = document.createElement("li");
      li.className = "ledger__row" + (order.indexOf(el) === focus ? " is-on" : "");
      var num = document.createElement("b");
      num.textContent = el.querySelector(".slot__no").textContent;
      var nombre = document.createElement("span");
      nombre.textContent = el.querySelector(".slot__name").textContent;
      var carga = document.createElement("i");
      carga.textContent = load(el) + " / 5";
      li.appendChild(num);
      li.appendChild(nombre);
      li.appendChild(carga);
      ledger.appendChild(li);
    });
  }

  function repack() {
    var active = document.activeElement;
    var keep = active && active.classList && active.classList.contains("slot") ? active : null;
    var before = {};
    order.forEach(function (el) {
      before[el.dataset.k] = el.getBoundingClientRect();
    });

    var next = order.slice().sort(rank);
    var changed = next.some(function (el, n) { return el !== order[n]; });
    if (!changed) { render(); return; }

    next.forEach(function (el) {
      board.appendChild(el);
    });
    order = next;
    if (keep) {
      var at = order.indexOf(keep);
      if (at !== -1) focus = at;
      keep.focus();
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { render(); return; }

    next.forEach(function (el) {
      var k = el.dataset.k;
      var a = before[k];
      var b = el.getBoundingClientRect();
      var dy = a.top - b.top;
      var dx = a.left - b.left;
      if (Math.abs(dy) < 1 && Math.abs(dx) < 1) return;
      el.classList.add("is-flip");
      el.style.transform = "translate(" + dx + "px," + dy + "px)";
    });

    board.getBoundingClientRect();

    next.forEach(function (el) {
      if (el.classList.contains("is-flip")) {
        el.classList.remove("is-flip");
        el.style.transform = "";
      }
    });
    render();
  }

  function setFocus(n, moveDom) {
    if (n < 0) n = 0;
    if (n > order.length - 1) n = order.length - 1;
    order.forEach(function (el, i) {
      el.classList.toggle("is-on", i === n);
    });
    focus = n;
    if (moveDom) order[n].focus();
    render();
  }

  function rate(d) {
    var el = order[focus];
    var n = load(el) + d;
    if (n < 1) n = 1;
    if (n > 5) n = 5;
    if (n === load(el)) return;
    el.dataset.load = n;
    repack();
  }

  slots.forEach(function (el) {
    el.addEventListener("click", function () {
      setFocus(order.indexOf(el), false);
    });
    el.addEventListener("focus", function () {
      if (order.indexOf(el) !== focus) setFocus(order.indexOf(el), false);
    });
    el.addEventListener("keydown", function (e) {
      var k = e.key;
      if (k === "ArrowRight") { e.preventDefault(); setFocus(focus + 1, true); }
      else if (k === "ArrowLeft") { e.preventDefault(); setFocus(focus - 1, true); }
      else if (k === "ArrowUp") { e.preventDefault(); rate(1); }
      else if (k === "ArrowDown") { e.preventDefault(); rate(-1); }
      else if (k === "Home") { e.preventDefault(); setFocus(0, true); }
      else if (k === "End") { e.preventDefault(); setFocus(order.length - 1, true); }
      else if (k === "Enter" || k === " ") { e.preventDefault(); open(order.indexOf(el)); }
    });
  });

  function show(i) {
    var el = order[i];
    var img = el.querySelector("img");
    vimg.setAttribute("src", img.getAttribute("src"));
    vimg.setAttribute("alt", img.getAttribute("alt"));
    vcap.textContent = el.querySelector(".slot__no").textContent + " \u00b7 " + el.querySelector(".slot__name").textContent +
      " \u00b7 " + el.querySelector(".slot__kind").textContent;
    vcount.textContent = el.querySelector(".slot__no").textContent + " / 0" + order.length;
  }

  function open(i) {
    if (i < 0) return;
    lastFocus = order[i];
    show(i);
    viewerOpen = true;
    viewer.removeAttribute("hidden");
    document.getElementById("vclose").focus();
  }

  function close() {
    viewerOpen = false;
    viewer.setAttribute("hidden", "");
    if (lastFocus) lastFocus.focus();
  }

  function step(d) {
    var i = (focus + d) % order.length;
    if (i < 0) i += order.length;
    setFocus(i, false);
    show(i);
  }

  document.addEventListener("keydown", function (e) {
    if (viewerOpen) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Home") { e.preventDefault(); setFocus(0, false); show(0); }
      else if (e.key === "End") { e.preventDefault(); setFocus(order.length - 1, false); show(order.length - 1); }
      return;
    }
    if (e.key === "Enter" && e.target === board) {
      e.preventDefault();
      open(focus);
    }
  });

  document.getElementById("vprev").addEventListener("click", function () { step(-1); });
  document.getElementById("vnext").addEventListener("click", function () { step(1); });
  document.getElementById("vclose").addEventListener("click", close);
  Array.prototype.forEach.call(viewer.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  setFocus(0, false);
  render();
})();
