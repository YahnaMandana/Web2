const intro = document.getElementById("intro");

window.addEventListener("load", () => {
  if (!intro) {
    document.body.classList.add("loaded");
    return;
  }

  setTimeout(() => {
    document.body.classList.add("loaded");
    intro.hidden = true;
  }, 2500);
});
