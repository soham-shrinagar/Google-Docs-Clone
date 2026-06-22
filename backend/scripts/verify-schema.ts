/**
 * Read-only schema verification against Neon/PostgreSQL.
 * Run: npm run db:verify -w backend
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dns from 'node:dns';
import { Resolver } from 'node:dns/promises';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDir, '../../.env') });

function parseDatabaseUrl(rawUrl: string): URL {
  return new URL(rawUrl.replace(/^postgresql:/, 'postgres:'));
}

function directHost(rawUrl: string): string {
  return parseDatabaseUrl(rawUrl).hostname.replace('-pooler.', '.');
}

async function resolveIpv4(hostname: string): Promise<string> {
  if (process.env.DATABASE_HOST) return process.env.DATABASE_HOST;
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  const resolver = new Resolver({ timeout: 8000, tries: 3 });
  resolver.setServers(['8.8.8.8', '1.1.1.1']);
  const addresses = await resolver.resolve4(hostname);
  return addresses[0];
}

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const url = parseDatabaseUrl(rawUrl);
  const hostname = directHost(rawUrl);
  const host = await resolveIpv4(hostname);

  const pool = new pg.Pool({
    host,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    max: 1,
    ssl: { rejectUnauthorized: false, servername: hostname },
  });

  const cols = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'documents'
     ORDER BY ordinal_position`
  );

  const tables = await pool.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  );

  console.log('Database:', url.pathname.replace(/^\//, ''));
  console.log('Host:', hostname);
  console.log('\ndocuments columns:', cols.rows.map((r) => r.column_name).join(', '));

  const required = ['documentType', 'workspaceMeta'];
  const missing = required.filter(
    (c) => !cols.rows.some((r) => r.column_name === c)
  );

  if (missing.length) {
    console.error('\n✗ Missing required columns:', missing.join(', '));
    console.error('  Run: npm run db:push');
    process.exit(1);
  }

  const workspaceTables = ['workspace_pages', 'workspace_assets', 'workspace_elements', 'document_exports'];
  const tableNames = tables.rows.map((r) => r.tablename as string);
  const missingTables = workspaceTables.filter((t) => !tableNames.includes(t));

  if (missingTables.length) {
    console.error('\n✗ Missing workspace tables:', missingTables.join(', '));
    console.error('  Run: npm run db:push');
    process.exit(1);
  }

  console.log('\n✓ Schema OK for workspace PDF uploads');
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
