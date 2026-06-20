-- Idempotent patch for AI productivity tables (safe to re-run)

DO $$ BEGIN CREATE TYPE "AiRequestType" AS ENUM ('REWRITE','GRAMMAR','SUMMARIZE','CHAT','INSIGHTS','SPEECH','VOICE_COMMAND','SPELL_CHECK'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AiRequestStatus" AS ENUM ('PENDING','COMPLETED','FAILED','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AiRewriteAction" AS ENUM ('IMPROVE','FIX_GRAMMAR','PROFESSIONAL','CASUAL','SHORTEN','EXPAND','SIMPLIFY','TECHNICAL','FORMAL','FRIENDLY','SUMMARIZE','EXPLAIN','TRANSLATE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SummaryFormat" AS ENUM ('BRIEF','DETAILED','BULLETS','EXECUTIVE','MEETING_NOTES','ACTION_ITEMS'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ai_requests" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentId" TEXT,
  "type" "AiRequestType" NOT NULL,
  "status" "AiRequestStatus" NOT NULL DEFAULT 'PENDING',
  "action" TEXT,
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "latencyMs" INTEGER,
  "metadata" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "ai_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_rewrites" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "requestId" TEXT,
  "action" "AiRewriteAction" NOT NULL,
  "originalText" TEXT NOT NULL,
  "resultText" TEXT NOT NULL,
  "accepted" BOOLEAN,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_rewrites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "speech_transcripts" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'en-US',
  "transcript" TEXT NOT NULL,
  "durationMs" INTEGER,
  "insertMode" TEXT,
  "wordCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "speech_transcripts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "user_dictionary" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "word" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_dictionary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "grammar_suggestions" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "originalText" TEXT NOT NULL,
  "suggestion" TEXT NOT NULL,
  "explanation" TEXT,
  "issueType" TEXT NOT NULL,
  "accepted" BOOLEAN,
  "ignored" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "grammar_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ai_usage_stats" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "rewriteCount" INTEGER NOT NULL DEFAULT 0,
  "grammarFixCount" INTEGER NOT NULL DEFAULT 0,
  "dictationCount" INTEGER NOT NULL DEFAULT 0,
  "summarizeCount" INTEGER NOT NULL DEFAULT 0,
  "chatCount" INTEGER NOT NULL DEFAULT 0,
  "acceptedSuggestions" INTEGER NOT NULL DEFAULT 0,
  "rejectedSuggestions" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_usage_stats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "document_summaries" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "format" "SummaryFormat" NOT NULL,
  "content" TEXT NOT NULL,
  "sourceHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_summaries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ai_requests_userId_createdAt_idx" ON "ai_requests"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ai_requests_documentId_createdAt_idx" ON "ai_requests"("documentId", "createdAt");
CREATE INDEX IF NOT EXISTS "ai_rewrites_documentId_createdAt_idx" ON "ai_rewrites"("documentId", "createdAt");
CREATE INDEX IF NOT EXISTS "ai_rewrites_userId_idx" ON "ai_rewrites"("userId");
CREATE INDEX IF NOT EXISTS "speech_transcripts_documentId_createdAt_idx" ON "speech_transcripts"("documentId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "user_dictionary_userId_word_key" ON "user_dictionary"("userId", "word");
CREATE INDEX IF NOT EXISTS "user_dictionary_userId_idx" ON "user_dictionary"("userId");
CREATE INDEX IF NOT EXISTS "grammar_suggestions_documentId_createdAt_idx" ON "grammar_suggestions"("documentId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "ai_usage_stats_userId_date_key" ON "ai_usage_stats"("userId", "date");
CREATE INDEX IF NOT EXISTS "document_summaries_documentId_createdAt_idx" ON "document_summaries"("documentId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ai_requests" ADD CONSTRAINT "ai_requests_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ai_rewrites" ADD CONSTRAINT "ai_rewrites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ai_rewrites" ADD CONSTRAINT "ai_rewrites_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "speech_transcripts" ADD CONSTRAINT "speech_transcripts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "speech_transcripts" ADD CONSTRAINT "speech_transcripts_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "user_dictionary" ADD CONSTRAINT "user_dictionary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "grammar_suggestions" ADD CONSTRAINT "grammar_suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "grammar_suggestions" ADD CONSTRAINT "grammar_suggestions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ai_usage_stats" ADD CONSTRAINT "ai_usage_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "document_summaries" ADD CONSTRAINT "document_summaries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "document_summaries" ADD CONSTRAINT "document_summaries_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
