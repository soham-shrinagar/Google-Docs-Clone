import { useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Awareness } from 'y-protocols/awareness';
import { clearIndexedDb } from '../lib/seedDocument';
import { observeWorkspace, parseWorkspaceSeed, seedWorkspaceYDoc } from '../lib/workspace/yjsBinding';
import type { WorkspaceElementData, WorkspacePageData, WorkspaceSeed } from '../lib/workspace/types';
import { useEditorStore } from '../store';

interface UseWorkspaceSyncOptions {
  documentId: string;
  userId: string;
  userName: string;
  userColor: string;
  workspaceSeed: WorkspaceSeed | null;
  needsSeed: boolean;
}

export function useWorkspaceSync({
  documentId,
  userId,
  userName,
  userColor,
  workspaceSeed,
  needsSeed,
}: UseWorkspaceSyncOptions) {
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [synced, setSynced] = useState(false);
  const [pages, setPages] = useState<WorkspacePageData[]>([]);
  const [elements, setElements] = useState<WorkspaceElementData[]>([]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seedRef = useRef(workspaceSeed);
  seedRef.current = workspaceSeed;

  const { setConnectionStatus, setSaveState, setLocalReady, resetConnectionState } = useEditorStore();

  useEffect(() => {
    if (!documentId || !userId) return;

    resetConnectionState();
    let cancelled = false;
    const idbName = `collabdocs-ws-${documentId}`;

    async function connect() {
      if (needsSeed) await clearIndexedDb(idbName);

      const doc = new Y.Doc();

      if (needsSeed && seedRef.current) {
        seedWorkspaceYDoc(doc, seedRef.current);
      }

      if (cancelled) {
        doc.destroy();
        return;
      }

      const persistence = new IndexeddbPersistence(idbName, doc);
      persistence.on('synced', () => setLocalReady(true));

      const wsHost = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;
      const token = localStorage.getItem('token') || '';
      const prov = new WebsocketProvider(
        `${wsHost}/ws`,
        `${documentId}?token=${encodeURIComponent(token)}`,
        doc
      );
      const aw = prov.awareness;
      aw.setLocalStateField('user', { id: userId, name: userName, color: userColor });

      prov.on('status', ({ status }: { status: string }) => {
        if (status === 'connected') setConnectionStatus('connected');
        else if (status === 'connecting') {
          setConnectionStatus('connecting');
          setSynced(false);
        } else setConnectionStatus('disconnected');
      });

      prov.on('sync', (isSynced: boolean) => {
        setSynced(isSynced);
        if (isSynced) setConnectionStatus('connected');
      });

      if (prov.wsconnected) setConnectionStatus('connected');
      if (prov.synced) {
        setSynced(true);
        setConnectionStatus('connected');
      }

      doc.on('update', (_update, origin) => {
        if (origin === 'remote') return;
        setSaveState('saving');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveTimerRef.current = null;
          setSaveState('idle');
        }, 400);
      });

      setYdoc(doc);
      setProvider(prov);
      setAwareness(aw);
    }

    void connect();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setYdoc(null);
      setProvider(null);
      setAwareness(null);
      setSynced(false);
      resetConnectionState();
    };
  }, [documentId, userId, userName, userColor, needsSeed, resetConnectionState, setConnectionStatus, setLocalReady, setSaveState]);

  useEffect(() => {
    if (!ydoc) return;
    return observeWorkspace(ydoc, ({ pages: p, elements: e }) => {
      setPages(p);
      setElements(e);
    });
  }, [ydoc]);

  return { ydoc, provider, awareness, synced, pages, elements };
}

export function extractWorkspaceSeed(document: {
  seedContent?: Record<string, unknown> | null;
  operationCount: number;
}): WorkspaceSeed | null {
  if (document.operationCount > 0) return null;
  return parseWorkspaceSeed(document.seedContent);
}
