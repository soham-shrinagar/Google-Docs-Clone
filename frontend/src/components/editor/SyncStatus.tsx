import { Cloud, CloudOff, Loader2, Check, HardDrive } from 'lucide-react';
import clsx from 'clsx';
import { useEditorStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';

interface SyncStatusProps {
  lastSaved: Date | null;
  localReady: boolean;
}

export function SyncStatus({ lastSaved, localReady }: SyncStatusProps) {
  const { connectionStatus, syncStatus } = useEditorStore();

  const connected = connectionStatus === 'connected';
  const saving = syncStatus === 'Saving...' || syncStatus === 'Connecting...';

  const label = saving
    ? syncStatus
    : connected
      ? 'All changes saved'
      : connectionStatus === 'disconnected'
        ? 'Saved locally — will sync when online'
        : syncStatus;

  const Icon = saving ? Loader2 : connected ? Check : connectionStatus === 'disconnected' ? CloudOff : Cloud;

  const badgeClass = saving
    ? 'badge-warn'
    : connected
      ? 'badge-success'
      : 'badge-danger';

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={clsx(
          'w-2 h-2 rounded-full shrink-0 ring-2 ring-paper',
          connected && 'bg-emerald-500',
          connectionStatus === 'connecting' && 'bg-amber-400 animate-pulse',
          connectionStatus === 'disconnected' && 'bg-red-400'
        )}
        title={connected ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting…' : 'Offline'}
      />
      <div className={clsx('badge gap-1.5 px-2.5 py-1', badgeClass)}>
        <Icon size={13} className={saving ? 'animate-spin' : ''} />
        {label}
      </div>
      {localReady && (
        <span className="hidden sm:flex items-center text-muted" title="Cached on this device">
          <HardDrive size={12} />
        </span>
      )}
      {lastSaved && !saving && connected && (
        <span className="text-muted hidden md:inline">
          {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}
    </div>
  );
}
