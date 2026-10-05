(function () {
  "use strict";
  var form = document.getElementById("composer");
  if (!form) return;
  var key = document.getElementById("key");
  var inp = document.getElementById("inp");
  var thread = document.getElementById("thread");
  var room = document.getElementById("room");
  var count = document.getElementById("count");
  var replies = [
    "Queued. The plate cools in about four minutes, then you are clear to re-seat it.",
    "Logged against the rig. I will keep the sweep running while you work.",
    "Copy. I have pulled the 04:20 artefact aside so nobody rolls it forward by accident.",
    "Done. The switch reads clean now and the amber is back to its resting level."
  ];
  var n = 0;
  var busy = false;

  function stamp() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 10 ? "0" + h : "" + h) + ":" + (m < 10 ? "0" + m : "" + m);
  }

  function bubble(side, text, time) {
    var row = document.createElement("div");
    row.className = "msg msg--" + side;
    var body = document.createElement("div");
    body.className = "msg__b";
    var p = document.createElement("p");
    p.textContent = text;
    var t = document.createElement("time");
    t.textContent = time;
    body.appendChild(p);
    body.appendChild(t);
    if (side === "in") {
      var av = document.createElement("span");
      av.className = "msg__av";
      av.textContent = "O";
      row.appendChild(av);
    }
    row.appendChild(body);
    return row;
  }

  function typing() {
    var row = document.createElement("div");
    row.className = "typing";
    var av = document.createElement("span");
    av.className = "msg__av";
    av.textContent = "O";
    var dots = document.createElement("span");
    dots.className = "msg__b";
    dots.innerHTML = "<i></i><i></i><i></i>";
    row.appendChild(av);
    row.appendChild(dots);
    return row;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (busy || key.disabled) return;
    var text = (inp.value || "").trim();
    if (!text) text = "Ping the desk";
    busy = true;
    key.classList.add("is-down");
    thread.appendChild(bubble("out", text, stamp()));
    inp.value = "";
    room.lastChild.textContent = "Ops typing\\ responding now";
    count.textContent = "sending";
    window.clearTimeout(form.t1);
    window.clearTimeout(form.t2);
    form.t1 = window.setTimeout(function () {
      key.classList.remove("is-down");
      key.classList.remove("re-a", "re-b");
      key.getBoundingClientRect();
      key.classList.add(key.classList.contains("re-b") ? "re-a" : "re-b");
    }, 110);
    form.t2 = window.setTimeout(function () {
      var wait = typing();
      thread.appendChild(wait);
      window.setTimeout(function () {
        if (wait.parentNode) wait.remove();
        thread.appendChild(bubble("in", replies[n % replies.length], stamp()));
        n++;
        room.lastChild.textContent = "Ops online\\ replies in 2 min";
        count.textContent = "sent";
        busy = false;
      }, 1150);
    }, 130);
  });
})();
