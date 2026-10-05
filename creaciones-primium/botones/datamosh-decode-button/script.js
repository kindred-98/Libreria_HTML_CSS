(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var room = document.querySelector(".room");
  var plate = document.getElementById("plate");
  var btn = document.getElementById("btn");
  var mosh = document.getElementById("mosh");
  var smears = document.getElementById("smears");
  var wave = document.getElementById("wave");
  var cursor = document.getElementById("cursor");
  var curTxt = document.getElementById("curTxt");
  var railHead = document.getElementById("railHead");
  var tapeRun = document.getElementById("tapeRun");
  var tDec = document.getElementById("tDec");
  var tErr = document.getElementById("tErr");
  var tFrm = document.getElementById("tFrm");
  var tBar = document.getElementById("tBar");
  var mbMode = document.getElementById("mbMode");

  var COLS = 18;
  var ROWS = 6;
  var N = COLS * ROWS;
  var SM = 9;
  var T = 6400;
  var cells = [];
  var sm = [];
  var t0 = performance.now();
  var lastTxt = -999;
  var pr = plate.getBoundingClientRect();
  var rr = room.getBoundingClientRect();
  var rw = 0;
  var cw = 0;
  var ch = 0;

  function chan(r, g, b, sh) {
    if (sh === 1) return "rgb(" + b + "," + g + "," + r + ")";
    if (sh === 2) return "rgb(" + r + "," + b + "," + g + ")";
    if (sh === 3) return "rgb(" + g + "," + r + "," + b + ")";
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function buildCells() {
    mosh.innerHTML = "";
    cells = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var el = document.createElement("i");
        el.className = "cellm";
        var u = (c + 0.5) / COLS;
        var v = (r + 0.5) / ROWS;
        var dx = u - 0.5;
        var dy = v - 0.5;
        var d = Math.sqrt(dx * dx * 2.2 + dy * dy);
        var core = Math.max(0, 1 - d * 2.3);
        var band = (v > 0.36 && v < 0.66 && Math.abs(dx) < 0.3) ? 1 : 0;
        var edge = v < 0.14 ? 1 : 0;
        var base = 12 + core * 26 + edge * 16;
        var g2 = base + core * 34;
        var b2 = base + core * 52 + band * 90;
        if (band) g2 += 40;
        var shift = (c * 7 + r * 3) % 4;
        var nz = 0.55 + ((c * 13 + r * 29) % 11) / 14;
        var lum = Math.min(92, 16 + core * 78 + edge * 34 + band * 26) * nz;
        if ((c + r * 3) % 3 === 0) {
          el.style.background = chan(
            Math.min(255, base * 2.6 * nz + 54),
            Math.min(255, g2 * 2.4 * nz + 40),
            Math.min(255, b2 * 2.4 * nz + 46),
            shift
          );
        } else {
          var hu = (c * 23 + r * 37) % 360;
          if ((c * 5 + r * 11) % 7 === 0) hu = (hu + 137) % 360;
          el.style.background = "hsl(" + hu + ",84%," + lum.toFixed(0) + "%)";
        }
        mosh.appendChild(el);
        cells.push({
          el: el,
          u: u,
          jx: (((c * 37 + r * 91) % 27) / 13 - 1) * 1.7,
          jy: (((c * 53 + r * 17) % 23) / 11 - 1) * 1.3,
          n: nz
        });
      }
    }
  }

  function buildSmears() {
    smears.innerHTML = "";
    sm = [];
    var cols = ["rgba(255,45,111,.5)", "rgba(63,224,255,.5)", "rgba(57,255,136,.42)", "rgba(138,92,255,.46)", "rgba(255,176,58,.4)"];
    for (var i = 0; i < SM; i++) {
      var e = document.createElement("i");
      e.className = "smear";
      e.style.background = "linear-gradient(90deg,transparent," + cols[i % cols.length] + ",transparent)";
      e.style.top = (4 + ((i * 13) % 88)) + "%";
      e.style.width = (14 + ((i * 17) % 40)) + "%";
      e.style.height = (6 + ((i * 11) % 16)) + "px";
      smears.appendChild(e);
      sm.push({ el: e, p: (i * 0.37) % 1, s: 0.6 + ((i * 23) % 9) / 8 });
    }
  }

  function buildTape() {
    var html = "";
    var cols = ["#ff2d6f", "#3fe0ff", "#39ff88", "#8a5cff", "#ffb03a", "#101a24", "#1b2c3a"];
    for (var pass = 0; pass < 2; pass++) {
      for (var i = 0; i < 46; i++) {
        var w = 8 + ((i * 29) % 44);
        var c = cols[(i * 5 + pass * 3) % cols.length];
        var h = 3 + ((i * 13) % 12);
        var o = 0.14 + ((i * 7) % 10) / 14;
        html += '<i style="width:' + w + 'px;background:' + c + ';opacity:' + o.toFixed(2) + ';height:' + (i % 5 === 0 ? "100%" : "auto") + '"></i>';
        html += '<i style="width:' + w + 'px;background:#0a1119;opacity:.9;height:' + h + 'px;margin-top:' + ((i * 3) % 7) + 'px"></i>';
      }
    }
    tapeRun.innerHTML = html;
  }

  function layout() {
    pr = plate.getBoundingClientRect();
    rr = room.getBoundingClientRect();
    rw = document.querySelector(".rail").getBoundingClientRect().width;
    cw = pr.width / COLS;
    ch = pr.height / ROWS;
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      var col = i % COLS;
      var row = Math.floor(i / COLS);
      c.el.style.width = cw + 1.2 + "px";
      c.el.style.height = ch + 1.2 + "px";
      c.el.style.left = (col * cw) + "px";
      c.el.style.top = (row * ch) + "px";
    }
  }

  var smooth = function (a, b, x) {
    var t = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  function tick() {
    var now = performance.now();
    var el = now - t0;
    var t = (el % T) / T;

    var f, mode, curX, curY, press;
    if (t < 0.14) {
      f = 0; mode = "SEEK";
      curX = -0.06 + (t / 0.14) * 0.1;
      curY = -0.5;
      press = 0;
    } else if (t < 0.5) {
      var u = (t - 0.14) / 0.36;
      f = u * 1.3;
      mode = "DECODE";
      curX = -0.02 + u * 1.04;
      curY = 0.34 - u * 0.34;
      press = 0;
    } else if (t < 0.63) {
      f = 1.3; mode = "PRESS";
      curX = 0.5;
      curY = 0.0;
      press = t < 0.545 ? 0 : Math.min(1, (t - 0.545) / 0.03) * (1 - Math.max(0, (t - 0.6) / 0.03));
    } else if (t < 0.82) {
      var u3 = (t - 0.63) / 0.19;
      f = 1.3 * (1 - u3);
      mode = "MOSH BACK";
      curX = 1.02 - u3 * 0.3;
      curY = 0.0 + u3 * 0.42;
      press = 0;
    } else {
      f = 0; mode = "SEEK";
      curX = 0.72 - (t - 0.82) / 0.18 * 0.8;
      curY = 0.42 + (t - 0.82) / 0.18 * 0.92;
      press = 0;
    }

    var dec = 0;
    var err = 0;
    for (var c of cells) {
      var front = smooth(f + 0.07, f - 0.05, c.u);
      var d = front;
      var edge = Math.abs(c.u - f);
      var near = edge < 0.09 ? 1 - edge / 0.09 : 0;
      var k = (1 - d) * (0.55 + c.n * 0.5) + near * 0.22;
      if (k > 1) k = 1;
      var ox = c.jx * cw * k * 0.85;
      var oy = c.jy * ch * k * 0.85;
      c.el.style.transform = "translate3d(" + ox.toFixed(1) + "px," + oy.toFixed(1) + "px,0)";
      c.el.style.opacity = (k * 0.94).toFixed(3);
      dec += d;
      err += k;
    }
    dec = dec / N;
    err = err / N;

    for (var o of sm) {
      var ph = (el / 1400 * o.s + o.p) % 1;
      o.el.style.transform = "translate3d(" + (ph * 130 - 15).toFixed(1) + "%,0,0)";
      o.el.style.opacity = ((1 - Math.abs(ph - 0.5) * 2) * (0.3 + err * 0.9)).toFixed(3);
    }

    var wf = f;
    wave.style.transform = "translateX(" + (wf * pr.width).toFixed(1) + "px)";
    wave.style.opacity = (t > 0.14 && t < 0.82 ? 0.85 : 0).toFixed(2);

    btn.style.transform = press > 0 ? "scale(" + (1 - press * 0.035).toFixed(3) + ")" : "";
    var ringA = Math.max(press, 0);
    cursor.querySelector(".cur-ring").style.transform = "scale(" + (0.5 + ringA * 2.4).toFixed(2) + ")";
    cursor.querySelector(".cur-ring").style.opacity = ringA.toFixed(2);

    var cx = pr.left - rr.left + curX * pr.width;
    var cy = pr.top - rr.top + pr.height * 0.5 + curY * pr.height;
    cursor.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    railHead.style.transform = "translateX(" + (Math.max(0, Math.min(1, curX)) * rw).toFixed(1) + "px)";

    if (now - lastTxt > 70) {
      lastTxt = now;
      tDec.textContent = String(Math.round(dec * 100)).padStart(2, "0");
      tErr.textContent = String(Math.round(err * 100)).padStart(2, "0");
      tFrm.textContent = String(Math.floor(el / 16) % 10000).padStart(4, "0");
      tBar.style.width = Math.round(err * 100) + "%";
      mbMode.textContent = mode;
      curTxt.textContent = mode;
    }

    window.setTimeout(tick, 16);
  }

  buildCells();
  buildSmears();
  buildTape();
  layout();
  window.setTimeout(layout, 60);
  window.addEventListener("resize", layout);

  if (reduce) {
    tDec.textContent = "100";
    tErr.textContent = "00";
    tFrm.textContent = "0000";
    tBar.style.width = "0%";
    mbMode.textContent = "STATIC";
    curTxt.textContent = "STATIC";
    cursor.style.display = "none";
    return;
  }

  window.setTimeout(tick, 16);
})();
