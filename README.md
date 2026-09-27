# UniGuide AI

UniGuide AI is a university-assistant project for students. The MVP aims to provide authenticated access to university documents, AI answers with source citations, multilingual support, and chat history. Email/password registration and login are implemented in the backend. The remaining product capabilities are planned.

## Current architecture and status

Step 10A adds email/password registration and login with JWT access tokens to the existing NestJS/Prisma integration. The frontend remains a Next.js starter. Access-token verification and protected routes are the next planned auth step after review; issuing tokens does not yet protect any endpoint.

| Component | Implemented | Planned |
| --- | --- | --- |
| Frontend | Next.js 16.3.3, React, TypeScript, Tailwind CSS 4, App Router | Authentication screens, dashboard, document management, chat |
| Backend | NestJS 12, TypeScript, Prisma integration, registration/login, access tokens, validation and tests | Token verification, protected routes, university APIs, document/chat APIs |
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

The example credentials are for local development only. Actual `.env*` files are ignored throughout the repository; only `.env.example` files are intended for Git. Never put real secrets in an example. The root example is for the backend, not the frontend. Before starting NestJS, replace JWT_ACCESS_SECRET in backend/.env with a cryptographically random secret of at least 32 bytes. The committed placeholder is deliberately rejected. Never commit or share that secret; JWT_ACCESS_EXPIRES_IN defaults to 15m.

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

The backend defaults to http://localhost:3001. It reads `PORT` from the process environment, so an explicit override is `PORT=3001 npm run start:dev`. Both NestJS and Prisma CLI load `backend/.env` through `dotenv/config` when run from `backend/`. Existing process environment values take precedence. DATABASE_URL is required; startup fails clearly if it is missing or blank.

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
npm run test:e2e
npx prisma validate
npx prisma generate
npx prisma migrate status
```

Run `git diff --check` from the root. A fresh frontend may need `yarn build` first to generate Next.js route types used by the standalone TypeScript check.

The E2E suite requires PostgreSQL and a valid DATABASE_URL. It checks the existing HTTP endpoint, runs `SELECT 1`, and exercises auth with UUID-based temporary accounts. Auth tests delete only their exact run-owned email addresses, never truncate tables, and use an ephemeral signing secret. Use a local development/test database, not production. Prisma connects during module initialization and disconnects on app close or graceful process shutdown.

## Authentication foundation (Step 10A)

- `POST /auth/register` → 201: `{ "email": "student@example.com", "password": "a long private password", "name": "Student Name" }`. Name is optional and maps to the existing Prisma `fullName` field. Registration always creates a STUDENT with universityId null.
- `POST /auth/login` → 200: email and password only.
- Both return `{ user: { id, email, name, role, universityId }, accessToken }`. Password hashes never appear in responses or tokens.
- Email is trimmed and lowercased. Registration passwords must contain 8–128 characters; passwords are neither trimmed nor normalized. Optional names are trimmed and limited to 1–100 characters.
- Passwords use Argon2id (19 MiB memory, 2 iterations, parallelism 1) with library-generated salts. Unknown accounts also perform a dummy-hash verification to reduce timing differences.
- JWT uses HS256 with sub/email/role claims plus iat/exp. JWT_ACCESS_EXPIRES_IN accepts positive seconds or s/m/h/d durations (default 15m). Missing, blank, short, or placeholder secrets fail startup.
- Global validation rejects unexpected fields, including role and universityId. Invalid DTOs return 400, duplicate email 409 (including concurrent attempts), and unknown-email/wrong-password login returns the same generic 401 response. Unexpected exceptions use NestJS's generic 500 response.
- No refresh tokens, cookies, logout, `/auth/me`, guards, role authorization, email verification, password reset, or frontend auth exists yet. Rate limiting is also not implemented; this foundation is not a complete production authentication system.
