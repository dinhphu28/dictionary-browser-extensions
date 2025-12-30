function wireMoreLessToggles(root) {
  root.querySelectorAll(".more-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn.previousElementSibling;
      const expanded = body.getAttribute("data-expanded") === "true";

      if (expanded) {
        body.classList.add("clamp");
        body.setAttribute("data-expanded", "false");
        btn.textContent = "More";
      } else {
        body.classList.remove("clamp");
        body.setAttribute("data-expanded", "true");
        btn.textContent = "Less";
      }
    });
  });
}
