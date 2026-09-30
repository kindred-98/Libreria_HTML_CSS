const PRICE = 12.5;
const TOTAL_SEATS = 30;

const freeEl = document.getElementById("free");
const heldEl = document.getElementById("held");
const totalEl = document.getElementById("total");
const fillEl = document.querySelector(".gauge__fill");
const seats = Array.from(document.querySelectorAll(".seat"));
const sessions = Array.from(document.querySelectorAll(".session"));
const note = document.getElementById("sessionNote");
const reserve = document.getElementById("reserve");

const notes = [
  "Doors at 18:10 - English subtitles throughout",
  "Doors at 20:30 - director talk after the credits",
  "Doors at 23:00 - late show, bar open until 01:00"
];

function recount() {
  const held = document.querySelectorAll(".seat.is-held").length;
  const taken = document.querySelectorAll(".seat.is-taken").length;
  const free = TOTAL_SEATS - held - taken;
  freeEl.textContent = String(free);
  heldEl.textContent = String(held);
  totalEl.textContent = "\u20ac" + (held * PRICE).toFixed(2);
  fillEl.style.setProperty("--w", (free / TOTAL_SEATS).toFixed(3));
}

seats.forEach(function (seat) {
  if (seat.disabled) {
    return;
  }
  seat.addEventListener("click", function () {
    const held = seat.classList.toggle("is-held");
    seat.setAttribute("aria-pressed", String(held));
    const base = seat.getAttribute("aria-label").replace(/, held/g, "");
    seat.setAttribute("aria-label", base + (held ? ", held" : ""));
    recount();
  });
});

sessions.forEach(function (session, index) {
  session.addEventListener("click", function () {
    sessions.forEach(function (other, k) {
      const on = k === index;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", String(on));
    });
    note.textContent = notes[index];
    note.classList.remove("is-swap");
    void note.offsetWidth;
    note.classList.add("is-swap");
  });
});

reserve.addEventListener("click", function () {
  const on = reserve.getAttribute("aria-pressed") !== "true";
  reserve.setAttribute("aria-pressed", String(on));
  reserve.textContent = on ? "Seats held" : "Hold seats";
});
