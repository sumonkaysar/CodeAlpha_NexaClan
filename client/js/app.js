document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  setupSearch();
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
  }
  if (document.body.dataset.page === "profile") await loadProfile();
});
