/**
 * Schema push with Neon-friendly connectivity.
 * 1. Tries Prisma db push (direct non-pooler hostname)
 * 2. Falls back to Neon serverless HTTP (works when TCP/5432 is blocked on WSL/VPN)
 */
import { spawnSync } from 'node:child_process';
import dns from 'node:dns';
import { Resolver } from 'node:dns/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import pg from 'pg';
import { Pool as NeonPool } from '@neondatabase/serverless';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.join(backendDir, '..');
dotenv.config({ path: path.join(backendDir, '../../.env') });

function dnsServers(): string[] {
  const custom = process.env.DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean);
  return custom?.length ? custom : ['8.8.8.8', '1.1.1.1'];
}

function parseDatabaseUrl(rawUrl: string): URL {
  return new URL(rawUrl.replace(/^postgresql:/, 'postgres:'));
}

function sanitizeDatabaseUrl(rawUrl: string): string {
  const url = parseDatabaseUrl(rawUrl);
  url.searchParams.delete('channel_binding');
  url.searchParams.delete('uselibpqcompat');
  if (!url.searchParams.has('sslmode')) url.searchParams.set('sslmode', 'require');
  return url.toString().replace(/^postgres:/, 'postgresql:');
}

function directHost(rawUrl: string): string {
  return parseDatabaseUrl(rawUrl).hostname.replace('-pooler.', '.');
}

async function resolveIpv4(hostname: string): Promise<string> {
  if (process.env.DATABASE_HOST) return process.env.DATABASE_HOST;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return hostname;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return hostname;

  dns.setServers(dnsServers());
  const resolver = new Resolver({ timeout: 8000, tries: 3 });
  resolver.setServers(dnsServers());

  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const addresses = await resolver.resolve4(hostname);
      if (addresses[0]) return addresses[0];
    } catch {
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw new Error(`Could not resolve ${hostname}. Set DATABASE_HOST in .env to a Neon IPv4.`);
}

async function buildPgPool(rawUrl: string): Promise<pg.Pool> {
  const url = parseDatabaseUrl(rawUrl);
  const hostname = directHost(rawUrl);
  const resolvedHost = await resolveIpv4(hostname);

  const pool = new pg.Pool({
    host: resolvedHost,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    max: 1,
    connectionTimeoutMillis: 20_000,
    ssl: {
      rejectUnauthorized: false,
      servername: hostname,
    },
  });

  await pool.query('SELECT 1');
  return pool;
}

async function tryNeonHttp(rawUrl: string): Promise<boolean> {
  try {
    const pool = new NeonPool({ connectionString: sanitizeDatabaseUrl(rawUrl) });
    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch {
    return false;
  }
}

function prismaPushUrl(rawUrl: string): string {
  const url = parseDatabaseUrl(rawUrl);
  url.hostname = directHost(rawUrl);
  url.searchParams.delete('channel_binding');
  url.searchParams.delete('uselibpqcompat');
  if (!url.searchParams.has('sslmode')) url.searchParams.set('sslmode', 'require');
  return url.toString().replace(/^postgres:/, 'postgresql:');
}

function runPrismaDbPush(databaseUrl: string): boolean {
  const push = spawnSync('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
    shell: true,
  });
  return push.status === 0;
}

function generateDiffSql(mode: 'empty' | 'datasource', databaseUrl?: string): string | null {
  const args = mode === 'empty'
    ? ['prisma', 'migrate', 'diff', '--from-empty', '--to-schema', 'prisma/schema.prisma', '--script']
    : ['prisma', 'migrate', 'diff', '--from-config-datasource', '--to-schema', 'prisma/schema.prisma', '--script'];

  const diff = spawnSync('npx', args, {
    cwd: backendRoot,
    encoding: 'utf-8',
    env: databaseUrl ? { ...process.env, DATABASE_URL: databaseUrl } : process.env,
    shell: true,
  });

  if (diff.status !== 0) {
    if (diff.stderr) console.warn(diff.stderr.trim());
    return null;
  }
  return diff.stdout.trim() || null;
}

async function tableExists(pool: pg.Pool, table: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT to_regclass($1) AS reg`,
    [`public.${table}`]
  );
  return rows[0]?.reg != null;
}

async function applySqlViaPg(pool: pg.Pool, sql: string) {
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function applySqlViaNeon(rawUrl: string, sql: string) {
  const pool = new NeonPool({ connectionString: sanitizeDatabaseUrl(rawUrl) });
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await pool.query(statement);
  }
  await pool.end();
}

async function main() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  console.log(`Target: ${directHost(rawUrl)}`);

  // Attempt 1: standard Prisma db push (direct hostname)
  console.log('\n→ Trying Prisma db push…');
  if (runPrismaDbPush(prismaPushUrl(rawUrl))) {
    console.log('✓ Schema synced via Prisma db push');
  } else {
    console.log('\n→ Prisma db push failed — trying pg pool with resolved IPv4 + SSL SNI…');

    let applied = false;

    try {
      const pool = await buildPgPool(rawUrl);
      console.log('✓ Connected via pg pool');

      const hasAiTables = await tableExists(pool, 'ai_requests');
      let diffSql = hasAiTables
        ? generateDiffSql('datasource', prismaPushUrl(rawUrl))
        : null;

      if (!diffSql && !hasAiTables) {
        console.log('→ Generating full schema SQL…');
        diffSql = generateDiffSql('empty');
      }

      if (diffSql) {
        console.log('Applying schema changes…');
        await applySqlViaPg(pool, diffSql);
        applied = true;
        console.log('✓ Schema applied via pg pool');
      } else if (hasAiTables) {
        console.log('✓ AI tables present — schema appears up to date');
        applied = true;
      }
      await pool.end();
    } catch (pgErr) {
      console.warn('pg pool failed:', pgErr instanceof Error ? pgErr.message : pgErr);
    }

    if (!applied) {
      console.log('\n→ Trying Neon serverless HTTP…');
      const httpOk = await tryNeonHttp(rawUrl);
      if (httpOk) {
        console.log('✓ Connected via Neon HTTP');
        const diffSql = generateDiffSql('empty');
        if (diffSql) {
          await applySqlViaNeon(rawUrl, diffSql);
          applied = true;
          console.log('✓ Schema applied via Neon HTTP');
        }
      }
    }

    if (!applied) {
      console.error(`
Could not sync schema. Try:
  1. Wake your Neon project in the Neon console
  2. Run from Windows PowerShell: npm run db:push
  3. Fix WSL DNS: echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
  4. Set DATABASE_HOST=<ipv4> in .env (from: nslookup your-host.neon.tech 8.8.8.8)
`);
      process.exit(1);
    }
  }

  const gen = spawnSync('npx', ['prisma', 'generate'], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
    shell: true,
  });

  process.exit(gen.status ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
