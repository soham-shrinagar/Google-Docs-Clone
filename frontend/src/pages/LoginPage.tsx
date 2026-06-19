import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useApi';
import { useAuthStore } from '../store';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const { loginMutation, registerMutation } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await registerMutation.mutateAsync({ email, password, name });
      } else {
        await loginMutation.mutateAsync({ email, password });
      }
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <FileText size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold">CollabDocs</span>
          </div>
          <p className="text-gray-500">
            Real-time collaborative editing powered by CRDTs
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold mb-6">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
            >
              {loginMutation.isPending || registerMutation.isPending
                ? 'Please wait...'
                : isRegister
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or continue with</span>
            </div>
          </div>

          <a
            href={`${apiUrl}/api/auth/google`}
            className="flex items-center justify-center gap-2 w-full py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </a>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {['CRDT Sync', 'Offline First', 'Version History'].map((feature) => (
            <div key={feature} className="bg-white/60 backdrop-blur rounded-xl p-3 border border-gray-100">
              <p className="text-xs font-medium text-gray-600">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-brand-900 to-purple-900 text-white">
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText size={18} />
          </div>
          <span className="font-bold text-xl">CollabDocs</span>
        </div>
        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className="bg-white text-gray-900 px-5 py-2 rounded-xl font-medium hover:bg-gray-100 transition-colors"
        >
          {isAuthenticated ? 'Dashboard' : 'Get Started'}
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Collaborate in<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Real Time
          </span>
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          Production-grade document editor with CRDT synchronization, offline-first editing,
          vector clocks, and conflict-free concurrent collaboration.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-brand-500 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-brand-600 transition-colors"
          >
            Start Editing
          </Link>
          <a
            href="#features"
            className="border border-white/30 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Learn More
          </a>
        </div>

        <div id="features" className="grid md:grid-cols-3 gap-6 mt-24 text-left">
          {[
            { title: 'CRDT Synchronization', desc: 'Yjs-powered conflict-free replicated data types ensure every edit merges deterministically.' },
            { title: 'Offline First', desc: 'Edit without connection. Operations queue locally and sync automatically on reconnect.' },
            { title: 'Version History', desc: 'Every operation stored. Reconstruct document state at any point in time.' },
            { title: 'Live Cursors', desc: 'See collaborators\' cursors, selections, and typing indicators in real time.' },
            { title: 'Vector Clocks', desc: 'Lamport timestamps and vector clocks track causality across distributed edits.' },
            { title: 'Network Simulator', desc: 'Test latency, packet loss, and partition recovery with built-in network controls.' },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
