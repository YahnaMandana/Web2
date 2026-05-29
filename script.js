const intro = document.getElementById("intro");

window.addEventListener("load", () => {
  setTimeout(() => {
    document.body.classList.add("loaded");
    if (intro) {
      intro.setAttribute("aria-hidden", "true");
    }
  }, 2500);
});
