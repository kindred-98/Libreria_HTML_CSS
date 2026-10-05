const box = document.querySelector("#case");
const mix = document.querySelector("#mix");
const mixChip = document.querySelector("#mixChip");
const mixHex = document.querySelector("#mixHex");
const nameOut = document.querySelector("#plaqueName");
const hexOut = document.querySelector("#plaqueHex");
const subOut = document.querySelector("#plaqueSub");
const noOut = document.querySelector("#plaqueNo");
const options = [...document.querySelectorAll('input[name="pigment"]')];

if (box) {
  const apply = (pigment, name, sub, hex, slot) => {
    box.style.setProperty("--pig", pigment);
    box.style.setProperty("--spot", `color-mix(in srgb, ${pigment} 34%, rgba(255,226,170,.2))`);
    if (nameOut) nameOut.textContent = name;
    if (hexOut) hexOut.textContent = hex;
    if (subOut) subOut.textContent = sub;
    if (noOut) noOut.textContent = `Nº ${String(slot).padStart(2, "0")}`;
  };

  const show = (option) => {
    const bare = option.dataset.hex ?? "1c4f8f";
    const hex = `#${bare.replaceAll('#', "")}`;
    apply(hex, option.dataset.name, option.dataset.sub, bare, options.indexOf(option) + 1);
  };

  for (const option of options) {
    option.addEventListener("change", () => {
      if (option.checked) show(option);
    });
  }

  box.addEventListener("keydown", (event) => {
    const index = options.findIndex((option) => option.checked);
    if (index < 0) return;
    let next = null;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "PageUp") next = Math.max(0, index - 3);
    else if (event.key === "PageDown") next = Math.min(options.length - 1, index + 3);
    if (next === null) return;
    event.preventDefault();
    options[next].checked = true;
    options[next].focus();
    show(options[next]);
  });

  const showMix = () => {
    const value = mix?.value ?? "#7a4bb5";
    if (mixChip) mixChip.style.background = value;
    if (mixHex) mixHex.textContent = value.replaceAll('#', "");
    apply(value, "Custom mix", "hand ground", value.replaceAll('#', ""), 7);
  };

  mix?.addEventListener("input", showMix);
  mix?.addEventListener("change", showMix);

  const initial = options.find((option) => option.checked);
  if (initial) show(initial);
  if (mixChip) mixChip.style.background = mix?.value ?? "#7a4bb5";
  if (mixHex) mixHex.textContent = (mix?.value ?? "#7a4bb5").replace("#", "");
}
