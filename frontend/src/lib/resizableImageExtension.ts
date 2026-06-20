import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export const ResizableImage = Image.extend({
  name: 'image',

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute('width') || el.style.width?.replace('px', '') || null,
        renderHTML: (attrs) => (attrs.width ? { width: attrs.width, style: `width: ${attrs.width}px` } : {}),
      },
      caption: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-caption'),
        renderHTML: (attrs) => (attrs.caption ? { 'data-caption': attrs.caption } : {}),
      },
      align: {
        default: 'center',
        parseHTML: (el) => el.getAttribute('data-align') || 'center',
        renderHTML: (attrs) => ({ 'data-align': attrs.align }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { loading: 'lazy' })];
  },
});
