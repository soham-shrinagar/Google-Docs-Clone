const API_BASE = import.meta.env.VITE_API_URL || '';

export function resolveUploadUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}
