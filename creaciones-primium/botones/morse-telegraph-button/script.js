(function () {
  var CODE = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
    I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
    Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----'
  };
  var MSG = 'NIGHT WATCH 0230 SHIP IN SIGHT';
  var UNIT = 38;

  var key = document.getElementById('key');
  var term = document.querySelector('.term');
  var sounder = document.getElementById('sounder');
  var contact = document.getElementById('contact');
  var log = document.getElementById('log');
  var echo = document.getElementById('echo');
  var stateEl = document.getElementById('state');
  var lineEl = document.getElementById('line');
  var countEl = document.getElementById('count');
  var totalEl = document.getElementById('total');
  var hint = document.getElementById('hint');
  var roll = document.getElementById('roll');
  var tapeFt = document.getElementById('tapeFt');
  var wpmEl = document.getElementById('wpm');

  var steps = [];
  var stepIx = 0;
  var timer = 0;
  var running = false;
  var sent = 0;
  var line = '';
  var lastClick = 0;

  totalEl.textContent = String(MSG.length).padStart(2, '0');
  wpmEl.textContent = Math.round(1200 / UNIT) + ' wpm';

  // Construye una linea del registro. El segundo argumento puede ser:
  //   - una cadena: se inserta tal cual como texto (sin HTML);
  //   - una funcion que recibe el <p> y le anade hijos con createElement:
  //     asi el codigo morse se puede envolver en <b> sin pasar por innerHTML.
  // Antes iba con `p.innerHTML = html` y el codigo morse se concatenaba como
  // `'<b>' + line + '</b>'`: aunque la entrada es solo puntos y rayas, CodeQL
  // lo marca como "DOM text reinterpreted as HTML".
  function addLine(cls, contenido) {
    var p = document.createElement('p');
    if (cls) p.className = cls;
    if (typeof contenido === 'function') {
      contenido(p);
    } else {
      p.textContent = contenido;
    }
    log.appendChild(p);
    while (log.children.length > 14) log.removeChild(log.firstChild);
  }
  // Helper para envolver texto en <b> sin pasar por innerHTML.
  function lineaNegrita(texto) {
    return function (p) {
      var b = document.createElement('b');
      b.textContent = texto;
      p.appendChild(b);
    };
  }

  function buildSteps() {
    var out = [];
    for (var i = 0; i < MSG.length; i++) {
      var ch = MSG[i];
      if (ch === ' ') {
        out.push({ t: 'word', ch: ' ' });
        continue;
      }
      var code = CODE[ch] || '';
      for (var k = 0; k < code.length; k++) {
        out.push({ t: code[k] === '.' ? 'dot' : 'dash', ch: ch, last: k === code.length - 1 });
        if (k < code.length - 1) out.push({ t: 'gap' });
      }
      if (i < MSG.length - 1 && MSG[i + 1] !== ' ') out.push({ t: 'letter' });
    }
    return out;
  }

  function buildTape() {
    var seq = document.createElement('div');
    seq.style.cssText = 'display:flex;flex-direction:column;align-items:center;width:100%';
    for (var r = 0; r < 2; r++) {
      for (var i = 0; i < steps.length; i++) {
        var s = steps[i];
        var d = document.createElement('span');
        if (s.t === 'dot') d.className = 'tape__mark tape__mark--dot';
        else if (s.t === 'dash') d.className = 'tape__mark tape__mark--dash';
        else if (s.t === 'letter') d.className = 'tape__mark tape__mark--gap';
        else d.className = 'tape__mark tape__mark--word';
        seq.appendChild(d);
      }
    }
    roll.appendChild(seq);
  }

  function clack() {
    sounder.classList.add('is-click');
    key.classList.add('is-spark');
    window.setTimeout(function () { sounder.classList.remove('is-click'); }, 60);
    window.setTimeout(function () { key.classList.remove('is-spark'); }, 170);
  }

  function stamp() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var s = d.getSeconds();
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function setLive(on) {
    term.classList.toggle('is-live', on);
    stateEl.textContent = on ? 'circuit closed' : 'loop open';
    lineEl.textContent = on ? 'shorted 1.8 a' : 'shorted';
    hint.textContent = on ? 'transmitting' : 'press the brass key';
    hint.classList.toggle('is-hot', on);
  }

  function begin() {
    if (running) {
      window.clearTimeout(timer);
      return;
    }
    running = true;
    sent = 0;
    stepIx = 0;
    line = '';
    log.textContent = '';
    countEl.textContent = '00';
    echo.textContent = '';
    tapeFt.textContent = 'printing';
    addLine('sys', 'coast relay \ tty 4 \ link established');
    addLine('sys', 'sending \ ' + MSG.length + ' char \ ' + wpmEl.textContent);
    setLive(true);
    pump();
  }

  function pump() {
    if (!running) return;
    if (stepIx >= steps.length) { finish(); return; }
    var s = steps[stepIx];
    var wait = UNIT;
    if (s.t === 'dash') wait = UNIT * 3;
    else if (s.t === 'letter') wait = UNIT * 3;
    else if (s.t === 'word') wait = UNIT * 7;
    if (s.t === 'dot' || s.t === 'dash') {
      clack();
      sent++;
      countEl.textContent = (sent < 10 ? '0' : '') + sent;
      if (s.last) {
        line += s.ch;
        echo.textContent = line;
      }
    }
    if (s.t === 'word') {
      if (line) addLine('rx', lineaNegrita(line));
      line = '';
    }
    stepIx++;
    timer = window.setTimeout(pump, wait);
  }

  function finish() {
    running = false;
    if (line) addLine('rx', lineaNegrita(line));
    addLine('t', stamp() + ' \ end of message \ ' + sent + ' elements');
    addLine('sys', 'loop open \ awaiting key');
    echo.textContent = 'press the key to transmit';
    tapeFt.textContent = 'trailing';
    setLive(false);
    timer = window.setTimeout(begin, 2600);
  }

  function press() {
    var now = Date.now();
    if (now - lastClick < 260) return;
    lastClick = now;
    begin();
  }

  key.addEventListener('click', press);
  key.addEventListener('pointerdown', function () {
    key.classList.add('is-down');
    press();
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (e) {
    key.addEventListener(e, function () { key.classList.remove('is-down'); });
  });

  steps = buildSteps();
  buildTape();
  addLine('sys', 'coast station \ night watch \ line four');
  addLine('sys', 'idle \ key open \ press the brass key to send');
  begin();
})();
