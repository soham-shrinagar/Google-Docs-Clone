import { useState } from 'react';
import { X, Upload, Loader2, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TEMPLATE_CATEGORIES, type DocumentTemplate } from '../../lib/templates';
import clsx from 'clsx';

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  onUpload: (file: File) => void;
  loading?: boolean;
}

export function TemplatePicker({ open, onClose, onSelect, onUpload, loading }: TemplatePickerProps) {
  const [category, setCategory] = useState('All');
  const { data } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
    enabled: open,
  });

  const templates = data?.templates ?? [];
  const filtered =
    category === 'All' ? templates : templates.filter((t) => t.category === category);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = '';
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'var(--theme-overlay)' }}
        onClick={onClose}
      />
      <div className="relative bg-paper rounded-2xl border border-line shadow-2xl w-full max-w-3xl modal-shell animate-fade-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-line shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-ink">Create a document</h2>
            <p className="text-sm text-muted mt-0.5">Upload a file or pick a template</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted hover:text-ink hover:bg-canvas">
            <X size={20} />
          </button>
        </div>

        <label className="mx-6 mt-5 mb-0 flex items-center gap-4 py-5 px-5 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-accent/40 hover:bg-accent-soft/30 transition-colors shrink-0">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
          <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center shrink-0">
            {loading ? (
              <Loader2 className="animate-spin text-accent" size={22} />
            ) : (
              <Upload className="text-accent" size={22} />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-ink">Upload from computer</p>
            <p className="text-sm text-muted">PDF or image — up to 15 MB</p>
          </div>
        </label>

        <div className="px-6 py-4 border-b border-line shrink-0">
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
                  category === cat
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-canvas text-muted hover:text-ink'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scroll-panel px-6 py-5">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 pr-1">
            {filtered.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => onSelect(template.id)}
                disabled={loading}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onClick,
  disabled,
}: {
  template: DocumentTemplate;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group text-left bg-paper border border-line rounded-xl overflow-hidden card-hover disabled:opacity-50 w-full"
    >
      <div className="h-28 bg-canvas p-3 relative">
        <div className="h-full bg-paper rounded-lg border border-line/60 p-2.5 shadow-sm">
          <div className="h-1 w-6 bg-accent rounded-full mb-2" />
          <div className="h-1.5 w-full preview-line rounded-full mb-1" />
          <div className="h-1.5 w-4/5 preview-line rounded-full mb-1" />
          <div className="h-1.5 w-3/5 preview-line rounded-full" />
        </div>
        {template.id === 'blank' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <FileText size={28} className="text-muted/40" />
          </div>
        )}
      </div>
      <div className="p-3 border-t border-line/60">
        <p className="font-medium text-sm text-ink group-hover:text-accent transition-colors truncate">
          {template.name}
        </p>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
}
