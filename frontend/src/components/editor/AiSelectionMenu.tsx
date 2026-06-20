import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react';
import { Sparkles, Wand2 } from 'lucide-react';
import type { AiRewriteAction } from '../../lib/aiTypes';
import { REWRITE_ACTIONS } from '../../lib/aiTypes';

interface AiSelectionMenuProps {
  editor: Editor;
  onOpenAssist: (selection: string, action?: AiRewriteAction) => void;
}

export function AiSelectionMenu({ editor, onOpenAssist }: AiSelectionMenuProps) {
  const [selection, setSelection] = useState('');

  useEffect(() => {
    const update = () => {
      const { from, to } = editor.state.selection;
      setSelection(from !== to ? editor.state.doc.textBetween(from, to, ' ') : '');
    };
    editor.on('selectionUpdate', update);
    return () => {
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top' }}
      shouldShow={({ editor: e }) => {
        const { from, to } = e.state.selection;
        return to - from > 2;
      }}
    >
      <div className="flex items-center gap-1 bg-paper border border-line rounded-xl shadow-xl p-1">
        <button
          type="button"
          onClick={() => onOpenAssist(selection)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-accent hover:bg-accent-soft"
        >
          <Sparkles size={14} /> Ask AI
        </button>
        <div className="w-px h-5 bg-line" />
        {REWRITE_ACTIONS.slice(0, 4).map((a) => (
          <button
            key={a.id}
            type="button"
            title={a.label}
            onClick={() => onOpenAssist(selection, a.id)}
            className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent-soft"
          >
            <Wand2 size={14} />
          </button>
        ))}
      </div>
    </BubbleMenu>
  );
}
