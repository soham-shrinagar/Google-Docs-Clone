import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

export type LoadingPhase =
  | 'idle'
  | 'creating'
  | 'uploading'
  | 'processing'
  | 'opening'
  | 'connecting'
  | 'rendering';

const PHASE_LABELS: Record<LoadingPhase, string> = {
  idle: '',
  creating: 'Creating document…',
  uploading: 'Uploading file…',
  processing: 'Processing pages…',
  opening: 'Opening document…',
  connecting: 'Connecting…',
  rendering: 'Rendering pages…',
};

interface LoadingOverlayProps {
  open: boolean;
  phase: LoadingPhase;
  message?: string;
  progress?: number | null;
  submessage?: string;
}

export function LoadingOverlay({
  open,
  phase,
  message,
  progress,
  submessage,
}: LoadingOverlayProps) {
  if (!open || phase === 'idle') return null;

  const label = message ?? PHASE_LABELS[phase];

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[var(--theme-overlay)] backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="surface-card p-6 w-full max-w-sm mx-4 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 size={20} className="text-accent animate-spin shrink-0" />
          <p className="text-sm font-medium text-ink">{label}</p>
        </div>
        {progress != null && (
          <div className="h-1.5 bg-surface rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-accent transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
        {submessage && <p className="text-xs text-muted">{submessage}</p>}
      </div>
    </div>
  );
}

interface PageLoaderProps {
  message?: string;
  submessage?: string;
  compact?: boolean;
}

export function PageLoader({ message = 'Loading…', submessage, compact }: PageLoaderProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center bg-canvas',
        compact ? 'py-12' : 'min-h-screen'
      )}
    >
      <Loader2 size={compact ? 24 : 32} className="text-accent animate-spin mb-3" />
      <p className="text-sm font-medium text-ink">{message}</p>
      {submessage && <p className="text-xs text-muted mt-1">{submessage}</p>}
    </div>
  );
}
