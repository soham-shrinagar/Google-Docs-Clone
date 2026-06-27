import { useEffect, useRef, useState } from 'react';
import { Rect, Text, Line, Circle, Group, Arrow, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import type { WorkspaceElementData, WorkspaceTool } from '../../lib/workspace/types';
import { isPlacementTool, getWorkspaceToolCursor } from '../../lib/workspace/toolCursors';

function useImage(url?: string | null) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!url) {
      setImage(null);
      return;
    }
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = url;
  }, [url]);
  return image;
}

interface Props {
  element: WorkspaceElementData;
  editable: boolean;
  activeTool: WorkspaceTool;
  onSelect: (id: string, additive?: boolean) => void;
  onChange: (element: WorkspaceElementData) => void;
  onDoubleClickText?: (element: WorkspaceElementData) => void;
}

export function WorkspaceElementNode({
  element,
  editable,
  activeTool,
  onSelect,
  onChange,
  onDoubleClickText,
}: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const { transform, style, type, data, visible, locked } = element;
  const nodeId = `el-${element.id}`;
  const bgImage = useImage(type === 'image' ? (data.src as string | undefined) : undefined);

  if (!visible) return null;

  const canDrag = editable && !locked && activeTool === 'select' && type !== 'pen' && type !== 'line';
  const placementMode = isPlacementTool(activeTool);

  const elementCursor = (() => {
    if (placementMode) return 'inherit';
    if (!editable || locked) return 'default';
    if (activeTool === 'select') {
      if (type === 'text' || type === 'sticky') return 'text';
      return 'move';
    }
    return 'default';
  })();

  const dragProps = {
    draggable: canDrag,
    onMouseEnter: (e: Konva.KonvaEventObject<MouseEvent>) => {
      const container = e.target.getStage()?.container();
      if (container && activeTool === 'select' && !locked && editable) {
        container.style.cursor = elementCursor;
      }
    },
    onMouseLeave: (e: Konva.KonvaEventObject<MouseEvent>) => {
      const container = e.target.getStage()?.container();
      if (container) {
        container.style.cursor = getWorkspaceToolCursor(activeTool);
      }
    },
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (placementMode) return;
      e.cancelBubble = true;
      onSelect(element.id, e.evt.shiftKey);
    },
    onTap: (e: Konva.KonvaEventObject<Event>) => {
      if (placementMode) return;
      e.cancelBubble = true;
      onSelect(element.id);
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onChange({
        ...element,
        transform: { ...transform, x: e.target.x(), y: e.target.y() },
      });
    },
    onTransformEnd: () => {
      const node = groupRef.current;
      if (!node) return;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...element,
        transform: {
          ...transform,
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
          rotation: node.rotation(),
        },
      });
    },
  };

  const textDblClick = {
    onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      if (editable && !locked && onDoubleClickText) {
        onDoubleClickText(element);
      }
    },
    onDblTap: (e: Konva.KonvaEventObject<Event>) => {
      e.cancelBubble = true;
      if (editable && !locked && onDoubleClickText) {
        onDoubleClickText(element);
      }
    },
  };

  if (type === 'text' || type === 'sticky') {
    return (
      <Group
        id={nodeId}
        ref={groupRef}
        x={transform.x}
        y={transform.y}
        width={transform.width}
        height={transform.height}
        rotation={transform.rotation}
        opacity={style.opacity ?? 1}
        {...dragProps}
        {...textDblClick}
      >
        {type === 'sticky' && (
          <Rect
            width={transform.width}
            height={transform.height}
            fill={style.background ?? '#fef08a'}
            stroke={style.borderColor ?? '#eab308'}
            strokeWidth={style.borderWidth ?? 1}
            cornerRadius={4}
          />
        )}
        <Text
          text={(data.text as string) ?? ''}
          width={transform.width}
          height={transform.height}
          fontSize={style.fontSize ?? 18}
          fontFamily={style.fontFamily ?? 'Inter, sans-serif'}
          fontStyle={style.fontWeight === '700' ? 'bold' : 'normal'}
          fill={style.color ?? '#1a1a2e'}
          align={style.align ?? 'left'}
          padding={8}
          wrap="word"
        />
      </Group>
    );
  }

  if (type === 'image' && bgImage) {
    return (
      <Group
        id={nodeId}
        ref={groupRef}
        x={transform.x}
        y={transform.y}
        width={transform.width}
        height={transform.height}
        rotation={transform.rotation}
        opacity={style.opacity ?? 1}
        {...dragProps}
      >
        <KonvaImage
          width={transform.width}
          height={transform.height}
          image={bgImage}
        />
      </Group>
    );
  }

  if (type === 'rect' || type === 'highlight') {
    return (
      <Group
        id={nodeId}
        ref={groupRef}
        x={transform.x}
        y={transform.y}
        width={transform.width}
        height={transform.height}
        rotation={transform.rotation}
        opacity={style.opacity ?? 1}
        {...dragProps}
      >
        <Rect
          width={transform.width}
          height={transform.height}
          fill={style.fill ?? (type === 'highlight' ? '#fef08a88' : '#3b82f622')}
          stroke={style.stroke ?? '#3b82f6'}
          strokeWidth={style.strokeWidth ?? (type === 'highlight' ? 0 : 2)}
          cornerRadius={4}
        />
      </Group>
    );
  }

  if (type === 'circle') {
    return (
      <Group
        id={nodeId}
        ref={groupRef}
        x={transform.x}
        y={transform.y}
        width={transform.width}
        height={transform.height}
        rotation={transform.rotation}
        opacity={style.opacity ?? 1}
        {...dragProps}
      >
        <Circle
          x={transform.width / 2}
          y={transform.height / 2}
          radius={Math.min(transform.width, transform.height) / 2}
          fill={style.fill ?? '#3b82f622'}
          stroke={style.stroke ?? '#3b82f6'}
          strokeWidth={style.strokeWidth ?? 2}
        />
      </Group>
    );
  }

  if (type === 'line' || type === 'pen') {
    const points = (data.points as number[]) ?? [0, 0, transform.width, transform.height];
    return (
      <Line
        id={nodeId}
        points={points}
        x={transform.x}
        y={transform.y}
        stroke={style.stroke ?? (type === 'pen' ? '#1a1a2e' : '#3b82f6')}
        strokeWidth={style.strokeWidth ?? (type === 'pen' ? 2 : 3)}
        lineCap="round"
        lineJoin="round"
        tension={type === 'pen' ? 0.4 : 0}
        opacity={style.opacity ?? 1}
        draggable={editable && !locked}
        onClick={(e) => { e.cancelBubble = true; onSelect(element.id, e.evt.shiftKey); }}
        onDragEnd={(e) => {
          onChange({
            ...element,
            transform: { ...transform, x: e.target.x(), y: e.target.y() },
          });
        }}
      />
    );
  }

  if (type === 'arrow') {
    return (
      <Group
        id={nodeId}
        ref={groupRef}
        x={transform.x}
        y={transform.y}
        rotation={transform.rotation}
        opacity={style.opacity ?? 1}
        draggable={editable && !locked}
        onClick={(e) => { e.cancelBubble = true; onSelect(element.id, e.evt.shiftKey); }}
        onDragEnd={(e) => {
          onChange({
            ...element,
            transform: { ...transform, x: e.target.x(), y: e.target.y() },
          });
        }}
      >
        <Arrow
          points={(data.points as number[]) ?? [0, 0, transform.width, 0]}
          fill={style.fill ?? '#3b82f6'}
          stroke={style.stroke ?? '#3b82f6'}
          strokeWidth={style.strokeWidth ?? 2}
          pointerLength={10}
          pointerWidth={10}
        />
      </Group>
    );
  }

  return null;
}
