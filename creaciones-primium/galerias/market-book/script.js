(function () {
  "use strict";

  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  var SHOTS = [
    { n: "Cloth on the tarpaulin", b: "Colour laid out flat and stacked, with a plastic chair behind it and the tarpaulin holding everything together.", a: "Kritzolina", l: "CC BY-SA 4.0", p: "https://commons.wikimedia.org/wiki/File:Stall_at_New_Market,_Kolkata_01.jpg" },
    { n: "Fruit and veg, signed", b: "A white signboard reading fruit and veg, green crates underneath, and somebody in a red coat doing the shopping.", a: "M J Richardson", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:Central_Market_stall_-_geograph.org.uk_-_2105801.jpg" },
    { n: "Bags, and a phonebox", b: "A table the length of the pitch covered in handbags, with a listed red phonebox standing behind the trader.", a: "Victuallers", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Jedburgh_Easter_Market_2022_stall_and_stallholder_and_listed_phonebox.jpg" },
    { n: "Cakes on a quiet street", b: "Trays of cakes and biscuits laid out in rows, a stallholder in a mint jumper, and nobody else on the road.", a: "Victuallers", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Jedburgh_Easter_Market_2022_prime_cake_stall_and_stallholder.jpg" },
    { n: "Calligraphy, laid out", b: "Printed sheets fanned across a table under a striped awning, the stallholder looking down at the layout.", a: "Victuallers", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Jedburgh_Easter_Market_2022_calligraphy_stall_and_stallholder.jpg" },
    { n: "Inside the white tent", b: "A chalkboard menu propped on a trestle table inside a white marquee, with the trader working behind it.", a: "Victuallers", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Jedburgh_Easter_Market_2022_street_food_stall_and_stallholder.jpg" },
    { n: "Under the striped canopy", b: "Two men at a street food stall with bottles set out on the table and a red and white canopy overhead.", a: "Victuallers", l: "CC BY-SA 3.0", p: "https://commons.wikimedia.org/wiki/File:Jedburgh_Easter_Market_2022_High_Street_soap_stall_and_stallholder.jpg" },
    { n: "Crates on the cobbles", b: "A row of stalls with their crates out on a cobbled high street, and three floors of red brick behind them.", a: "Paul Gillett", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:Market_Stall,_Newhaven_High_Street_-_geograph.org.uk_-_3807471.jpg" },
    { n: "Last entry, after dark", b: "A white marquee lit by its own lamps at night, trees behind it and a crowd still arriving.", a: "David Howard", l: "CC BY-SA 2.0", p: "https://commons.wikimedia.org/wiki/File:Market_stall_on_Church_Street,_Twickenham_-_geograph.org.uk_-_4747488.jpg" }
  ];

  var N = SHOTS.length;
  var SPREADS = 5;
  var LAST = SPREADS - 1;

  var book = document.getElementById("book");
  var spreads = Array.prototype.slice.call(document.querySelectorAll(".spread"));
  var frames = Array.prototype.slice.call(document.querySelectorAll("img[data-frame]"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tabs button"));
  var rSpread = document.getElementById("rSpread");
  var rLeaf = document.getElementById("rLeaf");
  var rEntry = document.getElementById("rEntry");
  var rCount = document.getElementById("rCount");

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbNo = document.getElementById("lbNo");
  var lbName = document.getElementById("lbName");
  var lbBody = document.getElementById("lbBody");
  var lbCredit = document.getElementById("lbCredit");
  var lbLink = document.getElementById("lbLink");
  var lbX = document.getElementById("lbX");

  var page = 0;
  var side = 0;
  var busy = false;
  var shot = 0;
  var opener = null;
  var timer = 0;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function entryOf(sp) {
    return sp * 2 + side;
  }

  function sync() {
    spreads.forEach(function (s, k) { s.classList.toggle("is-live", k === page); });
    var base = page * 2;
    var pick = Math.min(base + side, N - 1);
    tabs.forEach(function (b, k) { b.classList.toggle("is-on", k === pick); });
    var live = spreads[page].querySelectorAll(".entry");
    live.forEach(function (e) { e.classList.remove("is-on"); });
    if (live[pick - base]) { live[pick - base].classList.add("is-on"); }
    rSpread.textContent = (page + 1) + " of " + SPREADS;
    rLeaf.textContent = side === 0 ? "verso" : "recto";
    rEntry.textContent = pad(pick + 1);
    rCount.textContent = String(N);
  }

  function turn(dir) {
    if (busy) { return; }
    var next = page + dir;
    if (next < 0 || next > LAST) { return; }
    busy = true;
    var from = spreads[page];
    var to = spreads[next];
    to.classList.add("is-live");
    to.style.zIndex = "1";
    from.style.zIndex = "2";
    from.classList.add(dir > 0 ? "is-fwd" : "is-back");
    timer = window.setTimeout(function () {
      page = next;
      side = 0;
      from.classList.remove("is-fwd", "is-back");
      from.style.zIndex = "";
      to.style.zIndex = "";
      sync();
      busy = false;
    }, calm.matches ? 20 : 680);
  }

  function readSheet(sp) {
    if (sp < 0 || sp >= SPREADS) { return; }
    if (sp !== page) {
      page = sp;
      side = 0;
      busy = false;
      window.clearTimeout(timer);
      spreads.forEach(function (s) { s.classList.remove("is-fwd", "is-back"); s.style.zIndex = ""; });
      sync();
    }
  }

  function openAt(n, from) {
    shot = ((n % N) + N) % N;
    var s = SHOTS[shot];
    var img = frames[shot];
    opener = from || null;
    lbImg.setAttribute("src", img.getAttribute("src"));
    lbImg.setAttribute("alt", img.getAttribute("alt"));
    lbNo.textContent = "Entry " + pad(shot + 1) + " of " + pad(N);
    lbName.textContent = s.n;
    lbBody.textContent = s.b;
    lbCredit.textContent = s.a + " \u00b7 " + s.l;
    lbLink.setAttribute("href", s.p);
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    lbX.focus();
  }

  function close() {
    lb.classList.remove("is-open");
    var seal = function () { lb.hidden = true; };
    if (calm.matches) { seal(); } else { setTimeout(seal, 280); }
    if (opener && document.contains(opener)) { opener.focus(); }
    opener = null;
  }

  function ring() {
    return Array.prototype.slice.call(
      lb.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  book.addEventListener("click", function (ev) {
    var b = ev.target.closest(".entry");
    if (!b) { return; }
    openAt(Number(b.getAttribute("data-shot")), b);
  });

  tabs.forEach(function (b) {
    b.addEventListener("click", function () {
      var n = Number(b.getAttribute("data-shot"));
      readSheet(Math.floor(n / 2));
      side = n % 2;
      sync();
    });
  });

  document.getElementById("back").addEventListener("click", function () { turn(-1); });
  document.getElementById("fwd").addEventListener("click", function () { turn(1); });
  document.getElementById("leafL").addEventListener("click", function () { side = 0; sync(); });
  document.getElementById("leafR").addEventListener("click", function () { side = 1; sync(); });
  document.getElementById("read").addEventListener("click", function () {
    openAt(entryOf(page), document.getElementById("read"));
  });

  lbX.addEventListener("click", close);
  lb.querySelector(".lb__veil").addEventListener("click", close);
  document.getElementById("lbPrev").addEventListener("click", function () { openAt(shot - 1, null); });
  document.getElementById("lbNext").addEventListener("click", function () { openAt(shot + 1, null); });

  document.addEventListener("keydown", function (ev) {
    if (!lb.hidden) {
      if (ev.key === "Escape") { ev.preventDefault(); close(); return; }
      if (ev.key === "Tab") {
        var box = ring();
        if (!box.length) { return; }
        var pos = box.indexOf(document.activeElement);
        var nxt = ev.shiftKey ? pos - 1 : pos + 1;
        if (nxt < 0 || nxt >= box.length) {
          ev.preventDefault();
          box[(nxt + box.length) % box.length].focus();
        }
        return;
      }
      if (ev.key === "ArrowRight") { ev.preventDefault(); openAt(shot + 1, null); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); openAt(shot - 1, null); }
      else if (ev.key === "Home") { ev.preventDefault(); openAt(0, null); }
      else if (ev.key === "End") { ev.preventDefault(); openAt(N - 1, null); }
      return;
    }
    if (document.activeElement !== book) { return; }
    if (ev.key === "ArrowRight") { ev.preventDefault(); turn(1); }
    else if (ev.key === "ArrowLeft") { ev.preventDefault(); turn(-1); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); side = 1; sync(); }
    else if (ev.key === "ArrowUp") { ev.preventDefault(); side = 0; sync(); }
    else if (ev.key === "Home") { ev.preventDefault(); readSheet(0); }
    else if (ev.key === "End") { ev.preventDefault(); readSheet(LAST); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); openAt(entryOf(page), book); }
  });

  sync();
  window.addEventListener("pagehide", function () { window.clearTimeout(timer); });
}());
