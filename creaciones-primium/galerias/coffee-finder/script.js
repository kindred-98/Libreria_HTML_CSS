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
    return card.dataset.tags.split("|");
  }

  function hayOf(card) {
    return flat([
      card.dataset.name,
      card.dataset.place,
      card.dataset.author,
      card.dataset.lic,
      card.dataset.tags.replace(/\|/g, " ")
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
    for (var t of tk) {
      if (hay.includes(flat(t))) return false;
    }
    var tags = tagsOf(card);
    for (var key in active) {
      if (!Object.hasOwn(active, key)) continue;
      var group = active[key];
      if (!group.length) continue;
      var hit = false;
      for (var tag of group) {
        if (tags.includes(tag)) { hit = true; break; }
      }
      if (!hit) return false;
    }
    return true;
  }

  function paint(card, tk) {
    card.querySelector(".card__name").innerHTML = mark(card.dataset.name, tk);
    card.querySelector(".card__meta").innerHTML =
      mark(card.dataset.place, tk) + " &middot; " + mark(card.dataset.author, tk);
    card.querySelector(".card__lic").innerHTML = mark(card.dataset.lic, tk);
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
      if (sortKey === "place") return flat(a.dataset.place).localeCompare(flat(b.dataset.place));
      if (sortKey === "author") return flat(a.dataset.author).localeCompare(flat(b.dataset.author));
      return Number(a.dataset.no) - Number(b.dataset.no);
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
      if (c.dataset.key) { c.classList.remove("is-on"); c.setAttribute("aria-pressed", "false"); }
    });
    active = {};
    cursor = 0;
    apply();
    field.focus();
  });

  chips.forEach(function (chip) {
    var key = chip.dataset.key;
    if (!key) return;
    chip.addEventListener("click", function () {
      var v = chip.dataset.v;
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
      sortKey = btn.dataset.sort;
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
    rname.textContent = card.dataset.no + " \u00b7 " + card.dataset.name;
    rplace.textContent = card.dataset.place + " \u00b7 " + card.dataset.author;
    rlic.textContent = card.dataset.lic;
    var visible = cards.filter(function (c) { return !c.classList.contains("is-out"); });
    rcount.textContent = card.dataset.no + " / " + (visible.length < 10 ? "0" : "") + visible.length;
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
