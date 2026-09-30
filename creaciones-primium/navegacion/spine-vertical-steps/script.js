(function () {
  var links = document.querySelectorAll(".step__a");
  var list = [];
  var secs = [];
  var i;
  for (i = 0; i < links.length; i++) {
    list.push(links[i]);
    secs.push(document.getElementById(links[i].getAttribute("href").slice(1)));
  }
  var fill = document.getElementById("spineFill");
  var meter = document.getElementById("meterVal");
  var nav = document.querySelector(".spine");
  var active = -1;
  var queued = false;

  function setActive(index) {
    if (index === active) return;
    active = index;
    for (var k = 0; k < list.length; k++) {
      if (k === index) list[k].setAttribute("aria-current", "true");
      else list[k].removeAttribute("aria-current");
      if (secs[k]) secs[k].classList.toggle("is-here", k === index);
    }
  }

  function update() {
    queued = false;
    var vh = window.innerHeight;
    var mark = vh * 0.38;
    var idx = 0;
    for (var k = 0; k < secs.length; k++) {
      if (secs[k] && secs[k].getBoundingClientRect().top <= mark) idx = k;
    }
    setActive(idx);
    var doc = document.documentElement;
    var max = Math.max(1, doc.scrollHeight - vh);
    var top = window.pageYOffset || doc.scrollTop || 0;
    var p = Math.min(1, Math.max(0, top / max));
    fill.style.transform = "scaleY(" + p.toFixed(4) + ")";
    var n = Math.round(p * 100);
    meter.textContent = (n < 10 ? "0" : "") + n;
  }

  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  if (nav) {
    nav.addEventListener("keydown", function (e) {
      var cur = list.indexOf(document.activeElement);
      if (cur < 0) return;
      var next = -1;
      if (e.key === "ArrowDown") next = Math.min(list.length - 1, cur + 1);
      else if (e.key === "ArrowUp") next = Math.max(0, cur - 1);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = list.length - 1;
      if (next >= 0) {
        e.preventDefault();
        list[next].focus();
      }
    });
  }

  update();
  window.addEventListener("load", update);
})();
