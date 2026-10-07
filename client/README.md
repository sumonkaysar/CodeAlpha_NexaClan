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

## Configuration

The API base URL is declared as `API_BASE_URL` in `js/common.js`. Point it to the deployed API or your local API before loading the page. There is no frontend build, package manager, or framework setup.

## Links

- **Live client:** No client deployment URL is configured in the repository.
- **Live API:** [https://nexaclan-server.vercel.app](https://nexaclan-server.vercel.app)
- **GitHub:** [sumonkaysar/CodeAlpha_NexaClan](https://github.com/sumonkaysar/CodeAlpha_NexaClan)

## Backend integration

The browser app uses the NexaClan REST API for login, profiles, feeds, posts, comments, follows, and image uploads. The server README contains the complete endpoint list, example request bodies, response shapes, and bearer-token requirements: [`../server/README.md`](../server/README.md).

No WebSocket connection is used. Public feed/profile requests can work without signing in; creating posts, commenting, liking, following, profile updates, and image uploads need authentication.

## Troubleshooting

- If requests go to the wrong server, update `API_BASE_URL` in `js/common.js` and reload the page.
- For CORS failures, confirm the static client is being served over HTTP and the backend's CORS policy allows that origin.
- Image upload depends on valid Cloudinary server configuration; profile and feed views can otherwise use the API without an upload.

## Browser support

Use a modern browser with JavaScript and Fetch API support enabled. External fonts and uploaded images need network access.
