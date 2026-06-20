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
    <nav className="sticky top-0 z-30 glass-panel border-b border-line/60">
      <div className="max-w-6xl mx-auto px-6 h-[3.75rem] flex items-center justify-between gap-4">
        <Link to="/dashboard" className="group shrink-0">
          <Logo size="sm" textClassName="group-hover:text-accent transition-colors duration-200" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/dashboard/ai-analytics" className="btn-ghost !py-1.5 !px-2.5 text-muted hidden sm:inline-flex">
            <BarChart3 size={16} />
            AI Analytics
          </Link>
          <ThemeToggle />

          {user && (
            <>
              <div className="hidden sm:block w-px h-6 bg-line mx-0.5" />
              <div className="flex items-center gap-2.5 pl-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-paper shadow-md shrink-0"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-ink hidden md:block max-w-[140px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="btn-ghost !py-1.5 !px-2.5 text-muted"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
