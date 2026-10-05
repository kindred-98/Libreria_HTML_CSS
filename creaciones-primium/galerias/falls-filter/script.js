(function () {
  "use strict";

  var stock = document.getElementById("stock");
  var headRow = document.getElementById("headRow");
  var poolRow = document.getElementById("poolRow");
  var headCount = document.getElementById("headCount");
  var poolCount = document.getElementById("poolCount");
  var tally = document.getElementById("tally");
  var level = document.getElementById("level");
  var levelOut = document.getElementById("levelOut");
  var kinds = Array.prototype.slice.call(document.querySelectorAll(".kind"));
  var viewer = document.getElementById("viewer");
  var vimg = document.getElementById("vimg");
  var vcap = document.getElementById("vcap");
  var vcount = document.getElementById("vcount");
  var pool = [];
  var kind = "all";
  var viewerOpen = false;
  var lastName = null;

  Array.prototype.forEach.call(stock.content.querySelectorAll(".card"), function (tpl) {
    pool.push(tpl);
  });

  function h(card) {
    return Number(card.dataset.h);
  }

  function keep(tpl) {
    return kind === "all" || tpl.dataset.kind === kind;
  }

  function order(a, b) {
    return h(b) - h(a);
  }

  function setLevel(v) {
    document.documentElement.style.setProperty("--lv", v / 25);
    levelOut.textContent = v + " m";
    level.setAttribute("aria-valuetext", v + " metres of water");
    render();
  }

  function render() {
    var v = Number(level.value);
    var head = [];
    var low = [];
    pool.forEach(function (tpl) {
      if (!keep(tpl)) return;
      if (h(tpl) > v) head.push(tpl);
      else low.push(tpl);
    });
    head.sort(order);
    low.sort(order);

    headRow.innerHTML = "";
    poolRow.innerHTML = "";
    head.forEach(function (tpl) { headRow.appendChild(build(tpl)); });
    low.forEach(function (tpl) { poolRow.appendChild(build(tpl)); });

    headCount.textContent = head.length;
    poolCount.textContent = low.length;
    var n = head.length + low.length;
    tally.textContent = n + " of " + pool.length + " fall" + (n === 1 ? "" : "s") + " on the register";
    if (viewerOpen) show(currentCard());
  }

  var seq = 0;

  function build(tpl) {
    var el = tpl.cloneNode(true);
    el.removeAttribute("tabindex");
    el.style.animationDelay = (seq % 8) * 40 + "ms";
    seq++;
    el.addEventListener("click", function () {
      open(el);
    });
    el.addEventListener("keydown", function (e) {
      var list = Array.prototype.slice.call(el.parentNode.children);
      var at = list.indexOf(el);
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        focusAt(list, Math.min(at + 1, list.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        focusAt(list, Math.max(at - 1, 0));
      } else if (e.key === "Home") { e.preventDefault(); focusAt(list, 0); }
      else if (e.key === "End") { e.preventDefault(); focusAt(list, list.length - 1); }
    });
    return el;
  }

  function focusAt(list, n) {
    if (!list.length) return;
    list[n].setAttribute("tabindex", "0");
    list[n].focus();
    Array.prototype.forEach.call(list, function (c, i) {
      c.classList.toggle("is-on", i === n);
    });
  }

  function allCards() {
    return Array.prototype.slice.call(headRow.children).concat(Array.prototype.slice.call(poolRow.children));
  }

  function currentCard() {
    var all = allCards();
    return all.length ? all[0] : null;
  }

  function show(el) {
    if (!el) return;
    var img = el.querySelector("img");
    var all = allCards();
    var at = all.indexOf(el);
    vimg.setAttribute("src", img.getAttribute("src"));
    vimg.setAttribute("alt", img.getAttribute("alt"));
    vcap.textContent = el.querySelector(".card__h").textContent + " \u00b7 " + el.querySelector(".card__n").textContent +
      " \u00b7 " + el.querySelector(".card__k").textContent + " \u00b7 " + el.querySelector(".card__a").textContent;
    vcount.textContent = (at < 9 ? "0" : "") + (at + 1) + " / " + (all.length < 10 ? "0" : "") + all.length;
  }

  function open(el) {
    lastName = el.querySelector(".card__n").textContent;
    show(el);
    viewerOpen = true;
    viewer.removeAttribute("hidden");
    document.getElementById("vclose").focus();
  }

  function close() {
    viewerOpen = false;
    viewer.setAttribute("hidden", "");
    var all = allCards();
    var back = null;
    for (var card of all) {
      if (card.querySelector(".card__n").textContent === lastName) { back = card; break; }
    }
    if (back) {
      back.setAttribute("tabindex", "0");
      back.focus();
      Array.prototype.forEach.call(back.parentNode.children, function (c) { c.classList.remove("is-on"); });
      back.classList.add("is-on");
    }
  }

  function step(d) {
    var all = allCards();
    if (!all.length) return;
    var at = all.indexOf(document.activeElement.closest ? document.activeElement.closest(".card") : null);
    if (at === -1) at = 0;
    var next = (at + d + all.length) % all.length;
    all[next].setAttribute("tabindex", "0");
    all[next].focus();
    Array.prototype.forEach.call(all, function (c, i) { c.classList.toggle("is-on", i === next); });
    show(all[next]);
  }

  level.addEventListener("input", function () { setLevel(Number(level.value)); });

  kinds.forEach(function (btn) {
    btn.addEventListener("click", function () {
      kind = btn.dataset.kind;
      kinds.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      seq = 0;
      render();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (!viewerOpen) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "Home") { e.preventDefault(); var all = allCards(); if (all.length) { all[0].focus(); show(all[0]); } }
    else if (e.key === "End") {
      e.preventDefault();
      var list = allCards();
      if (list.length) { list[list.length - 1].focus(); show(list[list.length - 1]); }
    }
  });

  document.getElementById("vprev").addEventListener("click", function () { step(-1); });
  document.getElementById("vnext").addEventListener("click", function () { step(1); });
  document.getElementById("vclose").addEventListener("click", close);
  Array.prototype.forEach.call(viewer.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  setLevel(Number(level.value));
})();
