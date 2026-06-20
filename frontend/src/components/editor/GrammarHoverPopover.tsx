import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Check, X, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { getSpellIssues, ignoreSpellIssue, type StoredIssue } from '../../lib/spellCheckExtension';
import { api } from '../../lib/api';

interface GrammarHoverPopoverProps {
  editor: Editor;
}

export function GrammarHoverPopover({ editor }: GrammarHoverPopoverProps) {
  const [issue, setIssue] = useState<StoredIssue | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = editor.view.dom;

    const findIssue = (el: Element): StoredIssue | null => {
      const id = el.getAttribute('data-spell-id');
      if (!id) return null;
      return getSpellIssues(editor.state).find((i) => i.id === id) ?? null;
    };

    const showFor = (target: Element, clientX: number, clientY: number) => {
      const el = target.closest('.spell-error-grammar, .spell-error-style, .spell-error-spelling');
      if (!el) return;
      const found = findIssue(el);
      if (!found) return;
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setIssue(found);
      setPos({ x: clientX, y: clientY + 12 });
    };

    const onMouseOver = (e: MouseEvent) => showFor(e.target as Element, e.clientX, e.clientY);
    const onMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;
      if (popoverRef.current?.contains(related)) return;
      hideTimer.current = setTimeout(() => setIssue(null), 180);
    };

    root.addEventListener('mouseover', onMouseOver);
    root.addEventListener('mouseout', onMouseOut);
    return () => {
      root.removeEventListener('mouseover', onMouseOver);
      root.removeEventListener('mouseout', onMouseOut);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [editor]);

  if (!issue) return null;

  const accept = () => {
    const replacement = issue.replacement || issue.suggestions[0];
    if (!replacement) return;
    const from = Math.min(issue.from + 1, editor.state.doc.content.size);
    const to = Math.min(issue.to + 1, editor.state.doc.content.size);
    editor.chain().focus().insertContentAt({ from, to }, replacement).run();
    void api.aiGrammarOutcome(true);
    ignoreSpellIssue(editor, issue.id);
    setIssue(null);
  };

  const reject = () => {
    void api.aiGrammarOutcome(false);
    ignoreSpellIssue(editor, issue.id);
    setIssue(null);
  };

  const isGrammar = issue.type === 'grammar' || issue.type === 'style';

  return (
    <div
      ref={popoverRef}
      className="grammar-popover fixed z-50 w-72 animate-fade-up"
      style={{ left: Math.min(pos.x, window.innerWidth - 300), top: pos.y }}
      onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current); }}
      onMouseLeave={() => { hideTimer.current = setTimeout(() => setIssue(null), 180); }}
    >
      <div className="rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden">
        <div className={clsx(
          'px-3.5 py-2 flex items-center gap-2 text-xs font-semibold',
          issue.type === 'grammar' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
          issue.type === 'style' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' :
          'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
        )}>
          <AlertCircle size={14} />
          {issue.type === 'grammar' ? 'Grammar' : issue.type === 'style' ? 'Style' : 'Spelling'}
        </div>
        <div className="p-3.5 space-y-2.5">
          {isGrammar && issue.explanation && (
            <p className="text-xs text-muted leading-relaxed">{issue.explanation}</p>
          )}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted line-through truncate">{issue.word}</span>
            <span className="text-muted">→</span>
            <span className="font-semibold text-accent truncate">{issue.replacement || issue.suggestions[0]}</span>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={accept} className="btn-primary flex-1 !py-1.5 !text-xs !px-2">
              <Check size={13} /> Accept
            </button>
            <button type="button" onClick={reject} className="btn-secondary flex-1 !py-1.5 !text-xs !px-2">
              <X size={13} /> Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
