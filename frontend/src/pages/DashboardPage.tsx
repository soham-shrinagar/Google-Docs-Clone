import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pin, ArrowUpDown, LayoutTemplate } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { DocumentCard } from '../components/dashboard/DocumentCard';
import { TemplatePicker } from '../components/dashboard/TemplatePicker';
import { useDocuments, useRecentDocuments, useCreateDocument, useDeleteDocument } from '../hooks/useApi';
import { useDashboardStore } from '../store';
import { api } from '../lib/api';
import { buildUploadInitialContent } from '../components/editor/FileUploadButton';

export function DashboardPage() {
  const navigate = useNavigate();
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
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100/80">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Documents</h1>
            <p className="text-gray-500 mt-1">Create from templates, upload files, and collaborate in real time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              disabled={creating}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:shadow-md hover:border-brand-200 transition-all disabled:opacity-50"
            >
              <LayoutTemplate size={20} />
              Templates
            </button>
            <button
              onClick={() => handleCreate()}
              disabled={creating}
              className="flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-brand-700 shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <Plus size={20} />
              {creating ? 'Creating…' : 'Blank Doc'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>
        )}

        {recentDocs && recentDocs.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recently Opened</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentDocs.slice(0, 5).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => navigate(`/document/${doc.id}`)}
                  className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-2.5 hover:border-brand-300 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-medium truncate max-w-[150px]">{doc.title}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updatedAt' | 'createdAt' | 'title')}
            className="px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm shadow-sm"
          >
            <option value="updatedAt">Last Modified</option>
            <option value="createdAt">Created</option>
            <option value="title">Title</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 shadow-sm"
          >
            <ArrowUpDown size={18} />
          </button>

          <button
            onClick={() => setFilterPinned(!filterPinned)}
            className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-xl text-sm shadow-sm ${
              filterPinned ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-white border-gray-200'
            }`}
          >
            <Pin size={16} /> Pinned
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <LayoutTemplate size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No documents yet. Pick a template or upload a file to get started.</p>
            <button
              onClick={() => setShowTemplates(true)}
              className="text-brand-600 font-medium hover:text-brand-700"
            >
              Browse Templates
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
