import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Upload, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { buildPdfContent, buildImageContent } from './PdfEmbed';
import clsx from 'clsx';

const API_BASE = import.meta.env.VITE_API_URL || '';

export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

interface FileUploadButtonProps {
  editor: Editor | null;
  className?: string;
}

export function FileUploadButton({ editor, className }: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!editor) return;
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      const url = resolveUploadUrl(result.url);

      if (result.type === 'image') {
        editor.chain().focus().setImage({ src: url, alt: result.originalName }).run();
      } else {
        editor
          .chain()
          .focus()
          .insertPdfEmbed({ src: url, title: result.originalName, height: 720 })
          .run();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={clsx(
          'p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100',
          uploading && 'opacity-50',
          className
        )}
        title="Upload image or PDF"
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
      </button>
    </>
  );
}

export async function buildUploadInitialContent(file: File) {
  const result = await api.uploadFile(file);
  const url = resolveUploadUrl(result.url);
  const title = file.name.replace(/\.[^.]+$/, '');

  if (result.type === 'image') {
    return buildImageContent(url, result.originalName, title);
  }
  return buildPdfContent(url, result.originalName, title);
}
