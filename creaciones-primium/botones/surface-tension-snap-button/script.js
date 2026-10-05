(function () {
  var units = Array.prototype.slice.call(document.querySelectorAll(".unit"));
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t0 = 0;
  var durs = [5.6, 4.7, 6.4, 4.1];
  var lags = [0, 2.1, 3.6, 1.2];
  var base = [0.31, 0.47, 0.62, 0.78];
  var boost = [0, 0, 0, 0];
  var refs = units.map(function (u) {
    return {
      drop: u.querySelector(".drop"),
      body: u.querySelector(".drop__body"),
      tail: u.querySelector(".drop__tail"),
      fly: u.querySelector(".drop--fly"),
      snap: u.querySelector(".snap"),
      gauge: u.querySelector(".unit__gauge i"),
      eps: u.querySelector(".eps"),
      ph: u.querySelector(".ph"),
      btn: u.querySelector(".btn"),
      u: u
    };
  });

  function clamp01(v) {
    if (v < 0) return 0;
    if (v > 1) return 1;
    return v;
  }

  function ease(p) {
    return 1 - Math.pow(1 - p, 3);
  }

  function render(t) {
    for (var i = 0; i < refs.length; i++) {
      var R = refs[i];
      var d = durs[i] * (boost[i] > 0 ? 0.42 : 1);
      var p = ((t / d + lags[i] / durs[i]) % 1 + 1) % 1;
      var b = boost[i];
      var lift = 0;
      var stretch = 0;
      var neck = 1;
      var flyA = 0;
      var snapA = 0;
      var phase = "HOLD";
      var strain;

      if (p < 0.5) {
        strain = 0.1 + 0.05 * Math.sin(p * 12.566) + p * 0.1;
        lift = 1.5 * Math.sin(p * 18.85) * (0.4 + p);
        stretch = p * 0.1;
        neck = 1 - p * 0.08;
      } else if (p < 0.78) {
        var q = (p - 0.5) / 0.28;
        strain = 0.2 + ease(q) * 0.62;
        lift = ease(q) * 30;
        stretch = ease(q) * 0.44;
        neck = 1 - ease(q) * 0.5;
        phase = "STRAIN";
      } else if (p < 0.9) {
        var q2 = (p - 0.78) / 0.12;
        strain = 0.82 + q2 * 0.16;
        lift = 30 + ease(q2) * 16;
        stretch = 0.44 + q2 * 0.2;
        neck = 0.5 - q2 * 0.32;
        phase = "NECK";
      } else if (p < 0.945) {
        var q3 = (p - 0.9) / 0.045;
        strain = 0.98;
        lift = 46 + ease(q3) * 14;
        stretch = 0.64 + q3 * 0.1;
        neck = 0.18 - q3 * 0.12;
        snapA = 1 - q3;
        phase = "SNAP";
      } else {
        var q4 = (p - 0.945) / 0.055;
        var fall = 1 - Math.pow(1 - q4, 2.2);
        strain = 0.98 * (1 - q4) + 0.12;
        lift = 60 * (1 - fall);
        stretch = 0.74 * (1 - fall) - q4 * 0.06;
        neck = Math.max(0, 0.06 * (1 - q4)) * (1 + 5 * Math.sin(q4 * 34) * (1 - q4));
        flyA = q4 < 0.55 ? q4 / 0.55 : Math.max(0, 1 - (q4 - 0.55) / 0.45);
        phase = q4 < 0.5 ? "RECOIL" : "SETTLE";
        if (b > 0) {
          lift = Math.max(0, lift - ease(q4) * 18);
        }
      }

      var s = 1 + stretch * 0.5;
      var w = 1 - stretch * 0.26;
      var wob = 0;
      if (p >= 0.9) {
        var q5 = (p - 0.9) / 0.1;
        wob = Math.sin(q5 * 26) * (1 - q5) * 9;
      }
      if (b > 0) {
        var e = clamp01((t % 1.1) / 0.34);
        lift = Math.max(lift, 40 * (1 - e));
        strain = Math.max(strain, 0.95);
        if (e > 0.92) {
          lift = 0;
          strain = 0.12;
        }
      }

      R.drop.style.transform = "translate(" + wob.toFixed(1) + "px," + (-lift).toFixed(1) + "px) scale(" + w.toFixed(3) + "," + s.toFixed(3) + ")";
      R.tail.style.transform = "scaleX(" + neck.toFixed(3) + ") scaleY(" + (0.2 + stretch * 2.4).toFixed(3) + ") translateY(" + (-10 - stretch * 26).toFixed(1) + "%)";
      R.tail.style.opacity = (0.25 + neck * 0.7).toFixed(2);
      R.snap.style.opacity = (snapA * 0.95).toFixed(2);
      R.snap.style.transform = "scale(" + (0.5 + (1 - snapA) * 3.4).toFixed(2) + ")";
      if (flyA > 0) {
        R.fly.style.opacity = (flyA * 0.9).toFixed(2);
        R.fly.style.transform = "translate(" + (wob * 1.6).toFixed(1) + "px," + (-lift - 26 - (1 - flyA) * 30).toFixed(1) + "px) scale(" + (0.5 + flyA * 0.8).toFixed(2) + ")";
      } else if (R.fly.style.opacity !== "0") {
        R.fly.style.opacity = "0";
      }
      R.gauge.style.transform = "scaleY(" + (0.12 + strain * 0.88).toFixed(3) + ")";
      R.eps.textContent = (base[i] * (0.5 + strain)).toFixed(2);
      var want = phase === "SNAP" || phase === "RECOIL" ? "rgba(255, 186, 110, 0.85)" : "rgba(255, 186, 110, 0)";
      if (R.ph.style.color !== want) R.ph.style.color = want;
      R.ph.textContent = phase;
    }
  }

  function hit(i) {
    boost[i] = 1;
    refs[i].btn.classList.add("is-hit");
    setTimeout(function () {
      boost[i] = 0;
      refs[i].btn.classList.remove("is-hit");
    }, 420);
  }

  refs.forEach(function (R, i) {
    R.btn.addEventListener("click", function () {
      hit(i);
    });
    R.btn.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      R.btn.classList.add("is-hit");
    });
    R.btn.addEventListener("pointerup", function () {
      R.btn.classList.remove("is-hit");
    });
    R.btn.addEventListener("pointerleave", function () {
      R.btn.classList.remove("is-hit");
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") hit(0);
  });

  if (calm) {
    t0 = 0;
    for (var ref of refs) {
      ref.gauge.style.transform = "scaleY(0.62)";
      ref.ph.textContent = "HOLD";
      ref.ph.style.color = "rgba(255, 186, 110, 0.7)";
    }
    return;
  }

  t0 = performance.now();
  var adv = 0;
  var lastRaf = t0;

  function loop(now) {
    var t = (now - t0) / 1000;
    if (t > adv) adv = t;
    lastRaf = performance.now();
    render(adv);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function kick() {
    var n = performance.now();
    if (n - lastRaf > 300) {
      adv += 0.6;
      lastRaf = n;
      render(adv);
    }
    setTimeout(kick, 110);
  }
  setTimeout(kick, 110);
})();
