(function () {
  var nav = document.getElementById("appnav");
  var glow = document.getElementById("glow");
  var badge = document.getElementById("badge");
  var badgeText = document.getElementById("badgeText");
  var heroUnread = document.getElementById("heroUnread");
  var markRead = document.getElementById("markRead");
  var restore = document.getElementById("restore");
  var links = [].slice.call(nav.querySelectorAll("a[href^='#']"));
  var sections = [].slice.call(document.querySelectorAll("main .sec[id]"));
  var active = null;

  function setGlow(i) {
    glow.style.setProperty("--i", i);
  }

  function setActive(link) {
    if (!link || link === active) return;
    active = link;
    for (var i = 0; i < links.length; i++) {
      if (links[i] === link) links[i].setAttribute("aria-current", "page");
      else links[i].removeAttribute("aria-current");
    }
    setGlow(Number(link.getAttribute("data-i")) || 0);
    var foot = document.querySelector(".foot span:nth-child(2)");
    if (foot) foot.textContent = "Tab " + String(Number(link.getAttribute("data-i")) + 1).padStart(2, "0") + " of 05";
  }

  function spy() {
    var mark = window.scrollY + window.innerHeight * 0.34;
    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= mark) current = sections[i];
    }
    if (!current) return;
    var id = "#" + current.id;
    for (var k = 0; k < links.length; k++) {
      if (links[k].getAttribute("href") === id) { setActive(links[k]); break; }
    }
  }

  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) {
      var href = this.getAttribute("href");
      var target = document.querySelector(href);
      setActive(this);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) history.replaceState(null, "", href);
      }
    });
  }

  nav.addEventListener("keydown", function (e) {
    var idx = links.indexOf(document.activeElement);
    if (idx < 0) return;
    var next = -1;
    if (e.key === "ArrowRight") next = (idx + 1) % links.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + links.length) % links.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = links.length - 1;
    if (next >= 0) {
      e.preventDefault();
      links[next].focus();
      setActive(links[next]);
    }
  });

  function setCount(n) {
    if (n <= 0) {
      badge.classList.add("is-gone");
      badge.textContent = "";
      badgeText.textContent = "no unread alerts";
      heroUnread.textContent = "00";
      markRead.disabled = true;
      restore.disabled = false;
    } else {
      badge.classList.remove("is-gone");
      badge.textContent = String(n);
      badgeText.textContent = n + " unread alerts";
      heroUnread.textContent = String(n).padStart(2, "0");
      markRead.disabled = false;
      restore.disabled = true;
    }
  }

  markRead.addEventListener("click", function () { setCount(0); });
  restore.addEventListener("click", function () { setCount(3); });

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; spy(); });
  }, { passive: true });
  window.addEventListener("resize", function () {
    if (active) setGlow(Number(active.getAttribute("data-i")) || 0);
  });

  setActive(links[0]);
  spy();
})();
