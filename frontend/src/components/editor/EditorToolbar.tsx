import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Highlighter,
} from 'lucide-react';
import { FileUploadButton } from './FileUploadButton';
import clsx from 'clsx';

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const btn = (active: boolean) =>
    clsx(
      'p-2 rounded-lg transition-colors',
      active ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'
    );

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-200 bg-white flex-wrap sticky top-14 z-10">
      <button onClick={() => editor.chain().focus().undo().run()} className={btn(false)} title="Undo">
        <Undo size={18} />
      </button>
      <button onClick={() => editor.chain().focus().redo().run()} className={btn(false)} title="Redo">
        <Redo size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))}>
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))}>
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))}>
        <Underline size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))}>
        <Strikethrough size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btn(editor.isActive('highlight'))}>
        <Highlighter size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive('heading', { level: 1 }))}>
        <Heading1 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive('heading', { level: 2 }))}>
        <Heading2 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive('heading', { level: 3 }))}>
        <Heading3 size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))}>
        <List size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))}>
        <ListOrdered size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive('blockquote'))}>
        <Quote size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={btn(editor.isActive('codeBlock'))}>
        <Code size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btn(false)}>
        <Minus size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))}>
        <AlignLeft size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))}>
        <AlignCenter size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))}>
        <AlignRight size={18} />
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={addLink} className={btn(editor.isActive('link'))}>
        <LinkIcon size={18} />
      </button>
      <FileUploadButton editor={editor} />
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className={btn(false)}
      >
        <TableIcon size={18} />
      </button>
    </div>
  );
}
