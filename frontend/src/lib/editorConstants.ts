export const FONT_FAMILIES = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Palatino', value: '"Palatino Linotype", Palatino, serif' },
  { label: 'Garamond', value: 'Garamond, serif' },
  { label: 'DM Sans', value: '"DM Sans", system-ui, sans-serif' },
] as const;

export const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'] as const;

export const TEXT_COLORS = [
  '#18181b', '#71717a', '#dc2626', '#ea580c', '#ca8a04', '#16a34a',
  '#2563eb', '#6366f1', '#9333ea', '#db2777', '#0891b2', '#ffffff',
] as const;

export const HIGHLIGHT_COLORS = [
  '#fef08a', '#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8',
  '#fed7aa', '#e5e7eb', '#fca5a5', '#86efac', '#93c5fd', '#c4b5fd',
] as const;

export const PARAGRAPH_STYLES = [
  { label: 'Normal text', value: 'paragraph' },
  { label: 'Title', value: 'title' },
  { label: 'Subtitle', value: 'subtitle' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
  { label: 'Heading 4', value: 'h4' },
  { label: 'Heading 5', value: 'h5' },
  { label: 'Heading 6', value: 'h6' },
] as const;

export const LINE_HEIGHTS = ['1', '1.15', '1.5', '1.75', '2', '2.5', '3'] as const;
