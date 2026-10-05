(function () {
  var links = [];
  var nodes = document.querySelectorAll(".opt a");
  var i;
  for (i = 0; i < nodes.length; i++) links.push(nodes[i]);
  var guide = document.getElementById("guide");
  var hubName = document.getElementById("hubName");
  var hubMeta = document.getElementById("hubMeta");
  var entries = document.querySelectorAll(".entry");
  var meta = [
    "Vector · 100 %",
    "Grade 4B · pressure",
    "Bristles · 34",
    "Soft · mask only",
    "Tolerance · 32",
    "Guide · 45°"
  ];
  var names = [];
  for (i = 0; i < links.length; i++) {
    names.push(links[i].querySelector(".opt__t").textContent);
  }
  var active = -1;

  function show(index) {
    if (index < 0 || index >= links.length) return;
    guide.style.transform = "rotate(" + index * 60 + "deg)";
    hubName.textContent = names[index];
    hubMeta.textContent = meta[index];
  }

  function setRoving(index) {
    for (var k = 0; k < links.length; k++) {
      links[k].setAttribute("tabindex", k === index ? "0" : "-1");
    }
  }

  function setActive(index) {
    if (index === active) return;
    active = index;
    for (var k = 0; k < links.length; k++) {
      if (k === index) links[k].setAttribute("aria-current", "true");
      else links[k].removeAttribute("aria-current");
    }
    var id = links[index].getAttribute("href").slice(1);
    for (const entry of entries) {
      entry.classList.toggle("is-here", entry.id === id);
    }
  }

  for (i = 0; i < links.length; i++) {
    (function (index) {
      links[index].addEventListener("focus", function () {
        setRoving(index);
        show(index);
      });
      links[index].addEventListener("mouseenter", function () { show(index); });
      links[index].addEventListener("click", function () {
        setActive(index);
        setRoving(index);
      });
      links[index].addEventListener("keydown", function (e) {
        var next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % links.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + links.length) % links.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = links.length - 1;
        else if (e.key === "Escape") { e.preventDefault(); links[0].focus(); show(0); return; }
        if (next >= 0) {
          e.preventDefault();
          setRoving(next);
          links[next].focus();
          show(next);
        }
      });
    })(i);
  }

  function spy() {
    var mark = window.innerHeight * 0.4;
    var found = -1;
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].getBoundingClientRect().top <= mark) found = k;
    }
    for (var n = 0; n < entries.length; n++) {
      entries[n].classList.toggle("is-here", n === found);
    }
    if (found >= 0) {
      var id = entries[found].id;
      for (var m = 0; m < links.length; m++) {
        if (links[m].getAttribute("href").slice(1) === id) {
          if (m !== active) {
            active = m;
            for (var q = 0; q < links.length; q++) {
              if (q === m) links[q].setAttribute("aria-current", "true");
              else links[q].removeAttribute("aria-current");
            }
            if (document.activeElement && document.activeElement.closest(".ring")) return;
            show(m);
          }
        }
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
  window.addEventListener("resize", queue);
  setRoving(0);
  show(0);
  spy();
})();
