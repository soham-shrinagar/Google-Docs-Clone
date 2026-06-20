import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { ChevronDown, ZoomIn } from 'lucide-react';
import { PAGE_ZOOM_OPTIONS, zoomModeLabel, type PageZoomMode } from '../../lib/pageZoom';
import { ToolbarDropdown, ToolbarMenuItem } from './ToolbarDropdown';

interface PageZoomControlProps {
  value: PageZoomMode;
  onChange: (mode: PageZoomMode) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function PageZoomControl({ value, onChange, open, onToggle, onClose }: PageZoomControlProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.document.addEventListener('mousedown', close);
    return () => window.document.removeEventListener('mousedown', close);
  }, [open, onClose]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border text-sm font-medium transition-colors shrink-0',
          open
            ? 'border-accent/40 bg-accent-soft text-accent'
            : 'border-line bg-paper text-ink hover:border-accent/30 hover:bg-surface'
        )}
        title="Page zoom"
      >
        <ZoomIn size={15} className="text-muted" />
        <span className="min-w-[4.5rem] text-left">{zoomModeLabel(value)}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      <ToolbarDropdown open={open} align="right" width="w-44" header="Page zoom">
        {PAGE_ZOOM_OPTIONS.map((opt) => (
          <ToolbarMenuItem
            key={opt.value}
            active={value === opt.value}
            onClick={() => {
              onChange(opt.value);
              onClose();
            }}
          >
            {opt.label}
          </ToolbarMenuItem>
        ))}
      </ToolbarDropdown>
    </div>
  );
}
