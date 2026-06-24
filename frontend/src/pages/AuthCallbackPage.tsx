import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store';

function readTokenFromHash(): string | null {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  return params.get('token');
}

async function loadUserWithRetry(maxAttempts = 3): Promise<{ user: Awaited<ReturnType<typeof api.getMe>>['user'] }> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await api.getMe();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function finishSignIn() {
      try {
        const hashToken = readTokenFromHash();
        if (hashToken) {
          localStorage.setItem('token', hashToken);
          window.history.replaceState(null, '', window.location.pathname);
        }

        let user;
        let token: string;

        if (hashToken) {
          token = hashToken;
          try {
            ({ user } = await loadUserWithRetry());
          } catch {
            // Token was issued by our backend — proceed; dashboard auth query will retry
            navigate('/dashboard', { replace: true });
            return;
          }
        } else {
          ({ user, token } = await api.completeOAuthSession());
        }

        if (cancelled) return;

        localStorage.setItem('token', token);
        setUser(user);
        queryClient.setQueryData(['auth', 'me'], user);
        navigate('/dashboard', { replace: true });
      } catch {
        if (!cancelled) {
          navigate('/login?error=oauth_failed', { replace: true });
        }
      }
    }

    finishSignIn();

    return () => {
      cancelled = true;
    };
  }, [navigate, queryClient, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <div className="text-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted mt-4">Signing you in with Google…</p>
      </div>
    </div>
  );
}
