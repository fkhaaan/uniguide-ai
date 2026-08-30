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

## Current Step

Step 5 — PostgreSQL + Prisma setup.

Next commands inside `backend/`:

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

Do not proceed beyond Prisma initialization until the generated files and configuration are reviewed.

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
