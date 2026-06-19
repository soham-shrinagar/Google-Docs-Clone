import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { ReactNodeViewProps } from '@tiptap/react';

function PdfEmbedView({ node }: ReactNodeViewProps) {
  const { src, title, height } = node.attrs as { src: string; title: string; height: number };

  return (
    <NodeViewWrapper className="pdf-embed-wrapper my-4">
      <div className="pdf-embed-header">
        <span>📄 {title || 'PDF Document'}</span>
        <a href={src} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
          Open in new tab
        </a>
      </div>
      <iframe
        src={src}
        title={title || 'PDF preview'}
        className="pdf-embed-frame"
        style={{ height: `${height || 720}px` }}
      />
    </NodeViewWrapper>
  );
}

export const PdfEmbed = Node.create({
  name: 'pdfEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: 'Document' },
      height: { default: 720 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-pdf-embed]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-pdf-embed': 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PdfEmbedView);
  },

  addCommands() {
    return {
      insertPdfEmbed:
        (attrs: { src: string; title?: string; height?: number }) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { title: 'Document', height: 720, ...attrs },
          }),
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pdfEmbed: {
      insertPdfEmbed: (attrs: { src: string; title?: string; height?: number }) => ReturnType;
    };
  }
}

export type TipTapContent = {
  type: 'doc';
  content: Record<string, unknown>[];
};

export function buildPdfContent(src: string, title: string, docTitle?: string): TipTapContent {
  return {
    type: 'doc',
    content: [
      ...(docTitle
        ? [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: docTitle }] }]
        : []),
      { type: 'pdfEmbed', attrs: { src, title, height: 720 } },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Add notes and annotations below the PDF...' }],
      },
    ],
  };
}

export function buildImageContent(src: string, alt: string, docTitle?: string): TipTapContent {
  return {
    type: 'doc',
    content: [
      ...(docTitle
        ? [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: docTitle }] }]
        : []),
      { type: 'image', attrs: { src, alt } },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Add notes around your image...' }],
      },
    ],
  };
}

export const DOC_INIT_KEY = (id: string) => `doc-init-content-${id}`;
