Task Manager: NestJS API + Next.js web app. 

## Stack

| Layer | Tech |
|---|---|
| API (`/api`) | NestJS, TypeScript, Prisma **6** (pinned), SQLite, class-validator, class-transformer, @nestjs/swagger |
| Web (`/web`) | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form + Zod, Sonner |
| Package manager | **npm** (both apps) |
| Node | Active LTS, pinned in `.nvmrc` at repo root |

## Repo layout

```
/
├── api/
│   ├── prisma/{schema.prisma, migrations/}
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/{prisma.module.ts, prisma.service.ts}
│   │   └── tasks/
│   │       ├── dto/{create-task.dto.ts, update-task.dto.ts, list-tasks-query.dto.ts}
│   │       ├── tasks.controller.ts
│   │       ├── tasks.service.ts
│   │       └── tasks.module.ts
│   ├── test/tasks.e2e-spec.ts
│   └── .env.example
├── web/
│   ├── src/
│   │   ├── app/{layout.tsx, page.tsx, providers.tsx}
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn generated, don't hand-edit
│   │   │   └── tasks/{task-table.tsx, task-form-dialog.tsx, delete-task-dialog.tsx, status-badge.tsx, task-filters.tsx}
│   │   ├── lib/{api.ts, utils.ts}
│   │   ├── hooks/use-tasks.ts       # TanStack Query hooks
│   │   └── schemas/task.ts          # Zod schemas + types
│   └── .env.example
├── .nvmrc
├── .gitignore
├── CLAUDE.md
└── README.md
```

## Commands

```bash
# API (from /api)
npm i
npx prisma migrate dev          # dev: create/apply migrations
npx prisma migrate deploy       # prod/docker: apply only
npm run start:dev               # http://localhost:3001
npm run test:e2e
# Swagger UI: http://localhost:3001/api/docs

# Web (from /web)
npm i
npm run dev                     # http://localhost:3000
npm run lint && npm run build
```

## Environment variables

`api/.env.example`
```
DATABASE_URL="file:./dev.db"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

`web/.env.example`
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

Never commit real `.env` files or `*.db` files. Commit `.env.example` and `prisma/migrations/`.

## Data model

```prisma
enum TaskStatus { TODO IN_PROGRESS DONE }

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([status])
  @@index([dueDate])
  @@map("tasks")
}
```

## API contract

| Method | Path | Success | Errors |
|---|---|---|---|
| GET | `/tasks?status=&sort=` | 200 | 400 |
| GET | `/tasks/:id` | 200 | 400 (bad UUID), 404 |
| POST | `/tasks` | 201 | 400 |
| PATCH | `/tasks/:id` | 200 | 400, 404 |
| DELETE | `/tasks/:id` | 204 (no body) | 400, 404 |

- `status` filter: `TODO | IN_PROGRESS | DONE`.
- `sort`: `asc | desc` by `dueDate`, tasks without a due date always last (`nulls: 'last'`). Default order when `sort` is absent: `createdAt desc`.
- `dueDate`: ISO 8601 string in/out.
- No extra endpoints (no pagination, bulk, search, auth). Optional `GET /health` only if Docker healthchecks need it.

## Backend rules

- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` in `main.ts`.
- DTOs with class-validator:
  - `CreateTaskDto`: `title` `@IsString @IsNotEmpty @MaxLength(200)`, `description` `@IsOptional @IsString @MaxLength(2000)`, `status` `@IsOptional @IsEnum(TaskStatus)`, `dueDate` `@IsOptional @IsISO8601`.
  - `UpdateTaskDto = PartialType(CreateTaskDto)` (import from `@nestjs/swagger` so Swagger sees it).
  - `ListTasksQueryDto`: optional `status` enum, optional `sort` in `['asc','desc']`.
- `:id` params use `ParseUUIDPipe` (malformed -> 400, missing -> 404).
- Service throws `NotFoundException` for missing tasks. Check existence on update/delete (or catch Prisma `P2025`), never return `null` to the controller.
- Controller stays thin: no Prisma calls, no business logic.
- `DELETE` uses `@HttpCode(204)`.
- `PrismaService` extends `PrismaClient`, implements `OnModuleInit` and `OnModuleDestroy`; module is `@Global()` or imported by `TasksModule`.
- CORS: `app.enableCors({ origin: process.env.CORS_ORIGIN })`.
- Swagger: `DocumentBuilder` in `main.ts`, served at `/api/docs`. Use `@ApiTags`, `@ApiOperation`, `@ApiResponse` (200/201/204/400/404), `@ApiProperty` on DTOs. Keep annotations short.
- Convert `dueDate` string to `Date` before the Prisma call.
- Tests (`supertest`, e2e): create 201, create 400 (missing title), get 404, get 400 (bad UUID), patch 200/404, delete 204/404, list filter and sort. Use a separate test DB file (`file:./test.db`) and reset between tests.

