const hud = document.querySelector("#hud");
const input = document.querySelector("#combo");
const box = document.querySelector("#knobBox");
const rotor = document.querySelector("#rotor");
const reticle = document.querySelector("#reticle");
const cmdRows = [...document.querySelectorAll("#cmds .cmd")];
const ticks = [...document.querySelectorAll(".knob__ticks i")];
const nowName = document.querySelector("#nowName");
const armBtn = document.querySelector("#arm");
const armHint = document.querySelector("#armHint");
const stateOut = document.querySelector("#stateOut");
const logList = document.querySelector("#logList");
const clock = document.querySelector("#clock");

if (input && box && rotor && reticle && armBtn && cmdRows.length) {
  const names = cmdRows.map((row) => row.querySelector("span").textContent.trim());
  const codes = cmdRows.map((row) => row.querySelector("b").textContent.trim());
  const CHARGE = 900;
  const SWEEP = 280;
  const MIN_ANGLE = -140;
  const max = Number(input.max);

  const pretty = (name) => name.charAt(0) + name.slice(1).toLowerCase();

  const addLog = (text) => {
    if (!logList) return;
    const item = document.createElement("li");
    item.textContent = text;
    logList.prepend(item);
    while (logList.children.length > 4) logList.lastElementChild.remove();
  };

  const paint = () => {
    const i = Number(input.value);
    reticle.style.setProperty("--i", String(i));
    rotor.style.setProperty("--rot", `${MIN_ANGLE + (i * SWEEP) / max}deg`);
    cmdRows.forEach((row, k) => row.classList.toggle("is-live", k === i));
    ticks.forEach((tick, k) => tick.classList.toggle("is-lit", k <= i));
    if (nowName) nowName.textContent = names[i];
    input.setAttribute("aria-valuetext", `${codes[i]} ${pretty(names[i])}`);
  };

  const pulse = () => {
    reticle.classList.remove("is-pulse");
    void reticle.offsetWidth;
    reticle.classList.add("is-pulse");
  };

  const execute = () => {
    const i = Number(input.value);
    pulse();
    addLog(`${hud?.classList.contains("is-armed") ? "armed" : "exec"} · ${names[i].toLowerCase()}`);
    if (stateOut) stateOut.textContent = `state · ${names[i].toLowerCase()}`;
  };

  const step = (delta) => {
    const next = Math.min(max, Math.max(0, Number(input.value) + delta));
    if (next !== Number(input.value)) {
      input.value = String(next);
      paint();
    }
  };

  let dragging = false;

  const turn = (event) => {
    const rect = box.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx;
    const dy = event.clientY - cy;
    const radius = Math.hypot(dx, dy);
    if (radius < rect.width * 0.16) return;
    let angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    angle = Math.max(MIN_ANGLE, Math.min(MIN_ANGLE + SWEEP, angle));
    const value = Math.round(((angle - MIN_ANGLE) / SWEEP) * max);
    if (value !== Number(input.value)) {
      input.value = String(value);
      paint();
    }
  };

  input.addEventListener("input", paint);
  input.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    input.focus({ preventScroll: true });
    dragging = true;
    box.classList.add("is-dragging");
    try {
      input.setPointerCapture(event.pointerId);
    } catch {}
    turn(event);
  });
  input.addEventListener("pointermove", (event) => {
    if (dragging) turn(event);
  });
  const stop = () => {
    dragging = false;
    box.classList.remove("is-dragging");
  };
  input.addEventListener("pointerup", stop);
  input.addEventListener("pointercancel", stop);

  input.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (!event.repeat) execute();
    } else if (event.key === "PageUp") {
      event.preventDefault();
      step(2);
    } else if (event.key === "PageDown") {
      event.preventDefault();
      step(-2);
    }
  });

  reticle.addEventListener("animationend", () => reticle.classList.remove("is-pulse"));

  let armed = false;
  let pressing = false;
  let chargeTimer = null;
  let disarmedThisPress = false;

  const setArmed = (value) => {
    armed = value;
    armBtn.classList.toggle("is-armed", armed);
    armBtn.setAttribute("aria-pressed", String(armed));
    hud?.classList.toggle("is-armed", armed);
    if (stateOut) stateOut.textContent = armed ? "state · armed" : "state · standby";
    if (armHint) armHint.textContent = armed ? "system armed · press to release" : "press to select · hold to arm";
    addLog(armed ? "arm · lock engaged" : "arm · released");
  };

  const pressStart = () => {
    if (pressing) return;
    pressing = true;
    disarmedThisPress = false;
    if (armed) {
      setArmed(false);
      disarmedThisPress = true;
      return;
    }
    armBtn.classList.add("is-charging");
    if (armHint) armHint.textContent = "charging lock...";
    chargeTimer = setTimeout(() => {
      chargeTimer = null;
      armBtn.classList.remove("is-charging");
      setArmed(true);
    }, CHARGE);
  };

  const pressEnd = () => {
    if (!pressing) return;
    pressing = false;
    if (disarmedThisPress) return;
    if (chargeTimer !== null) {
      clearTimeout(chargeTimer);
      chargeTimer = null;
      armBtn.classList.remove("is-charging");
      if (armHint) armHint.textContent = armed ? "system armed · press to release" : "press to select · hold to arm";
      execute();
    }
  };

  armBtn.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    armBtn.focus({ preventScroll: true });
    try {
      armBtn.setPointerCapture(event.pointerId);
    } catch {}
    pressStart();
  });
  armBtn.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (!event.repeat) pressStart();
    }
  });
  armBtn.addEventListener("keyup", (event) => {
    if (event.key === " " || event.key === "Enter") pressEnd();
  });
  armBtn.addEventListener("blur", pressEnd);
  window.addEventListener("pointerup", pressEnd);
  window.addEventListener("pointercancel", pressEnd);

  const started = Date.now();
  const tick = () => {
    if (!clock) return;
    const total = Math.floor((Date.now() - started) / 1000);
    const hh = String(Math.floor(total / 3600)).padStart(2, "0");
    const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
    const ss = String(total % 60).padStart(2, "0");
    clock.textContent = `T+${hh}:${mm}:${ss}`;
  };
  tick();
  setInterval(tick, 1000);

  paint();
}
