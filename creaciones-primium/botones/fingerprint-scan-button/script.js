(function () {
  var pad = document.getElementById('pad');
  var fp = document.getElementById('fp');
  var lock = document.getElementById('lock');
  var home = document.getElementById('home');
  var toast = document.getElementById('toast');
  var toastTx = document.getElementById('toastTx');
  var pctEl = document.getElementById('pct');
  var att = document.getElementById('att');
  var hint = document.getElementById('hint');
  var cardSub = document.getElementById('cardSub');
  var greet = document.getElementById('greet');
  var svg = document.getElementById('ridges');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var NS = 'http://www.w3.org/2000/svg';
  var tracks = [];

  function arc(cx, cy, r, a0, a1) {
    var x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
    var x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    return 'M' + x0.toFixed(2) + ' ' + y0.toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + x1.toFixed(2) + ' ' + y1.toFixed(2);
  }

  function add(d) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('stroke-opacity', '0.12');
    svg.appendChild(p);
    var l = p.getTotalLength();
    p.style.strokeDasharray = l.toFixed(1);
    p.style.strokeDashoffset = l.toFixed(1);
    tracks.push({ el: p, len: l });
  }

  (function build() {
    var cx = 50, cy = 57;
    for (var k = 0; k < 13; k++) {
      add(arc(cx, cy, 5.5 + k * 3.15, 3.92 - k * 0.028, 6.5 + k * 0.046));
    }
    add('M38 62 C40 52 50 46 58 50 C66 54 68 66 60 73');
    add('M43 66 C45 59 52 55 58 58 C64 61 65 69 59 74');
    add('M50 60 C53 57 59 58 61 62 C63 66 60 71 55 71');
  })();

  var DUR = { idle: 1400, arm: 520, scan: 1250, judge: 380, ok: 680, open: 3000, relock: 700, no: 950 };
  var NEXT = { idle: 'arm', arm: 'scan', scan: 'judge', judge: 'done', ok: 'open', open: 'relock', relock: 'idle', no: 'go' };
  var outcomes = [1, 0, 1, 1, 0, 0, 1, 0, 1, 1];
  var state = 'idle';
  var t0 = performance.now();
  var gen = 0;
  var attempt = 1;

  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function setTxt(el, s) {
    if (el.textContent !== s) el.textContent = s;
  }

  function paint(v) {
    pad.style.setProperty('--lit', v.lit.toFixed(3));
    pad.style.setProperty('--p', v.p.toFixed(3));
    pad.style.setProperty('--scan', v.scan.toFixed(3));
    var n = tracks.length;
    for (var i = 0; i < n; i++) {
      var d = v.scan * 1.4 - (i / n) * 0.5;
      var draw = d;
      if (draw < 0) draw = 0;
      else if (draw > 1) draw = 1;
      var t = tracks[i];
      t.el.style.strokeDashoffset = (t.len * (1 - draw)).toFixed(1);
      t.el.setAttribute('stroke-opacity', (0.1 + 0.9 * Math.min(1, d * 3.4)).toFixed(2));
    }
    setTxt(pctEl, Math.round(v.p * 99) + '%');
  }

  function blank() {
    pad.classList.remove('ok', 'no');
    paint({ lit: 0, p: 0, scan: 0 });
  }

  function say(t, bad) {
    setTxt(toastTx, t);
    toast.classList.toggle('bad', !!bad);
    toast.classList.remove('up');
    toast.getBoundingClientRect();
    toast.classList.add('up');
  }

  function enter(next) {
    state = next;
    t0 = performance.now();
    var myGen = ++gen;
    if (next === 'arm') {
      setTxt(hint, 'Reading ridge pattern');
      (function loop() {
        if (state !== 'arm') return;
        var e = Math.min(1, (performance.now() - t0) / DUR.arm);
        paint({ lit: 0.15 + e * 0.35, p: 0.02 + e * 0.03, scan: 0 });
        if (e < 1) setTimeout(loop, 16);
      })();
    } else if (next === 'scan') {
      (function loop() {
        if (state !== 'scan') return;
        var e = Math.min(1, (performance.now() - t0) / DUR.scan);
        var s = 1 - Math.pow(1 - e, 2.1);
        var m = 0.05 + s * 0.94;
        setTxt(att, 'attempt ' + pad2(attempt) + ' · match ' + Math.round(m * 99) + '%');
        paint({ lit: 0.5 + s * 0.5, p: m, scan: s });
        if (e < 1) setTimeout(loop, 16);
      })();
    }
    window.setTimeout(function () {
      if (myGen !== gen) return;
      advance();
    }, DUR[next]);
  }

  function advance() {
    var nx = NEXT[state];
    if (nx === 'done') {
      if (outcomes[(attempt - 1) % outcomes.length]) accept();
      else reject();
      return;
    }
    if (nx === 'go') {
      go();
      return;
    }
    if (state === 'judge') paint({ lit: 1, p: 0.99, scan: 1 });
    if (state === 'ok') paint({ lit: 1, p: 1, scan: 1 });
    if (nx === 'open') {
      lock.classList.add('gone');
      home.classList.add('on');
    }
    if (nx === 'relock') {
      home.classList.remove('on');
      lock.classList.remove('gone');
      pad.classList.remove('ok');
      toast.classList.remove('up');
      blank();
      setTxt(hint, 'Touch sensor to unlock');
      setTxt(att, 'attempt ' + pad2(attempt + 1) + ' · match —');
    }
    enter(nx);
  }

  function go() {
    attempt++;
    blank();
    setTxt(att, 'attempt ' + pad2(attempt) + ' · match —');
    enter('arm');
  }

  function accept() {
    pad.classList.add('ok');
    setTxt(att, 'attempt ' + pad2(attempt) + ' · accepted 99%');
    setTxt(hint, 'Unlocked');
    setTxt(cardSub, 'attempt ' + pad2(attempt) + ' · match 99%');
    setTxt(greet, attempt > 1 ? 'Welcome back again' : 'Welcome back');
    say('Fingerprint accepted');
    paint({ lit: 1, p: 1, scan: 1 });
    enter('ok');
  }

  function reject() {
    pad.classList.add('no');
    pad.classList.remove('shake');
    pad.getBoundingClientRect();
    pad.classList.add('shake');
    setTxt(hint, 'Not recognised · try again');
    setTxt(att, 'attempt ' + pad2(attempt) + ' · no match');
    say('Fingerprint not recognised', true);
    paint({ lit: 1, p: 0, scan: 0 });
    enter('no');
  }

  fp.addEventListener('click', function () {
    if (calm) return;
    if (state !== 'idle' && state !== 'relock') return;
    go();
  });

  if (calm) {
    lock.classList.add('gone');
    home.classList.add('on');
    pad.classList.add('ok');
    paint({ lit: 0.62, p: 1, scan: 1 });
    setTxt(att, 'attempt 01 · accepted 99%');
    setTxt(hint, 'Unlocked');
    setTxt(cardSub, 'attempt 01 · match 99%');
    toast.classList.add('up');
  } else {
    setTxt(att, 'attempt 01 · match —');
    enter('idle');
  }
})();
