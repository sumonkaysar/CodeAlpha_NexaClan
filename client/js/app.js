document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupSearch();
  setupFeedNavigation();
  await setupAuthForm();
  await setupProfileEdit();
  if (document.body.dataset.page === "feed") {
    await Promise.all([
      setupComposer(),
      loadPosts(),
      loadPeople(),
      loadYouPanel(),
    ]);
    const peopleSearch = document.getElementById("search-input");
    if (peopleSearch)
      peopleSearch.addEventListener("change", () =>
        loadPeople(peopleSearch.value.trim()),
      );
    const directorySearch = document.getElementById("directory-search");
    if (directorySearch) {
      let debounce;
      directorySearch.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(
          () => loadPeople(directorySearch.value.trim()),
          180,
        );
      });
    }
  }
  if (document.body.dataset.page === "profile") await loadProfile();
});

function setupFeedNavigation() {
  if (document.body.dataset.page !== "feed") return;

  const layout = document.querySelector(".layout");
  const menuToggle = document.getElementById("menu-toggle");
  const topbar = document.querySelector(".topbar");

  const closeMenu = () => {
    topbar.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    topbar.classList.toggle("menu-open", !isOpen);
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu",
    );
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const showPeople = button.dataset.view === "people";
      document.getElementById("feed-view").hidden = showPeople;
      document.getElementById("people-view").hidden = !showPeople;
      document.getElementById("people").hidden = showPeople;
      layout.classList.toggle("is-people-view", showPeople);

      document.querySelectorAll("[data-view]").forEach((viewButton) => {
        const isActive = viewButton.dataset.view === button.dataset.view;
        viewButton.classList.toggle("active", isActive);
        viewButton.setAttribute("aria-pressed", String(isActive));
        if (isActive) viewButton.setAttribute("aria-current", "page");
        else viewButton.removeAttribute("aria-current");
      });

      closeMenu();
      if (showPeople) {
        loadPeople(document.getElementById("directory-search").value.trim());
        document.getElementById("directory-search").focus();
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!topbar.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}
