(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var CATS = [
    {
      t: "Lady holding a cat", a: "Francesco Bacchiacca", l: "Public domain", tag: "Renaissance panel",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Bacchiacca_-_Portrait_of_a_young_lady_holding_a_cat.jpg/960px-Bacchiacca_-_Portrait_of_a_young_lady_holding_a_cat.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Bacchiacca_-_Portrait_of_a_young_lady_holding_a_cat.jpg",
      alt: "Renaissance portrait of a young lady holding a cat in her arms"
    },
    {
      t: "Cat on snow", a: "Von.grzanka", l: "CC BY-SA 3.0", tag: "Outdoors",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/960px-Felis_catus-cat_on_snow.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg",
      alt: "A cat standing in deep snow with its tail raised"
    },
    {
      t: "A tired twenty year old", a: "Dimitri Torterat", l: "CC BY 2.0 FR", tag: "Close study",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Tired_20-year-old_cat.jpg/960px-Tired_20-year-old_cat.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Tired_20-year-old_cat.jpg",
      alt: "Close photograph of a twenty year old cat lying down with its eyes half closed"
    },
    {
      t: "August, sitting", a: "Alvesgaspar", l: "CC BY-SA 3.0", tag: "Indoor",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Cat_August_2010-3.jpg/960px-Cat_August_2010-3.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Cat_August_2010-3.jpg",
      alt: "A cat sitting upright indoors and looking straight at the camera"
    },
    {
      t: "November, on a sill", a: "Alvesgaspar", l: "CC BY-SA 3.0", tag: "Indoor",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/960px-Cat_November_2010-1a.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Cat_November_2010-1a.jpg",
      alt: "A cat resting on a window sill in the low light of late autumn"
    },
    {
      t: "Cat in Iran", a: "درفش کاویانی", l: "CC BY-SA 3.0", tag: "Outdoors",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cat_Iran.jpg/960px-Cat_Iran.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Cat_Iran.jpg",
      alt: "A cat photographed outdoors in Iran in bright daylight"
    },
    {
      t: "Self portrait, yawning", a: "Joseph Ducreux", l: "Public domain", tag: "Oil on canvas",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Joseph_Ducreux_%28French%29_-_Self-Portrait%2C_Yawning_-_Google_Art_Project.jpg/960px-Joseph_Ducreux_%28French%29_-_Self-Portrait%2C_Yawning_-_Google_Art_Project.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Joseph_Ducreux_(French)_-_Self-Portrait,_Yawning_-_Google_Art_Project.jpg",
      alt: "Eighteenth century oil self portrait of a man caught mid yawn"
    },
    {
      t: "Kit-cat portrait of a man", a: "Godfrey Kneller", l: "Public domain", tag: "Oil on canvas",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/John_Locke%27s_Kit-cat_portrait_by_Godfrey_Kneller%2C_National_Portrait_Gallery%2C_London.JPG/960px-John_Locke%27s_Kit-cat_portrait_by_Godfrey_Kneller%2C_National_Portrait_Gallery%2C_London.JPG",
      p: "https://commons.wikimedia.org/wiki/File:John_Locke%27s_Kit-cat_portrait_by_Godfrey_Kneller,_National_Portrait_Gallery,_London.JPG",
      alt: "Seventeenth century kit-cat portrait of a seated man by Godfrey Kneller"
    },
    {
      t: "Self portrait with a palette", a: "Anna Bilińska-Bohdanowicz", l: "Public domain", tag: "Oil on canvas",
      u: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Self-portrait_by_Anna_Bili%C5%84ska-Bohdanowiczowa%2C_1887.jpg/960px-Self-portrait_by_Anna_Bili%C5%84ska-Bohdanowiczowa%2C_1887.jpg",
      p: "https://commons.wikimedia.org/wiki/File:Self-portrait_by_Anna_Bili%C5%84ska-Bohdanowiczowa,_1887.jpg",
      alt: "Self portrait of a painter holding a palette, painted in 1887"
    }
  ];

  var deck = document.getElementById("deck");
  var dots = document.getElementById("dots");
  var burst = document.getElementById("burst");
  var play = document.getElementById("play");
  var tally = document.querySelector(".console__tally");
  var now = document.getElementById("now");

  function pad(n) { return n < 10 ? "0" + n : "" + n; }

  var cards = CATS.map(function (cat, i) {
    var btn = document.createElement("button");
    btn.className = "card";
    btn.type = "button";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Sitter " + (i + 1) + ", " + cat.t);
    btn.style.setProperty("--i", String(i));

    var img = document.createElement("img");
    img.className = "card__img";
    img.setAttribute("src", cat.u);
    img.setAttribute("alt", cat.alt);
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");

    var edge = document.createElement("span");
    edge.className = "card__edge";

    btn.appendChild(edge);
    btn.appendChild(img);
    deck.appendChild(btn);
    return btn;
  });

  var marks = CATS.map(function (cat, i) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "dots__dot";
    b.setAttribute("aria-label", "Go to sitter " + (i + 1));
    b.setAttribute("aria-pressed", "false");
    li.appendChild(b);
    dots.appendChild(li);
    return b;
  });

  var at = 0;

  function set(next) {
    at = (next + cards.length) % cards.length;
    cards.forEach(function (card, k) {
      var off = k - at;
      if (off > cards.length / 2) { off -= cards.length; }
      if (off < -cards.length / 2) { off += cards.length; }
      card.style.setProperty("--off", String(off));
      card.style.setProperty("--aoff", String(off < 0 ? -off : off));
      card.classList.toggle("is-on", k === at);
      card.setAttribute("aria-pressed", k === at ? "true" : "false");
    });
    marks.forEach(function (mark, k) {
      mark.setAttribute("aria-pressed", k === at ? "true" : "false");
    });
    tally.textContent = "Sitter " + pad(at + 1) + " of " + pad(cards.length);
    now.textContent = CATS[at].t + " \u00b7 " + CATS[at].tag + " \u00b7 " + CATS[at].a;
    burst.style.setProperty("--hue", String(18 + (at % 3) * 12));
  }

  function showFull(n) {
    var k = (n + cards.length) % cards.length;
    var cat = CATS[k];
    var img = cards[k].querySelector(".card__img");
    var fImg = document.getElementById("sitterImg");
    fImg.setAttribute("src", img.getAttribute("src"));
    fImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("sitterNo").textContent = pad(k + 1) + " / " + pad(cards.length);
    document.getElementById("sitterTitle").textContent = cat.t;
    document.getElementById("sitterA").textContent = cat.a + " \u00b7 " + cat.l;
    document.getElementById("sitterLink").setAttribute("href", cat.p);
  }

  var sitter = document.getElementById("sitter");
  var sClose = document.getElementById("sitterClose");
  var opener = null;

  function openFull(n, from) {
    opener = from;
    showFull(n);
    sitter.hidden = false;
    requestAnimationFrame(function () { sitter.classList.add("is-open"); });
    sClose.focus();
  }

  function shut() {
    sitter.classList.remove("is-open");
    var seal = function () { sitter.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener) { opener.focus(); opener = null; }
  }

  function ring() {
    return Array.prototype.slice.call(
      sitter.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (node) { return node.offsetParent !== null; });
  }

  deck.addEventListener("click", function (ev) {
    var card = ev.target.closest(".card");
    if (!card) { return; }
    var k = cards.indexOf(card);
    if (k > -1) { set(k); }
  });

  deck.addEventListener("dblclick", function (ev) {
    var card = ev.target.closest(".card");
    if (!card) { return; }
    var k = cards.indexOf(card);
    if (k > -1) { openFull(k, card); }
  });

  deck.addEventListener("keydown", function (ev) {
    var card = ev.target.closest(".card");
    if (!card) { return; }
    var here = cards.indexOf(card);
    var to = -1;
    if (ev.key === "ArrowRight") { to = here + 1; }
    else if (ev.key === "ArrowLeft") { to = here - 1; }
    else if (ev.key === "Home") { to = 0; }
    else if (ev.key === "End") { to = cards.length - 1; }
    if (to < 0) { return; }
    ev.preventDefault();
    set(to);
    cards[(to + cards.length) % cards.length].focus();
  });

  var dragX = null;

  deck.addEventListener("pointerdown", function (ev) {
    dragX = ev.clientX;
  });

  deck.addEventListener("pointerup", function (ev) {
    if (dragX === null) { return; }
    var dx = ev.clientX - dragX;
    dragX = null;
    if (Math.abs(dx) > 40) { set(at + (dx < 0 ? 1 : -1)); }
  });

  deck.addEventListener("pointercancel", function () { dragX = null; });

  marks.forEach(function (mark, k) {
    mark.addEventListener("click", function () { set(k); });
  });

  document.getElementById("prev").addEventListener("click", function () { set(at - 1); });
  document.getElementById("next").addEventListener("click", function () { set(at + 1); });

  var running = !calm.matches;
  var timer = 0;

  function tick() {
    if (!running) { return; }
    set(at + 1);
    timer = setTimeout(tick, 4200);
  }

  play.addEventListener("click", function () {
    running = !running;
    play.setAttribute("aria-pressed", running ? "true" : "false");
    play.textContent = running ? "Pause the deck" : "Play the deck";
    clearTimeout(timer);
    if (running) { timer = setTimeout(tick, 4200); }
  });

  document.getElementById("sitterPrev").addEventListener("click", function () { showFull(at - 1); });
  document.getElementById("sitterNext").addEventListener("click", function () { showFull(at + 1); });
  sClose.addEventListener("click", shut);
  sitter.querySelector(".sitter__scrim").addEventListener("click", shut);

  document.addEventListener("keydown", function (ev) {
    if (sitter.hidden) { return; }
    if (ev.key === "Escape") { ev.preventDefault(); shut(); }
    else if (ev.key === "ArrowRight") { ev.preventDefault(); showFull(at + 1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); showFull(at - 1); }
    else if (ev.key === "Home") { ev.preventDefault(); showFull(0); }
    else if (ev.key === "End") { ev.preventDefault(); showFull(cards.length - 1); }
    else if (ev.key === "Tab") {
      var list = ring();
      if (!list.length) { return; }
      var pos = list.indexOf(document.activeElement);
      var next = ev.shiftKey ? pos - 1 : pos + 1;
      if (next < 0 || next >= list.length) {
        ev.preventDefault();
        list[(next + list.length) % list.length].focus();
      }
    }
  });

  var t0 = 0;

  function ray(now) {
    if (!t0) { t0 = now; }
    var s = (now - t0) / 1000;
    burst.style.transform = "translate3d(" + (Math.sin(s * 0.21) * 2.2).toFixed(2) + "%," + (Math.cos(s * 0.17) * 1.8).toFixed(2) + "%,0) rotate(" + ((s * 2.4) % 360).toFixed(2) + "deg)";
    requestAnimationFrame(ray);
  }

  if (calm.matches) {
    burst.style.transform = "translate3d(0,0,0) rotate(12deg)";
  } else {
    requestAnimationFrame(ray);
  }

  set(0);
  if (running) { timer = setTimeout(tick, 4200); }
}());
