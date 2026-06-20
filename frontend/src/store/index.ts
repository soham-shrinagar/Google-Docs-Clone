import { create } from 'zustand';
import { persistTheme, type Theme } from '../lib/theme.js';
import type { User, ConnectionStatus, PresenceUser } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));

interface EditorState {
  connectionStatus: ConnectionStatus;
  syncStatus: string;
  showVersionHistory: boolean;
  presenceUsers: PresenceUser[];
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSyncStatus: (status: string) => void;
  toggleVersionHistory: () => void;
  setPresenceUsers: (users: PresenceUser[]) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  connectionStatus: 'connecting',
  syncStatus: 'Connecting...',
  showVersionHistory: false,
  presenceUsers: [],
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  toggleVersionHistory: () => set((s) => ({ showVersionHistory: !s.showVersionHistory })),
  setPresenceUsers: (users) => set({ presenceUsers: users }),
}));

interface DashboardState {
  search: string;
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
  filterPinned: boolean;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilterPinned: (pinned: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  search: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  filterPinned: false,
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setFilterPinned: (filterPinned) => set({ filterPinned }),
}));

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  setTheme: (theme) => {
    persistTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },
}));
