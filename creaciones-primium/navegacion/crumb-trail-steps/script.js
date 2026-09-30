(function () {
  var crumb = document.getElementById("crumb");
  var list = document.getElementById("crumbList");
  var steps = [].slice.call(list.querySelectorAll("li"));
  var links = steps.map(function (li) { return li.querySelector("a"); });
  var sheets = [].slice.call(document.querySelectorAll(".sheet"));
  var stamp = document.getElementById("stamp");
  var stepNo = document.getElementById("stepNo");
  var stepName = document.getElementById("stepName");
  var sections = [].slice.call(document.querySelectorAll("main .sec[id]"));
  var current = -1;
  var ticking = false;

  function apply(level) {
    if (level === current || level < 0) return;
    current = level;
    for (var i = 0; i < steps.length; i++) {
      steps[i].classList.toggle("done", i <= level);
      steps[i].classList.toggle("here", i === level);
      if (i <= level) {
        if (i === level) links[i].setAttribute("aria-current", "page");
        else links[i].removeAttribute("aria-current");
      } else {
        links[i].removeAttribute("aria-current");
      }
    }
    for (var s = 0; s < sheets.length; s++) {
      sheets[s].classList.toggle("is-on", Number(sheets[s].getAttribute("data-sheet")) === level);
    }
    stamp.textContent = "Level " + String(level + 1).padStart(2, "0");
    stepNo.textContent = String(level + 1).padStart(2, "0");
    stepName.textContent = links[level].textContent.trim();
  }

  function spy() {
    var mark = window.scrollY + window.innerHeight * 0.3;
    var found = -1;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= mark) found = i;
    }
    if (found < 0) found = 0;
    apply(found);
  }

  for (var i = 0; i < links.length; i++) {
    (function (link, idx) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
        var target = document.querySelector(href);
        apply(idx);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          if (history.replaceState) history.replaceState(null, "", href);
        }
      });
    })(links[i], i);
  }

  crumb.addEventListener("keydown", function (e) {
    var idx = links.indexOf(document.activeElement);
    if (idx < 0) return;
    var next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % links.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + links.length) % links.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = links.length - 1;
    if (next >= 0) {
      e.preventDefault();
      links[next].focus();
      apply(next);
    }
  });

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; spy(); });
  }, { passive: true });

  apply(0);
  spy();
})();
