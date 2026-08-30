-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'INDEXED', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "universityId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "country" TEXT,
    "domain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" UUID NOT NULL,
    "universityId" UUID NOT NULL,
    "uploadedById" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "language" TEXT,
    "pageCount" INTEGER,
    "sizeBytes" INTEGER,
    "errorMessage" TEXT,
    "indexedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "pageNumber" INTEGER,
    "vectorId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL,
    "chatSessionId" UUID NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "tokenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_universityId_idx" ON "User"("universityId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "University_slug_key" ON "University"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "University_domain_key" ON "University"("domain");

-- CreateIndex
CREATE INDEX "University_name_idx" ON "University"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Document_storageKey_key" ON "Document"("storageKey");

-- CreateIndex
CREATE INDEX "Document_universityId_status_idx" ON "Document"("universityId", "status");

-- CreateIndex
CREATE INDEX "Document_uploadedById_idx" ON "Document"("uploadedById");

-- CreateIndex
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_vectorId_key" ON "DocumentChunk"("vectorId");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentChunk_documentId_chunkIndex_key" ON "DocumentChunk"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "ChatSession_userId_updatedAt_idx" ON "ChatSession"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatMessage_chatSessionId_createdAt_idx" ON "ChatMessage"("chatSessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_role_idx" ON "ChatMessage"("role");

-- CreateIndex
CREATE INDEX "AIUsage_userId_createdAt_idx" ON "AIUsage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AIUsage_provider_model_idx" ON "AIUsage"("provider", "model");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatSessionId_fkey" FOREIGN KEY ("chatSessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
