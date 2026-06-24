/**
 * Drops all data in the public schema and reapplies Prisma migrations from scratch.
 * Usage: npm run db:reset
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';
import pg from 'pg';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(backendDir, '..');
dotenv.config({ path: path.join(backendDir, '../../.env') });

function directHost(rawUrl: string): string {
  const url = new URL(rawUrl.replace(/^postgresql:/, 'postgres:'));
  return url.hostname.replace('-pooler.', '.');
}

async function buildPool(rawUrl: string): Promise<pg.Pool> {
  const url = new URL(rawUrl.replace(/^postgresql:/, 'postgres:'));
  const hostname = directHost(rawUrl);

  return new pg.Pool({
    host: process.env.DATABASE_HOST || hostname,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    max: 1,
    connectionTimeoutMillis: 30_000,
    ssl: {
      rejectUnauthorized: false,
      servername: hostname,
    },
  });
}

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  console.log(`Target: ${directHost(rawUrl)}`);
  console.log('\n⚠️  Dropping public schema (all data will be lost)…');

  const pool = await buildPool(rawUrl);
  try {
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE');
    await pool.query('CREATE SCHEMA public');
    await pool.query('GRANT ALL ON SCHEMA public TO public');
    console.log('✓ Database cleared');
  } finally {
    await pool.end();
  }

  console.log('\n→ Applying migrations…');
  const deploy = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  if (deploy.status !== 0) {
    process.exit(deploy.status ?? 1);
  }

  console.log('\n→ Generating Prisma client…');
  const gen = spawnSync('npx', ['prisma', 'generate'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  console.log('\n✓ Database reset and migrations applied');
  process.exit(gen.status ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
