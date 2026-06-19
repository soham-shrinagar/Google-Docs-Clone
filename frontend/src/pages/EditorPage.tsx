import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import {
  ArrowLeft, Share2, History, Cpu, Gauge, Activity,
} from 'lucide-react';
import { CollabEditor } from '../components/editor/CollabEditor';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { ConnectionIndicator } from '../components/editor/ConnectionIndicator';
import { SaveStatus } from '../components/editor/SaveStatus';
import { PresenceBar } from '../components/editor/PresenceBar';
import { VersionHistoryPanel } from '../components/editor/VersionHistoryPanel';
import { CrdtInternalsPanel } from '../components/editor/CrdtInternalsPanel';
import { NetworkSimulatorPanel } from '../components/editor/NetworkSimulatorPanel';
import { AnalyticsPanel } from '../components/editor/AnalyticsPanel';
import { useDocument, useVersionHistory } from '../hooks/useApi';
import { useAuthStore, useEditorStore } from '../store';
import { api } from '../lib/api';
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
  const [shareEmail, setShareEmail] = useState('');
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
    addCrdtEvent,
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
    if (!id || !user) return;

    const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3001`;
    const token = localStorage.getItem('token') || '';
    const doc = new Y.Doc();

    const persistence = new IndexeddbPersistence(`collabdocs-${id}`, doc);
    persistenceRef.current = persistence;
    persistence.on('synced', () => setLocalReady(true));

    const wsBase = `${WS_URL}/ws`;
    const prov = new WebsocketProvider(wsBase, `${id}?token=${encodeURIComponent(token)}`, doc);
    const aw = prov.awareness;

    aw.setLocalStateField('user', { id: user.id, name: user.name, color: user.color });

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

    doc.on('update', () => {
      handleContentChange();
    });

    setYdoc(doc);
    setProvider(prov);
    setAwareness(aw);

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
        const { presence } = await api.getPresence(id);
        setPresenceUsers(presence);
      } catch { /* offline */ }
    }, 5000);

    return () => {
      clearInterval(presenceInterval);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      persistence.destroy();
      prov.destroy();
      doc.destroy();
    };
  }, [id, user, setPresenceUsers, setConnectionStatus, setSyncStatus, addCrdtEvent, handleContentChange]);

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

  const handleShare = async () => {
    if (!shareEmail) return;
    await api.shareDocument(id!, shareEmail, 'EDITOR');
    setShareEmail('');
    setShowShare(false);
    alert('Document shared!');
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft size={20} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-lg font-semibold bg-transparent border-none outline-none focus:ring-0 min-w-[200px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <SaveStatus lastSaved={lastSaved} isSaving={isSaving} localReady={localReady} />
            <PresenceBar users={presenceUsers} />
            <ConnectionIndicator />

            <div className="w-px h-6 bg-gray-200 mx-1" />

            <button onClick={toggleVersionHistory} className="p-2 hover:bg-gray-100 rounded-lg" title="Version History">
              <History size={18} />
            </button>
            <button onClick={toggleCrdtInternals} className={`p-2 rounded-lg ${showCrdtInternals ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`} title="CRDT Internals">
              <Cpu size={18} />
            </button>
            <button onClick={toggleNetworkSim} className={`p-2 rounded-lg ${showNetworkSim ? 'bg-orange-100 text-orange-700' : 'hover:bg-gray-100'}`} title="Network Simulator">
              <Gauge size={18} />
            </button>
            <button onClick={toggleAnalytics} className={`p-2 rounded-lg ${showAnalytics ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`} title="Analytics">
              <Activity size={18} />
            </button>
            <button onClick={() => setShowShare(!showShare)} className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {showShare && (
          <div className="px-4 pb-3 flex gap-2">
            <input
              type="email"
              placeholder="Collaborator email..."
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <button onClick={handleShare} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium">
              Share as Editor
            </button>
          </div>
        )}

        <EditorToolbar editor={editor} />
      </header>

      <div className={`flex flex-1 ${showCrdtInternals ? 'divide-x divide-gray-200' : ''}`}>
        <div className={showCrdtInternals ? 'w-1/2 overflow-y-auto' : 'flex-1 overflow-y-auto'}>
          <CollabEditor
            ydoc={ydoc}
            provider={provider}
            awareness={awareness}
            user={user}
            documentId={id}
            synced={synced}
            onEditorReady={setEditor}
            onContentChange={handleContentChange}
          />
        </div>
        {showCrdtInternals && (
          <div className="w-1/2">
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
