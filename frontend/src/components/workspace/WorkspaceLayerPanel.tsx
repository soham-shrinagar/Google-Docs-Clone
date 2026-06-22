import clsx from 'clsx';
import { Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import type { WorkspaceElementData } from '../../lib/workspace/types';

interface WorkspaceLayerPanelProps {
  elements: WorkspaceElementData[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onToggleVisible: (id: string) => void;
  onToggleLocked: (id: string) => void;
}

const LAYER_ORDER = ['text', 'image', 'annotation', 'drawing'];

export function WorkspaceLayerPanel({
  elements,
  selectedIds,
  onSelect,
  onToggleVisible,
  onToggleLocked,
}: WorkspaceLayerPanelProps) {
  const grouped = LAYER_ORDER.map((layer) => ({
    layer,
    items: elements.filter((e) => e.layer === layer).sort((a, b) => b.zIndex - a.zIndex),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="w-56 border-l border-line bg-paper flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-line">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {grouped.length === 0 && (
          <p className="text-xs text-muted px-2">No elements yet</p>
        )}
        {grouped.map(({ layer, items }) => (
          <div key={layer}>
            <p className="text-[10px] font-semibold uppercase text-muted px-2 mb-1">{layer}</p>
            <ul className="space-y-0.5">
              {items.map((el) => (
                <li key={el.id}>
                  <button
                    type="button"
                    onClick={() => onSelect([el.id])}
                    className={clsx(
                      'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left',
                      selectedIds.includes(el.id)
                        ? 'bg-accent-soft text-accent'
                        : 'hover:bg-surface text-ink'
                    )}
                  >
                    <span className="truncate flex-1">{el.name || el.type}</span>
                    <span className="flex gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleVisible(el.id); }}
                        className="p-0.5 rounded hover:bg-line/50"
                      >
                        {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleLocked(el.id); }}
                        className="p-0.5 rounded hover:bg-line/50"
                      >
                        {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
