import { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { Download, ChevronDown } from 'lucide-react';
import { exportDocument, type ExportFormat } from '../../lib/exportDocument';

interface ExportMenuProps {
  editor: Editor | null;
  title: string;
}

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'txt', label: 'Plain text (.txt)' },
  { id: 'markdown', label: 'Markdown (.md)' },
  { id: 'html', label: 'HTML (.html)' },
  { id: 'pdf', label: 'PDF (print)' },
];

export function ExportMenu({ editor, title }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.document.addEventListener('mousedown', close);
    return () => window.document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 h-8 px-2 rounded-md border border-line bg-paper text-sm text-ink hover:border-accent/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download size={15} />
        Export
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-paper border border-line rounded-xl shadow-xl z-50 py-1" role="menu">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="menuitem"
              className="w-full text-left px-3 py-2 text-sm hover:bg-canvas"
              onClick={() => {
                if (editor) exportDocument(editor, title, f.id);
                setOpen(false);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
