import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface SearchMatch {
  from: number;
  to: number;
}

export interface SearchStorage {
  term: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  matches: SearchMatch[];
  activeIndex: number;
}

export const searchPluginKey = new PluginKey('documentSearch');

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    documentSearch: {
      setSearchQuery: (options: {
        term: string;
        caseSensitive?: boolean;
        wholeWord?: boolean;
        useRegex?: boolean;
      }) => ReturnType;
      findNext: () => ReturnType;
      findPrevious: () => ReturnType;
      replaceSelection: (replacement: string) => ReturnType;
      replaceAll: (replacement: string) => ReturnType;
      clearSearch: () => ReturnType;
    };
  }
  interface Storage {
    documentSearch: SearchStorage;
  }
}

function buildRegex(
  term: string,
  caseSensitive: boolean,
  wholeWord: boolean,
  useRegex: boolean
): RegExp | null {
  if (!term) return null;
  try {
    const flags = caseSensitive ? 'g' : 'gi';
    const source = useRegex ? term : term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = wholeWord ? `\\b(?:${source})\\b` : source;
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

function findMatches(doc: import('@tiptap/pm/model').Node, regex: RegExp): SearchMatch[] {
  const matches: SearchMatch[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const text = node.text;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ from: pos + match.index, to: pos + match.index + match[0].length });
      if (match[0].length === 0) regex.lastIndex++;
    }
  });
  return matches;
}

export const DocumentSearch = Extension.create({
  name: 'documentSearch',

  addStorage(): SearchStorage {
    return {
      term: '',
      caseSensitive: false,
      wholeWord: false,
      useRegex: false,
      matches: [],
      activeIndex: -1,
    };
  },

  addCommands() {
    return {
      setSearchQuery:
        (options) =>
        ({ editor, dispatch }) => {
          const storage = editor.storage.documentSearch;
          storage.term = options.term;
          storage.caseSensitive = options.caseSensitive ?? false;
          storage.wholeWord = options.wholeWord ?? false;
          storage.useRegex = options.useRegex ?? false;

          const regex = buildRegex(
            storage.term,
            storage.caseSensitive,
            storage.wholeWord,
            storage.useRegex
          );
          storage.matches = regex ? findMatches(editor.state.doc, regex) : [];
          storage.activeIndex = storage.matches.length > 0 ? 0 : -1;

          if (storage.matches.length > 0) {
            const m = storage.matches[0];
            editor.commands.setTextSelection({ from: m.from, to: m.to });
          }

          if (dispatch) dispatch(editor.state.tr.setMeta(searchPluginKey, { refresh: true }));
          return true;
        },

      findNext:
        () =>
        ({ editor, dispatch }) => {
          const storage = editor.storage.documentSearch;
          if (storage.matches.length === 0) return false;
          storage.activeIndex = (storage.activeIndex + 1) % storage.matches.length;
          const m = storage.matches[storage.activeIndex];
          editor.commands.setTextSelection({ from: m.from, to: m.to });
          if (dispatch) dispatch(editor.state.tr.setMeta(searchPluginKey, { refresh: true }));
          return true;
        },

      findPrevious:
        () =>
        ({ editor, dispatch }) => {
          const storage = editor.storage.documentSearch;
          if (storage.matches.length === 0) return false;
          storage.activeIndex =
            (storage.activeIndex - 1 + storage.matches.length) % storage.matches.length;
          const m = storage.matches[storage.activeIndex];
          editor.commands.setTextSelection({ from: m.from, to: m.to });
          if (dispatch) dispatch(editor.state.tr.setMeta(searchPluginKey, { refresh: true }));
          return true;
        },

      replaceSelection:
        (replacement) =>
        ({ editor, chain }) => {
          const storage = editor.storage.documentSearch;
          if (storage.activeIndex < 0) return false;
          const m = storage.matches[storage.activeIndex];
          return chain()
            .focus()
            .insertContentAt({ from: m.from, to: m.to }, replacement)
            .command(({ editor: e }) =>
              e.commands.setSearchQuery({
                term: storage.term,
                caseSensitive: storage.caseSensitive,
                wholeWord: storage.wholeWord,
                useRegex: storage.useRegex,
              })
            )
            .run();
        },

      replaceAll:
        (replacement) =>
        ({ editor, tr, dispatch }) => {
          const storage = editor.storage.documentSearch;
          if (storage.matches.length === 0) return false;
          const sorted = [...storage.matches].sort((a, b) => b.from - a.from);
          sorted.forEach((m) => {
            tr.insertText(replacement, m.from, m.to);
          });
          if (dispatch) dispatch(tr.setMeta(searchPluginKey, { refresh: true }));
          editor.commands.setSearchQuery({
            term: storage.term,
            caseSensitive: storage.caseSensitive,
            wholeWord: storage.wholeWord,
            useRegex: storage.useRegex,
          });
          return true;
        },

      clearSearch:
        () =>
        ({ editor, dispatch }) => {
          const storage = editor.storage.documentSearch;
          storage.term = '';
          storage.matches = [];
          storage.activeIndex = -1;
          if (dispatch) dispatch(editor.state.tr.setMeta(searchPluginKey, { refresh: true }));
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    return [
      new Plugin({
        key: searchPluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply(tr, _oldSet) {
            const storage = extension.editor?.storage.documentSearch as SearchStorage | undefined;
            if (!storage?.matches?.length) return DecorationSet.empty;

            const decorations = storage.matches.map((m, i) =>
              Decoration.inline(m.from, m.to, {
                class: i === storage.activeIndex ? 'search-match-active' : 'search-match',
              })
            );
            return DecorationSet.create(tr.doc, decorations);
          },
        },
        props: {
          decorations(state) {
            return searchPluginKey.getState(state);
          },
        },
      }),
    ];
  },
});
