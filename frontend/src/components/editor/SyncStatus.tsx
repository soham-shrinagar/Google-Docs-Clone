import { Check, CloudOff, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useEditorStore } from '../../store';

interface SyncStatusProps {
  compact?: boolean;
}

export function SyncStatus({ compact }: SyncStatusProps) {
  const { connectionStatus, saveState, localReady } = useEditorStore();

  const isSaving = saveState === 'saving';
  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting' && !localReady;

  let label: string;
  if (isSaving) label = 'Saving...';
  else if (isConnected || localReady) label = 'Saved';
  else if (isConnecting) label = 'Connecting...';
  else label = 'Offline';

  const showSpinner = isSaving || isConnecting;
  const Icon = showSpinner ? Loader2 : isConnected || localReady ? Check : CloudOff;
  const badgeClass = showSpinner ? 'badge-warn' : isConnected || localReady ? 'badge-success' : 'badge-danger';

  const title = isSaving
    ? 'Saving your changes'
    : isConnected
      ? 'Connected and synced'
      : localReady
        ? 'Saved locally'
        : isConnecting
          ? 'Connecting to server'
          : 'Editing offline';

  return (
    <div
      className={clsx('badge gap-1.5 text-xs', compact ? 'px-2 py-0.5' : 'px-2.5 py-1', badgeClass)}
      title={title}
    >
      <Icon size={13} className={showSpinner ? 'animate-spin shrink-0' : 'shrink-0'} />
      <span>{label}</span>
    </div>
  );
}
