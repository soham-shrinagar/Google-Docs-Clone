import { useEffect, useCallback } from 'react';
import type { Editor } from '@tiptap/react';

interface UseEditorKeyboardShortcutsOptions {
  editor: Editor | null;
  onUndo?: () => void;
  onRedo?: () => void;
  onFind?: () => void;
  onReplace?: () => void;
  onShortcutsHelp?: () => void;
}

export function useEditorKeyboardShortcuts({
  editor,
  onUndo,
  onRedo,
  onFind,
  onReplace,
  onShortcutsHelp,
}: UseEditorKeyboardShortcutsOptions) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;

      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault();
        onRedo?.();
        return;
      }
      if (e.key === 'f') {
        e.preventDefault();
        onFind?.();
        return;
      }
      if (e.key === 'h') {
        e.preventDefault();
        onReplace?.();
        return;
      }
      if (e.key === 'k') {
        e.preventDefault();
        if (!editor) return;
        const prev = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Enter URL', prev || 'https://');
        if (url === null) return;
        if (url === '') editor.chain().focus().unsetLink().run();
        else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        onShortcutsHelp?.();
      }
    },
    [editor, onUndo, onRedo, onFind, onReplace, onShortcutsHelp]
  );

  useEffect(() => {
    window.document.addEventListener('keydown', handler);
    return () => window.document.removeEventListener('keydown', handler);
  }, [handler]);
}
