import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { api } from './api';
import { resolveUploadUrl } from './uploads';
import type { TipTapContent } from '../components/editor/PdfEmbed';
import { buildPdfContent, buildImageContent } from '../components/editor/PdfEmbed';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const ACCEPT_UPLOAD =
  'image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,.pdf,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,' +
  'text/plain,.txt,text/markdown,.md';

export { ACCEPT_UPLOAD };

function heading(text: string, level = 1) {
  return { type: 'heading', attrs: { level }, content: [{ type: 'text', text }] };
}

function paragraph(text: string) {
  return { type: 'paragraph', content: text ? [{ type: 'text', text }] : [] };
}

function pageBreak() {
  return { type: 'horizontalRule' };
}

function noteBlock(label: string) {
  return {
    type: 'blockquote',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: label, marks: [{ type: 'italic' }] }],
      },
      paragraph(''),
    ],
  };
}

async function canvasToUpload(canvas: HTMLCanvasElement, name: string): Promise<string> {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  );
  if (!blob) throw new Error('Failed to render PDF page');

  const file = new File([blob], name, { type: 'image/jpeg' });
  const result = await api.uploadFile(file);
  return resolveUploadUrl(result.url);
}

async function buildPdfPageContent(file: File, title: string): Promise<TipTapContent> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const content: Record<string, unknown>[] = [heading(title)];

  content.push(
    paragraph(
      'Each page is shown below. Add notes under any page, insert new sections between pages, or continue writing at the end.'
    )
  );
  content.push(pageBreak());

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const imageUrl = await canvasToUpload(canvas, `${title}-page-${pageNum}.jpg`);

    content.push(heading(`Page ${pageNum}`, 2));
    content.push({ type: 'image', attrs: { src: imageUrl, alt: `${title} page ${pageNum}` } });
    content.push(noteBlock(`Notes for page ${pageNum} — type here`));
    if (pageNum < pdf.numPages) content.push(pageBreak());
  }

  content.push(pageBreak());
  content.push(heading('Additional pages', 2));
  content.push(paragraph('Add new content, summaries, or extra pages below.'));

  return { type: 'doc', content };
}

async function buildDocxContent(file: File, title: string): Promise<TipTapContent> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const blocks = result.value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const content: Record<string, unknown>[] = [heading(title)];

  if (blocks.length === 0) {
    content.push(paragraph('Imported document — start editing below.'));
  } else {
    content.push(...blocks.map((block) => paragraph(block)));
  }

  content.push(pageBreak());
  content.push(heading('Continue editing', 2));
  content.push(paragraph('Add new sections, pages, or notes below your imported content.'));

  return { type: 'doc', content };
}

async function buildTextContent(file: File, title: string): Promise<TipTapContent> {
  const text = await file.text();
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  const content: Record<string, unknown>[] = [heading(title)];
  if (blocks.length === 0) {
    content.push(paragraph(text.trim() || 'Empty file — start writing.'));
  } else {
    content.push(...blocks.map((block) => paragraph(block)));
  }

  content.push(pageBreak());
  content.push(paragraph('Continue editing below…'));

  return { type: 'doc', content };
}

export async function buildUploadInitialContent(file: File): Promise<TipTapContent> {
  const title = file.name.replace(/\.[^.]+$/, '') || 'Uploaded Document';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mime = file.type;

  if (mime === 'application/pdf' || ext === 'pdf') {
    try {
      return await buildPdfPageContent(file, title);
    } catch {
      const result = await api.uploadFile(file);
      const url = resolveUploadUrl(result.url);
      return buildPdfContent(url, file.name, title);
    }
  }

  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return buildDocxContent(file, title);
  }

  if (mime.startsWith('text/') || ext === 'txt' || ext === 'md') {
    return buildTextContent(file, title);
  }

  const result = await api.uploadFile(file);
  const url = resolveUploadUrl(result.url);

  if (result.type === 'image') {
    return buildImageContent(url, result.originalName, title);
  }

  return buildPdfContent(url, result.originalName, title);
}

export async function insertUploadedFileIntoEditor(
  file: File,
  insertContent: (content: Record<string, unknown>[]) => void
) {
  const seed = await buildUploadInitialContent(file);
  insertContent(seed.content);
}
