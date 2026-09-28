const form = document.getElementById("form");
const email = document.getElementById("email");
const consent = document.getElementById("consent");
const summary = document.getElementById("summary");
const summaryList = document.getElementById("summaryList");
const summaryTitle = document.getElementById("summaryTitle");
const sendText = document.getElementById("sendText");
const stamped = document.getElementById("stamped");
const confetti = document.getElementById("confetti");

const TIRADOS = ["mailinator.com", "guerrillamail.com", "tempmail.example", "throwaway.email"];

const CAMPOS = [
  {
    id: "email",
    label: "Email address",
    msg: v => {
      if (v === "") return "We need an address to send the ledger to.";
      if (v.indexOf("@") === -1 || !/[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}/.test(v)) {
        return "That does not look like an address. Try the shape name@domain.com.";
      }
      const domain = v.split("@")[1].toLowerCase();
      if (TIRADOS.indexOf(domain) > -1) {
        return domain + " is a throwaway inbox, we cannot send the ledger there. Use the mailbox you read every day.";
      }
      if (v.length < 6 || v.length > 80) return "Keep the address between 6 and 80 characters.";
      return "That domain is not one we can write to.";
    },
    ok: v => {
      if (v.length < 6 || v.length > 80) return false;
      if (!/^[^\s@,;]+@[^\s@,;]+\.[a-zA-Z]{2,}$/.test(v)) return false;
      return TIRADOS.indexOf(v.split("@")[1].toLowerCase()) === -1;
    }
  },
  {
    id: "consent",
    label: "Consent to receive the ledger",
    msg: () => "Tick the box so we know we may write to you. One mail every two Tuesdays, nothing else.",
    ok: v => v === "yes" || v === "no"
  }
];

function el(id) { return document.getElementById(id); }

function valueOf(f) {
  if (f.id === "consent") return consent.checked ? "yes" : "no";
  return email.value.trim();
}

function paint(f) {
  const wrap = el(f.id).closest(".field");
  const help = el(f.id + "-help");
  const err = el(f.id + "-err");
  const v = valueOf(f);
  const bad = f.id === "consent" ? !consent.checked : !f.ok(v);
  const described = [help.id];

  wrap.dataset.state = bad ? "error" : "ok";
  el(f.id).setAttribute("aria-invalid", bad ? "true" : "false");
  if (bad) {
    described.push(err.id);
    err.textContent = f.msg(v);
  } else {
    err.textContent = "";
  }
  el(f.id).setAttribute("aria-describedby", described.join(" "));
  return bad;
}

function broken(f) {
  if (f.id === "consent") return !consent.checked;
  return !f.ok(email.value.trim());
}

email.addEventListener("blur", () => paint(CAMPOS[0]));
email.addEventListener("input", () => {
  if (email.closest(".field").dataset.state === "error") paint(CAMPOS[0]);
});
consent.addEventListener("change", () => paint(CAMPOS[1]));

form.addEventListener("submit", e => {
  e.preventDefault();
  const fallos = CAMPOS.filter(broken);
  CAMPOS.forEach(paint);

  if (fallos.length > 0) {
    summaryTitle.textContent = fallos.length === 1
      ? "One thing is still missing"
      : "There are " + fallos.length + " things still missing";
    summaryList.innerHTML = "";
    fallos.forEach(f => {
      const li = document.createElement("li");
      li.textContent = f.label + ": " + f.msg(valueOf(f));
      summaryList.appendChild(li);
    });
    summary.hidden = false;
    (fallos[0].id === "email" ? email : consent).focus();
    return;
  }

  summary.hidden = true;
  sendText.textContent = "Saving your seat";
  email.disabled = true;
  consent.disabled = true;

  window.setTimeout(confirmar, 700);
});

function confirmar() {
  const addr = email.value.trim();
  const ahora = new Date();
  const dos = n => String(n).padStart(2, "0");

  el("factMail").textContent = addr;
  el("factId").textContent = "RD-" + String(Math.floor(10000 + Math.random() * 89999));
  el("factWhen").textContent = "Tuesday, " + dos(ahora.getDate() + 4) + "/" + dos(ahora.getMonth() + 1);
  el("stampedTitle").textContent = "Check " + addr.split("@")[1] + " to confirm";
  el("stampedLead").textContent = "One confirmation mail is on its way. The first issue only leaves the workshop once you press the link inside it, and the next one lands two Tuesdays later.";

  confetti.innerHTML = "";
  for (let i = 0; i < 26; i++) {
    const chip = document.createElement("i");
    chip.style.left = (4 + (i * 3.7) % 92) + "%";
    chip.style.animationDelay = (i * 0.055).toFixed(2) + "s";
    chip.style.setProperty("--drift", ((i % 5) - 2) * 14 + "px");
    confetti.appendChild(chip);
  }

  form.hidden = true;
  stamped.hidden = false;
  stamped.focus();
}

el("again").addEventListener("click", () => {
  stamped.hidden = true;
  form.hidden = false;
  email.disabled = false;
  consent.disabled = false;
  sendText.textContent = "Put me on the list";
  email.value = "";
  consent.checked = false;
  CAMPOS.forEach(f => {
    el(f.id).closest(".field").dataset.state = "idle";
    el(f.id).setAttribute("aria-invalid", "false");
    el(f.id).setAttribute("aria-describedby", f.id + "-help");
    el(f.id + "-err").textContent = "";
  });
  summary.hidden = true;
  confetti.innerHTML = "";
  email.focus();
});
