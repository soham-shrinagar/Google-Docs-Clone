import type { WorkspacePageData } from '../../lib/workspace/types';
import clsx from 'clsx';

interface WorkspacePageStripProps {
  pages: WorkspacePageData[];
  activePageId: string | null;
  onSelectPage: (pageId: string) => void;
}

export function WorkspacePageStrip({ pages, activePageId, onSelectPage }: WorkspacePageStripProps) {
  return (
    <div className="flex gap-2 px-4 py-2 border-t border-line bg-paper overflow-x-auto shrink-0">
      {pages.map((page, i) => (
        <button
          key={page.id}
          type="button"
          onClick={() => onSelectPage(page.id)}
          className={clsx(
            'shrink-0 w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center text-[10px] font-medium transition-colors',
            activePageId === page.id
              ? 'border-accent bg-accent-soft text-accent'
              : 'border-line bg-surface text-muted hover:border-accent/40'
          )}
        >
          <span className="text-lg font-bold opacity-40">{i + 1}</span>
          <span className="truncate max-w-full px-1">{page.label ?? `Page ${i + 1}`}</span>
        </button>
      ))}
    </div>
  );
}
