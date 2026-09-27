# UniGuide AI — Agent Context

## Goal and current step

UniGuide AI is a university assistant for students. The planned MVP includes authentication, university document upload, RAG answers with citations, multilingual support, and chat history. These application features are not implemented.

Step 8A is complete. Step 9 — NestJS + Prisma Integration is implemented, pending review. Do not begin authentication or domain APIs until authorized. Do not commit or push without explicit instruction.

## Implemented

- `frontend/`: Next.js 16.3.3, React, TypeScript, Tailwind CSS 4, App Router, Yarn. Current UI is the starter page.
- `backend/`: NestJS 12 with TypeScript and npm; AppModule, AppController, AppService, starter `GET /`, Vitest tests, Oxlint.
- PostgreSQL 16 in root Docker Compose: `uniguide-postgres`, persistent `postgres_data` volume, port 5432, and pg_isready healthcheck. PostgreSQL is the only configured service.
- Prisma CLI and client installed/locked at 7.10.0. Preserve that version; no Prisma upgrade is authorized. Existing manifests use compatible version ranges.
- `backend/prisma/schema.prisma` defines User, University, Document, DocumentChunk, ChatSession, ChatMessage, and AIUsage; enums are UserRole, DocumentStatus, and MessageRole.
- One committed migration: `20260830125405_init`, with PostgreSQL migration lock.
- `backend/prisma.config.ts` loads DATABASE_URL through dotenv/config from the backend working directory.
- Root `.env.example` documents non-secret local database settings and backend PORT. Actual environments are ignored.

## Planned, not implemented

- Authentication/authorization and User/University APIs.
- Document upload/storage, parsing, processing, and embeddings.
- Python/FastAPI AI service; `ai-service/` is currently an empty local directory and is not preserved by Git in fresh clones.
- Redis and Qdrant (including vector indexing).
- Retrieval, RAG, LLM integration, AI chat, citations, chat history, and multilingual product behavior.
- LangChain/LangGraph and OpenAI/Gemini are candidates only.
- Application containers and production deployment/NGINX.

## Package manager rules

- `frontend/` → Yarn only; keep yarn.lock, never add package-lock.json.
- `backend/` → npm only; keep package-lock.json.
- Future `ai-service/` → pip / Python virtual environment.
- Do not initialize planned services or add unrelated packages during Step 9.

## Local ports

| Service | Port | Status |
| --- | --- | --- |
| Next.js frontend | 3000 | Implemented |
| NestJS backend | 3001 | Implemented |
| FastAPI | 8000 | Planned |
| PostgreSQL | 5432 | Implemented |
| Redis | 6379 | Planned |
| Qdrant HTTP | 6333 | Planned |

NestJS listens on `process.env.PORT ?? 3001`. PrismaService imports dotenv/config, loading backend/.env when run from backend/ before service construction and port selection. Existing process environment values take precedence. Prisma CLI also loads backend/.env. Do not copy the backend PORT into a frontend environment file. Next.js keeps its default port 3000; keep it free to avoid automatic fallback.

`frontend/next.config.ts` sets `turbopack.root` to the frontend directory. Do not modify unrelated parent lockfiles.

## Environment and generated-file policy

Root ignore rules protect `.env*` at every depth, with an exception for `.env.example`; frontend ignore rules preserve the same exception. Commit only non-secret examples. Node dependencies/build output, Python environments/caches, logs, and OS/editor artifacts are ignored. Shared VS Code settings/tasks/launch/extensions remain trackable.

Prisma uses the `prisma-client` generator with output `backend/src/generated/prisma`. Generation with Prisma 7.10.0 has been verified. Generated files are kept locally, ignored, and removed from Git tracking. Do not edit or commit generated code.

Run `npx prisma generate` inside backend/ after installing dependencies or changing the schema, before a fresh backend build. There is no automatic generation hook. Commit schema, migrations, Prisma configuration, package manifest, and lockfile instead. Do not change schema models, create migrations, or run prisma db push during Step 9.

## Runtime baseline and validation

Before Step 8A, the user manually verified Docker Desktop running, PostgreSQL healthy on 5432, one applied migration with an up-to-date schema, NestJS startup, and Next.js startup on 3000. Runtime health is time-dependent; distinguish that baseline from current command results.

