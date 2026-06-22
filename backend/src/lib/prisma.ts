import dns from 'node:dns';
import { Resolver } from 'node:dns/promises';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaNeon, PrismaNeonHttp } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import pg from 'pg';
import ws from 'ws';
import { config } from '../config/index.js';
import { withDbRetry } from './dbErrors.js';

const backendDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDir, '../../../.env') });

const resolvedHostCache = new Map<string, string>();

function dnsServers(): string[] {
  const custom = process.env.DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean);
  return custom?.length ? custom : ['8.8.8.8', '1.1.1.1'];
}

function configureDns() {
  dns.setServers(dnsServers());
  dns.setDefaultResultOrder('ipv4first');
}

configureDns();

function parseDatabaseUrl(rawUrl: string): URL {
  return new URL(rawUrl.replace(/^postgresql:/, 'postgres:'));
}

/**
 * dns.lookup uses OS resolver (broken on WSL / some Windows VPN DNS).
 * dns.Resolver.resolve4 talks to DNS directly and respects setServers.
 */
async function resolveDatabaseHost(hostname: string): Promise<string> {
  if (process.env.DATABASE_HOST) return process.env.DATABASE_HOST;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return hostname;
  }

  const cached = resolvedHostCache.get(hostname);
  if (cached) return cached;

  const resolver = new Resolver({ timeout: 8000, tries: 2 });
  resolver.setServers(dnsServers());

  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const addresses = await resolver.resolve4(hostname);
      const ip = addresses[0];
      resolvedHostCache.set(hostname, ip);
      if (attempt > 1) {
        console.log(`Resolved ${hostname} → ${ip} (attempt ${attempt})`);
      }
      return ip;
    } catch {
      if (attempt === maxAttempts) break;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }

  console.warn(`Could not resolve ${hostname}; set DATABASE_HOST in .env to a Neon IPv4`);
  return hostname;
}

function sanitizeDatabaseUrl(rawUrl: string): string {
  const url = parseDatabaseUrl(rawUrl);
  url.searchParams.delete('channel_binding');
  url.searchParams.delete('sslmode');
  url.searchParams.delete('uselibpqcompat');
  return url.toString().replace(/^postgres:/, 'postgresql:');
}

function buildPgPoolConfig(rawUrl: string, resolvedHost: string): pg.PoolConfig {
  const url = parseDatabaseUrl(rawUrl);
  const hostname = url.hostname;
  const sslDisabled = url.searchParams.get('sslmode') === 'disable';
  const isRemote = !['localhost', '127.0.0.1'].includes(hostname);
  const useSsl = !sslDisabled && isRemote;

  return {
    host: resolvedHost,
    port: url.port ? Number(url.port) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    max: 10,
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 20_000,
    keepAlive: true,
    ...(useSsl && {
      ssl: {
        rejectUnauthorized: false,
        servername: hostname,
      },
    }),
  };
}

function createPgAdapter(rawUrl: string, resolvedHost: string) {
  const pool = new pg.Pool(buildPgPoolConfig(rawUrl, resolvedHost));
  pool.on('error', (err) => {
    console.error('PostgreSQL pool error:', err.message);
  });
  return new PrismaPg(pool);
}

function createNeonAdapter(rawUrl: string, driver: string) {
  const connectionString = sanitizeDatabaseUrl(rawUrl);
  if (driver === 'ws') {
    neonConfig.webSocketConstructor = ws;
    return new PrismaNeon({ connectionString });
  }
  return new PrismaNeonHttp(connectionString, {});
}

function globalForPrisma() {
  return globalThis as unknown as { prismaBase?: PrismaClient; prismaReady?: Promise<void> };
}

let baseClient: PrismaClient | null = null;
let prismaExtended: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaExtended) {
      throw new Error('Database not initialized — initPrisma() must complete before queries run');
    }
    const value = (prismaExtended as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(prismaExtended) : value;
  },
});

/** Resolve Neon DNS, then create the Prisma client. Must run before the server accepts traffic. */
export async function initPrisma(): Promise<void> {
  const g = globalForPrisma();
  if (g.prismaReady) {
    await g.prismaReady;
    return;
  }

  g.prismaReady = (async () => {
    if (g.prismaBase && prismaExtended) {
      baseClient = g.prismaBase;
      prismaExtended = baseClient.$extends({
        query: { $allOperations({ args, query }) { return withDbRetry(() => query(args)); } },
      }) as unknown as PrismaClient;
      return;
    }

    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error('DATABASE_URL is not set. Copy .env.example to .env and add your Neon connection string.');
    }

    const driver = (process.env.DATABASE_DRIVER || 'pg').toLowerCase();
    const hostname = parseDatabaseUrl(rawUrl).hostname;
    let adapter;

    if (rawUrl.includes('neon.tech') && (driver === 'ws' || driver === 'http')) {
      adapter = createNeonAdapter(rawUrl, driver);
    } else {
      const resolvedHost = await resolveDatabaseHost(hostname);
      if (resolvedHost !== hostname) {
        console.log(`Database host: ${hostname} → ${resolvedHost}`);
      }
      adapter = createPgAdapter(rawUrl, resolvedHost);
    }

    baseClient = new PrismaClient({
      adapter,
      log: config.nodeEnv === 'development' ? ['warn'] : ['error'],
    });

    prismaExtended = baseClient.$extends({
      query: {
        $allOperations({ args, query }) {
          return withDbRetry(() => query(args));
        },
      },
    }) as unknown as PrismaClient;

    if (config.nodeEnv !== 'production') {
      g.prismaBase = baseClient;
    }
  })();

  await g.prismaReady;
}

export type { User } from '../generated/prisma/client.js';
export {
  PermissionRole,
  ActivityType,
  DocumentType,
  NotificationType,
  AiRequestType,
  AiRequestStatus,
  AiRewriteAction,
  SummaryFormat,
  Prisma,
} from '../generated/prisma/client.js';

export async function verifyDatabaseConnection(retries = 6) {
  if (!baseClient) throw new Error('initPrisma() not called');
  await withDbRetry(() => baseClient!.$queryRaw`SELECT 1`, retries);
}

export async function warmDatabaseDns() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return;
  await resolveDatabaseHost(parseDatabaseUrl(rawUrl).hostname);
}
