import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import { ArrowLeft, Share2, History, Cpu, Gauge, Activity } from 'lucide-react';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { CollabEditor } from '../components/editor/CollabEditor';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { ConnectionIndicator } from '../components/editor/ConnectionIndicator';
import { SaveStatus } from '../components/editor/SaveStatus';
import { PresenceBar } from '../components/editor/PresenceBar';
import { VersionHistoryPanel } from '../components/editor/VersionHistoryPanel';
import { CrdtInternalsPanel } from '../components/editor/CrdtInternalsPanel';
import { NetworkSimulatorPanel } from '../components/editor/NetworkSimulatorPanel';
import { AnalyticsPanel } from '../components/editor/AnalyticsPanel';
import { SharePanel } from '../components/editor/SharePanel';
import { useDocument, useVersionHistory } from '../hooks/useApi';
import { useAuthStore, useEditorStore } from '../store';
import { api } from '../lib/api';
import { seedYDocFromTipTap, clearIndexedDb } from '../lib/seedDocument';
import type { TipTapContent } from '../components/editor/PdfEmbed';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Awareness } from 'y-protocols/awareness';
import type { IndexeddbPersistence as IndexeddbPersistenceType } from 'y-indexeddb';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: document, isLoading } = useDocument(id!);
  const { data: versionHistory } = useVersionHistory(id!);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [title, setTitle] = useState('');
  const [showShare, setShowShare] = useState(false);

  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [synced, setSynced] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const persistenceRef = useRef<IndexeddbPersistenceType | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  const {
    showCrdtInternals,
    showNetworkSim,
    showAnalytics,
    showVersionHistory,
    presenceUsers,
    networkSim,
    toggleCrdtInternals,
    toggleNetworkSim,
    toggleAnalytics,
    toggleVersionHistory,
    setPresenceUsers,
    setConnectionStatus,
    setSyncStatus,
  } = useEditorStore();

  const handleContentChange = useCallback(() => {
    setIsSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      setSyncStatus('All changes saved');
    }, 800);
  }, [setSyncStatus]);

  useEffect(() => {
    if (document) setTitle(document.title);
  }, [document]);

  useEffect(() => {
    if (!id || !user || !document) return;

    let cancelled = false;
    const idbName = `collabdocs-${id}`;

    async function connect() {
      const needsSeed = document!.operationCount === 0 && document!.seedContent;

      if (needsSeed) {
        await clearIndexedDb(idbName);
      }

      const doc = new Y.Doc();

      if (needsSeed && document!.seedContent) {
        try {
          seedYDocFromTipTap(doc, document!.seedContent as TipTapContent);
        } catch (err) {
          console.error('Failed to seed template content:', err);
        }
      }

      if (cancelled) {
        doc.destroy();
        return;
      }

      const persistence = new IndexeddbPersistence(idbName, doc);
      persistenceRef.current = persistence;
      persistence.on('synced', () => setLocalReady(true));

      const wsHost = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;
      const token = localStorage.getItem('token') || '';
      const prov = new WebsocketProvider(`${wsHost}/ws`, `${id}?token=${encodeURIComponent(token)}`, doc);
      const aw = prov.awareness;

      aw.setLocalStateField('user', { id: user!.id, name: user!.name, color: user!.color });

      prov.on('status', ({ status }: { status: string }) => {
        if (status === 'connected') {
          setConnectionStatus('connected');
          setSyncStatus('Saving...');
        } else if (status === 'connecting') {
          setConnectionStatus('connecting');
          setSyncStatus('Connecting...');
          setSynced(false);
        } else {
          setConnectionStatus('disconnected');
          setSyncStatus('Saved locally — will sync when online');
        }
      });

      prov.on('sync', (isSynced: boolean) => {
        setSynced(isSynced);
        if (isSynced) {
          setConnectionStatus('connected');
          setSyncStatus('All changes saved');
          setLastSaved(new Date());
          setIsSaving(false);
        }
      });

      doc.on('update', () => handleContentChange());

      setYdoc(doc);
      setProvider(prov);
      setAwareness(aw);
      providerRef.current = prov;
      ydocRef.current = doc;

      const updatePresence = () => {
        const states = aw.getStates();
        const users = [...states.values()]
          .filter((s) => s.user)
          .map((s) => ({
            userId: s.user.id,
            name: s.user.name,
            avatar: null,
            color: s.user.color,
            isTyping: false,
            isOnline: true,
            lastActive: new Date().toISOString(),
          }));
        setPresenceUsers(users);
      };

      aw.on('change', updatePresence);
      updatePresence();

      const presenceInterval = setInterval(async () => {
        try {
          const { presence } = await api.getPresence(id!);
          setPresenceUsers(presence);
        } catch { /* offline */ }
      }, 5000);

      return () => {
        clearInterval(presenceInterval);
      };
    }

    let cleanupPresence: (() => void) | undefined;

    connect().then((cleanup) => {
      cleanupPresence = cleanup;
    });

    return () => {
      cancelled = true;
      cleanupPresence?.();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      persistenceRef.current?.destroy();
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
      persistenceRef.current = null;
      providerRef.current = null;
      ydocRef.current = null;
      setYdoc(null);
      setProvider(null);
      setAwareness(null);
      setSynced(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id, document?.id, document?.operationCount]);

  useEffect(() => {
    if (!provider) return;
    if (networkSim.disconnected) {
      provider.disconnect();
    } else {
      provider.connect();
    }
  }, [provider, networkSim.disconnected]);

  const handleTitleBlur = async () => {
    if (document && title !== document.title) {
      await api.updateDocument(id!, { title });
    }
  };

  const handleRestore = async (versionId: string) => {
    if (confirm('Restore this version? Current changes will be replaced.')) {
      await api.restoreVersion(id!, versionId);
      window.location.reload();
    }
  };

  const handleReconstruct = async (timestamp: string) => {
    const { state } = await api.reconstructAtTimestamp(id!, timestamp);
    if (ydoc) {
      Y.applyUpdate(ydoc, new Uint8Array(state));
    }
  };

  if (!user) return null;

  if (isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toolBtn = (active: boolean) =>
    `p-2 rounded-lg transition-all ${active ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink hover:bg-canvas'}`;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="border-b border-line bg-paper/95 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="p-2 text-muted hover:text-ink">
              <ArrowLeft size={18} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-base font-medium bg-transparent border-none outline-none min-w-[200px] text-ink"
            />
          </div>

          <div className="flex items-center gap-1">
            <SaveStatus lastSaved={lastSaved} isSaving={isSaving} localReady={localReady} />
            <PresenceBar users={presenceUsers} />
            <ConnectionIndicator />

            <div className="w-px h-5 bg-line mx-2 hidden sm:block" />

            <ThemeToggle className="!p-1.5" />

            <button type="button" onClick={toggleVersionHistory} className={toolBtn(showVersionHistory)} title="Version History">
              <History size={17} />
            </button>
            <button type="button" onClick={toggleCrdtInternals} className={toolBtn(showCrdtInternals)} title="CRDT Internals">
              <Cpu size={17} />
            </button>
            <button type="button" onClick={toggleNetworkSim} className={toolBtn(showNetworkSim)} title="Network Simulator">
              <Gauge size={17} />
            </button>
            <button type="button" onClick={toggleAnalytics} className={toolBtn(showAnalytics)} title="Analytics">
              <Activity size={17} />
            </button>
            <button
              type="button"
              onClick={() => setShowShare(!showShare)}
              className={toolBtn(showShare)}
              title="Share"
            >
              <Share2 size={17} />
            </button>
          </div>
        </div>

        {showShare && id && (
          <SharePanel documentId={id} onClose={() => setShowShare(false)} />
        )}

        <EditorToolbar editor={editor} />
      </header>

      <div className={`flex flex-1 ${showCrdtInternals ? 'divide-x divide-line' : ''}`}>
        <div className={showCrdtInternals ? 'w-1/2 overflow-y-auto' : 'flex-1 overflow-y-auto'}>
          <CollabEditor
            ydoc={ydoc}
            provider={provider}
            awareness={awareness}
            user={user}
            synced={synced}
            onEditorReady={setEditor}
            onContentChange={handleContentChange}
          />
        </div>
        {showCrdtInternals && (
          <div className="w-1/2 bg-white">
            <CrdtInternalsPanel />
          </div>
        )}
      </div>

      {showVersionHistory && versionHistory && (
        <VersionHistoryPanel
          versions={versionHistory.versions}
          operations={versionHistory.operations}
          onRestore={handleRestore}
          onReconstruct={handleReconstruct}
          onClose={toggleVersionHistory}
        />
      )}

      {showNetworkSim && <NetworkSimulatorPanel />}
      {showAnalytics && <AnalyticsPanel />}
    </div>
  );
}
