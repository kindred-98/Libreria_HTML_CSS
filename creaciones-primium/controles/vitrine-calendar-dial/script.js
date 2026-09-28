(function () {
  "use strict";

  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  var DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var YEAR = 1897;
  var DAY_STEP = 360 / 31;
  var MONTH_STEP = 30;
  var CAP_W = 22;

  var monthInput = document.getElementById("month");
  var dayInput = document.getElementById("day");
  var ringMonth = document.getElementById("ringMonth");
  var ringDay = document.getElementById("ringDay");
  var capMonth = document.getElementById("capMonth");
  var capDay = document.getElementById("capDay");
  var outMonth = document.getElementById("outMonth");
  var outDay = document.getElementById("outDay");
  var win = document.getElementById("window");
  var winText = document.getElementById("winText");
  var winFlip = document.getElementById("winFlip");
  var plaque = document.querySelector(".plaque");
  var plaqueDate = document.getElementById("plaqueDate");
  var notice = document.getElementById("notice");
  var trim = document.getElementById("trim");
  var rollL = document.querySelector(".window__roll--l i");
  var rollR = document.querySelector(".window__roll--r i");

  if (!monthInput || !dayInput || !ringMonth || !ringDay) {
    return;
  }

  var still = false;
  try {
    still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (err) {
    void err;
  }

  var spin = 0;
  var reachMonth = 150;
  var reachDay = 150;
  var turnTimer = 0;
  var lastWindow = "";
  var lastMonth = Number(monthInput.value);
  var lastDay = Number(dayInput.value);

  function measure() {
    var boxM = capMonth ? capMonth.parentNode : null;
    var boxD = capDay ? capDay.parentNode : null;
    if (boxM && boxM.clientWidth > 0) {
      reachMonth = Math.max(0, boxM.clientWidth - CAP_W);
    }
    if (boxD && boxD.clientWidth > 0) {
      reachDay = Math.max(0, boxD.clientWidth - CAP_W);
    }
    paint(Number(monthInput.value), Number(dayInput.value));
  }

  function spinRollers(month, day) {
    var delta = (month - lastMonth) * MONTH_STEP + (day - lastDay) * DAY_STEP;
    if (delta === 0) {
      return;
    }
    spin += delta;
    if (rollL) {
      rollL.style.transform = "rotate(" + spin.toFixed(2) + "deg)";
    }
    if (rollR) {
      rollR.style.transform = "rotate(" + (spin * 0.82).toFixed(2) + "deg)";
    }
  }

  function turn(text) {
    if (!winFlip) {
      return;
    }
    if (!still && win) {
      win.classList.remove("is-turning");
      void win.offsetWidth;
    }
    winFlip.textContent = text;
    if (win) {
      win.classList.add("is-turning");
    }
    window.clearTimeout(turnTimer);
    turnTimer = window.setTimeout(function () {
      if (win) {
        win.classList.remove("is-turning");
      }
      if (winText) {
        winText.textContent = text;
      }
    }, still ? 0 : 290);
  }

  function strike() {
    if (still || !plaque) {
      return;
    }
    plaque.classList.remove("is-stamping");
    void plaque.offsetWidth;
    plaque.classList.add("is-stamping");
  }

  function paint(month, day) {
    var length = DAYS[month - 1];
    var bad = day > length;
    var text = day + " " + MONTHS[month - 1] + " " + YEAR;
    var upper = day + " " + SHORT[month - 1] + " " + YEAR;

    ringMonth.style.setProperty("--a", (MONTH_STEP * (month - 1)).toFixed(2));
    ringDay.style.setProperty("--a", (DAY_STEP * (day - 1)).toFixed(2));

    if (capMonth) {
      capMonth.style.setProperty("--p", (reachMonth * ((month - 1) / 11)).toFixed(1) + "px");
    }
    if (capDay) {
      capDay.style.setProperty("--p", (reachDay * ((day - 1) / 30)).toFixed(1) + "px");
    }
    if (outMonth) {
      outMonth.textContent = ROMAN[month - 1];
    }
    if (outDay) {
      outDay.textContent = String(day);
    }

    if (win) {
      win.classList.toggle("is-void", bad);
    }
    if (winText) {
      winText.textContent = bad ? upper : upper;
    }
    if (plaqueDate) {
      plaqueDate.textContent = text;
    }
    if (plaque) {
      plaque.classList.toggle("is-void", bad);
    }

    spinRollers(month, day);

    var key = bad ? "void" : upper;
    if (key !== lastWindow) {
      lastWindow = key;
      turn(bad ? "no such day" : upper);
      strike();
    }

    if (notice) {
      if (bad) {
        notice.textContent = MONTHS[month - 1] + " has " + length + " days, so day " + day +
          " does not exist on this dial. The window stays void and the plate records the reading as impossible.";
        notice.hidden = false;
      } else {
        notice.textContent = "";
        notice.hidden = true;
      }
    }

    if (trim) {
      trim.hidden = !bad;
      var label = trim.querySelector("span");
      if (label) {
        label.textContent = "Seat on day " + length;
      }
    }

    monthInput.setAttribute("aria-valuetext", MONTHS[month - 1] + ", " + length + " days");

    if (bad) {
      dayInput.setAttribute("aria-invalid", "true");
      dayInput.setAttribute("aria-valuetext", day + ", which does not exist in " + MONTHS[month - 1] + " " + YEAR);
    } else {
      dayInput.removeAttribute("aria-invalid");
      dayInput.setAttribute("aria-valuetext", day + " " + MONTHS[month - 1] + " " + YEAR);
    }

    lastMonth = month;
    lastDay = day;
  }

  monthInput.addEventListener("input", function () {
    paint(Number(monthInput.value), Number(dayInput.value));
  });

  dayInput.addEventListener("input", function () {
    paint(Number(monthInput.value), Number(dayInput.value));
  });

  if (trim) {
    trim.addEventListener("click", function () {
      var month = Number(monthInput.value);
      dayInput.value = String(DAYS[month - 1]);
      paint(month, Number(dayInput.value));
    });
  }

  window.addEventListener("resize", measure);

  measure();
})();
