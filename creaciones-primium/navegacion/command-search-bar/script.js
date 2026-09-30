(function () {
  var INDEX = [
    { id: 'doc', title: 'Overview', path: 'Guide · Overview', kind: 'Guide', keys: 'halyard api introduction endpoints bookings harbours ferries' },
    { id: 'quickstart', title: 'Quickstart', path: 'Guide · Quickstart', kind: 'Guide', keys: 'first request availability berths bearer key curl' },
    { id: 'authentication', title: 'Authentication', path: 'Guide · Authentication', kind: 'Guide', keys: 'bearer token rotation scope keys security console' },
    { id: 'rate-limits', title: 'Rate limits', path: 'Guide · Rate limits', kind: 'Guide', keys: '429 throttling retry after headers window requests per minute' },
    { id: 'webhooks', title: 'Webhooks', path: 'Guide · Webhooks', kind: 'Guide', keys: 'events hmac signature delivery retries payload' },
    { id: 'errors', title: 'Error codes', path: 'Reference · Errors', kind: 'Reference', keys: '4001 4013 4091 4290 request id failure' },
    { id: 'sdk', title: 'Client libraries', path: 'Reference · SDKs', kind: 'Reference', keys: 'python ruby go typescript pip install cli' },
    { id: 'changelog', title: 'Changelog', path: 'Reference · Changelog', kind: 'Reference', keys: 'releases versions 4.2 deprecation notes' }
  ];
  var palette = document.getElementById('palette');
  var input = document.getElementById('cmdInput');
  var list = document.getElementById('cmdList');
  var count = document.getElementById('cmdCount');
  var trigger = document.getElementById('searchBtn');
  var jumps = Array.prototype.slice.call(document.querySelectorAll('.jump'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var results = INDEX.slice();
  var active = 0;
  var pending = false;

  function haystack(item) {
    return (item.title + ' ' + item.path + ' ' + item.keys).toLowerCase();
  }

  function setActive(index) {
    var items = list.querySelectorAll('li');
    if (!items.length) return;
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    active = index;
    Array.prototype.forEach.call(items, function (li, i) {
      li.setAttribute('aria-selected', i === index ? 'true' : 'false');
    });
    input.setAttribute('aria-activedescendant', items[index].id);
    items[index].scrollIntoView({ block: 'nearest' });
  }

  function render(query) {
    query = (query || '').trim().toLowerCase();
    var words = query ? query.split(/\s+/) : [];
    results = INDEX.filter(function (item) {
      var hay = haystack(item);
      return words.every(function (word) { return hay.indexOf(word) > -1; });
    });
    list.innerHTML = results.map(function (item, i) {
      return '<li role="option" id="opt-' + item.id + '" aria-selected="' + (i === 0) + '">' +
        '<a href="#' + item.id + '" tabindex="-1">' +
        '<span class="opt__body"><span class="opt__title">' + item.title + '</span>' +
        '<span class="opt__path">' + item.path + '</span></span>' +
        '<span class="opt__kind">' + item.kind + '</span></a></li>';
    }).join('');
    count.textContent = results.length + ' of ' + INDEX.length + ' sections';
    active = 0;
    if (results.length) input.setAttribute('aria-activedescendant', 'opt-' + results[0].id);
    else input.removeAttribute('aria-activedescendant');
  }

  function openPalette() {
    palette.hidden = false;
    document.body.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    input.value = '';
    render('');
    input.focus();
  }

  function closePalette(back) {
    palette.hidden = true;
    document.body.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (back) trigger.focus();
  }

  function go(index) {
    var item = results[index];
    if (!item) return;
    closePalette(false);
    window.location.hash = '#' + item.id;
    var target = document.getElementById(item.id);
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    window.setTimeout(function () {
      target.focus({ preventScroll: true });
    }, reduced ? 0 : 420);
  }

  trigger.addEventListener('click', function () {
    if (palette.hidden) openPalette();
    else closePalette(true);
  });

  input.addEventListener('input', function () {
    render(input.value);
  });

  list.addEventListener('mouseover', function (e) {
    var li = e.target.closest ? e.target.closest('li') : null;
    if (!li) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    var i = items.indexOf(li);
    if (i > -1 && i !== active) setActive(i);
  });

  list.addEventListener('click', function (e) {
    var li = e.target.closest ? e.target.closest('li') : null;
    if (!li) return;
    e.preventDefault();
    var items = Array.prototype.slice.call(list.querySelectorAll('li'));
    go(items.indexOf(li));
  });

  document.addEventListener('mousedown', function (e) {
    if (palette.hidden) return;
    if (palette.contains(e.target) || trigger.contains(e.target)) return;
    closePalette(false);
  });

  document.addEventListener('keydown', function (e) {
    var open = !palette.hidden;
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (open) closePalette(true);
      else openPalette();
      return;
    }
    if (!open && e.key === '/' && !typing) {
      e.preventDefault();
      openPalette();
      return;
    }
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closePalette(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (results.length) setActive(active + 1);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (results.length) setActive(active - 1);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      go(active);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      input.focus();
    }
  });

  function spy() {
    pending = false;
    var current = '';
    jumps.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 200) current = id;
    });
    jumps.forEach(function (a) {
      if (current && a.getAttribute('href') === '#' + current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', function () {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }, { passive: true });

  render('');
  spy();
})();
