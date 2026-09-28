(function () {
  var OBJ = [
    { name: "Congresso Nacional, Brasilia", use: "Government", place: "Brasilia, Brazil", crop: "3 : 2, left third", note: "Two slabs and two shallow bowls lifted clear of the ground on white columns, with the whole thing doubled in the pool underneath. It is the only building in the drawer that is also a reflection, and that is why it is filed first.", credit: "Mario Roberto Duran Ortiz, Public domain" },
    { name: "Folded concrete interior", use: "Gallery", place: "Unattributed", crop: "2 : 3, full frame", note: "Inside, where the skin stops mattering. Four planes of board-marked concrete fold against each other and the only daylight is a single strip at the top, which is enough to draw every edge in the room.", credit: "Mihail Ribkin, CC0" },
    { name: "Brick and glass corner", use: "Office", place: "Belgrade, Serbia", crop: "3 : 4, upper third", note: "One corner of a clad building, shot from directly below so the roofline becomes a diagonal. Red brick under glass, blue sky above, and nothing else in the frame to give the height a number.", credit: "Jovan Markovic, CC BY 2.0" },
    { name: "Coloured blocks, long facade", use: "Housing", place: "Modernist estate", crop: "3 : 2, centre", note: "A whole street elevation treated as a colour key: white, cream, orange, red and charcoal repeating across nine storeys. Under a flat sky the building has no shadows at all, only pattern.", credit: "AlixSaz, CC BY-SA 4.0" },
    { name: "Window grid, detail", use: "Housing", place: "Modernist estate", crop: "3 : 2, centre right", note: "The same building at arm's length. The frames alternate black, white and red-orange, and at this scale the elevation stops being architecture and becomes a printed page.", credit: "AlixSaz, CC BY-SA 4.0" },
    { name: "Toronto towers, looking up", use: "Commercial", place: "Toronto, Canada", crop: "2 : 3, lower half", note: "Shot from the plaza between two towers, which makes every vertical line lean inward and the cloud above look like a ceiling being pushed up. The white slab at the right is the only matte surface in the cluster.", credit: "ThomasLendt, CC BY-SA 4.0" },
    { name: "Toronto cluster, blue slab", use: "Commercial", place: "Toronto, Canada", crop: "3 : 2, centre", note: "The same city from a step back, so the towers can be counted. Eight of them, and one blue glass slab on the right that belongs to a different decade and a different architect.", credit: "ThomasLendt, CC BY-SA 4.0" },
    { name: "White house through a grille", use: "House", place: "Lamu, Kenya", crop: "3 : 2, centre", note: "A white courtyard house with palms, seen through a dark twisted metal grille that fills the foreground. The fence is the subject; the house is what you get when you look past it.", credit: "Buthena2022, CC BY-SA 4.0" },
    { name: "Leaning rib, from below", use: "Tower", place: "Den Haag, Netherlands", crop: "2 : 3, full frame", note: "Last in the drawer, and the only one that looks as if it might fall. A ribbed white slab photographed from its base against deep blue, with the horizon nowhere in sight.", credit: "acediscovery, CC BY 4.0" }
  ];

  var cse = document.getElementById("case");
  var slot = Array.prototype.slice.call(cse.querySelectorAll(".slot"));
  var band = document.getElementById("band");
  var lamp = document.getElementById("lamp");
  var lampOut = document.getElementById("lampOut");
  var viewer = document.getElementById("viewer");
  var vImg = document.getElementById("vImg");
  var at = 0;
  var lastFocus = null;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function travel() {
    var list = slot[at].getBoundingClientRect();
    var y = list.top + list.height / 2 - 90;
    band.style.transform = "translate3d(0," + Math.max(0, y).toFixed(1) + "px,0)";
  }

  function paint() {
    lamp.value = String(at);
    lampOut.textContent = pad(at + 1);
    for (var k = 0; k < slot.length; k++) {
      slot[k].classList.toggle("is-on", k === at);
      slot[k].classList.toggle("is-lit", Math.abs(k - at) <= 1);
      slot[k].setAttribute("aria-current", k === at ? "true" : "false");
    }
    document.getElementById("lit").textContent = "Lamp on drawer " + pad(at + 1);
    travel();

    var d = OBJ[at];
    document.getElementById("sNo").innerHTML = pad(at + 1) + " <i>/ 09</i>";
    document.getElementById("sName").textContent = d.name;
    document.getElementById("sNote").textContent = d.note;
    document.getElementById("sUse").textContent = d.use;
    document.getElementById("sPlace").textContent = d.place;
    document.getElementById("sCrop").textContent = d.crop;
    document.getElementById("sPos").textContent = "Drawer " + (at + 1) + " of " + slot.length;
    document.getElementById("sCredit").textContent = d.credit;
  }

  function go(n) { at = Math.max(0, Math.min(slot.length - 1, n)); paint(); }

  function fillPlate(n) {
    var d = OBJ[n];
    var img = slot[n].querySelector("img");
    vImg.setAttribute("src", img.getAttribute("src"));
    vImg.setAttribute("alt", img.getAttribute("alt"));
    document.getElementById("vNo").textContent = "DRAWER " + pad(n + 1) + " \u00b7 " + (n + 1) + " OF " + slot.length;
    document.getElementById("vName").textContent = d.name;
    document.getElementById("vNote").textContent = d.note;
    document.getElementById("vCredit").textContent = d.credit;
    document.getElementById("vCount").textContent = pad(n + 1) + " / " + pad(slot.length);
  }

  function openAt(n) {
    lastFocus = document.activeElement;
    go(n);
    fillPlate(n);
    viewer.hidden = false;
    document.getElementById("vClose").focus();
  }

  function close() {
    viewer.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  slot.forEach(function (b, i) { b.addEventListener("click", function () { openAt(i); }); });
  lamp.addEventListener("input", function () { go(Number(lamp.value)); });
  document.getElementById("up").addEventListener("click", function () { go(at - 1); });
  document.getElementById("down").addEventListener("click", function () { go(at + 1); });
  document.getElementById("open").addEventListener("click", function () { openAt(at); });
  document.getElementById("vPrev").addEventListener("click", function () { openAt((at - 1 + slot.length) % slot.length); });
  document.getElementById("vNext").addEventListener("click", function () { openAt((at + 1) % slot.length); });
  document.getElementById("vClose").addEventListener("click", close);
  viewer.addEventListener("click", function (e) { if (e.target.hasAttribute("data-close")) close(); });

  window.addEventListener("resize", travel);

  cse.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowDown" || k === "ArrowRight") go(at + 1);
    else if (k === "ArrowUp" || k === "ArrowLeft") go(at - 1);
    else if (k === "PageDown") go(at + 3);
    else if (k === "PageUp") go(at - 3);
    else if (k === "Home") go(0);
    else if (k === "End") go(slot.length - 1);
    else if (k === "Enter" || k === " ") { if (e.target !== cse) return; openAt(at); }
    else return;
    e.preventDefault();
  });

  document.addEventListener("keydown", function (e) {
    if (viewer.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") openAt((at - 1 + slot.length) % slot.length);
    else if (e.key === "ArrowDown" || e.key === "ArrowRight") openAt((at + 1) % slot.length);
    else if (e.key === "Home") openAt(0);
    else if (e.key === "End") openAt(slot.length - 1);
    else return;
    e.preventDefault();
  });

  paint();
})();
