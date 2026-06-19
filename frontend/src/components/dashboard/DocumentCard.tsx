import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Pin, MoreVertical, Users, Clock } from 'lucide-react';
import type { Document } from '../../types';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}

function DocPreview({ title }: { title: string }) {
  const seed = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const accentBar = seed % 3 === 0 ? 'bg-accent' : seed % 3 === 1 ? 'bg-ink/80' : 'bg-accent/60';

  return (
    <div className="h-36 bg-canvas p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none" />
      <div className="relative h-full bg-paper rounded-lg border border-line/80 shadow-sm p-3 flex flex-col gap-2 mx-1">
        <div className={`h-1 w-8 rounded-full ${accentBar} shrink-0`} />
        <div className="h-2 w-3/4 preview-line rounded-full mt-1" />
        <div className="h-1.5 w-full preview-line rounded-full" />
        <div className="h-1.5 w-[90%] preview-line rounded-full" />
        <div className="h-1.5 w-4/5 preview-line rounded-full" />
        <div className="h-1.5 w-2/3 preview-line rounded-full mt-auto" />
      </div>
    </div>
  );
}

export function DocumentCard({ document, onDelete, onPin }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <Link
      to={`/document/${document.id}`}
      className="group block bg-paper rounded-2xl border border-line overflow-hidden card-hover"
    >
      <DocPreview title={document.title} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-ink truncate group-hover:text-accent transition-colors">
                {document.title}
              </h3>
              {document.isPinned && (
                <Pin size={13} className="text-accent shrink-0 fill-accent/20" />
              )}
            </div>
            <p className="text-xs text-muted mt-1 truncate">{document.owner.name}</p>
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-canvas opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-paper border border-line rounded-xl py-1.5 z-30 w-36 shadow-xl">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(document.id); setMenuOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-canvas"
                >
                  {document.isPinned ? 'Unpin' : 'Pin'}
                </button>
                {document.permission === 'OWNER' && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(document.id); setMenuOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-muted hover:bg-canvas"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line/60 text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users size={12} />
            {document.collaboratorCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}
          </span>
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-muted/80">
            {document.permission.toLowerCase()}
          </span>
        </div>
      </div>
    </Link>
  );
}
