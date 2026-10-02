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
  if (!(await showConfirm("Delete this post?"))) return;
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
