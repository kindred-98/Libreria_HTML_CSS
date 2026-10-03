(function () {
  var cells = [].slice.call(document.querySelectorAll(".cell"));
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var durs = [4.6, 3.9, 5.4, 4.3, 6.1, 3.4];
  var lags = [0, 1.4, 2.9, 0.7, 3.8, 2.1];
  var mp = document.getElementById("mp");
  var mc = document.getElementById("mc");
  var mr = document.getElementById("mr");
  var bp = document.getElementById("bp");
  var bv = document.getElementById("bv");
  var t0 = 0;
  var collapses = 0;
  var lastPhase = [];
  var press = [0, 0, 0, 0, 0, 0];
  var lastColl = 0;

  for (var i = 0; i < 6; i++) lastPhase.push(0);

  var refs = cells.map(function (c, i) {
    var bufs = [].slice.call(c.querySelectorAll(".bub")).map(function (b, s) {
      return {
        w: b,
        bb: b.querySelector(".bb"),
        br: b.querySelector(".br"),
        bf: b.querySelector(".bf"),
        gen: -1,
        seed: (i * 2 + s) * 977
      };
    });
    return {
      cell: c,
      face: c.querySelector(".face"),
      st: c.querySelector(".cell__st"),
      bar: c.querySelector(".cell__bar u"),
      bufs: bufs
    };
  });

  function hash(n) {
    var x = Math.sin(n * 127.1) * 43758.5453;
    return x - Math.floor(x);
  }

  function ease(p) {
    return 1 - Math.pow(1 - p, 2.6);
  }

  function render(now) {
    // El primer frame puede traer una marca de tiempo anterior a t0 (Chromium
    // reutiliza la del frame en curso, que empiezo antes que este guion), y con
    // t negativo `gen` sale -1, que es el centinela de B.gen: no se inicializa
    // B.x/B.y y la linea de dibujo revienta al leer .toFixed de undefined.
    var t = Math.max(0, (now - t0) / 1000);
    var peak = 0;
    var live = 0;
    var hot = 0;
    for (var i = 0; i < refs.length; i++) {
      var R = refs[i];
      var d = durs[i];
      var q = ((t / d + lags[i] / d) % 1 + 1) % 1;
      var grow = 0;
      var state = "STEADY";
      for (var s = 0; s < R.bufs.length; s++) {
        var B = R.bufs[s];
        var off = s * 0.47;
        var qq = (((q + off) % 1) + 1) % 1;
        var gen = Math.floor((t / d + lags[i] / d + off) * 1) + (s * 13);
        if (B.gen !== gen) {
          B.gen = gen;
          var h1 = hash(B.seed + gen * 3.7);
          var h2 = hash(B.seed + gen * 8.1 + 5);
          B.x = 12 + h1 * 76;
          B.y = 16 + h2 * 68;
          B.mx = 0.5 + hash(B.seed + gen * 2.3) * 0.72;
        }
        var size = 0;
        var alpha = 0;
        var ringA = 0;
        var ringS = 1;
        var flashA = 0;
        if (qq < 0.08) {
          size = 0;
          alpha = 0;
        } else if (qq < 0.6) {
          var u = (qq - 0.08) / 0.52;
          size = 0.1 + ease(u) * B.mx;
          alpha = Math.min(1, u * 3.4);
        } else if (qq < 0.8) {
          var u2 = (qq - 0.6) / 0.2;
          size = B.mx * (1 + 0.05 * Math.sin(u2 * 22));
          alpha = 1;
          grow = Math.max(grow, size);
        } else if (qq < 0.855) {
          var u3 = (qq - 0.8) / 0.055;
          size = B.mx * (1 - ease(u3) * 0.97);
          alpha = 1;
          flashA = Math.max(0, 1 - u3 * 1.3);
          ringA = Math.min(1, u3 * 3);
          ringS = 0.2 + ease(u3) * 1.5;
          state = "COLLAPSE";
          grow = Math.max(grow, size);
        } else {
          var u4 = (qq - 0.855) / 0.145;
          size = 0;
          alpha = 0;
          ringA = Math.max(0, 1 - u4);
          ringS = 1.4 + ease(u4) * 2.2;
          if (ringA > 0.02) state = "RING";
        }
        if (press[i] > 0) {
          alpha = Math.min(1, alpha + 0.4);
          size = Math.max(size, 0.4 * (1 - press[i]));
          ringA = Math.max(ringA, press[i] * 0.9);
          ringS = 0.6 + (1 - press[i]) * 2.4;
          flashA = Math.max(flashA, press[i]);
        }
        var sc = Math.max(0.001, size);
        B.w.style.transform = "translate(" + B.x.toFixed(1) + "%," + B.y.toFixed(1) + "%)";
        B.bb.style.transform = "scale(" + sc.toFixed(3) + ")";
        B.bb.style.opacity = alpha.toFixed(3);
        B.br.style.transform = "scale(" + Math.max(0.001, ringS * B.mx).toFixed(3) + ")";
        B.br.style.opacity = (ringA * 0.85).toFixed(3);
        B.bf.style.transform = "scale(" + Math.max(0.05, sc * 1.7).toFixed(3) + ")";
        B.bf.style.opacity = (flashA * 0.9).toFixed(3);
        if (alpha > 0.05) live++;
      }
      peak = Math.max(peak, grow);
      if (state === "COLLAPSE") hot++;
      R.st.textContent = state;
      R.cell.classList.toggle("is-hot", state === "COLLAPSE");
      R.bar.style.transform = "scaleX(" + (0.1 + grow * 0.9).toFixed(3) + ")";
      var prev = lastPhase[i];
      lastPhase[i] = q;
      if (q < prev) {
        collapses++;
        mc.textContent = String(collapses);
      }
    }
    mp.textContent = live + " / 12";
    mr.textContent = (peak * 8.4).toFixed(1);
    var pr = 0.18 + peak * 0.5 + hot * 0.06;
    bp.style.transform = "scaleX(" + Math.min(1, pr).toFixed(3) + ")";
    bv.textContent = (1.4 + pr * 2.4).toFixed(1);
    for (var k = 0; k < 6; k++) {
      if (press[k] > 0) press[k] = Math.max(0, press[k] - 0.09);
    }
  }

  function burst(i) {
    press[i] = 1;
    refs[i].face.classList.add("is-hit");
    setTimeout(function () {
      refs[i].face.classList.remove("is-hit");
    }, 200);
  }

  refs.forEach(function (R, i) {
    R.face.addEventListener("click", function () {
      burst(i);
    });
    R.face.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      burst(i);
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") burst(0);
  });

  if (calm) {
    for (var i = 0; i < refs.length; i++) {
      refs[i].bufs[0].bb.style.opacity = "0.85";
      refs[i].bufs[1].bb.style.opacity = "0.6";
      refs[i].bar.style.transform = "scaleX(0.52)";
    }
    bp.style.transform = "scaleX(0.42)";
    return;
  }

  t0 = performance.now();
  requestAnimationFrame(function loop(now) {
    render(now);
    requestAnimationFrame(loop);
  });
  setInterval(function () {
    render(performance.now());
  }, 160);
})();
