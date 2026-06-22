import { useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, List, ListOrdered, Code,
  Link as LinkIcon, Table as TableIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Undo, Redo, Highlighter, ChevronDown, Minus as MinusIcon, Plus, ListChecks, MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import { FileUploadButton } from './FileUploadButton';
import {
  ToolbarDropdown,
  ToolbarMenuItem,
  ToolbarColorGrid,
  ToolbarDropdownFooter,
} from './ToolbarDropdown';
import {
  FONT_FAMILIES, FONT_SIZES, TEXT_COLORS, HIGHLIGHT_COLORS, PARAGRAPH_STYLES, LINE_HEIGHTS,
} from '../../lib/editorConstants';

interface EditorToolbarProps {
  editor: Editor | null;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {children}
    </div>
  );
}

export function EditorToolbar({
  editor,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: EditorToolbarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [, setToolbarTick] = useState(0);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.document.addEventListener('mousedown', close);
    return () => window.document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!editor) return;
    const bump = () => setToolbarTick((n) => n + 1);
    editor.on('selectionUpdate', bump);
    editor.on('transaction', bump);
    return () => {
      editor.off('selectionUpdate', bump);
      editor.off('transaction', bump);
    };
  }, [editor]);

  if (!editor) return null;

  const btn = (active: boolean, disabled = false) =>
    clsx(
      'p-1.5 rounded-md transition-colors shrink-0',
      disabled && 'opacity-40 pointer-events-none',
      active ? 'bg-accent-soft text-accent' : 'text-muted hover:text-ink hover:bg-surface'
    );

  const selectBtn = (open = false) =>
    clsx(
      'inline-flex items-center gap-1 h-7 px-2 rounded-md border text-xs transition-colors shrink-0',
      open
        ? 'border-accent/30 bg-accent-soft text-accent'
        : 'border-line bg-paper text-ink hover:bg-surface'
    );

  const currentStyle = [1, 2, 3, 4, 5, 6].find((l) => editor.isActive('heading', { level: l }))
    ? (`h${[1, 2, 3, 4, 5, 6].find((l) => editor.isActive('heading', { level: l }))}` as string)
    : 'paragraph';

  const currentFont = editor.getAttributes('textStyle').fontFamily || FONT_FAMILIES[0].value;
  const currentFontLabel = FONT_FAMILIES.find((f) => f.value === currentFont)?.label ?? 'Arial';

  const rawSize = editor.getAttributes('textStyle').fontSize || '11px';
  const currentSize = rawSize.replace('px', '');
  const currentTextColor = (editor.getAttributes('textStyle').color as string | undefined) || '#18181b';
  const currentHighlight = editor.getAttributes('highlight').color as string | undefined;
  const currentLineHeight = editor.getAttributes('paragraph').lineHeight as string | undefined;

  const applyStyle = (value: string) => {
    const chain = editor.chain().focus();
    if (value === 'paragraph') chain.setParagraph().run();
    else if (value === 'title') chain.setParagraph().toggleHeading({ level: 1 }).run();
    else if (value === 'subtitle') chain.setParagraph().toggleHeading({ level: 2 }).run();
    else if (value === 'h1') chain.setHeading({ level: 1 }).run();
    else if (value === 'h2') chain.setHeading({ level: 2 }).run();
    else if (value === 'h3') chain.setHeading({ level: 3 }).run();
    else if (value === 'h4') chain.setHeading({ level: 4 }).run();
    else if (value === 'h5') chain.setHeading({ level: 5 }).run();
    else if (value === 'h6') chain.setHeading({ level: 6 }).run();
    setOpenMenu(null);
  };

  const adjustSize = (delta: number) => {
    const idx = FONT_SIZES.indexOf(currentSize as (typeof FONT_SIZES)[number]);
    const base = idx >= 0 ? idx : FONT_SIZES.indexOf('11');
    const next = FONT_SIZES[Math.max(0, Math.min(FONT_SIZES.length - 1, base + delta))];
    editor.chain().focus().setFontSize(`${next}px`).run();
  };

  const addLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const toggleMenu = (id: string) => setOpenMenu((m) => (m === id ? null : id));
  const closeMenu = () => setOpenMenu(null);

  return (
    <div ref={toolbarRef} className="border-b border-line bg-paper sticky top-12 z-10">
      <div className="flex items-center gap-1 px-3 py-1 overflow-x-auto scroll-panel">
        <ToolbarGroup>
          <button type="button" onClick={onUndo} disabled={!canUndo} className={btn(false, !canUndo)} title="Undo">
            <Undo size={16} />
          </button>
          <button type="button" onClick={onRedo} disabled={!canRedo} className={btn(false, !canRedo)} title="Redo">
            <Redo size={16} />
          </button>
        </ToolbarGroup>

        <ToolbarGroup>
          <div className="relative">
            <button type="button" className={selectBtn(openMenu === 'style')} onClick={() => toggleMenu('style')}>
              <span className="max-w-[6rem] truncate text-xs">
                {PARAGRAPH_STYLES.find((s) => s.value === currentStyle)?.label ?? 'Normal'}
              </span>
              <ChevronDown size={14} className="text-muted shrink-0" />
            </button>
            <ToolbarDropdown open={openMenu === 'style'} width="w-48" header="Paragraph style">
              {PARAGRAPH_STYLES.map((style) => (
                <ToolbarMenuItem key={style.value} active={currentStyle === style.value} onClick={() => applyStyle(style.value)}>
                  {style.label}
                </ToolbarMenuItem>
              ))}
            </ToolbarDropdown>
          </div>
          <div className="relative">
            <button type="button" className={clsx(selectBtn(openMenu === 'font'), 'min-w-[90px] max-w-[120px]')} onClick={() => toggleMenu('font')}>
              <span className="truncate text-xs">{currentFontLabel}</span>
              <ChevronDown size={14} className="text-muted shrink-0" />
            </button>
            <ToolbarDropdown open={openMenu === 'font'} width="w-56" header="Font">
              {FONT_FAMILIES.map((font) => (
                <ToolbarMenuItem key={font.value} active={currentFont === font.value} onClick={() => { editor.chain().focus().setFontFamily(font.value).run(); closeMenu(); }} style={{ fontFamily: font.value }}>
                  {font.label}
                </ToolbarMenuItem>
              ))}
            </ToolbarDropdown>
          </div>
          <div className="inline-flex items-center border border-line rounded-lg overflow-hidden shrink-0 bg-paper">
            <button type="button" onClick={() => adjustSize(-1)} className="p-1.5 hover:bg-surface text-muted" title="Decrease font size">
              <MinusIcon size={14} />
            </button>
            <div className="relative">
              <button type="button" className="px-2 h-8 text-xs min-w-[2rem] hover:bg-surface font-medium" onClick={() => toggleMenu('size')}>
                {currentSize}
              </button>
              <ToolbarDropdown open={openMenu === 'size'} width="w-24" header="Font size">
                {FONT_SIZES.map((size) => (
                  <ToolbarMenuItem key={size} active={currentSize === size} onClick={() => { editor.chain().focus().setFontSize(`${size}px`).run(); closeMenu(); }}>
                    {size}
                  </ToolbarMenuItem>
                ))}
              </ToolbarDropdown>
            </div>
            <button type="button" onClick={() => adjustSize(1)} className="p-1.5 hover:bg-surface text-muted" title="Increase font size">
              <Plus size={14} />
            </button>
          </div>
        </ToolbarGroup>

        <ToolbarGroup>
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive('bold'))} title="Bold">
            <Bold size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive('italic'))} title="Italic">
            <Italic size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive('underline'))} title="Underline">
            <UnderlineIcon size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive('strike'))} title="Strikethrough">
            <Strikethrough size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={btn(editor.isActive('code'))} title="Inline code">
            <Code size={16} />
          </button>
          <div className="relative">
            <button type="button" className={btn(openMenu === 'textColor')} onClick={() => toggleMenu('textColor')} title="Text color">
              <span className="flex flex-col items-center leading-none gap-0.5">
                <span className="text-xs font-bold">A</span>
                <span className="w-4 h-0.5 rounded-full" style={{ backgroundColor: currentTextColor }} />
              </span>
            </button>
            <ToolbarDropdown open={openMenu === 'textColor'} width="w-[15.5rem]" footer={<ToolbarDropdownFooter label="Reset color" onClick={() => { editor.chain().focus().unsetColor().run(); closeMenu(); }} />}>
              <ToolbarColorGrid label="Text color" colors={TEXT_COLORS} selected={currentTextColor} onPick={(color) => { editor.chain().focus().setColor(color).run(); closeMenu(); }} />
            </ToolbarDropdown>
          </div>
          <div className="relative">
            <button type="button" className={btn(editor.isActive('highlight') || openMenu === 'highlight')} onClick={() => toggleMenu('highlight')} title="Highlight">
              <Highlighter size={16} />
            </button>
            <ToolbarDropdown open={openMenu === 'highlight'} width="w-[15.5rem]" footer={<ToolbarDropdownFooter label="Remove highlight" onClick={() => { editor.chain().focus().unsetHighlight().run(); closeMenu(); }} />}>
              <ToolbarColorGrid label="Highlight color" colors={HIGHLIGHT_COLORS} selected={currentHighlight} onPick={(color) => { editor.chain().focus().toggleHighlight({ color }).run(); closeMenu(); }} />
            </ToolbarDropdown>
          </div>
        </ToolbarGroup>

        <ToolbarGroup>
          <button type="button" onClick={addLink} className={btn(editor.isActive('link'))} title="Insert link">
            <LinkIcon size={16} />
          </button>
          <FileUploadButton editor={editor} className="!p-1.5" />
          <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={btn(false)} title="Insert table">
            <TableIcon size={16} />
          </button>
        </ToolbarGroup>

        <ToolbarGroup>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btn(editor.isActive({ textAlign: 'left' }))} title="Align left">
            <AlignLeft size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btn(editor.isActive({ textAlign: 'center' }))} title="Align center">
            <AlignCenter size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btn(editor.isActive({ textAlign: 'right' }))} title="Align right">
            <AlignRight size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={btn(editor.isActive({ textAlign: 'justify' }))} title="Justify">
            <AlignJustify size={16} />
          </button>
        </ToolbarGroup>

        <ToolbarGroup>
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive('bulletList'))} title="Bullet list">
            <List size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive('orderedList'))} title="Numbered list">
            <ListOrdered size={16} />
          </button>
          <button type="button" onClick={() => editor.chain().focus().toggleTaskList().run()} className={btn(editor.isActive('taskList'))} title="Checklist">
            <ListChecks size={16} />
          </button>
        </ToolbarGroup>

        <div className="relative shrink-0">
          <button type="button" className={selectBtn(openMenu === 'more')} onClick={() => toggleMenu('more')} title="More formatting">
            <MoreHorizontal size={16} />
            <ChevronDown size={12} className="text-muted" />
          </button>
          <ToolbarDropdown open={openMenu === 'more'} align="right" width="w-44" header="More">
            <ToolbarMenuItem onClick={() => { editor.chain().focus().toggleSubscript().run(); closeMenu(); }} active={editor.isActive('subscript')}>Subscript</ToolbarMenuItem>
            <ToolbarMenuItem onClick={() => { editor.chain().focus().toggleSuperscript().run(); closeMenu(); }} active={editor.isActive('superscript')}>Superscript</ToolbarMenuItem>
            <ToolbarMenuItem onClick={() => { editor.chain().focus().toggleBlockquote().run(); closeMenu(); }} active={editor.isActive('blockquote')}>Quote</ToolbarMenuItem>
            <ToolbarMenuItem onClick={() => { editor.chain().focus().toggleCodeBlock().run(); closeMenu(); }} active={editor.isActive('codeBlock')}>Code block</ToolbarMenuItem>
            <ToolbarMenuItem onClick={() => { editor.chain().focus().setHorizontalRule().run(); closeMenu(); }}>Divider</ToolbarMenuItem>
            <ToolbarMenuItem onClick={() => { editor.chain().focus().sinkListItem('listItem').run(); closeMenu(); }}>Increase indent</ToolbarMenuItem>
            <ToolbarMenuItem onClick={() => { editor.chain().focus().liftListItem('listItem').run(); closeMenu(); }}>Decrease indent</ToolbarMenuItem>
            {LINE_HEIGHTS.map((lh) => (
              <ToolbarMenuItem key={lh} active={currentLineHeight === lh} onClick={() => { editor.chain().focus().setLineHeight(lh).run(); closeMenu(); }}>
                Line height {lh}
              </ToolbarMenuItem>
            ))}
            <ToolbarMenuItem onClick={() => { editor.chain().focus().clearNodes().unsetAllMarks().run(); closeMenu(); }}>Clear formatting</ToolbarMenuItem>
          </ToolbarDropdown>
        </div>
      </div>
    </div>
  );
}
