import { Check, CloudOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useEditorStore } from '../../store';

interface SyncStatusProps {
  compact?: boolean;
}

export function SyncStatus({ compact }: SyncStatusProps) {
  const { connectionStatus, syncStatus } = useEditorStore();

  const connected = connectionStatus === 'connected';
  const saving = syncStatus === 'Saving...' || syncStatus === 'Connecting...';

  const label = saving
    ? syncStatus
    : connected
      ? 'Saved'
      : connectionStatus === 'disconnected'
        ? 'Offline'
        : syncStatus;

  const Icon = saving ? Loader2 : connected ? Check : CloudOff;

  const badgeClass = saving
    ? 'badge-warn'
    : connected
      ? 'badge-success'
      : 'badge-danger';

  return (
    <div
      className={clsx('badge gap-1.5 text-xs', compact ? 'px-2 py-0.5' : 'px-2.5 py-1', badgeClass)}
      title={connected ? 'Connected and synced' : connectionStatus === 'disconnected' ? 'Editing offline' : syncStatus}
    >
      <Icon size={13} className={saving ? 'animate-spin shrink-0' : 'shrink-0'} />
      <span>{label}</span>
    </div>
  );
}
