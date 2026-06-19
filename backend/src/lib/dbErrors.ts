const TRANSIENT_CODES = ['EAI_AGAIN', 'ENETUNREACH', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];

export function getDbErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;

  if (err && typeof err === 'object') {
    for (const sym of Object.getOwnPropertySymbols(err)) {
      const val = (err as Record<symbol, unknown>)[sym];
      if (val instanceof Error && val.message) return val.message;
      if (val && typeof val === 'object' && 'code' in val) {
        const code = String((val as { code?: string }).code ?? '');
        const message = String((val as { message?: string }).message ?? '');
        return message || code;
      }
    }
  }

  return String(err);
}

export function isTransientDbError(err: unknown): boolean {
  const msg = getDbErrorMessage(err);
  if (TRANSIENT_CODES.some((code) => msg.includes(code))) return true;
  // Prisma / pg pool "can't reach server" during WSL DNS flakes
  if (/can't reach database server|connection terminated|connection timeout/i.test(msg)) return true;
  if (err && typeof err === 'object' && 'code' in err) {
    const code = String((err as { code?: string }).code);
    if (code === 'P2010' || code === 'P1001') return true;
  }
  return false;
}

export async function withDbRetry<T>(fn: () => Promise<T>, retries = 4): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isTransientDbError(err) || attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw lastError;
}
