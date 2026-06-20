import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionProps } from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import {
  forwardRef, useEffect, useImperativeHandle, useState, useMemo, type KeyboardEvent,
} from 'react';
import {
  Heading1, Heading2, Heading3, Heading4, List, ListOrdered, ListChecks, Quote, Code,
  Minus, ImageIcon, Table, Link2, Calendar, Smile, Search, FileText, Sparkles, Mic, Wand2,
} from 'lucide-react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';

export interface SlashItem {
  title: string;
  description: string;
  category: string;
  keywords: string[];
  icon: React.ReactNode;
  command: (props: { editor: SuggestionProps['editor']; range: SuggestionProps['range'] }) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  { title: 'Heading 1', description: 'Large title', category: 'Headings', keywords: ['h1', 'title'], icon: <Heading1 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run() },
  { title: 'Heading 2', description: 'Section title', category: 'Headings', keywords: ['h2'], icon: <Heading2 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run() },
  { title: 'Heading 3', description: 'Subsection', category: 'Headings', keywords: ['h3'], icon: <Heading3 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run() },
  { title: 'Heading 4', description: 'Small heading', category: 'Headings', keywords: ['h4'], icon: <Heading4 size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHeading({ level: 4 }).run() },
  { title: 'Bullet list', description: 'Unordered list', category: 'Lists', keywords: ['bullet', 'ul'], icon: <List size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: 'Numbered list', description: 'Ordered list', category: 'Lists', keywords: ['numbered', 'ol'], icon: <ListOrdered size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
  { title: 'Checklist', description: 'Task list with checkboxes', category: 'Lists', keywords: ['checklist', 'todo', 'task'], icon: <ListChecks size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
  { title: 'Quote', description: 'Block quote', category: 'Blocks', keywords: ['quote'], icon: <Quote size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
  { title: 'Code block', description: 'Syntax highlighted code', category: 'Blocks', keywords: ['code'], icon: <Code size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock({ language: 'javascript' }).run() },
  { title: 'Divider', description: 'Horizontal rule', category: 'Blocks', keywords: ['divider', 'hr'], icon: <Minus size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
  { title: 'Table', description: '3×3 table with header', category: 'Insert', keywords: ['table'], icon: <Table size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Image', description: 'Insert image by URL', category: 'Insert', keywords: ['image', 'photo'], icon: <ImageIcon size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); const url = window.prompt('Image URL'); if (url) editor.chain().focus().setImage({ src: url }).run(); } },
  { title: 'Link', description: 'Insert hyperlink', category: 'Insert', keywords: ['link', 'url'], icon: <Link2 size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); const url = window.prompt('Link URL', 'https://'); if (url) editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run(); } },
  { title: 'Date', description: 'Insert today\'s date', category: 'Insert', keywords: ['date', 'today'], icon: <Calendar size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent(new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })).run() },
  { title: 'Emoji', description: 'Insert emoji', category: 'Insert', keywords: ['emoji'], icon: <Smile size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); const emoji = window.prompt('Emoji', '✨'); if (emoji) editor.chain().focus().insertContent(emoji).run(); } },
  { title: 'Search document', description: 'Open find (Ctrl+F)', category: 'Tools', keywords: ['search', 'find'], icon: <Search size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('collabdocs:open-find')); } },
  { title: 'AI Assistant', description: 'Rewrite, summarize, chat', category: 'AI', keywords: ['ai', 'assistant', 'notion'], icon: <Sparkles size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('collabdocs:open-ai', { detail: { tab: 'rewrite' } })); } },
  { title: 'Improve writing', description: 'AI rewrite selection', category: 'AI', keywords: ['improve', 'rewrite', 'writing'], icon: <Wand2 size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('collabdocs:open-ai', { detail: { tab: 'rewrite', action: 'IMPROVE' } })); } },
  { title: 'Summarize', description: 'AI document summary', category: 'AI', keywords: ['summarize', 'summary', 'tldr'], icon: <FileText size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('collabdocs:open-ai', { detail: { tab: 'summarize' } })); } },
  { title: 'Voice dictation', description: 'Speak into the document', category: 'AI', keywords: ['voice', 'dictation', 'microphone', 'speech'], icon: <Mic size={18} />, command: ({ editor, range }) => { editor.chain().focus().deleteRange(range).run(); window.dispatchEvent(new CustomEvent('collabdocs:open-voice')); } },
  { title: 'PDF note', description: 'Upload PDF via toolbar', category: 'Insert', keywords: ['pdf'], icon: <FileText size={18} />, command: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertContent('<p><em>Upload a PDF using the toolbar upload button</em></p>').run() },
];

interface CommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListRef, { items: SlashItem[]; command: (item: SlashItem) => void }>(
  ({ items, command }, ref) => {
    const [selected, setSelected] = useState(0);
    const flatItems = items;

    const grouped = useMemo(() => {
      const map = new Map<string, SlashItem[]>();
      flatItems.forEach((item) => {
        if (!map.has(item.category)) map.set(item.category, []);
        map.get(item.category)!.push(item);
      });
      return map;
    }, [flatItems]);

    useEffect(() => setSelected(0), [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowUp') {
          setSelected((s) => (s + flatItems.length - 1) % flatItems.length);
          return true;
        }
        if (event.key === 'ArrowDown') {
          setSelected((s) => (s + 1) % flatItems.length);
          return true;
        }
        if (event.key === 'Enter') {
          command(flatItems[selected]);
          return true;
        }
        return false;
      },
    }));

    if (!flatItems.length) {
      return (
        <div className="slash-menu bg-paper rounded-xl shadow-xl border border-line p-3 text-sm text-muted">
          No matching commands
        </div>
      );
    }

    let idx = 0;
    return (
      <div className="slash-menu bg-paper rounded-xl shadow-xl border border-line py-2 min-w-[300px] max-h-80 overflow-y-auto scroll-panel">
        {[...grouped.entries()].map(([category, catItems]) => (
          <div key={category}>
            <p className="px-3 py-1 text-[10px] font-semibold text-muted uppercase tracking-wide">{category}</p>
            {catItems.map((item) => {
              const i = idx++;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => command(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    i === selected ? 'bg-accent-soft text-accent' : 'hover:bg-canvas'
                  }`}
                >
                  <span className="text-muted shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.title}</p>
                    <p className="text-xs text-muted truncate">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);
CommandList.displayName = 'CommandList';

export const SlashCommands = Extension.create({
  name: 'slashCommands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: { editor: SuggestionProps['editor']; range: SuggestionProps['range']; props: SlashItem }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const q = query.toLowerCase();
          return SLASH_ITEMS.filter(
            (item) =>
              !q ||
              item.title.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              item.keywords.some((k) => k.includes(q))
          );
        },
        render: () => {
          let component: ReactRenderer<CommandListRef> | null = null;
          let popup: TippyInstance[] | null = null;

          return {
            onStart: (props: SuggestionProps<SlashItem>) => {
              component = new ReactRenderer(CommandList, {
                props: { items: props.items, command: (item: SlashItem) => props.command(item) },
                editor: props.editor,
              });
              if (!props.clientRect) return;
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate: (props: SuggestionProps<SlashItem>) => {
              component?.updateProps({ items: props.items, command: (item: SlashItem) => props.command(item) });
              if (popup?.[0] && props.clientRect) {
                popup[0].setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
              }
            },
            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === 'Escape') {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
