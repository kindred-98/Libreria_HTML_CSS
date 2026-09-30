(function () {
  var opts = [];
  var panes = [];
  var buttons = document.querySelectorAll(".seg__opt");
  var i;
  for (i = 0; i < buttons.length; i++) {
    opts.push(buttons[i]);
    panes.push(document.getElementById(buttons[i].getAttribute("aria-controls")));
  }
  var seg = document.querySelector(".seg");
  var thumb = document.querySelector(".seg__thumb");
  var current = 0;

  function place(index, animate) {
    var opt = opts[index];
    if (!opt) return;
    var pad = 6;
    if (!animate) thumb.style.transition = "none";
    thumb.style.width = (opt.offsetWidth - 6) + "px";
    thumb.style.height = (opt.offsetHeight - 6) + "px";
    thumb.style.transform = "translate(" + (opt.offsetLeft - pad + 3) + "px," + (opt.offsetTop - pad + 3) + "px)";
    if (!animate) {
      void thumb.offsetWidth;
      thumb.style.transition = "";
    }
  }

  function select(index, focus) {
    if (index < 0) index = opts.length - 1;
    if (index > opts.length - 1) index = 0;
    current = index;
    for (var k = 0; k < opts.length; k++) {
      var on = k === index;
      opts[k].setAttribute("aria-checked", on ? "true" : "false");
      opts[k].setAttribute("tabindex", on ? "0" : "-1");
      if (panes[k]) panes[k].classList.toggle("is-on", on);
    }
    place(index, true);
    if (focus) opts[index].focus();
  }

  for (i = 0; i < opts.length; i++) {
    (function (index) {
      opts[index].addEventListener("click", function () { select(index, false); });
      opts[index].addEventListener("keydown", function (e) {
        var next = -1;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = current + 1;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = current - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = opts.length - 1;
        if (next >= 0) {
          e.preventDefault();
          select(next, true);
        }
      });
    })(i);
  }

  var switches = document.querySelectorAll(".sw");
  for (i = 0; i < switches.length; i++) {
    switches[i].addEventListener("click", function () {
      var on = this.getAttribute("aria-checked") === "true";
      this.setAttribute("aria-checked", on ? "false" : "true");
    });
  }

  window.addEventListener("resize", function () { place(current, false); });
  place(0, false);
  window.addEventListener("load", function () { place(current, false); });
  if (seg) seg.addEventListener("click", function () { place(current, true); });
})();
