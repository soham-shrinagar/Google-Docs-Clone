import clsx from 'clsx';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';

interface ToolbarDropdownProps {
  open: boolean;
  align?: 'left' | 'right';
  width?: string;
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ToolbarDropdown({
  open,
  align = 'left',
  width = 'w-52',
  header,
  footer,
  children,
  className,
}: ToolbarDropdownProps) {
  if (!open) return null;

  return (
    <div
      className={clsx(
        'absolute top-full mt-1.5 z-50 overflow-hidden',
        'bg-paper border border-line rounded-2xl shadow-2xl animate-fade-up',
        width,
        align === 'left' ? 'left-0' : 'right-0',
        className
      )}
    >
      {header && (
        <div className="px-3.5 py-2.5 border-b border-line bg-surface/90">
          {typeof header === 'string' ? (
            <p className="text-xs font-semibold text-ink">{header}</p>
          ) : (
            header
          )}
        </div>
      )}
      <div className="py-1 max-h-72 overflow-y-auto scroll-panel">{children}</div>
      {footer}
    </div>
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
      onClick={onClick}
      style={style}
      className={clsx(
        'w-full flex items-center justify-between gap-2 px-3.5 py-2 text-sm text-left transition-colors',
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
    <div className="px-3.5 py-3">
      <p className="text-xs font-semibold text-ink mb-3">{label}</p>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => {
          const isSelected = selected?.toLowerCase() === color.toLowerCase();
          const isLight = color === '#ffffff' || color === '#fef08a';
          return (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => onPick(color)}
              className={clsx(
                'relative w-7 h-7 rounded-lg border-2 transition-all hover:scale-110',
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
    <div className="border-t border-line bg-surface/50 p-1">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-3 py-2 text-xs font-medium text-muted hover:text-ink hover:bg-surface rounded-lg transition-colors"
      >
        {label}
      </button>
    </div>
  );
}
