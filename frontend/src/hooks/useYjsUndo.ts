import { useEffect, useRef, useState, useCallback } from 'react';
import * as Y from 'yjs';

export function useYjsUndo(ydoc: Y.Doc | null) {
  const undoManagerRef = useRef<Y.UndoManager | null>(null);
  const [stackVersion, setStackVersion] = useState(0);

  useEffect(() => {
    if (!ydoc) {
      undoManagerRef.current = null;
      return;
    }

    const fragment = ydoc.getXmlFragment('default');
    const undoManager = new Y.UndoManager(fragment, {
      trackedOrigins: new Set([null]),
    });

    const bump = () => setStackVersion((v) => v + 1);
    undoManager.on('stack-item-added', bump);
    undoManager.on('stack-item-popped', bump);
    undoManager.on('stack-cleared', bump);

    undoManagerRef.current = undoManager;

    return () => {
      undoManager.destroy();
      undoManagerRef.current = null;
    };
  }, [ydoc]);

  const undo = useCallback(() => {
    undoManagerRef.current?.undo();
  }, []);

  const redo = useCallback(() => {
    undoManagerRef.current?.redo();
  }, []);

  const canUndo = (undoManagerRef.current?.undoStack.length ?? 0) > 0;
  const canRedo = (undoManagerRef.current?.redoStack.length ?? 0) > 0;

  void stackVersion;

  return { undo, redo, canUndo, canRedo };
}
