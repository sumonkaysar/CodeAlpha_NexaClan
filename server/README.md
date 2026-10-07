# NexaClan Server

The NexaClan backend provides authentication and REST APIs for member profiles and social activity. It uses MongoDB/Mongoose for persistence, JWT bearer tokens for protected requests, and Cloudinary for image storage.

## Links

- **Live API:** [https://nexaclan-server.vercel.app](https://nexaclan-server.vercel.app)
- **Client:** Client deployment URL is not configured; see [`../client/README.md`](../client/README.md) to run it locally.
- **GitHub:** [sumonkaysar/CodeAlpha_NexaClan](https://github.com/sumonkaysar/CodeAlpha_NexaClan)

## Features and stack

- Feature modules for auth, users, posts, comments, follows, and uploads.
- Password hashing, JWT authentication, optional auth for public feeds, and profile access controls.
- MongoDB/Mongoose, Express, Node.js, `jsonwebtoken`, `bcryptjs`, Multer, and Cloudinary.

## Get the project

```sh
git clone https://github.com/sumonkaysar/CodeAlpha_NexaClan.git
cd CodeAlpha_NexaClan/server
```

## Install dependencies

Run one option from `server/`:

```sh
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

## Configure and run on port 5000

Copy `.env.example` to `.env` in this directory. Make sure the MongoDB URI is reachable and set a private JWT secret. Cloudinary credentials are required to use image uploads. Set `PORT=5000` (the server's fallback port is 5001).

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/nexaclan
JWT_SECRET=replace-with-a-long-random-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=nexaclan
```

With MongoDB running, use one development command:

```sh
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun run dev
```

The local API is `http://localhost:5000`, with routes under `/api`. For the non-watch process use `npm start`, `yarn start`, `pnpm start`, or `bun run start`.

## API reference

Base URL: `http://localhost:5000/api` locally or `https://nexaclan-server.vercel.app/api` deployed. JSON requests use `Content-Type: application/json`; authenticated routes require `Authorization: Bearer <token>`. The API returns JSON errors with a `message` or `error` field depending on middleware/route.

| Method | Path | Access | Request body and response |
|---|---|---|---|
| `GET` | `/` | Public, outside `/api` | Health response `{ "message": "NexaClan API is running" }`. |
| `POST` | `/auth/register` | Public | `{ "username": "sam", "displayName": "Sam", "email": "sam@example.com", "password": "at-least-8-characters" }`; success `201` `{ "message": "User registered successfully" }`. `displayName` is optional and defaults to the username. |
| `POST` | `/auth/login` | Public | `{ "email": "sam@example.com", "password": "..." }`; returns `{ "token": "...", "username": "sam", "role": "user" }`. |
| `GET` | `/users/me` | Authenticated | Returns the signed-in user's profile fields. |
| `PATCH` | `/users/me` | Authenticated | Any of `{ "displayName": "Sam", "bio": "Hello", "avatarUrl": "https://..." }`; returns the updated profile. |
| `GET` | `/users/:username` | Public; token optional | Returns profile details, `followers`, `following`, `isFollowing`, and `isMe`. |
| `GET` | `/posts` | Public; token optional | Returns up to 40 recent posts. `?username=sam` filters by author; a signed-in request without that filter returns the user's and followed accounts' posts. Results include `likedByMe` and a numeric likes count. |
| `POST` | `/posts` | Authenticated | `{ "text": "Hello", "imageUrl": "https://..." }`; text and/or image URL is required; success `201` with the created post. |
| `POST` | `/posts/:id/like` | Authenticated | No body; toggles the like and returns `{ "liked": true, "likes": 1 }`. |
| `DELETE` | `/posts/:id` | Authenticated, author only | No body; success `204 No Content`. |
| `GET` | `/comments/post/:postId` | Public | Returns comments for the post, oldest first, with public author details. |
| `POST` | `/comments/post/:postId` | Authenticated | `{ "text": "Nice post!" }`; returns the created comment with author details (`201`). |
| `GET` | `/follows/people?q=sam` | Public; token optional | Returns up to eight matching people with `isFollowing`. |
| `POST` | `/follows/:username` | Authenticated | No body; returns `{ "following": true }`. |
| `DELETE` | `/follows/:username` | Authenticated | No body; returns `{ "following": false }`. |
| `POST` | `/uploads/image` | Authenticated | Multipart form-data field `image`, JPG/PNG/WEBP/GIF up to 5 MB; returns `{ "message": "Image uploaded successfully", "url": "https://...", "publicId": "..." }` (`201`). |

Registration requires a 3–24 character username containing letters, numbers, and underscores; passwords must be at least eight characters. Posts are limited to 2,000 characters and comments to 500. Post/profile image URLs must use HTTP or HTTPS.

No Socket.IO/WebSocket service is used. See [`../client/README.md`](../client/README.md) for browser setup.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | HTTP listener port; explicitly set to `5000` for local instructions (fallback is `5001`). |
| `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Private key used to sign JWTs (tokens expire after seven days). |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary account credentials for image uploads. |
| `CLOUDINARY_FOLDER` | Destination folder for images (defaults to `nexaclan`). |

## Errors and operational notes

Invalid input is reported with a 4xx response; missing records use 404, and duplicate accounts are rejected. Keep secrets in the local environment rather than committing them. Ensure MongoDB is available before starting the server.

```text
src/
  server.js                 Connects to MongoDB and listens for HTTP
  app.js                    Express middleware and API mounts
  app/
    config/                 Database and Cloudinary
    middlewares/            Authentication, optional auth, uploads, errors
    modules/                Auth, users, posts, comments, follows, uploads
```
