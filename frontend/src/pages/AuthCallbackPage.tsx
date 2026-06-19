import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function finishSignIn() {
      try {
        const { user, token } = await api.completeOAuthSession();
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
