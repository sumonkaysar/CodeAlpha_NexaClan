# CodeAlpha NexaClan

NexaClan is a small social platform for account profiles, a public/following feed, posts, likes, comments, and following other members. The client is static HTML/CSS/JavaScript and the API is built with Express, MongoDB, and Mongoose.

## Links

- **Client:** Client deployment URL is not configured in this repository. Run locally using [`client/README.md`](client/README.md).
- **Server/API:** [https://nexaclan-server.vercel.app](https://nexaclan-server.vercel.app)
- **GitHub:** [sumonkaysar/CodeAlpha_NexaClan](https://github.com/sumonkaysar/CodeAlpha_NexaClan)

## Features

- Register and sign in; browse public profiles and update your own profile.
- Create, browse, like, and delete posts; add and read comments.
- Discover members and follow or unfollow accounts.
- Optional Cloudinary image uploads for posts and avatars.

## Technology

- **Client:** HTML, CSS, vanilla JavaScript
- **Server:** Node.js, Express, MongoDB/Mongoose, JWT
- **Media:** Multer and Cloudinary

## Project layout

```text
client/                  Feed, profile, login, and registration pages
  css/                   Site and responsive styles
  js/                    Feed, people, profile, and shared behavior
server/
  src/server.js          Database connection and Express listener
  src/app.js             API middleware and route mounts
  src/app/modules/       Auth, users, posts, comments, follows, uploads
```

Use [`server/README.md`](server/README.md) for setup and [`client/README.md`](client/README.md) for the API reference.
