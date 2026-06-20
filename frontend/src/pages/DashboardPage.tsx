import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pin, LayoutTemplate, Upload, FilePlus, Sparkles, Users, FileText, BarChart3 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Navbar } from '../components/layout/Navbar';
import { DocumentCard } from '../components/dashboard/DocumentCard';
import { TemplatePicker } from '../components/dashboard/TemplatePicker';
import { useDocuments, useRecentDocuments, useCreateDocument, useDeleteDocument } from '../hooks/useApi';
import { useDashboardStore, useAuthStore } from '../store';
import { api } from '../lib/api';
import { ACCEPT_UPLOAD, buildUploadInitialContent } from '../lib/uploadProcessor';

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
  const totalCollaborators = documents?.reduce((sum, d) => sum + d.collaboratorCount, 0) ?? 0;
  const pinnedCount = documents?.filter((d) => d.isPinned).length ?? 0;

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 animate-fade-up">
        <header className="relative mb-10 overflow-hidden rounded-3xl hero-banner text-paper p-8 sm:p-10">
          <div className="absolute inset-0 bg-dot-grid opacity-[0.06] pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute right-1/4 bottom-0 w-40 h-40 rounded-full bg-accent/25 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 badge bg-white/10 text-paper border border-white/10 text-xs font-semibold mb-4 px-3 py-1">
              <Sparkles size={14} className="text-accent-muted" />
              Your workspace
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Hi, {firstName} 👋
            </h1>
            <p className="text-paper/75 mt-3 max-w-lg text-lg">
              Create, upload, and collaborate on documents in real time.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <button type="button" onClick={() => handleCreate()} disabled={creating} className="inline-flex items-center gap-2 bg-white text-ink font-semibold rounded-xl px-5 py-2.5 text-sm shadow-lg hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50">
                <FilePlus size={18} />
                New document
              </button>
              <button type="button" onClick={() => uploadRef.current?.click()} disabled={creating} className="inline-flex items-center gap-2 font-medium rounded-xl px-5 py-2.5 text-sm text-paper border border-white/20 bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all disabled:opacity-50">
                <Upload size={18} />
                Upload from computer
              </button>
            </div>
          </div>
        </header>

        <input
          ref={uploadRef}
          type="file"
          accept={ACCEPT_UPLOAD}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Documents', value: documents?.length ?? 0, icon: FileText },
            { label: 'Collaborators', value: totalCollaborators, icon: Users },
            { label: 'Pinned', value: pinnedCount, icon: Pin },
            { label: 'Recent', value: recentDocs?.length ?? 0, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-paper rounded-2xl p-4 card-interactive">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">{label}</p>
                <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center">
                  <Icon size={15} className="text-accent" />
                </div>
              </div>
              <p className="text-3xl font-bold text-ink mt-3 tabular-nums">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
          <button
            type="button"
            onClick={() => handleCreate()}
            disabled={creating}
            className="flex items-center gap-4 p-5 bg-paper rounded-2xl text-left card-interactive group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FilePlus size={20} className="text-white" />
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
            className="flex items-center gap-4 p-5 bg-paper rounded-2xl text-left card-interactive group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <LayoutTemplate size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-ink">From template</p>
              <p className="text-xs text-muted mt-0.5">Resume, report, notes…</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => uploadRef.current?.click()}
            disabled={creating}
            className="flex items-center gap-4 p-5 bg-paper rounded-2xl text-left card-interactive group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Upload size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-ink">Upload file</p>
              <p className="text-xs text-muted mt-0.5">PDF, Word, text, or image</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/ai-analytics')}
            className="flex items-center gap-4 p-5 bg-paper rounded-2xl text-left card-interactive group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <p className="font-medium text-ink">AI analytics</p>
              <p className="text-xs text-muted mt-0.5">Usage, rewrites & dictation</p>
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
              <div key={i} className="bg-paper rounded-2xl h-64 skeleton" />
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
          <div className="text-center py-20 bg-paper rounded-2xl border border-dashed border-line">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-violet-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <Plus size={28} className="text-white" />
            </div>
            <p className="text-ink font-medium mb-1">No documents yet</p>
            <p className="text-sm text-muted mb-6">Upload a PDF or Word file, pick a template, or start blank</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button type="button" onClick={() => handleCreate()} className="btn-primary">
                <FilePlus size={18} />
                Blank document
              </button>
              <button type="button" onClick={() => uploadRef.current?.click()} className="btn-secondary">
                <Upload size={18} />
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
