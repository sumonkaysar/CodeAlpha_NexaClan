# NexaClan Client

NexaClan's browser client is a collection of static HTML pages styled with CSS and powered by vanilla JavaScript. It calls the Express API directly; no frontend package installation or build is required.

## Pages and features

- `index.html`: social feed
- `profile.html`: member profiles
- `login.html`, `register.html`: authentication
- `js/`: feed, people discovery, profile/auth, and shared API helpers
- `css/`: site, account, and responsive layouts

## Run locally

1. Start the API following [`../server/README.md`](../server/README.md).
2. The API URL is set in `js/common.js` to `https://nexaclan-server.vercel.app/api`. For local development change it to `http://localhost:5000/api`.
3. From this directory, run `python -m http.server 8080`, then open `http://localhost:8080`.

## Links

- **Live client:** No client deployment URL is configured in the repository.
- **Live API:** [https://nexaclan-server.vercel.app](https://nexaclan-server.vercel.app)
- **GitHub:** [sumonkaysar/CodeAlpha_NexaClan](https://github.com/sumonkaysar/CodeAlpha_NexaClan)

## API reference

Local base URL: `http://localhost:5000/api`. Current hosted base URL: `https://nexaclan-server.vercel.app/api`. Use JSON for request bodies. For protected routes send `Authorization: Bearer <token>` from login. Errors are JSON with a `message` or `error` property depending on the route.

| Method | Path | Access | Request / result |
|---|---|---|---|
| `POST` | `/auth/register` | Public | `{ "username": "sam", "email": "sam@example.com", "password": "..." }`; returns `{ "message": "User registered successfully" }`. |
| `POST` | `/auth/login` | Public | `{ "email": "sam@example.com", "password": "..." }`; returns `{ "token": "...", "username": "...", "role": "..." }`. |
| `GET` | `/users/:username` | Public; token optional | Returns public profile details, follower/following counts, `isFollowing`, and `isMe`. |
| `GET` | `/users/me` | Authenticated | Returns the current user's profile. |
| `PATCH` | `/users/me` | Authenticated | JSON fields may include `displayName`, `bio`, and `avatarUrl`; returns the updated profile. |
| `GET` | `/posts` | Public; token optional | Returns up to 40 recent posts. Optional `?username=name` filters by author; an authenticated request without that filter returns the user's and followed accounts' feed. Each result includes `likedByMe`. |
| `POST` | `/posts` | Authenticated | `{ "text": "Hello", "imageUrl": "https://..." }`; text or image URL is required; returns the created post. |
| `POST` | `/posts/:id/like` | Authenticated | No body; toggles the current user's like and returns `{ "liked": true, "likes": 1 }`. |
| `DELETE` | `/posts/:id` | Authenticated, author only | No body; success is `204 No Content`. |
| `GET` | `/comments/post/:postId` | Public | Returns comments oldest first. |
| `POST` | `/comments/post/:postId` | Authenticated | `{ "text": "Nice post!" }`; returns the created comment. |
| `GET` | `/follows/people?q=term` | Public; token optional | Returns up to eight matching members with an `isFollowing` field. |
| `POST` | `/follows/:username` | Authenticated | No body; returns `{ "following": true }`. |
| `DELETE` | `/follows/:username` | Authenticated | No body; returns `{ "following": false }`. |
| `POST` | `/uploads/image` | Authenticated | Multipart file upload; returns `{ "message": "Image uploaded successfully", "url": "...", "publicId": "..." }`. |

Comments must contain 1–500 characters; post text is limited to 2,000 characters. An image URL, when supplied, must begin with `http://` or `https://`. NexaClan does not use WebSockets.
