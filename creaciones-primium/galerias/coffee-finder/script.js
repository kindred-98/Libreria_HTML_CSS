(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".card"));
  var field = document.getElementById("q");
  var clear = document.getElementById("clear");
  var tally = document.getElementById("tally");
  var empty = document.getElementById("empty");
  var grade = document.getElementById("grade");
  var gradeOut = document.getElementById("grade-out");
  var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
  var sorters = Array.prototype.slice.call(document.querySelectorAll("[data-sort]"));
  var reader = document.getElementById("reader");
  var rimg = document.getElementById("rimg");
  var rname = document.getElementById("rname");
  var rplace = document.getElementById("rplace");
  var rlic = document.getElementById("rlic");
  var rcount = document.getElementById("rcount");
  var active = {};
  var sortKey = "no";
  var cursor = 0;
  var readerOpen = false;
  var lastFocus = null;

  function flat(s) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function tagsOf(card) {
    return card.getAttribute("data-tags").split("|");
  }

  function hayOf(card) {
    return flat([
      card.getAttribute("data-name"),
      card.getAttribute("data-place"),
      card.getAttribute("data-author"),
      card.getAttribute("data-lic"),
      card.getAttribute("data-tags").replace(/\|/g, " ")
    ].join(" "));
  }

  function mark(text, tokens) {
    var out = escapeHtml(text);
    if (!tokens.length) return out;
    var re = new RegExp("(" + tokens.map(escapeRe).join("|") + ")", "gi");
    return out.replace(re, "<mark>$1</mark>");
  }

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeRe(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function tokens() {
    return field.value.toLowerCase().split(/\s+/).filter(function (t) { return t.length > 1; });
  }

  function matches(card) {
    var hay = hayOf(card);
    var tk = tokens();
    for (var i = 0; i < tk.length; i++) {
      if (hay.indexOf(flat(tk[i])) === -1) return false;
    }
    var tags = tagsOf(card);
    for (var key in active) {
      if (!Object.prototype.hasOwnProperty.call(active, key)) continue;
      var group = active[key];
      if (!group.length) continue;
      var hit = false;
      for (var j = 0; j < group.length; j++) {
        if (tags.indexOf(group[j]) !== -1) { hit = true; break; }
      }
      if (!hit) return false;
    }
    return true;
  }

  function paint(card, tk) {
    card.querySelector(".card__name").innerHTML = mark(card.getAttribute("data-name"), tk);
    card.querySelector(".card__meta").innerHTML =
      mark(card.getAttribute("data-place"), tk) + " &middot; " + mark(card.getAttribute("data-author"), tk);
    card.querySelector(".card__lic").innerHTML = mark(card.getAttribute("data-lic"), tk);
  }

  function apply() {
    var tk = tokens();
    var visible = [];
    cards.forEach(function (card) {
      var ok = matches(card);
      card.classList.toggle("is-out", !ok);
      paint(card, tk);
      if (ok) visible.push(card);
    });

    visible.sort(function (a, b) {
      if (sortKey === "place") return flat(a.getAttribute("data-place")).localeCompare(flat(b.getAttribute("data-place")));
      if (sortKey === "author") return flat(a.getAttribute("data-author")).localeCompare(flat(b.getAttribute("data-author")));
      return Number(a.getAttribute("data-no")) - Number(b.getAttribute("data-no"));
    });
    visible.forEach(function (card) { grid.appendChild(card); });

    var n = visible.length;
    tally.textContent = n + " of " + cards.length + " card" + (n === 1 ? "" : "s");
    empty.hidden = n !== 0;
    if (cursor >= n) cursor = Math.max(0, n - 1);
    markCursor();
    if (readerOpen) show(visible.length ? visible[cursor] : null);
  }

  function markCursor() {
    var visible = cards.filter(function (c) { return !c.classList.contains("is-out"); });
    visible.forEach(function (c, n) { c.classList.toggle("is-on", n === cursor); });
    return visible;
  }

  field.addEventListener("input", function () { cursor = 0; apply(); });

  clear.addEventListener("click", function () {
    field.value = "";
    chips.forEach(function (c) {
      if (c.getAttribute("data-key")) { c.classList.remove("is-on"); c.setAttribute("aria-pressed", "false"); }
    });
    active = {};
    cursor = 0;
    apply();
    field.focus();
  });

  chips.forEach(function (chip) {
    var key = chip.getAttribute("data-key");
    if (!key) return;
    chip.addEventListener("click", function () {
      var v = chip.getAttribute("data-v");
      var on = !chip.classList.contains("is-on");
      chip.classList.toggle("is-on", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
      active[key] = active[key] || [];
      var at = active[key].indexOf(v);
      if (on && at === -1) active[key].push(v);
      if (!on && at !== -1) active[key].splice(at, 1);
      cursor = 0;
      apply();
    });
  });

  sorters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      sortKey = btn.getAttribute("data-sort");
      sorters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      cursor = 0;
      apply();
    });
  });

  function applyGrade() {
    var v = Number(grade.value);
    document.documentElement.style.setProperty("--grade", v);
    gradeOut.textContent = v + "% graded";
    grade.setAttribute("aria-valuetext", v + " percent, a view grade only");
  }

  grade.addEventListener("input", applyGrade);
  applyGrade();

  function show(card) {
    if (!card) return;
    var img = card.querySelector("img");
    rimg.setAttribute("src", img.getAttribute("src"));
    rimg.setAttribute("alt", img.getAttribute("alt"));
    rname.textContent = card.getAttribute("data-no") + " \u00b7 " + card.getAttribute("data-name");
    rplace.textContent = card.getAttribute("data-place") + " \u00b7 " + card.getAttribute("data-author");
    rlic.textContent = card.getAttribute("data-lic");
    var visible = cards.filter(function (c) { return !c.classList.contains("is-out"); });
    rcount.textContent = card.getAttribute("data-no") + " / " + (visible.length < 10 ? "0" : "") + visible.length;
  }

  function open() {
    var visible = markCursor();
    if (!visible.length) return;
    lastFocus = document.activeElement;
    show(visible[cursor]);
    readerOpen = true;
    reader.removeAttribute("hidden");
    document.getElementById("rclose").focus();
  }

  function close() {
    readerOpen = false;
    reader.setAttribute("hidden", "");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    var visible = markCursor();
    if (!visible.length) return;
    cursor = (cursor + d + visible.length) % visible.length;
    markCursor();
    show(visible[cursor]);
    visible[cursor].focus();
  }

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      var visible = markCursor();
      cursor = visible.indexOf(card);
      if (cursor === -1) cursor = 0;
      markCursor();
      open();
    });
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); open(); }
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); step(-1); }
      else if (e.key === "Home") { e.preventDefault(); cursor = 0; markCursor(); open(); }
      else if (e.key === "End") {
        e.preventDefault();
        cursor = cards.filter(function (c) { return !c.classList.contains("is-out"); }).length - 1;
        markCursor();
        open();
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (readerOpen) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "Home") { e.preventDefault(); cursor = 0; markCursor(); show(markCursor()[0]); }
      else if (e.key === "End") {
        e.preventDefault();
        var v = markCursor();
        cursor = v.length - 1;
        markCursor();
        show(v[v.length - 1]);
      }
      return;
    }
    if (e.key === "/" && e.target !== field) {
      e.preventDefault();
      field.focus();
      field.select();
    } else if (e.key === "Escape" && e.target === field && field.value) {
      e.preventDefault();
      field.value = "";
      cursor = 0;
      apply();
    }
  });

  document.getElementById("rprev").addEventListener("click", function () { step(-1); });
  document.getElementById("rnext").addEventListener("click", function () { step(1); });
  document.getElementById("rclose").addEventListener("click", close);
  Array.prototype.forEach.call(reader.querySelectorAll("[data-close]"), function (el) {
    el.addEventListener("click", close);
  });

  apply();
})();
