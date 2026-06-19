import { useEditorStore } from '../../store';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export function ConnectionIndicator() {
  const { connectionStatus, syncStatus } = useEditorStore();

  const config = {
    connected: { icon: Wifi, color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500' },
    connecting: { icon: RefreshCw, color: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' },
    syncing: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' },
    disconnected: { icon: WifiOff, color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' },
  }[connectionStatus];

  const Icon = config.icon;

  return (
    <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium', config.bg, config.color)}>
      <span className={clsx('w-2 h-2 rounded-full animate-pulse-dot', config.dot)} />
      <Icon size={14} className={connectionStatus === 'connecting' ? 'animate-spin' : ''} />
      <span>{syncStatus}</span>
    </div>
  );
}
