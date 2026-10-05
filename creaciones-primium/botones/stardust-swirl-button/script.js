(function () {
  var cv = document.getElementById("dust");
  var ctx = cv.getContext("2d");
  var disc = document.getElementById("disc");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var W = 10, H = 10, DPR = 1, CX = 0, CY = 0, DR = 60, ORB = 120;
  var N = 300, STR = 10;
  var d = new Float32Array(N * STR);
  var stars = [];
  var t = 0, last = 0, cyc = 0.22, cycDur = 9.2, burst = 0, warmed = false;

  function seed() {
    for (var i = 0; i < N; i++) {
      var j = i * STR;
      d[j] = Math.random() * 6.2832;
      d[j + 1] = 0.55 + Math.random() * 0.62;
      d[j + 2] = Math.sqrt(Math.random());
      d[j + 3] = Math.random() * 6.2832;
      d[j + 4] = 0.42 + Math.random() * 1.5;
      d[j + 5] = 0.3 + Math.random() * 0.9;
      d[j + 6] = Math.random() * 0.18;
      d[j + 7] = 0; d[j + 8] = 0;
      d[j + 9] = (i % 5 === 0) ? 1 : 0;
    }
    stars.length = 0;
    for (var s = 0; s < 90; s++) {
      stars.push([Math.random(), Math.random(), 0.3 + Math.random() * 1.1, 0.2 + Math.random() * 0.6]);
    }
  }

  function size() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var r = disc.getBoundingClientRect();
    CX = r.left + r.width / 2;
    CY = r.top + r.height / 2;
    DR = r.width / 2;
    ORB = Math.max(DR * 1.34, Math.min(W, H) * 0.29);
  }

  function sstep(a, b, x) {
    var u = Math.max(0, Math.min(1, (x - a) / (b - a)));
    return u * u * (3 - 2 * u);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var i, s;
    for (i = 0; i < stars.length; i++) {
      s = stars[i];
      ctx.fillStyle = "rgba(214,226,255," + (0.1 + s[3] * 0.4 * (0.6 + 0.4 * Math.sin(t * 1.4 + i))).toFixed(3) + ")";
      ctx.fillRect(s[0] * W, s[1] * H, s[2], s[2]);
    }

    var hlx = CX + Math.cos(t * 0.42) * DR * 0.42;
    var hly = CY + Math.sin(t * 0.42) * DR * 0.34 - DR * 0.3;
    var hg = ctx.createRadialGradient(hlx, hly, 0, hlx, hly, DR * 1.15);
    hg.addColorStop(0, "rgba(255,240,214,0.16)");
    hg.addColorStop(0.45, "rgba(255,226,180,0.05)");
    hg.addColorStop(1, "rgba(255,226,180,0)");
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(CX, CY, DR, 0, 6.2832);
    ctx.fill();

    ctx.globalCompositeOperation = "lighter";
    var px, py, x, y, u, dep, al, rad;
    for (i = 0; i < N; i++) {
      var j = i * STR;
      d[j] += d[j + 4] * 0.00042 * (0.5 + burst * 3.2);
      var lp = (cyc - d[j + 6]) / 0.78;
      if (lp < 0) lp += 1;
      u = sstep(0.36, 0.52, lp) - sstep(0.72, 0.93, lp);
      u = Math.max(u, 0);
      var e = u * u * (3 - 2 * u);

      var orx = ORB * d[j + 1];
      var ox = CX + Math.cos(d[j]) * orx;
      var oy = CY + Math.sin(d[j]) * orx * 0.3 + Math.sin(d[j] * 2 + t * 0.9) * ORB * 0.1;
      var sd = d[j + 2] * DR * 0.9;
      var sx = CX + Math.cos(d[j + 3]) * sd;
      var sy = CY + Math.sin(d[j + 3]) * sd;

      x = ox + (sx - ox) * e;
      y = oy + (sy - oy) * e - Math.sin(u * 3.14159) * ORB * 0.13;
      if (warmed) { px = d[j + 7]; py = d[j + 8]; } else { px = x; py = y; }
      d[j + 7] = x; d[j + 8] = y;

      dep = 0.62 + 0.38 * Math.cos(d[j]);
      al = (0.3 + 0.62 * dep) * (0.72 + 0.28 * (1 - e));
      rad = (0.5 + dep * 1.15) * (0.82 + 0.28 * e) * (1 + burst * 0.5);
      if (d[j + 9] > 0) rad *= 1.35;

      var lit = 1 - Math.min(1, Math.hypot(x - hlx, y - hly) / (DR * 1.1));
      var boost = e * lit * 0.9;

      if (warmed && Math.abs(x - px) + Math.abs(y - py) > 0.35) {
        ctx.strokeStyle = "rgba(255,232,190," + (al * 0.5).toFixed(3) + ")";
        ctx.lineWidth = rad * 1.25;
        ctx.beginPath();
        ctx.moveTo(px - (x - px) * 2.2, py - (y - py) * 2.2);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      ctx.fillStyle = "rgba(255,240,214," + Math.min(1, al * (1 + boost * 1.4)).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, 6.2832);
      ctx.fill();
      if (d[j + 9] > 0 && e > 0.55) {
        var q = rad * 3.4 * lit;
        ctx.strokeStyle = "rgba(255,248,226," + (0.4 * lit * e).toFixed(3) + ")";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x - q, y); ctx.lineTo(x + q, y);
        ctx.moveTo(x, y - q); ctx.lineTo(x, y + q);
        ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function go() {
    burst = 1;
    document.body.classList.remove("burst");
    document.body.getBoundingClientRect();
    document.body.classList.add("burst");
    window.setTimeout(function () { document.body.classList.remove("burst"); }, 820);
    cyc = 0.30;
  }

  disc.addEventListener("click", go);
  window.addEventListener("resize", size);
  seed();
  size();

  if (reduce) {
    cyc = 0.62;
    for (var k = 0; k < 2; k++) draw();
  } else {
    function frame(now) {
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
      last = now;
      t += dt;
      cyc += dt / cycDur;
      if (cyc > 1) cyc -= 1;
      burst *= Math.pow(0.02, dt);
      draw();
      warmed = true;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