Validation commands:

- Root: `git diff --check`, `docker compose ps`.
- Frontend: `yarn lint`, `yarn exec tsc --noEmit --incremental false`, `yarn build`; start `yarn dev` on 3000, check for the former parent-lockfile warning, then stop it.
- Backend: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`; verify `npm run start:dev` on 3001, then stop it. E2E tests require PostgreSQL and use SELECT 1 without creating records.
- Prisma from backend/: `npx prisma validate`, `npx prisma generate`, `npx prisma migrate status`.

A clean frontend build currently fetches Google Fonts. On a fresh checkout, generate Next.js route types with yarn build before running the standalone TypeScript check.

## Step 8A validation results

- Repository ignore-policy checks passed for actual environments and trackable examples in root, backend, frontend, and future ai-service paths; dependency/build/Python/editor patterns passed as well.
- Frontend lint, TypeScript check, and production build passed. `yarn dev` started on 3000 without the parent-lockfile warning and returned HTTP 200; it was stopped.
- Backend lint, one unit test, and build passed. The backend returned `Hello World!` on 3001 and was stopped.
- Prisma 7.10.0 validation and generation passed. Generated client exists locally with zero files remaining in the Git index.
- Docker reported PostgreSQL healthy. Migration status found one migration and confirmed the database schema is up to date.
- Initial sandbox font/socket restrictions required validation retries outside the sandbox and a fresh frontend build cache. The existing Google Fonts build dependency and Vite tsconfig-paths advisory remain.
- `next dev` automatically rewrote frontend/CLAUDE.md; that incidental change was restored after validation. Future dev runs may rewrite it again.
- No dependencies, schema models, migrations, or product UI were changed. No commit or push was made.

## Step 9 architecture

- `backend/src/prisma/prisma.service.ts` exports injectable PrismaService extending PrismaClient from `../generated/prisma/client.js` (ESM/NodeNext import).
- `backend/src/prisma/prisma.module.ts` provides and exports PrismaService using a global NestJS module; AppModule imports it.
- Runtime dependencies added: `@prisma/adapter-pg` 7.10.0 and `pg` 8.23.0. Existing dotenv 17.4.2 moved from devDependencies to dependencies. No additional direct types package was needed. No existing locked dependency version changed.
- Prisma CLI and @prisma/client remain at 7.10.0; schema, migration, and generated-output configuration are unchanged.
- dotenv/config in PrismaService loads backend/.env without overwriting existing environment values. No @nestjs/config dependency is needed for the current minimal configuration. Start commands must run from backend/.
- Missing or blank DATABASE_URL throws a clear error without printing credentials.
- PrismaPg receives `{ connectionString }` and creates/owns its pool. The adapter is passed to `super({ adapter })`.
- onModuleInit awaits $connect; onModuleDestroy awaits $disconnect, which disposes the adapter-owned pool. main.ts enables NestJS shutdown hooks for graceful signal handling. No manually managed second pool is created.
- `backend/src/prisma/prisma.service.spec.ts` checks missing/empty/blank DATABASE_URL without accessing a database.
- `backend/test/prisma.e2e-spec.ts` initializes AppModule, resolves PrismaService, executes SELECT 1, and closes the app in finally. No seed data, records, or debugging endpoint is created.

## Step 9 validation results

- Docker PostgreSQL healthy; one migration found and schema up to date.
- Prisma generate and validate passed with 7.10.0; local generated client remains ignored and untracked.
- Backend lint and build passed. Unit tests: 4 passed across 2 files. E2E tests: 2 passed, including PostgreSQL SELECT 1 and the original GET / endpoint.
- `npm run start:dev` compiled without errors, completed Prisma connection initialization, and served Hello World! on port 3001; the backend was then stopped.
- git diff --check and formatting checks passed. No schema/migration/frontend changes, commit, or push.
- npm reported existing Angular devkit engine requirements newer than the current Node 22.21.1. No existing dependency versions were upgraded; validation still passed. The existing Vite tsconfig-paths advisory remains.

## Next planned step

After Step 9 review, plan and implement authentication as a separate authorized step. Authentication, JWT, password hashing, and domain APIs are not implemented here. Do not begin them, initialize FastAPI, add Redis/Qdrant, or implement document/AI functionality now.
