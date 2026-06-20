import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Share2, History, ListTree, MessageSquare, BarChart3, Keyboard,
  Sparkles, Mic, MoreHorizontal, Search, Download, FileSearch,
} from 'lucide-react';
import clsx from 'clsx';
import { ThemeToggle } from '../layout/ThemeToggle';
import { SyncStatus } from './SyncStatus';
import { PresenceBar } from './PresenceBar';
import { PageZoomControl } from './PageZoomControl';
import { exportDocument, type ExportFormat } from '../../lib/exportDocument';
import { ToolbarDropdown, ToolbarMenuItem } from './ToolbarDropdown';
import type { PageZoomMode } from '../../lib/pageZoom';

const EXPORT_FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'txt', label: 'Plain text (.txt)' },
  { id: 'markdown', label: 'Markdown (.md)' },
  { id: 'html', label: 'HTML (.html)' },
  { id: 'pdf', label: 'PDF (print)' },
];

interface EditorHeaderActionsProps {
  editor: Editor | null;
  title: string;
  presenceUsers: Parameters<typeof PresenceBar>[0]['users'];
  pageZoom: PageZoomMode;
  onPageZoomChange: (mode: PageZoomMode) => void;
  canEdit: boolean;
  showOutline: boolean;
  showComments: boolean;
  showVoice: boolean;
  showAi: boolean;
  showShare: boolean;
  showVersionHistory: boolean;
  onToggleOutline: () => void;
  onToggleComments: () => void;
  onToggleVoice: () => void;
  onToggleAi: () => void;
  onToggleShare: () => void;
  onToggleVersionHistory: () => void;
  onShowStats: () => void;
  onShowShortcuts: () => void;
  onFind: () => void;
  onReplace: () => void;
}

function ToolGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-xl bg-surface/80 border border-line/50">
      <span className="hidden xl:inline text-[10px] font-semibold uppercase tracking-wider text-muted px-1.5">{label}</span>
      {children}
    </div>
  );
}

function IconBtn({
  active, onClick, title, children, accent,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={clsx(
        'p-2 rounded-lg transition-all duration-200',
        active
          ? 'bg-accent-soft text-accent ring-1 ring-accent/20'
          : accent
          ? 'text-accent hover:bg-accent-soft'
          : 'text-muted hover:text-ink hover:bg-paper'
      )}
    >
      {children}
    </button>
  );
}

export function EditorHeaderActions({
  editor,
  title,
  presenceUsers,
  pageZoom,
  onPageZoomChange,
  canEdit,
  showOutline,
  showComments,
  showVoice,
  showAi,
  showShare,
  showVersionHistory,
  onToggleOutline,
  onToggleComments,
  onToggleVoice,
  onToggleAi,
  onToggleShare,
  onToggleVersionHistory,
  onShowStats,
  onShowShortcuts,
  onFind,
  onReplace,
}: EditorHeaderActionsProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    window.document.addEventListener('mousedown', close);
    return () => window.document.removeEventListener('mousedown', close);
  }, [moreOpen]);

  return (
    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
      <div className="hidden md:flex items-center gap-2 mr-1">
        <SyncStatus />
        <PresenceBar users={presenceUsers} />
      </div>

      <ToolGroup label="View">
        <IconBtn active={showOutline} onClick={onToggleOutline} title="Document outline">
          <ListTree size={16} />
        </IconBtn>
        <IconBtn active={showComments} onClick={onToggleComments} title="Comments">
          <MessageSquare size={16} />
        </IconBtn>
        <PageZoomControl
          value={pageZoom}
          onChange={onPageZoomChange}
          open={zoomOpen}
          onToggle={() => setZoomOpen((v) => !v)}
          onClose={() => setZoomOpen(false)}
        />
      </ToolGroup>

      {canEdit && (
        <ToolGroup label="AI">
          <IconBtn active={showVoice} onClick={onToggleVoice} title="Voice dictation" accent>
            <Mic size={16} />
          </IconBtn>
          <IconBtn active={showAi} onClick={onToggleAi} title="AI Assistant" accent>
            <Sparkles size={16} />
          </IconBtn>
        </ToolGroup>
      )}

      <div className="relative" ref={moreRef}>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          className={clsx(
            'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-xl border text-sm font-medium transition-colors',
            moreOpen ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-paper text-muted hover:text-ink hover:bg-surface'
          )}
        >
          <MoreHorizontal size={16} />
          <span className="hidden sm:inline">More</span>
        </button>
        <ToolbarDropdown open={moreOpen} align="right" width="w-52" header="Document tools">
          <ToolbarMenuItem onClick={() => { onFind(); setMoreOpen(false); }}>
            <span className="flex items-center gap-2"><Search size={14} /> Find</span>
          </ToolbarMenuItem>
          <ToolbarMenuItem onClick={() => { onReplace(); setMoreOpen(false); }}>
            <span className="flex items-center gap-2"><FileSearch size={14} /> Find & replace</span>
          </ToolbarMenuItem>
          <ToolbarMenuItem onClick={() => { onShowStats(); setMoreOpen(false); }}>
            <span className="flex items-center gap-2"><BarChart3 size={14} /> Statistics</span>
          </ToolbarMenuItem>
          <ToolbarMenuItem onClick={() => { onToggleVersionHistory(); setMoreOpen(false); }} active={showVersionHistory}>
            <span className="flex items-center gap-2"><History size={14} /> Version history</span>
          </ToolbarMenuItem>
          <ToolbarMenuItem onClick={() => { onShowShortcuts(); setMoreOpen(false); }}>
            <span className="flex items-center gap-2"><Keyboard size={14} /> Shortcuts</span>
          </ToolbarMenuItem>
          <div className="border-t border-line my-1" />
          <p className="px-3.5 pt-1 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">Export</p>
          {EXPORT_FORMATS.map((f) => (
            <ToolbarMenuItem
              key={f.id}
              onClick={() => {
                if (editor) exportDocument(editor, title, f.id);
                setMoreOpen(false);
              }}
            >
              <span className="flex items-center gap-2"><Download size={14} /> {f.label}</span>
            </ToolbarMenuItem>
          ))}
          <div className="border-t border-line my-1" />
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-muted">Theme</span>
            <ThemeToggle />
          </div>
        </ToolbarDropdown>
      </div>

      <button
        type="button"
        onClick={onToggleShare}
        className={clsx(
          'inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-sm font-semibold transition-all',
          showShare
            ? 'bg-accent text-white shadow-md'
            : 'bg-accent text-white hover:brightness-105 shadow-sm'
        )}
      >
        <Share2 size={15} />
        Share
      </button>
    </div>
  );
}
