import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Editor } from '@tiptap/react';
import type { GrammarIssue, SpellIssue } from './aiTypes';

export const spellCheckPluginKey = new PluginKey('spellCheck');

export interface StoredIssue extends SpellIssue {
  id: string;
  explanation?: string;
  replacement?: string;
}

export interface SpellCheckState {
  decorations: DecorationSet;
  issues: StoredIssue[];
}

export interface SpellCheckOptions {
  documentId: string;
  checkSpell: (text: string) => Promise<SpellIssue[]>;
  checkGrammar?: (text: string) => Promise<GrammarIssue[]>;
  debounceMs?: number;
  grammarDebounceMs?: number;
}

function issueClass(type: SpellIssue['type']) {
  if (type === 'spelling' || type === 'repeated') return 'spell-error-spelling';
  if (type === 'grammar') return 'spell-error-grammar';
  return 'spell-error-style';
}

function findPhrase(text: string, phrase: string, after = 0): number {
  const idx = text.indexOf(phrase, after);
  return idx >= 0 ? idx : -1;
}

function grammarToIssues(text: string, grammar: GrammarIssue[], ignored: Set<string>): StoredIssue[] {
  const issues: StoredIssue[] = [];
  let searchFrom = 0;

  for (const g of grammar) {
    if (!g.original?.trim()) continue;
    const key = `${g.original}:${g.suggestion}`;
    if (ignored.has(key)) continue;

    const idx = findPhrase(text, g.original, searchFrom);
    if (idx < 0) continue;
    searchFrom = idx + g.original.length;

    const type = g.type === 'punctuation' || g.type === 'style' ? 'style' : 'grammar';
    issues.push({
      id: key,
      word: g.original,
      from: idx,
      to: idx + g.original.length,
      type,
      suggestions: [g.suggestion],
      message: g.explanation || g.suggestion,
      explanation: g.explanation,
      replacement: g.suggestion,
    });
  }
  return issues;
}

function buildDecorations(doc: Parameters<typeof DecorationSet.create>[0], issues: StoredIssue[]) {
  const decos: Decoration[] = [];
  for (const issue of issues) {
    if (issue.from >= issue.to) continue;
    const from = Math.min(issue.from + 1, doc.content.size);
    const to = Math.min(issue.to + 1, doc.content.size);
    if (from >= to) continue;
    decos.push(
      Decoration.inline(from, to, {
        class: issueClass(issue.type),
        'data-spell-id': issue.id,
        title: issue.message || issue.suggestions[0] || '',
      })
    );
  }
  return DecorationSet.create(doc, decos);
}

export const SpellCheckExtension = Extension.create<SpellCheckOptions>({
  name: 'spellCheck',

  addOptions() {
    return {
      documentId: '',
      checkSpell: async () => [],
      checkGrammar: undefined,
      debounceMs: 1200,
      grammarDebounceMs: 4000,
    };
  },

  addProseMirrorPlugins() {
    const { checkSpell, checkGrammar, debounceMs, grammarDebounceMs } = this.options;
    let spellTimer: ReturnType<typeof setTimeout> | null = null;
    let grammarTimer: ReturnType<typeof setTimeout> | null = null;
    let lastGrammarIssues: StoredIssue[] = [];
    const ignored = new Set<string>();

    return [
      new Plugin({
        key: spellCheckPluginKey,
        state: {
          init: (): SpellCheckState => ({ decorations: DecorationSet.empty, issues: [] }),
          apply(tr, value): SpellCheckState {
            const meta = tr.getMeta(spellCheckPluginKey) as Partial<SpellCheckState> & { ignoreId?: string } | undefined;
            if (meta?.ignoreId) ignored.add(meta.ignoreId);
            if (meta?.decorations && meta?.issues) {
              return { decorations: meta.decorations, issues: meta.issues };
            }
            if (tr.docChanged) {
              return {
                decorations: value.decorations.map(tr.mapping, tr.doc),
                issues: value.issues,
              };
            }
            return value;
          },
        },
        props: {
          decorations(state) {
            return spellCheckPluginKey.getState(state)?.decorations;
          },
        },
        view() {
          return {
            update(view, prev) {
              if (!view.editable) return;
              if (!prev.doc.eq(view.state.doc)) {
                if (spellTimer) clearTimeout(spellTimer);
                spellTimer = setTimeout(async () => {
                  const text = view.state.doc.textContent;
                  if (!text.trim()) {
                    view.dispatch(
                      view.state.tr.setMeta(spellCheckPluginKey, {
                        decorations: DecorationSet.empty,
                        issues: [],
                      })
                    );
                    lastGrammarIssues = [];
                    return;
                  }
                  try {
                    const spellIssues = await checkSpell(text);
                    const stored: StoredIssue[] = spellIssues
                      .filter((i) => !ignored.has(`${i.word}:${i.suggestions[0] ?? ''}`))
                      .map((i) => ({
                        ...i,
                        id: `${i.word}:${i.suggestions[0] ?? i.type}:${i.from}`,
                        replacement: i.suggestions[0],
                      }));
                    const merged = [...stored, ...lastGrammarIssues.filter((g) => !ignored.has(g.id))];
                    view.dispatch(
                      view.state.tr.setMeta(spellCheckPluginKey, {
                        decorations: buildDecorations(view.state.doc, merged),
                        issues: merged,
                      })
                    );
                  } catch {
                    /* non-blocking */
                  }
                }, debounceMs);

                if (checkGrammar) {
                  if (grammarTimer) clearTimeout(grammarTimer);
                  grammarTimer = setTimeout(async () => {
                    const text = view.state.doc.textContent;
                    if (!text.trim() || text.length < 20) return;
                    try {
                      const grammar = await checkGrammar(text);
                      lastGrammarIssues = grammarToIssues(text, grammar, ignored);
                      const current = spellCheckPluginKey.getState(view.state);
                      const spellOnly = (current?.issues ?? []).filter(
                        (i: StoredIssue) => i.type === 'spelling' || i.type === 'repeated'
                      );
                      const merged = [...spellOnly, ...lastGrammarIssues];
                      view.dispatch(
                        view.state.tr.setMeta(spellCheckPluginKey, {
                          decorations: buildDecorations(view.state.doc, merged),
                          issues: merged,
                        })
                      );
                    } catch {
                      /* non-blocking */
                    }
                  }, grammarDebounceMs);
                }
              }
            },
          };
        },
      }),
    ];
  },
});

export function ignoreSpellIssue(editor: Editor, issueId: string) {
  editor.view.dispatch(
    editor.view.state.tr.setMeta(spellCheckPluginKey, { ignoreId: issueId }).scrollIntoView()
  );
}

export function getSpellIssues(state: import('@tiptap/pm/state').EditorState): StoredIssue[] {
  return spellCheckPluginKey.getState(state)?.issues ?? [];
}
