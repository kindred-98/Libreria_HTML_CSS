(function () {
  var tabs = [];
  var buttons = document.querySelectorAll(".tab");
  var panels = [];
  var i;
  for (i = 0; i < buttons.length; i++) {
    tabs.push(buttons[i]);
    panels.push(document.getElementById(buttons[i].getAttribute("aria-controls")));
  }
  var ink = document.querySelector(".tabs__ink");
  var bar = document.querySelector(".tabs");
  var lab = document.getElementById("lab");
  var readout = document.getElementById("scopeBench");
  var current = 0;

  function place(index, animate) {
    var tab = tabs[index];
    if (!tab) return;
    if (!animate) ink.style.transition = "none";
    ink.style.width = tab.offsetWidth + "px";
    ink.style.height = tab.offsetHeight + "px";
    ink.style.transform = "translate(" + tab.offsetLeft + "px," + tab.offsetTop + "px)";
    if (!animate) {
      void ink.offsetWidth;
      ink.style.transition = "";
    }
  }

  function select(index, focus) {
    if (index < 0) index = tabs.length - 1;
    if (index > tabs.length - 1) index = 0;
    current = index;
    for (var k = 0; k < tabs.length; k++) {
      var on = k === index;
      tabs[k].setAttribute("aria-selected", on ? "true" : "false");
      tabs[k].setAttribute("tabindex", on ? "0" : "-1");
      if (panels[k]) panels[k].classList.toggle("is-on", on);
    }
    lab.setAttribute("data-bench", String(index + 1));
    readout.textContent = index + 1 < 10 ? "0" + (index + 1) : String(index + 1);
    place(index, true);
    if (focus) tabs[index].focus();
  }

  for (i = 0; i < tabs.length; i++) {
    (function (index) {
      tabs[index].addEventListener("click", function () { select(index, false); });
      tabs[index].addEventListener("keydown", function (e) {
        var next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = current + 1;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = current - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(index, true); return; }
        if (next >= 0) {
          e.preventDefault();
          select(next, true);
        }
      });
    })(i);
  }

  window.addEventListener("resize", function () { place(current, false); });
  place(0, false);
  window.addEventListener("load", function () { place(current, false); });
})();
