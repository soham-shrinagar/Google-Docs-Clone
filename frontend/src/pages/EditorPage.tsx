import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Editor } from '@tiptap/react';
import { ArrowLeft } from 'lucide-react';
import { CollabEditor } from '../components/editor/CollabEditor';
import { EditorToolbar } from '../components/editor/EditorToolbar';
import { EditorHeaderActions } from '../components/editor/EditorHeaderActions';
import { useYjsUndo } from '../hooks/useYjsUndo';
import { useEditorKeyboardShortcuts } from '../hooks/useEditorKeyboardShortcuts';
import { SyncStatus } from '../components/editor/SyncStatus';
import { VersionHistoryPanel } from '../components/editor/VersionHistoryPanel';
import { SharePanel } from '../components/editor/SharePanel';
import { CommentsPanel } from '../components/editor/CommentsPanel';
import { FindReplacePanel } from '../components/editor/FindReplacePanel';
import { DocumentStatsModal } from '../components/editor/DocumentStatsModal';
import { KeyboardShortcutsModal } from '../components/editor/KeyboardShortcutsModal';
import { DocumentOutline } from '../components/editor/DocumentOutline';
import { VoiceDictationPanel } from '../components/editor/VoiceDictationPanel';
import { AiAssistPanel } from '../components/editor/AiAssistPanel';
import { useVoiceDictation } from '../hooks/useVoiceDictation';
import type { AiRewriteAction, DictationInsertMode } from '../lib/aiTypes';
import { useDocument, useVersionHistory } from '../hooks/useApi';
import { useAuthStore, useEditorStore } from '../store';
import { api } from '../lib/api';
import { seedYDocFromTipTap, clearIndexedDb } from '../lib/seedDocument';
import type { TipTapContent } from '../components/editor/PdfEmbed';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { Awareness } from 'y-protocols/awareness';
import type { PageZoomMode } from '../lib/pageZoom';
import type { IndexeddbPersistence as IndexeddbPersistenceType } from 'y-indexeddb';

const ZOOM_STORAGE_KEY = 'collabdocs-page-zoom';

