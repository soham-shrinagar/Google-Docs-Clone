import { Link } from 'react-router-dom';
import { LogOut, BarChart3 } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useAuth } from '../../hooks/useApi';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 glass-panel">
      <div className="max-w-6xl mx-auto px-5 h-12 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="shrink-0">
          <Logo size="sm" />
        </Link>

        <div className="flex items-center gap-1">
          <Link to="/dashboard/ai-analytics" className="btn-ghost hidden sm:inline-flex">
            <BarChart3 size={15} />
            <span className="hidden md:inline">Analytics</span>
          </Link>
          <ThemeToggle />

          {user && (
            <>
              <div className="hidden sm:block w-px h-4 bg-line mx-1" />
              <div className="flex items-center gap-2 pl-1">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-medium shrink-0"
                  style={{ backgroundColor: user.color }}
                  aria-hidden
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-ink hidden md:block max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="btn-ghost"
                aria-label="Sign out"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
