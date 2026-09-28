const rail = document.querySelector("#rail");
const fork = document.querySelector("#fork");
const gate = document.querySelector("#gate");
const gear = document.querySelector("#gear");
const gearSpin = document.querySelector("#gearSpin");
const pinionSpin = document.querySelector("#pinionSpin");
const clash = document.querySelector("#clash");
const machine = document.querySelector("#machine");
const needle = document.querySelector("#needle");
const nameOut = document.querySelector("#nameOut");
const ratioOut = document.querySelector("#ratioOut");
const teethOut = document.querySelector("#teethOut");
const rpmOut = document.querySelector("#rpmOut");
const torqueOut = document.querySelector("#torqueOut");
const cotaOd = document.querySelector("#cotaOd");
const cotaCd = document.querySelector("#cotaCd");
const live = document.querySelector("#live");
const inputs = Array.from(document.querySelectorAll('input[name="ratio"]'));
const dets = Array.from(document.querySelectorAll(".det"));
const notches = Array.from(document.querySelectorAll(".gate__notch"));
const segs = Array.from(document.querySelectorAll("#torqueBar i"));

if (gate && gear && gearSpin && pinionSpin && inputs.length) {
  const PINION = 18;
  const MODULE = 2.5;
  const IN_TORQUE = 24;
  const IN_RPM = 1440;
  const PITCH_PX = 14;
  const PER_TOOTH = PITCH_PX / (Math.PI * 2);
  let builtTeeth = 0;

  const buildWheel = (host, teeth) => {
    host.textContent = "";
    const rim = document.createElement("i");
    rim.className = "rim";
    const web = document.createElement("i");
    web.className = "web";
    const hub = document.createElement("i");
    hub.className = "hub";
    const mark = document.createElement("i");
    mark.className = "mark";
    host.append(rim, web, hub, mark);
    for (let k = 0; k < teeth; k++) {
      const tooth = document.createElement("i");
      tooth.className = "tooth";
      tooth.style.setProperty("--a", ((k * 360) / teeth).toFixed(3) + "deg");
      host.appendChild(tooth);
    }
  };

  const rebuild = (el) => {
    el.classList.remove("is-hit");
    void el.offsetWidth;
    el.classList.add("is-hit");
  };

  const placeFork = (index) => {
    if (!rail || !fork || !notches[index]) return;
    const railBox = rail.getBoundingClientRect();
    const notchBox = notches[index].getBoundingClientRect();
    const target = notchBox.left + notchBox.width / 2 - railBox.left;
    fork.style.setProperty("--fx", target.toFixed(2) + "px");
    fork.style.setProperty("--fw", (fork.offsetWidth / 2).toFixed(2) + "px");
  };

  const select = (teeth, index, silent) => {
    const ratio = teeth / PINION;
    const torque = IN_TORQUE * ratio;
    const rpm = IN_RPM / ratio;
    const pitchG = 360 / teeth;

    if (builtTeeth !== teeth) {
      buildWheel(gearSpin, teeth);
      builtTeeth = teeth;
    }

    gear.style.setProperty("--rr", (teeth * PER_TOOTH).toFixed(2) + "px");
    gearSpin.style.setProperty("--rest", ((270 - pitchG / 2) % pitchG + 5 * pitchG * index).toFixed(2));
    pinionSpin.style.setProperty("--rest", ((90 % (360 / PINION)) - 80 * index).toFixed(2));

    if (nameOut) nameOut.textContent = dets[index].querySelector(".det__name").textContent;
    if (ratioOut) ratioOut.textContent = ratio.toFixed(3) + " : 1";
    if (teethOut) teethOut.textContent = teeth + " / " + PINION;
    if (rpmOut) rpmOut.textContent = Math.round(rpm) + " rpm";
    if (torqueOut) torqueOut.textContent = torque.toFixed(1);
    if (cotaOd) cotaOd.textContent = (MODULE * teeth + 2 * MODULE).toFixed(1);
    if (cotaCd) cotaCd.textContent = ((MODULE * (teeth + PINION)) / 2).toFixed(1);
    if (needle) needle.style.setProperty("--deg", (-58 + (ratio - 1) * 90).toFixed(1));

    const lit = Math.round(torque / 6);
    segs.forEach((seg, k) => seg.classList.toggle("is-on", k < lit));
    notches.forEach((notch, k) => notch.classList.toggle("is-on", k === index));

    placeFork(index);
    rebuild(dets[index]);
    if (clash) rebuild(clash);
    if (machine) rebuild(machine);

    if (live && !silent) {
      live.textContent =
        ratio.toFixed(3) + " to one, " + teeth + " teeth against " + PINION +
        ", output torque " + torque.toFixed(1) + " newton metres";
    }
  };

  const current = () => inputs.findIndex((el) => el.checked);

  const paint = () => {
    const index = Math.max(0, current());
    select(Number(inputs[index].value), index, true);
  };

  paint();
  placeFork(Math.max(0, current()));

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      const index = inputs.indexOf(input);
      select(Number(input.value), index, false);
    });
  });

  gate.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key !== "Home" && key !== "End") return;
    const next = key === "Home" ? 0 : inputs.length - 1;
    if (next === current()) return;
    event.preventDefault();
    inputs[next].checked = true;
    inputs[next].focus();
    select(Number(inputs[next].value), next, false);
  });

  window.addEventListener("resize", () => placeFork(Math.max(0, current())));

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => placeFork(Math.max(0, current()))).observe(rail || gate);
  }
}
