import { Extension, textblockTypeInputRule } from '@tiptap/core';

/** Extra markdown-style input rules beyond StarterKit defaults. */
export const MarkdownShortcuts = Extension.create({
  name: 'markdownShortcuts',

  addInputRules() {
    return [
      textblockTypeInputRule({
        find: /^####\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 4 }),
      }),
      textblockTypeInputRule({
        find: /^#####\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 5 }),
      }),
      textblockTypeInputRule({
        find: /^######\s$/,
        type: this.editor.schema.nodes.heading,
        getAttributes: () => ({ level: 6 }),
      }),
    ];
  },
});
