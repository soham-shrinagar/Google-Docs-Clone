import { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import { X, Sparkles, Loader2, MessageSquare, BarChart3, FileText, Wand2 } from 'lucide-react';
import clsx from 'clsx';
import { api } from '../../lib/api';
import {
  REWRITE_ACTIONS,
  SUMMARY_FORMATS,
  type AiRewriteAction,
  type SummaryFormat,
} from '../../lib/aiTypes';
import { computeDocumentStats } from '../../lib/exportDocument';

type Tab = 'rewrite' | 'summarize' | 'chat' | 'insights';

interface AiAssistPanelProps {
  editor: Editor | null;
  documentId: string;
  onClose: () => void;
  initialTab?: Tab;
  initialSelection?: string;
  initialAction?: AiRewriteAction;
}

export function AiAssistPanel({
  editor,
  documentId,
  onClose,
  initialTab = 'rewrite',
  initialSelection = '',
  initialAction,
}: AiAssistPanelProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [original, setOriginal] = useState(initialSelection);
  const [suggestion, setSuggestion] = useState('');
  const [rewriteId, setRewriteId] = useState<string | null>(null);

  const [summary, setSummary] = useState('');
  const [summaryFormat, setSummaryFormat] = useState<SummaryFormat>('BRIEF');

  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);

  const [insights, setInsights] = useState<Record<string, unknown> | null>(null);
  const ranInitialAction = useRef(false);

  const getSelectionOrDoc = () => {
    if (!editor) return '';
    const { from, to } = editor.state.selection;
    if (from !== to) return editor.state.doc.textBetween(from, to, ' ');
    return editor.getText();
  };

  const runRewrite = async (action: AiRewriteAction) => {
    const text = getSelectionOrDoc();
    if (!text.trim()) {
      setError('Select text or add content first');
      return;
    }
    setLoading(true);
    setError(null);
    setOriginal(text);
    try {
      const res = await api.aiRewrite(documentId, { text, action });
      setSuggestion(res.result);
      setRewriteId(res.rewriteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI rewrite failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialAction && !ranInitialAction.current && editor) {
      ranInitialAction.current = true;
      setTab('rewrite');
      void runRewrite(initialAction);
    }
  }, [initialAction, editor]);

  const applySuggestion = async (mode: 'replace' | 'below' | 'copy', accepted: boolean) => {
    if (!editor || !suggestion) return;
    if (mode === 'copy') {
      await navigator.clipboard.writeText(suggestion);
    } else if (mode === 'below') {
      editor.chain().focus().insertContent(`<p>${suggestion}</p>`).run();
    } else {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.chain().focus().deleteRange({ from, to }).insertContent(suggestion).run();
      } else {
        editor.chain().focus().insertContent(suggestion).run();
      }
    }
    if (rewriteId) await api.aiRewriteOutcome(documentId, rewriteId, accepted);
    setSuggestion('');
    setRewriteId(null);
  };

  const runSummarize = async () => {
    const text = getSelectionOrDoc();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.aiSummarize(documentId, { text, format: summaryFormat });
      setSummary(res.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Summarize failed');
    } finally {
      setLoading(false);
    }
  };

  const runChat = async () => {
    if (!editor || !question.trim()) return;
    setLoading(true);
    setError(null);
    const q = question.trim();
    setQuestion('');
    setChatHistory((h) => [...h, { role: 'user', content: q }]);
    try {
      const res = await api.aiChat(documentId, {
        question: q,
        documentText: editor.getText(),
        history: chatHistory,
      });
      setChatHistory((h) => [...h, { role: 'assistant', content: res.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chat failed');
    } finally {
      setLoading(false);
    }
  };

  const runInsights = async () => {
    if (!editor) return;
    const text = editor.getText();
    setLoading(true);
    setError(null);
    try {
      const stats = computeDocumentStats(text);
      const html = editor.getHTML();
      const structure = {
        headings: (html.match(/<h[1-6]/g) || []).length,
        paragraphs: stats.paragraphs,
        lists: (html.match(/<ul|<ol/g) || []).length,
        tables: (html.match(/<table/g) || []).length,
        images: (html.match(/<img/g) || []).length,
        links: (html.match(/<a /g) || []).length,
      };
      const res = await api.aiInsights(documentId, { text, structure });
      setInsights({ ...stats, structure, ...(res.insights as object) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Insights failed');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Sparkles }[] = [
    { id: 'rewrite', label: 'Rewrite', icon: Wand2 },
    { id: 'summarize', label: 'Summarize', icon: FileText },
    { id: 'chat', label: 'Ask AI', icon: MessageSquare },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <aside className="w-80 border-l border-line bg-paper flex flex-col shrink-0 animate-fade-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent" />
          <h2 className="font-semibold text-ink">AI Assistant</h2>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface text-muted">
          <X size={18} />
        </button>
      </div>

      <div className="flex border-b border-line overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors',
              tab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
            )}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scroll-panel p-4 space-y-4">
        {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" /> Working…
          </div>
        )}

        {tab === 'rewrite' && (
          <>
            <p className="text-xs text-muted">Select text or use the full document.</p>
            <div className="space-y-1">
              {REWRITE_ACTIONS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={loading}
                  onClick={() => runRewrite(a.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-accent-soft hover:text-accent transition-colors"
                >
                  {a.label}
                </button>
              ))}
            </div>
            {original && suggestion && (
              <div className="space-y-3 pt-2 border-t border-line">
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted mb-1">Original</p>
                  <p className="text-xs text-ink bg-surface rounded-lg p-2 max-h-24 overflow-y-auto">{original}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase text-muted mb-1">Suggestion</p>
                  <p className="text-xs text-ink bg-accent-soft/40 rounded-lg p-2 max-h-32 overflow-y-auto">{suggestion}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => applySuggestion('replace', true)} className="btn-primary !py-1.5 !px-3 !text-xs">Replace</button>
                  <button type="button" onClick={() => applySuggestion('below', true)} className="btn-secondary !py-1.5 !px-3 !text-xs">Insert below</button>
                  <button type="button" onClick={() => applySuggestion('copy', false)} className="btn-ghost !py-1.5 !px-3 !text-xs">Copy</button>
                  <button type="button" onClick={() => { setSuggestion(''); if (rewriteId) void api.aiRewriteOutcome(documentId, rewriteId, false); }} className="btn-ghost !py-1.5 !px-3 !text-xs">Reject</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'summarize' && (
          <>
            <select value={summaryFormat} onChange={(e) => setSummaryFormat(e.target.value as SummaryFormat)} className="input-field !text-sm">
              {SUMMARY_FORMATS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <button type="button" disabled={loading} onClick={runSummarize} className="btn-primary w-full !text-sm">
              Generate summary
            </button>
            {summary && (
              <div className="text-sm text-ink bg-surface rounded-xl p-3 whitespace-pre-wrap">{summary}</div>
            )}
          </>
        )}

        {tab === 'chat' && (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {chatHistory.map((m, i) => (
                <div key={i} className={clsx('text-xs rounded-lg p-2', m.role === 'user' ? 'bg-accent-soft ml-4' : 'bg-surface mr-4')}>
                  {m.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runChat()}
                placeholder="Ask about this document…"
                className="input-field flex-1 !text-sm"
              />
              <button type="button" disabled={loading} onClick={runChat} className="btn-primary !px-3">Send</button>
            </div>
          </>
        )}

        {tab === 'insights' && (
          <>
            <button type="button" disabled={loading} onClick={runInsights} className="btn-primary w-full !text-sm">
              Analyze document
            </button>
            {insights && (
              <div className="space-y-2 text-sm">
                {Object.entries(insights).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-line/50 pb-1">
                    <span className="text-muted capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="text-ink font-medium text-right">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}
