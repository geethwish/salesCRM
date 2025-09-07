# Installation & Setup Guide

This guide walks you through installing, configuring, and running the Sales CRM application locally and in production.

## Prerequisites and System Requirements

- Node.js 18.17+ (recommended: Node.js 20 LTS)
- npm 9+ or yarn/pnpm
- MongoDB 6+ (local instance or MongoDB Atlas)
- macOS, Linux, or Windows
- 2 GB RAM (minimum) for comfortable local development

Optional:

- Vercel account (for deployment)
- GitHub account (for CI/CD)

## Project Scripts (quick reference)

- Development: `npm run dev`
- Build: `npm run build`
- Start (production): `npm start`
- Lint: `npm run lint`
- Tests: `npm test`, `npm run test:watch`, `npm run test:coverage`
- Seed DB: `npm run seed`
- Swagger spec test: `npm run test:swagger`

## 1) Clone the repository

```bash
# SSH
git clone git@github.com:geethwish/salesCRM.git
# or HTTPS
git clone https://github.com/geethwish/salesCRM.git
cd sales-crm
```

## 2) Install dependencies

```bash
npm install
```

If you switch Node versions, clean and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

## 3) Environment variables

Create `.env.local` in the project root (not committed). Example:

```env
# Local MongoDB URI (recommended for dev)
MONGODB_URI=mongodb://localhost:27017/sales-crm
# Optional DB name override (defaults to "sales-crm")
MONGODB_DB_NAME=sales-crm

# JWT signing secret (CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Node environment
NODE_ENV=development

# Optional: Public API URL for the frontend if you need to reference it
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Notes:

- Database connector requires `MONGODB_URI`. If it is missing, server code will error when an API route touches the DB.
- The seeding script can run with an in-memory MongoDB for convenience (see below).

## 4) Database setup

You can use either:

- Local MongoDB (brew/apt/docker) OR
- MongoDB Atlas (copy the connection string to `MONGODB_URI`)

Start your local MongoDB (examples):

```bash
# macOS Homebrew
brew services start mongodb/brew/mongodb-community
# Linux
sudo systemctl start mongod
```

## 5) Seed the database (sample data)

There are two ways to seed:

A) CLI seeding (recommended for dev)

```bash
npm run seed
```

What it does:

- Clears existing Users and Orders
- Creates a Super Admin user
- Inserts a curated set of sample Orders
- Prints stats and credentials

B) API seeding (when the app is running)

```bash
curl -X POST http://localhost:3000/api/seed
```

About the seeding backend:

- If `MONGODB_URI` is missing OR points to `localhost:27017`, the script starts a fresh MongoDB Memory Server instance and uses it for the seeding session.
- Otherwise it uses the configured `MONGODB_URI`.

### Super admin account

- Email: `admin@crm.com`
- Password: `password`

Change these immediately in any non-local environment. Options:

- Edit `scripts/seed.ts` before running seeding in staging/production
- After logging in, change password (or update the user directly in the database)

## 6) Run the application

### Development

```bash
npm run dev
```

- App: http://localhost:3000
- API docs (Swagger UI): http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs/openapi.json
- Health check: http://localhost:3000/api/health

Default login (after seeding):

- Email: `admin@crm.com`
- Password: `password`

### Production (self-managed)

```bash
npm run build
npm start
```

Ensure environment variables are set in your process manager (e.g., systemd, Docker, PM2) or `.env` files in a secure location.

### Production (Vercel)

Set the following in your Vercel Project Settings → Environment Variables:

- `MONGODB_URI`
- `MONGODB_DB_NAME` (optional; defaults to `sales-crm`)
- `JWT_SECRET`
- `NODE_ENV=production`
- Optional: `NEXT_PUBLIC_API_URL`

`vercel.json` sets a default function timeout and region. You can adjust in that file if needed.

## 7) Authentication in development

- Login returns a JWT and also sets it as an `auth-token` cookie (HTTP-only by default). The API also accepts `Authorization: Bearer <token>` headers.
- Protected endpoints require a valid token. See the API section in Technical Documentation.

## Troubleshooting

- MongoDB connection errors

  - Ensure `MONGODB_URI` is present and reachable
  - Check your network and Mongo service status (`mongo`/`mongosh` can connect?)
  - If using Atlas, whitelist your IP and verify SRV connection string

- "MONGODB_URI environment variable is not defined"

  - Add it to `.env.local` and restart your dev server

- Port 3000 in use

  - Stop the conflicting process or run Next on a different port: `PORT=3001 npm run dev`

- Swagger UI not loading

  - Check internet access (Swagger UI assets are loaded from `unpkg.com`)
  - Some browser extensions can block inline scripts; try an incognito window or disable extensions

- TypeScript or build errors

  - Run `npx tsc --noEmit` to see type errors
  - Clear cache: remove `.next/` and re-run `npm run dev`

- Tests using MongoDB Memory Server fail to download binary

  - Your network may block downloads; configure proxy or pre-download

- bcrypt/bcryptjs issues on some environments

  - Project uses `bcryptjs` (pure JS) to avoid native build concerns; ensure no conflicting versions

- Seed data not visible in UI
  - Confirm you’re logged in as the same user that owns the seeded data (orders are user-scoped)

## Useful Endpoints

- `GET /api/health` – application and DB health
- `GET /api/docs` – Swagger UI
- `GET /api/docs/openapi.json` – OpenAPI 3 spec
- `POST /api/auth/login` – authenticate and receive token/cookie
- `GET /api/auth/me` – current user info (requires auth)
- `GET/POST /api/orders` – list/create orders (requires auth)
- `GET/PUT/DELETE /api/orders/{id}` – read/update/delete order (requires auth)
- `GET /api/orders/stats` – aggregated stats (requires auth)
- `POST /api/seed` – seed data (not for production)

## Next steps

- See `docs/documentation.md` for architecture and API details.
- Run tests: `npm test`.
- Explore the UI and try filtering/search on the dashboard.

- App:https://sales-crm-iota.vercel.app/
- API docs (Swagger UI):https://sales-crm-iota.vercel.app//api/docs
- OpenAPI JSON:https://sales-crm-iota.vercel.app//api/docs/openapi.json
- Health check:https://sales-crm-iota.vercel.app//api/health
