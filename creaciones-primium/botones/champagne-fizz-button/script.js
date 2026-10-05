(function () {
  var btn = document.getElementById("pop");
  if (!btn) return;

  var host = btn.querySelector(".bubbles");
  var label = btn.querySelector(".btn__label");
  var refl = document.querySelector(".refl__txt");
  var flash = document.querySelector(".case__glow");
  var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (refl && label) refl.textContent = label.textContent;

  var lanes = [5, 11, 17, 23, 29, 35, 41, 47, 53, 59, 65, 71, 77, 83, 89, 95, 8, 20, 32, 44, 56, 68, 80, 92];
  var i;

  function lane(bx, dur, delay, size, cls) {
    var t = document.createElement("b");
    t.className = "track" + (cls ? " " + cls : "");
    t.style.setProperty("--bx", bx + "%");
    t.style.setProperty("--rd", dur.toFixed(2) + "s");
    t.style.setProperty("--dd", delay.toFixed(2) + "s");
    t.style.setProperty("--bs", size.toFixed(1) + "px");
    host.appendChild(t);
    return t;
  }

  for (i = 0; i < lanes.length; i++) {
    lane(lanes[i], 2.1 + (i % 6) * 0.44, -(i * 0.263) - (i % 4) * 0.11, 2.4 + (i % 5) * 0.8, i % 5 === 3 ? "track--dust" : "");
  }

  var extra = [];

  function erupt() {
    var k;
    btn.classList.add("is-erupt");
    if (flash) flash.style.filter = "brightness(2.6)";
    for (k = 0; k < 14; k++) {
      var t = lane(
        (5 + Math.random() * 90).toFixed(1),
        (0.66 + Math.random() * 0.46).toFixed(2),
        (-Math.random() * 0.45).toFixed(2),
        (3.2 + Math.random() * 3.4).toFixed(1),
        "track--burst"
      );
      t.style.zIndex = "5";
      extra.push(t);
    }
    window.setTimeout(function () {
      btn.classList.remove("is-erupt");
      if (flash) flash.style.filter = "";
    }, 700);
    window.setTimeout(function () {
      for (var node of extra) if (node.parentNode) node.node.remove();
      extra.length = 0;
    }, 1500);
  }

  btn.addEventListener("click", erupt);
  btn.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") erupt();
  });

  if (REDUCE) {
    for (i = 0; i < host.children.length; i++) {
      host.children[i].style.animationPlayState = "paused";
    }
  }
})();
