import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { common, createLowlight } from 'lowlight';
import * as Y from 'yjs';
import type { WebsocketProvider } from 'y-websocket';
import type { Awareness } from 'y-protocols/awareness';
import type { User } from '../../types';
import { PdfEmbed, DOC_INIT_KEY, type TipTapContent } from './PdfEmbed';

const lowlight = createLowlight(common);

interface CollabEditorProps {
  ydoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  awareness: Awareness | null;
  user: User;
  documentId?: string;
  synced?: boolean;
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
  onContentChange?: () => void;
}

function isDocumentEmpty(editor: Editor): boolean {
  const json = editor.getJSON();
  if (!json.content || json.content.length === 0) return true;
  if (json.content.length === 1 && json.content[0].type === 'paragraph' && !json.content[0].content) {
    return true;
  }
  const hasPdf = JSON.stringify(json).includes('pdfEmbed');
  const hasImage = JSON.stringify(json).includes('"type":"image"');
  const text = editor.getText().trim();
  return text.length === 0 && !hasPdf && !hasImage;
}

export function CollabEditor({
  ydoc,
  provider,
  awareness,
  user,
  documentId,
  synced = false,
  editable = true,
  onEditorReady,
  onContentChange,
}: CollabEditorProps) {
  const [ready, setReady] = useState(false);
  const [initialApplied, setInitialApplied] = useState(false);

  useEffect(() => {
    if (ydoc && provider) setReady(true);
  }, [ydoc, provider]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false,
          codeBlock: false,
        }),
        Underline,
        Link.configure({ openOnClick: false }),
        Image.configure({ inline: false, allowBase64: false }),
        PdfEmbed,
        Table.configure({ resizable: true }),
        TableRow,
        TableCell,
        TableHeader,
        Placeholder.configure({ placeholder: 'Start typing or press / for commands...' }),
        CharacterCount,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Highlight.configure({ multicolor: true }),
        HorizontalRule,
        CodeBlockLowlight.configure({ lowlight }),
        ...(ydoc
          ? [
              Collaboration.configure({ document: ydoc }),
              ...(awareness
                ? [
                    CollaborationCursor.configure({
                      provider,
                      user: { name: user.name, color: user.color },
                    }),
                  ]
                : []),
            ]
          : []),
      ],
      editable,
      editorProps: {
        attributes: {
          class: 'prose prose-lg max-w-none focus:outline-none',
        },
      },
      onCreate: ({ editor: e }) => onEditorReady?.(e),
      onUpdate: () => onContentChange?.(),
    },
    [ready, ydoc, awareness, user.name, user.color]
  );

  const applyInitialContent = useCallback(() => {
    if (!editor || !documentId || initialApplied) return;

    const storageKey = DOC_INIT_KEY(documentId);
    const htmlKey = `doc-init-html-${documentId}`;
    const raw = sessionStorage.getItem(storageKey);
    const html = sessionStorage.getItem(htmlKey);

    if (!raw && !html) {
      setInitialApplied(true);
      return;
    }

    if (isDocumentEmpty(editor)) {
      if (raw) {
        try {
          const content = JSON.parse(raw) as TipTapContent;
          editor.commands.setContent(content);
        } catch { /* ignore */ }
        sessionStorage.removeItem(storageKey);
      } else if (html) {
        editor.commands.setContent(html);
        sessionStorage.removeItem(htmlKey);
      }
    } else {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(htmlKey);
    }
    setInitialApplied(true);
  }, [editor, documentId, initialApplied]);

  useEffect(() => {
    if (!editor || !documentId || initialApplied) return;
    if (synced) {
      const timer = setTimeout(applyInitialContent, 100);
      return () => clearTimeout(timer);
    }
  }, [editor, documentId, synced, initialApplied, applyInitialContent]);

  if (!ready || !editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          Loading your document...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <EditorContent editor={editor} />
      <EditorStats editor={editor} />
    </div>
  );
}

function EditorStats({ editor }: { editor: Editor }) {
  const chars = editor.storage.characterCount?.characters?.() ?? 0;
  const words = editor.storage.characterCount?.words?.() ?? 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-500 shadow-sm flex gap-4">
      <span>{words} words</span>
      <span>{chars} characters</span>
      <span>{readingTime} min read</span>
    </div>
  );
}
