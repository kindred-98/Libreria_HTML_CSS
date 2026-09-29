(function () {
  var track = document.getElementById("curve");
  var pen = document.getElementById("pen");
  if (!track || !pen) return;

  var segs = track.children;
  var n = segs.length;
  if (!n) return;

  var pts = new Array(n + 1);
  for (var i = 0; i < n; i++) {
    pts[i] = [parseFloat(segs[i].style.left) || 0, parseFloat(segs[i].style.top) || 0];
  }
  pts[n] = pts[0];

  var T = 4000;
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) {
    pen.style.display = "none";
    return;
  }

  var ref = null;
  try {
    if (segs[0].getAnimations) ref = segs[0].getAnimations()[0] || null;
  } catch (err) {
    ref = null;
  }

  function clock() {
    var t = null;
    if (ref) t = ref.currentTime;
    if (typeof t !== "number" || !isFinite(t) || t < 0) t = performance.now();
    return t % T;
  }

  function frame() {
    var g = n - (clock() / T) * n;
    var i0 = Math.floor(g);
    if (i0 >= n) i0 = n - 1;
    if (i0 < 0) i0 = 0;
    var fr = g - i0;
    var a = pts[i0];
    var b = pts[i0 + 1];
    var x = a[0] + (b[0] - a[0]) * fr - 50;
    var y = a[1] + (b[1] - a[1]) * fr - 50;
    pen.style.transform = "translate(" + x.toFixed(3) + "%," + y.toFixed(3) + "%)";
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
