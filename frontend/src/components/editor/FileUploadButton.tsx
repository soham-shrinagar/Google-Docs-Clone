import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Upload, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api';
import { resolveUploadUrl } from '../../lib/uploads';
import { insertUploadedFileIntoEditor } from '../../lib/uploadProcessor';

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
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const isSimpleImage =
        file.type.startsWith('image/') &&
        !['pdf', 'docx', 'txt', 'md'].includes(ext);

      if (isSimpleImage) {
        const result = await api.uploadFile(file);
        const url = resolveUploadUrl(result.url);
        editor.chain().focus().setImage({ src: url, alt: result.originalName }).run();
        return;
      }

      await insertUploadedFileIntoEditor(file, (content) => {
        editor.chain().focus().insertContent(content).run();
      });
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
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt,text/markdown,.md"
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
        title="Upload PDF, Word, text, or image"
      >
        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
      </button>
    </>
  );
}
