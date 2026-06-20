import TurndownService from 'turndown';
import type { Editor } from '@tiptap/react';

export type ExportFormat = 'txt' | 'markdown' | 'html' | 'pdf';

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDocument(editor: Editor, title: string, format: ExportFormat) {
  const safeName = (title || 'document').replace(/[^\w\s-]/g, '').trim() || 'document';
  const html = editor.getHTML();
  const text = editor.getText();

  switch (format) {
    case 'txt':
      downloadBlob(text, `${safeName}.txt`, 'text/plain');
      break;
    case 'html':
      downloadBlob(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title></head><body>${html}</body></html>`,
        `${safeName}.html`,
        'text/html'
      );
      break;
    case 'markdown': {
      const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
      downloadBlob(td.turndown(html), `${safeName}.md`, 'text/markdown');
      break;
    }
    case 'pdf': {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(
        `<!DOCTYPE html><html><head><title>${title}</title><style>
          body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 24px;line-height:1.6;color:#18181b}
          img{max-width:100%} table{border-collapse:collapse;width:100%} td,th{border:1px solid #ddd;padding:8px}
          pre{background:#1e1b4b;color:#f4f4f5;padding:16px;border-radius:8px;overflow-x:auto}
        </style></head><body>${html}</body></html>`
      );
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      break;
    }
  }
}

export function computeDocumentStats(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim()).length || (text.trim() ? 1 : 0);
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));
  const pageEstimate = Math.max(1, Math.ceil(words / 300));

  return { words, characters, charactersNoSpaces, paragraphs, sentences, readingTimeMin, pageEstimate };
}
