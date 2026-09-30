const stops = [
  { name: "Quay Gate", line: "L1", cls: "l1", zone: "Zone B", code: "QG", next: "1 min", every: "6 min", plat: "2", note: "Fishermen's quarter, cobbles and the morning flower market." },
  { name: "Foundry Row", line: "L1", cls: "l1", zone: "Zone A", code: "FR", next: "3 min", every: "5 min", plat: "1", note: "Brick frontages from the old iron works, now studios and a roastery." },
  { name: "Central Exchange", line: "L1 + L2", cls: "mix", zone: "Zone A", code: "CE", next: "1 min", every: "3 min", plat: "4", note: "Three levels, lifts to every platform and a taxi rank underneath." },
  { name: "Ironworks", line: "L1", cls: "l1", zone: "Zone A", code: "IR", next: "2 min", every: "4 min", plat: "3", note: "Platform split across the old furnace hall, mind the level change." },
  { name: "Northgate", line: "L1", cls: "l1", zone: "Zone B", code: "NG", next: "6 min", every: "9 min", plat: "1", note: "Last stop before the depot, night bus N4 links the airport." },
  { name: "Southbank", line: "L2", cls: "l2", zone: "Zone B", code: "SB", next: "4 min", every: "7 min", plat: "2", note: "Glass walkway over the ferry pontoon, closes with the last sailing." },
  { name: "Ferry Point", line: "L2", cls: "l2", zone: "Zone C", code: "FP", next: "8 min", every: "12 min", plat: "1", note: "Timber jetty and bike racks, the tide comes in faster than the trains." },
  { name: "Estuary", line: "L2", cls: "l2", zone: "Zone C", code: "ES", next: "11 min", every: "15 min", plat: "2", note: "Terminus by the tidal basin, sheltered platform and a kiosk till midnight." },
  { name: "Westfield", line: "L3", cls: "l3", zone: "Zone C", code: "WF", next: "7 min", every: "10 min", plat: "1", note: "Open-air platform, closed on match days at the stadium." },
  { name: "Orchard Park", line: "L3", cls: "l3", zone: "Zone B", code: "OP", next: "8 min", every: "12 min", plat: "2", note: "Cherry trees line the eastbound platform since 1961." },
  { name: "Kiln Street", line: "L3", cls: "l3", zone: "Zone B", code: "KS", next: "6 min", every: "9 min", plat: "1", note: "Named for the brick kilns, still the best place for a quick flat white." },
  { name: "Cathedral", line: "L2 + L3", cls: "mix", zone: "Zone A", code: "CT", next: "3 min", every: "5 min", plat: "6", note: "Vaulted stone hall from 1897, market stalls on the lower concourse." },
  { name: "Bellrose", line: "L3", cls: "l3", zone: "Zone B", code: "BR", next: "9 min", every: "13 min", plat: "1", note: "Quiet stretch above the viaduct with the best view of the harbour cranes." },
  { name: "Highland", line: "L3", cls: "l3", zone: "Zone C", code: "HL", next: "12 min", every: "16 min", plat: "2", note: "Highest point on the network, 84 m above the river and very windy." }
];

const plot = document.getElementById("plot");
const sheet = document.getElementById("sheet");
const pins = Array.prototype.slice.call(document.querySelectorAll(".pin"));
const legend = Array.prototype.slice.call(document.querySelectorAll(".legend__btn"));
const fields = {
  line: document.getElementById("sheetLine"),
  zone: document.getElementById("sheetZone"),
  code: document.getElementById("sheetCode"),
  name: document.getElementById("sheetName"),
  note: document.getElementById("sheetNote"),
  next: document.getElementById("sheetNext"),
  every: document.getElementById("sheetEvery"),
  plat: document.getElementById("sheetPlat")
};

let current = -1;

function activate(index) {
  const stop = stops[index];
  if (!stop || index === current) {
    return;
  }
  current = index;
  fields.line.textContent = stop.line;
  fields.line.className = "tsheet__badge tsheet__badge--" + stop.cls;
  fields.zone.textContent = stop.zone;
  fields.code.textContent = stop.code;
  fields.name.textContent = stop.name;
  fields.note.textContent = stop.note;
  fields.next.textContent = stop.next;
  fields.every.textContent = stop.every;
  fields.plat.textContent = stop.plat;
  pins.forEach(function (pin, k) {
    pin.setAttribute("aria-pressed", String(k === index));
  });
  sheet.classList.remove("tsheet--swap");
  void sheet.offsetWidth;
  sheet.classList.add("tsheet--swap");
}

pins.forEach(function (pin, index) {
  pin.addEventListener("click", function () {
    activate(index);
  });
  pin.addEventListener("focus", function () {
    activate(index);
  });
  pin.addEventListener("pointerenter", function () {
    activate(index);
  });
});

legend.forEach(function (button) {
  button.addEventListener("click", function () {
    const line = button.dataset.line;
    const on = button.getAttribute("aria-pressed") === "true";
    if (on) {
      plot.dataset.solo = "all";
    } else {
      plot.dataset.solo = line;
    }
    legend.forEach(function (other) {
      other.setAttribute("aria-pressed", String(!on && other.dataset.line === line));
    });
  });
});
