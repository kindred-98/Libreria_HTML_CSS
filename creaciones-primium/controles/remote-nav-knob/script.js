const ITEMS = ["Home", "Live TV", "Guide", "Apps", "Settings", "Source"];

const nav = document.querySelector("#nav");
const knob = document.querySelector("#knob");
const ring = document.querySelector("#ring");
const lcdIdx = document.querySelector("#lcdIdx");
const lcdName = document.querySelector("#lcdName");
const lcdMeta = document.querySelector("#lcdMeta");
const strip = document.querySelector("#lcdStrip");
const enter = document.querySelector("#enter");
const remote = document.querySelector("#remote");
const status = document.querySelector("#status");

if (nav && knob && ring && enter) {
  const arms = [...ring.querySelectorAll(".arm")];
  const marks = strip ? [...strip.children] : [];
  const SPAN = 300;
  const START = -150;

  const say = (i) => `${ITEMS[i]}, station ${i + 1} of ${ITEMS.length}`;

  const paint = (announce) => {
    const i = Math.min(ITEMS.length - 1, Math.max(0, Number(nav.value) || 0));
    knob.style.transform = `rotate(${START + (i * SPAN) / (ITEMS.length - 1)}deg)`;
    arms.forEach((arm, k) => arm.classList.toggle("on", k === i));
    marks.forEach((mark, k) => mark.classList.toggle("on", k === i));
    if (lcdIdx) lcdIdx.textContent = String(i + 1).padStart(2, "0");
    if (lcdName) {
      lcdName.textContent = ITEMS[i];
      lcdName.classList.remove("roll");
      void lcdName.offsetWidth;
      lcdName.classList.add("roll");
    }
    if (lcdMeta) lcdMeta.textContent = `station ${i + 1} of ${ITEMS.length}`;
    nav.setAttribute("aria-valuetext", say(i));
    if (status && announce) status.textContent = `Station ${i + 1} of ${ITEMS.length} · ${ITEMS[i]}`;
  };

  const press = () => {
    const i = Number(nav.value) || 0;
    enter.classList.remove("pulse");
    void enter.offsetWidth;
    enter.classList.add("pulse");
    if (remote) {
      remote.classList.remove("jolt");
      void remote.offsetWidth;
      remote.classList.add("jolt");
    }
    if (status) status.textContent = `Opened ${ITEMS[i]}`;
    if (lcdMeta) lcdMeta.textContent = `opened ${ITEMS[i]}`;
  };

  paint(false);

  nav.addEventListener("input", () => paint(true));
  nav.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      press();
      return;
    }
    let delta = 0;
    if (event.key === "PageUp") delta = 2;
    if (event.key === "PageDown") delta = -2;
    if (delta) {
      event.preventDefault();
      const next = Math.min(ITEMS.length - 1, Math.max(0, Number(nav.value) + delta));
      nav.value = String(next);
      paint(true);
    }
  });
  enter.addEventListener("click", press);
}
