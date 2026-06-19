export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  color: string;
  createdAt?: string;
}

export type PermissionRole = 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';

export interface Document {
  id: string;
  title: string;
  thumbnail: string | null;
  owner: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  collaboratorCount: number;
  operationCount: number;
  permission: PermissionRole;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  type: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface PresenceUser {
  userId: string;
  name: string;
  avatar: string | null;
  color: string;
  cursorPos?: { anchor: number; head: number };
  selection?: { from: number; to: number };
  isTyping: boolean;
  isOnline: boolean;
  lastActive: string;
}

export interface DistributedEvent {
  id: string;
  type: 'insert' | 'delete' | 'format' | 'sync' | 'merge' | 'conflict_resolved';
  userId: string;
  documentId: string;
  timestamp: number;
  lamportTimestamp: number;
  vectorClock: Record<string, number>;
  payload?: Record<string, unknown>;
  description: string;
}

export interface DocumentVersion {
  id: string;
  versionNum: number;
  label: string | null;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface DocumentOperation {
  id: string;
  operationType: string;
  vectorClock: Record<string, number> | null;
  lamportTs: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name'>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  documentId?: string;
}

export interface AnalyticsMetrics {
  connectedUsers: number;
  documentsOpen: number;
  operationsPerSecond: number;
  crdtMergeCount: number;
  totalOperations: number;
  wsLatency: number;
  syncTime: number;
  avgMergeTime: number;
  activeSessions: number;
  memoryUsage: { heapUsed: number; heapTotal: number; rss: number };
  serverUptime: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing';

export interface NetworkSimSettings {
  latency: number;
  packetLoss: number;
  bandwidth: number;
  disconnected: boolean;
}
