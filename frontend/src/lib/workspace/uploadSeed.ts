import mammoth from 'mammoth';
import { api } from '../api';
import { resolveUploadUrl } from '../uploads';
import { buildPdfPagesFromUpload } from './pdfPageRender';
import {
  createBlankPage,
  createElement,
  DEFAULT_TEXT_STYLE,
  PAGE_PRESETS,
  type WorkspaceElementData,
  type WorkspacePageData,
  type WorkspaceSeed,
} from './types';

export const WORKSPACE_ACCEPT =
  'image/jpeg,image/png,image/webp,application/pdf,.pdf,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,' +
  'text/plain,.txt,text/markdown,.md';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export type UploadProgressCallback = (info: {
  phase: 'uploading' | 'processing' | 'creating';
  progress: number;
  message: string;
}) => void;

export function validateWorkspaceFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'File must be under 15 MB';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const allowed = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'md', 'docx']);
  if (!allowed.has(ext) && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return 'Unsupported file type';
  }
  return null;
}

async function imageToWorkspace(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<WorkspaceSeed> {
  onProgress?.({ phase: 'uploading', progress: 30, message: 'Uploading image…' });
  const upload = await api.uploadFile(file);
  const url = resolveUploadUrl(upload.url);
  const pageId = crypto.randomUUID();
  onProgress?.({ phase: 'processing', progress: 100, message: 'Ready' });

  return {
    workspace: true,
    pages: [{
      id: pageId,
      width: PAGE_PRESETS.A4.width,
      height: PAGE_PRESETS.A4.height,
      backgroundType: 'image',
      backgroundUrl: url,
      backgroundMeta: { immutable: true },
      label: file.name.replace(/\.[^.]+$/, ''),
    }],
    elements: [],
    sourceAsset: {
      filename: upload.filename,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      url,
    },
  };
}

async function textToWorkspace(file: File, blocks: string[]): Promise<WorkspaceSeed> {
  const pageId = crypto.randomUUID();
  const elements: WorkspaceElementData[] = [];
  let y = 72;

  blocks.forEach((block, i) => {
    elements.push(
      createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'text',
        layer: 'text',
        zIndex: i + 1,
        transform: { x: 72, y, width: PAGE_PRESETS.A4.width - 144, height: 32, rotation: 0 },
        style: { ...DEFAULT_TEXT_STYLE, fontSize: 16 },
        data: { text: block },
        name: `Paragraph ${i + 1}`,
      })
    );
    y += 48;
  });

  return {
    workspace: true,
    pages: [createBlankPage(pageId, PAGE_PRESETS.A4, file.name.replace(/\.[^.]+$/, ''))],
    elements,
  };
}

export async function buildWorkspaceSeedFromFile(
  file: File,
  onProgress?: UploadProgressCallback
): Promise<WorkspaceSeed> {
  const err = validateWorkspaceFile(file);
  if (err) throw new Error(err);

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = file.type;
  const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded Document';

  if (mime === 'application/pdf' || ext === 'pdf') {
    const { pages, sourceAsset } = await buildPdfPagesFromUpload(file, (done, total, label) => {
      onProgress?.({
        phase: done < total ? 'uploading' : 'processing',
        progress: Math.round((done / total) * 100),
        message: label,
      });
    });
    return { workspace: true, pages, elements: [], sourceAsset };
  }

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return imageToWorkspace(file, onProgress);
  }

  onProgress?.({ phase: 'processing', progress: 20, message: 'Reading file…' });

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const blocks = result.value.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    onProgress?.({ phase: 'processing', progress: 100, message: 'Ready' });
    return textToWorkspace(file, blocks.length ? blocks : ['Imported document — start editing.']);
  }

  if (mime.startsWith('text/') || ext === 'txt' || ext === 'md') {
    const text = await file.text();
    const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    onProgress?.({ phase: 'processing', progress: 100, message: 'Ready' });
    return textToWorkspace(file, blocks.length ? blocks : [text.trim() || title]);
  }

  throw new Error('Unsupported file type');
}

export function isWorkspaceFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return ['pdf', 'png', 'jpg', 'jpeg', 'webp'].includes(ext) ||
    file.type === 'application/pdf' ||
    file.type.startsWith('image/');
}
