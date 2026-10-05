const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const book = document.getElementById("chapBook");
const left = document.getElementById("chapLeft");
const right = document.getElementById("chapRight");
const turn = document.getElementById("chapTurn");
const front = document.getElementById("chapTurnFront");
const back = document.getElementById("chapTurnBack");
const fold = document.getElementById("chapFold");
const where = document.getElementById("chapWhere");
const prev = document.getElementById("chapPrev");
const next = document.getElementById("chapNext");
const mark = document.getElementById("chapMark");
const ribbon = document.getElementById("chapRibbon");
const tpl = document.getElementById("chapSpreads");

const pool = Array.prototype.slice.call(tpl.content.children);
const lefts = [left.innerHTML, pool[0].innerHTML, pool[2].innerHTML];
const rights = [right.innerHTML, pool[1].innerHTML, pool[3].innerHTML];
const last = lefts.length - 1;

let index = 0;
let busy = false;
let tucked = false;

function pageNo(i) {
  return 2 + i * 2;
}

function render(i) {
  left.innerHTML = lefts[i];
  right.innerHTML = rights[i];
  where.textContent = "Spread " + (i + 1) + " of " + lefts.length + " · pages " + pageNo(i) + " and " + (pageNo(i) + 1);
  prev.disabled = i === 0;
  next.disabled = i === last;
  if (!tucked) {
    mark.textContent = "Ribbon at page " + (pageNo(i) + 1);
  }
}

function settle() {
  turn.classList.remove("is-on", "is-forward", "is-back");
  fold.classList.remove("is-creasing");
  busy = false;
}

function go(dir) {
  const target = index + dir;
  if (busy || target < 0 || target > last) {
    return;
  }
  busy = true;
  if (reduce) {
    index = target;
    render(index);
    book.classList.add("is-swapping");
    window.setTimeout(function () {
      book.classList.remove("is-swapping");
    }, 380);
    settle();
    return;
  }
  front.innerHTML = dir > 0 ? rights[index] : lefts[index];
  back.innerHTML = lefts[target];
  turn.classList.add("is-on");
  turn.classList.remove("is-forward", "is-back");
  turn.getBoundingClientRect();
  turn.classList.add(dir > 0 ? "is-forward" : "is-back");
  fold.classList.add("is-creasing");
  window.setTimeout(function () {
    index = target;
    render(index);
    settle();
  }, 610);
}

prev.addEventListener("click", function () {
  go(-1);
});

next.addEventListener("click", function () {
  go(1);
});

mark.addEventListener("click", function () {
  tucked = !tucked;
  mark.setAttribute("aria-pressed", tucked ? "false" : "true");
  mark.textContent = tucked ? "Ribbon in the gutter" : "Ribbon at page " + (pageNo(index) + 1);
  ribbon.classList.toggle("is-off", tucked);
});

render(index);
