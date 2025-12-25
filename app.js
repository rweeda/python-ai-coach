const iframe = document.getElementById("basthon");
const status = document.getElementById("status");

iframe.addEventListener("load", () => {
  status.textContent = "Basthon loaded ✔";
});
