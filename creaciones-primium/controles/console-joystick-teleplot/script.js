const stick = document.querySelector("#stick");
const log = document.querySelector("#log");
const rate = document.querySelector("#rate");

if (stick) {
  const STICK_LINES = 7;
  let x = 0;
  let y = 0;
  let samples = 0;
  let last = 0;
  let pending = 0;
  let dragging = false;

  const travel = () => Math.max(10, Math.min(38, stick.offsetWidth * 0.19));

  const write = (text, hot) => {
    if (!log) return;
    const line = document.createElement("p");
    line.textContent = text;
    if (hot) line.className = "hot";
    log.append(line);
    while (log.children.length > STICK_LINES) log.firstElementChild?.remove();
  };

  const report = (label) => {
    const now = performance.now();
    if (now - last > 320) {
      last = now;
      if (rate) rate.textContent = String(samples);
      samples = 0;
    }
    samples += 1;
    write(label);
  };

  const paint = (nextX, nextY) => {
    x = Math.round(Math.max(-100, Math.min(100, nextX)));
    y = Math.round(Math.max(-100, Math.min(100, nextY)));
    stick.style.setProperty("--x", String((x / 100) * travel()));
    stick.style.setProperty("--y", String((y / 100) * travel()));
    stick.style.setProperty("--push", String(Math.abs(x) + Math.abs(y)));
    stick.style.setProperty("--arm", String(Math.atan2(y, x) * (180 / Math.PI)));
    stick.setAttribute("aria-valuenow", String(x));
    stick.setAttribute("aria-valuetext", `X ${x}, Y ${y}`);
    if (pending) return;
    pending = window.setTimeout(() => {
      pending = 0;
      report(`move  x ${String(x).padStart(4, " ")}  y ${String(y).padStart(4, " ")}`);
    }, 60);
  };

  const fromPointer = (event) => {
    const box = stick.getBoundingClientRect();
    const radius = box.width / 2;
    return {
      x: ((event.clientX - (box.left + radius)) / radius) * 128,
      y: ((event.clientY - (box.top + radius)) / radius) * 128,
    };
  };

  stick.addEventListener("pointerdown", (event) => {
    dragging = true;
    stick.classList.add("is-drag");
    stick.setPointerCapture(event.pointerId);
    stick.focus();
    const point = fromPointer(event);
    paint(point.x, point.y);
  });

  stick.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const point = fromPointer(event);
    paint(point.x, point.y);
  });

  const stop = () => {
    if (!dragging) return;
    dragging = false;
    stick.classList.remove("is-drag");
  };

  stick.addEventListener("pointerup", stop);
  stick.addEventListener("pointercancel", stop);

  stick.addEventListener("keydown", (event) => {
    const step = event.shiftKey ? 20 : 5;
    const moves = {
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      PageUp: [0, -25],
      PageDown: [0, 25],
    };
    if (event.key in moves) {
      event.preventDefault();
      const [mx, my] = moves[event.key];
      paint(x + mx, y + my);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      paint(0, 0);
      report("home  stick centred", true);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      paint(100, -100);
      report("end   stick pinned to the corner", true);
      return;
    }
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      paint(0, 0);
      report("zero  stick recentred", true);
    }
  });

  paint(0, 0);
  if (rate) rate.textContent = "0";
}
