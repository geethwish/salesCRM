# Technical Documentation

This document describes the architecture, technologies, APIs, database schema, and deployment considerations for the Sales CRM application.

## Project Overview

Sales CRM is a full-stack application built on Next.js (App Router) with a MongoDB backend. It provides authentication, CRUD for orders, analytics, and a modern component-driven UI with form validation.

Key capabilities:

- Auth (register, login, logout, session cookie, JWT)
- Orders CRUD and search/filter/pagination
- User-scoped data isolation (each user's data is private)
- Analytics endpoints (stats by category/source/location)
- API documentation via Swagger UI/OpenAPI

## High-level Architecture

- Next.js App Router for pages and API routes under `app/api`
- MongoDB/Mongoose for persistence
- JWT for stateless auth; cookie for client auth persistence
- Service layer encapsulating DB logic
- Validation layer using Zod and centralized utilities
- Middleware for CORS, security headers, logging, and rate limiting

```
Request → app/api/.../route.ts → withApiMiddleware → lib/services/* → lib/models/* (Mongoose) → MongoDB
                              ↘ auth utils (token) ↘ validation (zod) ↘ constants
```

## Folder Structure

- `app/` – Next.js app directory
  - `app/api/` – API routes (auth, orders, docs, health, seed)
  - `app/(pages)/...` – UI pages (dashboard, auth)
- `components/` – UI components (Shadcn/Radix-based and app-specific)
  - `components/ui/` – Button, Input, Label, Checkbox, Form helpers, etc.
- `lib/` – application library code
  - `lib/constants/` – shared constants (HTTP status, JWT, cookie config)
  - `lib/contexts/` – React contexts (e.g., AuthContext)
  - `lib/database/` – DB connection and helpers (connection.ts, utils.ts)
  - `lib/middleware/` – API middleware (CORS, security, rate limit)
  - `lib/models/` – Mongoose models (User, Order)
  - `lib/providers/` – App-level providers
  - `lib/schemas/` – Zod schemas (if any shared)
  - `lib/services/` – Business logic (userService, orderService)
  - `lib/swagger/` – Swagger/OpenAPI generation config
  - `lib/types/` – Zod schemas and TS types for auth/order
  - `lib/utils/` – Helpers (auth, validation, http client, etc.)
- `public/` – static assets
- `scripts/` – `seed.ts`, Swagger test, Vercel setup script
- `docs/` – documentation

### Purpose of Key Directories

- Models define MongoDB collections and indexes with validation and transformation for API responses.
- Services expose CRUD/analytics functions with caching and pagination helpers.
- Middleware standardizes API responses, security headers, CORS, and rate limiting.
- Types centralize Zod schemas to validate inputs and shape responses consistently.

## Best Practices Implemented

- Coding standards: TypeScript with strict typings, ESLint config, modular services
- Naming: PascalCase for types/classes, camelCase for variables/functions, kebab-case files where idiomatic
- Validation: zod for request body/query validation; centralized utils
- Security: HTTP-only cookies, JWT HS256, CORS restricted to same-origin by default, security headers (CSP, XSS, frame, referrer)
- Performance: connection pooling tuned for serverless, in-memory caching in service layer for read APIs, indexes for common queries
- Testing: Jest, Testing Library, Playwright, mocks for DB
- Migrations and data safety: Mongoose schemas enforce constraints; compound indexes; user-scoped queries

## Technologies

### Frontend

- Next.js 15 (App Router)
  - Chosen for SSR/ISR, built-in routing, and co-located API routes
  - Integrates directly with Vercel for serverless deployment
- React 19
  - Modern hooks, concurrent features
- Tailwind CSS 4
  - Utility-first styling for rapid development; integrates with Shadcn/ui
- shadcn/ui + Radix UI
  - Accessible primitives and ready-to-style components
  - Used with react-hook-form + zod for robust form UX

Integration: Pages consume API routes, AuthContext handles session state, UI components are composed from shadcn/ui primitives.

### Backend

- Next.js API routes (in the same repo)
  - Simpler deployment and runtime model (serverless functions on Vercel)
- MongoDB + Mongoose
  - Flexible document model fits orders; mature ecosystem; schema validation and indexes
  - Alternatives (Postgres/Prisma) were not chosen to keep a simple document store and fewer moving parts
- Authentication: JWT (jsonwebtoken), bcryptjs
  - JWT chosen for stateless APIs and easy cookie/header transport
  - bcryptjs chosen (pure JS) to avoid native build issues

Integration: API handlers call services; services use Mongoose models; auth utils generate/verify tokens; middleware attaches security and CORS.

### Storage Solutions

- Primary: MongoDB for users and orders
- Session: JWT stored in HTTP-only cookie (`auth-token`) and can be passed as `Authorization: Bearer` header
- File storage: not used; static assets served from `public/`

### Development Tools

- TypeScript, ESLint, Jest, Testing Library, Playwright
- Swagger (swagger-jsdoc + Swagger UI) to generate `/api/docs`+`/api/docs/openapi.json`

### State Management and Data Fetching

#### Redux Toolkit (@reduxjs/toolkit)

- Purpose: Global client state management where data is user/session or UI-centric and not easily derivable from the server. In this app it manages:
  - Authentication state (user, token, isAuthenticated, loading, errors) via `authSlice`
  - Dashboard UI state (filters, pagination, loading flags, selection) via `dashboardSlice`
  - Persistence of auth token/user via `redux-persist`

#### React Query (@tanstack/react-query)

- Purpose: Server state management (fetch/cache/sync data from APIs). It complements Redux by handling caching, request deduplication, and background refetching for API data.
- Current setup:
  - A `QueryClient` is configured in `app/dashboard/page.tsx` with defaults `{ retry: 1, refetchOnWindowFocus: false }`
  - `QueryClientProvider` wraps the dashboard so components can opt into `useQuery`/`useMutation`

#### Context API usage

- Implemented contexts:
  - `AuthContext` (`lib/contexts/AuthContext.tsx`): exposes `user`, `token`, `isAuthenticated`, `isLoading`, `error` and methods `login`, `register`, `logout`, `clearError`, `updateProfile`, `changePassword`. Includes a `ProtectedRoute` component.
  - Theme/Toast providers live under `lib/providers` and wrap the app in `app/layout.tsx`.
- Why Context:
  - Useful for cross-cutting concerns that are not server-state (e.g., theming, toasts) and for backward compatibility with components that were written before Redux migration
- Working together:
  - Redux is the primary source of truth for auth/UI state. The Axios interceptor reads the Redux token.
  - React Query is the preferred layer for cacheable server state going forward (lists, stats, detail fetches), while Redux keeps UI state (filters/pagination) and auth stable.

## Environment Variables

- `MONGODB_URI` (required) – Mongo connection string
- `MONGODB_DB_NAME` (optional) – DB name, defaults to `sales-crm`
- `JWT_SECRET` (required in non-dev) – JWT signing secret
- `NODE_ENV` – `development` or `production`

On Vercel, set them in Project Settings → Environment Variables. The code also reads `VERCEL_URL` for environment detection.

## API Documentation and Endpoints

Swagger UI: `/api/docs`
OpenAPI JSON: `/api/docs/openapi.json`

Authentication

- `POST /api/auth/register` – register new user
- `POST /api/auth/login` – login and receive `{ user, token, expiresIn }`, sets `auth-token` cookie
- `POST /api/auth/logout` – clears auth cookies
- `GET /api/auth/me` – current user; requires token (cookie or header)

Orders

- `GET /api/orders` – list with filters
  - Query: `page`, `limit`, `sortBy` (`date|customer|amount|createdAt`), `sortOrder` (`asc|desc`), `category`, `source`, `geo`, `dateFrom`, `dateTo`, `search`
- `POST /api/orders` – create order
- `GET /api/orders/{id}` – get order by id
- `PUT /api/orders/{id}` – update order
- `DELETE /api/orders/{id}` – delete order
- `GET /api/orders/stats` – totals and breakdowns

Docs

- `GET /api/docs` – Swagger UI HTML page (with CSP tuned for external assets)
- `GET /api/docs/openapi.json` – OpenAPI 3 spec generated from JSDoc + config

Health

- `GET /api/health` – DB connectivity and runtime stats

Seed (dev convenience)

- `POST /api/seed` – seeds DB with sample data and superadmin; not intended for production

### Authentication & Authorization Flow

- Login: validate credentials → generate JWT (HS256, 24h default, 7d if rememberMe) → set `auth-token` cookie
- Subsequent requests: API middleware reads `Authorization: Bearer <token>` or cookie; protected handlers call `authenticateRequest`
- Roles: User model supports `admin` and `user`. Utility `hasRequiredRole` exists; endpoints can leverage it if role-based checks are added.

## Database Schema and Relationships

### User (lib/models/User.ts)

- Fields: `email` (unique, indexed), `password` (hashed, select: false), `name`, `role` (`admin|user`), `isActive`, `emailVerified`, timestamps
- Indexes: unique on email; compound `role + isActive`; `createdAt`
- Hooks: pre-save password hashing; pre-delete cascade to remove user-owned orders
- Methods: `comparePassword`, `toAPIResponse`; statics for common queries

### Order (lib/models/Order.ts)

- Fields: `userId` (ObjectId, ref User, required), `customer`, `category`, `date` (YYYY-MM-DD string), `source`, `geo`, `amount`, `status`, timestamps
- Indexes: compound on `userId` with `date/category/source/geo/status/createdAt/amount`; text index on several fields
- Methods: `toAPIResponse`; virtual `id`
- Notes: API responses omit `userId`, return `id`

### Relationships

- One User to Many Orders via `userId`
- All query paths scope by `userId` to ensure isolation

## Integration Details

- Pagination, search, and date-range filtering are implemented in `lib/database/utils.ts` and `orderService` using MongoDB aggregation and indexes.
- Middleware (`withApiMiddleware`) applies:
  - OPTIONS handling
  - JSON content validation
  - Request size caps
  - Rate limiting with response headers
  - CORS restricted to same-origin by default
  - Security headers including CSP suitable for Swagger UI
  - Logging per request

## Deployment Considerations

- Vercel
  - API routes run as serverless functions (timeout configured in `vercel.json`)
  - Set env vars in the dashboard (Production/Preview environments)
  - Regions configured in `vercel.json` (default `iad1`)
  - Avoid long-lived connections; connection pool set small for serverless
- MongoDB Atlas
  - Use SRV connection strings; whitelist Vercel egress IPs if needed
- Secrets
  - Use `JWT_SECRET` unique per environment
  - Never commit `.env.local` files
- CORS
  - Default is same-origin; if you expose APIs to other origins, adjust `getCorsHeaders` logic

## Why These Technologies?

- MongoDB/Mongoose: schema-flexible, rapid iteration, rich indexing; fits order analytics well
- JWT+bcryptjs: stateless auth, easy to test and deploy (no native bindings)
- shadcn/ui + Radix: accessible primitives with composability and React-first ergonomics
- Zod + react-hook-form: compile-time and runtime validation with ergonomic forms

## Extending the System

- Add new resources: create Mongoose model, service methods, and `app/api/<resource>` handlers; document with Swagger JSDoc tags
- Role-based access control: use `hasRequiredRole` in handlers or middleware
- Background jobs: consider separate worker (e.g., serverless cron) or managed queue

## References

- Source code for endpoints under `app/api/*`
- Swagger config under `lib/swagger/config.ts`
- DB connection under `lib/database/connection.ts`
- Seeding under `scripts/seed.ts` and `app/api/seed/route.ts`
