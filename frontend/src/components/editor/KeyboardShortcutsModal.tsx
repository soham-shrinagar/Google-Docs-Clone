import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  { category: 'Formatting', items: [
    ['Bold', 'Ctrl + B'],
    ['Italic', 'Ctrl + I'],
    ['Underline', 'Ctrl + U'],
    ['Insert link', 'Ctrl + K'],
  ]},
  { category: 'Editing', items: [
    ['Undo', 'Ctrl + Z'],
    ['Redo', 'Ctrl + Shift + Z'],
    ['Find', 'Ctrl + F'],
    ['Find & replace', 'Ctrl + H'],
    ['Shortcuts help', 'Ctrl + /'],
  ]},
  { category: 'Document', items: [
    ['Save status', 'Auto-saved via CRDT'],
    ['Slash commands', 'Type /'],
    ['Markdown', '# Heading, **bold**, *italic*'],
  ]},
] as const;

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-label="Keyboard shortcuts">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-paper rounded-2xl border border-line shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto scroll-panel p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-ink flex items-center gap-2">
            <Keyboard size={18} className="text-accent" /> Keyboard shortcuts
          </h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-canvas text-muted" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {SHORTCUTS.map((group) => (
          <div key={group.category} className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">{group.category}</p>
            <ul className="space-y-2">
              {group.items.map(([label, keys]) => (
                <li key={label} className="flex justify-between text-sm">
                  <span className="text-ink">{label}</span>
                  <kbd className="text-xs bg-canvas border border-line px-2 py-0.5 rounded font-mono text-muted">{keys}</kbd>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
