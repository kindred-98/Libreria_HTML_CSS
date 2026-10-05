(function () {
  var lid = document.querySelector('.lid');
  var lidUnder = document.getElementById('lidUnder');
  var lidV = document.getElementById('lidV');
  var lidH = document.getElementById('lidH');
  var bandV = document.getElementById('bandV');
  var bandH = document.getElementById('bandH');
  var loopL = document.querySelector('.bow__loop--l');
  var loopR = document.querySelector('.bow__loop--r');
  var knot = document.querySelector('.bow__knot');
  var tailL = document.querySelector('.tail--l');
  var tailR = document.querySelector('.tail--r');
  var gbtn = document.getElementById('gbtn');
  var gpress = document.querySelector('.gbtn__btn');
  var pulse = document.querySelector('.gbtn__pulse');
  var conf = document.querySelector('.conf');
  var sparks = conf.querySelectorAll('s');
  var cast = document.querySelector('.gift__cast');
  var trayWall = document.querySelector('.tray__wall');
  var trayWin = document.getElementById('trayWin');
  var trayGlow = document.getElementById('trayGlow');
  var trayWell = document.getElementById('trayWell');
  var tag = document.getElementById('tag');
  var cnt = document.getElementById('cnt');
  var note = document.getElementById('drapeNote');
  var open = document.getElementById('open');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CYC = 15000;
  var t0 = performance.now();
  var opened = 2;
  var flashT = -9999;
  var tap = 0;
  var lastDrape = -1;
  var sp = [];

  for (var spark of sparks) {
    var s = spark.style;
    sp.push({
      dx: Number.parseFloat(s.getPropertyValue('--dx')) || 0,
      dy: Number.parseFloat(s.getPropertyValue('--dy')) || 0,
      dr: Number.parseFloat(s.getPropertyValue('--dr')) || 0
    });
  }

  function seg(p, a, b, f) {
    var u = (p - a) / (b - a);
    if (u < 0) u = 0;
    if (u > 1) u = 1;
    return f ? f(u) : u;
  }
  function eOut(u) { return 1 - Math.pow(1 - u, 3); }
  function eIn(u) { return u * u; }
  function eIO(u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function n(v) { return (Math.round(v * 100) / 100); }

  var DR = [
    { l: 15, ll: 1, r: -11, rl: 0.82, bow: -4 },
    { l: -19, ll: 0.74, r: 15, rl: 1, bow: 6 }
  ];

  function pose(p, cyc, now) {
    var d = DR[(p > 0.64 ? cyc + 1 : cyc) % 2];
    if (lastDrape !== (p > 0.64 ? (cyc + 1) % 2 : cyc % 2) + 1) {
      lastDrape = (p > 0.64 ? (cyc + 1) % 2 : cyc % 2) + 1;
      note.textContent = 'drape 0' + lastDrape;
    }

    var op = 0;
    if (p >= 0.14 && p < 0.30) op = eIO(seg(p, 0.14, 0.30));
    else if (p >= 0.30 && p < 0.47) op = 1;
    else if (p >= 0.47 && p < 0.58) op = 1 - eIO(seg(p, 0.47, 0.58));
    var nod = p > 0.40 && p < 0.50 ? 0.035 * Math.sin(seg(p, 0.40, 0.50) * Math.PI) : 0;

    lid.style.transform = 'translate3d(' + n(-4 * op) + '%,' + n((-27 * op - 24 * nod)) + '%,0) rotate(' + n(-8 * op) + 'deg) scale(' + n(1 + 0.035 * op) + ')';
    lidUnder.style.opacity = n(Math.max(0, (op - 0.12) * 1.5));

    var vb = 1;
    if (p >= 0.07 && p < 0.19) vb = 1 - eOut(seg(p, 0.07, 0.19));
    else if (p >= 0.19 && p < 0.60) vb = 0;
    else if (p >= 0.60 && p < 0.70) vb = eOut(seg(p, 0.60, 0.70));
    var off = 1 - vb;
    lidV.style.transform = 'translate3d(' + n(150 * off) + '%,' + n(34 * off) + '%,0) rotate(' + n(28 * off) + 'deg)';
    lidV.style.opacity = n(vb);

    var hb = 1;
    if (p >= 0.13 && p < 0.27) hb = 1 - eIn(seg(p, 0.13, 0.27));
    else if (p >= 0.27 && p < 0.56) hb = 0;
    else if (p >= 0.56 && p < 0.70) hb = eOut(seg(p, 0.56, 0.70));
    lidH.style.transform = 'translate3d(0,' + n(-34 * hb) + '%,0)';
    lidH.style.opacity = n(hb);

    var bv = 1;
    if (p >= 0.09 && p < 0.21) bv = 1 - eIn(seg(p, 0.09, 0.21));
    else if (p >= 0.21 && p < 0.58) bv = 0;
    else if (p >= 0.58 && p < 0.72) bv = eOut(seg(p, 0.58, 0.72));
    var boff = 1 - bv;
    bandV.style.transform = 'translate3d(0,' + n(96 * boff) + '%,0)';
    bandV.style.opacity = n(bv);
    bandH.style.transform = 'translate3d(0,' + n(118 * boff) + '%,0) rotate(' + n(9 * boff) + 'deg)';
    bandH.style.opacity = n(bv);

    var un = 0;
    if (p >= 0.05 && p < 0.17) un = eOut(seg(p, 0.05, 0.17));
    else if (p >= 0.17 && p < 0.60) un = 1;
    else if (p >= 0.60 && p < 0.73) un = 1 - eOut(seg(p, 0.60, 0.73));
    loopL.style.transform = 'rotate(' + n(mix(d.bow * -1, -74, un)) + 'deg) scaleX(' + n(mix(1, 0.12, un)) + ')';
    loopR.style.transform = 'rotate(' + n(mix(d.bow, 74, un)) + 'deg) scaleX(' + n(mix(1, 0.12, un)) + ')';
    var ks = mix(1, 0.2, un);
    knot.style.transform = 'translate(-50%,' + n(-30 * un) + '%) scale(' + n(ks) + ')';
    knot.style.opacity = n(1 - un * 1.4);

    var fall = 0;
    if (p >= 0.08 && p < 0.24) fall = eOut(seg(p, 0.08, 0.24));
    else if (p >= 0.24 && p < 0.57) fall = 1;
    else if (p >= 0.57 && p < 0.73) fall = 1 - eOut(seg(p, 0.57, 0.73));
    var f2 = fall * (1 - op * 0.52);
    tailL.style.transform = 'rotate(' + n(mix(d.l * 0.5, 13 + d.l * 0.3, f2)) + 'deg) scaleX(' + n(mix(d.ll, 0.86, f2)) + ') translateY(' + n(165 * f2) + '%)';
    tailR.style.transform = 'rotate(' + n(mix(d.r * 0.5, -13 + d.r * 0.3, f2)) + 'deg) scaleX(' + n(mix(d.rl, 0.86, f2)) + ') translateY(' + n(170 * f2) + '%)';

    var rise = 1;
    if (p >= 0.23 && p < 0.31) rise = eIO(seg(p, 0.23, 0.31));
    else if (p < 0.23) rise = 0;
    var pr = 0;
    if (p > 0.325 && p < 0.375) pr = eOut(seg(p, 0.325, 0.375));
    else if (p > 0.375 && p < 0.44) pr = 1 - eIO(seg(p, 0.375, 0.44));
    gbtn.style.transform = 'translateX(-50%) translateY(' + n(30 - 30 * rise + 9 * pr) + '%) scale(' + n((0.86 + 0.14 * rise) * (1 - 0.1 * pr)) + ')';
    gbtn.style.opacity = n(Math.max(0, (rise - 0.06) * 1.1));
    gpress.style.transform = 'scale(' + n(1 - 0.12 * pr) + ')';

    var bt = p > 0.33 && p < 0.45 ? eOut(seg(p, 0.33, 0.45)) : 0;
    var bo = 0;
    if (p > 0.325 && p < 0.35) bo = 1;
    else if (p > 0.35 && p < 0.46) bo = 1 - seg(p, 0.35, 0.46);
    for (var i = 0; i < sparks.length; i++) {
      var c = sp[i];
      sparks[i].style.transform = 'translate3d(' + n(c.dx * bt) + 'px,' + n(c.dy * bt) + 'px,0) rotate(' + n(c.dr * bt) + 'deg)';
      sparks[i].style.opacity = n(bo * 0.95);
    }

    var w = 0;
    if (p >= 0.18 && p < 0.26) w = eIO(seg(p, 0.18, 0.26));
    else if (p >= 0.26 && p < 0.48) w = 1;
    else if (p >= 0.48 && p < 0.56) w = 1 - eIO(seg(p, 0.48, 0.56));
    trayWall.style.opacity = n(w);
    trayWin.style.opacity = n(w);
    trayGlow.style.opacity = n(w);
    trayWell.style.opacity = n(w);

    cast.style.transform = 'scale(' + n(1 + 0.05 * op) + ')';
    cast.style.opacity = n(0.85 + 0.12 * (1 - op) - 0.1 * op);
    tag.style.transform = 'rotate(' + n(-4 - 7 * op) + 'deg) translateY(' + n(16 * op) + '%)';

    var fl = Math.max(0, 1 - (now - flashT) / 760);
    if (fl > 0) {
      pulse.style.opacity = n(fl);
      pulse.style.transform = 'scale(' + n(0.4 + 1.8 * (1 - fl)) + ')';
    } else if (pulse.style.opacity !== '0') {
      pulse.style.opacity = '0';
    }

    if (pr > 0.55 && tap === 0) {
      tap = 1;
      opened++;
      cnt.textContent = (opened < 10 ? '0' : '') + opened;
      flashT = now;
    }
    if (pr < 0.1) tap = 0;
  }

  open.addEventListener('click', function () {
    flashT = performance.now();
  });

  function step() {
    var now = performance.now();
    var e = now - t0;
    var cyc = Math.floor(e / CYC);
    pose((e % CYC) / CYC, cyc, now);
  }

  if (calm) {
    t0 = -CYC * 0.36;
    step();
  } else {
    step();
    (function loop() {
      setTimeout(function () {
        step();
        loop();
      }, 16);
    })();
  }
})();
