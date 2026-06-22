import type { WorkspaceElementData, WorkspacePageData } from './types';

export async function exportPageAsPng(
  page: WorkspacePageData,
  elements: WorkspaceElementData[],
  scale = 2
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = page.width * scale;
  canvas.height = page.height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (page.backgroundUrl) {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = reject;
      img.src = page.backgroundUrl!;
    });
  }

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  for (const el of sorted) {
    if (!el.visible) continue;
    const { transform: t, style, type, data } = el;
    const x = t.x * scale;
    const y = t.y * scale;
    const w = t.width * scale;
    const h = t.height * scale;

    if (type === 'text' || type === 'sticky') {
      if (type === 'sticky') {
        ctx.fillStyle = style.background ?? '#fef08a';
        ctx.fillRect(x, y, w, h);
      }
      ctx.fillStyle = style.color ?? '#1a1a2e';
      ctx.font = `${style.fontWeight ?? '400'} ${(style.fontSize ?? 18) * scale}px ${style.fontFamily ?? 'sans-serif'}`;
      ctx.fillText((data.text as string) ?? '', x + 8 * scale, y + 24 * scale, w - 16 * scale);
    } else if (type === 'rect' || type === 'highlight') {
      ctx.fillStyle = style.fill ?? '#3b82f633';
      ctx.strokeStyle = style.stroke ?? '#3b82f6';
      ctx.lineWidth = (style.strokeWidth ?? 2) * scale;
      ctx.fillRect(x, y, w, h);
      if (type === 'rect') ctx.strokeRect(x, y, w, h);
    } else if (type === 'image' && data.src) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { ctx.drawImage(img, x, y, w, h); resolve(); };
        img.onerror = () => resolve();
        img.src = data.src as string;
      });
    } else if (type === 'pen' || type === 'line') {
      const pts = (data.points as number[]) ?? [];
      if (pts.length < 4) continue;
      ctx.beginPath();
      ctx.strokeStyle = style.stroke ?? '#1a1a2e';
      ctx.lineWidth = (style.strokeWidth ?? 2) * scale;
      ctx.moveTo(x + pts[0] * scale, y + pts[1] * scale);
      for (let i = 2; i < pts.length; i += 2) {
        ctx.lineTo(x + pts[i] * scale, y + pts[i + 1] * scale);
      }
      ctx.stroke();
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))), 'image/png');
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportWorkspaceAsPngZip(
  pages: WorkspacePageData[],
  elements: WorkspaceElementData[],
  title: string
) {
  for (let i = 0; i < pages.length; i++) {
    const pageEls = elements.filter((e) => e.pageId === pages[i].id);
    const blob = await exportPageAsPng(pages[i], pageEls);
    downloadBlob(blob, `${title}-page-${i + 1}.png`);
  }
}

export async function exportWorkspaceAsPdf(
  pages: WorkspacePageData[],
  elements: WorkspaceElementData[],
  title: string
) {
  const blobs: Blob[] = [];
  for (const page of pages) {
    const pageEls = elements.filter((e) => e.pageId === page.id);
    blobs.push(await exportPageAsPng(page, pageEls));
  }

  const printWin = window.open('', '_blank');
  if (!printWin) throw new Error('Pop-up blocked — allow pop-ups to export PDF');

  const images = await Promise.all(
    blobs.map((b) => new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.readAsDataURL(b);
    }))
  );

  printWin.document.write(`
    <!DOCTYPE html><html><head><title>${title}</title>
    <style>
      @page { margin: 0; }
      body { margin: 0; }
      img { display: block; width: 100%; page-break-after: always; }
      img:last-child { page-break-after: auto; }
    </style></head><body>
    ${images.map((src) => `<img src="${src}" />`).join('')}
    </body></html>
  `);
  printWin.document.close();
  printWin.onload = () => printWin.print();
}
