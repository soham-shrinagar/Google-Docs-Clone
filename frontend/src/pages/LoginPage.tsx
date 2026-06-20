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
      <div className="hidden lg:flex flex-col justify-between hero-banner text-paper p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-grid opacity-[0.07]" />
        <div className="absolute -right-20 top-1/3 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-20 w-60 h-60 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="relative">
          <Logo size="md" textClassName="text-paper" />
        </div>
        <div className="relative max-w-md space-y-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent-muted">CollabDocs</p>
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Documents that stay in sync, even offline.
          </h2>
          <p className="text-paper/70 text-lg leading-relaxed">
            Real-time collaboration, version history, and sharing — built for teams who write together.
          </p>
          <div className="flex gap-6 pt-2">
            {['Live cursors', 'Version history', 'Offline sync'].map((item) => (
              <span key={item} className="text-sm text-paper/60 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-muted" />
                {item}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-paper/35">© CollabDocs</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10 bg-mesh relative min-h-screen">
        <div className="absolute top-5 right-5 sm:top-8 sm:right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md animate-fade-up">
          <Link to="/" className="lg:hidden mb-8 inline-block">
            <Logo size="sm" />
          </Link>

          <div className="glass-panel rounded-2xl p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-ink mb-1">
              {isRegister ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted mb-6">
              {isRegister ? 'Get started in seconds — it\'s free' : 'Sign in to continue to your workspace'}
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
    <div className="min-h-screen bg-mesh overflow-hidden">
      <nav className="max-w-6xl mx-auto px-6 h-[3.75rem] flex items-center justify-between glass-panel border-b border-line/50 sticky top-0 z-20">
        <Logo size="sm" />
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link to="/login" className="btn-ghost hidden sm:inline-flex">
            Sign in
          </Link>
          <button type="button" onClick={() => navigate('/login')} className="btn-primary !py-2 !px-4">
            Get started
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="animate-fade-up">
            <p className="text-sm font-semibold text-gradient mb-4 tracking-wide">Real-time collaboration</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-ink">
              Write together.<br />
              <span className="text-gradient">Stay in sync.</span>
            </h1>
            <p className="text-lg text-muted mt-6 leading-relaxed max-w-lg">
              A modern document editor with live cursors, offline editing, version history, and effortless sharing.
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <button type="button" onClick={() => navigate('/login')} className="btn-primary">
                Start for free
              </button>
              <a href="#features" className="btn-secondary">
                See features
              </a>
            </div>
          </div>

          <div className="relative animate-fade-up lg:pl-4" style={{ animationDelay: '0.12s' }}>
            <div className="absolute -inset-6 bg-accent/15 rounded-[2rem] blur-3xl" />
            <div className="relative glass-panel rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-surface/80">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs text-muted font-medium">Quarterly Report — CollabDocs</span>
              </div>
              <div className="p-8 space-y-3 bg-paper">
                <div className="h-3.5 w-1/3 rounded-full bg-gradient-to-r from-accent to-violet-400 opacity-80" />
                <div className="h-2 w-full preview-line rounded-full" />
                <div className="h-2 w-[90%] preview-line rounded-full" />
                <div className="h-2 w-4/5 preview-line rounded-full" />
                <div className="h-2 w-full preview-line rounded-full mt-8" />
                <div className="h-2 w-3/4 preview-line rounded-full" />
                <div className="flex gap-2 mt-10 items-center">
                  <div className="h-7 w-7 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shadow-md">A</div>
                  <div className="h-7 w-7 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold -ml-3 ring-2 ring-paper shadow-md">B</div>
                  <span className="text-xs text-muted font-medium ml-1">2 editing now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section id="features" className="mt-32 grid sm:grid-cols-3 gap-6">
          {[
            { title: 'Live sync', desc: 'See edits and cursors from collaborators in real time, powered by CRDTs.', color: 'from-indigo-500 to-violet-500' },
            { title: 'Version history', desc: 'Every change is tracked. Restore or reconstruct any point in time.', color: 'from-violet-500 to-purple-500' },
            { title: 'Share & collaborate', desc: 'Invite by link or email with viewer, editor, or owner permissions.', color: 'from-blue-500 to-indigo-500' },
          ].map((f) => (
            <div key={f.title} className="p-6 bg-paper rounded-2xl card-interactive">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg`}>
                <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
              </div>
              <h3 className="font-bold text-ink mb-2 text-lg">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
