const app = document.querySelector("#app");
const scale = document.querySelector("#scale");
const meta = document.querySelector("#meta");

if (app && scale) {
  const steps = {
    caption: "caption · 11 px",
    body: "body · 15 px",
    title: "title · 28 px",
    display: "display · 56 px",
  };

  const apply = () => {
    app.classList.remove("is-caption", "is-body", "is-title", "is-display");
    app.classList.add(`is-${scale.value}`);
    if (meta) meta.textContent = steps[scale.value] ?? scale.value;
  };

  scale.addEventListener("change", apply);
  apply();
}
