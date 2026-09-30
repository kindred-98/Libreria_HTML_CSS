(function () {
  var mast = document.getElementById('mast');
  var drawer = document.getElementById('drawer');
  var burger = document.getElementById('burger');
  var jumps = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var lots = Array.prototype.slice.call(document.querySelectorAll('.lot'));
  var countEl = document.getElementById('count');
  var emptyEl = document.getElementById('empty');
  var clk = document.getElementById('clk');
  var findBtn = document.getElementById('findBtn');
  var inputs = [document.getElementById('q'), document.getElementById('q2')].filter(Boolean);
  var forms = [document.getElementById('findForm'), document.getElementById('findForm2')].filter(Boolean);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ids = ['catalogue', 'auctions', 'appraisals', 'about'];
  var pending = false;

  function spy() {
    pending = false;
    var y = window.scrollY || window.pageYOffset || 0;
    mast.classList.toggle('is-shrunk', y > 40);
    var line = 150;
    var current = '';
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= line) current = id;
    });
    jumps.forEach(function (a) {
      if (current && a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function onScroll() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  spy();

  function openDrawer() {
    drawer.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close the menu');
    var first = drawer.querySelector('a');
    if (first) first.focus();
  }

  function closeDrawer(back) {
    drawer.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open the menu');
    if (back) burger.focus();
  }

  burger.addEventListener('click', function () {
    if (drawer.hidden) openDrawer();
    else closeDrawer(true);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !drawer.hidden) closeDrawer(true);
  });

  drawer.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('a')) closeDrawer(false);
  });

  window.addEventListener('resize', function () {
    if (!drawer.hidden && window.innerWidth > 960) closeDrawer(false);
  });

  if (findBtn) {
    findBtn.addEventListener('click', function () {
      window.scrollTo({ top: 200, behavior: reduced ? 'auto' : 'smooth' });
      mast.classList.add('is-shrunk');
      window.setTimeout(function () {
        var target = document.getElementById('q');
        if (target) target.focus();
      }, reduced ? 0 : 340);
    });
  }

  function filter(term) {
    term = (term || '').trim().toLowerCase();
    var shown = 0;
    lots.forEach(function (li) {
      var hit = !term || li.textContent.toLowerCase().indexOf(term) > -1;
      li.hidden = !hit;
      if (hit) shown++;
    });
    countEl.textContent = 'Showing ' + shown + ' of ' + lots.length + ' lots';
    emptyEl.hidden = shown !== 0;
  }

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      inputs.forEach(function (other) {
        if (other !== input) other.value = input.value;
      });
      filter(input.value);
    });
  });

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var field = form.querySelector('input');
      filter(field ? field.value : '');
      if (!drawer.hidden) closeDrawer(false);
      var target = document.getElementById('catalogue');
      if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });
  });

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function tick() {
    var d = new Date();
    clk.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  tick();
  window.setInterval(tick, 1000);
})();
