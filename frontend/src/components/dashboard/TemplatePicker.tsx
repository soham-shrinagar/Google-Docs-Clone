import { useState } from 'react';
import { X, LayoutTemplate, FileText, Upload, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="text-brand-600" size={22} />
            <h2 className="text-xl font-bold">Create a Document</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <label className="flex items-center justify-center gap-3 w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-brand-400 hover:bg-brand-50/50 cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            {loading ? (
              <Loader2 className="animate-spin text-brand-600" size={24} />
            ) : (
              <Upload className="text-brand-600" size={24} />
            )}
            <div className="text-left">
              <p className="font-semibold text-gray-900">Upload from computer</p>
              <p className="text-sm text-gray-500">Images (JPG, PNG, GIF, WebP) or PDF — up to 15 MB</p>
            </div>
          </label>
        </div>

        <div className="px-6 py-3 flex gap-2 overflow-x-auto border-b border-gray-100">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                category === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm font-medium text-gray-500 mb-4">Or start from a template</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
      onClick={onClick}
      disabled={disabled}
      className="group text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-brand-300 transition-all disabled:opacity-50"
    >
      <div
        className="h-28 p-3 flex items-center justify-center"
        style={{ background: template.thumbnail }}
      >
        <FileText size={32} className="text-gray-400 group-hover:text-brand-600 transition-colors" />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-900 group-hover:text-brand-600">{template.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
      </div>
    </button>
  );
}
