export const PAGE_ZOOM_OPTIONS = [
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '90', label: '90%' },
  { value: '100', label: '100%' },
  { value: '125', label: '125%' },
  { value: '150', label: '150%' },
  { value: '200', label: '200%' },
  { value: 'fit-width', label: 'Fit to width' },
  { value: 'fit-height', label: 'Fit to height' },
] as const;

export type PageZoomMode = (typeof PAGE_ZOOM_OPTIONS)[number]['value'];

export const PAGE_WIDTH_PX = 816;
export const PAGE_MIN_HEIGHT_PX = 1056;

export function zoomModeLabel(mode: PageZoomMode): string {
  return PAGE_ZOOM_OPTIONS.find((o) => o.value === mode)?.label ?? '100%';
}

export function resolvePageScale(
  mode: PageZoomMode,
  containerWidth: number,
  containerHeight: number
): number {
  const pad = 48;
  if (mode === 'fit-width') {
    return Math.min(2, Math.max(0.25, (containerWidth - pad) / PAGE_WIDTH_PX));
  }
  if (mode === 'fit-height') {
    return Math.min(2, Math.max(0.25, (containerHeight - pad) / PAGE_MIN_HEIGHT_PX));
  }
  return Math.min(2, Math.max(0.25, parseInt(mode, 10) / 100));
}
