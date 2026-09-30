(function () {
  var spot = document.getElementById('spot');
  var inner = spot.querySelector('.spot__inner');
  var input = document.getElementById('q');
  var results = document.getElementById('results');
  var count = document.getElementById('count');
  var none = document.getElementById('none');
  var closeBtn = document.getElementById('spotClose');
  var wash = spot.querySelector('.spot__wash');
  var prevKind = document.getElementById('prevKind');
  var prevTitle = document.getElementById('prevTitle');
  var prevBody = document.getElementById('prevBody');
  var prevHint = document.getElementById('prevHint');
  var emblem = document.getElementById('emblem');
  var askBtn = document.getElementById('askBtn');
  var bigBtn = document.getElementById('bigBtn');
  var last = null;
  var savedY = 0;
  var sel = -1;
  var shown = [];

  var data = [
    { g: 'Articles', t: 'Typography', k: 'Article', to: '#typography',
      b: 'Setting metal type and the judgement of the line: body size, leading, and the two measurements that govern every page in the index.',
      s: 'type, letterpress, serif, leading, punchcutting' },
    { g: 'Articles', t: 'Papermaking', k: 'Article', to: '#papermaking',
      b: 'Rag beaten in water, lifted on a wire mould, pressed and hung, with watermarks as the field marks of the trade.',
      s: 'paper, rag, mould, watermark, couching, laid paper' },
    { g: 'Articles', t: 'Binding and the case', k: 'Article', to: '#binding',
      b: 'Sewing, gluing, rounding, backing and casing, and why a chain sewn short fails at the shoulder of the book.',
      s: 'book, case, sewing, gilding, spine, boards' },
    { g: 'Articles', t: 'Engraving and etching', k: 'Article', to: '#engraving',
      b: 'A line cut with a graver against a line left to the acid, and what raking light shows about the difference.',
      s: 'graver, burin, etching, mezzotint, plate, intaglio' },
    { g: 'Articles', t: 'Cartography', k: 'Article', to: '#cartography',
      b: 'A map is an argument about what matters. Projection, sacrifice, and the two surveys that disagree about a hedge.',
      s: 'map, projection, mercator, survey, atlas, equal area' },
    { g: 'Articles', t: 'Optics and the lens grinder', k: 'Article', to: '#optics',
      b: 'Glass ground between two iron tools and checked with a test plate, and the two glasses that make a compound lens work.',
      s: 'lens, grinder, crown glass, flint, aberration, microscope' },
    { g: 'Articles', t: 'Horology and the escapement', k: 'Article', to: '#horology',
      b: 'A spring that wants to unwind, an escapement that will not let it, and a balance that expands with the heat of the room.',
      s: 'clock, escapement, balance, regulator, beat, deadbeat' },
    { g: 'Articles', t: 'Metallurgy of the tools', k: 'Article', to: '#metallurgy',
      b: 'Pattern welding, crucible steel and cementation, and why the colour of the oxide is the whole of the tempering method.',
      s: 'steel, temper, crucible, cementation, graver, hardness' },

    { g: 'Glossary', t: 'Serif', k: 'Term', to: '#typography',
      b: 'The small finishing stroke at the end of a glyph, inherited from the chisel rather than from the pen.',
      s: 'typeface, stroke, glyph' },
    { g: 'Glossary', t: 'Leading', k: 'Term', to: '#typography',
      b: 'The distance from one line of type to the next, set in the same units as the body and judged at arm length.',
      s: 'type, spacing, measure' },
    { g: 'Glossary', t: 'Watermark', k: 'Term', to: '#papermaking',
      b: 'The image of the mould wire held in the sheet, read under raking light and dated to within a decade.',
      s: 'paper, wire, mould' },
    { g: 'Glossary', t: 'Gilding', k: 'Term', to: '#binding',
      b: 'Leather laid on size and covered with gold leaf, burnished with an agate and prone to crack at the fold.',
      s: 'gold leaf, size, burnish, leather' },
    { g: 'Glossary', t: 'Hatching', k: 'Term', to: '#engraving',
      b: 'A set of parallel strokes that carries tone without a grey, and the reason a hatched sky reads better than a wiped one.',
      s: 'tone, stroke, relief, line' },

    { g: 'Atlases', t: 'Sheet 3, Asia Minor', k: 'Plate', to: '#cartography',
      b: 'Engraved 1791 from a survey of 1788, with the coastal outline corrected in the second issue.',
      s: 'sheet, plate, map, survey, coast' },
    { g: 'Atlases', t: 'Sheet 12, the European series', k: 'Plate', to: '#cartography',
      b: 'The great folio series in Mercator, forty sheets issued over nine years and never completed.',
      s: 'sheet, folio, mercator, series' },
    { g: 'Atlases', t: 'Sheet 27, the Americas', k: 'Plate', to: '#cartography',
      b: 'Equal area projection, deliberately stretched, to keep the comparison honest at the two ends of the continent.',
      s: 'sheet, equal area, projection' },
    { g: 'Atlases', t: 'Plate 14, the escapement', k: 'Plate', to: '#horology',
      b: 'Side view of a deadbeat escapement with the pallets numbered; the side view was redrawn in this edition.',
      s: 'plate, escapement, drawing, diagram' },

    { g: 'People', t: 'Johannes Gutenberg', k: 'Biog', to: '#typography',
      b: 'Recorded at Mainz between 1450 and 1455, and remembered almost entirely for a lawsuit he won.',
      s: 'gutenberg, mainz, press, incunabulum' },
    { g: 'People', t: 'William Caslon', k: 'Biog', to: '#typography',
      b: 'Engraver and typefounder; the faces he cut in the 1720s held the English book for a century afterwards.',
      s: 'caslon, typeface, founder, engravings' },
    { g: 'People', t: 'Joseph Merz', k: 'Biog', to: '#optics',
      b: 'Instrument maker to the astronomical societies, and the author of the first practical table of refractive index.',
      s: 'merz, optics, instrument, refractive' },
    { g: 'People', t: 'Antoine Le Vaillant', k: 'Biog', to: '#engraving',
      b: 'Etcher of the Paris school, who ground his own copper and taught eleven pupils who all ground their own copper.',
      s: 'levaillant, etching, paris, copper' },
    { g: 'People', t: 'Thomas Molyneux', k: 'Biog', to: '#cartography',
      b: 'Astronomer and instrument maker whose globes are still the standard for checking an early nineteenth-century survey.',
      s: 'molyneux, globe, survey, astronomy' },

    { g: 'Commands', t: 'Go to the library', k: 'Go to', to: '#library',
      b: 'Return to the head of the index, where the search field and the subject list live.',
      s: 'top, home, start' },
    { g: 'Commands', t: 'Go to the reading room', k: 'Go to', to: '#reading',
      b: 'Four folio volumes, a long table, and a note about leaning on the books.',
      s: 'reading, volumes, table' },
    { g: 'Commands', t: 'Go to the colophon', k: 'Go to', to: '#colophon',
      b: 'How the ninth edition was set, printed and bound, and where the errata slip is kept.',
      s: 'colophon, edition, errata, binding' }
  ];

  function norm(s) {
    return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  var index = data.map(function (d) {
    return { g: d.g, t: d.t, k: d.k, to: d.to, b: d.b, hay: norm(d.t + ' ' + d.s + ' ' + d.b + ' ' + d.g) };
  });

  function score(item, terms) {
    var total = 0;
    for (var i = 0; i < terms.length; i++) {
      var at = item.hay.indexOf(terms[i]);
      if (at < 0) return -1;
      total += at < item.t.length + 6 ? 3 : 1;
    }
    return total;
  }

  function find(query) {
    var terms = norm(query).split(' ').filter(function (t) { return t.length > 1; });
    if (!terms.length) return index.slice();
    return index
      .map(function (it) { return { it: it, s: score(it, terms) }; })
      .filter(function (r) { return r.s >= 0; })
      .sort(function (a, b) { return b.s - a.s || a.it.t.length - b.it.t.length; })
      .map(function (r) { return r.it; });
  }

  function group(list) {
    var order = ['Articles', 'Glossary', 'Atlases', 'People', 'Commands'];
    var out = [];
    order.forEach(function (name) {
      var rows = list.filter(function (r) { return r.g === name; });
      if (rows.length) out.push({ name: name, rows: rows });
    });
    return out;
  }

  function emblemFor(g, title) {
    var paths = {
      Articles: '<path d="M60 20v80M20 60h80"/><path d="M34 34l52 52M86 34l-52 52"/>',
      Glossary: '<path d="M28 34h64M28 52h64M28 70h44M28 88h30"/>',
      Atlases: '<path d="M22 34l38-14 38 14v52L60 100 22 86z"/><path d="M60 20v80"/>',
      People: '<circle cx="60" cy="46" r="16"/><path d="M30 100c0-18 13-30 30-30s30 12 30 30"/>',
      Commands: '<path d="M60 24 94 60 60 96 26 60z"/><path d="M60 24v72M26 60h68"/>'
    };
    emblem.innerHTML = '<circle class="em__ring" cx="60" cy="60" r="48"/><circle cx="60" cy="60" r="30"/>' +
      (paths[g] || paths.Articles);
    prevKind.textContent = g.replace(/s$/, '') + ' \u00b7 ' + title;
  }

  function setPreview(item) {
    if (!item) {
      prevKind.textContent = 'Nothing selected';
      prevTitle.textContent = shown.length ? 'Nothing selected' : 'Start typing';
      prevBody.textContent = shown.length
        ? 'Move the pointer or press the down arrow to read a preview of an entry.'
        : 'Results are grouped by kind and the first one is offered as a preview. Use the arrow keys to move through the list and Return to open the entry.';
      prevHint.textContent = 'Esc closes and returns the focus where it was.';
      emblem.innerHTML = '<circle class="em__ring" cx="60" cy="60" r="48"/><path class="em__cross" d="M60 8v104M8 60h104"/>';
      return;
    }
    emblemFor(item.g, item.t);
    prevTitle.textContent = item.t;
    prevBody.textContent = item.b;
    prevHint.textContent = 'Opens ' + item.to.replace('#', 'the section ') + '.';
  }

  function render(list) {
    shown = list;
    sel = -1;
    results.textContent = '';
    if (!list.length) {
      count.textContent = 'No entry carries that word';
      none.hidden = false;
      setPreview(null);
      return;
    }
    none.hidden = true;
    var blocks = group(list);
    var frag = document.createDocumentFragment();
    var total = 0;
    blocks.forEach(function (b, bi) {
      total += b.rows.length;
      var sec = document.createElement('section');
      var head = document.createElement('p');
      head.className = 'grp__k';
      head.innerHTML = '<b>' + String(bi + 1).padStart(2, '0') + '</b> ' + b.name +
        ' \u00b7 ' + b.rows.length;
      sec.appendChild(head);
      var ul = document.createElement('ul');
      ul.className = 'res';
      ul.setAttribute('role', 'list');
      b.rows.forEach(function (item) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = item.to;
        a.className = 'res__a';
        var n = document.createElement('span');
        n.className = 'res__n';
        n.textContent = String(blocks.slice(0, bi).reduce(function (s, x) { return s + x.rows.length; }, 0) +
          b.rows.indexOf(item) + 1).padStart(2, '0');
        var t = document.createElement('span');
        t.className = 'res__t';
        var bb = document.createElement('b');
        bb.textContent = item.t;
        var ii = document.createElement('i');
        ii.textContent = item.b;
        t.appendChild(bb);
        t.appendChild(ii);
        var k = document.createElement('span');
        k.className = 'res__k';
        k.textContent = item.k;
        a.appendChild(n);
        a.appendChild(t);
        a.appendChild(k);
        li.appendChild(a);
        ul.appendChild(li);
        a.addEventListener('pointerenter', function () { setPreview(item); });
        a.addEventListener('focus', function () {
          var ls = links();
          for (var n = 0; n < ls.length; n++) ls[n].classList.remove('sel');
          sel = ls.indexOf(a);
          a.classList.add('sel');
          setPreview(item);
        });
      });
      sec.appendChild(ul);
      frag.appendChild(sec);
    });
    results.appendChild(frag);
    count.textContent = total + (total === 1 ? ' entry' : ' entries') + ' \u00b7 grouped in ' + blocks.length;
    setPreview(list[0]);
  }

  function links() {
    return Array.prototype.slice.call(results.querySelectorAll('.res__a'));
  }

  function open(trigger) {
    if (last) return;
    last = trigger || null;
    savedY = window.scrollY || window.pageYOffset;
    spot.hidden = false;
    document.body.classList.add('locked');
    document.body.style.top = -savedY + 'px';
    render(find(''));
    if (shown.length) {
      sel = 0;
      links()[0].classList.add('sel');
    }
    window.setTimeout(function () { input.focus(); }, 30);
  }

  function close(restore) {
    if (spot.hidden) return;
    spot.hidden = true;
    document.body.classList.remove('locked');
    document.body.style.top = '';
    if (restore !== false) window.scrollTo(0, savedY);
    input.value = '';
    if (last && document.contains(last)) last.focus();
    else askBtn.focus();
    last = null;
  }

  function move(step) {
    var ls = links();
    if (!ls.length) return;
    var next = sel < 0 ? 0 : (sel + step + ls.length) % ls.length;
    if (sel >= 0 && ls[sel]) ls[sel].classList.remove('sel');
    sel = next;
    ls[sel].classList.add('sel');
    ls[sel].focus();
    setPreview(shown[sel]);
  }

  input.addEventListener('input', function () {
    render(find(input.value));
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' && shown.length) {
      e.preventDefault();
      var target = shown[0].to;
      close(false);
      var dest = document.querySelector(target);
      if (dest) dest.scrollIntoView({ block: 'start' });
    }
  });

  results.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { e.preventDefault(); sel = -1; move(1); }
    else if (e.key === 'End') { e.preventDefault(); sel = links().length - 1; move(0); }
    else if (e.key === 'Escape') { e.preventDefault(); input.focus(); }
  });

  results.addEventListener('click', function (e) {
    if (e.target.closest('.res__a')) window.setTimeout(function () { close(false); }, 40);
  });

  inner.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    var f = inner.querySelectorAll('a[href], button, input, [tabindex]:not([tabindex="-1"])');
    var vis = Array.prototype.slice.call(f).filter(function (el) { return el.offsetParent !== null; });
    if (!vis.length) return;
    var first = vis[0];
    var lastEl = vis[vis.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      lastEl.focus();
    } else if (!e.shiftKey && document.activeElement === lastEl) {
      e.preventDefault();
      first.focus();
    }
  });

  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !spot.hidden) {
      e.preventDefault();
      close();
      return;
    }
    if (spot.hidden && (e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      open(askBtn);
      return;
    }
    if (spot.hidden && e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = document.activeElement ? document.activeElement.tagName : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      open(askBtn);
    }
  });

  spot.addEventListener('pointermove', function (e) {
    wash.style.setProperty('--sx', (e.clientX / Math.max(1, window.innerWidth) * 100).toFixed(1) + '%');
    wash.style.setProperty('--sy', (e.clientY / Math.max(1, window.innerHeight) * 100).toFixed(1) + '%');
  });

  askBtn.addEventListener('click', function () { open(askBtn); });
  bigBtn.addEventListener('click', function () { open(bigBtn); });

  var askShortcut = Array.prototype.slice.call(document.querySelectorAll('kbd')).filter(function (k) {
    return k.textContent === 'Ctrl K';
  });
  function label() {
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || '');
    askShortcut.forEach(function (k) { k.textContent = mac ? 'Cmd K' : 'Ctrl K'; });
  }
  label();
}());
