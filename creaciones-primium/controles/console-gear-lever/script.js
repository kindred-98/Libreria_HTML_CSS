const gate = document.querySelector("#gate");
const input = document.querySelector("#lever");
const knob = document.querySelector("#knob");
const seat = document.querySelector("#seat");
const gearOut = document.querySelector("#gearOut");
const ratioOut = document.querySelector("#ratioOut");
const torqueOut = document.querySelector("#torqueOut");
const wheelOut = document.querySelector("#wheelOut");
const pullOut = document.querySelector("#pullOut");
const needle = document.querySelector("#needle");
const log = document.querySelector("#log");
const bars = Array.from(document.querySelectorAll(".ladder__bar i"));

if (gate && input && knob) {
  const NAMES = ["R", "1", "2", "3", "4", "5", "6"];
  const RATIOS = [3.2, 3.4, 2.1, 1.45, 1.1, 0.88, 0.72];
  const ENGINE = 30;
  const ENGINE_RPM = 3000;
  const WHEEL_RADIUS = 0.31;
  const THUMB = 26;
  const ROWS = 6;
  let last = 0;

  const torqueOf = (index) => ENGINE * RATIOS[index];
  const stamp = () => {
    const now = new Date();
    return (
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0")
    );
  };

  const stampBack = (seconds) => {
    const then = new Date(Date.now() - seconds * 1000);
    return (
      String(then.getHours()).padStart(2, "0") +
      ":" +
      String(then.getMinutes()).padStart(2, "0") +
      ":" +
      String(then.getSeconds()).padStart(2, "0")
    );
  };

  const push = (cells, fresh) => {
    if (!log) return;
    const row = document.createElement("p");
    row.className = fresh ? "log__row is-new" : "log__row";
    cells.forEach((text) => {
      const cell = document.createElement("span");
      cell.textContent = text;
      row.appendChild(cell);
    });
    log.appendChild(row);
    const body = log.querySelectorAll(".log__row:not(.log__row--head)");
    while (body.length > ROWS) body[0].remove();
  };

  const jump = (element) => {
    element.classList.remove("is-hit");
    void element.offsetWidth;
    element.classList.add("is-hit");
  };

  const place = (index) => {
    const travel = Math.max(0, gate.clientHeight - THUMB);
    const y = (1 - index / Number(input.max)) * travel;
    knob.style.setProperty("--y", y.toFixed(2));
    if (seat) seat.style.setProperty("--y", y.toFixed(2));
  };

  const write = (from, to, ms) => {
    push(
      [
        stamp(),
        from === to ? "hold " + NAMES[to] : NAMES[from] + " to " + NAMES[to],
        RATIOS[to].toFixed(2),
        torqueOf(to).toFixed(1),
        ms === null ? "—" : String(ms),
      ],
      true
    );
  };

  const paint = (raw, silent) => {
    const index = Math.min(Number(input.max), Math.max(0, Math.round(Number(raw))));
    const ratio = RATIOS[index];
    const torque = torqueOf(index);
    input.value = String(index);

    place(index);

    if (gearOut) gearOut.textContent = NAMES[index];
    if (ratioOut) ratioOut.textContent = ratio.toFixed(2);
    if (torqueOut) torqueOut.textContent = torque.toFixed(1) + " nm";
    if (wheelOut) wheelOut.textContent = Math.round(ENGINE_RPM / ratio) + " rpm";
    if (pullOut) pullOut.textContent = Math.round(torque / WHEEL_RADIUS) + " n";
    if (needle) needle.style.setProperty("--deg", (-64 + (torque / 102) * 118).toFixed(1));

    bars.forEach((bar, k) => bar.classList.toggle("is-on", k === Number(input.max) - index));

    input.setAttribute(
      "aria-valuetext",
      (index === 0 ? "reverse" : NAMES[index] + (index === 1 ? "st" : index === 2 ? "nd" : index === 3 ? "rd" : "th")) +
        ", ratio " + ratio.toFixed(2) + ", torque " + torque.toFixed(1) + " newton metres"
    );

    if (!silent) {
      const now = Date.now();
      const from = last;
      const ms = last === 0 ? null : Math.max(1, now - last);
      last = now;
      write(from, index, ms);
      jump(knob);
      if (seat) jump(seat);
    }
  };

  const step = (delta) => paint(Number(input.value) + delta, false);

  input.addEventListener("input", () => paint(input.value, false));

  input.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key === "PageUp") {
      event.preventDefault();
      step(3);
      return;
    }
    if (key === "PageDown") {
      event.preventDefault();
      step(-3);
      return;
    }
    if (key === " " || key === "Enter") {
      event.preventDefault();
      paint(3, false);
    }
  });

  if (log) {
    const seated = Number(input.value);
    push(["--:--:--", "gate six", RATIOS[seated].toFixed(2), torqueOf(seated).toFixed(1), "—"], false);
    push([stampBack(214), "1 to 2", RATIOS[2].toFixed(2), torqueOf(2).toFixed(1), "168"], false);
    push([stampBack(96), "2 to 3", RATIOS[3].toFixed(2), torqueOf(3).toFixed(1), "204"], false);
    push([stampBack(31), "hold 3", RATIOS[3].toFixed(2), torqueOf(3).toFixed(1), "0"], false);
  }

  const measure = () => place(Number(input.value));

  window.addEventListener("resize", measure);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(measure).observe(gate);
  }

  paint(input.value, true);
}
