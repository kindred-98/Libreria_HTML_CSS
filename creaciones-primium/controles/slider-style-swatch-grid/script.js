(function () {
  "use strict";

  var FIN = {
    chrome: { name: "Bright Chrome", code: "CR-01", gloss: 92, ra: "0.05", lot: "4c-118", proc: "plate + polish", hard: "2H", cost: "12.40" },
    brass: { name: "Satin Brass", code: "BR-02", gloss: 74, ra: "0.35", lot: "4b-207", proc: "brushed + lacquer", hard: "H", cost: "15.75" },
    matte: { name: "Powder Matte", code: "MT-03", gloss: 12, ra: "1.20", lot: "4m-063", proc: "bead blast + epoxy", hard: "HB", cost: "9.90" },
    neon: { name: "Anodised Neon", code: "NE-04", gloss: 88, ra: "0.20", lot: "4n-341", proc: "anodise class 25", hard: "2B", cost: "18.20" }
  };

  var hero = document.getElementById("hero");
  var master = document.getElementById("master");
  var heroCap = document.getElementById("heroCap");
  var heroName = document.getElementById("heroName");
  var spGloss = document.getElementById("spGloss");
  var spRa = document.getElementById("spRa");
  var spLot = document.getElementById("spLot");
  var spProc = document.getElementById("spProc");
  var spHard = document.getElementById("spHard");
  var spCost = document.getElementById("spCost");
  var glossBar = document.getElementById("glossBar");
  var travelV = document.getElementById("travelV");
  var travelP = document.getElementById("travelP");
  var status = document.getElementById("status");

  if (!hero || !master) {
    return;
  }

  var sweepTimer = 0;
  var capW = 46;
  var reach = 0;

  var minis = [];
  var minReach = 0;

  var all = document.querySelectorAll(".mini__input");
  var miniCapW = 20;
  for (var node of all) {
    minis.push({ input: node, cap: document.getElementById("cap-" + node.id.replace("min-", "")) });
  }

  function sweep() {
    hero.classList.remove("is-sweeping");
    hero.getBoundingClientRect();
    hero.classList.add("is-sweeping");
    window.clearTimeout(sweepTimer);
    sweepTimer = window.setTimeout(function () {
      hero.classList.remove("is-sweeping");
    }, 900);
  }

  function setFinish(key, announce) {
    var data = FIN[key];
    if (!data || !hero) {
      return;
    }

    hero.dataset.finish = key;
    if (heroName) {
      heroName.textContent = data.name;
    }

    var layers = hero.querySelectorAll(".fin");
    for (var layer of layers) {
      var on = layer.className.includes("fin--" + key);
      layer.classList.toggle("is-on", on);
    }

    if (spGloss) spGloss.textContent = String(data.gloss);
    if (spRa) spRa.textContent = data.ra;
    if (spLot) spLot.textContent = data.lot;
    if (spProc) spProc.textContent = data.proc;
    if (spHard) spHard.textContent = data.hard;
    if (spCost) spCost.textContent = data.cost;
    if (glossBar) glossBar.style.setProperty("--g", (data.gloss / 100).toFixed(3));

    if (announce && status) {
      status.textContent = "Finish " + data.name + ", code " + data.code + ", " +
        data.gloss + " gloss units, roughness " + data.ra + " micrometres.";
    }

    sweep();
  }

  function paintMaster() {
    var value = Number(master.value);
    var ratio = value / 100;
    var mm = (value / 100) * 10;

    hero.style.setProperty("--p", (reach * ratio).toFixed(1) + "px");
    if (heroCap) {
      heroCap.style.setProperty("--p", (reach * ratio).toFixed(1) + "px");
    }

    if (travelV) {
      if (travelV.firstChild && travelV.firstChild.nodeType === 3) {
        travelV.firstChild.nodeValue = mm.toFixed(1);
      } else {
        travelV.textContent = mm.toFixed(1);
      }
    }
    if (travelP) {
      travelP.textContent = value + " %";
    }

    master.setAttribute("aria-valuetext", value + " percent, " + mm.toFixed(1) + " millimetres of travel");
  }

  function paintMini(entry) {
    var value = Number(entry.input.value);
    var ratio = value / 100;
    if (entry.cap) {
      entry.cap.style.setProperty("--p", (minReach * ratio).toFixed(1) + "px");
    }
    entry.input.setAttribute("aria-valuetext", value + " percent, " + ((value / 100) * 10).toFixed(1) + " millimetres");
  }

  function measure() {
    var plate = document.querySelector(".hero__plate");
    if (plate) {
      var padL = Number.parseFloat(window.getComputedStyle(plate).paddingLeft) || 18;
      var padR = Number.parseFloat(window.getComputedStyle(plate).paddingRight) || 18;
      reach = Math.max(0, plate.clientWidth - padL - padR - capW);
    } else {
      reach = 300;
    }
    minReach = 40;
    paintMaster();
    for (var mini of minis) {
      var box = mini.input.parentNode;
      if (box && box.clientWidth > 0) {
        minReach = Math.max(0, box.clientWidth - miniCapW);
      }
      paintMini(mini);
    }
  }

  var radios = document.querySelectorAll(".cell__radio");
  for (var radio of radios) {
    (function (radio) {
      radio.addEventListener("change", function () {
        if (radio.checked) {
          setFinish(radio.value, true);
        }
      });
    })(radio);
  }

  for (var entry of minis) {
    (function (entry) {
      entry.input.addEventListener("input", function () {
        paintMini(entry);
      });
    })(entry);
  }

  master.addEventListener("input", paintMaster);
  window.addEventListener("resize", measure);

  var start = document.querySelector(".cell__radio[checked]");
  measure();
  setFinish(start ? start.value : "chrome", false);
})();
