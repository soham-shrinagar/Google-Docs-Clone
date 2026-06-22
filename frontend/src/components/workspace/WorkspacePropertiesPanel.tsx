import type { WorkspaceElementData, WorkspacePageData } from '../../lib/workspace/types';

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times', value: 'Times New Roman, serif' },
  { label: 'Courier', value: 'Courier New, monospace' },
];

interface WorkspacePropertiesPanelProps {
  selectedElements: WorkspaceElementData[];
  activePage: WorkspacePageData | null;
  onUpdateElement: (el: WorkspaceElementData) => void;
}

export function WorkspacePropertiesPanel({
  selectedElements,
  activePage,
  onUpdateElement,
}: WorkspacePropertiesPanelProps) {
  const el = selectedElements.length === 1 ? selectedElements[0] : null;

  return (
    <aside className="w-60 border-l border-line bg-paper flex flex-col shrink-0">
      <div className="px-3 py-2 border-b border-line">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Properties</h3>
      </div>
      <div className="p-3 space-y-3 text-sm overflow-y-auto flex-1">
        {!el && activePage && (
          <div className="space-y-2">
            <p className="font-medium text-ink">{activePage.label ?? 'Page'}</p>
            <p className="text-xs text-muted">
              {Math.round(activePage.width)} × {Math.round(activePage.height)} px
            </p>
            <p className="text-xs text-muted capitalize">Background: {activePage.backgroundType.replace('_', ' ')}</p>
          </div>
        )}

        {el && (el.type === 'text' || el.type === 'sticky') && (
          <>
            <label className="block text-xs text-muted">Text</label>
            <textarea
              value={(el.data.text as string) ?? ''}
              onChange={(e) =>
                onUpdateElement({ ...el, data: { ...el.data, text: e.target.value } })
              }
              rows={4}
              className="w-full text-sm border border-line rounded-lg p-2 bg-surface resize-none"
            />
            <label className="block text-xs text-muted">Font family</label>
            <select
              value={el.style.fontFamily ?? FONT_OPTIONS[0].value}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, fontFamily: e.target.value } })
              }
              className="w-full text-sm border border-line rounded-lg px-2 py-1.5 bg-paper"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <label className="block text-xs text-muted">Font size</label>
            <input
              type="number"
              min={8}
              max={120}
              value={el.style.fontSize ?? 18}
              onChange={(e) =>
                onUpdateElement({
                  ...el,
                  style: { ...el.style, fontSize: Number(e.target.value) },
                })
              }
              className="w-full text-sm border border-line rounded-lg px-2 py-1.5"
            />
            <label className="block text-xs text-muted">Font weight</label>
            <select
              value={el.style.fontWeight ?? '400'}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, fontWeight: e.target.value } })
              }
              className="w-full text-sm border border-line rounded-lg px-2 py-1.5 bg-paper"
            >
              <option value="400">Regular</option>
              <option value="600">Semi-bold</option>
              <option value="700">Bold</option>
            </select>
            <label className="block text-xs text-muted">Alignment</label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdateElement({ ...el, style: { ...el.style, align } })}
                  className={`flex-1 py-1 text-xs rounded border capitalize ${
                    (el.style.align ?? 'left') === align
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line hover:bg-surface'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
            <label className="block text-xs text-muted">Text color</label>
            <input
              type="color"
              value={el.style.color ?? '#1a1a2e'}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, color: e.target.value } })
              }
              className="w-full h-8 rounded cursor-pointer"
            />
            <label className="block text-xs text-muted">Opacity</label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={el.style.opacity ?? 1}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, opacity: Number(e.target.value) } })
              }
              className="w-full"
            />
          </>
        )}

        {el && (el.type === 'rect' || el.type === 'circle' || el.type === 'highlight') && (
          <>
            <label className="block text-xs text-muted">Fill</label>
            <input
              type="color"
              value={el.style.fill?.slice(0, 7) ?? '#3b82f6'}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, fill: e.target.value + '33' } })
              }
              className="w-full h-8 rounded cursor-pointer"
            />
            <label className="block text-xs text-muted">Stroke</label>
            <input
              type="color"
              value={el.style.stroke ?? '#3b82f6'}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, stroke: e.target.value } })
              }
              className="w-full h-8 rounded cursor-pointer"
            />
            <label className="block text-xs text-muted">Stroke width</label>
            <input
              type="number"
              min={0}
              max={20}
              value={el.style.strokeWidth ?? 2}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, strokeWidth: Number(e.target.value) } })
              }
              className="w-full text-sm border border-line rounded-lg px-2 py-1.5"
            />
          </>
        )}

        {el && (el.type === 'line' || el.type === 'arrow' || el.type === 'pen') && (
          <>
            <label className="block text-xs text-muted">Stroke color</label>
            <input
              type="color"
              value={el.style.stroke ?? '#3b82f6'}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, stroke: e.target.value } })
              }
              className="w-full h-8 rounded cursor-pointer"
            />
            <label className="block text-xs text-muted">Stroke width</label>
            <input
              type="number"
              min={1}
              max={30}
              value={el.style.strokeWidth ?? 2}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, strokeWidth: Number(e.target.value) } })
              }
              className="w-full text-sm border border-line rounded-lg px-2 py-1.5"
            />
            <label className="block text-xs text-muted">Opacity</label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={el.style.opacity ?? 1}
              onChange={(e) =>
                onUpdateElement({ ...el, style: { ...el.style, opacity: Number(e.target.value) } })
              }
              className="w-full"
            />
          </>
        )}

        {el && (
          <div className="pt-2 border-t border-line space-y-2">
            <label className="block text-xs text-muted">Z-index (layer order)</label>
            <input
              type="number"
              min={1}
              max={999}
              value={el.zIndex}
              onChange={(e) =>
                onUpdateElement({ ...el, zIndex: Number(e.target.value) })
              }
              className="w-full text-sm border border-line rounded-lg px-2 py-1.5"
            />
            <div className="space-y-1 text-xs text-muted">
              <p>Position: {Math.round(el.transform.x)}, {Math.round(el.transform.y)}</p>
              <p>Size: {Math.round(el.transform.width)} × {Math.round(el.transform.height)}</p>
              <p>Layer: {el.layer}</p>
            </div>
          </div>
        )}

        {!el && !activePage && (
          <p className="text-xs text-muted">Select an element or page</p>
        )}
      </div>
    </aside>
  );
}
