import { Cloud, CloudOff, Loader2, Check, HardDrive } from 'lucide-react';
import clsx from 'clsx';
import { useEditorStore } from '../../store';
import { formatDistanceToNow } from 'date-fns';

interface SaveStatusProps {
  lastSaved: Date | null;
  isSaving: boolean;
  localReady: boolean;
}

export function SaveStatus({ lastSaved, isSaving, localReady }: SaveStatusProps) {
  const { connectionStatus } = useEditorStore();

  const cloudOk = connectionStatus === 'connected';
  const label = isSaving
    ? 'Saving...'
    : cloudOk
    ? 'Saved to cloud'
    : 'Saved locally — will sync when online';

  const Icon = isSaving ? Loader2 : cloudOk ? Check : connectionStatus === 'disconnected' ? CloudOff : Cloud;

  return (
    <div className="flex items-center gap-3 text-xs">
      <div
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium',
          isSaving && 'bg-yellow-50 text-yellow-700',
          !isSaving && cloudOk && 'bg-green-50 text-green-700',
          !isSaving && !cloudOk && 'bg-orange-50 text-orange-700'
        )}
      >
        <Icon size={13} className={isSaving ? 'animate-spin' : ''} />
        {label}
      </div>
      {localReady && (
        <span className="flex items-center gap-1 text-gray-400" title="Cached on this device">
          <HardDrive size={12} />
          Local backup
        </span>
      )}
      {lastSaved && !isSaving && (
        <span className="text-gray-400 hidden sm:inline">
          {formatDistanceToNow(lastSaved, { addSuffix: true })}
        </span>
      )}
    </div>
  );
}
