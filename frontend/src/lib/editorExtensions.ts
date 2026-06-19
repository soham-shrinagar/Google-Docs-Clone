import { getSchema } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { PdfEmbed } from '../components/editor/PdfEmbed';

const lowlight = createLowlight(common);

/** Extensions shared by the editor and Yjs seeding (no collaboration). */
export function getBaseExtensions() {
  return [
    StarterKit.configure({ history: false, codeBlock: false }),
    Underline,
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    PdfEmbed,
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Highlight.configure({ multicolor: true }),
    HorizontalRule,
    CodeBlockLowlight.configure({ lowlight }),
  ];
}

export function getEditorSchema() {
  return getSchema(getBaseExtensions());
}
