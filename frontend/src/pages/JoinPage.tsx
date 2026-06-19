import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store';

export function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      return;
    }

    if (!isAuthenticated) {
      navigate(`/login?redirect=/join/${token}`, { replace: true });
      return;
    }

    api
      .joinByShareToken(token)
      .then(({ document }) => {
        navigate(`/document/${document.id}`, { replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to join document');
      });
  }, [token, isAuthenticated, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-brand-600 font-medium hover:text-brand-700"
        >
          Go to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        Joining document...
      </div>
    </div>
  );
}
