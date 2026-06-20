import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import Placeholder from '@tiptap/extension-placeholder';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import type { WebsocketProvider } from 'y-websocket';
import type { Awareness } from 'y-protocols/awareness';
import type { User } from '../../types';
import { getBaseExtensions } from '../../lib/editorExtensions';
import { SlashCommands } from './SlashCommands';
import { TableBubbleMenu } from './TableBubbleMenu';
import { LinkBubbleMenu } from './LinkBubbleMenu';
import { CodeBlockBubbleMenu } from './CodeBlockBubbleMenu';
import { api } from '../../lib/api';
import { resolveUploadUrl } from '../../lib/uploads';
import { SpellCheckExtension } from '../../lib/spellCheckExtension';
import { SpellContextMenu } from './SpellContextMenu';
import { AiSelectionMenu } from './AiSelectionMenu';
import { GrammarHoverPopover } from './GrammarHoverPopover';
import type { AiRewriteAction } from '../../lib/aiTypes';

import {
  PAGE_WIDTH_PX,
  PAGE_MIN_HEIGHT_PX,
  resolvePageScale,
  type PageZoomMode,
} from '../../lib/pageZoom';

interface CollabEditorProps {
  ydoc: Y.Doc | null;
  provider: WebsocketProvider | null;
  awareness: Awareness | null;
  user: User;
  documentId?: string;
  synced?: boolean;
  editable?: boolean;
  pageZoom?: PageZoomMode;
  onEditorReady?: (editor: Editor) => void;
  onOpenAiAssist?: (selection: string, action?: AiRewriteAction) => void;
}

export function CollabEditor({
  ydoc,
  provider,
  awareness,
  user,
  synced = false,
  editable = true,
  pageZoom = '100',
  documentId,
  onEditorReady,
  onOpenAiAssist,
}: CollabEditorProps) {
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [paperHeight, setPaperHeight] = useState(PAGE_MIN_HEIGHT_PX);

  useEffect(() => {
    if (ydoc && provider) setReady(true);
  }, [ydoc, provider]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateScale = () => {
      setScale(resolvePageScale(pageZoom, canvas.clientWidth, canvas.clientHeight));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [pageZoom]);

  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;

    const measure = () => setPaperHeight(Math.max(PAGE_MIN_HEIGHT_PX, paper.offsetHeight));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(paper);
    return () => observer.disconnect();
  }, [ready]);

  const editor = useEditor(
    {
      extensions: [
        ...getBaseExtensions(),
        Placeholder.configure({ placeholder: 'Start typing, or type / for commands…' }),
        SlashCommands,
        ...(documentId
          ? [
              SpellCheckExtension.configure({
                documentId,
                checkSpell: (text) => api.aiSpellCheck(documentId, text).then((r) => r.issues),
                checkGrammar: (text) => api.aiGrammarCheck(documentId, text).then((r) => r.issues),
              }),
            ]
          : []),
        ...(ydoc
          ? [
              Collaboration.configure({ document: ydoc }),
              ...(awareness
                ? [
                    CollaborationCursor.configure({
                      provider,
                      user: { name: user.name, color: user.color },
                    }),
                  ]
                : []),
            ]
          : []),
      ],
      editable,
      editorProps: {
        attributes: {
          class: 'prose prose-lg max-w-none focus:outline-none min-h-[900px]',
          spellcheck: 'true',
          lang: 'en',
          'aria-label': 'Document editor',
        },
        handleDrop: (view, event) => {
          const files = event.dataTransfer?.files;
          if (!files?.length) return false;
          const file = files[0];
          if (!file.type.startsWith('image/')) return false;
          event.preventDefault();
          void api.uploadFile(file).then((result) => {
            const url = resolveUploadUrl(result.url);
            const { schema } = view.state;
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
            if (coordinates) {
              const node = schema.nodes.image.create({ src: url, alt: file.name });
              view.dispatch(view.state.tr.insert(coordinates.pos, node));
            }
          });
          return true;
        },
        handlePaste: (_view, event) => {
          const items = event.clipboardData?.items;
          if (!items) return false;
          for (const item of items) {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile();
              if (!file) continue;
              event.preventDefault();
              void api.uploadFile(file).then((result) => {
                editor?.chain().focus().setImage({ src: resolveUploadUrl(result.url), alt: file.name }).run();
              });
              return true;
            }
          }
          return false;
        },
      },
      onCreate: ({ editor: e }) => onEditorReady?.(e),
      onUpdate: () => {
        if (paperRef.current) {
          setPaperHeight(Math.max(PAGE_MIN_HEIGHT_PX, paperRef.current.offsetHeight));
        }
      },
    },
    [ready, ydoc, awareness, user.name, user.color, editable, documentId]
  );

  if (!ready || !editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-muted">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          {synced ? 'Loading editor…' : 'Connecting & syncing document…'}
        </div>
      </div>
    );
  }

  const stageWidth = PAGE_WIDTH_PX * scale;
  const stageHeight = paperHeight * scale;

  return (
    <div className="editor-canvas relative" ref={canvasRef}>
      <TableBubbleMenu editor={editor} />
      <LinkBubbleMenu editor={editor} />
      <CodeBlockBubbleMenu editor={editor} />
      {onOpenAiAssist && editable && (
        <AiSelectionMenu editor={editor} onOpenAssist={onOpenAiAssist} />
      )}
      {documentId && editable && (
        <>
          <SpellContextMenu editor={editor} />
          <GrammarHoverPopover editor={editor} />
        </>
      )}
      <div
        className="editor-zoom-stage"
        style={{ width: stageWidth, minHeight: stageHeight }}
      >
        <div
          ref={paperRef}
          className="editor-paper editor-paper-zoomed"
          style={{
            transform: `scale(${scale})`,
            width: PAGE_WIDTH_PX,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
