import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react';
import { Sparkles } from 'lucide-react';

interface AiSelectionMenuProps {
  editor: Editor;
  onOpenAssist: (selection: string) => void;
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
      <button
        type="button"
        onClick={() => onOpenAssist(selection)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-paper border border-line shadow-xl text-xs font-semibold text-accent hover:bg-accent-soft transition-colors"
      >
        <Sparkles size={14} />
        Ask AI
      </button>
    </BubbleMenu>
  );
}
