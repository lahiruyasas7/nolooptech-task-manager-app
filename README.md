# Task Manager

A task manager with a NestJS API, SQLite database, and Next.js web app.

## Tech stack

### Backend

- NestJS and TypeScript
- Prisma ORM with SQLite
- `class-validator` and `class-transformer` for request validation
- Swagger / OpenAPI documentation

### Frontend

- Next.js App Router, React, and TypeScript
- Tailwind CSS and shadcn/ui
- TanStack Query for server state
- Axios for API requests
- React Hook Form and Zod for forms and validation
- Sonner for toast notifications

## Run with Docker Compose

### Prerequisites

- Docker Desktop (or Docker Engine) with the Docker Compose plugin

From the repository root, build and start the application:

```bash
docker compose up --build
```

Compose applies the checked-in Prisma migrations before starting the API, waits
for the API to become healthy before starting the web app, and stores the
SQLite database in a named Docker volume.

- Web app: <http://localhost:3000>
- API: <http://localhost:3001>
- Swagger UI: <http://localhost:3001/api/docs>

Stop the containers while keeping task data:

```bash
docker compose down
```

To also delete the database and all saved tasks, run
`docker compose down --volumes`. This permanently removes the named database
volume.

The default host ports are `3000` (web) and `3001` (API). If those ports are
already in use, configure `WEB_PORT` and `API_PORT` in a root `.env` file.
Because the API URL is embedded in the browser app at build time, also set
`NEXT_PUBLIC_API_URL` to `http://localhost:<API_PORT>` and rebuild. Set
`CORS_ORIGIN` to `http://localhost:<WEB_PORT>` if the web port changes.

For example, to use ports `3002` and `3003`, create a `.env` file in the
repository root with:

```dotenv
WEB_PORT=3002
API_PORT=3003
NEXT_PUBLIC_API_URL=http://localhost:3003
CORS_ORIGIN=http://localhost:3002
```

These are Docker Compose settings. The defaults are used if the root `.env`
file is absent.

## Run locally without Docker

### Prerequisites

- Node.js 24.x (`.nvmrc`) and npm
- Git

Install and start the API in one terminal:

```bash
cd api
npm ci
```

Create `api/.env` from the example. In PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

The API environment values are:

```dotenv
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

Generate Prisma Client, apply migrations, and start the API:

```bash
npm run db:generate
npm run db:deploy
npm run start:dev
```

The API uses `DATABASE_URL` from `api/.env`; by default the SQLite file is
`api/prisma/dev.db`. The example configures port `3001` and allows the web app
origin at `http://localhost:3000`.

In another terminal, install and start the web app:

```bash
cd web
npm ci
```

Create `web/.env.local` from the example (use `Copy-Item .env.example .env.local`
in PowerShell, or `cp .env.example .env.local` on macOS/Linux), then run:

```bash
npm run dev
```

The web environment value is:

```dotenv
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Open <http://localhost:3000>. Set `NEXT_PUBLIC_API_URL` in
`web/.env.local` if the API runs at a different URL.

## Features

- Create, view, edit, and delete tasks
- Task status values: `TODO`, `IN_PROGRESS`, and `DONE`
- Filter by status and sort by due date
- Responsive task list, form validation, and success/error notifications
- Swagger API documentation at `/api/docs`

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/tasks?status=&sort=` | List tasks; optionally filter by status and sort due dates |
| GET | `/tasks/:id` | Get a task by UUID |
| POST | `/tasks` | Create a task |
| PATCH | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task (204 response) |

Task titles are required (up to 200 characters); descriptions are optional
(up to 2,000 characters); due dates are optional ISO 8601 timestamps.

## Verification

```bash
# API checks
cd api
npm run lint
npm run test
npm run test:e2e
```

Run web checks from another terminal:

```bash
cd web
npm run lint
npx tsc --noEmit
npm run build
```

## How I used AI

**Tools**
- **Claude (chat):** I gave my instruction for planning, architecture decisions, the UI design mockup, and create AGENTS>md file and README setup.
- **GitHub Copilot (VS Code):** implementation of the API and web app.
- **`AGENTS.md`:** project conventions (stack, API contract, validation rules, UI states) so Copilot's output stayed consistent.

**What I changed in the generated code**
- **Backend:** the generated code was mostly correct. I reviewed it against the requirements (DTO validation, 400/404 handling, filter and sort) and checked it with e2e tests.
- **Frontend:** I fixed UI issues in the generated components like filter buttons issue. mobile responsive ui bugs. 
- **Docker:** I reviewed and adjusted the setup after testing it from a fresh clone.

I reviewed every part of the generated code myself and can walk through it in the interview.