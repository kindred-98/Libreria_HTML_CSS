(function () {
  var strip = document.getElementById("strip");
  var run = document.getElementById("run");
  var prog = document.getElementById("prog");
  var frameNo = document.getElementById("frameNo");
  var frameName = document.getElementById("frameName");
  var frames = [].slice.call(run.querySelectorAll(".frame"));
  var legs = [].slice.call(document.querySelectorAll(".legs a"));
  var legLinks = frames.map(function (f) { return f.getAttribute("href"); });
  var override = null;
  var current = -1;
  var ticking = false;

  function gateX() {
    return strip.getBoundingClientRect().left + window.innerWidth / 2;
  }

  function centerFor(i) {
    var f = frames[i];
    return gateX() - (f.offsetLeft + f.offsetWidth / 2);
  }

  function progress() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, window.scrollY / max));
  }

  function mark(i) {
    if (i === current) return;
    current = i;
    for (var k = 0; k < frames.length; k++) {
      if (k === i) frames[k].setAttribute("aria-current", "page");
      else frames[k].removeAttribute("aria-current");
    }
    for (var j = 0; j < legs.length; j++) {
      if (legs[j].getAttribute("href") === legLinks[i]) legs[j].setAttribute("aria-current", "page");
      else legs[j].removeAttribute("aria-current");
    }
    frameNo.textContent = String(i + 1).padStart(2, "0");
    frameName.textContent = frames[i].querySelector("b").textContent;
  }

  function render() {
    var p = progress();
    var start = centerFor(0);
    var end = centerFor(frames.length - 1);
    var x = override !== null ? centerFor(override) : start + (end - start) * p;
    run.style.transform = "translateX(" + x.toFixed(1) + "px)";
    prog.style.transform = "scaleX(" + p.toFixed(3) + ")";

    var best = 0;
    var bestD = Infinity;
    var gx = gateX();
    for (var i = 0; i < frames.length; i++) {
      var cx = x + frames[i].offsetLeft + frames[i].offsetWidth / 2;
      var d = Math.abs(cx - gx);
      if (d < bestD) { bestD = d; best = i; }
    }
    mark(best);
  }

  function schedule() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; render(); });
  }

  function bind(list, scroll) {
    for (var i = 0; i < list.length; i++) {
      (function (el) {
        var idx = frames.indexOf(el);
        if (idx < 0) idx = legs.indexOf(el);
        el.addEventListener("click", function (e) {
          var href = el.getAttribute("href");
          var target = document.querySelector(href);
          override = idx;
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            if (history.replaceState) history.replaceState(null, "", href);
          }
        });
        if (scroll) {
          el.addEventListener("focus", function () { override = idx; render(); });
          el.addEventListener("blur", function () { override = null; render(); });
        }
      })(list[i]);
    }
  }

  bind(frames, true);
  bind(legs, true);

  function arrowNav(container, list) {
    container.addEventListener("keydown", function (e) {
      var idx = list.indexOf(document.activeElement);
      if (idx < 0) return;
      var next = -1;
      if (e.key === "ArrowRight") next = (idx + 1) % list.length;
      else if (e.key === "ArrowLeft") next = (idx - 1 + list.length) % list.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = list.length - 1;
      if (next >= 0) {
        e.preventDefault();
        list[next].focus();
      }
    });
  }

  arrowNav(strip, frames);
  arrowNav(document.querySelector(".legs"), legs);

  window.addEventListener("scroll", function () {
    override = null;
    schedule();
  }, { passive: true });
  window.addEventListener("resize", schedule);

  render();
  window.setTimeout(render, 60);
})();
