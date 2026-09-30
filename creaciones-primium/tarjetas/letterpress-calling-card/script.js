const card = document.getElementById("prs");
const press = document.getElementById("prsPress");
const order = document.getElementById("prsOrder");
const stamp = document.getElementById("prsStamp");
const note = document.getElementById("prsNote");

press.addEventListener("click", function () {
  const on = press.getAttribute("aria-pressed") !== "true";
  press.setAttribute("aria-pressed", on ? "true" : "false");
  press.textContent = on ? "Reprint clean" : "Ink the proof";
  card.classList.toggle("is-proof", on);
  stamp.textContent = on ? "Proof approved" : "Proof pending";
  note.textContent = on
    ? "Two plates pulled at 0.42 mm · 6 s dry"
    : "Two plates loaded · impression 0.42 mm";
});

order.addEventListener("click", function () {
  const on = order.getAttribute("aria-pressed") !== "true";
  order.setAttribute("aria-pressed", on ? "true" : "false");
  order.textContent = on ? "200 cards on the press" : "Order 200 cards";
  note.textContent = on
    ? "Run 200 cards on 600 lb cotton · ships Friday"
    : "Two plates pulled at 0.42 mm · 6 s dry";
});
