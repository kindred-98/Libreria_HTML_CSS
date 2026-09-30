const validLeft = document.getElementById("validLeft");
const validBar = document.getElementById("validBar");
const chainCount = document.getElementById("chainCount");
const chainRail = document.getElementById("chainRail");
const nodes = Array.prototype.slice.call(document.querySelectorAll(".node"));

const issued = Date.UTC(2026, 5, 28);
const expires = Date.UTC(2026, 11, 28);
const lifespan = expires - issued;

function pad(value) {
  return value < 10 ? "0" + value : String(value);
}

function paintValid() {
  const now = Date.now();
  const left = expires - now;
  if (left <= 0) {
    validLeft.textContent = "Expired, renew at the gate office";
    validBar.style.width = "0%";
    return;
  }
  const days = Math.floor(left / 86400000);
  const hours = Math.floor((left % 86400000) / 3600000);
  validLeft.textContent = "Remaining " + days + " d " + pad(hours) + " h";
  const spent = Math.max(0, now - issued);
  validBar.style.width = (100 - Math.min(100, (spent / lifespan) * 100)).toFixed(1) + "%";
}

paintValid();
setInterval(paintValid, 60000);

let signed = 1;

function paintChain() {
  nodes.forEach(function (node, index) {
    const on = index < signed;
    node.setAttribute("aria-pressed", String(on));
    node.classList.toggle("node--on", on);
  });
  chainCount.textContent = signed + " of 4 signed";
  chainRail.style.transform = "scaleX(" + signed / nodes.length + ")";
}

nodes.forEach(function (node, index) {
  node.addEventListener("click", function () {
    if (index === signed) {
      signed += 1;
      paintChain();
    }
  });
});

paintChain();
