const card = document.querySelector("#card");
const button = document.querySelector("#recBtn");
const clock = document.querySelector("#clock");
const tenth = document.querySelector("#tenth");
const state = document.querySelector("#state");

if (card && button && clock && tenth && state) {
  const pad = (n) => String(n).padStart(2, "0");
  let running = button.getAttribute("aria-pressed") === "true";
  let elapsed = 107;
  let mark = performance.now();
  let timer = 0;

  const write = () => {
    const total = Math.floor(elapsed);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    clock.textContent = `${pad(mins)}:${pad(secs)}`;
    tenth.textContent = String(Math.floor((elapsed - total) * 10));
  };

  const label = () => {
    if (running) {
      state.textContent = "recording";
      return;
    }
    const total = Math.floor(elapsed);
    state.textContent = total > 0 ? `take held at ${pad(Math.floor(total / 60))}:${pad(total % 60)}` : "ready to roll";
  };

  const paint = () => {
    card.classList.toggle("is-live", running);
    button.setAttribute("aria-pressed", running ? "true" : "false");
    label();
    write();
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = 0;
  };

  const start = () => {
    if (timer) return;
    mark = performance.now();
    timer = setInterval(() => {
      const now = performance.now();
      elapsed += (now - mark) / 1000;
      mark = now;
      write();
    }, 100);
  };

  button.addEventListener("click", () => {
    running = !running;
    paint();
    if (running) start();
    else stop();
  });

  paint();
  if (running) start();
}
