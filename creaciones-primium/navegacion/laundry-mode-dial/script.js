(function () {
  var dial = document.getElementById("dial");
  if (!dial) return;

  var radios = Array.prototype.slice.call(dial.querySelectorAll(".mode"));
  var paneHost = document.querySelector(".panes");
  var panes = Array.prototype.slice.call(paneHost.querySelectorAll(".pane"));
  var nameEl = document.getElementById("modeName");
  var metaEl = document.getElementById("modeMeta");
  var stateEl = document.getElementById("stateText");
  var footEl = document.querySelector(".foot span:last-child");
  var STEP = 360 / radios.length;
  var current = 0;
  var rot = 0;

  function paneFor(i) {
    return document.getElementById(radios[i].getAttribute("aria-controls"));
  }

  function metaFor(i) {
    var dd = panes[i].querySelectorAll(".spec dd");
    if (dd.length < 2) return "";
    return dd[0].textContent.trim() + " · " + dd[1].textContent.trim();
  }

  function select(i, moveFocus) {
    i = (i + radios.length) % radios.length;
    if (i !== current) {
      var delta = (i - current) * -STEP;
      delta = ((delta % 360) + 540) % 360 - 180;
      rot += delta;
      dial.style.setProperty("--rot", rot + "deg");
    }
    current = i;

    radios.forEach(function (btn, k) {
      var on = k === i;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
      btn.tabIndex = on ? 0 : -1;
    });

    panes.forEach(function (pane, k) {
      pane.classList.toggle("is-on", k === i);
    });

    var label = radios[i].querySelector("b").textContent.trim();
    var no = radios[i].querySelector(".mode__no").textContent.trim();
    nameEl.textContent = label;
    metaEl.textContent = metaFor(i);
    stateEl.textContent = "Programme " + no + " armed";
    if (footEl) {
      footEl.textContent = "Programme " + Number.parseInt(no, 10) + " of " +
        radios.length + " · Wheel parked on " + label;
    }

    if (moveFocus) radios[i].focus();
  }

  radios.forEach(function (btn, i) {
    btn.addEventListener("click", function () {
      select(i, false);
    });

    btn.addEventListener("keydown", function (ev) {
      var k = ev.key;
      if (k === "ArrowRight" || k === "ArrowDown") {
        ev.preventDefault();
        select(i + 1, true);
      } else if (k === "ArrowLeft" || k === "ArrowUp") {
        ev.preventDefault();
        select(i - 1, true);
      } else if (k === "Home") {
        ev.preventDefault();
        select(0, true);
      } else if (k === "End") {
        ev.preventDefault();
        select(radios.length - 1, true);
      } else if (k === "Enter") {
        ev.preventDefault();
        select(i, false);
        var pane = paneFor(i);
        if (pane) pane.focus();
      } else if (k === "Escape") {
        ev.preventDefault();
        select(current, true);
      }
    });
  });

  panes.forEach(function (pane) {
    pane.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" || ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
        ev.preventDefault();
        radios[current].focus();
      }
    });
  });

  select(0, false);
})();
