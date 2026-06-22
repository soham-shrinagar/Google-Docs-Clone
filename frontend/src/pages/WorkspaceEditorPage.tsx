import { useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Document } from '../types';
import { useAuthStore } from '../store';
import { api } from '../lib/api';
import { SyncStatus } from '../components/editor/SyncStatus';
import { PageLoader } from '../components/ui/LoadingOverlay';
import { useWorkspaceSync, extractWorkspaceSeed } from '../hooks/useWorkspaceSync';
import { WorkspaceCanvas, addBlankPageToWorkspace, insertWorkspaceImage } from '../components/workspace/WorkspaceCanvas';
import { WorkspaceToolbar } from '../components/workspace/WorkspaceToolbar';
import { WorkspaceLayerPanel } from '../components/workspace/WorkspaceLayerPanel';
import { WorkspacePropertiesPanel } from '../components/workspace/WorkspacePropertiesPanel';
import { WorkspacePageStrip } from '../components/workspace/WorkspacePageStrip';
import { WorkspaceTextEditor } from '../components/workspace/WorkspaceTextEditor';
import type { WorkspaceTool, WorkspaceElementData } from '../lib/workspace/types';
import {
  deletePage,
  duplicatePage,
  upsertElement,
} from '../lib/workspace/yjsBinding';
import { exportWorkspaceAsPdf, exportWorkspaceAsPngZip } from '../lib/workspace/export';

interface Props {
  document: Document;
}

