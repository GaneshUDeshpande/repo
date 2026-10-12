# The Internet Time Machine

A backend foundation for the Phase 1 implementation of The Internet Time Machine.

## Overview

This repository contains the server-side foundation for a nostalgic web app that simulates a fictional desktop environment across three internet eras: the 2000s, 2010s, and 2020s. The backend includes a relational schema, seeded catalog data, authentication, desktop preferences, and progression/collectibles APIs.

## Architecture summary

- TypeScript + Express
- Prisma ORM with SQLite for local development/test portability
- Zod validation
- JWT-based authentication
- API versioning with `/api/v1`
- Domain-first modular routes/services

## Quick start

1. Install dependencies:
   npm install
2. Copy environment file:
   cp .env.example .env
3. Generate Prisma client:
   npm run db:generate
4. Run database migrations and seed data:
   npm run db:migrate
   npm run db:seed
5. Start the backend:
   npm run dev

## Scripts

- `npm run build` — TypeScript compile
- `npm run test` — run automated tests
- `npm run db:migrate` — create/schema migration
- `npm run db:seed` — populate initial eras and seed data
- `npm run dev` — local server with hot reload

## API prefix

All routes are under `/api/v1`.

## Health check

- `GET /health`

## Core endpoints

- `GET /api/v1/eras`
- `GET /api/v1/eras/:slug`
- `GET /api/v1/eras/:slug/applications`
- `GET /api/v1/applications`
- `GET /api/v1/applications/:slug`
- `GET /api/v1/collectibles`
- `GET /api/v1/collectibles/:slug`
- `GET /api/v1/search`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me/desktop`
- `PATCH /api/v1/users/me/desktop`
- `POST /api/v1/users/me/desktop/reset`
- `GET /api/v1/users/me/progress`
- `POST /api/v1/users/me/progress/activities`
- `GET /api/v1/users/me/collectibles`
- `POST /api/v1/users/me/collectibles/resolve`

## Deferred features and known limitations

- Frontend desktop shell is intentionally not implemented in Phase 1.
- Social login, email verification, password reset, and public chat are deferred.
- For production, swap the SQLite database for PostgreSQL.
- No real content scraping or external media APIs are included.

## Security notes

- Passwords are hashed with bcrypt.
- JWT secrets must be configured in production.
- CORS is restricted to configured origins.
- All private requests require a valid bearer token.