## Frontend rules

- App Router. `page.tsx` is a server component shell; interactive parts are `"use client"` components.
- `lib/api.ts`: typed `fetch` wrapper reading `NEXT_PUBLIC_API_URL`. Throws a typed `ApiError` carrying status and the API's message. Handle 204 (no body).
- `hooks/use-tasks.ts`: `useTasks(filters)`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`. Query keys: `['tasks', { status, sort }]`. Invalidate `['tasks']` on mutation success.
- `QueryClientProvider` in `app/providers.tsx` (client component), `<Toaster />` from Sonner in layout.
- Table: shadcn `Table`; status shown with `Badge` (`StatusBadge`, one variant/color per status, plus readable label: "In progress").
- Create/edit: one `Dialog` with React Hook Form + `zodResolver`. Same component for both modes (`task?: Task` prop). Reset form when the dialog opens or the task changes.
- Zod schema mirrors the API rules (title required, max lengths, optional date). Date input value (`YYYY-MM-DD`) converted to ISO before sending; convert back when editing. Avoid timezone off-by-one (compare in UTC or use date-only formatting).
- Delete: shadcn `AlertDialog` confirmation; disable the confirm button while pending.
- States (all required):
  - Loading: `Skeleton` rows.
  - Error: message plus "Retry" button (`refetch`).
  - Empty: plain text "No tasks yet" with a create button.
  - Mutation pending: disable submit buttons.
- Toasts (Sonner): success on create/update/delete, error toast on failure using the API message.
- Filter: shadcn `Select` for status (All / To do / In progress / Done). Sort: toggle on the Due Date column header (asc/desc). Both drive query params sent to the API (server-side).
- Accessibility basics: every input has a `<Label>`, dialogs have title and description, buttons have accessible names (icon buttons need `aria-label`).
- shadcn components are added via CLI (`npx shadcn@latest add table badge dialog alert-dialog button input textarea select label form sonner skeleton`). Don't hand-write them.
- No Redux, no global state libs, no CSS-in-JS.

## Code style

- TypeScript `strict: true`. No `any`; use `unknown` and narrow.
- Small functions, early returns, descriptive names. Comments only where the *why* isn't obvious.
- Share types by duplication (small `Task` type in `web`); no monorepo tooling.
- Run `npm run lint` before every commit. Format with Prettier (default config).
- Don't add dependencies not listed in Stack without asking.

## Build plan (do one step at a time, verify, commit)

- [ ] **1. Scaffold:** `nest new api` (npm), `create-next-app` for `web` (TS, Tailwind, App Router, ESLint, `src/` dir). Root `.gitignore`, `.nvmrc`.
- [ ] **2. Prisma:** install Prisma 6, write schema, run first migration, `PrismaService`.
- [ ] **3. Tasks module:** DTOs, service, controller. Global pipe, CORS, `ParseUUIDPipe`.
- [ ] **4. Filter/sort** on `GET /tasks`.
- [ ] **5. Swagger** at `/api/docs`.
- [ ] **6. E2E tests** pass.
- [ ] **7. Web setup:** shadcn init + components, query provider, Sonner, API client.
- [ ] **8. Table + badges** with loading/error/empty states.
- [ ] **9. Create/edit dialog** (RHF + Zod) with toasts.
- [ ] **10. Delete confirmation.**
- [ ] **11. Filter and sort UI.**
- [ ] **12. README** (prereqs, install, env, migration, start commands, endpoints, "How I used AI", future improvements such as pagination).
- [ ] **13. Docker Compose (bonus):** only after step 13 passes. API volume for SQLite, `migrate deploy` on start, `NEXT_PUBLIC_API_URL` as build arg. Re-run fresh-clone test with Docker.

## Definition of done (per step)

1. Builds and lints clean.
2. Manually tested (Swagger UI for API, browser for web).
3. Committed with a conventional message.

## Working agreement

- Work on **one build-plan step at a time**; stop and summarize after each.
- Keep explanations short. Say why when choosing between alternatives.
- Be honest: if a request is over-engineering for this scope, say so and propose the simpler approach.
- Prefer the simplest thing that satisfies the requirements. Don't add features not listed here.
- Before using any library API you're unsure about (Prisma 6 SQLite enums/`nulls`, shadcn CLI, Tailwind version setup), check the installed version's docs instead of guessing.
- The developer must be able to explain every line in an interview: no clever abstractions, no unexplained code.