import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { api } from '../../lib/api';

interface SpellContextMenuProps {
  editor: Editor;
}

interface MenuState {
  x: number;
  y: number;
  word: string;
  from: number;
  to: number;
  suggestions: string[];
}

export function SpellContextMenu({ editor }: SpellContextMenuProps) {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = editor.view.dom;

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const el = target.closest('.spell-error-spelling, .spell-error-grammar, .spell-error-style');
      if (!el) {
        setMenu(null);
        return;
      }

      e.preventDefault();
      const pos = editor.view.posAtDOM(el, 0);
      const word = el.textContent?.trim() ?? '';
      if (!word) return;

      const from = pos;
      const to = pos + word.length;
      const title = el.getAttribute('title') || '';
      const suggestions = title && title !== word ? [title] : [];

      setMenu({ x: e.clientX, y: e.clientY, word, from, to, suggestions });
    };

    const onClick = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return;
      setMenu(null);
    };

    root.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('click', onClick);
    };
  }, [editor]);

  if (!menu) return null;

  const replaceWord = (replacement: string) => {
    editor.chain().focus().insertContentAt({ from: menu.from, to: menu.to }, replacement).run();
    setMenu(null);
  };

  const addToDictionary = async () => {
    try {
      await api.addDictionaryWord(menu.word);
      setMenu(null);
      editor.view.dispatch(editor.state.tr);
    } catch {
      setMenu(null);
    }
  };

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[160px] bg-paper border border-line rounded-xl shadow-xl py-1 text-sm animate-fade-up"
      style={{ left: menu.x, top: menu.y }}
    >
      {menu.suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => replaceWord(s)}
          className="w-full text-left px-3 py-1.5 hover:bg-accent-soft hover:text-accent"
        >
          {s}
        </button>
      ))}
      {menu.suggestions.length === 0 && (
        <p className="px-3 py-1.5 text-xs text-muted">No suggestions</p>
      )}
      <div className="border-t border-line my-1" />
      <button type="button" onClick={() => setMenu(null)} className="w-full text-left px-3 py-1.5 hover:bg-surface text-muted">
        Ignore
      </button>
      <button type="button" onClick={addToDictionary} className="w-full text-left px-3 py-1.5 hover:bg-surface text-accent">
        Add to dictionary
      </button>
    </div>
  );
}
