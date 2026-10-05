const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PRESETS = {
  "0": {
    order: ["speed", "grapple", "stealth", "burst", "endur", "talent"],
    values: { speed: 92, grapple: 71, stealth: 84, burst: 63, endur: 58, talent: 76 },
    power: 842
  },
  "1": {
    order: ["burst", "speed", "talent", "grapple", "endur", "stealth"],
    values: { speed: 88, grapple: 64, stealth: 47, burst: 96, endur: 61, talent: 84 },
    power: 913
  },
  "2": {
    order: ["stealth", "talent", "grapple", "endur", "speed", "burst"],
    values: { speed: 74, grapple: 88, stealth: 97, burst: 41, endur: 52, talent: 79 },
    power: 806
  }
};

const list = document.getElementById("crlStatsList");
const presets = Array.from(document.querySelectorAll(".stats__preset"));
const power = document.getElementById("crlPower");
const card = document.querySelector(".crl");

function build(preset) {
  if (!list) {
    return;
  }
  preset.order.forEach(function (key) {
    const row = list.querySelector('.stat[data-key="' + key + '"]');
    if (row) {
      list.appendChild(row);
    }
  });
  Array.from(list.children).forEach(function (row, i) {
    const value = preset.values[row.dataset.key] || 0;
    row.style.setProperty("--v", String(value / 100));
    const num = row.querySelector(".stat__num");
    if (num) {
      num.textContent = String(value);
    }
    row.style.animation = "none";
    row.getBoundingClientRect();
    row.style.animation = "";
    row.style.animationDelay = (i * 0.04).toFixed(2) + "s";
  });
  if (power) {
    power.textContent = String(preset.power);
    power.classList.remove("is-pop");
    if (!reduce) {
      power.getBoundingClientRect();
      power.classList.add("is-pop");
    }
  }
}

presets.forEach(function (btn) {
  btn.addEventListener("click", function () {
    presets.forEach(function (other) {
      const on = other === btn;
      other.classList.toggle("is-on", on);
      other.setAttribute("aria-pressed", on ? "true" : "false");
    });
    build(PRESETS[btn.dataset.preset] || PRESETS["0"]);
  });
});

const ability = document.getElementById("crlAbility");
const abilityText = ability ? ability.querySelector(".ability__btnText") : null;

if (ability && abilityText && card) {
  let fired = false;
  ability.addEventListener("click", function () {
    fired = !fired;
    ability.classList.toggle("is-fired", fired);
    ability.setAttribute("aria-pressed", fired ? "true" : "false");
    abilityText.textContent = fired ? "Veil active" : "Trigger ability";
    if (!reduce) {
      card.classList.remove("is-firing");
      card.getBoundingClientRect();
      card.classList.add("is-firing");
      window.setTimeout(function () {
        card.classList.remove("is-firing");
      }, 600);
    }
  });
}

const lock = document.getElementById("crlLock");
const lockText = lock ? lock.querySelector(".crl__lockText") : null;

if (lock && lockText) {
  let locked = false;
  lock.addEventListener("click", function () {
    locked = !locked;
    lock.classList.toggle("is-done", locked);
    lock.setAttribute("aria-pressed", locked ? "true" : "false");
    lockText.textContent = locked ? "Card locked" : "Lock card";
  });
}
