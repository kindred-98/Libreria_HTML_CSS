const master = document.querySelector("#master");
const list = document.querySelector("#children");
const state = document.querySelector("#masterState");
const foot = document.querySelector("#footOut");
const status = document.querySelector("#status");
const secTitle = document.querySelector("#secTitle");
const secHint = document.querySelector("#secHint");
const rail = document.querySelector(".rail");
const railInd = document.querySelector("#railInd");
const railBtns = rail ? [...rail.querySelectorAll(".rail__btn")] : [];

if (master && list) {
  const boxes = [...list.querySelectorAll(".row__box")];
  const rows = [...list.querySelectorAll("li")];

  const label = (box) => {
    const row = box.closest(".row");
    return row ? row.querySelector(".row__state") : null;
  };

  const play = () => {
    rows.forEach((row) => row.classList.remove("enter"));
    void list.offsetWidth;
    rows.forEach((row) => row.classList.add("enter"));
  };

  const report = () => {
    const on = boxes.filter((box) => box.checked).length;
    const full = on === boxes.length;
    master.indeterminate = on > 0 && !full;
    master.checked = full;
    boxes.forEach((box) => {
      const out = label(box);
      if (out) out.textContent = box.checked ? "on" : "off";
    });
    const mode = full ? "all on" : on === 0 ? "all off" : "partial";
    if (state) {
      state.textContent = mode;
      state.classList.remove("pop");
      void state.offsetWidth;
      state.classList.add("pop");
    }
    if (foot) {
      foot.textContent = `${on} of ${boxes.length} children on · master ${
        full ? "checked" : on === 0 ? "cleared" : "indeterminate"
      }`;
    }
    if (status) {
      status.textContent = full
        ? "Master switch checked, every child on"
        : on === 0
          ? "Master switch cleared, every child off"
          : `Master switch indeterminate, ${on} of ${boxes.length} children on`;
    }
  };

  const cascade = () => {
    const target = master.checked;
    boxes.forEach((box) => {
      box.checked = target;
    });
    play();
    report();
  };

  master.addEventListener("change", cascade);
  boxes.forEach((box) => box.addEventListener("change", report));

  boxes.forEach((box, index) => {
    box.addEventListener("keydown", (event) => {
      let next = -1;
      if (event.key === "ArrowDown") next = Math.min(boxes.length - 1, index + 1);
      if (event.key === "ArrowUp") next = Math.max(0, index - 1);
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = boxes.length - 1;
      if (next >= 0) {
        event.preventDefault();
        boxes[next].focus();
      }
    });
  });

  const place = () => {
    if (!railInd || !railBtns.length) return;
    const active = railBtns.findIndex((btn) => btn.classList.contains("is-on"));
    const btn = railBtns[active < 0 ? 0 : active];
    railInd.style.transform = `translate3d(${btn.offsetLeft - 6}px,${btn.offsetTop - 6}px,0)`;
  };

  railBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      railBtns.forEach((other) => other.classList.toggle("is-on", other === btn));
      if (secTitle) secTitle.textContent = btn.dataset.title || "";
      if (secHint) secHint.textContent = btn.dataset.hint || "";
      place();
      play();
      if (status) status.textContent = `Section ${btn.dataset.title || ""} opened`;
    });
  });

  window.addEventListener("resize", place);
  report();
  place();
  play();
}
