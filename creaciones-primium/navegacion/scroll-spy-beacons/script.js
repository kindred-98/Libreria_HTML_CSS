(function () {
  var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
  var bcns = Array.prototype.slice.call(document.querySelectorAll(".bcn"));
  var fill = document.getElementById("fill");
  var head = document.getElementById("head");
  var pct = document.getElementById("pct");
  var depth = document.getElementById("depth");
  var needle = document.getElementById("needle");
  var sounderVal = document.getElementById("sounderVal");
  var sounderUnit = document.getElementById("sounderUnit");
  var pending = false;
  var last = "";

  function paint() {
    pending = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var vh = window.innerHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var p = Math.min(1, Math.max(0, y / max));

    fill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    head.style.transform = "translateX(" + (p * window.innerWidth).toFixed(1) + "px)";
    var value = Math.round(p * 100);
    pct.textContent = value < 10 ? "0" + value : String(value);

    var mark = vh * 0.36;
    var current = 0;
    for (var k = 0; k < sheets.length; k++) {
      if (sheets[k].getBoundingClientRect().top <= mark) current = k;
    }
    depth.textContent = String(current + 1);

    needle.style.transform = "translateX(-50%) rotate(" + (-118 + p * 236).toFixed(2) + "deg)";

    for (var n = 0; n < bcns.length; n++) {
      var isHere = n === current;
      var isPast = n < current;
      bcns[n].classList.toggle("is-here", isHere);
      bcns[n].classList.toggle("is-past", isPast);
      if (isHere) bcns[n].setAttribute("aria-current", "true");
      else bcns[n].removeAttribute("aria-current");
    }
    for (var s = 0; s < sheets.length; s++) sheets[s].classList.toggle("is-here", s === current);

    var top = sheets[current + 1];
    var metres, label;
    if (top) {
      metres = Math.max(0, (top.getBoundingClientRect().top - vh * 0.36) / 26);
      label = "m to sheet " + String(current + 2).padStart(2, "0");
    } else {
      metres = Math.max(0, (document.documentElement.scrollHeight - y - vh) / 26);
      label = "m to the last line";
    }
    sounderVal.textContent = metres.toFixed(1);
    sounderUnit.textContent = label;
    last = String(current);
  }

  function queue() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(paint);
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  for (const a of bcns) {
    (function (a) {
      a.addEventListener("keydown", function (e) {
        var here = a.parentNode ? Array.prototype.indexOf.call(a.parentNode.children, a) : 0;
        var next = -1;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") next = here + 1;
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = here - 1;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = bcns.length - 1;
        if (next > -1 && next < bcns.length) {
          e.preventDefault();
          bcns[next].focus();
        }
      });
    })(a);
  }

  paint();
  if (last === "" && sheets.length) sheets[0].classList.add("is-here");
})();
