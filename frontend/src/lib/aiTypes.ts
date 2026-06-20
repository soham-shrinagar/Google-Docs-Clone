export type AiRewriteAction =
  | 'IMPROVE'
  | 'FIX_GRAMMAR'
  | 'PROFESSIONAL'
  | 'CASUAL'
  | 'SHORTEN'
  | 'EXPAND'
  | 'SIMPLIFY'
  | 'TECHNICAL'
  | 'FORMAL'
  | 'FRIENDLY'
  | 'SUMMARIZE'
  | 'EXPLAIN'
  | 'TRANSLATE';

export type SummaryFormat =
  | 'BRIEF'
  | 'DETAILED'
  | 'BULLETS'
  | 'EXECUTIVE'
  | 'MEETING_NOTES'
  | 'ACTION_ITEMS';

export type DictationInsertMode = 'cursor' | 'append' | 'replace';
export type DictationState = 'idle' | 'listening' | 'processing' | 'error' | 'completed';

export interface SpellIssue {
  word: string;
  from: number;
  to: number;
  type: 'spelling' | 'grammar' | 'style' | 'repeated';
  suggestions: string[];
  message?: string;
}

export interface GrammarIssue {
  original: string;
  suggestion: string;
  explanation?: string;
  type?: string;
}

export const REWRITE_ACTIONS: { id: AiRewriteAction; label: string; group: string }[] = [
  { id: 'IMPROVE', label: 'Improve writing', group: 'Enhance' },
  { id: 'FIX_GRAMMAR', label: 'Fix grammar', group: 'Enhance' },
  { id: 'PROFESSIONAL', label: 'Professional tone', group: 'Tone' },
  { id: 'CASUAL', label: 'Casual tone', group: 'Tone' },
  { id: 'FORMAL', label: 'Formal tone', group: 'Tone' },
  { id: 'FRIENDLY', label: 'Friendly tone', group: 'Tone' },
  { id: 'TECHNICAL', label: 'Make technical', group: 'Tone' },
  { id: 'SHORTEN', label: 'Shorten', group: 'Length' },
  { id: 'EXPAND', label: 'Expand', group: 'Length' },
  { id: 'SIMPLIFY', label: 'Simplify', group: 'Length' },
  { id: 'SUMMARIZE', label: 'Summarize', group: 'Transform' },
  { id: 'EXPLAIN', label: 'Explain', group: 'Transform' },
  { id: 'TRANSLATE', label: 'Translate', group: 'Transform' },
];

export const SUMMARY_FORMATS: { id: SummaryFormat; label: string }[] = [
  { id: 'BRIEF', label: 'Brief summary' },
  { id: 'DETAILED', label: 'Detailed summary' },
  { id: 'BULLETS', label: 'Bullet points' },
  { id: 'EXECUTIVE', label: 'Executive summary' },
  { id: 'MEETING_NOTES', label: 'Meeting notes' },
  { id: 'ACTION_ITEMS', label: 'Action items' },
];

export const DICTATION_LANGUAGES = [
  { id: 'en-US', label: 'English' },
  { id: 'hi-IN', label: 'Hindi' },
  { id: 'mr-IN', label: 'Marathi' },
] as const;
