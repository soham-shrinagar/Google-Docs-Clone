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

function isAllowedCallback(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      isAllowedOrigin(parsed.origin) &&
      parsed.pathname === '/api/auth/google/callback'
    );
  } catch {
    return false;
  }
}

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

export function parseOAuthState(state: string): { origin: string; callback: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as {
      o?: string;
      c?: string;
      t?: number;
    };
    if (!parsed.o || !parsed.t) return null;
    if (Date.now() - parsed.t > 15 * 60 * 1000) return null;
    if (!isAllowedOrigin(parsed.o)) return null;
    const callback = parsed.c || `${parsed.o}/api/auth/google/callback`;
    if (!isAllowedCallback(callback)) return null;
    return { origin: parsed.o, callback };
  } catch {
    return null;
  }
}

function oauthStateFromRequest(req: Request): { origin: string; callback: string } | null {
  const state = req.query.state;
  if (typeof state !== 'string' || !state) return null;
  return parseOAuthState(state);
}

export function publicAppOrigin(req: Request): string {
  return (
    oauthStateFromRequest(req)?.origin ||
    configuredAppOrigin() ||
    originFromHeaders(req) ||
    'http://localhost:5173'
  );
}

export function resolveOAuthOrigin(req: Request): string {
  return publicAppOrigin(req);
}

export function oauthCallbackUrl(req: Request): string {
  const fromState = oauthStateFromRequest(req)?.callback;
  if (fromState) return fromState;
  return `${resolveOAuthOrigin(req)}/api/auth/google/callback`;
}

export function encodeOAuthState(origin: string, callback: string): string {
  return Buffer.from(JSON.stringify({ o: origin, c: callback, t: Date.now() })).toString('base64url');
}
