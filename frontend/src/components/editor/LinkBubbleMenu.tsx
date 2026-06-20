import { BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { ExternalLink, Unlink, Pencil } from 'lucide-react';

interface LinkBubbleMenuProps {
  editor: Editor | null;
}

export function LinkBubbleMenu({ editor }: LinkBubbleMenuProps) {
  if (!editor) return null;

  const href = editor.getAttributes('link').href as string | undefined;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor: e }) => e.isActive('link')}
    >
      <div className="flex items-center gap-1 bg-paper border border-line rounded-xl shadow-lg px-2 py-1.5" role="toolbar" aria-label="Link options">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent truncate max-w-[180px] hover:underline px-1"
        >
          {href}
        </a>
        <button
          type="button"
          className="p-1.5 rounded hover:bg-canvas text-muted"
          title="Open link"
          onClick={() => href && window.open(href, '_blank')}
        >
          <ExternalLink size={14} />
        </button>
        <button
          type="button"
          className="p-1.5 rounded hover:bg-canvas text-muted"
          title="Edit link"
          onClick={() => {
            const url = window.prompt('Edit URL', href || 'https://');
            if (url === null) return;
            if (url === '') editor.chain().focus().unsetLink().run();
            else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className="p-1.5 rounded hover:bg-canvas text-muted"
          title="Remove link"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink size={14} />
        </button>
      </div>
    </BubbleMenu>
  );
}
