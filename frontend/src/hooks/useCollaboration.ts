import { useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { useEditorStore } from '../store';
import type { User } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;

export function useCollaboration(documentId: string, user: User | null) {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const {
    setConnectionStatus,
    setSyncStatus,
    addCrdtEvent,
    networkSim,
  } = useEditorStore();

  const getToken = useCallback(() => {
    const match = document.cookie.match(/token=([^;]+)/);
    return match ? match[1] : localStorage.getItem('token') || '';
  }, []);

  useEffect(() => {
    if (!documentId || !user) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const persistence = new IndexeddbPersistence(`collabdocs-${documentId}`, ydoc);
    persistenceRef.current = persistence;

    persistence.on('synced', () => {
      setSyncStatus('Local cache loaded');
    });

    const token = getToken();
    const wsBase = `${WS_URL}/ws`;

    const provider = new WebsocketProvider(wsBase, `${documentId}?token=${encodeURIComponent(token)}`, ydoc, {
      connect: !networkSim.disconnected,
    });
    providerRef.current = provider;

    provider.on('status', ({ status }: { status: string }) => {
      if (status === 'connected') {
        setConnectionStatus('connected');
        setSyncStatus('Synchronized');
        addCrdtEvent({
          id: crypto.randomUUID(),
          type: 'sync',
          userId: user.id,
          documentId,
          timestamp: Date.now(),
          lamportTimestamp: Date.now(),
          vectorClock: {},
          description: 'WebSocket connected — CRDT sync active',
        });
      } else if (status === 'connecting') {
        setConnectionStatus('connecting');
        setSyncStatus('Connecting...');
      } else {
        setConnectionStatus('disconnected');
        setSyncStatus('Offline — editing locally');
        addCrdtEvent({
          id: crypto.randomUUID(),
          type: 'sync',
          userId: user.id,
          documentId,
          timestamp: Date.now(),
          lamportTimestamp: Date.now(),
          vectorClock: {},
          description: 'Connection lost — operations queued locally',
        });
      }
    });

    provider.on('sync', (isSynced: boolean) => {
      if (isSynced) {
        setConnectionStatus('connected');
        setSyncStatus('Synchronized');
        addCrdtEvent({
          id: crypto.randomUUID(),
          type: 'merge',
          userId: user.id,
          documentId,
          timestamp: Date.now(),
          lamportTimestamp: Date.now(),
          vectorClock: Object.fromEntries(
            [...Y.encodeStateVector(ydoc)].map((v, i) => [i.toString(), v])
          ),
          description: 'CRDT state reconciled — eventual consistency achieved',
        });
      }
    });

    ydoc.on('update', (update: Uint8Array, origin: unknown) => {
      if (origin !== 'remote') {
        addCrdtEvent({
          id: crypto.randomUUID(),
          type: 'insert',
          userId: user.id,
          documentId,
          timestamp: Date.now(),
          lamportTimestamp: Date.now(),
          vectorClock: {},
          description: `Local operation generated (${update.byteLength} bytes)`,
        });
      } else {
        addCrdtEvent({
          id: crypto.randomUUID(),
          type: 'merge',
          userId: 'remote',
          documentId,
          timestamp: Date.now(),
          lamportTimestamp: Date.now(),
          vectorClock: {},
          description: 'Remote operation merged — conflict-free',
        });
      }
    });

    return () => {
      provider.destroy();
      persistence.destroy();
      ydoc.destroy();
    };
  }, [documentId, user, getToken, setConnectionStatus, setSyncStatus, addCrdtEvent, networkSim.disconnected]);

  useEffect(() => {
    const provider = providerRef.current;
    if (!provider) return;

    if (networkSim.disconnected) {
      provider.disconnect();
    } else {
      provider.connect();
    }
  }, [networkSim.disconnected]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    awareness: providerRef.current?.awareness ?? null,
  };
}
