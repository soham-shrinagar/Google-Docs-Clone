import type { Request } from 'express';
import { config } from '../config/index.js';

const BLOCKED_HOSTS = ['onrender.com'];

function isAllowedOrigin(origin: string): boolean {
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    return !BLOCKED_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** Explicit production frontend URL — set CLIENT_URL or PUBLIC_APP_URL on Render. */
function configuredAppOrigin(): string | null {
  for (const raw of [config.publicAppUrl, config.clientUrl]) {
    const url = raw.replace(/\/$/, '');
    if (url && isAllowedOrigin(url)) return url;
  }
  return null;
}

function originFromHeaders(req: Request): string | null {
  const forwardedHost = req.get('x-forwarded-host');
  if (forwardedHost) {
    const host = forwardedHost.split(',')[0].trim();
    if (host && !host.includes('onrender.com')) {
      const proto = (req.get('x-forwarded-proto') || 'https').split(',')[0].trim();
      const origin = `${proto}://${host}`;
      if (isAllowedOrigin(origin)) return origin;
    }
  }

  const origin = req.get('origin');
  if (origin && isAllowedOrigin(origin)) return origin;

  const referer = req.get('referer');
  if (referer) {
    try {
      const originFromReferer = new URL(referer).origin;
      if (isAllowedOrigin(originFromReferer)) return originFromReferer;
    } catch {
      /* ignore */
    }
  }

  return null;
}

/** Public app URL — never onrender.com (Chrome Safe Browsing blocks it during OAuth). */
export function publicAppOrigin(req: Request): string {
  return (
    originFromOAuthState(req) ||
    configuredAppOrigin() ||
    originFromHeaders(req) ||
    'http://localhost:5173'
  );
}

export function oauthCallbackUrl(req: Request): string {
  return `${publicAppOrigin(req)}/api/auth/google/callback`;
}

export function encodeOAuthState(origin: string): string {
  return Buffer.from(JSON.stringify({ o: origin, t: Date.now() })).toString('base64url');
}

export function decodeOAuthState(state: string): string | null {
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      o?: string;
      t?: number;
    };
    if (!parsed.o || !parsed.t) return null;
    if (Date.now() - parsed.t > 15 * 60 * 1000) return null;
    if (!isAllowedOrigin(parsed.o)) return null;
    return parsed.o;
  } catch {
    return null;
  }
}

function originFromOAuthState(req: Request): string | null {
  const state = req.query.state;
  if (typeof state !== 'string' || !state) return null;
  return decodeOAuthState(state);
}

export function resolveOAuthOrigin(req: Request): string {
  const fromState = originFromOAuthState(req);
  if (fromState) return fromState;
  return publicAppOrigin(req);
}
