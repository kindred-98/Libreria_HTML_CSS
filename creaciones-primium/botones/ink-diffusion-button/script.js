(function () {
  "use strict";
  var inks = document.querySelectorAll(".ink");
  if (!inks.length) return;
  var POOL = 4;

  function attach(btn) {
    var pool = [];
    var i;
    for (i = 0; i < POOL; i++) {
      var d = document.createElement("i");
      d.className = "drop";
      d.style.opacity = "0";
      btn.appendChild(d);
      pool.push({ n: d, on: false, t: 0, life: 1, x: 0, y: 0, s: 1 });
    }
    var head = 0;

    function spill(x, y, s) {
      var it = pool[head];
      head = (head + 1) % POOL;
      it.on = true;
      it.t = 0;
      it.life = 2.6 + Math.random() * 1.2;
      it.x = x;
      it.y = y;
      it.s = s;
    }

    function run(now, dt) {
      var k, it, u, e;
      for (k = 0; k < POOL; k++) {
        it = pool[k];
        if (!it.on) continue;
        it.t += dt;
        u = it.t / (it.life * 1000);
        if (u >= 1) { it.on = false; it.n.style.opacity = "0"; continue; }
        e = 1 - Math.pow(1 - u, 2.2);
        var grow = 0.5 + e * 5.4 * it.s;
        var wob = Math.sin(u * 9.4) * 2.4 * (1 - u);
        it.n.style.opacity = (u < 0.06 ? u / 0.06 * 0.92 : 0.92 * (1 - Math.pow(u, 3.4))).toFixed(3);
        it.n.style.transform = "translate3d(" + (it.x + wob).toFixed(1) + "px," + (it.y + wob * 0.6).toFixed(1) + "px,0) scale(" + grow.toFixed(3) + ")";
      }
    }

    btn.addEventListener("pointerdown", function (e) {
      if (btn.disabled) return;
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      var m = Math.max(Math.abs(x / r.width - 0.5) / 0.46, Math.abs(y / r.height - 0.5) / 0.44);
      if (m > 1) { x = r.width * 0.5 + (x - r.width * 0.5) / m; y = r.height * 0.5 + (y - r.height * 0.5) / m; }
      spill(x, y, 0.8 + Math.random() * 0.5);
      if (!btn.__raf) {
        var prev = performance.now();
        btn.__raf = true;
        var loop = function () {
          var now = performance.now();
          var dt = Math.min(60, now - prev);
          prev = now;
          run(now, dt);
          if (btn.__live) {
            window.requestAnimationFrame(loop);
          } else {
            btn.__raf = false;
          }
        };
        window.requestAnimationFrame(loop);
      }
      btn.__live = true;
      window.setTimeout(function () { btn.__live = false; }, 4200);
    });
  }

  for (var ink of inks) attach(ink);
})();
