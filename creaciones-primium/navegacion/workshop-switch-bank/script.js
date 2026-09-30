(function () {
  var row = document.getElementById('row');
  var switches = [].slice.call(row.querySelectorAll('[role="radio"]'));
  var plans = [].slice.call(document.querySelectorAll('.plan'));
  var records = [].slice.call(document.querySelectorAll('.records__list a'));
  var tally = document.getElementById('tally');
  var say = document.getElementById('say');
  var index = 0;

  function engage(next, flash) {
    if (next < 0) next = switches.length - 1;
    if (next >= switches.length) next = 0;
    index = next;
    switches.forEach(function (sw, i) {
      var on = i === index;
      sw.setAttribute('aria-checked', on ? 'true' : 'false');
      sw.setAttribute('tabindex', on ? '0' : '-1');
      var card = document.getElementById(sw.getAttribute('aria-controls'));
      if (card) {
        if (on) card.removeAttribute('hidden');
        else card.setAttribute('hidden', '');
      }
      if (on) {
        sw.classList.remove('is-hit');
        void sw.offsetWidth;
        sw.classList.add('is-hit');
      }
    });
    var card = document.getElementById(switches[index].getAttribute('aria-controls'));
    if (card) {
      var name = card.querySelector('.card__t').textContent;
      var term = switches[index].querySelector('.sw__term').textContent;
      say.textContent = 'Línea ' + term.replace(/\D/g, '') + ' en servicio: ' + name;
      tally.textContent = (index + 1) + ' / ' + switches.length + ' en servicio';
    }
    records.forEach(function (a) {
      if (card && a.getAttribute('href') === '#' + card.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (flash) switches[index].focus();
  }

  switches.forEach(function (sw, i) {
    sw.addEventListener('click', function () {
      engage(i, false);
    });
    sw.addEventListener('keydown', function (e) {
      var k = e.key;
      var next = -1;
      if (k === 'ArrowRight' || k === 'ArrowDown') next = i + 1;
      else if (k === 'ArrowLeft' || k === 'ArrowUp') next = i - 1;
      else if (k === 'Home') next = 0;
      else if (k === 'End') next = switches.length - 1;
      if (next < 0) return;
      e.preventDefault();
      engage(next, true);
    });
  });

  plans.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    plans.forEach(function (btn) {
      if (btn.getAttribute('aria-expanded') === 'true') {
        btn.setAttribute('aria-expanded', 'false');
        btn.focus();
      }
    });
  });

  records.forEach(function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('href').slice(1);
      switches.forEach(function (sw, i) {
        if (sw.getAttribute('aria-controls') === id) engage(i, false);
      });
      var card = document.getElementById(id);
      if (card) window.setTimeout(function () { card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 40);
    });
  });

  engage(0, false);
})();
