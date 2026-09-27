const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "nexaclan_token";
const USER_KEY = "nexaclan_user";

const escapeHTML = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const getToken = () => localStorage.getItem(TOKEN_KEY);
const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch (_error) {
    return null;
  }
};
const initials = (person = {}) =>
  (person.displayName || person.username || "N")
    .trim()
    .slice(0, 1)
    .toUpperCase();
const avatar = (person = {}, className = "avatar") => {
  const image = person.avatarUrl
    ? `<img src="${escapeHTML(person.avatarUrl)}" alt="" loading="lazy" />`
    : escapeHTML(initials(person));
  return `<div class="${className}">${image}</div>`;
};
const dateLabel = (value) => {
  const date = new Date(value);
  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || data.message || "Something went wrong");
  return data;
}

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 2600);
}

function setupNavigation() {
  const nav = document.getElementById("account-nav");
  const user = getUser();
  if (!nav || !user || !getToken()) return;
  nav.innerHTML = `<span class="account-user">${avatar(user)}<a href="profile.html?u=${encodeURIComponent(user.username)}">${escapeHTML(user.displayName)}</a></span><button class="text-button" id="logout-button" type="button">Sign out</button>`;
  document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
  });
}

function renderPost(post) {
  const author = post.author || {};
  const user = getUser();
  const isOwner = user && user.username === author.username;
  const image = post.imageUrl
    ? `<img class="post-image" src="${escapeHTML(post.imageUrl)}" alt="Image shared by ${escapeHTML(author.displayName || author.username)}" loading="lazy" />`
    : "";
  return `<article class="post-card" data-post-id="${escapeHTML(post._id)}">
    <header class="post-author">${avatar(author)}<div class="author-name"><a href="profile.html?u=${encodeURIComponent(author.username || "")}">${escapeHTML(author.displayName || author.username || "NexaClan member")}</a><span>@${escapeHTML(author.username || "member")} · ${dateLabel(post.createdAt)}</span></div>${isOwner ? `<button class="text-button post-delete" type="button" aria-label="Delete post">Delete</button>` : ""}</header>
    ${post.text ? `<p class="post-copy">${escapeHTML(post.text)}</p>` : ""}${image}
    <div class="post-meta" data-comment-count="${post.commentCount || 0}">${post.likes || 0} ${post.likes === 1 ? "person" : "people"} found this worth a moment · ${post.commentCount || 0} comments</div>
    <div class="post-actions"><button class="action-button like-button ${post.likedByMe ? "liked" : ""}" type="button" aria-pressed="${Boolean(post.likedByMe)}"><span aria-hidden="true">${post.likedByMe ? "♥" : "♡"}</span> Like</button><button class="action-button comments-toggle" type="button"><span aria-hidden="true">◌</span> Comment</button></div>
    <div class="comment-area" hidden><div class="comment-list"></div>${getToken() ? `<form class="comment-form"><input name="text" maxlength="500" placeholder="Add to the conversation..." aria-label="Write a comment" required /><button type="submit">Reply ↗</button></form>` : `<p class="muted">Sign in to join the conversation.</p>`}</div>
  </article>`;
}

async function loadPosts(options = {}) {
  const container = document.getElementById("post-list");
  if (!container) return;
  container.innerHTML = '<p class="loading-state">Gathering the latest...</p>';
  const status = document.getElementById("feed-status");
  try {
    const query = options.username
      ? `?username=${encodeURIComponent(options.username)}`
      : "";
    const posts = await api(`/posts${query}`);
    if (!posts.length) {
      container.innerHTML = `<p class="empty-state">${options.username ? "No posts here yet." : getToken() ? "Your feed is quiet. Follow someone or share the first thought." : "It’s quiet here so far. Sign in to share the first thought."}</p>`;
    } else {
      container.innerHTML = posts.map(renderPost).join("");
      container
        .querySelectorAll(".like-button")
        .forEach((button) => button.addEventListener("click", onLike));
      container
        .querySelectorAll(".comments-toggle")
        .forEach((button) =>
          button.addEventListener("click", onToggleComments),
        );
      container
        .querySelectorAll(".comment-form")
        .forEach((form) => form.addEventListener("submit", onComment));
      container
        .querySelectorAll(".post-delete")
        .forEach((button) => button.addEventListener("click", onDeletePost));
    }
    if (status)
      status.textContent = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;
  } catch (error) {
    container.innerHTML = `<p class="empty-state">Couldn’t connect to NexaClan. Start the API server and try again.</p>`;
    if (status) status.textContent = "Connection unavailable";
  }
}

async function onLike(event) {
  if (!getToken()) return showToast("Sign in to like a post");
  const card = event.currentTarget.closest(".post-card");
  try {
    const result = await api(`/posts/${card.dataset.postId}/like`, {
      method: "POST",
    });
    event.currentTarget.classList.toggle("liked", result.liked);
    event.currentTarget.setAttribute("aria-pressed", String(result.liked));
    event.currentTarget.querySelector("span").textContent = result.liked
      ? "♥"
      : "♡";
    const meta = card.querySelector(".post-meta");
    const commentCount = Number(meta.dataset.commentCount);
    meta.textContent = `${result.likes} ${result.likes === 1 ? "person" : "people"} found this worth a moment · ${commentCount} ${commentCount === 1 ? "comment" : "comments"}`;
  } catch (error) {
    showToast(error.message);
  }
}

