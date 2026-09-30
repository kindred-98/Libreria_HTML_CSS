(function () {
  var rail = document.getElementById("rail");
  var list = document.getElementById("railList");
  var marker = document.getElementById("railMarker");
  var btns = Array.prototype.slice.call(list.querySelectorAll(".rail__btn"));

  function current() {
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].getAttribute("aria-current") === "true") return btns[i];
    }
    return btns[0];
  }

  function place(el) {
    if (!el) return;
    var item = el.parentNode;
    marker.style.height = item.offsetHeight + "px";
    marker.style.transform = "translateY(" + item.offsetTop + "px)";
  }

  function setCurrent(el) {
    btns.forEach(function (b) {
      if (b === el) {
        b.setAttribute("aria-current", "true");
        b.classList.add("is-active");
      } else {
        b.removeAttribute("aria-current");
        b.classList.remove("is-active");
      }
    });
    place(el);
  }

  btns.forEach(function (b) {
    b.addEventListener("pointerenter", function () { place(b); });
    b.addEventListener("pointerleave", function () { place(current()); });
    b.addEventListener("focus", function () { place(b); });
    b.addEventListener("blur", function () { place(current()); });
    b.addEventListener("click", function () { setCurrent(b); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") place(current());
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        for (var i = 0; i < btns.length; i++) {
          if (btns[i].getAttribute("href") === "#" + id) {
            setCurrent(btns[i]);
            return;
          }
        }
      });
    }, { rootMargin: "-42% 0px -52% 0px", threshold: 0 });
    btns.forEach(function (b) {
      var sec = document.getElementById((b.getAttribute("href") || "").slice(1));
      if (sec) io.observe(sec);
    });
  }

  window.addEventListener("resize", function () { place(current()); });
  window.addEventListener("load", function () { place(current()); });

  setCurrent(current());
  window.setTimeout(function () { place(current()); }, 140);
})();
