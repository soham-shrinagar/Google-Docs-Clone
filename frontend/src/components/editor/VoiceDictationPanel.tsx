import clsx from 'clsx';
import { Mic, MicOff, Loader2, AlertCircle, Check } from 'lucide-react';
import type { DictationInsertMode, DictationState } from '../../lib/aiTypes';
import { DICTATION_LANGUAGES } from '../../lib/aiTypes';

interface VoiceDictationPanelProps {
  state: DictationState;
  transcript: string;
  interim: string;
  error: string | null;
  language: string;
  insertMode: DictationInsertMode;
  onLanguageChange: (lang: string) => void;
  onInsertModeChange: (mode: DictationInsertMode) => void;
  onStart: () => void;
  onStop: () => void;
  onClose: () => void;
}

export function VoiceDictationPanel({
  state,
  transcript,
  interim,
  error,
  language,
  insertMode,
  onLanguageChange,
  onInsertModeChange,
  onStart,
  onStop,
  onClose,
}: VoiceDictationPanelProps) {
  const live = `${transcript}${interim}`;
  const listening = state === 'listening';

  return (
    <div className="border-b border-line bg-surface/80 px-4 py-3 animate-fade-up">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={clsx('p-2 rounded-xl', listening ? 'bg-red-100 text-red-600' : 'bg-accent-soft text-accent')}>
            {state === 'processing' ? <Loader2 size={18} className="animate-spin" /> : listening ? <Mic size={18} className="animate-pulse" /> : <MicOff size={18} />}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Voice dictation</p>
            <p className="text-xs text-muted capitalize">{state === 'idle' ? 'Ready' : state}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!listening ? (
            <button type="button" onClick={onStart} className="btn-primary !py-1.5 !px-3 !text-xs">Start</button>
          ) : (
            <button type="button" onClick={onStop} className="btn-secondary !py-1.5 !px-3 !text-xs !border-red-200 !text-red-600">Stop</button>
          )}
          <button type="button" onClick={onClose} className="btn-ghost !py-1.5 !px-2 text-xs">Close</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <select value={language} onChange={(e) => onLanguageChange(e.target.value)} className="input-field !py-1.5 !text-xs w-auto">
          {DICTATION_LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
        <select value={insertMode} onChange={(e) => onInsertModeChange(e.target.value as DictationInsertMode)} className="input-field !py-1.5 !text-xs w-auto">
          <option value="cursor">Insert at cursor</option>
          <option value="append">Append to end</option>
          <option value="replace">Replace selection</option>
        </select>
      </div>

      {listening && (
        <div className="flex items-end gap-1 h-8 mb-2">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="w-1 bg-accent rounded-full animate-pulse"
              style={{ height: `${8 + Math.random() * 20}px`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-line bg-paper p-3 min-h-[4rem] text-sm text-ink">
        {live ? (
          <>
            <span>{transcript}</span>
            {interim && <span className="text-muted">{interim}</span>}
          </>
        ) : (
          <span className="text-muted">Transcript will appear here as you speak…</span>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 mt-2">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      {state === 'completed' && (
        <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-2">
          <Check size={14} /> Inserted into document
        </p>
      )}
    </div>
  );
}
