import { create } from 'zustand';
import type {
  User,
  ConnectionStatus,
  DistributedEvent,
  Notification,
  NetworkSimSettings,
  PresenceUser,
} from '../types';

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
  crdtEvents: DistributedEvent[];
  showCrdtInternals: boolean;
  showNetworkSim: boolean;
  showAnalytics: boolean;
  showVersionHistory: boolean;
  presenceUsers: PresenceUser[];
  networkSim: NetworkSimSettings;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setSyncStatus: (status: string) => void;
  addCrdtEvent: (event: DistributedEvent) => void;
  clearCrdtEvents: () => void;
  toggleCrdtInternals: () => void;
  toggleNetworkSim: () => void;
  toggleAnalytics: () => void;
  toggleVersionHistory: () => void;
  setPresenceUsers: (users: PresenceUser[]) => void;
  updateNetworkSim: (settings: Partial<NetworkSimSettings>) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  connectionStatus: 'connecting',
  syncStatus: 'Initializing...',
  crdtEvents: [],
  showCrdtInternals: false,
  showNetworkSim: false,
  showAnalytics: false,
  showVersionHistory: false,
  presenceUsers: [],
  networkSim: { latency: 0, packetLoss: 0, bandwidth: 0, disconnected: false },
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  addCrdtEvent: (event) =>
    set((state) => ({ crdtEvents: [event, ...state.crdtEvents].slice(0, 200) })),
  clearCrdtEvents: () => set({ crdtEvents: [] }),
  toggleCrdtInternals: () => set((s) => ({ showCrdtInternals: !s.showCrdtInternals })),
  toggleNetworkSim: () => set((s) => ({ showNetworkSim: !s.showNetworkSim })),
  toggleAnalytics: () => set((s) => ({ showAnalytics: !s.showAnalytics })),
  toggleVersionHistory: () => set((s) => ({ showVersionHistory: !s.showVersionHistory })),
  setPresenceUsers: (users) => set({ presenceUsers: users }),
  updateNetworkSim: (settings) =>
    set((s) => ({ networkSim: { ...s.networkSim, ...settings } })),
}));

interface NotificationState {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set((s) => ({ notifications: [notification, ...s.notifications] })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
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
