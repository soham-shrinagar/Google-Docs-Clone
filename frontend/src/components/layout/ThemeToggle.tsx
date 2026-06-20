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
        'relative flex items-center gap-1 p-1 rounded-full border transition-all',
        'border-line bg-surface hover:border-accent/30',
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span
        className={clsx(
          'absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full transition-all duration-300',
          'bg-accent shadow-sm',
          isDark ? 'left-[calc(50%+1px)]' : 'left-1'
        )}
      />
      <span className={clsx('relative z-10 p-1.5 rounded-full transition-colors', !isDark && 'text-white')}>
        <Sun size={15} strokeWidth={2} />
      </span>
      <span className={clsx('relative z-10 p-1.5 rounded-full transition-colors', isDark && 'text-white')}>
        <Moon size={15} strokeWidth={2} />
      </span>
    </button>
  );
}