async function onToggleComments(event) {
  const card = event.currentTarget.closest(".post-card");
  const area = card.querySelector(".comment-area");
  area.hidden = !area.hidden;
  if (area.hidden || area.dataset.loaded) return;
  try {
    const comments = await api(`/comments/post/${card.dataset.postId}`);
    area.querySelector(".comment-list").innerHTML =
      comments
        .map(
          (comment) =>
            `<div class="comment">${avatar(comment.author, "avatar")}<div class="comment-body"><strong>${escapeHTML(comment.author.displayName)}</strong>${escapeHTML(comment.text)}</div></div>`,
        )
        .join("") || '<p class="muted">Be the first to reply.</p>';
    area.dataset.loaded = "true";
  } catch (error) {
    showToast(error.message);
  }
}

async function onComment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const card = form.closest(".post-card");
  const text = new FormData(form).get("text");
  try {
    const comment = await api(`/comments/post/${card.dataset.postId}`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
    const list = card.querySelector(".comment-list");
    const empty = list.querySelector(".muted");
    if (empty) empty.remove();
    list.insertAdjacentHTML(
      "beforeend",
      `<div class="comment">${avatar(comment.author, "avatar")}<div class="comment-body"><strong>${escapeHTML(comment.author.displayName)}</strong>${escapeHTML(comment.text)}</div></div>`,
    );
    const meta = card.querySelector(".post-meta");
    const commentCount = Number(meta.dataset.commentCount) + 1;
    meta.dataset.commentCount = String(commentCount);
    const likes = Number(meta.textContent.match(/^\d+/)?.[0] || 0);
    meta.textContent = `${likes} ${likes === 1 ? "person" : "people"} found this worth a moment · ${commentCount} ${commentCount === 1 ? "comment" : "comments"}`;
    form.reset();
  } catch (error) {
    showToast(error.message);
  }
}

async function onDeletePost(event) {
  const card = event.currentTarget.closest(".post-card");
  if (!window.confirm("Delete this post?")) return;
  try {
    await api(`/posts/${card.dataset.postId}`, { method: "DELETE" });
    card.remove();
    showToast("Post deleted");
  } catch (error) {
    showToast(error.message);
  }
}

async function setupComposer() {
  const composer = document.getElementById("composer");
  const prompt = document.getElementById("signed-out-prompt");
  if (!composer || !prompt) return;
  if (!getToken()) {
    prompt.hidden = false;
    return;
  }
  composer.hidden = false;
  const user = getUser();
  const currentAvatar = document.getElementById("composer-avatar");
  if (currentAvatar && user?.avatarUrl)
    currentAvatar.innerHTML = `<img src="${escapeHTML(user.avatarUrl)}" alt="" />`;
  const text = document.getElementById("post-text");
  text.addEventListener("input", () => {
    document.getElementById("char-count").textContent =
      `${text.value.length} / 2000`;
  });
  document
    .getElementById("publish-post")
    .addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      try {
        await api("/posts", {
          method: "POST",
          body: JSON.stringify({
            text: text.value,
            imageUrl: document.getElementById("post-image").value,
          }),
        });
        text.value = "";
        document.getElementById("post-image").value = "";
        document.getElementById("char-count").textContent = "0 / 2000";
        await loadPosts();
        showToast("Your post is out there");
      } catch (error) {
        showToast(error.message);
      } finally {
        button.disabled = false;
      }
    });
}

function renderPerson(person) {
  return `<div class="suggested-person" data-username="${escapeHTML(person.username)}">${avatar(person)}<div class="suggested-info"><a href="profile.html?u=${encodeURIComponent(person.username)}">${escapeHTML(person.displayName)}</a><span>@${escapeHTML(person.username)}</span></div><button class="follow-button ${person.isFollowing ? "following" : ""}" type="button">${person.isFollowing ? "Following" : "Follow"}</button></div>`;
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
    panel.innerHTML = `<a class="you-user" href="profile.html?u=${encodeURIComponent(user.username)}">${avatar(profile)}<div><strong>${escapeHTML(profile.displayName)}</strong><span>@${escapeHTML(profile.username)}</span></div></a><div class="you-stats"><span><strong>${profile.followers}</strong> followers</span><span><strong>${profile.following}</strong> following</span></div>`;
    panel.hidden = false;
  } catch (_error) {
    panel.hidden = true;
  }
}

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
    container.innerHTML = `<div class="profile-card"><div class="profile-cover"></div><div class="profile-main">${avatar(profile, "avatar profile-avatar")}<div class="profile-title"><h1>${escapeHTML(profile.displayName)}</h1><p>@${escapeHTML(profile.username)}</p></div>${profile.isMe ? `<a class="button button-primary profile-action" href="login.html?edit=1">Edit profile ↗</a>` : getToken() ? `<button class="button button-primary profile-action follow-button ${profile.isFollowing ? "following" : ""}" data-username="${escapeHTML(profile.username)}" type="button">${profile.isFollowing ? "Following" : "Follow"}</button>` : ""}</div><p class="profile-bio">${escapeHTML(profile.bio || "A NexaClan member, finding their people.")}</p><div class="profile-stats"><span><strong>${profile.followers}</strong> followers</span><span><strong>${profile.following}</strong> following</span><span>Joined ${new Date(profile.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span></div></div>`;
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
    edit.innerHTML = `<p class="eyebrow">YOUR PROFILE</p><h2>A little about you.</h2><form class="auth-form" id="edit-profile-form"><label>Display name<input name="displayName" value="${escapeHTML(profile.displayName)}" maxlength="48" required /></label><label>Bio<textarea name="bio" maxlength="180" rows="3">${escapeHTML(profile.bio || "")}</textarea></label><label>Avatar image URL<input name="avatarUrl" type="url" value="${escapeHTML(profile.avatarUrl || "")}" /></label><p class="form-error" id="edit-error"></p><button class="button button-primary auth-submit" type="submit">Save profile ↗</button></form>`;
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
