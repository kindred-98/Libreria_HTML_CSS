const minIn = document.querySelector("#minIn");
const maxIn = document.querySelector("#maxIn");
const band = document.querySelector("#band");
const liquid = document.querySelector("#liquid");
const minOut = document.querySelector("#minOut");
const maxOut = document.querySelector("#maxOut");
const bandOut = document.querySelector("#bandOut");
const status = document.querySelector("#status");

if (minIn && maxIn && band && liquid) {
  let last = "min";

  const resolve = () => {
    let lo = Number(minIn.value);
    let hi = Number(maxIn.value);
    if (lo > hi) {
      if (last === "min") {
        hi = lo;
        maxIn.value = String(hi);
      } else {
        lo = hi;
        minIn.value = String(lo);
      }
    }
    return [lo, hi];
  };

  const paint = () => {
    const [lo, hi] = resolve();
    band.style.transform = `translateX(${lo}%) scaleX(${(hi - lo) / 100})`;
    liquid.style.bottom = `${lo}%`;
    liquid.style.height = `${hi - lo}%`;
    if (minOut) minOut.textContent = String(lo);
    if (maxOut) maxOut.textContent = String(hi);
    if (bandOut) bandOut.textContent = String(hi - lo);
    minIn.setAttribute("aria-valuetext", `${lo} centilitres`);
    maxIn.setAttribute("aria-valuetext", `${hi} centilitres`);
    if (status) status.textContent = `Fill window ${lo} to ${hi} centilitres`;
  };

  const raise = (input) => {
    minIn.classList.remove("up");
    maxIn.classList.remove("up");
    input.classList.add("up");
  };

  const apply = (input, value) => {
    input.value = String(Math.min(100, Math.max(0, value)));
    raise(input);
    paint();
  };

  const wire = (input, tag) => {
    input.addEventListener("input", () => {
      last = tag;
      raise(input);
      paint();
    });
    input.addEventListener("pointerdown", () => raise(input));
    input.addEventListener("focus", () => raise(input));
    input.addEventListener("keydown", (event) => {
      const value = Number(input.value);
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        last = tag;
        apply(input, Math.round(value / 5) * 5);
        return;
      }
      if (event.key === "PageUp") {
        event.preventDefault();
        last = tag;
        apply(input, value + 10);
        return;
      }
      if (event.key === "PageDown") {
        event.preventDefault();
        last = tag;
        apply(input, value - 10);
      }
    });
  };

  wire(minIn, "min");
  wire(maxIn, "max");
  minIn.classList.add("up");
  paint();
}
