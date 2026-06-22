import { Moon, Sun } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../lib/theme';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={clsx(
        'inline-flex items-center justify-center w-8 h-8 rounded-md border border-line bg-paper text-muted hover:text-ink hover:bg-surface transition-colors',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
