import * as Y from 'yjs';
import { prosemirrorJSONToYXmlFragment } from 'y-prosemirror';
import { getEditorSchema } from './editorExtensions';
import type { TipTapContent } from '../components/editor/PdfEmbed';

/** Write TipTap JSON into a Yjs doc before the collaboration editor mounts. */
export function seedYDocFromTipTap(ydoc: Y.Doc, content: TipTapContent) {
  const schema = getEditorSchema();
  const fragment = ydoc.getXmlFragment('default');
  prosemirrorJSONToYXmlFragment(schema, content, fragment);
}

export function clearIndexedDb(dbName: string): Promise<void> {
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}
