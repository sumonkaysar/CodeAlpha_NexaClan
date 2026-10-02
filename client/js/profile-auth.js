async function loadProfile() {
  const container = document.getElementById("profile-content");
  if (!container) return;

  const username = new URLSearchParams(location.search).get("u");

  if (!username) {
    container.innerHTML = '<p class="empty-state">No profile selected.</p>';
    return;
  }

  try {
    const profile = await api(`/users/${encodeURIComponent(username)}`);

    document.title = `${profile.displayName} (@${profile.username}) | NexaClan`;

    container.innerHTML = `
      <div class="profile-card">
        <div class="profile-cover"></div>
        <div class="profile-main">
          ${avatar(profile, "avatar profile-avatar")}
          <div class="profile-title">
            <h1>${escapeHTML(profile.displayName)}</h1>
            <p>@${escapeHTML(profile.username)}</p>
          </div>
          ${
            profile.isMe
              ? `<a class="button button-primary profile-action" href="login.html?edit=1">Edit profile ↗</a>`
              : getToken()
                ? `<button class="button button-primary profile-action follow-button ${profile.isFollowing ? "following" : ""}" data-username="${escapeHTML(profile.username)}" type="button">${profile.isFollowing ? "Following" : "Follow"}</button>`
                : ""
          }
        </div>
        <p class="profile-bio">${escapeHTML(profile.bio || "A NexaClan member, finding their people.")}</p>
        <div class="profile-stats">
          <span>
            <strong>${profile.followers}</strong> followers
          </span>
          <span>
            <strong>${profile.following}</strong> following</span>
          <span>Joined ${new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        </div>
      </div>
    `;

    const followButton = container.querySelector(
      ".profile-action.follow-button",
    );

    if (followButton) followButton.addEventListener("click", onFollow);

    await loadPosts({ username: profile.username });
  } catch (error) {
    container.innerHTML = `<p class="empty-state">${escapeHTML(error.message)}</p>`;
    const posts = document.getElementById("post-list");
    if (posts) posts.innerHTML = "";
  }
}

async function setupAuthForm() {
  const form = document.getElementById("auth-form");
  if (!form) return;

  const isRegister = document.body.dataset.page === "register";
  const errorElement = document.getElementById("form-error");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = Object.fromEntries(new FormData(form));

    if (isRegister) payload.username = payload.username.trim().toLowerCase();

    const button = form.querySelector("button[type=submit]");

    button.disabled = true;
    errorElement.textContent = "";

    try {
      const result = await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));

      window.location.href = "index.html";
    } catch (error) {
      errorElement.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  });
}

async function setupProfileEdit() {
  if (new URLSearchParams(location.search).get("edit") !== "1") return;

  const user = getUser();
  if (!user || document.body.dataset.page !== "login") return;

  try {
    const profile = await api("/users/me");
    const edit = document.createElement("section");

    edit.className = "auth-form-wrap";
    edit.innerHTML = `
      <p class="eyebrow">YOUR PROFILE</p>
      <h2>A little about you.</h2>
      <form class="auth-form" id="edit-profile-form">
        <label>Display name<input name="displayName" value="${escapeHTML(profile.displayName)}" maxlength="48" required /></label>
        <label>Bio<textarea name="bio" maxlength="180" rows="3">${escapeHTML(profile.bio || "")}</textarea></label>
        <label>Avatar image URL<input name="avatarUrl" type="url" value="${escapeHTML(profile.avatarUrl || "")}" /></label>
        <p class="form-error" id="edit-error"></p>
        <button class="button button-primary auth-submit" type="submit">Save profile ↗</button>
      </form>
    `;

    document.querySelector(".auth-layout").replaceChildren(edit);

    edit.querySelector("form").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const updated = await api("/users/me", {
          method: "PATCH",
          body: JSON.stringify(
            Object.fromEntries(new FormData(event.currentTarget)),
          ),
        });

        localStorage.setItem(USER_KEY, JSON.stringify({ ...user, ...updated }));
        window.location.href = `profile.html?u=${encodeURIComponent(user.username)}`;
      } catch (error) {
        document.getElementById("edit-error").textContent = error.message;
      }
    });
  } catch (error) {
    showToast(error.message);
  }
}
