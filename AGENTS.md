# UniGuide AI — Agent Context

## Project Goal

UniGuide AI is an AI-powered university assistant for students. The MVP will focus on authentication, university document upload, RAG-based AI chat, source citations, multilingual support, and chat history.

## Project Structure

* `frontend/` — Next.js frontend
* `backend/` — NestJS main API
* `ai-service/` — Python/FastAPI AI service
* `docker-compose.yml` — local infrastructure
* `.env.example` — shared environment variable reference

## Main Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* App Router
* Yarn

### Backend

* NestJS
* TypeScript
* npm
* PostgreSQL
* Prisma
* JWT authentication
* Redis planned

### AI Service

* Python
* FastAPI
* pip
* LangChain / LangGraph planned
* Qdrant vector database
* OpenAI or Gemini planned

### Infrastructure

* PostgreSQL
* Redis
* Qdrant
* Docker
* Docker Compose
* NGINX planned for production

## Package Manager Rules

* Frontend: use Yarn only
* Backend: use npm only
* AI service: use pip / Python virtual environment
* Do not mix `package-lock.json` and `yarn.lock` in the frontend

## Completed

1. Created root `uniguide-ai` project
2. Initialized Git repository
3. Created `frontend`, `backend`, and `ai-service` directories
4. Created `README.md`, `.env.example`, and `docker-compose.yml`
5. Initialized Next.js frontend
6. Frontend successfully runs locally
7. Converted frontend package management to Yarn
8. Initialized NestJS backend
9. Backend successfully runs locally
10. Installed Prisma dependencies in the NestJS backend using npm
11. Initialized Prisma for PostgreSQL in `backend/`
12. Added a non-secret PostgreSQL `DATABASE_URL` example to the root `.env.example`
13. Validated the generated Prisma setup with `npx prisma validate`
14. Added initial MVP Prisma data models and enums
15. Formatted and validated the Prisma schema after model design
16. Added local PostgreSQL service to Docker Compose
17. Created and applied the first Prisma migration for the MVP schema
18. Generated Prisma Client and validated migration status

## Current Step

Step 7 — Local PostgreSQL Docker setup and initial Prisma migration completed.

Step 5 completed commands inside `backend/`:

```bash
npm install @prisma/client
npm install -D prisma
npm install -D prisma@7.10.0
npx prisma init
npm install -D dotenv
npx prisma validate
```

Important Prisma/PostgreSQL configuration decisions:

* Prisma is configured in the NestJS backend only.
* Backend package management remains npm-only.
* Prisma schema lives at `backend/prisma/schema.prisma`.
* Prisma is configured for PostgreSQL with `provider = "postgresql"`.
* Prisma config lives at `backend/prisma.config.ts`.
* `@prisma/client` and `prisma` use matching `7.10.0` package versions.
* `DATABASE_URL` is read from environment variables via `dotenv/config`.
* `backend/.env` is local-only and ignored by Git.
* No Prisma models, migrations, seed scripts, NestJS Prisma service/module, Docker PostgreSQL configuration, or authentication work were added in this step.

Files changed for Step 5:

* `.env.example`
* `AGENTS.md`
* `backend/package.json`
* `backend/package-lock.json`
* `backend/prisma.config.ts`
* `backend/prisma/schema.prisma`

Validation results:

* `backend/prisma/schema.prisma` exists and uses PostgreSQL.
* `backend/prisma.config.ts` exists.
* `backend/.env` remains untracked because it is ignored by `backend/.gitignore`.
* `npm ls @prisma/client prisma` succeeds inside `backend/`.
* `npx prisma validate` succeeds.

Step 6 model decisions:

* Created only the requested models: `User`, `University`, `Document`, `DocumentChunk`, `ChatSession`, `ChatMessage`, and `AIUsage`.
* Created only the requested enums: `UserRole`, `DocumentStatus`, and `MessageRole`.
* All primary keys use UUID strings with PostgreSQL `Uuid` native type.
* `createdAt` and `updatedAt` are included on all MVP models.
* `User` optionally belongs to `University`.
* `Document` belongs to `University` and the uploading `User`.
* `DocumentChunk` belongs to `Document`.
* `ChatSession` belongs to `User`.
* `ChatMessage` belongs to `ChatSession`.
* `AIUsage` belongs to `User`.
* Chat source metadata is stored in `ChatMessage.sources` as a PostgreSQL-compatible `Json` field.
* Added sensible unique constraints for user email, university slug/domain, document storage key, document chunk ordering, and external vector IDs.
* Added indexes for university/user lookups, document status filtering, chat history ordering, message roles, and AI usage reporting.
* No migrations, `prisma db push`, Prisma seed scripts, NestJS Prisma service/module, authentication work, frontend changes, or Docker Compose changes were added.

Files changed for Step 6:

* `AGENTS.md`
* `backend/prisma/schema.prisma`

Step 6 validation results:

* `npx prisma format` succeeds inside `backend/`.
* `npx prisma validate` succeeds inside `backend/`.

Step 7 PostgreSQL Docker setup:

* Root `docker-compose.yml` now defines only a local PostgreSQL service.
* PostgreSQL uses `postgres:16`.
* Local database name is `uniguide`.
* Local database user is `postgres`.
* Local database password is `postgres`.
* Local database port is `5432`.
* PostgreSQL data persists in the named `postgres_data` Docker volume.
* The service includes a `pg_isready` healthcheck for the `uniguide` database.
* Redis and Qdrant were not added.

Step 7 local connection details:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/uniguide
```

* Root `.env.example` contains this non-secret local development example.
* `backend/.env` uses the same local development URL and remains ignored by Git.

Step 7 migration status:

* Created and applied initial migration: `backend/prisma/migrations/20260830125405_init/`.
* Migration SQL file: `backend/prisma/migrations/20260830125405_init/migration.sql`.
* Prisma migration lock file: `backend/prisma/migrations/migration_lock.toml`.
* `npx prisma migrate status` reports 1 migration found and the database schema is up to date.
* Prisma Client was generated to `backend/src/generated/prisma`.
* No `prisma db push`, seed data, NestJS Prisma service/module, authentication work, frontend changes, or additional Docker services were added.

Files changed for Step 7:

* `.env.example`
* `AGENTS.md`
* `docker-compose.yml`
* `backend/prisma/migrations/20260830125405_init/migration.sql`
* `backend/prisma/migrations/migration_lock.toml`
* `backend/src/generated/prisma/`

Step 7 validation results:

* `docker compose ps` shows `uniguide-postgres` running and healthy.
* `npx prisma migrate status` succeeds and reports the database schema is up to date.
* `npx prisma generate` succeeds.
* `npx prisma validate` succeeds.

## Next Step

Review the local PostgreSQL setup, initial migration, and generated Prisma Client before moving to Step 8 — NestJS Prisma integration.

Do not proceed beyond PostgreSQL setup, initial migration, and validation until this step is reviewed.

## MVP Roadmap

1. Project structure
2. Next.js frontend
3. NestJS backend
4. Frontend Yarn setup
5. PostgreSQL + Prisma
6. Authentication
7. Document upload
8. FastAPI AI service
9. PDF parsing
10. Qdrant indexing
11. RAG chat
12. Source citations
13. Chat history
14. Frontend dashboard
15. Docker Compose integration
