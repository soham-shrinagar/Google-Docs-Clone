import { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface FindReplacePanelProps {
  editor: Editor | null;
  mode: 'find' | 'replace';
  onClose: () => void;
}

export function FindReplacePanel({ editor, mode, onClose }: FindReplacePanelProps) {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!editor || !find) {
      editor?.commands.clearSearch();
      setMatchCount(0);
      setActiveIndex(-1);
      return;
    }
    editor.commands.setSearchQuery({ term: find, caseSensitive, wholeWord, useRegex });
    const storage = editor.storage.documentSearch;
    setMatchCount(storage.matches.length);
    setActiveIndex(storage.activeIndex);
  }, [editor, find, caseSensitive, wholeWord, useRegex]);

  const refreshCounts = () => {
    if (!editor) return;
    const storage = editor.storage.documentSearch;
    setMatchCount(storage.matches.length);
    setActiveIndex(storage.activeIndex);
  };

  return (
    <div
      className="absolute right-4 top-16 w-[min(calc(100vw-2rem),22rem)] bg-paper border border-line rounded-2xl shadow-xl z-50 p-4 animate-fade-up"
      role="dialog"
      aria-label={mode === 'find' ? 'Find in document' : 'Find and replace'}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-ink">{mode === 'find' ? 'Find' : 'Find & Replace'}</h3>
        <button type="button" onClick={onClose} className="p-1 rounded hover:bg-canvas text-muted" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <label className="text-xs text-muted font-medium">Find</label>
      <input
        type="text"
        value={find}
        onChange={(e) => setFind(e.target.value)}
        className="input-field !py-2 mt-1 mb-2"
        placeholder="Search text…"
        autoFocus
      />

      {mode === 'replace' && (
        <>
          <label className="text-xs text-muted font-medium">Replace with</label>
          <input
            type="text"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            className="input-field !py-2 mt-1 mb-2"
            placeholder="Replacement…"
          />
        </>
      )}

      <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} />
          Case sensitive
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
          Whole word
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} />
          Regex
        </label>
      </div>

      <p className="text-xs text-muted mb-3">
        {matchCount === 0
          ? find ? 'No matches' : 'Enter text to search'
          : `${activeIndex + 1} of ${matchCount} matches`}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary !py-1.5 !px-3 !text-xs"
          onClick={() => { editor?.commands.findPrevious(); refreshCounts(); }}
          disabled={!matchCount}
        >
          <ChevronUp size={14} /> Prev
        </button>
        <button
          type="button"
          className="btn-secondary !py-1.5 !px-3 !text-xs"
          onClick={() => { editor?.commands.findNext(); refreshCounts(); }}
          disabled={!matchCount}
        >
          Next <ChevronDown size={14} />
        </button>
        {mode === 'replace' && (
          <>
            <button
              type="button"
              className="btn-secondary !py-1.5 !px-3 !text-xs"
              onClick={() => { editor?.commands.replaceSelection(replace); refreshCounts(); }}
              disabled={!matchCount}
            >
              Replace
            </button>
            <button
              type="button"
              className="btn-primary !py-1.5 !px-3 !text-xs"
              onClick={() => { editor?.commands.replaceAll(replace); refreshCounts(); }}
              disabled={!matchCount}
            >
              Replace all
            </button>
          </>
        )}
      </div>
    </div>
  );
}
