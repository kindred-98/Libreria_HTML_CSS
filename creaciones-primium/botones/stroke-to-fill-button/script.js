(function () {
  var rows = Array.prototype.slice.call(document.querySelectorAll(".row"));
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LOOP = 11000, STEP = 16;
  var t0 = 0;
  var hover = [false, false];
  var pour = [-1, -1];
  var sheen = [-1, -1];

  function sets(el, idx) {
    return {
      wet: el.querySelector(".wet--auto"),
      hov: el.querySelector(".wet--hover"),
      halo: el.querySelector(".wet--auto .wet__type--halo"),
      nib: el.querySelector(".nib"),
      sheen: el.querySelector(".sk__sheen")
    };
  }

  var parts = rows.map(sets);
  var drops = Array.prototype.slice.call(document.querySelectorAll(".drop"));
  var motes = Array.prototype.slice.call(document.querySelectorAll(".mote"));
  var last = drops.map(function () { return ""; });
  var lastM = motes.map(function () { return ""; });

  function ink(ms, i) {
    var u = ((ms + i * LOOP / 2) % LOOP) / LOOP;
    if (u < 0.14) return { v: 0, halo: 0, front: 0 };
    if (u < 0.46) {
      var k = (u - 0.14) / 0.32;
      k = k * k * (3 - 2 * k);
      return { v: k * 1.03, halo: 0.2 + 0.7 * k, front: k };
    }
    if (u < 0.52) {
      var k2 = (u - 0.46) / 0.06;
      return { v: 1.03 - 0.03 * k2, halo: 0.9 - 0.2 * k2, front: 1 };
    }
    if (u < 0.76) return { v: 1, halo: 0.7 - 0.36 * ((u - 0.52) / 0.24), front: 0 };
    if (u < 0.97) {
      var k3 = (u - 0.76) / 0.21;
      return { v: 1 - k3, halo: 0.34 * (1 - k3), front: 0 };
    }
    return { v: 0, halo: 0, front: 0 };
  }

  function clip(el, pct) {
    var c = "inset(0px 0px " + Math.max(-3, (100 - pct * 100)).toFixed(2) + "% 0px)";
    if (el.style.clipPath !== c) el.style.clipPath = c;
  }

  function step() {
    var now = Date.now();
    if (!t0) t0 = now;
    var ms = now - t0;

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var s = ink(ms, i);
      if (!hover[i]) {
        clip(p.wet, s.v);
        if (p.halo.style.opacity !== s.halo.toFixed(3)) p.halo.style.opacity = s.halo.toFixed(3);
      } else if (pour[i] < 0) {
        clip(p.wet, 1);
        p.halo.style.opacity = "0.34";
      }
      if (hover[i]) {
        if (pour[i] < 0) pour[i] = 0;
        pour[i] = Math.min(1, pour[i] + STEP / 900);
        clip(p.hov, pour[i] * 1.02);
        p.hov.style.opacity = "1";
      } else if (pour[i] >= 0) {
        pour[i] = -1;
        p.hov.style.opacity = "0";
        clip(p.hov, 0);
      }

      var u = ((ms + i * LOOP / 2) % LOOP) / LOOP;
      var nibT = 1;
      if (u < 0.14) nibT = -1;
      else if (u < 0.46) nibT = (u - 0.14) / 0.32;
      if (nibT < 0 || hover[i]) {
        if (p.nib.style.opacity !== "0") p.nib.style.opacity = "0";
      } else {
        p.nib.style.opacity = "0.95";
        p.nib.style.transform = "translate(" + (30 + 260 * nibT).toFixed(1) + "px," +
          (8 + 74 * nibT).toFixed(1) + "px)";
      }

      var sh = 0;
      if (u >= 0.3 && u < 0.52) sh = (u - 0.3) / 0.22;
      var key = sh.toFixed(3);
      if (sheen[i] !== key) {
        sheen[i] = key;
        if (sh <= 0) p.sheen.style.opacity = "0";
        else {
          p.sheen.style.opacity = (Math.sin(sh * Math.PI) * 0.5).toFixed(3);
          p.sheen.style.transform = "translateX(" + (-130 + sh * 460).toFixed(1) + "%) skewX(-14deg)";
        }
      }
    }

    for (var d = 0; d < drops.length; d++) {
      var off = d === 0 ? 0 : 2600;
      var q = ((ms + off) % LOOP) / LOOP;
      var f;
      if (q < 0.44) f = -1;
      else if (q < 0.47) f = (q - 0.44) / 0.03;
      else if (q < 0.6) f = 1;
      else if (q < 0.72) f = 1 - (q - 0.6) / 0.12;
      else f = -1;
      if (f < 0) {
        if (last[d] !== "0") {
          drops[d].style.opacity = "0";
          last[d] = "0";
        }
        continue;
      }
      var fade = 1;
      if (f < 0.1) fade = f / 0.1;
      else if (f > 0.9) fade = (1 - f) / 0.1;
      var op = fade * 0.9;
      var tf = "translate(" + (f * 5).toFixed(1) + "px," + (f * f * 58).toFixed(1) + "px) scale(" +
        (1 - f * 0.3).toFixed(2) + "," + (1 + f * 0.2).toFixed(2) + ")";
      var key2 = op.toFixed(2) + tf;
      if (key2 !== last[d]) {
        last[d] = key2;
        drops[d].style.opacity = op.toFixed(3);
        drops[d].style.transform = tf;
      }
    }

    for (var m = 0; m < motes.length; m++) {
      var dur = [13000, 17000, 21000][m];
      var off2 = [0, -4000, -9000][m];
      var g = ((ms + off2) % dur) / dur;
      var op2 = 0.7;
      if (g < 0.12) op2 = g / 0.12;
      else if (g > 0.88) op2 = (1 - g) / 0.12;
      var key3 = op2.toFixed(2) + g.toFixed(3);
      if (key3 !== lastM[m]) {
        lastM[m] = key3;
        motes[m].style.opacity = op2.toFixed(3);
        motes[m].style.transform = "translate(" + (g * 38).toFixed(1) + "px," +
          (-g * 46).toFixed(1) + "px)";
      }
    }

    setTimeout(step, STEP);
  }

  var btns = Array.prototype.slice.call(document.querySelectorAll(".sk"));
  for (var b = 0; b < btns.length; b++) {
    (function (el, idx) {
      el.addEventListener("pointerenter", function () { hover[idx] = true; });
      el.addEventListener("pointerleave", function () { hover[idx] = false; });
      el.addEventListener("focus", function () { hover[idx] = true; });
      el.addEventListener("blur", function () { hover[idx] = false; });
    })(btns[b], b);
  }

  if (calm) {
    for (var part of parts) {
      clip(part.wet, 1);
      part.wet.style.clipPath = "inset(0px 0px 0px 0px)";
      part.halo.style.opacity = "0.34";
      part.hov.style.opacity = "0";
      clip(part.hov, 0);
      part.nib.style.opacity = "0";
      part.sheen.style.opacity = "0";
    }
    for (var drop of drops) drop.style.opacity = "0";
    for (var mote of motes) mote.style.opacity = "0";
  } else {
    setTimeout(step, STEP);
  }
})();
