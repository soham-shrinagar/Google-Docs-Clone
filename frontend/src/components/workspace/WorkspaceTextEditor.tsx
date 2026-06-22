import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { WorkspaceElementData } from '../../lib/workspace/types';

interface WorkspaceTextEditorProps {
  element: WorkspaceElementData;
  zoom: number;
  pageContainer: HTMLElement | null;
  onCommit: (text: string) => void;
  onCancel: () => void;
}

export function WorkspaceTextEditor({
  element,
  zoom,
  pageContainer,
  onCommit,
  onCancel,
}: WorkspaceTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState((element.data.text as string) ?? '');
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  useEffect(() => {
    if (!pageContainer) return;
    const pageEl = pageContainer.querySelector(`[data-page-id="${element.pageId}"]`);
    if (!pageEl) return;

    const pageRect = pageEl.getBoundingClientRect();
    const { transform, style: elStyle } = element;

    setStyle({
      position: 'fixed',
      left: pageRect.left + transform.x * zoom,
      top: pageRect.top + transform.y * zoom,
      width: transform.width * zoom,
      minHeight: transform.height * zoom,
      fontSize: (elStyle.fontSize ?? 18) * zoom,
      fontFamily: elStyle.fontFamily ?? 'Inter, system-ui, sans-serif',
      fontWeight: elStyle.fontWeight ?? '400',
      color: elStyle.color ?? '#1a1a2e',
      textAlign: elStyle.align ?? 'left',
      background: element.type === 'sticky' ? (elStyle.background ?? '#fef08a') : 'rgba(255,255,255,0.95)',
      border: '2px solid var(--color-accent, #2563eb)',
      borderRadius: element.type === 'sticky' ? 4 : 2,
      padding: 8 * zoom,
      zIndex: 500,
      outline: 'none',
      resize: 'none',
      lineHeight: 1.4,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    });
  }, [element, zoom, pageContainer]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onCommit(text);
    }
  };

  if (!pageContainer) return null;

  return createPortal(
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onCommit(text)}
      onKeyDown={handleKeyDown}
      style={style}
      className="workspace-text-editor"
    />,
    document.body
  );
}
