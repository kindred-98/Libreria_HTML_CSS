(function () {
  var FREE = 35;
  var dds = [];
  var all = document.querySelectorAll(".dd");
  var subs = document.querySelectorAll(".sub");
  var shelves = Array.prototype.slice.call(document.querySelectorAll(".shelf"));
  var basketBtn = document.getElementById("basketBtn");
  var basketN = document.getElementById("basketN");
  var basketSum = document.getElementById("basketSum");
  var cart = document.getElementById("cart");
  var panel = document.getElementById("cartPanel");
  var closeBtn = document.getElementById("cartClose");
  var doneBtn = document.getElementById("cartDone");
  var linesEl = document.getElementById("lines");
  var emptyEl = document.getElementById("linesEmpty");
  var subOut = document.getElementById("subOut");
  var delOut = document.getElementById("delOut");
  var totOut = document.getElementById("totOut");
  var isOpen = false;
  var backFocus = null;
  var pending = false;

  for (var i = 0; i < all.length; i++) {
    if (all[i].querySelector(".dd__btn")) dds.push(all[i]);
  }

  function money(n) {
    return n.toFixed(2);
  }

  function totals() {
    var sum = 0;
    var count = 0;
    var items = linesEl.querySelectorAll(".line");
    for (var k = 0; k < items.length; k++) {
      var q = parseInt(items[k].querySelector("[data-qty]").getAttribute("data-qty"), 10) || 0;
      sum += parseFloat(items[k].getAttribute("data-price")) * q;
      count += q;
    }
    basketN.textContent = String(count);
    basketSum.textContent = money(sum);
    subOut.textContent = money(sum);
    delOut.textContent = sum === 0 ? "Nothing to carry" : sum >= FREE ? "Free" : "4.50";
    totOut.textContent = money(sum === 0 ? 0 : sum + (sum >= FREE ? 0 : 4.5));
    emptyEl.hidden = items.length !== 0;
    doneBtn.disabled = items.length === 0;
    doneBtn.style.opacity = items.length === 0 ? ".5" : "1";
  }

  linesEl.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;
    var line = btn.closest(".line");
    if (!line) return;
    var num = line.querySelector("[data-qty]");
    var q = parseInt(num.getAttribute("data-qty"), 10) || 0;
    if (btn.hasAttribute("data-drop")) {
      line.classList.add("is-gone");
      var wait = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 260;
      window.setTimeout(function () {
        if (line.parentNode) line.parentNode.removeChild(line);
        totals();
      }, wait);
      return;
    }
    var step = parseInt(btn.getAttribute("data-step"), 10);
    q += step;
    if (q < 0) q = 0;
    num.setAttribute("data-qty", String(q));
    num.textContent = String(q);
    var less = line.querySelector('[data-step="-1"]');
    if (less) less.disabled = q === 0;
    totals();
  });

  linesEl.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    var btn = e.target.closest ? e.target.closest("button") : null;
    if (!btn || btn.hasAttribute("data-drop")) return;
    e.preventDefault();
    var line = btn.closest(".line");
    var step = e.key === "ArrowRight" ? 1 : -1;
    var num = line.querySelector("[data-qty]");
    var q = Math.max(0, (parseInt(num.getAttribute("data-qty"), 10) || 0) + step);
    num.setAttribute("data-qty", String(q));
    num.textContent = String(q);
    var less = line.querySelector('[data-step="-1"]');
    if (less) less.disabled = q === 0;
    totals();
  });

  function closeSub(sub) {
    sub.classList.remove("is-open");
    var b = sub.querySelector(".sub__btn");
    if (b) b.setAttribute("aria-expanded", "false");
  }

  function closeDd(dd, back) {
    dd.classList.remove("is-open");
    dd.classList.remove("is-pinned");
    var b = dd.querySelector(".dd__btn");
    if (b) b.setAttribute("aria-expanded", "false");
    var inner = dd.querySelectorAll(".sub");
    for (var k = 0; k < inner.length; k++) closeSub(inner[k]);
    if (back && b) b.focus();
  }

  function closeAllDds(except) {
    for (var k = 0; k < dds.length; k++) {
      if (dds[k] !== except) closeDd(dds[k], false);
    }
  }

  function openDd(dd) {
    closeAllDds(dd);
    dd.classList.add("is-open");
    var b = dd.querySelector(".dd__btn");
    if (b) b.setAttribute("aria-expanded", "true");
  }

  for (i = 0; i < dds.length; i++) {
    (function (dd) {
      var btn = dd.querySelector(".dd__btn");
      var links = dd.querySelectorAll(".dd__panel a");
      btn.addEventListener("click", function () {
        if (dd.classList.contains("is-pinned") && dd.classList.contains("is-open")) closeDd(dd, false);
        else {
          openDd(dd);
          dd.classList.add("is-pinned");
        }
      });
      dd.addEventListener("mouseenter", function () { openDd(dd); });
      dd.addEventListener("mouseleave", function () {
        if (!dd.classList.contains("is-pinned")) closeDd(dd, false);
      });
      dd.addEventListener("focusin", function () { openDd(dd); });
      dd.addEventListener("focusout", function (e) {
        if (!dd.contains(e.relatedTarget)) closeDd(dd, false);
      });
      btn.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          openDd(dd);
          dd.classList.add("is-pinned");
          if (links.length) links[e.key === "ArrowDown" ? 0 : links.length - 1].focus();
        } else if (e.key === "Escape") {
          e.preventDefault();
          closeDd(dd, true);
        }
      });
      dd.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { e.preventDefault(); closeDd(dd, true); }
      });
    })(dds[i]);
  }

  for (i = 0; i < subs.length; i++) {
    (function (sub) {
      var sbtn = sub.querySelector(".sub__btn");
      if (!sbtn) return;
      function sync() {
        var on = sub.className.indexOf("is-open") > -1 || sub.contains(document.activeElement);
        sbtn.setAttribute("aria-expanded", on ? "true" : "false");
      }
      sub.addEventListener("mouseenter", sync);
      sub.addEventListener("mouseleave", sync);
      sub.addEventListener("focusin", sync);
      sub.addEventListener("focusout", sync);
      sbtn.addEventListener("click", function () {
        sub.classList.toggle("is-open");
        sync();
      });
    })(subs[i]);
  }

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".dd")) closeAllDds(null);
  });

  function focusables() {
    var out = [];
    var list = panel.querySelectorAll("a[href],button:not([disabled])");
    for (var k = 0; k < list.length; k++) {
      if (list[k].offsetParent !== null) out.push(list[k]);
    }
    return out;
  }

  function openCart() {
    if (isOpen) return;
    backFocus = document.activeElement;
    cart.hidden = false;
    isOpen = true;
    basketBtn.setAttribute("aria-expanded", "true");
    closeAllDds(null);
    var f = focusables();
    if (f.length) f[0].focus();
  }

  function closeCart(back) {
    if (!isOpen) return;
    cart.hidden = true;
    isOpen = false;
    basketBtn.setAttribute("aria-expanded", "false");
    if (back) {
      if (backFocus && backFocus.focus) backFocus.focus();
      else basketBtn.focus();
    }
  }

  basketBtn.addEventListener("click", function () {
    if (isOpen) closeCart(true);
    else openCart();
  });
  closeBtn.addEventListener("click", function () { closeCart(true); });
  doneBtn.addEventListener("click", function () {
    cart.classList.add("is-paid");
    doneBtn.textContent = "Paid at the counter";
  });

  cart.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { e.preventDefault(); closeCart(true); return; }
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

  cart.addEventListener("mousedown", function (e) {
    if (e.target === cart) closeCart(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen) { e.preventDefault(); closeCart(true); }
  });

  window.addEventListener("resize", function () { if (isOpen) closeCart(false); });

  function spy() {
    pending = false;
    var markY = window.innerHeight * 0.36;
    var now = "";
    for (var k = 0; k < shelves.length; k++) {
      if (shelves[k].getBoundingClientRect().top <= markY) now = shelves[k].id;
    }
    var links = document.querySelectorAll('a[href^="#"]');
    for (var n = 0; n < links.length; n++) {
      var id = links[n].getAttribute("href").slice(1);
      if (id && id === now) links[n].setAttribute("aria-current", "true");
      else links[n].removeAttribute("aria-current");
    }
    for (var s = 0; s < shelves.length; s++) shelves[s].classList.toggle("is-here", shelves[s].id === now);
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(spy);
  }
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  var lessButtons = linesEl.querySelectorAll('[data-step="-1"]');
  for (var q = 0; q < lessButtons.length; q++) lessButtons[q].disabled = false;
  totals();
  spy();
})();
