export type DocumentType = 'RICH_TEXT' | 'WORKSPACE';

export type WorkspaceLayer =
  | 'background'
  | 'annotation'
  | 'drawing'
  | 'text'
  | 'image';

export type WorkspaceElementType =
  | 'text'
  | 'image'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'pen'
  | 'highlight'
  | 'sticky'
  | 'stamp';

export type WorkspaceTool =
  | 'select'
  | 'text'
  | 'pen'
  | 'highlighter'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'sticky'
  | 'hand';

export interface WorkspaceTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface WorkspacePageData {
  id: string;
  width: number;
  height: number;
  backgroundType: 'blank' | 'pdf_page' | 'image';
  backgroundUrl?: string | null;
  backgroundMeta?: Record<string, unknown> | null;
  label?: string | null;
}

export interface WorkspaceElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  align?: 'left' | 'center' | 'right';
  opacity?: number;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
}

export interface WorkspaceElementData {
  id: string;
  pageId: string;
  type: WorkspaceElementType;
  layer: WorkspaceLayer;
  zIndex: number;
  transform: WorkspaceTransform;
  style: WorkspaceElementStyle;
  data: Record<string, unknown>;
  locked: boolean;
  visible: boolean;
  name: string;
}

export interface WorkspaceSeed {
  workspace: true;
  pages: WorkspacePageData[];
  elements: WorkspaceElementData[];
  sourceAsset?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  };
}

export const PAGE_PRESETS = {
  A4: { width: 816, height: 1056, label: 'A4' },
  LETTER: { width: 816, height: 1056, label: 'Letter' },
  SLIDE: { width: 960, height: 540, label: 'Slide 16:9' },
} as const;

export const DEFAULT_TEXT_STYLE: WorkspaceElementStyle = {
  fontSize: 18,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: '400',
  color: '#1a1a2e',
  align: 'left',
};

export function createBlankPage(id: string, preset = PAGE_PRESETS.A4, label?: string): WorkspacePageData {
  return {
    id,
    width: preset.width,
    height: preset.height,
    backgroundType: 'blank',
    label: label ?? preset.label,
  };
}

export function createElement(
  partial: Pick<WorkspaceElementData, 'id' | 'pageId' | 'type' | 'layer'> &
    Partial<Omit<WorkspaceElementData, 'id' | 'pageId' | 'type' | 'layer'>>
): WorkspaceElementData {
  return {
    zIndex: partial.zIndex ?? 1,
    transform: partial.transform ?? { x: 80, y: 80, width: 200, height: 40, rotation: 0 },
    style: partial.style ?? {},
    data: partial.data ?? {},
    locked: partial.locked ?? false,
    visible: partial.visible ?? true,
    name: partial.name ?? partial.type,
    ...partial,
  };
}
