const dial = document.querySelector("#dial");
const handHour = document.querySelector("#handHour");
const handMin = document.querySelector("#handMin");
const field = document.querySelector("#clockTime");
const digital = document.querySelector("#digital");
const meridiem = document.querySelector("#meridiem");
const flagSet = document.querySelector("#flagSet");

const WORDS = [
  "Twelve", "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten", "Eleven"
];

if (dial && handHour && handMin && field) {
  let hours = 10;
  let minutes = 9;
  let grab = null;

  const pad = (n) => String(n).padStart(2, "0");

  const paint = () => {
    const hDeg = (hours % 12) * 30 + (minutes / 60) * 30;
    const mDeg = minutes * 6;
    dial.style.setProperty("--ha", `${hDeg.toFixed(2)}deg`);
    dial.style.setProperty("--ma", `${mDeg.toFixed(2)}deg`);

    const shown = (hours + 11) % 12 + 1;
    if (digital) digital.textContent = `${pad(shown)}:${pad(minutes)}`;
    if (meridiem) meridiem.textContent = hours < 12 ? "am" : "pm";

    const text = `${pad(hours)}:${pad(minutes)}`;
    if (field.value !== text) field.value = text;

    handHour.setAttribute("aria-valuenow", String(hours));
    handHour.setAttribute("aria-valuetext", `${WORDS[hours % 12]} o'clock, ${minutes} minutes`);
    handMin.setAttribute("aria-valuenow", String(minutes));
    handMin.setAttribute("aria-valuetext", `${minutes} minutes past the hour`);
  };

  const setHands = (h, m) => {
    hours = ((Math.round(h) % 24) + 24) % 24;
    minutes = ((Math.round(m) % 60) + 60) % 60;
    paint();
  };

  const setHours = (h) => setHands(h, minutes);
  const setMinutes = (m) => setHands(hours, m);

  const angleOf = (event) => {
    const box = dial.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return { deg: deg < 0 ? deg + 360 : deg, r: Math.hypot(dx, dy), unit: box.width };
  };

  const handOf = (name) => (name === "hour" ? handHour : handMin);

  const pick = ({ deg, r, unit }) => {
    const rad = deg * (Math.PI / 180);
    const test = (ang, len) => {
      const along = r * Math.cos(rad - ang);
      const perp = Math.abs(r * Math.sin(rad - ang));
      if (perp > unit * 0.08 || along < -unit * 0.04 || along > len + unit * 0.04) return Infinity;
      return perp + (along > len ? unit * 0.05 : 0);
    };
    const hLen = unit * 0.29;
    const mLen = unit * 0.43;
    const hs = test(((hours % 12) * 30 + (minutes / 60) * 30) * (Math.PI / 180), hLen);
    const ms = test((minutes * 6) * (Math.PI / 180), mLen);
    if (hs === Infinity && ms === Infinity) return r < hLen * 0.6 ? "hour" : "min";
    return hs <= ms ? "hour" : "min";
  };

  const syncLit = () => {
    if (!flagSet) return;
    const lit = Boolean(grab) || document.activeElement === handHour || document.activeElement === handMin;
    flagSet.classList.toggle("is-lit", lit);
  };

  const onKeys = (event, which) => {
    const up = event.key === "ArrowUp" || event.key === "ArrowRight" || event.key === "PageUp";
    const down = event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "PageDown";
    if (up || down) {
      event.preventDefault();
      const step = event.key === "PageUp" || event.key === "PageDown" ? 5 : 1;
      const delta = up ? step : -step;
      if (which === "hour") setHours(hours + delta);
      else setMinutes(minutes + delta);
    } else if (event.key === "Home") {
      event.preventDefault();
      if (which === "hour") setHours(0); else setMinutes(0);
    } else if (event.key === "End") {
      event.preventDefault();
      if (which === "hour") setHours(23); else setMinutes(59);
    } else if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      setMinutes(which === "min" ? Math.round(minutes / 5) * 5 : Math.round(minutes / 15) * 15);
    } else {
      return;
    }
    syncLit();
  };

  handHour.addEventListener("keydown", (event) => onKeys(event, "hour"));
  handMin.addEventListener("keydown", (event) => onKeys(event, "min"));
  handHour.addEventListener("focus", syncLit);
  handMin.addEventListener("focus", syncLit);
  handHour.addEventListener("blur", syncLit);
  handMin.addEventListener("blur", syncLit);

  dial.addEventListener("pointerdown", (event) => {
    if (event.button) return;
    const at = angleOf(event);
    const which = pick(at);
    grab = { which, deg: at.deg, base: which === "hour" ? (hours % 12) * 5 + minutes / 12 : minutes };
    dial.classList.add("is-grab");
    if (typeof dial.setPointerCapture === "function") dial.setPointerCapture(event.pointerId);
    handOf(which).focus({ preventScroll: true });
    syncLit();
    event.preventDefault();
  });

  dial.addEventListener("pointermove", (event) => {
    if (!grab) return;
    const { deg } = angleOf(event);
    let delta = deg - grab.deg;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (grab.which === "hour") setHours(grab.base + (delta / 30) * 5);
    else setMinutes(grab.base + delta / 6);
  });

  const release = () => {
    if (!grab) return;
    grab = null;
    dial.classList.remove("is-grab");
    syncLit();
  };

  dial.addEventListener("pointerup", release);
  dial.addEventListener("pointercancel", release);
  dial.addEventListener("lostpointercapture", release);

  field.addEventListener("input", () => {
    const parts = String(field.value).split(":");
    if (parts.length < 2) return;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return;
    setHands(h, m);
  });

  field.addEventListener("blur", syncLit);

  const parts = String(field.value).split(":");
  if (parts.length === 2) setHands(Number(parts[0]), Number(parts[1]));
  else paint();
}
