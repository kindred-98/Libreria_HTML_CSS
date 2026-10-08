(function () {
  var btn = document.getElementById("pour");
  if (!btn) return;

  var drops = btn.querySelector(".drops");
  var out = document.getElementById("rq-cast");
  var cast = 0;
  var pool = [];

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function spray() {
    var r = btn.getBoundingClientRect();
    var bx = r.left;
    var by = r.top + r.height * 0.74;
    var w = r.width;
    var n = 22;
    for (var i = 0; i < n; i++) {
      var d = document.createElement("i");
      d.className = "drop";
      var px = rnd(0.16, 0.84) * w;
      d.style.left = (bx + px - r.left).toFixed(1) + "px";
      d.style.top = (by - r.top).toFixed(1) + "px";
      var ang = rnd(-Math.PI * 0.92, -Math.PI * 0.08);
      var sp = rnd(120, 420);
      d.style.setProperty("--tx", (Math.cos(ang) * sp).toFixed(1) + "px");
      d.style.setProperty("--ty", (Math.sin(ang) * sp * 0.72 - rnd(40, 130)).toFixed(1) + "px");
      d.style.animationDuration = rnd(0.66, 1.15).toFixed(2) + "s";
      d.style.animationDelay = (i * 0.008).toFixed(3) + "s";
      drops.appendChild(d);
      pool.push(d);
      (function (node) {
        setTimeout(function () {
          if (node.parentNode) node.remove();
        }, 1500);
      })(d);
    }
    if (pool.length > 90) {
      for (var k = 0; k < pool.length - 60; k++) {
        if (pool[k].parentNode) pool[k].remove();
        pool.splice(k, 1);
        k--;
      }
    }
  }

  function pour() {
    cast++;
    if (out) out.textContent = cast < 10 ? "0" + cast : String(cast);
    btn.classList.add("is-pour");
    spray();
    clearTimeout(btn.tid);
    btn.tid = setTimeout(function () {
      btn.classList.remove("is-pour");
    }, 1100);
  }

  btn.addEventListener("click", pour);
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") pour();
  });
})();
