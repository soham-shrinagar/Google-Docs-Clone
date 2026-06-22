import { useEffect, useRef, useState, useMemo } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from 'react-konva';
import type Konva from 'konva';
import type * as Y from 'yjs';
import { WorkspaceElementNode } from './WorkspaceElementNode';
import { upsertElement, deleteElement, WS_PAGE_ORDER, WS_PAGES } from '../../lib/workspace/yjsBinding';
import {
  createBlankPage,
  createElement,
  DEFAULT_TEXT_STYLE,
  PAGE_PRESETS,
  type WorkspaceElementData,
  type WorkspacePageData,
  type WorkspaceTool,
} from '../../lib/workspace/types';
import { resolveUploadUrl } from '../../lib/uploads';
import { api } from '../../lib/api';

const PAGE_GAP = 48;

function useBgImage(url?: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) { setImage(null); return; }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = url;
  }, [url]);
  return image;
}

function PageStage({
  page,
  elements,
  zoom,
  activeTool,
  selectedIds,
  editable,
  onSelect,
  onChangeElement,
  onStageClick,
  onDrawPen,
}: {
  page: WorkspacePageData;
  elements: WorkspaceElementData[];
  zoom: number;
  activeTool: WorkspaceTool;
  selectedIds: Set<string>;
  editable: boolean;
  onSelect: (ids: string[]) => void;
  onChangeElement: (el: WorkspaceElementData) => void;
  onStageClick: (pageId: string, x: number, y: number) => void;
  onDrawPen: (pageId: string, points: number[]) => void;
}) {
  const bg = useBgImage(page.backgroundUrl);
  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const drawing = useRef(false);
  const penPoints = useRef<number[]>([]);

  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !trRef.current) return;
    const nodes = selectedIds.size
      ? [...selectedIds]
          .map((id) => stage.findOne(`#el-${id}`))
          .filter(Boolean) as Konva.Node[]
      : [];
    trRef.current.nodes(nodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedIds, sorted]);

  return (
    <div className="flex flex-col items-center mb-12">
      <p className="text-xs text-muted mb-2 font-medium">{page.label ?? 'Page'}</p>
      <div
        className="shadow-xl rounded-sm border border-line bg-white overflow-hidden"
        style={{ width: page.width * zoom, height: page.height * zoom }}
      >
        <Stage
          ref={stageRef}
          width={page.width * zoom}
          height={page.height * zoom}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!editable) return;
            if (activeTool === 'pen' || activeTool === 'highlighter') {
              drawing.current = true;
              const pos = e.target.getStage()?.getPointerPosition();
              if (!pos) return;
              penPoints.current = [pos.x / zoom, pos.y / zoom];
              return;
            }
            if (e.target === e.target.getStage()) {
              onSelect([]);
              onStageClick(page.id, (e.evt.offsetX) / zoom, (e.evt.offsetY) / zoom);
            }
          }}
          onMousemove={(e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!drawing.current || !editable) return;
            const pos = e.target.getStage()?.getPointerPosition();
            if (!pos) return;
            penPoints.current = [...penPoints.current, pos.x / zoom, pos.y / zoom];
          }}
          onMouseup={() => {
            if (!drawing.current) return;
            drawing.current = false;
            if (penPoints.current.length >= 4) {
              onDrawPen(page.id, [...penPoints.current]);
            }
            penPoints.current = [];
          }}
        >
          <Layer listening={false}>
            <Rect width={page.width} height={page.height} fill="#ffffff" />
            {bg && (
              <KonvaImage image={bg} width={page.width} height={page.height} />
            )}
          </Layer>
          <Layer>
            {sorted.map((el) => (
              <GroupWrap key={el.id} id={`el-${el.id}`}>
                <WorkspaceElementNode
                  element={el}
                  editable={editable}
                  onSelect={(id, additive) => {
                    if (additive) {
                      const next = new Set(selectedIds);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      onSelect([...next]);
                    } else {
                      onSelect([id]);
                    }
                  }}
                  onChange={onChangeElement}
                />
              </GroupWrap>
            ))}
            {editable && (
              <Transformer
                ref={trRef}
                boundBoxFunc={(old, next) =>
                  next.width < 10 || next.height < 10 ? old : next
                }
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

function GroupWrap({ id, children }: { id: string; children: React.ReactNode }) {
  return <>{children}</>;
}

interface WorkspaceCanvasProps {
  ydoc: Y.Doc;
  pages: WorkspacePageData[];
  elements: WorkspaceElementData[];
  zoom: number;
  activeTool: WorkspaceTool;
  selectedIds: string[];
  editable: boolean;
  onSelect: (ids: string[]) => void;
}

export function WorkspaceCanvas({
  ydoc,
  pages,
  elements,
  zoom,
  activeTool,
  selectedIds,
  editable,
  onSelect,
}: WorkspaceCanvasProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleChange = (el: WorkspaceElementData) => {
    upsertElement(ydoc, el);
  };

  const handleStageClick = (pageId: string, x: number, y: number) => {
    if (!editable) return;

    if (activeTool === 'text') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'text',
        layer: 'text',
        zIndex: elements.filter((e) => e.pageId === pageId).length + 1,
        transform: { x, y, width: 240, height: 48, rotation: 0 },
        style: { ...DEFAULT_TEXT_STYLE },
        data: { text: 'Double-click to edit' },
        name: 'Text',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    } else if (activeTool === 'sticky') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'sticky',
        layer: 'annotation',
        zIndex: elements.filter((e) => e.pageId === pageId).length + 1,
        transform: { x, y, width: 180, height: 120, rotation: 0 },
        style: { background: '#fef08a', color: '#713f12' },
        data: { text: 'Note…' },
        name: 'Sticky note',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    } else if (activeTool === 'rect') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'rect',
        layer: 'drawing',
        zIndex: elements.filter((e) => e.pageId === pageId).length + 1,
        transform: { x, y, width: 160, height: 100, rotation: 0 },
        style: { fill: '#3b82f622', stroke: '#3b82f6', strokeWidth: 2 },
        data: {},
        name: 'Rectangle',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    } else if (activeTool === 'circle') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'circle',
        layer: 'drawing',
        zIndex: elements.filter((e) => e.pageId === pageId).length + 1,
        transform: { x, y, width: 100, height: 100, rotation: 0 },
        style: { fill: '#8b5cf622', stroke: '#8b5cf6', strokeWidth: 2 },
        data: {},
        name: 'Circle',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    }
  };

  const handleDrawPen = (pageId: string, points: number[]) => {
    const xs = points.filter((_, i) => i % 2 === 0);
    const ys = points.filter((_, i) => i % 2 === 1);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const rel = points.map((v, i) => (i % 2 === 0 ? v - minX : v - minY));

    const el = createElement({
      id: crypto.randomUUID(),
      pageId,
      type: 'pen',
      layer: 'drawing',
      zIndex: elements.filter((e) => e.pageId === pageId).length + 1,
      transform: { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY, rotation: 0 },
      style: {
        stroke: activeTool === 'highlighter' ? '#fef08a' : '#1a1a2e',
        strokeWidth: activeTool === 'highlighter' ? 12 : 2,
        opacity: activeTool === 'highlighter' ? 0.45 : 1,
      },
      data: { points: rel },
      name: activeTool === 'highlighter' ? 'Highlight' : 'Drawing',
    });
    upsertElement(ydoc, el);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length && editable) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        e.preventDefault();
        selectedIds.forEach((id) => deleteElement(ydoc, id));
        onSelect([]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, ydoc, editable, onSelect]);

  return (
    <div className="flex flex-col items-center py-8 px-4 min-h-full">
      {pages.map((page) => (
        <PageStage
          key={page.id}
          page={page}
          elements={elements.filter((e) => e.pageId === page.id)}
          zoom={zoom}
          activeTool={activeTool}
          selectedIds={selectedSet}
          editable={editable}
          onSelect={onSelect}
          onChangeElement={handleChange}
          onStageClick={handleStageClick}
          onDrawPen={handleDrawPen}
        />
      ))}
    </div>
  );
}

export async function insertWorkspaceImage(
  ydoc: Y.Doc,
  pageId: string,
  file: File,
  elements: WorkspaceElementData[]
) {
  const result = await api.uploadFile(file);
  const url = resolveUploadUrl(result.url);
  const el = createElement({
    id: crypto.randomUUID(),
    pageId,
    type: 'image',
    layer: 'image',
    zIndex: elements.filter((e) => e.pageId === pageId).length + 1,
    transform: { x: 100, y: 100, width: 320, height: 240, rotation: 0 },
    style: {},
    data: { src: url, alt: result.originalName },
    name: result.originalName,
  });
  upsertElement(ydoc, el);
  return el.id;
}

export function addBlankPageToWorkspace(ydoc: Y.Doc, label?: string) {
  const page = createBlankPage(crypto.randomUUID(), PAGE_PRESETS.A4, label);
  const pageOrder = ydoc.getArray<string>(WS_PAGE_ORDER);
  ydoc.getMap(WS_PAGES).set(page.id, { ...page });
  pageOrder.push([page.id]);
  return page.id;
}
