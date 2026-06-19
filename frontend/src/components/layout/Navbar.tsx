import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useAuth } from '../../hooks/useApi';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';

export function Navbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();

  return (
    <nav className="sticky top-0 z-30 border-b border-line/80 bg-paper/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/dashboard" className="group shrink-0">
          <Logo size="sm" textClassName="group-hover:text-accent transition-colors" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          {user && (
            <>
              <div className="hidden sm:block w-px h-6 bg-line mx-1" />
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ring-2 ring-paper shadow-sm shrink-0"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink hidden md:block max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-accent px-3 py-1.5 rounded-lg hover:bg-accent-soft transition-colors"
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
