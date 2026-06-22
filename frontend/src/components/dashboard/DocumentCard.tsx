import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Pin, MoreVertical, Users, Clock, FileText, Layout } from 'lucide-react';
import type { Document } from '../../types';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onPin: (id: string) => void;
}

function DocPreview({ isWorkspace }: { isWorkspace?: boolean }) {
  return (
    <div className="h-32 bg-surface border-b border-line p-3 flex items-center justify-center">
      <div className="w-full h-full bg-paper border border-line rounded-md p-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 mb-1">
          {isWorkspace ? (
            <Layout size={12} className="text-muted shrink-0" />
          ) : (
            <FileText size={12} className="text-muted shrink-0" />
          )}
          <div className="h-1.5 flex-1 preview-line rounded-sm" />
        </div>
        <div className="h-1 w-full preview-line rounded-sm" />
        <div className="h-1 w-[85%] preview-line rounded-sm" />
        <div className="h-1 w-[70%] preview-line rounded-sm" />
        <div className="h-1 w-[90%] preview-line rounded-sm mt-auto" />
      </div>
    </div>
  );
}

export function DocumentCard({ document: doc, onDelete, onPin }: DocumentCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.document.addEventListener('mousedown', close);
    return () => window.document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const isWorkspace = doc.documentType === 'WORKSPACE';

  return (
    <Link
      to={`/document/${doc.id}`}
      className="group block card-interactive overflow-hidden"
    >
      <DocPreview isWorkspace={isWorkspace} />

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-medium text-ink truncate">
                {doc.title}
              </h3>
              {doc.isPinned && (
                <Pin size={12} className="text-accent shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted mt-0.5 truncate">{doc.owner.name}</p>
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
              className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label="Document options"
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <div className="dropdown-menu absolute right-0 top-full mt-1 py-1 z-30 w-32">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onPin(doc.id); setMenuOpen(false); }}
                  className="w-full px-3 py-1.5 text-left text-sm hover:bg-surface"
                >
                  {doc.isPinned ? 'Unpin' : 'Pin'}
                </button>
                {doc.permission === 'OWNER' && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(doc.id); setMenuOpen(false); }}
                    className="w-full px-3 py-1.5 text-left text-sm text-muted hover:bg-surface"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-line text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users size={11} />
            {doc.collaboratorCount}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
          </span>
          <span className="ml-auto text-[10px] font-medium uppercase tracking-wide opacity-70">
            {isWorkspace ? 'Canvas' : 'Doc'}
          </span>
        </div>
      </div>
    </Link>
  );
}
