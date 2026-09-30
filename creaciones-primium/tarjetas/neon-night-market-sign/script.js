const cam = document.getElementById("cam");
const exposure = document.getElementById("ev");
const saturation = document.getElementById("sat");
const glowLevel = document.getElementById("glow");
const exposureOut = document.getElementById("evOut");
const saturationOut = document.getElementById("satOut");
const glowOut = document.getElementById("glowOut");
const aeLock = document.getElementById("ael");
const aeText = aeLock ? aeLock.querySelector(".ael__text") : null;
const ranges = [exposure, saturation, glowLevel].filter(Boolean);

function signed(value) {
  return (value >= 0 ? "+" : "") + value.toFixed(1);
}

function paint() {
  if (!cam || !exposure || !saturation || !glowLevel) {
    return;
  }
  const stop = Number(exposure.value);
  const sat = Number(saturation.value);
  const glow = Number(glowLevel.value);

  cam.style.setProperty("--bright", (1 + (stop / 20) * 0.5).toFixed(3));
  cam.style.setProperty("--sat", (0.4 + sat * 0.016).toFixed(3));
  cam.style.setProperty("--glow", (0.4 + glow * 0.01).toFixed(3));

  if (exposureOut) {
    exposureOut.textContent = signed(stop / 10);
  }
  if (saturationOut) {
    saturationOut.textContent = Math.round((0.4 + sat * 0.016) * 100) + "%";
  }
  if (glowOut) {
    glowOut.textContent = Math.round((0.4 + glow * 0.01) * 100) + "%";
  }
}

ranges.forEach(function (range) {
  range.addEventListener("input", paint);
});

if (aeLock) {
  aeLock.addEventListener("click", function () {
    const locked = aeLock.getAttribute("aria-pressed") === "true";
    const next = locked ? "false" : "true";
    aeLock.setAttribute("aria-pressed", next);
    if (aeText) {
      aeText.textContent = next === "true" ? "AE locked" : "AE lock";
    }
    ranges.forEach(function (range) {
      range.disabled = next === "true";
    });
  });
}

paint();
