(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var page = document.getElementById("page");
  var stack = document.getElementById("stack");
  var slab = document.getElementById("slab");
  var face = document.getElementById("face");
  var caps = document.getElementById("caps");
  var capEls = caps.querySelectorAll(".cap");
  var cnt = document.getElementById("cnt");
  var tot = document.getElementById("tot");
  var pct = document.getElementById("pct");
  var bar = document.getElementById("bar");
  var st = document.getElementById("st");
  var P = 1000;
  var T = 8400;
  var plates = [];
  var cols = 0;
  var total = 0;
  var t0 = 0;
  var lastTxt = -999;
  var oy = 0;
  var cy = 0;
  var top = 0;
  var vx = [0, 0, 0];
  var vy = [0, 0, 0];
  var vz = [0, 0, 0];
  var az = [0, 0, 0];

  function colCount() {
    if (window.innerWidth < 430) return 8;
    if (window.innerWidth < 620) return 9;
    return 12;
  }

  function build(n) {
    cols = n;
    page.style.setProperty("--cols", n);
    var out = "";
    var k = 0;
    for (var p = 0; p < 3; p++) {
      var cls = "p2";
      if (p === 0) cls = "p0";
      else if (p === 1) cls = "p1";
      out += '<div class="plate ' + cls + '">';
      for (var r = 1; r <= 3; r++) {
        for (var c = 0; c < n; c++) {
          out += '<i class="cell r' + r + '" style="--sd:' + k + '"></i>';
          k++;
        }
      }
      out += "</div>";
    }
    slab.innerHTML = out;
    plates = slab.querySelectorAll(".plate");
    total = k;
    tot.textContent = "/" + String(total).padStart(3, "0");
    page.classList.add("upgraded");
  }

  function applyOffsets() {
    var r = slab.getBoundingClientRect();
    var w = r.width;
    var h = r.height;
    var dz = Math.max(60, Math.min(200, h * 0.85));
    var cfg = [
      [-34, 0, h * 0.8, -dz],
      [0, -w * 0.05, 0, 0],
      [34, 0, -h * 0.8, dz]
    ];
    for (var i = 0; i < 3; i++) {
      var el = plates[i];
      if (!el) continue;
      el.style.setProperty("--az", cfg[i][0] + "px");
      el.style.setProperty("--dx", cfg[i][1] + "px");
      el.style.setProperty("--dy", cfg[i][2] + "px");
      el.style.setProperty("--dz", cfg[i][3] + "px");
      az[i] = cfg[i][0];
      vx[i] = cfg[i][1];
      vy[i] = cfg[i][2];
      vz[i] = cfg[i][3];
    }
    face.style.setProperty("--az", "34px");
    face.style.setProperty("--dx", "0px");
    face.style.setProperty("--dy", (-h * 0.8) + "px");
    face.style.setProperty("--dz", dz + "px");
  }

  function measure() {
    var sr = stack.getBoundingClientRect();
    var lr = slab.getBoundingClientRect();
    oy = sr.top + sr.height * 0.5;
    cy = lr.top + lr.height / 2;
    top = lr.top;
  }

  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeIn(x) { return x * x * x; }

  function prog(q) {
    if (q < 0.06) return 0;
    if (q < 0.16) return easeOut((q - 0.06) / 0.1);
    if (q < 0.45) return 1;
    if (q < 0.62) return 1 - easeIn((q - 0.45) / 0.17);
    return 0;
  }

  function tick() {
    var now = performance.now();
    if (!t0) t0 = now;
    var t = ((now - t0) % T) / T;

    for (var i = 0; i < 3; i++) {
      var q = (t + i * 0.0405) % 1;
      var k = prog(q);
      var ty = vy[i] * k;
      var tz = az[i] + (vz[i] - az[i]) * k;
      var tx = vx[i] * k;
      if (plates[i]) {
        plates[i].style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px," + tz.toFixed(2) + "px)";
      }
      if (i === 2) {
        face.style.transform = "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px," + tz.toFixed(2) + "px)";
      }
      var sc = P / (P - tz);
      var sy = oy + (cy + ty - oy) * sc;
      capEls[i].style.transform =
        "translateY(" + (sy - top + (1 - k) * (i - 1) * 17).toFixed(1) + "px) scale(" + sc.toFixed(3) + ")";
      capEls[i].style.opacity = (0.55 + k * 0.45).toFixed(2);
    }

    if (now - lastTxt > 40) {
      lastTxt = now;
      var pr;
      if (t < 0.06) pr = 1;
      else if (t < 0.16) pr = 1 - easeOut((t - 0.06) / 0.1);
      else if (t < 0.45) pr = 0;
      else if (t < 0.62) pr = easeOut((t - 0.45) / 0.17);
      else pr = 1;
      var shown = pr > 0.999 ? total : Math.floor(pr * total / 3) * 3;
      var pc = Math.round(pr * 100);
      cnt.textContent = String(shown).padStart(3, "0");
      pct.textContent = String(pc).padStart(3, "0");
      bar.style.width = pc + "%";
      var label;
      if (t >= 0.62 || t < 0.06) label = "Assembly Locked";
      else if (t < 0.16) label = "Disassembling";
      else if (t < 0.45) label = "Exploded View";
      else label = "Assembling";
      if (st.textContent !== label) st.textContent = label;
    }
  }

  if (reduce) {
    cnt.textContent = "108";
    tot.textContent = "/108";
    pct.textContent = "100";
    bar.style.width = "100%";
    st.textContent = "Assembly Locked";
    return;
  }

  build(colCount());
  measure();
  applyOffsets();
  window.setTimeout(function () { measure(); applyOffsets(); }, 60);
  window.addEventListener("resize", function () {
    var m = colCount();
    if (m !== cols) build(m);
    measure();
    applyOffsets();
  });
  face.addEventListener("click", function () {
    t0 = performance.now() - 0.5 * T;
  });
  t0 = performance.now();
  window.setInterval(tick, 16);
})();
