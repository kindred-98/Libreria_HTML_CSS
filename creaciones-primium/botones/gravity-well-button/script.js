(function () {
  "use strict";
  var btn = document.getElementById("well");
  if (!btn) return;

  function down(e) {
    if (btn.disabled) return;
    e.preventDefault();
    btn.classList.add("is-a");
  }

  function up() {
    if (!btn.classList.contains("is-a")) return;
    btn.classList.remove("is-a");
    btn.classList.remove("rec-a", "rec-b");
    btn.getBoundingClientRect();
    btn.classList.add(btn.classList.contains("rec-b") ? "rec-a" : "rec-b");
  }

  btn.addEventListener("pointerdown", down);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  btn.addEventListener("pointerleave", function () { if (btn.classList.contains("is-a")) up(); });
  btn.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    btn.classList.add("is-a");
  });
  btn.addEventListener("keyup", function (e) {
    if (e.key === "Enter" || e.key === " ") up();
  });
  btn.addEventListener("blur", function () { up(); });
})();
