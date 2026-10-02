function renderPerson(person) {
  return `
    <div class="suggested-person" data-username="${escapeHTML(person.username)}">
      ${avatar(person)}
      <div class="suggested-info">
        <a href="profile.html?u=${encodeURIComponent(person.username)}">${escapeHTML(person.displayName)}</a>
        <span>@${escapeHTML(person.username)}</span>
      </div>
      <button class="follow-button ${person.isFollowing ? "following" : ""}" type="button">${person.isFollowing ? "Following" : "Follow"}</button>
    </div>
  `;
}

async function loadPeople(query = "") {
  const target = document.getElementById("suggested-people");
  if (!target) return;

  try {
    const people = await api(
      `/follows/people${query ? `?q=${encodeURIComponent(query)}` : ""}`,
    );

    target.innerHTML = people.length
      ? people.map(renderPerson).join("")
      : '<p class="muted">No people found just yet.</p>';

    target
      .querySelectorAll(".follow-button")
      .forEach((button) => button.addEventListener("click", onFollow));
  } catch (_error) {
    target.innerHTML = '<p class="muted">Sign in to find your people.</p>';
  }
}

async function onFollow(event) {
  if (!getToken()) return showToast("Sign in to follow people");
  const row = event.currentTarget.closest("[data-username]");
  const following = !event.currentTarget.classList.contains("following");
  console.log("following", following);

  try {
    await api(`/follows/${encodeURIComponent(row.dataset.username)}`, {
      method: following ? "POST" : "DELETE",
    });

    event.currentTarget.classList.toggle("following", following);
    event.currentTarget.textContent = following ? "Following" : "Follow";

    const profileButton = document.querySelector(
      ".profile-action .follow-button",
    );

    if (
      profileButton &&
      row.dataset.username === new URLSearchParams(location.search).get("u")
    ) {
      profileButton.classList.toggle("following", following);
      profileButton.textContent = following ? "Following" : "Follow";
      loadProfile();
    }
  } catch (error) {
    showToast(error.message);
  }
}

function setupSearch() {
  const form = document.getElementById("people-search");
  if (!form) return;

  const input = form.querySelector("input");
  const results = document.getElementById("search-results");
  let debounce;

  input.addEventListener("input", () => {
    clearTimeout(debounce);
    if (!input.value.trim()) {
      results.hidden = true;
      return;
    }

    debounce = setTimeout(async () => {
      try {
        const people = await api(
          `/follows/people?q=${encodeURIComponent(input.value.trim())}`,
        );

        results.innerHTML =
          people
            .map(
              (person) =>
                `<a class="search-result" href="profile.html?u=${encodeURIComponent(person.username)}">${avatar(person)}<span>${escapeHTML(person.displayName)} <span class="muted">@${escapeHTML(person.username)}</span></span></a>`,
            )
            .join("") || '<p class="muted">No matches</p>';

        results.hidden = false;
      } catch (_error) {
        results.hidden = true;
      }
    }, 180);
  });
  form.addEventListener("submit", (event) => event.preventDefault());
  document.addEventListener("click", (event) => {
    if (!form.contains(event.target)) results.hidden = true;
  });
}

async function loadYouPanel() {
  const panel = document.getElementById("you-panel");
  const user = getUser();
  if (!panel || !getToken() || !user) return;

  try {
    const profile = await api(`/users/${encodeURIComponent(user.username)}`);

    panel.innerHTML = `
      <a class="you-user" href="profile.html?u=${encodeURIComponent(user.username)}">
        ${avatar(profile)}
        <div>
          <strong>${escapeHTML(profile.displayName)}</strong>
          <span>@${escapeHTML(profile.username)}</span>
        </div>
      </a>
      <div class="you-stats">
        <span>
          <strong>${profile.followers}</strong> followers
        </span>
        <span>
          <strong>${profile.following}</strong> following
        </span>
      </div>
    `;

    panel.hidden = false;
  } catch (_error) {
    panel.hidden = true;
  }
}
