import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { api } from '../api';
import { resolveUploadUrl } from '../uploads';
import {
  createBlankPage,
  createElement,
  DEFAULT_TEXT_STYLE,
  PAGE_PRESETS,
  type WorkspaceElementData,
  type WorkspacePageData,
  type WorkspaceSeed,
} from './types';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export const WORKSPACE_ACCEPT =
  'image/jpeg,image/png,image/webp,application/pdf,.pdf,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,' +
  'text/plain,.txt,text/markdown,.md';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export function validateWorkspaceFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) return 'File must be under 15 MB';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const allowed = new Set(['pdf', 'png', 'jpg', 'jpeg', 'webp', 'txt', 'md', 'docx']);
  if (!allowed.has(ext) && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return 'Unsupported file type';
  }
  return null;
}

async function canvasToUpload(canvas: HTMLCanvasElement, name: string): Promise<string> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  );
  if (!blob) throw new Error('Failed to render page');
  const file = new File([blob], name, { type: 'image/jpeg' });
  const result = await api.uploadFile(file);
  return resolveUploadUrl(result.url);
}

async function renderPdfPages(file: File): Promise<{
  pages: WorkspacePageData[];
  sourceAsset: WorkspaceSeed['sourceAsset'];
}> {
  const upload = await api.uploadFile(file);
  const sourceUrl = resolveUploadUrl(upload.url);
  const sourceAsset = {
    filename: upload.filename,
    originalName: upload.originalName,
    mimeType: upload.mimeType,
    size: upload.size,
    url: sourceUrl,
  };

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const pages: WorkspacePageData[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const bgUrl = await canvasToUpload(canvas, `page-${pageNum}.jpg`);

    pages.push({
      id: crypto.randomUUID(),
      width: viewport.width / 2,
      height: viewport.height / 2,
      backgroundType: 'pdf_page',
      backgroundUrl: bgUrl,
      backgroundMeta: { pdfPage: pageNum, sourceUrl, immutable: true },
      label: `Page ${pageNum}`,
    });
  }

  return { pages, sourceAsset };
}

async function imageToWorkspace(file: File): Promise<WorkspaceSeed> {
  const upload = await api.uploadFile(file);
  const url = resolveUploadUrl(upload.url);
  const pageId = crypto.randomUUID();

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

export async function buildWorkspaceSeedFromFile(file: File): Promise<WorkspaceSeed> {
  const err = validateWorkspaceFile(file);
  if (err) throw new Error(err);

  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = file.type;
  const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded Document';

  if (mime === 'application/pdf' || ext === 'pdf') {
    const { pages, sourceAsset } = await renderPdfPages(file);
    return { workspace: true, pages, elements: [], sourceAsset };
  }

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return imageToWorkspace(file);
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const blocks = result.value.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
    return textToWorkspace(file, blocks.length ? blocks : ['Imported document — start editing.']);
  }

  if (mime.startsWith('text/') || ext === 'txt' || ext === 'md') {
    const text = await file.text();
    const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
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
