import type { Editor } from '@tiptap/react';

export function applyVoiceCommand(
  editor: Editor,
  action: string,
  payload: Record<string, unknown>
) {
  const chain = editor.chain().focus();
  switch (action) {
    case 'heading':
      chain.setHeading({ level: (payload.level as 1 | 2) ?? 1 }).run();
      break;
    case 'bulletList':
      chain.toggleBulletList().run();
      break;
    case 'orderedList':
      chain.toggleOrderedList().run();
      break;
    case 'table':
      chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      break;
    case 'codeBlock':
      chain.toggleCodeBlock().run();
      break;
    case 'bold':
      chain.toggleBold().run();
      break;
    case 'italic':
      chain.toggleItalic().run();
      break;
    case 'undo':
      chain.undo().run();
      break;
    default:
      break;
  }
}
