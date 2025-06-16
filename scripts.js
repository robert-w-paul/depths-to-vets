
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll("[role=tab]");
  const panels = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");

      panels.forEach(panel => panel.hidden = true);
      const target = document.getElementById(tab.getAttribute("aria-controls"));
      if (target) target.hidden = false;
    });
  });
});
