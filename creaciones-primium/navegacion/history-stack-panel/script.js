(function () {
  var META = {
    rotulo: { d: "14 Mar 1897", k: "Front page" },
    cronica: { d: "02 Nov 1931", k: "Chronicle 3" },
    economia: { d: "21 Sep 1968", k: "Markets 5" },
    cultura: { d: "08 May 1974", k: "Arts 2" },
    archivo: { d: "19 Jan 2004", k: "Vault file" },
    suscripcion: { d: "Today", k: "Reading room" }
  };

  var menu = document.getElementById("menu");
  var menuLinks = Array.prototype.slice.call(menu.querySelectorAll("a"));
  var leaves = Array.prototype.slice.call(document.querySelectorAll(".leaf"));
  var histBtn = document.getElementById("histBtn");
  var histN = document.getElementById("histN");
  var drawer = document.getElementById("drawer");
  var panel = document.getElementById("drawerPanel");
  var closeBtn = document.getElementById("drawerClose");
  var backBtn = document.getElementById("backBtn");
  var fwdBtn = document.getElementById("fwdBtn");
  var clearBtn = document.getElementById("clearBtn");
  var stack = document.getElementById("stack");
  var posNow = document.getElementById("posNow");
  var posAll = document.getElementById("posAll");
  var entries = [];
  var pos = 0;
  var isOpen = false;
  var backFocus = null;
  var pending = false;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function titleFor(id) {
    var leaf = document.getElementById(id);
    if (!leaf) return id;
    var h = leaf.querySelector("h2");
    return h ? h.textContent.trim() : id;
  }

  function indexOf(id) {
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].id === id) return k;
    }
    return -1;
  }

  function render() {
    // Se construye cada <li><a>...</a></li> con createElement para que los
    // textos (titulo, fecha, tipo, etc.) se inserten con textContent: antes
    // era una concatenacion que terminaba en `stack.innerHTML = out`, lo que
    // CodeQL marcaba como "DOM text reinterpreted as HTML".
    stack.replaceChildren();
    for (var k = 0; k < entries.length; k++) {
      var e = entries[k];
      var li = document.createElement("li");
      if (k > pos) li.className = "is-future";
      var a = document.createElement("a");
      a.href = "#" + e.id;
      a.dataset.i = String(k);
      if (k === pos) a.setAttribute("aria-current", "true");
      var num = document.createElement("span");
      num.className = "stack__n";
      num.textContent = String(k + 1).padStart(2, "0");
      var envol = document.createElement("span");
      var titulo = document.createElement("span");
      titulo.className = "stack__t";
      titulo.textContent = e.title;
      var detalle = document.createElement("span");
      detalle.className = "stack__d";
      detalle.textContent = e.date + " · " + e.kind;
      envol.appendChild(titulo);
      envol.appendChild(detalle);
      var estado = document.createElement("span");
      estado.className = "stack__k";
      estado.textContent = k > pos ? "ahead" : k === pos ? "here" : "back";
      a.appendChild(num);
      a.appendChild(envol);
      a.appendChild(estado);
      li.appendChild(a);
      stack.appendChild(li);
    }
    histN.textContent = String(entries.length);
    posNow.textContent = String(pos + 1);
    posAll.textContent = String(entries.length);
    backBtn.disabled = pos === 0;
    fwdBtn.disabled = pos >= entries.length - 1;
    var links = stack.querySelectorAll("a");
    for (var n = 0; n < links.length; n++) {
      (function (a, i) {
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          goTo(i);
        });
      })(links[n], n);
    }
  }

  function scrollTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    if (location.hash !== "#" + id) location.hash = id;
    mark(id);
  }

  function mark(id) {
    for (const link of menuLinks) {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  }

  function goTo(i) {
    if (i < 0 || i >= entries.length) return;
    pos = i;
    render();
    scrollTo(entries[pos].id);
  }

  function push(id) {
    if (entries.length && entries[pos] && entries[pos].id === id) {
      render();
      return;
    }
    var at = indexOf(id);
    if (at > -1) {
      if (at > pos) entries.length = at;
      pos = at;
      render();
      scrollTo(id);
      return;
    }
    if (entries.length > pos + 1) entries.length = pos + 1;
    entries.push({ id: id, title: titleFor(id), date: META[id] ? META[id].d : "Today", kind: META[id] ? META[id].k : "Section" });
    pos = entries.length - 1;
    render();
    scrollTo(id);
  }

  for (const a of menuLinks) {
    (function (a) {
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        push(a.getAttribute("href").slice(1));
      });
    })(a);
  }

  function focusables() {
    return Array.prototype.slice.call(panel.querySelectorAll("a[href],button:not([disabled])"))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function openDrawer() {
    if (isOpen) return;
    backFocus = document.activeElement;
    drawer.hidden = false;
    isOpen = true;
    histBtn.setAttribute("aria-expanded", "true");
    var f = focusables();
    if (f.length) f[0].focus();
  }

  function closeDrawer(back) {
    if (!isOpen) return;
    drawer.hidden = true;
    isOpen = false;
    histBtn.setAttribute("aria-expanded", "false");
    if (back) {
      if (backFocus && backFocus.focus) backFocus.focus();
      else histBtn.focus();
    }
  }

  histBtn.addEventListener("click", function () {
    if (isOpen) closeDrawer(true);
    else openDrawer();
  });
  closeBtn.addEventListener("click", function () { closeDrawer(true); });
  backBtn.addEventListener("click", function () { goTo(pos - 1); });
  fwdBtn.addEventListener("click", function () { goTo(pos + 1); });
  clearBtn.addEventListener("click", function () {
    var here = entries[pos];
    entries = [here];
    pos = 0;
    render();
  });

  drawer.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closeDrawer(true); return; }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  drawer.addEventListener("mousedown", function (e) {
    if (e.target === drawer) closeDrawer(false);
  });

  document.addEventListener("keydown", function (e) {
    if (!e.altKey) {
      if (e.key === "Escape" && isOpen) { e.preventDefault(); closeDrawer(true); }
      return;
    }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(pos - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(pos + 1); }
  });

  function spy() {
    pending = false;
    var markY = window.innerHeight * 0.34;
    var current = "";
    for (const leaf of leaves) {
      if (leaf.getBoundingClientRect().top <= markY) current = leaf.id;
    }
    for (const other of leaves) other.classList.toggle("is-here", other.id === current);
    if (current && isOpen) mark(current);
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  push("rotulo");
  mark("rotulo");
  leaves[0].classList.add("is-here");
  spy();
})();
