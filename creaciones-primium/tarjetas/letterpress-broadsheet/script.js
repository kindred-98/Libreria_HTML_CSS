const sheets = Array.from(document.querySelectorAll(".sheet"));
const pager = Array.from(document.querySelectorAll(".also__btn"));
const folioPage = document.getElementById("folioPage");
const totalPages = sheets.length;

function showSheet(id) {
  let position = 1;

  sheets.forEach(function (sheet) {
    const active = sheet.id === id;
    sheet.classList.toggle("is-on", active);
    if (active) {
      position = sheets.indexOf(sheet) + 1;
    }
  });

  pager.forEach(function (button) {
    button.setAttribute("aria-pressed", button.dataset.go === id ? "true" : "false");
  });

  if (folioPage) {
    folioPage.textContent = "Page " + position + " of " + totalPages;
  }
}

pager.forEach(function (button) {
  button.addEventListener("click", function () {
    showSheet(button.dataset.go);
  });
});
