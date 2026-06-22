import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pin, LayoutTemplate, Upload, FilePlus, BarChart3 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { DocumentCard } from '../components/dashboard/DocumentCard';
import { TemplatePicker } from '../components/dashboard/TemplatePicker';
import { useDocuments, useRecentDocuments, useCreateDocument, useDeleteDocument } from '../hooks/useApi';
import { useDashboardStore, useAuthStore } from '../store';
import { api } from '../lib/api';
import { buildUploadInitialContent } from '../lib/uploadProcessor';
import { buildWorkspaceSeedFromFile, isWorkspaceFile, WORKSPACE_ACCEPT } from '../lib/workspace/uploadSeed';

const QUICK_ACTIONS = [
  { id: 'blank', label: 'Blank document', desc: 'Start from scratch', icon: FilePlus },
  { id: 'template', label: 'From template', desc: 'Resume, report, notes', icon: LayoutTemplate },
  { id: 'upload', label: 'Upload file', desc: 'PDF, Word, image', icon: Upload },
  { id: 'analytics', label: 'AI analytics', desc: 'Usage & activity', icon: BarChart3 },
] as const;

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const uploadRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { search, sortBy, sortOrder, filterPinned, setSearch, setSortBy, setSortOrder, setFilterPinned } =
    useDashboardStore();
  const { data: documents, isLoading } = useDocuments();
  const { data: recentDocs } = useRecentDocuments();
  const createDoc = useCreateDocument();
  const deleteDoc = useDeleteDocument();
  const [creating, setCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (templateId?: string) => {
    setCreating(true);
    setError('');
    try {
      const { document } = await createDoc.mutateAsync(
        templateId ? { templateId } : undefined
      );
      setShowTemplates(false);
      navigate(`/document/${document.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const handleUpload = async (file: File) => {
    setCreating(true);
    setError('');
    try {
      const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded Document';

      if (isWorkspaceFile(file)) {
        const seed = await buildWorkspaceSeedFromFile(file);
        const { document } = await api.createWorkspace({ title, seed });
        navigate(`/document/${document.id}`);
      } else {
        const seedContent = await buildUploadInitialContent(file);
        const { document } = await createDoc.mutateAsync({ title, seedContent });
        navigate(`/document/${document.id}`);
      }
      setShowTemplates(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this document?')) {
      await deleteDoc.mutateAsync(id);
    }
  };

  const handlePin = async (id: string) => {
    await api.togglePin(id);
    await queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const handleQuickAction = (id: typeof QUICK_ACTIONS[number]['id']) => {
    if (id === 'blank') void handleCreate();
    else if (id === 'template') setShowTemplates(true);
    else if (id === 'upload') uploadRef.current?.click();
    else if (id === 'analytics') navigate('/dashboard/ai-analytics');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleUpload(file);
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="max-w-6xl mx-auto px-5 py-6 animate-fade-up">
        <header className="mb-8">
          <h1 className="text-xl font-semibold text-ink tracking-tight">
            {firstName}&apos;s documents
          </h1>
          <p className="text-sm text-muted mt-1">
            Create, upload, and collaborate in real time.
          </p>
        </header>

        <input
          ref={uploadRef}
          type="file"
          accept={WORKSPACE_ACCEPT}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = '';
          }}
        />

        <div
          className={`drop-zone mb-6 p-6 ${dragOver ? 'drop-zone-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => uploadRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && uploadRef.current?.click()}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink">Upload a file</p>
              <p className="text-xs text-muted mt-0.5">
                Drag and drop PDF, Word, text, or image — or click to browse
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void handleCreate(); }}
              disabled={creating}
              className="btn-primary shrink-0"
            >
              <FilePlus size={16} />
              New document
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
          {QUICK_ACTIONS.map(({ id, label, desc, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => handleQuickAction(id)}
              disabled={creating && id !== 'analytics'}
              className="flex items-start gap-3 p-3.5 text-left card-interactive"
            >
              <div className="w-8 h-8 rounded-md bg-surface border border-line flex items-center justify-center shrink-0">
                <Icon size={16} className="text-muted" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{label}</p>
                <p className="text-xs text-muted mt-0.5 truncate">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-5 px-3 py-2.5 badge badge-danger w-full justify-start text-sm rounded-md">{error}</div>
        )}

        {recentDocs && recentDocs.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted mb-2">Recent</h2>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scroll-panel">
              {recentDocs.slice(0, 8).map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => navigate(`/document/${doc.id}`)}
                  className="shrink-0 px-3 py-1.5 bg-paper border border-line rounded-md text-sm hover:bg-surface transition-colors"
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-5">
          <div className="field-group flex-1 min-w-0">
            <Search size={16} className="field-icon" />
            <input
              type="search"
              placeholder="Search documents"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              aria-label="Search documents"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title')}
              className="input-field w-auto min-w-[130px]"
              aria-label="Sort by"
            >
              <option value="updatedAt">Last modified</option>
              <option value="createdAt">Date created</option>
              <option value="title">Title</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary px-3 min-w-[40px]"
              title="Toggle sort order"
              aria-label="Toggle sort order"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
            <button
              type="button"
              onClick={() => setFilterPinned(!filterPinned)}
              className={`btn-secondary px-3 ${filterPinned ? 'border-accent/40 bg-accent-soft text-accent' : ''}`}
              title="Pinned only"
              aria-label="Show pinned only"
            >
              <Pin size={15} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-52 skeleton" />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={handleDelete}
                onPin={handlePin}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 surface-card border-dashed">
            <div className="w-10 h-10 rounded-md bg-surface border border-line flex items-center justify-center mx-auto mb-4">
              <Plus size={20} className="text-muted" />
            </div>
            <p className="text-sm font-medium text-ink mb-1">No documents yet</p>
            <p className="text-sm text-muted mb-5 max-w-sm mx-auto">
              Upload a file, pick a template, or start with a blank document.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => void handleCreate()} className="btn-primary">
                <FilePlus size={16} />
                Blank document
              </button>
              <button type="button" onClick={() => uploadRef.current?.click()} className="btn-secondary">
                <Upload size={16} />
                Upload file
              </button>
            </div>
          </div>
        )}
      </main>

      <TemplatePicker
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={handleCreate}
        onUpload={handleUpload}
        loading={creating}
      />
    </div>
  );
}
