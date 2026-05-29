const intro = document.getElementById("intro");

window.addEventListener("load", () => {
  if (!intro) {
    document.body.classList.add("loaded");
    return;
  }

  setTimeout(() => {
    document.body.classList.add("loaded");
    intro.setAttribute("aria-hidden", "true");
    intro.hidden = true;
  }, 2500);
});
