# AutoNateAI Communities Frontend Template

This repository provides a lightweight Bootstrap + jQuery starter template for building the AutoNateAI community management experience. The layout is intentionally modular so you can plug in reusable components and connect to your authentication + data services with minimal setup.

## Pages

The template ships with the following HTML entry points:

- `index.html` – Public landing page
- `feed.html` – Community feed placeholder
- `marketplace.html` – Marketplace placeholder
- `blog.html` – Blog placeholder
- `login.html` – Authentication entry that stores a JWT token to `localStorage`
- `signup.html` – Account creation entry
- `dashboard.html` – Authenticated dashboard with sign-out support
- `profile.html` – Authenticated profile placeholder

Unauthenticated pages automatically load a shared navigation component (`components/unauth-nav.html`), while authenticated pages use the shared auth navigation (`components/auth-nav.html`).

## Authentication flow

- Configure the API host once in [`assets/js/config.js`](assets/js/config.js). By default, the template looks at `window.APP_ENV`, `localStorage.appEnv`, or falls back to the `development` configuration. Update the URLs for your environments as needed.
- Both `login.html` and `signup.html` submit JSON payloads to `/auth/login` and `/auth/signup` using the configured backend host.
- Successful logins expect a JSON payload that includes a `token`. The template stores this token in `localStorage` under `authToken` and redirects to `dashboard.html`.
- Protected pages (dashboard, profile, etc.) set `window.pageConfig.requireAuth = true`. The shared guard (`assets/js/auth-guard.js`) redirects unauthenticated visitors to the login page and optionally redirects authenticated users away from auth pages.
- The dashboard navbar includes a sign-out button that clears the stored token and routes back to the login screen.

## Deployment

A GitHub Actions workflow (`.github/workflows/deploy.yml`) publishes the site to GitHub Pages on every push to the `main` branch. It builds the static bundle and pushes it to the `gh-pages` branch for hosting.

## Local development

Because the project is plain HTML/CSS/JS, you can open any file directly in your browser or serve the repository through your favorite static file server.

To switch environments at runtime, call `AppConfig.setEnvironment('production')` (or any configured environment) from the browser console. The choice persists in `localStorage`.
