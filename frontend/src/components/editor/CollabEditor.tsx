import { useEffect, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import type { WebsocketProvider } from 'y-websocket';
import type { Awareness } from 'y-protocols/awareness';
import type { User } from '../../types';
import { getBaseExtensions } from '../../lib/editorExtensions';
import { SlashCommands } from './SlashCommands';

interface CollabEditorProps {
  ydoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  awareness: Awareness | null;
  user: User;
  synced?: boolean;
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
  onContentChange?: () => void;
}

export function CollabEditor({
  ydoc,
  provider,
  awareness,
  user,
  synced = false,
  editable = true,
  onEditorReady,
  onContentChange,
}: CollabEditorProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ydoc && provider) setReady(true);
  }, [ydoc, provider]);

  const editor = useEditor(
    {
      extensions: [
        ...getBaseExtensions(),
        Placeholder.configure({ placeholder: 'Start typing, or type / for commands…' }),
        CharacterCount,
        SlashCommands,
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
          class: 'prose prose-lg max-w-none focus:outline-none min-h-[900px]',
        },
      },
      onCreate: ({ editor: e }) => onEditorReady?.(e),
      onUpdate: () => onContentChange?.(),
    },
    [ready, ydoc, awareness, user.name, user.color]
  );

  if (!ready || !editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          {synced ? 'Loading editor…' : 'Connecting & syncing document…'}
        </div>
      </div>
    );
  }

  return (
    <div className="editor-canvas">
      <div className="editor-paper">
        <EditorContent editor={editor} />
      </div>
      <EditorStats editor={editor} />
    </div>
  );
}

function EditorStats({ editor }: { editor: Editor }) {
  const chars = editor.storage.characterCount?.characters?.() ?? 0;
  const words = editor.storage.characterCount?.words?.() ?? 0;
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-gray-200 rounded-full px-4 py-1.5 text-xs text-gray-500 shadow-md flex gap-4 z-10">
      <span>{words} words</span>
      <span>{chars} characters</span>
      <span>{readingTime} min read</span>
    </div>
  );
}
