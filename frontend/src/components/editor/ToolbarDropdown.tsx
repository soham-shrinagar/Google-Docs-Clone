import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { Check } from 'lucide-react';

interface ToolbarDropdownProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  align?: 'left' | 'right';
  width?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
}

export function ToolbarDropdown({
  open,
  anchorRef,
  align = 'left',
  width = 'w-52',
  header,
  footer,
  children,
  className,
  onClose,
}: ToolbarDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, right: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const update = () => {
      const rect = anchorRef.current!.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: rect.left,
        right: window.innerWidth - rect.right,
      });
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const style: React.CSSProperties =
    align === 'right'
      ? { top: pos.top, right: pos.right }
      : { top: pos.top, left: pos.left };

  return createPortal(
    <div
      ref={panelRef}
      style={style}
      className={clsx(
        'fixed z-[200] overflow-hidden',
        'bg-paper border border-line rounded-lg shadow-lg animate-fade-up',
        width,
        className
      )}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {header && (
        <div className="px-3 py-2 border-b border-line bg-surface">
          {typeof header === 'string' ? (
            <p className="text-xs font-medium text-ink">{header}</p>
          ) : (
            header
          )}
        </div>
      )}
      <div className="py-1 max-h-72 overflow-y-auto scroll-panel">{children}</div>
      {footer}
    </div>,
    document.body
  );
}

interface ToolbarMenuItemProps {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function ToolbarMenuItem({
  active,
  onClick,
  children,
  style,
  className,
}: ToolbarMenuItemProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={style}
      className={clsx(
        'w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors',
        active ? 'bg-accent-soft text-accent font-medium' : 'text-ink hover:bg-surface',
        className
      )}
    >
      <span className="truncate">{children}</span>
      {active && <Check size={14} className="shrink-0" />}
    </button>
  );
}

interface ToolbarColorGridProps {
  label: string;
  colors: readonly string[];
  selected?: string;
  onPick: (color: string) => void;
}

export function ToolbarColorGrid({ label, colors, selected, onPick }: ToolbarColorGridProps) {
  return (
    <div className="px-3 py-3">
      <p className="text-xs font-medium text-ink mb-3">{label}</p>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => {
          const isSelected = selected?.toLowerCase() === color.toLowerCase();
          const isLight = color === '#ffffff' || color === '#fef08a';
          return (
            <button
              key={color}
              type="button"
              title={color}
              onClick={(e) => {
                e.stopPropagation();
                onPick(color);
              }}
              className={clsx(
                'relative w-7 h-7 rounded-md border-2 transition-colors',
                isSelected ? 'border-accent ring-2 ring-accent/30' : 'border-line hover:border-accent/40',
                isLight && 'shadow-inner'
              )}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <Check
                  size={12}
                  className={clsx(
                    'absolute inset-0 m-auto',
                    isLight || color === '#fde68a' ? 'text-ink' : 'text-white'
                  )}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ToolbarDropdownFooter({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="border-t border-line bg-surface p-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="w-full text-left px-3 py-2 text-xs font-medium text-muted hover:text-ink hover:bg-surface rounded-md transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