function loadPageZoom(): PageZoomMode {
  try {
    const saved = localStorage.getItem(ZOOM_STORAGE_KEY);
    if (saved === '50' || saved === '75' || saved === '90' || saved === '100' || saved === '125' || saved === '150' || saved === '200' || saved === 'fit-width' || saved === 'fit-height') {
      return saved;
    }
  } catch { /* ignore */ }
  return '100';
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: document, isLoading } = useDocument(id!);
  const { data: versionHistory } = useVersionHistory(id!);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [title, setTitle] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [findMode, setFindMode] = useState<'find' | 'replace' | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [pageZoom, setPageZoom] = useState<PageZoomMode>(loadPageZoom);
  const [showVoice, setShowVoice] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [aiPanelKey, setAiPanelKey] = useState(0);
  const [aiInitial, setAiInitial] = useState<{
    selection?: string;
    action?: AiRewriteAction;
    tab?: 'rewrite' | 'summarize' | 'chat' | 'insights';
  }>({});
  const [dictationLang, setDictationLang] = useState('en-US');
  const [dictationMode, setDictationMode] = useState<DictationInsertMode>('cursor');

  const voice = useVoiceDictation(editor, id ?? '', dictationLang, dictationMode);

  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const { undo, redo, canUndo, canRedo } = useYjsUndo(ydoc);

  useEditorKeyboardShortcuts({
    editor,
    onUndo: undo,
    onRedo: redo,
    onFind: () => setFindMode('find'),
    onReplace: () => setFindMode('replace'),
    onShortcutsHelp: () => setShowShortcuts(true),
  });

  useEffect(() => {
    const openFind = () => setFindMode('find');
    const openAi = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: typeof aiInitial.tab; action?: AiRewriteAction }>).detail;
      setAiInitial({ tab: detail?.tab ?? 'rewrite', action: detail?.action });
      setAiPanelKey((k) => k + 1);
      setShowAi(true);
      setShowVoice(false);
    };
    const openVoice = () => {
      setShowVoice(true);
      setShowAi(false);
    };
    window.addEventListener('collabdocs:open-find', openFind);
    window.addEventListener('collabdocs:open-ai', openAi);
    window.addEventListener('collabdocs:open-voice', openVoice);
    return () => {
      window.removeEventListener('collabdocs:open-find', openFind);
      window.removeEventListener('collabdocs:open-ai', openAi);
      window.removeEventListener('collabdocs:open-voice', openVoice);
    };
  }, []);

  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [awareness, setAwareness] = useState<Awareness | null>(null);
  const [synced, setSynced] = useState(false);
  const persistenceRef = useRef<IndexeddbPersistenceType | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    showVersionHistory,
    presenceUsers,
    toggleVersionHistory,
    setPresenceUsers,
    setConnectionStatus,
    setSaveState,
    setLocalReady,
    resetConnectionState,
  } = useEditorStore();

  useEffect(() => {
    if (document) setTitle(document.title);
  }, [document]);

  useEffect(() => {
    if (!id || !user || !document) return;

    resetConnectionState();
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
        } else if (status === 'connecting') {
          setConnectionStatus('connecting');
          setSynced(false);
        } else {
          setConnectionStatus('disconnected');
        }
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
    }

    void connect();

    return () => {
      cancelled = true;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
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
      resetConnectionState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id, document?.id, document?.operationCount]);

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
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted font-medium">Loading document…</p>
        </div>
      </div>
    );
  }

  const canEdit = document.permission === 'OWNER' || document.permission === 'EDITOR';
  const canComment = canEdit || document.permission === 'COMMENTER';

  const handlePageZoomChange = (mode: PageZoomMode) => {
    setPageZoom(mode);
    try {
      localStorage.setItem(ZOOM_STORAGE_KEY, mode);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="glass-panel sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-1.5 gap-3 h-12">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost shrink-0" aria-label="Back to dashboard">
              <ArrowLeft size={16} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-sm font-medium bg-transparent border-none outline-none min-w-0 flex-1 text-ink truncate max-w-md"
            />
            <div className="md:hidden shrink-0">
              <SyncStatus compact />
            </div>
          </div>

          <EditorHeaderActions
            editor={editor}
            title={title}
            presenceUsers={presenceUsers}
            pageZoom={pageZoom}
            onPageZoomChange={handlePageZoomChange}
            canEdit={canEdit}
            showOutline={showOutline}
            showComments={showComments}
            showVoice={showVoice}
            showAi={showAi}
            showShare={showShare}
            showVersionHistory={showVersionHistory}
            onToggleOutline={() => setShowOutline((v) => !v)}
            onToggleComments={() => setShowComments((v) => !v)}
            onToggleVoice={() => { setShowVoice((v) => !v); setShowAi(false); }}
            onToggleAi={() => { setShowAi((v) => !v); setShowVoice(false); }}
            onToggleShare={() => setShowShare((v) => !v)}
            onToggleVersionHistory={toggleVersionHistory}
            onShowStats={() => setShowStats(true)}
            onShowShortcuts={() => setShowShortcuts(true)}
            onFind={() => setFindMode('find')}
            onReplace={() => setFindMode('replace')}
          />
        </div>

        {showShare && id && (
          <SharePanel documentId={id} onClose={() => setShowShare(false)} />
        )}
        {findMode && (
          <FindReplacePanel editor={editor} mode={findMode} onClose={() => { setFindMode(null); editor?.commands.clearSearch(); }} />
        )}

        {showVoice && canEdit && (
          <VoiceDictationPanel
            state={voice.state}
            transcript={voice.transcript}
            interim={voice.interim}
            error={voice.error}
            language={dictationLang}
            insertMode={dictationMode}
            onLanguageChange={setDictationLang}
            onInsertModeChange={setDictationMode}
            onStart={voice.start}
            onStop={voice.stop}
            onClose={() => setShowVoice(false)}
          />
        )}

        {canEdit && (
          <EditorToolbar
            editor={editor}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {showOutline && <DocumentOutline editor={editor} onClose={() => setShowOutline(false)} />}
        <div className="flex-1 overflow-y-auto min-w-0">
          <CollabEditor
            ydoc={ydoc}
            provider={provider}
            awareness={awareness}
            user={user}
            documentId={id}
            synced={synced}
            editable={canEdit}
            pageZoom={pageZoom}
            onEditorReady={setEditor}
            onOpenAiAssist={(selection, action) => {
              setAiInitial({ selection, action, tab: action ? 'rewrite' : 'chat' });
              setAiPanelKey((k) => k + 1);
              setShowAi(true);
              setShowVoice(false);
            }}
          />
        </div>
        {showAi && id && (
          <AiAssistPanel
            key={aiPanelKey}
            editor={editor}
            documentId={id}
            onClose={() => setShowAi(false)}
            initialTab={aiInitial.tab}
            initialSelection={aiInitial.selection}
            initialAction={aiInitial.action}
          />
        )}
        {showComments && id && (
          <CommentsPanel documentId={id} editor={editor} canComment={canComment} onClose={() => setShowComments(false)} />
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

      {showStats && <DocumentStatsModal editor={editor} onClose={() => setShowStats(false)} />}
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
