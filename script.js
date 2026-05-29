const INTRO_DURATION = 2500;
const intro = document.getElementById("intro");

window.addEventListener("load", () => {
  if (!intro) {
    document.body.classList.add("loaded");
    return;
  }

  setTimeout(() => {
    document.body.classList.add("loaded");
    intro.remove();
  }, INTRO_DURATION);
});
