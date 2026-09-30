const stops = [
  {
    num: "STOP 01",
    region: "Capital region",
    name: "Reykjavík",
    note: "Fuel, rye bread and a weather check before the south coast opens up.",
    leg: "0 km",
    stay: "1 night",
    road: "Paved"
  },
  {
    num: "STOP 02",
    region: "South coast",
    name: "Vík",
    note: "Black sand at Reynisfjara with basalt columns standing in the surf.",
    leg: "187 km",
    stay: "1 night",
    road: "Paved"
  },
  {
    num: "STOP 03",
    region: "Southeast",
    name: "Jökulsárlón",
    note: "Icebergs drift out to sea while the glacier calves behind the lagoon.",
    leg: "312 km",
    stay: "2 nights",
    road: "Paved"
  },
  {
    num: "STOP 04",
    region: "East fjords",
    name: "Höfn",
    note: "Harbour town, langoustine soup and a low sun that never quite sets.",
    leg: "84 km",
    stay: "1 night",
    road: "Winding"
  },
  {
    num: "STOP 05",
    region: "North",
    name: "Akureyri",
    note: "Elm lined main street, a botanical garden and the heath road south.",
    leg: "486 km",
    stay: "2 nights",
    road: "Pass open"
  }
];

const buttons = Array.from(document.querySelectorAll(".stop"));
const ficha = document.getElementById("ficha");
const fields = {
  num: document.getElementById("stopNum"),
  region: document.getElementById("stopRegion"),
  name: document.getElementById("stopName"),
  note: document.getElementById("stopNote"),
  leg: document.getElementById("stopLeg"),
  stay: document.getElementById("stopStay"),
  road: document.getElementById("stopRoad")
};

let current = 0;

function activate(index) {
  if (index === current || !stops[index]) {
    return;
  }
  current = index;
  const stop = stops[index];
  fields.num.textContent = stop.num;
  fields.region.textContent = stop.region;
  fields.name.textContent = stop.name;
  fields.note.textContent = stop.note;
  fields.leg.textContent = stop.leg;
  fields.stay.textContent = stop.stay;
  fields.road.textContent = stop.road;
  buttons.forEach(function (button, k) {
    button.setAttribute("aria-pressed", String(k === index));
  });
  ficha.classList.remove("ficha--swap");
  void ficha.offsetWidth;
  ficha.classList.add("ficha--swap");
}

buttons.forEach(function (button, index) {
  button.addEventListener("pointerenter", function () {
    activate(index);
  });
  button.addEventListener("focus", function () {
    activate(index);
  });
  button.addEventListener("click", function () {
    activate(index);
  });
});
