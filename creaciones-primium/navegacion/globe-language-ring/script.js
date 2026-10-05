(function () {
  var LANGS = [
    { code: "en", native: "English", strings: [
      "The Meridian Review · issue forty one · six languages",
      "One magazine,<br><em>six desks</em>",
      "The frame, the furniture and the headlines of this issue change with the language you choose. The feature text stays in the language it was written in, because a translation nobody owns is a translation nobody corrects.",
      "Edited in Lisbon and Kyoto · printed in Ghent",
      "Cover", "Dispatch", "Interview", "Atlas", "Letters",
      "Cover · the issue in one page", "Dispatch · three cities", "Interview · a long conversation",
      "Atlas · maps and margins", "Letters · from the readers",
      "The issue in one page", "Three cities, one week", "A long conversation about borders",
      "Maps, margins and the space between", "From the readers of thirty countries",
      "The Meridian Review · six languages · one issue",
      "Choose the language of the frame",
      "Arrow keys walk the ring, Enter applies it, Escape closes it and hands the focus back to the button that opened it.",
      "Meridian Review — Globe Language Ring"
    ] },
    { code: "es", native: "Español", strings: [
      "The Meridian Review · número cuarenta y uno · seis idiomas",
      "Una revista,<br><em>seis mesas</em>",
      "El marco, los titulares y la estructura de este número cambian con el idioma que elijas. El texto del reportaje se queda en la lengua en que se escribió, porque una traducción que nadie posee es una traducción que nadie corrige.",
      "Editada en Lisboa y Kioto · impresa en Gante",
      "Portada", "Crónica", "Entrevista", "Atlas", "Cartas",
      "Portada · el número en una página", "Crónica · tres ciudades", "Entrevista · una conversación larga",
      "Atlas · mapas y márgenes", "Cartas · de los lectores",
      "El número en una página", "Tres ciudades, una semana", "Una conversación larga sobre las fronteras",
      "Mapas, márgenes y el espacio entremedo", "De los lectores de treinta países",
      "The Meridian Review · seis idiomas · un número",
      "Elige el idioma del marco",
      "Las flechas recorren el anillo, Intro lo aplica y Escape lo cierra y devuelve el foco al botón que lo abrió.",
      "Meridian Review — Anillo de idiomas"
    ] },
    { code: "fr", native: "Français", strings: [
      "The Meridian Review · numéro quarante et un · six langues",
      "Un magazine,<br><em>six bureaux</em>",
      "Le cadre, les titres et le mobilier de ce numéro changent avec la langue choisie. Le texte du reportage reste dans la langue où il a été écrit, parce qu'une traduction que personne ne possède est une traduction que personne ne corrige.",
      "Édité à Lisbonne et à Kyoto · imprimé à Gand",
      "Couverture", "Chronique", "Entretien", "Atlas", "Courrier",
      "Couverture · le numéro en une page", "Chronique · trois villes", "Entretien · une longue conversation",
      "Atlas · cartes et marges", "Courrier · de nos lecteurs",
      "Le numéro en une page", "Trois villes, une semaine", "Une longue conversation sur les frontières",
      "Cartes, marges et l'espace entre les deux", "Des lecteurs de trente pays",
      "The Meridian Review · six langues · un numéro",
      "Choisissez la langue du cadre",
      "Les flèches parcourent l'anneau, Entrée applique le choix et Échap ferme en rendant le focus au bouton d'origine.",
      "Meridian Review — Anneau des langues"
    ] },
    { code: "de", native: "Deutsch", strings: [
      "The Meridian Review · Ausgabe einundvierzig · sechs Sprachen",
      "Eine Zeitschrift,<br><em>sechs Schreibtische</em>",
      "Rahmen, Schlagzeilen und Aufbau dieser Ausgabe wechseln mit der gewählten Sprache. Der Reportagetext bleibt in der Sprache, in der er geschrieben wurde, denn eine Übersetzung, die niemandem gehört, wird von niemandem korrigiert.",
      "Redaktion Lissabon und Kyoto · gedruckt in Gent",
      "Titelseite", "Chronik", "Interview", "Atlas", "Briefe",
      "Titelseite · die Ausgabe auf einen Blick", "Chronik · drei Städte", "Interview · ein langes Gespräch",
      "Atlas · Karten und Ränder", "Briefe · aus der Leserschaft",
      "Die Ausgabe auf einen Blick", "Drei Städte, eine Woche", "Ein langes Gespräch über Grenzen",
      "Karten, Ränder und der Raum dazwischen", "Aus der Leserschaft von dreißig Ländern",
      "The Meridian Review · sechs Sprachen · eine Ausgabe",
      "Wähle die Sprache des Rahmens",
      "Die Pfeiltasten gehen den Ring entlang, Eingabe wendet an, Escape schließt und gibt den Fokus an den Auslöser zurück.",
      "Meridian Review — Sprachring"
    ] },
    { code: "pt", native: "Português", strings: [
      "The Meridian Review · número quarenta e um · seis idiomas",
      "Uma revista,<br><em>seis secretárias</em>",
      "A moldura, os títulos e a estrutura deste número mudam com o idioma escolhido. O texto da reportagem fica na língua em que foi escrito, porque uma tradução que ninguém possui é uma tradução que ninguém corrige.",
      "Editada em Lisboa e Quioto · impressa em Gante",
      "Capa", "Crónica", "Entrevista", "Atlas", "Cartas",
      "Capa · o número numa página", "Crónica · três cidades", "Entrevista · uma conversa longa",
      "Atlas · mapas e margens", "Cartas · dos leitores",
      "O número numa página", "Três cidades, uma semana", "Uma conversa longa sobre fronteiras",
      "Mapas, margens e o espaço entre", "Dos leitores de trinta países",
      "The Meridian Review · seis idiomas · um número",
      "Escolha o idioma da moldura",
      "As setas percorrem o anel, Enter aplica e Escape fecha e devolve o foco ao botão que o abriu.",
      "Meridian Review — Anel de idiomas"
    ] },
    { code: "ja", native: "日本語", strings: [
      "The Meridian Review · 四十一号 · 六言語",
      "一つの雑誌、<br><em>六つの机</em>",
      "紙面の見出しと構成は、選ぶ言語が変わればそのまま入れ替わります。取材の本文は書かれた言語のままでいて、誰も所有しない翻訳は誰も直さないからです。",
      "リスボンと京都で編集 · ヘントで印刷",
      "表紙", "時報", "対談", "地図帳", "短信",
      "表紙 · 一頁で読む号", "時報 · 三つの街", "対談 · 長い対話",
      "地図帳 · 地図と余白", "短信 · 読者から",
      "一頁で読む号", "三つの街、一週間", "国境についての長い対話",
      "地図、余白、そしてあいだの空間", "三十の国からの読者",
      "The Meridian Review · 六言語 · 一つの号",
      "紙面の言語を選ぶ",
      "矢印キーで輪を回り、Enterで適用し、Escapeで閉じてフォーカスがボタンに戻ります。",
      "Meridian Review — 言語の輪"
    ] }
  ];

  var langBtn = document.getElementById("langBtn");
  var langCode = document.getElementById("langCode");
  var ring = document.getElementById("ring");
  var scrim = document.getElementById("scrim");
  var list = document.getElementById("ringList");
  var ringCode = document.getElementById("ringCode");
  var ringNative = document.getElementById("ringNative");
  var ringClose = document.getElementById("ringClose");
  var footCode = document.getElementById("footCode");
  var features = Array.prototype.slice.call(document.querySelectorAll(".feature"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__i"));
  var items = [];
  var current = 0;
  var isOpen = false;
  var backFocus = null;
  var pending = false;
  var store = null;
  try { store = window.sessionStorage; } catch (e) { store = null; }

  function build() {
    var out = "";
    for (var k = 0; k < LANGS.length; k++) {
      var a = -90 + k * (360 / LANGS.length);
      out += '<li style="--a:' + a.toFixed(2) + 'deg">' +
        '<button class="ring__it" type="button" role="menuitemradio" tabindex="-1" aria-checked="false" data-k="' + k + '"' +
        ' aria-label="' + LANGS[k].native + '">' +
        '<span class="ring__tok">' + LANGS[k].code.toUpperCase() + "</span>" +
        '<span class="ring__nm">' + LANGS[k].native + "</span></button></li>";
    }
    list.innerHTML = out;
    items = Array.prototype.slice.call(list.querySelectorAll(".ring__it"));
    for (var n = 0; n < items.length; n++) {
      (function (btn, i) {
        btn.addEventListener("click", function () {
          apply(i);
          close(true);
        });
      })(items[n], n);
    }
  }

  function apply(k) {
    current = k;
    var lang = LANGS[k];
    var slots = document.querySelectorAll("[data-i18n]");
    for (const slot of slots) {
      var i = parseInt(slot.dataset.i18n, 10);
      if (lang.strings[i] !== undefined) slot.textContent = lang.strings[i];
    }
    var rich = document.querySelectorAll("[data-i18n-html]");
    for (const node of rich) {
      var j = parseInt(node.dataset.i18nHtml, 10);
      if (lang.strings[j] !== undefined) node.innerHTML = lang.strings[j];
    }
    var aria = document.querySelector("[data-i18n-aria]");
    if (aria) {
      var a = parseInt(aria.dataset.i18nAria, 10);
      if (lang.strings[a] !== undefined) {
        aria.setAttribute("aria-label", lang.code.toUpperCase() + " · " + lang.native + " · " + lang.strings[a]);
      }
    }
    document.documentElement.setAttribute("lang", lang.code);
    document.title = lang.strings[22];
    langCode.textContent = lang.code.toUpperCase();
    footCode.textContent = lang.code.toUpperCase();
    ringCode.textContent = lang.code.toUpperCase();
    ringNative.textContent = lang.native;
    for (var t = 0; t < items.length; t++) {
      items[t].setAttribute("aria-checked", t === k ? "true" : "false");
      items[t].setAttribute("tabindex", t === k ? "0" : "-1");
    }
    if (store) { try { store.setItem("meridianLang", lang.code); } catch {} }
  }

  function setCursor(k) {
    if (k < 0) k = items.length - 1;
    if (k >= items.length) k = 0;
    for (var n = 0; n < items.length; n++) items[n].setAttribute("tabindex", n === k ? "0" : "-1");
    items[k].focus();
  }

  function open() {
    if (isOpen) return;
    backFocus = document.activeElement;
    scrim.style.display = "block";
    ring.hidden = false;
    isOpen = true;
    langBtn.setAttribute("aria-expanded", "true");
    setCursor(current);
  }

  function close(back) {
    if (!isOpen) return;
    ring.hidden = true;
    scrim.style.display = "none";
    isOpen = false;
    langBtn.setAttribute("aria-expanded", "false");
    if (back) {
      if (backFocus?.focus) backFocus.focus();
      else langBtn.focus();
    }
  }

  langBtn.addEventListener("click", function () {
    if (isOpen) close(true);
    else open();
  });
  ringClose.addEventListener("click", function () { close(true); });
  scrim.addEventListener("click", function () { close(false); });

  ring.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); close(true); return; }
    var here = items.indexOf(document.activeElement);
    if (here < 0) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCursor(current);
      }
      return;
    }
    var next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = here + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = here - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next > -1) { e.preventDefault(); setCursor(next); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      var f = [ringClose];
      for (const item of items) if (item.offsetParent !== null) f.push(item);
      var order = f.filter(function (el) { return el.offsetParent !== null; });
      var at = order.indexOf(document.activeElement);
      var to = order[(at + (e.shiftKey ? -1 : 1) + order.length) % order.length];
      to.focus();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) { e.preventDefault(); close(true); }
  });

  function spy() {
    pending = false;
    var markY = window.innerHeight * 0.36;
    var now = "";
    for (const feature of features) {
      if (feature.getBoundingClientRect().top <= markY) now = feature.id;
    }
    for (const link of navLinks) {
      if (link.getAttribute("href") === "#" + now) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
    for (const f of features) f.classList.toggle("is-here", f.id === now);
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  build();
  var start = 0;
  if (store) {
    var saved = null;
    try { saved = store.getItem("meridianLang"); } catch (e) { saved = null; }
    for (var k = 0; k < LANGS.length; k++) {
      if (saved && LANGS[k].code === saved) start = k;
    }
  }
  apply(start);
  spy();
})();
