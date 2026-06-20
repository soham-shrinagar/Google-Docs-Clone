import { BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { CODE_LANGUAGES } from '../../lib/codeLanguages';

interface CodeBlockBubbleMenuProps {
  editor: Editor | null;
}

export function CodeBlockBubbleMenu({ editor }: CodeBlockBubbleMenuProps) {
  const [copied, setCopied] = useState(false);
  if (!editor) return null;

  const language = (editor.getAttributes('codeBlock').language as string) || 'javascript';

  const copyCode = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '\n');
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor: e }) => e.isActive('codeBlock')}
    >
      <div className="flex items-center gap-2 bg-paper border border-line rounded-xl shadow-lg px-2 py-1.5" role="toolbar" aria-label="Code block options">
        <select
          value={language}
          onChange={(e) => editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()}
          className="text-xs bg-canvas border border-line rounded-lg px-2 py-1"
          aria-label="Code language"
        >
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang.id} value={lang.id}>{lang.label}</option>
          ))}
        </select>
        <button type="button" className="p-1.5 rounded hover:bg-canvas text-muted" title="Copy code" onClick={copyCode}>
          {copied ? <Check size={14} className="text-accent" /> : <Copy size={14} />}
        </button>
      </div>
    </BubbleMenu>
  );
}
