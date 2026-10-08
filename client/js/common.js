const API_BASE_URL = "https://nexaclan-server.vercel.app/api";
const TOKEN_COOKIE_NAME = "nexaclan_token";
const USER_KEY = "nexaclan_user";
localStorage.removeItem(TOKEN_COOKIE_NAME);

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

const getToken = () => {
  const prefix = `${TOKEN_COOKIE_NAME}=`;
  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
};

const setToken = (token) => {
  document.cookie = `${TOKEN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=7200; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
};

const clearToken = () => {
  document.cookie = `${TOKEN_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  localStorage.removeItem(TOKEN_COOKIE_NAME);
};

function handleAuthenticationFailure(response, data) {
  if (
    (response.status === 401 || response.status === 403) &&
    /invalid|expired/i.test(data.error || data.message || "")
  ) {
    clearToken();
    localStorage.removeItem(USER_KEY);
    if (!/\/(login|register)\.html$/i.test(location.pathname))
      location.href = "login.html?session=expired";
  }
}

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
    ? `
      <img
        src="${escapeHTML(person.avatarUrl)}"
        alt=""
        loading="lazy"
      />
    `
    : escapeHTML(initials(person));

  return `
    <div class="${className}">
      ${image}
    </div>
  `;
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
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  if (getToken()) headers.Authorization = `Bearer ${getToken()}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    handleAuthenticationFailure(response, data);
    throw new Error(data.error || data.message || "Something went wrong");
  }

  return data;
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  return api("/uploads/image", { method: "POST", body: formData });
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

function showConfirm(message) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "app-confirm-dialog";

    const content = document.createElement("div");
    content.className = "app-confirm-content";
    const title = document.createElement("h2");
    title.id = "app-confirm-title";
    title.textContent = "Confirm action";
    dialog.setAttribute("aria-labelledby", title.id);
    const description = document.createElement("p");
    description.textContent = message;
    const actions = document.createElement("div");
    actions.className = "app-confirm-actions";
    const cancel = document.createElement("button");
    cancel.className = "text-button";
    cancel.type = "button";
    cancel.textContent = "Cancel";
    const confirm = document.createElement("button");
    confirm.className = "button button-primary";
    confirm.type = "button";
    confirm.textContent = "Confirm";

    cancel.addEventListener("click", () => dialog.close("cancel"));
    confirm.addEventListener("click", () => dialog.close("confirm"));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close("cancel");
    });
    dialog.addEventListener(
      "close",
      () => {
        resolve(dialog.returnValue === "confirm");
        dialog.remove();
      },
      { once: true },
    );

    actions.append(cancel, confirm);
    content.append(title, description, actions);
    dialog.append(content);
    document.body.append(dialog);
    dialog.showModal();
  });
}

function setupNavigation() {
  const nav = document.getElementById("account-nav");
  const user = getUser();
  if (!nav || !user || !getToken()) return;

  nav.innerHTML = `
    <span class="account-user">
      ${avatar(user)}
      <a href="profile.html?u=${encodeURIComponent(user.username)}">
        ${escapeHTML(user.displayName)}
      </a>
    </span>
    <button class="text-button" id="logout-button" type="button">
      Sign out
    </button>
  `;
  document.getElementById("logout-button").addEventListener("click", () => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    window.location.href = "index.html";
  });
}
