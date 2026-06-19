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
      <div className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-10" />
        <div className="relative">
          <Logo size="md" textClassName="text-paper" />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-snug tracking-tight">
            Documents that stay in sync, even when you&apos;re offline.
          </h2>
          <p className="text-paper/60 mt-4 leading-relaxed">
            Real-time collaboration, version history, and sharing — built for teams who write together.
          </p>
        </div>
        <p className="relative text-sm text-paper/40">© CollabDocs</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-canvas relative">
        <div className="absolute top-5 right-5 sm:top-8 sm:right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block">
            <Logo size="sm" />
          </Link>

          <div className="bg-paper rounded-2xl border border-line shadow-sm p-8">
            <h1 className="text-xl font-semibold text-ink mb-1">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted mb-6">
              {isRegister ? 'Get started in seconds' : 'Sign in to continue to your workspace'}
            </p>

            {error && (
              <div className="text-sm text-ink bg-canvas border border-line px-4 py-3 rounded-xl mb-4">{error}</div>
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
    <div className="min-h-screen bg-canvas overflow-hidden">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-muted hover:text-ink px-3 py-2">
            Sign in
          </Link>
          <button type="button" onClick={() => navigate('/login')} className="btn-primary !py-2 !px-4">
            Get started
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <p className="text-sm font-medium text-accent mb-4">Real-time collaboration</p>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.15] text-ink">
              Write together.<br />Stay in sync.
            </h1>
            <p className="text-lg text-muted mt-5 leading-relaxed max-w-lg">
              A modern document editor with live cursors, offline editing, version history, and effortless sharing.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button type="button" onClick={() => navigate('/login')} className="btn-primary">
                Start for free
              </button>
              <a href="#features" className="btn-secondary">
                See features
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up lg:pl-4" style={{ animationDelay: '0.1s' }}>
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl" />
            <div className="relative bg-paper rounded-2xl border border-line shadow-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-canvas">
                <div className="w-2.5 h-2.5 rounded-full bg-line" />
                <div className="w-2.5 h-2.5 rounded-full bg-line" />
                <div className="w-2.5 h-2.5 rounded-full bg-line" />
                <span className="ml-2 text-xs text-muted">Quarterly Report — CollabDocs</span>
              </div>
              <div className="p-8 space-y-3">
                <div className="h-3 w-1/3 bg-accent/30 rounded-full" />
                <div className="h-2 w-full preview-line rounded-full" />
                <div className="h-2 w-[90%] preview-line rounded-full" />
                <div className="h-2 w-4/5 preview-line rounded-full" />
                <div className="h-2 w-full preview-line rounded-full mt-6" />
                <div className="h-2 w-3/4 preview-line rounded-full" />
                <div className="flex gap-2 mt-8">
                  <div className="h-6 w-6 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">A</div>
                  <div className="h-6 w-6 rounded-full bg-ink/70 text-white text-[10px] flex items-center justify-center font-bold -ml-3 ring-2 ring-paper">B</div>
                  <span className="text-xs text-muted self-center ml-1">2 editing now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="mt-28 grid sm:grid-cols-3 gap-6">
          {[
            { title: 'Live sync', desc: 'See edits and cursors from collaborators in real time, powered by CRDTs.' },
            { title: 'Version history', desc: 'Every change is tracked. Restore or reconstruct any point in time.' },
            { title: 'Share & collaborate', desc: 'Invite by link or email with viewer, editor, or owner permissions.' },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-paper rounded-2xl border border-line card-hover">
              <div className="w-9 h-9 rounded-xl bg-accent-soft flex items-center justify-center mb-4">
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
              <h3 className="font-semibold text-ink mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
