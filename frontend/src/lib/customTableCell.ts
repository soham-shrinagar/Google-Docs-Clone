import TableCell from '@tiptap/extension-table-cell';

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-bg-color'),
        renderHTML: (attrs) =>
          attrs.backgroundColor
            ? {
                'data-bg-color': attrs.backgroundColor,
                style: `background-color: ${attrs.backgroundColor}`,
              }
            : {},
      },
      textAlign: {
        default: null,
        parseHTML: (el) => el.style.textAlign || null,
        renderHTML: (attrs) =>
          attrs.textAlign ? { style: `text-align: ${attrs.textAlign}` } : {},
      },
    };
  },
});
