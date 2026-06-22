import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { ListTree, X } from 'lucide-react';

interface OutlineItem {
  level: number;
  text: string;
  pos: number;
}

function extractHeadings(editor: Editor): OutlineItem[] {
  const items: OutlineItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      items.push({
        level: node.attrs.level as number,
        text: node.textContent || 'Untitled',
        pos,
      });
    }
  });
  return items;
}

interface DocumentOutlineProps {
  editor: Editor | null;
  onClose: () => void;
}

export function DocumentOutline({ editor, onClose }: DocumentOutlineProps) {
  const [items, setItems] = useState<OutlineItem[]>([]);

  useEffect(() => {
    if (!editor) return;
    const update = () => setItems(extractHeadings(editor));
    update();
    editor.on('update', update);
    editor.on('selectionUpdate', update);
    return () => {
      editor.off('update', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  const scrollTo = (pos: number) => {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos + 1).run();
    const dom = editor.view.domAtPos(pos + 1);
    const el = dom.node instanceof HTMLElement ? dom.node : dom.node.parentElement;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <aside className="w-64 shrink-0 border-r border-line bg-paper flex flex-col h-full" aria-label="Document outline">
      <div className="side-panel-header">
        <h3 className="side-panel-title">
          <ListTree size={15} className="text-muted" /> Outline
        </h3>
        <button type="button" onClick={onClose} className="btn-ghost p-1!" aria-label="Close outline">
          <X size={15} />
        </button>
      </div>
      <nav className="side-panel-body">
        {items.length === 0 ? (
          <p className="text-xs text-muted px-2">Add headings to build your document outline.</p>
        ) : (
          <ul className="space-y-0.5">
            {items.map((item, i) => (
              <li key={`${item.pos}-${i}`}>
                <button
                  type="button"
                  onClick={() => scrollTo(item.pos)}
                  className="w-full text-left text-sm py-1.5 px-2 rounded-md hover:bg-surface truncate transition-colors"
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </aside>
  );
}
