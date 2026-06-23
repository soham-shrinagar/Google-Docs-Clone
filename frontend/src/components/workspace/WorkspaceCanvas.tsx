import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Transformer, Line, Group } from 'react-konva';
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
import { renderPdfPageToCanvas } from '../../lib/workspace/pdfPageRender';

function useBgImage(url?: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) { setImage(null); return; }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = url;
  }, [url]);
  return image;
}

function usePdfPageBackground(page: WorkspacePageData) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const meta = page.backgroundMeta;
    const sourceUrl = meta?.sourceUrl as string | undefined;
    const pdfPage = meta?.pdfPage as number | undefined;
    const renderMode = meta?.renderMode as string | undefined;

    if (page.backgroundUrl) {
      setImage(null);
      return;
    }

    if (renderMode === 'client' && sourceUrl && pdfPage) {
      setLoading(true);
      let cancelled = false;
      renderPdfPageToCanvas(sourceUrl, pdfPage)
        .then((canvas) => {
          if (cancelled) return;
          const img = new window.Image();
          img.onload = () => {
            if (!cancelled) setImage(img);
            setLoading(false);
          };
          img.src = canvas.toDataURL('image/jpeg', 0.92);
        })
        .catch(() => setLoading(false));
      return () => { cancelled = true; };
    }
  }, [page.id, page.backgroundUrl, page.backgroundMeta, page.width, page.height]);

  return { image, loading };
}

