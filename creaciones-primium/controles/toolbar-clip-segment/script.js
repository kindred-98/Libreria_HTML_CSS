const seg = document.querySelector("#seg");
const subject = document.querySelector("#subject");
const hud = document.querySelector("#hud");
const status = document.querySelector("#status");
const undo = document.querySelector("#undo");
const redo = document.querySelector("#redo");
const modes = ["clip", "crop", "mask"];
const copy = {
  clip: "clip · corners locked",
  crop: "crop · frame on thirds",
  mask: "mask · circle reveal"
};

if (seg) {
  const inputs = [...seg.querySelectorAll(".seg__input")];
  const glyphs = [...seg.querySelectorAll(".glyph")];
  const lays = [
    document.querySelector("#layClip"),
    document.querySelector("#layCrop"),
    document.querySelector("#layMask")
  ];
  const history = [];
  let cursor = 0;
  let forward = [];

  const index = () => inputs.findIndex((input) => input.checked);

  const paint = () => {
    const i = Math.max(0, index());
    cursor = i;
    seg.style.setProperty("--i", String(i));
    glyphs.forEach((glyph, k) => glyph.classList.toggle("is-on", k === i));
    lays.forEach((lay, k) => {
      if (lay) lay.classList.toggle("is-on", k === i);
    });
    if (subject) {
      subject.classList.remove("m-crop", "m-mask");
      if (i === 1) subject.classList.add("m-crop");
      if (i === 2) subject.classList.add("m-mask");
      subject.classList.remove("swap");
      subject.getBoundingClientRect();
      subject.classList.add("swap");
      window.setTimeout(() => subject.classList.remove("swap"), 200);
    }
    if (hud) hud.textContent = copy[modes[i]];
    if (status) status.textContent = `${modes[i][0].toUpperCase()}${modes[i].slice(1)} mode selected`;
    if (undo) undo.disabled = history.length === 0;
    if (redo) redo.disabled = forward.length === 0;
  };

  const select = (i) => {
    const next = Math.min(inputs.length - 1, Math.max(0, i));
    if (next === index()) return;
    history.push(index());
    forward = [];
    inputs[next].checked = true;
    paint();
  };

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        const before = index();
        if (before !== cursor) {
          history.push(cursor);
          forward = [];
        }
        paint();
      }
    });
    input.addEventListener("keydown", (event) => {
      let target = -1;
      if (event.key === "Home") target = 0;
      if (event.key === "End") target = inputs.length - 1;
      if (event.key === "PageUp") target = index() + 1;
      if (event.key === "PageDown") target = index() - 1;
      if (target >= 0) {
        event.preventDefault();
        select(target);
        inputs[Math.min(inputs.length - 1, Math.max(0, target))].focus();
      }
    });
  });

  if (undo) {
    undo.addEventListener("click", () => {
      if (!history.length) return;
      forward.push(index());
      const prev = history.pop();
      inputs[prev].checked = true;
      paint();
    });
  }

  if (redo) {
    redo.addEventListener("click", () => {
      if (!forward.length) return;
      history.push(index());
      const next = forward.pop();
      inputs[next].checked = true;
      paint();
    });
  }

  paint();
}
