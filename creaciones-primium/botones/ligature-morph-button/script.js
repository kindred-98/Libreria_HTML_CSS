(function () {
  var spec = document.getElementById("spec");
  var spA = document.getElementById("spA");
  var spB = document.getElementById("spB");
  var parts = document.getElementById("parts");
  var bxr = [0, 1, 2, 3, 4].map(function (i) { return document.getElementById("bx" + i); });
  var gxt = [0, 1, 2, 3, 4].map(function (i) { return document.getElementById("gx" + i); });
  var dims = Array.prototype.slice.call(document.querySelectorAll(".dim"));
  var leads = Array.prototype.slice.call(document.querySelectorAll(".lead"));
  var cal = [0, 1, 2, 3].map(function (i) { return document.getElementById("c" + i); });
  var brk = document.getElementById("brk");
  var joint = document.getElementById("joint");
  var clipPartsR = document.getElementById("clipPartsR");
  var clipCallsR = document.getElementById("clipCallsR");
  var mm = document.getElementById("mm");
  var fig = document.getElementById("figState");
  var sheet = document.querySelector(".sheet");
  var guides = Array.prototype.slice.call(document.querySelectorAll(".guide"));
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var CYCLE = 13200, STEP = 16;
  var t0 = 0, jump = -1, lastMM = "", lastFig = "";
  var gx = [0, 0, 0, 0, 0], fs = 100, glyphY = 0, wsum = 0;

  function ease(k) {
    if (k < 0) k = 0;
    else if (k > 1) k = 1;
    return k * k * (3 - 2 * k);
  }

  function seg(u, a, b) {
    return ease((u - a) / (b - a));
  }

  function state(u) {
    var s = { wipe: 0, sep: 0, dim: 0, call: 0, joint: 0 };
    if (u < 0.26) return s;
    if (u < 0.40) { s.wipe = seg(u, 0.26, 0.40); return s; }
    if (u < 0.56) {
      s.wipe = 1;
      s.joint = seg(u, 0.40, 0.46) * (1 - seg(u, 0.52, 0.56));
      return s;
    }
    if (u < 0.62) {
      s.wipe = 1;
      s.sep = seg(u, 0.56, 0.62);
      s.dim = s.sep;
      s.call = seg(u, 0.58, 0.64);
      return s;
    }
    if (u < 0.76) {
      s.wipe = 1;
      s.sep = 1;
      s.dim = 1;
      s.call = 1;
      s.joint = 1 - seg(u, 0.62, 0.68);
      return s;
    }
    if (u < 0.86) {
      s.wipe = 1 - seg(u, 0.76, 0.86);
      s.sep = 1 - seg(u, 0.80, 0.90);
      s.dim = 1 - seg(u, 0.80, 0.90);
      s.call = 1 - seg(u, 0.78, 0.84);
      return s;
    }
    s.wipe = 0;
    return s;
  }

  function measure() {
    var sr = spA.getBoundingClientRect();
    if (sr.height > 4) {
      fs = sr.height;
      wsum = 0;
      for (var i = 0; i < 5; i++) {
        gxt[i].setAttribute("font-size", fs.toFixed(1));
        gx[i] = gxt[i].getComputedTextLength();
        wsum += gx[i];
      }
    }
    var sh = sheet.getBoundingClientRect();
    var pr = spec.getBoundingClientRect();
    var dy = pr.top - sh.top;
    var baseY = (sr.top - pr.top) + sr.height * 0.775;
    glyphY = baseY - fs * 0.335;
    guides[0].style.transform = "translateY(" + (baseY + dy).toFixed(1) + "px)";
    guides[1].style.transform = "translateY(" + (baseY - fs * 0.47 + dy).toFixed(1) + "px)";
    guides[2].style.transform = "translateY(" + (baseY - fs * 0.7 + dy).toFixed(1) + "px)";
    for (var k = 0; k < 5; k++) {
      gxt[k].setAttribute("y", glyphY.toFixed(1));
    }
    return { baseY: baseY };
  }

  function setPath(el, d) {
    if (el._d !== d) {
      el.setAttribute("d", d);
      el._d = d;
    }
  }

  function setA(el, name, v) {
    var k = name + "|" + v;
    if (el._a !== k) {
      el.setAttribute(name, v);
      el._a = k;
    }
  }

  var geo = null;

  function step() {
    var now = (new Date()).getTime();
    if (!t0) t0 = now;
    var ms = now - t0;
    var u = jump >= 0 ? jump : (ms % CYCLE) / CYCLE;
    var s = state(u);

    if (!geo || now - geo.t > 400) geo = measure();
    var baseY = geo.baseY;

    var hide = s.sep > 0.42;
    spA.style.clipPath = hide ? "inset(0px 0px 0px 100%)" :
      "inset(0px 0px 0px " + (s.wipe * 100).toFixed(2) + "%)";
    spB.style.clipPath = hide ? "inset(0px 0px 0px 100%)" :
      "inset(0px " + ((1 - s.wipe) * 100).toFixed(2) + "% 0px 0px)";

    var W = spec.clientWidth;
    var cx = W / 2;
    var gap = 3 + 30 * s.sep;
    var total = wsum + gap * 4;
    var x = cx - total / 2;
    var top = baseY - fs * 0.72;
    var hgt = fs * 0.82;
    var pos = [];

    for (var i = 0; i < 5; i++) {
      pos.push({ x: x, w: gx[i], c: x + gx[i] / 2 });
      x += gx[i] + gap;
    }

    parts.setAttribute("clip-path", "url(#clipParts)");
    clipPartsR.setAttribute("width", (s.sep * (W + 1200)).toFixed(1));
    clipCallsR.setAttribute("width", (s.call * (W + 1200)).toFixed(1));
    for (var j = 0; j < 5; j++) {
      setA(bxr[j], "x", pos[j].x.toFixed(1));
      setA(bxr[j], "y", top.toFixed(1));
      setA(bxr[j], "width", pos[j].w.toFixed(1));
      setA(bxr[j], "height", hgt.toFixed(1));
      setA(gxt[j], "x", pos[j].c.toFixed(1));
    }

    var dimY = baseY + 24;
    for (var k2 = 0; k2 < 4; k2++) {
      var x1 = pos[k2].x + pos[k2].w;
      var x2 = pos[k2 + 1].x;
      var len = (x2 - x1) * s.dim;
      if (len < 0.6) {
        setPath(dims[k2], "M0 0h0");
      } else {
        setPath(dims[k2], "M" + x1.toFixed(1) + " " + dimY.toFixed(1) + "h" + len.toFixed(1) +
          "M" + x1.toFixed(1) + " " + (dimY - 4).toFixed(1) + "v8" +
          "M" + x2.toFixed(1) + " " + (dimY - 4).toFixed(1) + "v8");
      }
    }
    var wY = dimY + 22;
    var wlen = total * s.dim;
    if (wlen < 0.6) {
      setPath(dims[4], "M0 0h0");
    } else {
      var fx = cx - total / 2, ex = cx + total / 2;
      setPath(dims[4], "M" + fx.toFixed(1) + " " + wY.toFixed(1) + "h" + wlen.toFixed(1) +
        "M" + fx.toFixed(1) + " " + (wY - 5).toFixed(1) + "v10" +
        "M" + ex.toFixed(1) + " " + (wY - 5).toFixed(1) + "v10");
    }

    var lop = s.call;
    if (lop > 0.02) {
      setPath(leads[0], "M" + pos[0].c.toFixed(1) + " " + (top + hgt * 0.44).toFixed(1) +
        "L" + (pos[0].x - 54 * lop).toFixed(1) + " " + (top - 30 * lop).toFixed(1));
      setPath(leads[1], "M" + pos[1].c.toFixed(1) + " " + top.toFixed(1) +
        "L" + (pos[1].c + 34 * lop).toFixed(1) + " " + (top - 36 * lop).toFixed(1));
      setPath(leads[2], "M" + pos[2].c.toFixed(1) + " " + (top + hgt).toFixed(1) +
        "L" + pos[2].c.toFixed(1) + " " + (dimY + 34 * lop).toFixed(1));
      setPath(leads[3], "M" + pos[4].c.toFixed(1) + " " + (top + hgt * 0.6).toFixed(1) +
        "L" + (pos[4].x + pos[4].w + 46 * lop).toFixed(1) + " " + (top + hgt * 0.2).toFixed(1));
      setA(cal[0], "x", (pos[0].x - 56 * lop).toFixed(1));
      setA(cal[0], "y", (top - 32 * lop).toFixed(1));
      setA(cal[1], "x", (pos[1].c + 36 * lop).toFixed(1));
      setA(cal[1], "y", (top - 38 * lop).toFixed(1));
      setA(cal[2], "x", pos[2].c.toFixed(1));
      setA(cal[2], "y", (dimY + 48 * lop).toFixed(1));
      setA(cal[3], "x", (pos[4].x + pos[4].w + 48 * lop).toFixed(1));
      setA(cal[3], "y", (top + hgt * 0.22).toFixed(1));
      for (var c = 0; c < 4; c++) {
        setA(cal[c], "text-anchor", c === 1 || c === 3 ? "start" : "end");
      }
      setA(cal[2], "text-anchor", "middle");
    } else {
      for (var l2 = 0; l2 < 4; l2++) setPath(leads[l2], "M0 0");
    }

    var jx = pos[2].c + pos[2].w * 0.1;
    var jy = top - 4;
    if (s.joint > 0.02) {
      setPath(brk, "M" + (jx - 8).toFixed(1) + " " + (jy - 12).toFixed(1) +
        "v-12h16v12M" + (jx + 8).toFixed(1) + " " + (jy - 12).toFixed(1) + "v-12");
      setA(joint, "cx", jx.toFixed(1));
      setA(joint, "cy", jy.toFixed(1));
      setA(joint, "r", (3 + 2.6 * s.joint).toFixed(2));
    } else {
      setPath(brk, "M0 0h0");
      setA(joint, "r", "0");
    }

    var adv = Math.round(1000 - 214 * s.wipe);
    var txt = "advance " + adv + " \u00b7 set width " + (100 - Math.round(21 * s.wipe)) + "%";
    if (txt !== lastMM) {
      lastMM = txt;
      mm.textContent = txt;
    }

    var f2 = "letterforms \u00b7 liga off";
    if (s.sep > 0.4) f2 = "anatomy \u00b7 parts drawn";
    else if (s.joint > 0.3) f2 = "ligature ffi \u00b7 joined";
    else if (s.wipe > 0.05 && s.wipe < 0.95) f2 = "morphing \u00b7 " + Math.round(s.wipe * 100) + "%";
    else if (s.wipe > 0.5) f2 = "ligature ffi \u00b7 joined";
    if (f2 !== lastFig) {
      lastFig = f2;
      fig.textContent = f2;
    }

    if (jump >= 0 && now - jump > 900) jump = -1;

    setTimeout(step, STEP);
  }

  function advance() {
    var now = Date.now();
    var u = jump >= 0 ? jump : ((now - t0) % CYCLE) / CYCLE;
    var marks = [0.02, 0.5, 0.7];
    for (const mark of marks) {
      if (u < mark) {
        var at = now + 900;
        t0 = at - mark * CYCLE;
        jump = at;
        return;
      }
    }
    t0 = now + 900;
    jump = now + 900;
  }

  spec.addEventListener("pointerdown", advance);
  spec.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") advance();
  });
  window.addEventListener("resize", function () { geo = null; lastMM = ""; });

  if (calm) {
    spA.style.clipPath = "inset(0px 0px 0px 0%)";
    spB.style.clipPath = "inset(0px 100% 0px 0px)";
    clipPartsR.setAttribute("width", "0");
    clipCallsR.setAttribute("width", "0");
    mm.textContent = "advance 1000 \u00b7 set width 100%";
  } else {
    setTimeout(step, STEP);
  }
})();
