import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Wand2, Mic, MessageSquare, FileText,
  CheckCircle2, XCircle, TrendingUp, Loader2, BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { format, parseISO } from 'date-fns';
import { Navbar } from '../components/layout/Navbar';
import { api } from '../lib/api';

interface UsageTotals {
  rewriteCount: number;
  grammarFixCount: number;
  dictationCount: number;
  summarizeCount: number;
  chatCount: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
}

interface DailyStat {
  date: string;
  rewriteCount: number;
  grammarFixCount: number;
  dictationCount: number;
  summarizeCount: number;
  chatCount: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
}

interface RecentRequest {
  id: string;
  type: string;
  action: string | null;
  status: string;
  createdAt: string;
  documentId: string | null;
}

const STAT_CARDS = [
  { key: 'rewriteCount' as const, label: 'Rewrites', icon: Wand2, color: 'from-indigo-500 to-violet-600' },
  { key: 'grammarFixCount' as const, label: 'Grammar checks', icon: CheckCircle2, color: 'from-blue-500 to-cyan-600' },
  { key: 'dictationCount' as const, label: 'Dictation sessions', icon: Mic, color: 'from-rose-500 to-pink-600' },
  { key: 'summarizeCount' as const, label: 'Summaries', icon: FileText, color: 'from-emerald-500 to-teal-600' },
  { key: 'chatCount' as const, label: 'AI chat', icon: MessageSquare, color: 'from-amber-500 to-orange-600' },
];

const TYPE_LABELS: Record<string, string> = {
  REWRITE: 'Rewrite',
  GRAMMAR: 'Grammar',
  SUMMARIZE: 'Summarize',
  CHAT: 'Chat',
  INSIGHTS: 'Insights',
  SPEECH: 'Speech',
  VOICE_COMMAND: 'Voice command',
  SPELL_CHECK: 'Spell check',
};

export function AiAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<UsageTotals | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [recent, setRecent] = useState<RecentRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api.aiUsageStats().then((data) => {
      setTotals(data.totals as unknown as UsageTotals);
      setDaily(data.daily as unknown as DailyStat[]);
      setRecent(data.recentRequests as RecentRequest[]);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    }).finally(() => setLoading(false));
  }, []);

  const totalActions = totals
    ? totals.rewriteCount + totals.grammarFixCount + totals.dictationCount + totals.summarizeCount + totals.chatCount
    : 0;

  const acceptRate = totals && (totals.acceptedSuggestions + totals.rejectedSuggestions) > 0
    ? Math.round((totals.acceptedSuggestions / (totals.acceptedSuggestions + totals.rejectedSuggestions)) * 100)
    : null;

  const maxDaily = Math.max(...daily.map((d) =>
    d.rewriteCount + d.grammarFixCount + d.dictationCount + d.summarizeCount + d.chatCount
  ), 1);

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 animate-fade-up">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="btn-ghost !p-2 shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={22} className="text-accent" />
              <h1 className="text-2xl font-bold text-ink tracking-tight">AI Analytics</h1>
            </div>
            <p className="text-sm text-muted mt-0.5">Your AI productivity activity over the last 30 days</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24 text-muted gap-2">
            <Loader2 size={20} className="animate-spin" /> Loading analytics…
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-line bg-paper p-6 text-center text-red-600">{error}</div>
        )}

        {!loading && totals && (
          <div className="space-y-8">
            {/* Hero stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 rounded-2xl hero-banner text-paper p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-[0.06]" />
                <div className="relative">
                  <p className="text-sm font-medium text-white/70">Total AI actions</p>
                  <p className="text-4xl font-bold mt-1">{totalActions}</p>
                  {acceptRate !== null && (
                    <p className="text-sm text-white/80 mt-3 flex items-center gap-1.5">
                      <TrendingUp size={14} /> {acceptRate}% suggestion acceptance
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-1 lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STAT_CARDS.map((card) => (
                  <div key={card.key} className="rounded-2xl bg-paper border border-line p-4 card-hover">
                    <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-white mb-3 bg-gradient-to-br', card.color)}>
                      <card.icon size={18} />
                    </div>
                    <p className="text-2xl font-bold text-ink">{totals[card.key]}</p>
                    <p className="text-xs text-muted mt-0.5">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Acceptance + chart */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-paper border border-line p-6">
                <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-accent" /> Suggestion outcomes
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500" /> Accepted</span>
                      <span className="font-semibold text-ink">{totals.acceptedSuggestions}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                        style={{
                          width: `${Math.max(4, (totals.acceptedSuggestions / Math.max(totals.acceptedSuggestions + totals.rejectedSuggestions, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted flex items-center gap-1.5"><XCircle size={14} className="text-red-400" /> Rejected</span>
                      <span className="font-semibold text-ink">{totals.rejectedSuggestions}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-300 to-red-500 transition-all duration-700"
                        style={{
                          width: `${Math.max(4, (totals.rejectedSuggestions / Math.max(totals.acceptedSuggestions + totals.rejectedSuggestions, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-paper border border-line p-6">
                <h2 className="font-semibold text-ink mb-4">Daily activity</h2>
                {daily.length === 0 ? (
                  <p className="text-sm text-muted py-8 text-center">No activity yet — start using AI features in your documents.</p>
                ) : (
                  <div className="flex items-end gap-1 h-32">
                    {daily.slice(-14).map((d) => {
                      const count = d.rewriteCount + d.grammarFixCount + d.dictationCount + d.summarizeCount + d.chatCount;
                      const height = Math.max(4, (count / maxDaily) * 100);
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group" title={`${format(parseISO(String(d.date).slice(0, 10)), 'MMM d')}: ${count} actions`}>
                          <div
                            className="w-full rounded-t-md bg-gradient-to-t from-accent-deep to-accent opacity-80 group-hover:opacity-100 transition-all"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[9px] text-muted truncate w-full text-center">
                            {format(parseISO(String(d.date).slice(0, 10)), 'd')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent requests */}
            <div className="rounded-2xl bg-paper border border-line overflow-hidden">
              <div className="px-6 py-4 border-b border-line">
                <h2 className="font-semibold text-ink">Recent AI requests</h2>
              </div>
              {recent.length === 0 ? (
                <p className="text-sm text-muted p-8 text-center">No requests recorded yet.</p>
              ) : (
                <div className="divide-y divide-line/60">
                  {recent.map((r) => (
                    <div key={r.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-surface/50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                        <Sparkles size={14} className="text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-ink">
                          {TYPE_LABELS[r.type] ?? r.type}
                          {r.action && <span className="text-muted font-normal"> · {r.action}</span>}
                        </p>
                        <p className="text-xs text-muted">{format(new Date(r.createdAt), 'MMM d, yyyy · h:mm a')}</p>
                      </div>
                      <span className={clsx(
                        'text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                        r.status === 'COMPLETED' ? 'badge-success' :
                        r.status === 'FAILED' ? 'badge-danger' : 'badge-warn'
                      )}>
                        {r.status.toLowerCase()}
                      </span>
                      {r.documentId && (
                        <Link to={`/document/${r.documentId}`} className="text-xs text-accent hover:underline shrink-0">
                          Open doc
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
