import { BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import {
  Trash2, Rows, Columns, Merge, Split, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react';

interface TableBubbleMenuProps {
  editor: Editor | null;
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  if (!editor) return null;

  const btn = 'p-1.5 rounded hover:bg-canvas text-muted hover:text-ink transition-colors';

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor: e }) => e.isActive('table')}
    >
      <div className="flex items-center gap-0.5 bg-paper border border-line rounded-xl shadow-lg p-1" role="toolbar" aria-label="Table options">
        <button type="button" className={btn} title="Add row before" onClick={() => editor.chain().focus().addRowBefore().run()}>
          <Rows size={16} />
        </button>
        <button type="button" className={btn} title="Add row after" onClick={() => editor.chain().focus().addRowAfter().run()}>
          <Rows size={16} className="rotate-180" />
        </button>
        <button type="button" className={btn} title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
          <Trash2 size={16} />
        </button>
        <span className="w-px h-5 bg-line mx-0.5" />
        <button type="button" className={btn} title="Add column before" onClick={() => editor.chain().focus().addColumnBefore().run()}>
          <Columns size={16} />
        </button>
        <button type="button" className={btn} title="Add column after" onClick={() => editor.chain().focus().addColumnAfter().run()}>
          <Columns size={16} className="rotate-180" />
        </button>
        <button type="button" className={btn} title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
          <Trash2 size={16} />
        </button>
        <span className="w-px h-5 bg-line mx-0.5" />
        <button type="button" className={btn} title="Merge cells" onClick={() => editor.chain().focus().mergeCells().run()}>
          <Merge size={16} />
        </button>
        <button type="button" className={btn} title="Split cell" onClick={() => editor.chain().focus().splitCell().run()}>
          <Split size={16} />
        </button>
        <span className="w-px h-5 bg-line mx-0.5" />
        <button type="button" className={btn} title="Align left" onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'left').run()}>
          <AlignLeft size={16} />
        </button>
        <button type="button" className={btn} title="Align center" onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'center').run()}>
          <AlignCenter size={16} />
        </button>
        <button type="button" className={btn} title="Align right" onClick={() => editor.chain().focus().setCellAttribute('textAlign', 'right').run()}>
          <AlignRight size={16} />
        </button>
        <span className="w-px h-5 bg-line mx-0.5" />
        <input
          type="color"
          title="Cell background"
          className="w-7 h-7 rounded cursor-pointer border border-line"
          onChange={(e) => editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run()}
        />
        <button type="button" className={btn} title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
          <Trash2 size={16} className="text-red-500" />
        </button>
      </div>
    </BubbleMenu>
  );
}
