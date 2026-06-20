import type { Editor } from '@tiptap/react';
import { X, BarChart3 } from 'lucide-react';
import { computeDocumentStats } from '../../lib/exportDocument';

interface DocumentStatsModalProps {
  editor: Editor | null;
  onClose: () => void;
}

export function DocumentStatsModal({ editor, onClose }: DocumentStatsModalProps) {
  const text = editor?.getText() ?? '';
  const stats = computeDocumentStats(text);

  const rows = [
    ['Words', stats.words],
    ['Characters', stats.characters],
    ['Characters (no spaces)', stats.charactersNoSpaces],
    ['Paragraphs', stats.paragraphs],
    ['Sentences', stats.sentences],
    ['Reading time', `${stats.readingTimeMin} min`],
    ['Pages (est.)', stats.pageEstimate],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-label="Document statistics">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper rounded-2xl border border-line shadow-2xl w-full max-w-sm p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink flex items-center gap-2">
            <BarChart3 size={18} className="text-accent" /> Document statistics
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-canvas text-muted" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <dl className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
