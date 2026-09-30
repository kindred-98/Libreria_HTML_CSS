(function () {
  var list = document.getElementById("crumbs");
  var lit = document.getElementById("trailLit");
  var depth = document.getElementById("depth");
  var fill = document.getElementById("metaFill");
  var trail = list.parentNode.querySelector(".trail");
  var items = Array.prototype.slice.call(list.querySelectorAll(".crumb"));
  var mRef = document.getElementById("mRef");
  var mTitle = document.getElementById("mTitle");
  var mFormat = document.getElementById("mFormat");
  var mDur = document.getElementById("mDur");
  var mStatus = document.getElementById("mStatus");
  var mNote = document.getElementById("mNote");

  var records = {
    archive: {
      ref: "ARC / ROOT",
      title: "National documentary archive",
      format: "Mixed holdings",
      dur: "4 200 reels",
      status: "Open to readers",
      note: "Reading room open Tuesday to Saturday, ten until six. Gloves are provided at the desk and expected back on the way out.",
      bar: 0.25
    },
    collections: {
      ref: "ARC / COL",
      title: "Four standing collections",
      format: "Work · News · Family · State",
      dur: "1 940 reels",
      status: "Catalogued",
      note: "Material is filed by what the film was made for rather than by who made it, which is unpopular with cataloguers and popular with readers.",
      bar: 0.5
    },
    coastal: {
      ref: "ARC / CS-72",
      title: "Coastal survey 1972 - 1979",
      format: "16 mm reversal · mono",
      dur: "84 shoots · 42 km",
      status: "Cold store · 4 C",
      note: "Filmed twice a year at low water with the same tripod. The engineering question was answered in 1979; the accidental portrait keeps being used.",
      bar: 0.75
    },
    reel042: {
      ref: "ARC / 042",
      title: "The harbour at dawn",
      format: "16 mm reversal · 24 fps",
      dur: "14 min 28 s",
      status: "Digitised · playable",
      note: "Shot on the fourteenth of May 1974 from ten past five. Two unbroken minutes of net menders: the reel every student is shown first.",
      bar: 1
    }
  };

  function current() {
    for (var i = 0; i < items.length; i++) {
      if (items[i].classList.contains("is-current")) return i;
    }
    return 0;
  }

  function paint(idx) {
    var link = items[idx].querySelector("a");
    var w = trail.offsetWidth;
    if (w && link.offsetWidth) {
      lit.style.transform = "scaleX(" +
        Math.min(1, (link.offsetLeft + link.offsetWidth / 2) / w).toFixed(4) + ")";
    }
    depth.textContent = String(idx + 1);
    var rec = records[(link.getAttribute("href") || "").slice(1)];
    if (rec) {
      mRef.textContent = rec.ref;
      mTitle.textContent = rec.title;
      mFormat.textContent = rec.format;
      mDur.textContent = rec.dur;
      mStatus.textContent = rec.status;
      mNote.textContent = rec.note;
      fill.style.transform = "scaleX(" + rec.bar + ")";
    }
  }

  function setCurrent(idx) {
    items.forEach(function (li, i) {
      var a = li.querySelector("a");
      li.classList.toggle("is-passed", i <= idx);
      li.classList.toggle("is-current", i === idx);
      if (i === idx) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    paint(idx);
  }

  list.addEventListener("click", function (e) {
    var t = e.target;
    while (t && t !== list) {
      if (t.classList && t.classList.contains("crumb")) {
        setCurrent(items.indexOf(t));
        return;
      }
      t = t.parentNode;
    }
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        for (var i = 0; i < items.length; i++) {
          if (items[i].querySelector("a").getAttribute("href") === "#" + id) {
            setCurrent(i);
            return;
          }
        }
      });
    }, { rootMargin: "-38% 0px -54% 0px", threshold: 0 });
    items.forEach(function (li) {
      var sec = document.getElementById(li.querySelector("a").getAttribute("href").slice(1));
      if (sec) io.observe(sec);
    });
  }

  window.addEventListener("resize", function () { paint(current()); });
  window.addEventListener("load", function () { paint(current()); });

  setCurrent(current());
  window.setTimeout(function () { paint(current()); }, 160);
})();
