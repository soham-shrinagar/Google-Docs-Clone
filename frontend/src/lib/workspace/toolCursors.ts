import type { WorkspaceTool } from './types';

function svgCursor(svg: string, hotspotX: number, hotspotY: number, fallback: string): string {
  const encoded = encodeURIComponent(svg);
  return `url("data:image/svg+xml,${encoded}") ${hotspotX} ${hotspotY}, ${fallback}`;
}

const CURSORS: Record<WorkspaceTool, string> = {
  select: 'default',
  hand: 'grab',
  text: 'text',
  pen: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M4 20l3.5-.9L17 9.5 14.5 7 6.5 15.1 4 20z" fill="#1a1a2e" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M14.5 7L17 9.5" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M4 20l3.5-.9L17 9.5 14.5 7 6.5 15.1 4 20z" fill="none" stroke="#1a1a2e" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`,
    4,
    20,
    'crosshair'
  ),
  highlighter: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="14" width="12" height="5" rx="1" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
      <path d="M7 14l5-9 4 4-5 9H7z" fill="#fde047" stroke="#ca8a04" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`,
    6,
    20,
    'crosshair'
  ),
  rect: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="5" width="14" height="14" rx="1" stroke="#3b82f6" stroke-width="2" stroke-dasharray="3 2"/>
      <path d="M5 5h14v14H5z" fill="#3b82f622"/>
    </svg>`,
    12,
    12,
    'crosshair'
  ),
  circle: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="3 2" fill="#8b5cf622"/>
    </svg>`,
    12,
    12,
    'crosshair'
  ),
  line: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <line x1="5" y1="19" x2="19" y2="5" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="5" cy="19" r="2" fill="#3b82f6"/>
      <circle cx="19" cy="5" r="2" fill="#3b82f6"/>
    </svg>`,
    12,
    12,
    'crosshair'
  ),
  arrow: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 19L19 5M19 5h-8M19 5v8" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    12,
    12,
    'crosshair'
  ),
  sticky: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
      <line x1="8" y1="10" x2="16" y2="10" stroke="#713f12" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <line x1="8" y1="14" x2="14" y2="14" stroke="#713f12" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
      <path d="M4 4l4-2 2 4-4 2z" fill="#fde047" stroke="#ca8a04" stroke-width="0.8"/>
    </svg>`,
    12,
    12,
    'copy'
  ),
  image: svgCursor(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#3b82f6" stroke-width="1.8"/>
      <circle cx="8.5" cy="10.5" r="2" fill="#3b82f6"/>
      <path d="M3 16l5-4 4 3 3-2 6 5" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M18 3v4M16 5h4" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`,
    12,
    12,
    'copy'
  ),
};

export function getWorkspaceToolCursor(tool: WorkspaceTool, opts?: { drawing?: boolean; panning?: boolean }): string {
  if (tool === 'hand') {
    return opts?.panning ? 'grabbing' : 'grab';
  }
  if ((tool === 'pen' || tool === 'highlighter') && opts?.drawing) {
    return 'crosshair';
  }
  return CURSORS[tool];
}

export function isPlacementTool(tool: WorkspaceTool): boolean {
  return tool !== 'select' && tool !== 'hand';
}
