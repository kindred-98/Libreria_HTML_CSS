(function () {
  var peds = [].slice.call(document.querySelectorAll('.ped'));
  var hint = document.getElementById('hintT');
  var indexLinks = [].slice.call(document.querySelectorAll('.index__list a'));
  var appt = document.getElementById('appt');
  var slots = document.getElementById('slots');
  var slotOk = document.getElementById('slotOk');
  var slotButtons = [].slice.call(slots.querySelectorAll('button'));
  var index = 0;

  function sheet(i, ring) {
    if (i < 0) i = peds.length - 1;
    if (i >= peds.length) i = 0;
    index = i;
    peds.forEach(function (ped, k) {
      var on = k === index;
      ped.setAttribute('aria-checked', on ? 'true' : 'false');
      ped.setAttribute('tabindex', on ? '0' : '-1');
      if (on && ring) {
        ped.classList.remove('is-hit');
        void ped.offsetWidth;
        ped.classList.add('is-hit');
      }
    });
    var ped = peds[index];
    var ref = ped.querySelector('.plate__ref').textContent;
    var name = ped.querySelector('.plate__n').textContent;
    hint.textContent = ref + ' · ' + name;
    var card = document.getElementById(ped.getAttribute('aria-controls'));
    indexLinks.forEach(function (a) {
      if (card && a.getAttribute('href') === '#' + card.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (card && ring) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  peds.forEach(function (ped, i) {
    ped.addEventListener('click', function () {
      sheet(i, true);
    });
    ped.addEventListener('keydown', function (e) {
      var next = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i + 1;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i - 1;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = peds.length - 1;
      if (next < 0) return;
      e.preventDefault();
      sheet(next, false);
      peds[index].focus();
    });
  });

  indexLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('href').slice(1);
      peds.forEach(function (ped, i) {
        if (ped.getAttribute('aria-controls') === id) sheet(i, true);
      });
    });
  });

  function closeSlots(refocus) {
    if (slots.hasAttribute('hidden')) return;
    slots.setAttribute('hidden', '');
    appt.setAttribute('aria-expanded', 'false');
    if (refocus) appt.focus();
  }

  appt.addEventListener('click', function () {
    if (appt.getAttribute('aria-expanded') === 'true') closeSlots(true);
    else {
      slots.removeAttribute('hidden');
      appt.setAttribute('aria-expanded', 'true');
      slotButtons[0].focus();
    }
  });

  slotButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      slotButtons.forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      slotOk.textContent = 'Cita reservada: ' + btn.getAttribute('data-slot') + ' con el taller';
      slotOk.classList.add('on');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!slots.hasAttribute('hidden')) {
      closeSlots(true);
      return;
    }
    if (peds.indexOf(document.activeElement) > -1) {
      peds[index].classList.remove('is-hit');
      void peds[index].offsetWidth;
      peds[index].classList.add('is-hit');
    }
  });

  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target && target.classList && target.classList.contains('ficha')) {
      peds.forEach(function (ped, i) {
        if (ped.getAttribute('aria-controls') === target.id) sheet(i, false);
      });
    }
  }

  sheet(0, false);
})();
