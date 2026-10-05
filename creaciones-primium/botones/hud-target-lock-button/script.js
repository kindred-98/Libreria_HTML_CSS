(function () {
  var body = document.body;
  var retic = document.getElementById("retic");
  var rel = document.getElementById("rel");
  var arc = document.getElementById("arc");
  var ticks = document.getElementById("ticks");
  var toneFill = document.getElementById("toneFill");
  var armState = document.getElementById("armState");
  var lampCaution = document.getElementById("lampCaution");
  var locktag = document.getElementById("locktag");
  var rows = {};
  var v = {
    spd: document.getElementById("vSpd"),
    alt: document.getElementById("vAlt"),
    hdg: document.getElementById("vHdg"),
    rng: document.getElementById("vRng"),
    clo: document.getElementById("vClo"),
    asp: document.getElementById("vAsp"),
    iff: document.getElementById("vIff"),
    tone: document.getElementById("vTone")
  };
  var spdTape = document.getElementById("spd");
  var altTape = document.getElementById("alt");
  var hdgTape = document.getElementById("hdg");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var progress = 0, locked = false, firing = false, focused = false, fireT = 0;
  var rng = 6.4, spd = 480, alt = 6200, hdg = 271, asp = 0.86, clo = 1140;
  var last = 0, cycle = 0;
  var audio = null;

  function pad(n, w) {
    var s = String(n);
    while (s.length < w) s = "0" + s;
    return s;
  }

  function buildTape(el, from, to, step, w, suffix) {
    var out = "", pass, n, k;
    for (pass = 0; pass < 2; pass++) {
      for (n = from; pass === 0 ? n <= to : n > from; n += step * (pass === 0 ? 1 : -1)) {
        k = n < 0 ? n + 360 : n;
        out += "<span>" + pad(k, w) + (suffix || "") + "</span>";
      }
    }
    el.innerHTML = out;
  }

  buildTape(spdTape, 460, 570, 10, 3, "");
  buildTape(altTape, 5800, 6900, 100, 5, "");
  buildTape(hdgTape, 255, 360, 5, 3, "");

  (function buildTicks() {
    var out = "", i, a;
    for (i = 0; i < 36; i++) {
      a = i * 10;
      out += '<line class="' + (i % 3 === 0 ? "maj" : "") + '" x1="120" y1="' + (i % 9 === 0 ? 12 : 16) +
        '" x2="120" y2="24" transform="rotate(' + a + ' 120 120)"></line>';
    }
    ticks.innerHTML = out;
  })();

  function beep(freq, dur, type, gain) {
    try {
      if (!audio) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audio = new AC();
      }
      if (audio.state === "suspended" && audio.resume) audio.resume();
      var o = audio.createOscillator();
      var g = audio.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, audio.currentTime);
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(gain || 0.05, audio.currentTime + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (dur || 0.1));
      o.connect(g);
      g.connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + (dur || 0.1) + 0.02);
    } catch {}
  }

  function setLock(on) {
    locked = on;
    if (on) {
      retic.classList.add("lock");
      body.classList.add("armed");
      arc.classList.add("full");
      armState.textContent = "Armed";
      lampCaution.classList.add("on");
      beep(1180, 0.07, "square", 0.035);
      window.setTimeout(function () { beep(1480, 0.09, "square", 0.04); }, 90);
      beep(1760, 0.32, "sine", 0.03);
    } else {
      retic.classList.remove("lock");
      body.classList.remove("armed");
      arc.classList.remove("full");
      armState.textContent = "Safe";
      lampCaution.classList.remove("on");
    }
  }

  function fire() {
    if (firing) return;
    firing = true;
    fireT = 0;
    body.classList.add("firing");
    body.classList.remove("armed");
    retic.classList.remove("lock");
    armState.textContent = "Safe";
    lampCaution.classList.remove("on");
    beep(320, 0.5, "sawtooth", 0.05);
    beep(120, 0.4, "square", 0.03);
    rng = 6.4;
    cycle = 0;
  }

  rel.addEventListener("click", fire);
  rel.addEventListener("pointerenter", function () { focused = true; });
  rel.addEventListener("pointerleave", function () { focused = false; });
  rel.addEventListener("focus", function () { focused = true; });
  rel.addEventListener("blur", function () { focused = false; });

  function paint(dt) {
    if (firing) {
      fireT += dt;
      if (fireT > 0.62) {
        firing = false;
        body.classList.remove("firing");
        setLock(false);
        progress = 0;
      }
      progress = Math.max(0, 1 - fireT / 0.5);
    } else if (!locked) {
      progress += dt / (focused ? 1.15 : 2.5);
      if (progress >= 1) { progress = 1; setLock(true); }
    }

    var tone = 1.1 + progress * 5.3;
    var pulse = locked ? 0.86 + 0.14 * Math.sin(cycle * 4) : 1;
    toneFill.style.transform = "scaleX(" + (progress * pulse).toFixed(3) + ")";
    arc.style.strokeDasharray = (progress * 503).toFixed(1) + " 503";
    v.tone.textContent = tone.toFixed(2);
    locktag.querySelector("i").textContent = "Tone " + tone.toFixed(1) + " kHz";
    rows.tone.classList.toggle("hot", locked);

    spd += dt * (14 + Math.sin(cycle * 0.7) * 6);
    alt += dt * (60 + Math.cos(cycle * 0.5) * 30);
    hdg = (hdg + dt * 1.6) % 360;
    asp = 0.8 + Math.sin(cycle * 0.6) * 0.09;
    clo = 1120 + Math.sin(cycle * 1.3) * 40 + progress * 90;
    if (!locked) rng = Math.max(0.4, rng - dt * 0.62);
    else rng = Math.max(0.2, rng - dt * 2.4);
    if (rng <= 0.45) { rng = 6.4; cycle = 0; }

    v.spd.textContent = pad(Math.round(spd), 4);
    v.alt.textContent = pad(Math.round(alt), 5);
    v.hdg.textContent = pad(Math.round(hdg), 3);
    v.rng.textContent = rng.toFixed(2);
    v.clo.textContent = Math.round(clo);
    v.asp.textContent = asp.toFixed(2);
    v.iff.textContent = "427" + Math.floor(1 + Math.abs(Math.sin(cycle * 0.3)) * 8);
  }

  var rngRow = document.getElementById("vRng").parentNode;
  var toneRow = document.getElementById("vTone").parentNode;
  rows.tone = toneRow;

  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    cycle += dt;
    paint(dt);
    rngRow.classList.toggle("hot", rng < 1.2);
    requestAnimationFrame(frame);
  }

  setLock(false);
  if (reduce) {
    progress = 0.66;
    paint(0);
    toneFill.style.transform = "scaleX(.66)";
    arc.style.strokeDasharray = "332 503";
  } else {
    progress = 0.5;
    paint(0);
    requestAnimationFrame(frame);
  }
})();
