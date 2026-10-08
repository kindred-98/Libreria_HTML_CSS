(function () {
  var tapeRow = document.getElementById("tapeRow");
  var clock = document.getElementById("clock");
  var qLast = document.getElementById("qLast");
  var qBid = document.getElementById("qBid");
  var qAsk = document.getElementById("qAsk");
  var qChg = document.getElementById("qChg");
  var qVol = document.getElementById("qVol");
  var qSess = document.getElementById("qSess");
  var sales = document.getElementById("sales");
  var ladder = document.getElementById("ladder");
  var go = document.getElementById("go");
  var pxTag = document.getElementById("pxTag");
  var tickTag = document.getElementById("tickTag");
  var stateTag = document.getElementById("stateTag");
  var ticksOut = document.getElementById("ticks");
  var volOut = document.getElementById("volSum");
  var oldLine = document.getElementById("oldLine");
  var oldArea = document.getElementById("oldArea");
  var newLine = document.getElementById("newLine");
  var newArea = document.getElementById("newArea");
  var newGrp = document.getElementById("newGrp");
  var sweepRect = document.getElementById("sweepRect");
  var markLine = document.getElementById("markLine");
  var markDot = document.getElementById("markDot");
  var scanBand = document.getElementById("scanBand");
  var flashes = Array.prototype.slice.call(document.querySelectorAll(".q__flash"));

  var STEP = 16, NS = 74, BASE = 184.62, START = 9 * 3600 + 41 * 60 + 2;
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var price = BASE, open = 182.48, high = 185.04, low = 181.9, vol = 1.42;
  var walk = [], seed = 7, runs = 0, t0 = 0, tickAcc = 0;
  var sweepT = -1, runT = -1, liveAcc = 0;

  function rnd() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  var SYMS = ["ORBX", "NRVN", "HLTA", "KSTR", "VLTY", "MRDN", "QPLT", "ARGO", "SNTL", "BRMT"];
  var CHIPS = [];
  for (var i = 0; i < 12; i++) {
    var up = i % 3 !== 0;
    CHIPS.push(
      '<span class="' + (up ? "up" : "dn") + '"><b>' + SYMS[i] + "</b>" +
      (170 + Math.floor(rnd() * 40)) + "." + ("0" + Math.floor(rnd() * 99)).slice(-2) +
      " <u>" + (up ? "+" : "\u2212") + (Math.floor(rnd() * 300) / 100).toFixed(2) + "%</u></span>"
    );
  }
  var CHIPS_HTML = CHIPS.join("");
  tapeRow.innerHTML = CHIPS_HTML + CHIPS_HTML;

  function smooth(src) {
    var out = [];
    for (var i = 0; i < src.length; i++) {
      var a = src[Math.max(0, i - 1)], b = src[i], c = src[Math.min(src.length - 1, i + 1)];
      out.push((a + b * 2 + c) / 4);
    }
    return out;
  }

  for (var k = 0; k < NS; k++) {
    var trend = Math.sin(k / 11) * 2.6 + Math.sin(k / 4.3) * 0.7;
    walk.push(BASE + trend + (rnd() - 0.5) * 0.9);
  }
  walk = smooth(walk);

  function path(series) {
    var lo = 1e9, hi = -1e9, i;
    for (i = 0; i < series.length; i++) {
      if (series[i] < lo) lo = series[i];
      if (series[i] > hi) hi = series[i];
    }
    var pad = Math.max(0.6, (hi - lo) * 0.22);
    lo -= pad;
    hi += pad;
    var d = "", a = "";
    for (i = 0; i < series.length; i++) {
      var x = (i / (NS - 1)) * 600;
      var y = 210 - ((series[i] - lo) / (hi - lo)) * 196;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " ";
      a += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1) + " ";
    }
    a += "L600 232 L0 232 Z";
    return { d: d.trim(), a: a.trim(), y: y, lo: lo, hi: hi };
  }

  function draw(which, series) {
    var p = path(series);
    var ln = which === "old" ? oldLine : newLine;
    var ar = which === "old" ? oldArea : newArea;
    ln.setAttribute("d", p.d);
    ar.setAttribute("d", p.a);
    return p;
  }

  var geo = draw("new", walk);
  newGrp.setAttribute("clip-path", "url(#sweepClip)");
  sweepRect.setAttribute("width", "600");
  oldLine.setAttribute("d", "");
  oldArea.setAttribute("d", "");

  function fmt(v) {
    return v.toFixed(2);
  }

  function pad2(v) {
    return v < 10 ? "0" + v : String(v);
  }

  function hhmmss(sec) {
    var h = Math.floor(sec / 3600) % 24, m = Math.floor(sec / 60) % 60, s = sec % 60;
    return pad2(h) + ":" + pad2(m) + ":" + pad2(s);
  }

  function flash(i, kind, delay) {
    var f = flashes[i];
    f.className = "q__flash" + (kind ? " " + kind : "");
    f._t = -delay * 1000;
    f._on = true;
  }

  function pulseQuote(i, up) {
    flash(i, up ? "" : "down", 0);
  }

  function newWalk() {
    var s = walk[walk.length - 1];
    var out = [];
    var drift = (rnd() - 0.45) * 0.9;
    for (var i = 0; i < NS; i++) {
      s += drift * 0.06 + (rnd() - 0.5) * 0.8;
      out.push(s);
    }
    return smooth(out);
  }

  function run() {
    runs++;
    ticksOut.textContent = String(runs);
    runT = 0;
    sweepT = 0;
    go.classList.add("is-run");
    var up = rnd() > 0.42;
    walk = newWalk();
    geo = draw("new", walk);
    oldLine.setAttribute("d", geo.d);
    oldArea.setAttribute("d", geo.a);
    newLine.setAttribute("d", geo.d);
    newArea.setAttribute("d", geo.a);
    price = walk[NS - 1];
    if (price > high) high = price;
    if (price < low) low = price;
    vol += 0.01 + rnd() * 0.09;
    qVol.textContent = vol.toFixed(2) + "M";
    volOut.textContent = vol.toFixed(2) + "M";
    qSess.textContent = "high " + fmt(high) + " low " + fmt(low);
    for (var i = 0; i < flashes.length; i++) pulseQuote(i, up);
    var rows = [];
    for (var r = 0; r < 3; r++) {
      var p = price + (rnd() - 0.5) * 0.5;
      rows.unshift(
        '<li class="' + (rnd() > 0.5 ? "hot" : "cold") + '"><b>' + fmt(p) + "</b><i>" +
        hhmmss(START + (runs * 7 + r)) + "</i><u>" + Math.floor(rnd() * 90 + 4) + "</u></li>"
      );
    }
    var html = rows.join("");
    sales.insertAdjacentHTML("afterbegin", html);
    while (sales.children.length > 7) sales.lastChild.remove();
    var kids = ladder.children;
    for (var kid of kids) {
      var bar = kid.querySelector("u");
      bar.style.setProperty("--w", (14 + rnd() * 52).toFixed(0) + "%");
    }
    stateTag.textContent = "redrawing tape";
  }

  go.addEventListener("pointerdown", function () { run(); });
  go.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") run();
  });

  var lastTapeX = 0;
  var lastPx = "";

  function step() {
    var now = Date.now();
    if (!t0) t0 = now;
    var ms = now - t0;
    var live = runT >= 0;

    var secs = START + Math.floor(ms / 1000);
    clock.textContent = hhmmss(secs);

    var speed = live ? 0.115 : 0.026;
    var x = -(ms * speed) % 2000;
    if (Math.abs(x - lastTapeX) > 0.4) {
      tapeRow.style.transform = "translateX(" + x.toFixed(1) + "px)";
      lastTapeX = x;
    }

    liveAcc += 16;
    if (liveAcc > 420) {
      liveAcc = 0;
      var bump = (rnd() - 0.47) * 0.34;
      price += bump;
      walk[NS - 1] = price;
      var g2 = draw("new", walk);
      newLine.setAttribute("d", g2.d);
      newArea.setAttribute("d", g2.a);
      if (live) {
        oldLine.setAttribute("d", g2.d);
        oldArea.setAttribute("d", g2.a);
      }
      geo = g2;
    }

    var pstr = fmt(price);
    if (pstr !== lastPx) {
      lastPx = pstr;
      qLast.textContent = pstr;
      qBid.textContent = fmt(price - 0.04);
      qAsk.textContent = fmt(price + 0.09);
      qChg.textContent = (price >= open ? "+" : "\u2212") + fmt(Math.abs(price - open));
      qChg.style.color = price >= open ? "var(--up)" : "var(--dn)";
      pxTag.textContent = pstr;
      markLine.setAttribute("d", "M0 " + geo.y.toFixed(1) + "H600");
      markDot.setAttribute("cy", geo.y.toFixed(1));
      markDot.setAttribute("cx", "600");
    }

    if (sweepT >= 0) {
      sweepT += 16;
      var k = sweepT / 760;
      if (k >= 1) {
        sweepT = -1;
        sweepRect.setAttribute("width", "600");
        scanBand.style.opacity = "0";
        if (runT >= 0) stateTag.textContent = "stream live";
      } else {
        sweepRect.setAttribute("width", (k * 600).toFixed(1));
        scanBand.setAttribute("x", (-40 + k * 640).toFixed(1));
        scanBand.style.opacity = (0.5 * (1 - k)).toFixed(3);
      }
    }

    for (var f of flashes) {
      if (f._on) {
        f._t += 16;
        var q = f._t / 620;
        if (q >= 1) {
          f._on = false;
          f.style.opacity = "0";
        } else {
          f.style.opacity = (0.5 * Math.sin(q * Math.PI)).toFixed(3);
          f.style.transform = "translateX(" + ((q * 200 - 100).toFixed(1)) + "%)";
        }
      }
    }

    if (runT >= 0) {
      runT += 16;
      if (runT > 1900) {
        runT = -1;
        go.classList.remove("is-run");
        stateTag.textContent = "stream idle";
      }
    }

    tickAcc += 16;
    if (tickAcc > 1000) {
      tickAcc = 0;
      tickTag.textContent = hhmmss(secs).slice(0, 5);
    }

    setTimeout(step, STEP);
  }

  qLast.textContent = fmt(price);
  qBid.textContent = fmt(price - 0.04);
  qAsk.textContent = fmt(price + 0.09);
  qChg.textContent = "+" + fmt(price - open);
  pxTag.textContent = fmt(price);
  markLine.setAttribute("d", "M0 " + geo.y.toFixed(1) + "H600");
  markDot.setAttribute("cy", geo.y.toFixed(1));

  if (calm) {
    sweepRect.setAttribute("width", "600");
    stateTag.textContent = "stream settled";
    for (var fl of flashes) {
      fl.style.opacity = "0";
      fl._on = false;
    }
  } else {
    setTimeout(step, STEP);
  }
})();
