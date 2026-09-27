# UniGuide AI — Agent Context

## Goal and current step

UniGuide AI is a university assistant for students. The planned MVP includes authentication, university document upload, RAG answers with citations, multilingual support, and chat history. These application features are not implemented.

Step 8A — Repository Hygiene and Local Development Configuration is implemented, pending review. Do not begin Step 8B — NestJS Prisma integration until authorized. Do not commit or push this step without explicit instruction.

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

- PrismaModule, PrismaService, and PostgreSQL driver adapter integration.
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
- Do not install packages or initialize planned services as part of Step 8A.

## Local ports

| Service | Port | Status |
| --- | --- | --- |
| Next.js frontend | 3000 | Implemented |
| NestJS backend | 3001 | Implemented |
| FastAPI | 8000 | Planned |
| PostgreSQL | 5432 | Implemented |
| Redis | 6379 | Planned |
| Qdrant HTTP | 6333 | Planned |

NestJS listens on `process.env.PORT ?? 3001`. The NestJS bootstrap does not automatically load .env; use the default or set PORT in the process environment. Prisma CLI separately loads backend/.env. Do not copy the backend PORT into a frontend environment file. Next.js keeps its default port 3000; keep it free to avoid automatic fallback.

`frontend/next.config.ts` sets `turbopack.root` to the frontend directory. Do not modify unrelated parent lockfiles.

## Environment and generated-file policy

Root ignore rules protect `.env*` at every depth, with an exception for `.env.example`; frontend ignore rules preserve the same exception. Commit only non-secret examples. Node dependencies/build output, Python environments/caches, logs, and OS/editor artifacts are ignored. Shared VS Code settings/tasks/launch/extensions remain trackable.

Prisma uses the `prisma-client` generator with output `backend/src/generated/prisma`. Generation with Prisma 7.10.0 has been verified. Generated files are kept locally, ignored, and removed from Git tracking. Do not edit or commit generated code.

Run `npx prisma generate` inside backend/ after installing dependencies or changing the schema, before a fresh backend build. There is no automatic generation hook. Commit schema, migrations, Prisma configuration, package manifest, and lockfile instead. Do not change schema models, create migrations, or run prisma db push during Step 8A.

## Runtime baseline and validation

Before Step 8A, the user manually verified Docker Desktop running, PostgreSQL healthy on 5432, one applied migration with an up-to-date schema, NestJS startup, and Next.js startup on 3000. Runtime health is time-dependent; distinguish that baseline from current command results.

Validation commands:

- Root: `git diff --check`, `docker compose ps`.
- Frontend: `yarn lint`, `yarn exec tsc --noEmit --incremental false`, `yarn build`; start `yarn dev` on 3000, check for the former parent-lockfile warning, then stop it.
- Backend: `npm run lint`, `npm test`, `npm run build`; verify startup on 3001, then stop it.
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

## Next planned step

After Step 8A review, implement NestJS Prisma integration in a separate step. Do not begin it now. No application features, schema changes, migrations, Prisma upgrade, Redis, Qdrant, or FastAPI initialization belong to Step 8A.
