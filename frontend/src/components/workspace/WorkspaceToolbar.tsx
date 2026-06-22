import clsx from 'clsx';
import {
  MousePointer2, Type, Pen, Highlighter, Square, Circle, Minus, ArrowRight,
  ImagePlus, StickyNote, Hand, Plus, Copy, Trash2, Download,
} from 'lucide-react';
import type { WorkspaceTool } from '../../lib/workspace/types';

const TOOLS: { id: WorkspaceTool; icon: typeof MousePointer2; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'hand', icon: Hand, label: 'Pan' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'highlighter', icon: Highlighter, label: 'Highlight' },
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky note' },
  { id: 'image', icon: ImagePlus, label: 'Image' },
];

interface WorkspaceToolbarProps {
  activeTool: WorkspaceTool;
  onToolChange: (tool: WorkspaceTool) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  onInsertImage: () => void;
  onExport: () => void;
  canEdit: boolean;
}

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

export function WorkspaceToolbar({
  activeTool,
  onToolChange,
  zoom,
  onZoomChange,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onInsertImage,
  onExport,
  canEdit,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex items-center gap-1 px-3 py-1.5 border-b border-line/60 bg-paper overflow-x-auto">
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          type="button"
          disabled={!canEdit && id !== 'select' && id !== 'hand'}
          title={label}
          onClick={() => onToolChange(id)}
          className={clsx(
            'p-2 rounded-lg transition-colors shrink-0',
            activeTool === id
              ? 'bg-accent-soft text-accent'
              : 'text-muted hover:text-ink hover:bg-surface'
          )}
        >
          <Icon size={16} />
        </button>
      ))}

      <div className="w-px h-6 bg-line mx-1 shrink-0" />

      {canEdit && (
        <>
          <button type="button" title="Add page" onClick={onAddPage} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface">
            <Plus size={16} />
          </button>
          <button type="button" title="Duplicate page" onClick={onDuplicatePage} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface">
            <Copy size={16} />
          </button>
          <button type="button" title="Delete page" onClick={onDeletePage} className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger/10">
            <Trash2 size={16} />
          </button>
          <button type="button" title="Insert image" onClick={onInsertImage} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface">
            <ImagePlus size={16} />
          </button>
        </>
      )}

      <div className="w-px h-6 bg-line mx-1 shrink-0" />

      <select
        value={zoom}
        onChange={(e) => onZoomChange(Number(e.target.value))}
        className="text-xs border border-line rounded-lg px-2 py-1.5 bg-paper text-ink"
      >
        {ZOOM_LEVELS.map((z) => (
          <option key={z} value={z}>{Math.round(z * 100)}%</option>
        ))}
      </select>

      <button type="button" title="Export" onClick={onExport} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface ml-auto">
        <Download size={16} />
      </button>
    </div>
  );
}
