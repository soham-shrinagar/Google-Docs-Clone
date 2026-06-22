import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const pdfDocCache = new Map<string, Promise<pdfjsLib.PDFDocumentProxy>>();
const pageImageCache = new Map<string, Promise<HTMLCanvasElement>>();

function cacheKey(sourceUrl: string, pageNum: number, scale: number) {
  return `${sourceUrl}|${pageNum}|${scale}`;
}

async function loadPdf(sourceUrl: string): Promise<pdfjsLib.PDFDocumentProxy> {
  if (!pdfDocCache.has(sourceUrl)) {
    pdfDocCache.set(
      sourceUrl,
      pdfjsLib.getDocument({ url: sourceUrl }).promise.catch((err) => {
        pdfDocCache.delete(sourceUrl);
        throw err;
      })
    );
  }
  return pdfDocCache.get(sourceUrl)!;
}

export async function renderPdfPageToCanvas(
  sourceUrl: string,
  pageNum: number,
  displayWidth: number,
  displayHeight: number
): Promise<HTMLCanvasElement> {
  const scale = 1.5;
  const key = cacheKey(sourceUrl, pageNum, scale);
  if (pageImageCache.has(key)) return pageImageCache.get(key)!;

  const task = (async () => {
    const pdf = await loadPdf(sourceUrl);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    return canvas;
  })();

  pageImageCache.set(key, task);
  return task;
}

export function getPdfPageDimensions(
  sourceUrl: string,
  pageNum: number
): Promise<{ width: number; height: number }> {
  return loadPdf(sourceUrl).then(async (pdf) => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    return { width: viewport.width, height: viewport.height };
  });
}

export type PdfUploadProgress = (done: number, total: number, label: string) => void;

export async function buildPdfPagesFromUpload(
  file: File,
  onProgress?: PdfUploadProgress
): Promise<{
  pages: import('./types').WorkspacePageData[];
  sourceAsset: NonNullable<import('./types').WorkspaceSeed['sourceAsset']>;
}> {
  onProgress?.(0, 3, 'Uploading PDF…');
  const { api } = await import('../api');
  const { resolveUploadUrl } = await import('../uploads');
  const upload = await api.uploadFile(file);
  const sourceUrl = resolveUploadUrl(upload.url);

  onProgress?.(1, 3, 'Reading pages…');
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  onProgress?.(2, 3, `Preparing ${pdf.numPages} page${pdf.numPages === 1 ? '' : 's'}…`);

  const pages: import('./types').WorkspacePageData[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    pages.push({
      id: crypto.randomUUID(),
      width: viewport.width,
      height: viewport.height,
      backgroundType: 'pdf_page',
      backgroundUrl: null,
      backgroundMeta: {
        pdfPage: pageNum,
        sourceUrl,
        immutable: true,
        renderMode: 'client',
      },
      label: `Page ${pageNum}`,
    });
  }

  onProgress?.(3, 3, 'Done');

  return {
    pages,
    sourceAsset: {
      filename: upload.filename,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      url: sourceUrl,
    },
  };
}
