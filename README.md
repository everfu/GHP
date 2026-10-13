# GHP

Explore public GitHub developer profiles, repositories, and recent activity without signing in.

[English](README.md) · [简体中文](docs/README_CN.md) · [繁體中文](docs/README_TW.md) · [Русский](docs/README_RU.md) · [日本語](docs/README_JP.md) · [Deutsch](docs/README_DE.md) · [Français](docs/README_FR.md) · [한국어](docs/README_KR.md)

## Features

- **Developer lookup** — Usernames, `@username`, or GitHub profile URLs; public profiles, followers, following, and join dates.
- **Repository analytics** — All public repository pages, non-fork Star / Fork totals, primary language distribution, and the top five repositories by Stars.
- **Search & filters** — Search by name, description, or language; filter forks and archives; sort by Stars, Forks, or update time. 20 results per page.
- **Recent activity** — Up to 30 public events, with an expandable list.
- **Languages & themes** — Eight languages for the UI and API docs; responsive desktop / mobile layout, system theme, and saved light / dark preference.
- **History & shortcuts** — The last ten successful lookups, clearable history, share links, and `/`, Enter, Esc shortcuts.
- **Server-side caching** — Complete results cached for ten minutes, identical concurrent requests combined, and independent loading / retries for profiles, repositories, and activity.
- **Public API** — Read-only profile, repository, and activity endpoints with built-in documentation.

Statistics use public data only. Star / Fork totals exclude fork repositories and include archived repositories; language distribution counts repositories by their primary language. Incomplete repository results display a notice and hide full-dataset summaries.

## Deploy

### Hosting Platforms

Import this repository into a platform that supports **Next.js 16 and dynamic Route Handlers**, using these settings:

| Setting               | Value                                  |
| --------------------- | -------------------------------------- |
| Node.js               | `24.x`                                 |
| Install command       | `npm ci`                               |
| Build command         | `npm run build`                        |
| Environment variables | `SITE_URL` and optional `GITHUB_TOKEN` |

The server must be able to reach `https://api.github.com`, and repository endpoints need a function execution limit of at least 60 seconds. This project includes server-side endpoints and cannot be deployed as a static export to GitHub Pages.

### Node.js Server

```sh
npm ci
npm run build
npm run start
```

The server listens on `127.0.0.1:3000` by default; use a reverse proxy for public access.

### Source Code

Use Node.js **22.12+ (22.x) or 24.x**. Node.js 24, specified in `.nvmrc`, is recommended.

```sh
git clone https://github.com/everfu/GHP.git
cd GHP
npm ci
npm run dev
```

Open <http://127.0.0.1:3000>. English URLs have no language prefix; other languages use `/zh`, `/zh-tw`, `/de`, `/ru`, `/ja`, `/fr`, or `/ko`, for example `/zh/u/everfu` and `/zh/docs`. The first visit selects a language based on browser preferences. Switching languages preserves the current lookup.

## Environment Variables

Copy the example configuration as needed and restart the server after making changes:

```sh
cp .env.example .env.local
```

| Variable       | Description                                                                 | Default behavior                                          |
| -------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| `GITHUB_TOKEN` | Optional server-side credential to increase the GitHub API rate limit       | Uses the shared rate limit of the server IP when unset    |
| `SITE_URL`     | Public site URL, including `https://`, used for absolute sharing image URLs | Uses the Vercel-provided URL or the local development URL |

`GITHUB_TOKEN` only needs permission to read public data; private repository and write permissions are unnecessary. Keep it server-side, do not add a `NEXT_PUBLIC_` prefix, and do not commit `.env.local`.

## API

See the built-in [API documentation](http://127.0.0.1:3000/docs) after starting the project.

| Endpoint                           | Data                                         |
| ---------------------------------- | -------------------------------------------- |
| `GET /api/users/{username}`        | Public user profile                          |
| `GET /api/users/{username}/repos`  | Public repositories fetched across all pages |
| `GET /api/users/{username}/events` | Up to 30 recent public events                |

```sh
curl http://127.0.0.1:3000/api/users/everfu
curl http://127.0.0.1:3000/api/users/everfu/repos
curl http://127.0.0.1:3000/api/users/everfu/events
```

Successful responses contain `{ data, fetchedAt, complete }`. If repository retrieval is interrupted after some pages have been fetched, the response has `complete: false` and an `error` alongside the available data. Errors use `{ error: { code, retryAt? } }`.

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4, Motion, Lucide React
- GitHub REST API, in-process LRU cache
- Vitest, Playwright, ESLint, Prettier

## Development & Checks

```sh
npm run check
npm run build

# Install Chromium before running browser tests for the first time
npx playwright install chromium
npm run test:e2e
```

CI checks and builds on Node.js 22 / 24, with desktop and mobile browser regression tests. Contributions are welcome through [Issues](https://github.com/everfu/GHP/issues) and Pull Requests.

## Acknowledgements

Thanks to the [next-whois](https://github.com/zmh-program/next-whois) project.

## License

[Apache License 2.0](LICENSE). See [public/fonts/LICENSE.txt](public/fonts/LICENSE.txt) for font licenses.
