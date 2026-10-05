(function () {
  var stops = [];
  var links = document.querySelectorAll(".stop");
  var i;
  for (i = 0; i < links.length; i++) stops.push(links[i]);
  var entries = document.querySelectorAll(".entry");
  var dial = document.getElementById("dial");
  var needle = document.getElementById("needle");
  var slide = document.getElementById("stopsSlide");
  var fVal = document.getElementById("fVal");
  var mOpen = document.getElementById("mOpen");
  var mDof = document.getElementById("mDof");
  var mShut = document.getElementById("mShut");
  var data = [
    { f: "f/1.4", open: "35.7 mm", dof: "0.09 m", shut: "1/2000 s" },
    { f: "f/2", open: "25.0 mm", dof: "0.13 m", shut: "1/1000 s" },
    { f: "f/2.8", open: "17.9 mm", dof: "0.18 m", shut: "1/500 s" },
    { f: "f/4", open: "12.5 mm", dof: "0.26 m", shut: "1/250 s" },
    { f: "f/5.6", open: "8.9 mm", dof: "0.37 m", shut: "1/125 s" },
    { f: "f/8", open: "6.3 mm", dof: "0.53 m", shut: "1/60 s" }
  ];
  var current = -1;

  function place(index, animate) {
    var stop = stops[index];
    if (!stop || !slide) return;
    if (!animate) slide.style.transition = "none";
    slide.style.width = stop.offsetWidth + "px";
    slide.style.height = stop.offsetHeight + "px";
    slide.style.transform = "translate(" + (stop.offsetLeft - 6) + "px," + (stop.offsetTop - 6) + "px)";
    if (!animate) {
      slide.getBoundingClientRect();
      slide.style.transition = "";
    }
  }

  function select(index) {
    if (index < 0 || index >= stops.length || index === current) {
      if (index === current) place(index, true);
      return;
    }
    current = index;
    for (var k = 0; k < stops.length; k++) {
      if (k === index) stops[k].setAttribute("aria-current", "true");
      else stops[k].removeAttribute("aria-current");
    }
    for (var entry of entries) {
      entry.classList.toggle("is-here", entry.id === "sec-" + (index + 1));
    }
    dial.dataset.stop = String(index);
    needle.style.setProperty("--ang", (-150 + index * 60) + "deg");
    fVal.textContent = data[index].f;
    mOpen.textContent = data[index].open;
    mDof.textContent = data[index].dof;
    mShut.textContent = data[index].shut;
    place(index, true);
  }

  for (i = 0; i < stops.length; i++) {
    (function (index) {
      stops[index].addEventListener("click", function () { select(index); });
      stops[index].addEventListener("focus", function () { select(index); });
      stops[index].addEventListener("mouseenter", function () { place(index, true); });
      stops[index].addEventListener("mouseleave", function () { place(current, true); });
      stops[index].addEventListener("keydown", function (e) {
        var next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % stops.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + stops.length) % stops.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = stops.length - 1;
        if (next >= 0) {
          e.preventDefault();
          stops[next].focus();
          select(next);
        }
      });
    })(i);
  }

  function spy() {
    var mark = window.innerHeight * 0.42;
    var found = -1;
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].getBoundingClientRect().top <= mark) found = k;
    }
    if (found >= 0 && entries[found].id.indexOf("sec-") === 0) {
      var idx = Number.parseInt(entries[found].id.slice(4), 10) - 1;
      if (idx >= 0 && idx < stops.length) select(idx);
    } else if (entries[found] && entries[found].id === "care") {
      for (var n = 0; n < entries.length; n++) {
        entries[n].classList.toggle("is-here", n === found);
      }
    }
  }

  var queued = false;
  function queue() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      spy();
    });
  }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", function () { place(current, false); queue(); });
  dial.dataset.stop = "0";
  current = 0;
  place(0, false);
  window.addEventListener("load", function () { place(current, false); });
  spy();
})();
