const stage = document.querySelector(".stage");
const replay = document.getElementById("replay");

replay.addEventListener("click", () => {
  stage.classList.add("is-closed");
  setTimeout(() => {
    stage.classList.remove("is-closed");
    const left = stage.querySelector(".left");
    const right = stage.querySelector(".right");
    const msg = stage.querySelector(".message");
    left.style.animation = "none";
    right.style.animation = "none";
    msg.style.animation = "none";
    stage.getBoundingClientRect();
    left.style.animation = "";
    right.style.animation = "";
    msg.style.animation = "";
  }, 950);
});
