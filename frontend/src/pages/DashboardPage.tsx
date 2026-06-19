import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pin, LayoutTemplate, Upload, FilePlus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { DocumentCard } from '../components/dashboard/DocumentCard';
import { TemplatePicker } from '../components/dashboard/TemplatePicker';
import { useDocuments, useRecentDocuments, useCreateDocument, useDeleteDocument } from '../hooks/useApi';
import { useDashboardStore, useAuthStore } from '../store';
import { api } from '../lib/api';
import { buildUploadInitialContent } from '../components/editor/FileUploadButton';

export function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { search, sortBy, sortOrder, filterPinned, setSearch, setSortBy, setSortOrder, setFilterPinned } =
    useDashboardStore();
  const { data: documents, isLoading } = useDocuments();
  const { data: recentDocs } = useRecentDocuments();
  const createDoc = useCreateDocument();
  const deleteDoc = useDeleteDocument();
  const [creating, setCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
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
      const seedContent = await buildUploadInitialContent(file);
      const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded Document';
      const { document } = await createDoc.mutateAsync({ title, seedContent });
      setShowTemplates(false);
      navigate(`/document/${document.id}`);
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

  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 animate-fade-up">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            Hi, {firstName}
          </h1>
          <p className="text-muted mt-1.5">
            {documents?.length
              ? `${documents.length} document${documents.length === 1 ? '' : 's'} in your workspace`
              : 'Start something new today'}
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <button
            type="button"
            onClick={() => handleCreate()}
            disabled={creating}
            className="flex items-center gap-4 p-4 bg-paper rounded-2xl border border-line text-left card-hover group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
              <FilePlus size={20} className="text-accent group-hover:text-white" />
            </div>
            <div>
              <p className="font-medium text-ink">Blank document</p>
              <p className="text-xs text-muted mt-0.5">Start from scratch</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            disabled={creating}
            className="flex items-center gap-4 p-4 bg-paper rounded-2xl border border-line text-left card-hover group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
              <LayoutTemplate size={20} className="text-accent group-hover:text-white" />
            </div>
            <div>
              <p className="font-medium text-ink">From template</p>
              <p className="text-xs text-muted mt-0.5">Resume, report, notes…</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            disabled={creating}
            className="flex items-center gap-4 p-4 bg-paper rounded-2xl border border-line text-left card-hover group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent-soft flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
              <Upload size={20} className="text-accent group-hover:text-white" />
            </div>
            <div>
              <p className="font-medium text-ink">Upload file</p>
              <p className="text-xs text-muted mt-0.5">PDF or image</p>
            </div>
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-paper border border-line rounded-xl text-sm text-ink">{error}</div>
        )}

        {recentDocs && recentDocs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Recent</h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentDocs.slice(0, 6).map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => navigate(`/document/${doc.id}`)}
                  className="shrink-0 px-4 py-2 bg-paper border border-line rounded-full text-sm font-medium hover:border-accent/40 hover:shadow-sm transition-all"
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          <div className="field-group flex-1 min-w-0">
            <Search size={18} className="field-icon" />
            <input
              type="text"
              placeholder="Search documents…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title')}
              className="input-field w-auto min-w-[130px]"
            >
              <option value="updatedAt">Last modified</option>
              <option value="createdAt">Date created</option>
              <option value="title">Title</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary px-3"
              title="Toggle sort order"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
            <button
              type="button"
              onClick={() => setFilterPinned(!filterPinned)}
              className={`btn-secondary px-3 ${filterPinned ? '!border-accent/50 !bg-accent-soft !text-accent' : ''}`}
              title="Pinned only"
            >
              <Pin size={16} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-paper rounded-2xl border border-line h-64 animate-pulse" />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="text-center py-20 bg-paper rounded-2xl border border-line border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-accent" />
            </div>
            <p className="text-ink font-medium mb-1">No documents yet</p>
            <p className="text-sm text-muted mb-6">Pick a template or create a blank doc to get started</p>
            <button type="button" onClick={() => setShowTemplates(true)} className="btn-primary">
              <LayoutTemplate size={18} />
              Browse templates
            </button>
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
