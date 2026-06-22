export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  color: string;
  createdAt?: string;
}

export type PermissionRole = 'OWNER' | 'EDITOR' | 'COMMENTER' | 'VIEWER';

export type DocumentType = 'RICH_TEXT' | 'WORKSPACE';

export interface Document {
  id: string;
  title: string;
  documentType?: DocumentType;
  thumbnail: string | null;
  workspaceMeta?: Record<string, unknown> | null;
  owner: Pick<User, 'id' | 'name' | 'email' | 'avatar'>;
  collaboratorCount: number;
  operationCount: number;
  seedContent?: Record<string, unknown> | null;
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

export interface DocumentComment {
  id: string;
  content: string;
  quote: string | null;
  resolved: boolean;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'color'>;
  replies?: DocumentComment[];
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'syncing';
