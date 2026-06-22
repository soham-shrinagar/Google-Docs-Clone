-- Workspace document types + workspace persistence tables
-- Safe to re-run: uses IF NOT EXISTS / duplicate_object guards where possible

DO $$ BEGIN
  CREATE TYPE "DocumentType" AS ENUM ('RICH_TEXT', 'WORKSPACE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'UPLOADED';
ALTER TYPE "ActivityType" ADD VALUE IF NOT EXISTS 'EXPORTED';

ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "documentType" "DocumentType" NOT NULL DEFAULT 'RICH_TEXT';
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "workspaceMeta" JSONB;

CREATE INDEX IF NOT EXISTS "documents_documentType_idx" ON "documents"("documentType");

CREATE TABLE IF NOT EXISTS "workspace_assets" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "scanStatus" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workspace_assets_documentId_idx" ON "workspace_assets"("documentId");

DO $$ BEGIN
  ALTER TABLE "workspace_assets" ADD CONSTRAINT "workspace_assets_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "workspace_pages" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "pageIndex" INTEGER NOT NULL,
  "width" DOUBLE PRECISION NOT NULL DEFAULT 816,
  "height" DOUBLE PRECISION NOT NULL DEFAULT 1056,
  "backgroundType" TEXT NOT NULL DEFAULT 'blank',
  "backgroundUrl" TEXT,
  "backgroundMeta" JSONB,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_pages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workspace_pages_documentId_pageIndex_idx" ON "workspace_pages"("documentId", "pageIndex");

DO $$ BEGIN
  ALTER TABLE "workspace_pages" ADD CONSTRAINT "workspace_pages_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "workspace_elements" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "layer" TEXT NOT NULL DEFAULT 'drawing',
  "zIndex" INTEGER NOT NULL DEFAULT 0,
  "transform" JSONB NOT NULL,
  "style" JSONB,
  "data" JSONB NOT NULL DEFAULT '{}',
  "locked" BOOLEAN NOT NULL DEFAULT false,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "name" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "workspace_elements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "workspace_elements_documentId_pageId_idx" ON "workspace_elements"("documentId", "pageId");

DO $$ BEGIN
  ALTER TABLE "workspace_elements" ADD CONSTRAINT "workspace_elements_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "workspace_elements" ADD CONSTRAINT "workspace_elements_pageId_fkey"
    FOREIGN KEY ("pageId") REFERENCES "workspace_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "document_exports" (
  "id" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'completed',
  "url" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "document_exports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "document_exports_documentId_createdAt_idx" ON "document_exports"("documentId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "document_exports" ADD CONSTRAINT "document_exports_documentId_fkey"
    FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
