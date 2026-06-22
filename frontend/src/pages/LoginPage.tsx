import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useApi';
import { getGoogleAuthUrl } from '../lib/api';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { Logo } from '../components/layout/Logo';

const OAUTH_ERRORS: Record<string, string> = {
  oauth_failed: 'Google sign-in failed. Please try again.',
  oauth_denied: 'Google sign-in was cancelled.',
};

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

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError && OAUTH_ERRORS[oauthError]) {
      setError(OAUTH_ERRORS[oauthError]);
    }
  }, [searchParams]);

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-[#111111] text-[#ececec] p-12 border-r border-[#2a2a2a]">
        <Logo size="md" textClassName="text-[#ececec]" />
        <div className="max-w-md space-y-5">
          <h2 className="text-2xl font-semibold leading-snug tracking-tight">
            Documents that stay in sync, even offline.
          </h2>
          <p className="text-[#888] text-sm leading-relaxed">
            Real-time collaboration, version history, and sharing for teams who write together.
          </p>
          <ul className="space-y-2 pt-1">
            {['Live cursors', 'Version history', 'Offline sync'].map((item) => (
              <li key={item} className="text-sm text-[#888] flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#539bf5]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-[#555]">© CollabDocs</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-canvas relative min-h-screen">
        <div className="absolute top-5 right-5 sm:top-6 sm:right-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-sm animate-fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block">
            <Logo size="sm" />
          </Link>

          <div className="surface-card p-7">
            <h1 className="text-lg font-semibold text-ink mb-0.5">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted mb-5">
              {isRegister ? 'Get started in seconds' : 'Sign in to your workspace'}
            </p>

            {error && (
              <div className="text-sm badge badge-danger px-4 py-3 rounded-xl mb-4 w-full justify-start">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="field-group">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-field"
                  />
                </div>
              )}
              <div className="field-group">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="field-group">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending || registerMutation.isPending}
                className="btn-primary w-full mt-2"
              >
                {loginMutation.isPending || registerMutation.isPending
                  ? 'Please wait…'
                  : isRegister
                  ? 'Create account'
                  : 'Sign in'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-paper px-3 text-muted">or</span>
              </div>
            </div>

            <a href={getGoogleAuthUrl()} className="btn-secondary w-full">
              Continue with Google
            </a>

            <p className="text-center text-sm text-muted mt-6">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-accent font-medium hover:underline"
              >
                {isRegister ? 'Sign in' : 'Register'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-canvas">
      <nav className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between glass-panel sticky top-0 z-20">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link to="/login" className="btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <button type="button" onClick={() => navigate('/login')} className="btn-primary">
            Get started
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-5 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <p className="text-xs font-medium uppercase tracking-wider text-muted mb-3">Collaborative documents</p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-tight text-ink">
              Write together.<br />Stay in sync.
            </h1>
            <p className="text-base text-muted mt-4 leading-relaxed max-w-md">
              A document editor with live cursors, offline editing, version history, and effortless sharing.
            </p>
            <div className="flex flex-wrap gap-2 mt-8">
              <button type="button" onClick={() => navigate('/login')} className="btn-primary">
                Start for free
              </button>
              <a href="#features" className="btn-secondary">
                See features
              </a>
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <div className="surface-card overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-line bg-surface">
                <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                <span className="ml-2 text-xs text-muted">Quarterly Report</span>
              </div>
              <div className="p-6 space-y-2 bg-paper">
                <div className="h-2.5 w-1/3 preview-line rounded-sm" />
                <div className="h-1.5 w-full preview-line rounded-sm" />
                <div className="h-1.5 w-[90%] preview-line rounded-sm" />
                <div className="h-1.5 w-4/5 preview-line rounded-sm" />
                <div className="h-1.5 w-full preview-line rounded-sm mt-6" />
                <div className="h-1.5 w-3/4 preview-line rounded-sm" />
                <div className="flex gap-1.5 mt-8 items-center">
                  <div className="h-6 w-6 rounded-md bg-accent text-white text-[10px] flex items-center justify-center font-medium">A</div>
                  <div className="h-6 w-6 rounded-md bg-[#539bf5] text-white text-[10px] flex items-center justify-center font-medium -ml-2 ring-2 ring-paper">B</div>
                  <span className="text-xs text-muted ml-1">2 editing now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="mt-24 grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Live sync', desc: 'See edits and cursors from collaborators in real time, powered by CRDTs.' },
            { title: 'Version history', desc: 'Every change is tracked. Restore or reconstruct any point in time.' },
            { title: 'Share & collaborate', desc: 'Invite by link or email with viewer, editor, or owner permissions.' },
          ].map((f) => (
            <div key={f.title} className="p-5 surface-card">
              <h3 className="font-medium text-ink mb-1.5 text-sm">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
