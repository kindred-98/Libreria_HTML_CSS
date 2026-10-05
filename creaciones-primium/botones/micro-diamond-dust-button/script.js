(function () {
  var btns = Array.prototype.slice.call(document.querySelectorAll(".sk"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = 0, last = 0;

  var rig = btns.map(function (btn, bi) {
    var face = btn.querySelector(".sk__face");
    var n = Number.parseInt(face.dataset.dust, 10) || 20;
    var dia = [];
    for (var i = 0; i < n; i++) {
      var el = document.createElement("i");
      el.className = "dia";
      var ang = (i / n) * 6.2832 + Math.random() * 1.4;
      var rad = 0.1 + Math.pow(Math.random(), 0.7) * 0.84;
      el.style.setProperty("--x", (50 + Math.cos(ang) * rad * 47).toFixed(1) + "%");
      el.style.setProperty("--y", (48 + Math.sin(ang) * rad * 36 * (0.55 + Math.random() * 0.7)).toFixed(1) + "%");
      el.style.setProperty("--r", (2.6 + Math.random() * 4).toFixed(1) + "px");
      el.style.setProperty("--dl", (Math.random() * 0.36).toFixed(3) + "s");
      el.style.setProperty("--rr", (Math.random() * 900 - 450).toFixed(0) + "deg");
      el.style.setProperty("--dx", (Math.cos(ang) * (30 + Math.random() * 80)).toFixed(0) + "px");
      el.style.setProperty("--dy", (Math.sin(ang) * (24 + Math.random() * 66) - 16).toFixed(0) + "px");
      face.appendChild(el);
      dia.push({ el: el, seed: Math.random() * 6.2832, lit: 0.3 + Math.random() * 0.4 });
    }
    return {
      btn: btn, tilt: btn.querySelector(".sk__tilt"), dia: dia,
      tx: 0, ty: 0, cx: 0, cy: 0, rx: 0, ry: 0, over: false, off: bi
    };
  });

  for (var r of rig) {
    (function (r) {
      r.btn.addEventListener("pointermove", function (e) {
        var bnd = r.btn.getBoundingClientRect();
        var nx = (e.clientX - bnd.left) / bnd.width - 0.5;
        var ny = (e.clientY - bnd.top) / bnd.height - 0.5;
        r.tx = (-ny * 15).toFixed(2);
        r.ty = (nx * 17).toFixed(2);
        r.over = true;
      });
      r.btn.addEventListener("pointerleave", function () { r.over = false; });
      r.btn.addEventListener("click", function () {
        r.btn.classList.remove("shake", "dustoff");
        r.btn.getBoundingClientRect();
        r.btn.classList.add("shake", "dustoff");
        window.setTimeout(function () { r.btn.classList.remove("dustoff"); }, 3200);
        window.setTimeout(function () { r.btn.classList.remove("shake"); }, 480);
      });
    })(r);
  }

  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    t += dt;
    for (var r of rig) {
      var ax = Math.sin(t * 0.52 + r.off * 2.1) * 4.6;
      var ay = Math.cos(t * 0.41 + r.off * 1.3) * 5.4;
      var gx = r.over ? r.tx : ax;
      var gy = r.over ? r.ty : ay;
      r.rx += (gx - r.rx) * Math.min(1, dt * 9);
      r.ry += (gy - r.ry) * Math.min(1, dt * 9);
      r.tilt.style.setProperty("--rx", r.rx.toFixed(2) + "deg");
      r.tilt.style.setProperty("--ry", r.ry.toFixed(2) + "deg");
      var phi = (r.rx * 0.85 + r.ry * 1.1) * 0.16;
      for (var dd of r.dia) {
        var c = Math.cos(dd.seed - phi);
        var s = c > 0 ? Math.pow(c, 10) : 0;
        var sh = 0.72 + 0.28 * Math.sin(t * 1.7 + dd.seed * 3.1);
        var br = dd.lit + s * sh * 0.9;
        dd.el.style.opacity = Math.min(1, 0.34 + br * 0.8).toFixed(2);
        dd.el.style.setProperty("--s", (0.72 + s * sh * 1.15).toFixed(2));
      }
    }
    requestAnimationFrame(frame);
  }

  if (reduce) {
    for (var r of rig) {
      r.tilt.style.setProperty("--rx", "0deg");
      r.tilt.style.setProperty("--ry", "0deg");
      for (var dd of r.dia) {
        dd.el.style.opacity = "0.62";
        dd.el.style.setProperty("--s", "1.05");
      }
    }
  } else {
    requestAnimationFrame(frame);
  }
})();
