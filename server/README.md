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

## API and structure

Full request examples and the endpoint table are in [`../client/README.md`](../client/README.md). No Socket.IO/WebSocket service is used.

```text
src/
  server.js                 Connects to MongoDB and listens for HTTP
  app.js                    Express middleware and API mounts
  app/
    config/                 Database and Cloudinary
    middlewares/            Authentication, optional auth, uploads, errors
    modules/                Auth, users, posts, comments, follows, uploads
```
