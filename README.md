# UniGuide AI

UniGuide AI is a university-assistant project for students. The MVP aims to provide authenticated access to university documents, AI answers with source citations, multilingual support, and chat history. These product capabilities are planned, not implemented yet.

## Current architecture and status

Step 8A establishes repository hygiene and local development conventions. The frontend is a Next.js starter; the backend exposes a starter `GET /` endpoint. PostgreSQL and the initial Prisma schema/migration exist, but the backend does not yet connect through a Prisma service. The next planned step is NestJS Prisma integration after review.

| Component | Implemented | Planned |
| --- | --- | --- |
| Frontend | Next.js 16.3.3, React, TypeScript, Tailwind CSS 4, App Router | Authentication screens, dashboard, document management, chat |
| Backend | NestJS 12, TypeScript, starter endpoint and tests | Prisma integration, authentication, university APIs, document/chat APIs |
| Data | PostgreSQL 16 via Docker Compose; Prisma 7.10.0; one initial migration | Application persistence and usage reporting |
| AI service | Empty local directory only | Python/FastAPI, parsing, embeddings, retrieval, RAG, LLM integration |
| Other infrastructure | None | Redis, Qdrant; production deployment |

The planned request path is frontend → NestJS → PostgreSQL and FastAPI. FastAPI will coordinate document processing, vector retrieval, and an LLM provider. No AI service or integration currently runs from this repository. LangChain/LangGraph and OpenAI/Gemini are candidates, not installed integrations.

## Repository structure

```text
frontend/           Next.js application; Yarn
backend/            NestJS application; npm
  prisma/           Schema and committed migration SQL
  src/generated/    Locally generated, ignored Prisma Client
ai-service/         Planned Python service; currently empty, absent in fresh clones
AGENTS.md           Current state, constraints, and next step
.env.example        Non-secret backend/local database reference
docker-compose.yml Local PostgreSQL service
```

## Package managers and prerequisites

- Frontend: Yarn only. Preserve `frontend/yarn.lock`; do not add a package-lock.
- Backend: npm only. Preserve `backend/package-lock.json`.
- Future AI service: pip with a Python virtual environment; do not initialize it yet.
- Use Node.js 22.21.1 or a compatible supported version; this baseline uses npm 10.9.4 and Yarn Classic 1.22.22.
- Install Docker Desktop with Docker Compose and Git. Start Docker Desktop before database commands.
- Keep Prisma and its client at the existing locked 7.10.0 version; do not upgrade during this step.

## Local ports

| Service | Port | State |
| --- | --- | --- |
| Next.js | 3000 | Implemented |
| NestJS | 3001 | Implemented |
| FastAPI | 8000 | Planned |
| PostgreSQL | 5432 | Implemented |
| Redis | 6379 | Planned |
| Qdrant HTTP | 6333 | Planned |

## Local development

From the repository root, prepare the backend environment once, without overwriting an existing file:

```bash
test -f backend/.env || cp .env.example backend/.env
docker compose up -d postgres
docker compose ps
```

The example credentials are for local development only. Actual `.env*` files are ignored throughout the repository; only `.env.example` files are intended for Git. Never put real secrets in an example. The root example is for the backend, not the frontend.

In `backend/`:

```bash
npm ci
npx prisma validate
npx prisma generate
npx prisma migrate status
```

For a new local database only, apply the existing committed migration with `npx prisma migrate deploy`. Do not create a replacement migration or use `prisma db push`. An existing database should report one migration and an up-to-date schema.

Start the backend in its own terminal:

```bash
cd backend
npm run start:dev
```

The backend defaults to http://localhost:3001. It reads `PORT` from the process environment, so an explicit override is `PORT=3001 npm run start:dev`. Prisma CLI loads `backend/.env` through `dotenv/config`; NestJS currently does not automatically load that file. Its port fallback means no environment change is required for normal startup.

Start the frontend in another terminal:

```bash
cd frontend
yarn install --frozen-lockfile
yarn dev
```

Open http://localhost:3000. Keep that port free; Next.js may otherwise select a different port. Turbopack is explicitly rooted at `frontend/`, which has its own Yarn dependencies. Stop either development server with Ctrl+C. Google Fonts access is currently needed for a clean frontend build.

## Prisma generated-client policy

Commit `backend/prisma/schema.prisma`, migrations, Prisma configuration, and npm lockfile. Do not commit `backend/src/generated/prisma/`: the `prisma-client` generator recreates it locally.

Run `npx prisma generate` inside `backend/` after dependency installation or any schema change, and before building on a fresh checkout. Generated code must not be edited manually. There is no automatic generation hook. Generation does not apply database migrations.

## Validation

From `frontend/`:

```bash
yarn lint
yarn exec tsc --noEmit --incremental false
yarn build
```

From `backend/`:

```bash
npm run lint
npm test
npm run build
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Run `git diff --check` from the root. A fresh frontend may need `yarn build` first to generate Next.js route types used by the standalone TypeScript check.
