import { useThemeStore } from '../store';

const STORAGE_KEY = 'collabdocs-theme';

export type Theme = 'light' | 'dark';

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
}

/** Call once before React mounts (also mirrored in index.html inline script). */
export function initTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    applyTheme(stored === 'dark' ? 'dark' : 'light');
  } catch {
    applyTheme('light');
  }
}

export function persistTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
