# NexaClan

A small social platform built with static HTML, CSS, and JavaScript on the client, and a modular Express, MongoDB, and Mongoose API on the server.

## Project layout

- `client/` contains the feed, profile, sign-in, and registration pages, plus shared styles and browser-side API interactions.
- `server/src/app.js` mounts API modules; `server/src/server.js` connects MongoDB and starts Express.
- `server/src/app/modules/` separates authentication, users, posts, comments, and follows. Each feature owns its routes, controller, and service; database models are kept beside their feature.

## Run locally

1. Start MongoDB locally or provide a MongoDB connection string.
2. In `server/`, copy `.env.example` to `.env`, set `MONGO_URI`, a private `JWT_SECRET`, and the Cloudinary credentials (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`), then run `pnpm install` and `pnpm dev`.
3. Serve the `client/` directory with any static web server and open `index.html`. The API defaults to `http://localhost:5001/api`.

## API outline

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/users/:username`, `GET /api/users/me`, `PATCH /api/users/me`
- `GET /api/posts`, `POST /api/posts`, `POST /api/posts/:id/like`, `DELETE /api/posts/:id`
- `GET /api/comments/post/:postId`, `POST /api/comments/post/:postId`
- `GET /api/follows/people`, `POST /api/follows/:username`, `DELETE /api/follows/:username`
- `POST /api/uploads/image` (authenticated Cloudinary image upload)

Protected endpoints require a bearer token. Authenticated feeds show posts from the signed-in user and followed accounts; public feeds show recent posts from everyone.

The feed composer can upload a JPG, PNG, WEBP, or GIF (up to 5 MB) to Cloudinary and attach the returned image URL to a post.