type ShapeDraft = {
  type: 'rect' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  w: number;
  h: number;
};

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
  onCreateShape,
  onEditText,
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
  onCreateShape: (pageId: string, draft: ShapeDraft) => void;
  onEditText: (el: WorkspaceElementData) => void;
}) {
  const bgFromUrl = useBgImage(page.backgroundUrl);
  const { image: bgFromPdf, loading: pdfLoading } = usePdfPageBackground(page);
  const bg = bgFromUrl ?? bgFromPdf;

  const trRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const penPoints = useRef<number[]>([]);
  const shapeDraft = useRef<ShapeDraft | null>(null);
  const [penPreview, setPenPreview] = useState<number[]>([]);
  const [shapePreview, setShapePreview] = useState<ShapeDraft | null>(null);

  const sorted = useMemo(
    () => [...elements].sort((a, b) => a.zIndex - b.zIndex),
    [elements]
  );

  const pointerPos = useCallback((stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return { x: pos.x / zoom, y: pos.y / zoom };
  }, [zoom]);

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

  const isShapeTool = activeTool === 'rect' || activeTool === 'circle' ||
    activeTool === 'line' || activeTool === 'arrow';

  return (
    <div className="flex flex-col items-center mb-12" id={`ws-page-${page.id}`}>
      <p className="text-xs text-muted mb-2 font-medium">{page.label ?? 'Page'}</p>
      <div
        ref={containerRef}
        data-page-id={page.id}
        className="shadow-xl rounded-sm border border-line bg-white overflow-hidden relative"
        style={{ width: page.width * zoom, height: page.height * zoom }}
      >
        {pdfLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <Stage
          ref={stageRef}
          width={page.width * zoom}
          height={page.height * zoom}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={(e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!editable || activeTool === 'hand') return;
            const stage = e.target.getStage();
            if (!stage) return;
            const pos = pointerPos(stage);
            if (!pos) return;

            if (activeTool === 'pen' || activeTool === 'highlighter') {
              drawing.current = true;
              penPoints.current = [pos.x, pos.y];
              setPenPreview([pos.x, pos.y]);
              return;
            }

            if (isShapeTool) {
              shapeDraft.current = {
                type: activeTool as ShapeDraft['type'],
                x: pos.x,
                y: pos.y,
                w: 0,
                h: 0,
              };
              setShapePreview({ ...shapeDraft.current });
              return;
            }

            if (e.target === stage) {
              onSelect([]);
              onStageClick(page.id, pos.x, pos.y);
            }
          }}
          onMousemove={(e: Konva.KonvaEventObject<MouseEvent>) => {
            if (!editable) return;
            const stage = e.target.getStage();
            if (!stage) return;
            const pos = pointerPos(stage);
            if (!pos) return;

            if (drawing.current) {
              penPoints.current = [...penPoints.current, pos.x, pos.y];
              setPenPreview([...penPoints.current]);
              return;
            }

            if (shapeDraft.current) {
              const start = shapeDraft.current;
              shapeDraft.current = {
                ...start,
                w: pos.x - start.x,
                h: pos.y - start.y,
              };
              setShapePreview({ ...shapeDraft.current });
            }
          }}
          onMouseup={() => {
            if (drawing.current) {
              drawing.current = false;
              if (penPoints.current.length >= 4) {
                onDrawPen(page.id, [...penPoints.current]);
              }
              penPoints.current = [];
              setPenPreview([]);
              return;
            }

            if (shapeDraft.current) {
              const draft = shapeDraft.current;
              shapeDraft.current = null;
              setShapePreview(null);
              if (Math.abs(draft.w) > 5 || Math.abs(draft.h) > 5) {
                onCreateShape(page.id, draft);
              }
            }
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
              <WorkspaceElementNode
                key={el.id}
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
                onDoubleClickText={onEditText}
              />
            ))}

            {penPreview.length >= 4 && (
              <Line
                points={penPreview}
                stroke={activeTool === 'highlighter' ? '#fef08a' : '#1a1a2e'}
                strokeWidth={activeTool === 'highlighter' ? 12 : 2}
                lineCap="round"
                lineJoin="round"
                tension={0.4}
                opacity={activeTool === 'highlighter' ? 0.45 : 0.7}
                listening={false}
              />
            )}

            {shapePreview && (
              <Group listening={false}>
                {shapePreview.type === 'rect' && (
                  <Rect
                    x={Math.min(shapePreview.x, shapePreview.x + shapePreview.w)}
                    y={Math.min(shapePreview.y, shapePreview.y + shapePreview.h)}
                    width={Math.abs(shapePreview.w)}
                    height={Math.abs(shapePreview.h)}
                    fill="#3b82f622"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[4, 4]}
                  />
                )}
                {shapePreview.type === 'circle' && (
                  <Rect
                    x={Math.min(shapePreview.x, shapePreview.x + shapePreview.w)}
                    y={Math.min(shapePreview.y, shapePreview.y + shapePreview.h)}
                    width={Math.abs(shapePreview.w)}
                    height={Math.abs(shapePreview.h)}
                    fill="#8b5cf622"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dash={[4, 4]}
                    cornerRadius={999}
                  />
                )}
                {(shapePreview.type === 'line' || shapePreview.type === 'arrow') && (
                  <Line
                    points={[
                      shapePreview.x,
                      shapePreview.y,
                      shapePreview.x + shapePreview.w,
                      shapePreview.y + shapePreview.h,
                    ]}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[4, 4]}
                  />
                )}
              </Group>
            )}

            {editable && activeTool === 'select' && (
              <Transformer
                ref={trRef}
                rotateEnabled
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

interface WorkspaceCanvasProps {
  ydoc: Y.Doc;
  pages: WorkspacePageData[];
  elements: WorkspaceElementData[];
  zoom: number;
  activeTool: WorkspaceTool;
  selectedIds: string[];
  editable: boolean;
  onSelect: (ids: string[]) => void;
  onEditText: (el: WorkspaceElementData) => void;
  canvasContainerRef?: React.RefObject<HTMLDivElement | null>;
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
  onEditText,
  canvasContainerRef,
}: WorkspaceCanvasProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = canvasContainerRef ?? internalRef;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleChange = (el: WorkspaceElementData) => {
    upsertElement(ydoc, el);
  };

  const pageElements = useCallback(
    (pageId: string) => elements.filter((e) => e.pageId === pageId),
    [elements]
  );

  const nextZIndex = useCallback(
    (pageId: string) => elements.filter((e) => e.pageId === pageId).length + 1,
    [elements]
  );

  const handleStageClick = (pageId: string, x: number, y: number) => {
    if (!editable) return;

    if (activeTool === 'text') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'text',
        layer: 'text',
        zIndex: nextZIndex(pageId),
        transform: { x, y, width: 240, height: 48, rotation: 0 },
        style: { ...DEFAULT_TEXT_STYLE },
        data: { text: 'Double-click to edit' },
        name: 'Text',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
      onEditText(el);
    } else if (activeTool === 'sticky') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'sticky',
        layer: 'annotation',
        zIndex: nextZIndex(pageId),
        transform: { x, y, width: 180, height: 120, rotation: 0 },
        style: { background: '#fef08a', color: '#713f12' },
        data: { text: 'Note…' },
        name: 'Sticky note',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
      onEditText(el);
    }
  };

  const handleCreateShape = (pageId: string, draft: ShapeDraft) => {
    const x = Math.min(draft.x, draft.x + draft.w);
    const y = Math.min(draft.y, draft.y + draft.h);
    const w = Math.max(Math.abs(draft.w), 20);
    const h = Math.max(Math.abs(draft.h), 20);

    if (draft.type === 'rect') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'rect',
        layer: 'drawing',
        zIndex: nextZIndex(pageId),
        transform: { x, y, width: w, height: h, rotation: 0 },
        style: { fill: '#3b82f622', stroke: '#3b82f6', strokeWidth: 2 },
        data: {},
        name: 'Rectangle',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    } else if (draft.type === 'circle') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'circle',
        layer: 'drawing',
        zIndex: nextZIndex(pageId),
        transform: { x, y, width: w, height: h, rotation: 0 },
        style: { fill: '#8b5cf622', stroke: '#8b5cf6', strokeWidth: 2 },
        data: {},
        name: 'Circle',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    } else if (draft.type === 'line') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'line',
        layer: 'drawing',
        zIndex: nextZIndex(pageId),
        transform: { x, y, width: w, height: h, rotation: 0 },
        style: { stroke: '#3b82f6', strokeWidth: 3 },
        data: {
          points: [0, 0, draft.w, draft.h],
        },
        name: 'Line',
      });
      upsertElement(ydoc, el);
      onSelect([el.id]);
    } else if (draft.type === 'arrow') {
      const el = createElement({
        id: crypto.randomUUID(),
        pageId,
        type: 'arrow',
        layer: 'drawing',
        zIndex: nextZIndex(pageId),
        transform: { x, y, width: w, height: h, rotation: 0 },
        style: { stroke: '#3b82f6', fill: '#3b82f6', strokeWidth: 2 },
        data: {
          points: [0, 0, draft.w, draft.h],
        },
        name: 'Arrow',
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
      zIndex: nextZIndex(pageId),
      transform: {
        x: minX,
        y: minY,
        width: Math.max(...xs) - minX,
        height: Math.max(...ys) - minY,
        rotation: 0,
      },
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
    <div ref={containerRef} className="flex flex-col items-center py-8 px-4 min-h-full">
      {pages.map((page) => (
        <PageStage
          key={page.id}
          page={page}
          elements={pageElements(page.id)}
          zoom={zoom}
          activeTool={activeTool}
          selectedIds={selectedSet}
          editable={editable}
          onSelect={onSelect}
          onChangeElement={handleChange}
          onStageClick={handleStageClick}
          onDrawPen={handleDrawPen}
          onCreateShape={handleCreateShape}
          onEditText={onEditText}
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