export function WorkspaceEditorPage({ document }: Props) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [title, setTitle] = useState(document.title);
  const [activeTool, setActiveTool] = useState<WorkspaceTool>('select');
  const [zoom, setZoom] = useState(0.75);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<WorkspaceElementData | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const workspaceSeed = useMemo(
    () => extractWorkspaceSeed(document),
    [document.id, document.operationCount, document.seedContent]
  );
  const needsSeed = document.operationCount === 0 && !!workspaceSeed;

  const { ydoc, synced, pages, elements, localReady } = useWorkspaceSync({
    documentId: document.id,
    userId: user?.id ?? '',
    userName: user?.name ?? '',
    userColor: user?.color ?? '#888',
    workspaceSeed,
    needsSeed,
  });

  const displayPages = pages.length > 0 ? pages : (workspaceSeed?.pages ?? []);
  const displayElements = elements.length > 0 ? elements : (workspaceSeed?.elements ?? []);

  const canEdit = document.permission === 'OWNER' || document.permission === 'EDITOR';
  const currentPageId = activePageId ?? displayPages[0]?.id ?? null;
  const selectedElements = displayElements.filter((e) => selectedIds.includes(e.id));
  const activePage = displayPages.find((p) => p.id === currentPageId) ?? null;

  const handleTitleBlur = async () => {
    if (title !== document.title) await api.updateDocument(document.id, { title });
  };

  const handleUpdateElement = useCallback(
    (el: WorkspaceElementData) => {
      if (!ydoc) return;
      upsertElement(ydoc, el);
    },
    [ydoc]
  );

  const handleEditText = useCallback((el: WorkspaceElementData) => {
    if (el.type === 'text' || el.type === 'sticky') {
      setEditingElement(el);
      setSelectedIds([el.id]);
    }
  }, []);

  const handleCommitText = (text: string) => {
    if (!editingElement || !ydoc) {
      setEditingElement(null);
      return;
    }
    handleUpdateElement({ ...editingElement, data: { ...editingElement.data, text } });
    setEditingElement(null);
  };

  const handleToggleVisible = (id: string) => {
    const el = displayElements.find((e) => e.id === id);
    if (el && ydoc) upsertElement(ydoc, { ...el, visible: !el.visible });
  };

  const handleToggleLocked = (id: string) => {
    const el = displayElements.find((e) => e.id === id);
    if (el && ydoc) upsertElement(ydoc, { ...el, locked: !el.locked });
  };

  const handleAddPage = () => {
    if (!ydoc) return;
    const id = addBlankPageToWorkspace(ydoc, `Page ${displayPages.length + 1}`);
    setActivePageId(id);
  };

  const handleDuplicatePage = () => {
    if (!ydoc || !currentPageId) return;
    const newId = crypto.randomUUID();
    duplicatePage(ydoc, currentPageId, newId);
    setActivePageId(newId);
  };

  const handleDeletePage = () => {
    if (!ydoc || !currentPageId || displayPages.length <= 1) return;
    if (!confirm('Delete this page?')) return;
    deletePage(ydoc, currentPageId);
    setActivePageId(null);
    setSelectedIds([]);
  };

  const handleInsertImage = () => {
    if (activeTool === 'image') imageRef.current?.click();
    else {
      setActiveTool('image');
      imageRef.current?.click();
    }
  };

  const handleImageFile = async (file: File) => {
    if (!ydoc || !currentPageId) return;
    const id = await insertWorkspaceImage(ydoc, currentPageId, file, displayElements);
    setSelectedIds([id]);
    setActiveTool('select');
  };

  const handleExport = async () => {
    const format = window.prompt('Export as pdf or png?', 'pdf');
    if (!format) return;
    try {
      if (format.toLowerCase().startsWith('p')) {
        await exportWorkspaceAsPdf(displayPages, displayElements, title);
      } else {
        await exportWorkspaceAsPngZip(displayPages, displayElements, title);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const scrollToPage = (pageId: string) => {
    setActivePageId(pageId);
    window.document.getElementById(`ws-page-${pageId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!user) return null;

  if (!ydoc) {
    return (
      <PageLoader
        message={synced ? 'Loading workspace…' : 'Connecting…'}
        submessage={needsSeed ? 'Preparing your document' : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <header className="glass-panel sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-1.5 gap-3 h-12">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button type="button" onClick={() => navigate('/dashboard')} className="btn-ghost p-2! shrink-0">
              <ArrowLeft size={18} />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="text-base font-semibold bg-transparent border-none outline-none min-w-0 flex-1 text-ink truncate max-w-md"
            />
            <span className="badge badge-accent text-[10px] shrink-0 hidden sm:inline">Workspace</span>
          </div>
          <SyncStatus />
        </div>
        <WorkspaceToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          zoom={zoom}
          onZoomChange={setZoom}
          onAddPage={handleAddPage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onInsertImage={handleInsertImage}
          onExport={handleExport}
          canEdit={canEdit}
        />
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto min-w-0 bg-[#e8eaed] relative">
          {!localReady && displayPages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#e8eaed]/80 z-10">
              <PageLoader message="Syncing pages…" compact />
            </div>
          )}
          <WorkspaceCanvas
            ydoc={ydoc}
            pages={displayPages}
            elements={displayElements}
            zoom={zoom}
            activeTool={activeTool}
            selectedIds={selectedIds}
            editable={canEdit}
            onSelect={setSelectedIds}
            onEditText={handleEditText}
            canvasContainerRef={canvasContainerRef}
          />
        </div>

        <WorkspacePropertiesPanel
          selectedElements={selectedElements}
          activePage={activePage}
          onUpdateElement={handleUpdateElement}
        />

        <WorkspaceLayerPanel
          elements={displayElements}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onToggleVisible={handleToggleVisible}
          onToggleLocked={handleToggleLocked}
        />
      </div>

      <WorkspacePageStrip
        pages={displayPages}
        activePageId={currentPageId}
        onSelectPage={scrollToPage}
      />

      {editingElement && (
        <WorkspaceTextEditor
          element={editingElement}
          zoom={zoom}
          pageContainer={canvasContainerRef.current}
          onCommit={handleCommitText}
          onCancel={() => setEditingElement(null)}
        />
      )}

      <input
        ref={imageRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImageFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
