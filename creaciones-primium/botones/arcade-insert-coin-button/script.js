(function () {
  var act = document.getElementById('act');
  var cab = document.querySelector('.cab');
  var slot = document.querySelector('.slot');
  var hScore = document.getElementById('hScore');
  var sScore = document.getElementById('hudScore');
  var hCred = document.getElementById('hCred');
  var sCred = document.getElementById('hudCred');
  var legend = document.getElementById('legend');
  var bossFill = document.getElementById('bossFill');
  var comboFill = document.getElementById('comboFill');
  var comboV = document.getElementById('comboV');
  var flourish = document.getElementById('flourish');
  var flB = flourish.querySelector('b');
  var flE = flourish.querySelector('em');
  var attract = document.getElementById('attract');
  var hit = document.getElementById('hit');
  var flash = document.getElementById('flash');
  var cue = document.getElementById('cue');
  var figE = document.getElementById('figE');
  var burstPool = Array.prototype.slice.call(document.querySelectorAll('.burst'));
  var burstIx = 0;
  var score = 0;
  var cred = 3;
  var combo = 1;
  var boss = 1;
  var open = false;
  var timers = [];

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clearTimers() {
    for (var t of timers) clearTimeout(t);
    timers.length = 0;
  }
  function fire(el, cls) {
    el.classList.remove(cls);
    el.getBoundingClientRect();
    el.classList.add(cls);
  }
  function pad(n) {
    var s = String(n);
    while (s.length < 6) s = '0' + s;
    return s;
  }

  function fit() {
    var w = slot.clientWidth;
    if (w > 0) slot.style.setProperty('--s', (w / 520).toFixed(4));
  }

  function setCred(n) {
    cred = n;
    hCred.textContent = String(n);
    sCred.textContent = String(n);
    if (n <= 0) {
      cab.classList.add('is-coin');
      legend.textContent = 'Insert coin';
      attract.classList.remove('is-off');
      act.setAttribute('aria-label', 'Insert a coin');
    } else {
      cab.classList.remove('is-coin');
      legend.textContent = 'Strike';
      attract.classList.add('is-off');
      act.setAttribute('aria-label', 'Spend a credit and strike');
    }
  }

  function resetCombo() {
    combo = 1;
    comboV.textContent = 'x1';
    comboFill.style.transition = 'transform 1.1s cubic-bezier(.3,0,.6,1)';
    comboFill.style.transform = 'scaleY(0)';
  }

  function burst(text) {
    var b = burstPool[burstIx];
    burstIx = (burstIx + 1) % burstPool.length;
    b.textContent = text;
    b.style.left = (44 + Math.random() * 12) + '%';
    fire(b, 'is-on');
  }

  function flourishIn(big, small) {
    flB.textContent = big;
    flE.textContent = small;
    fire(flourish, 'is-on');
  }

  function strike() {
    clearTimers();
    if (cred <= 0) { coin(); return; }
    var punish = open;
    setCred(cred - 1);
    combo = Math.min(combo + 1, 9);
    var gain = (120 * combo) * (punish ? 3 : 1) * (1 + Math.floor(Math.random() * 3));
    score += gain;
    hScore.textContent = pad(score);
    sScore.textContent = String(score);
    boss = Math.max(0.06, boss - (punish ? 0.11 : 0.05));
    bossFill.style.transform = 'scaleX(' + boss.toFixed(3) + ')';

    act.classList.add('is-fire', 'is-down');
    cab.classList.add('is-shake');
    fire(hit, 'is-on');
    fire(flash, 'is-on');
    fire(figE, 'is-hit');
    fire(comboV, 'is-pop');
    burst('+' + gain);
    var titulo = 'Clean';
    if (punish) titulo = 'Punish';
    else if (combo > 3) titulo = 'Flourish';
    flourishIn(titulo, punish ? 'triple credit' : combo + ' hit chain');
    if (punish) cue.classList.remove('is-on');

    var fill = Math.min(1, combo / 9);
    comboFill.style.transition = 'transform .1s linear';
    comboFill.style.transform = 'scaleY(' + fill + ')';
    comboV.textContent = 'x' + combo;

    later(function () { act.classList.remove('is-fire', 'is-down'); }, 260);
    later(function () { cab.classList.remove('is-shake'); }, 320);
    later(function () { figE.classList.remove('is-hit'); }, 620);
    later(function () {
      comboFill.style.transition = 'transform 3s cubic-bezier(.35,0,.7,1)';
      comboFill.style.transform = 'scaleY(0)';
    }, 1100);
    later(function () {
      if (combo > 1) { combo = 1; comboV.textContent = 'x1'; }
    }, 4200);
  }

  function coin() {
    clearTimers();
    act.classList.add('is-fire', 'is-down');
    flourishIn('Credit', 'one coin \ one punch');
    burst('+1 coin');
    later(function () { setCred(1); }, 260);
    later(function () { act.classList.remove('is-fire', 'is-down'); }, 420);
  }

  act.addEventListener('click', function () {
    if (cred <= 0) coin(); else strike();
  });
  act.addEventListener('pointerdown', function () { act.classList.add('is-down'); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
    act.addEventListener(e, function () { act.classList.remove('is-down'); });
  });

  var cueTimer = 0;
  function beat() {
    cueTimer++;
    if (cueTimer % 3 === 0) {
      open = true;
      act.classList.add('is-open');
      fire(cue, 'is-on');
    } else {
      figE.classList.add('is-lunge');
    }
    window.setTimeout(function () {
      open = false;
      act.classList.remove('is-open');
      figE.classList.remove('is-lunge');
    }, 620);
  }
  setInterval(beat, 2350);

  setCred(3);
  resetCombo();
  fit();
  window.addEventListener('resize', fit);
  setInterval(function () {
    if (boss < 1) {
      boss = Math.min(1, boss + 0.02);
      bossFill.style.transform = 'scaleX(' + boss.toFixed(3) + ')';
    }
  }, 1400);
})();
