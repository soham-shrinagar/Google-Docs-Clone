import { getSchema } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import { CustomTableCell } from './customTableCell';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Gapcursor from '@tiptap/extension-gapcursor';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { PdfEmbed } from '../components/editor/PdfEmbed';
import { FontSize } from './fontSizeExtension';
import { FontFamily } from './fontFamilyExtension';
import { LineHeight } from './lineHeightExtension';
import { MarkdownShortcuts } from './markdownShortcuts';
import { DocumentSearch } from './findReplaceExtension';
import { ResizableImage } from './resizableImageExtension';

const lowlight = createLowlight(common);

/** Extensions shared by the editor and Yjs seeding (no collaboration). */
export function getBaseExtensions() {
  return [
    StarterKit.configure({
      history: false,
      codeBlock: false,
      heading: { levels: [1, 2, 3, 4, 5, 6] },
    }),
    TextStyle,
    Color.configure({ types: ['textStyle'] }),
    FontFamily,
    FontSize,
    LineHeight,
    Underline,
    Subscript,
    Superscript,
    Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ResizableImage.configure({ inline: false, allowBase64: false }),
    PdfEmbed,
    Table.configure({ resizable: true }),
    TableRow,
    CustomTableCell,
    TableHeader,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: true }),
    HorizontalRule,
    TaskList,
    TaskItem.configure({ nested: true }),
    Gapcursor,
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
    MarkdownShortcuts,
    DocumentSearch,
  ];
}

export function getEditorSchema() {
  return getSchema(getBaseExtensions());
}
