import { useAnalytics } from '../../hooks/useApi';
import { useEditorStore } from '../../store';
import { X, Activity } from 'lucide-react';

function formatUptime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function AnalyticsPanel() {
  const { data: metrics } = useAnalytics();
  const { toggleAnalytics } = useEditorStore();

  if (!metrics) return null;

  const sections = [
    {
      title: 'Live',
      rows: [
        { label: 'Editors online', value: metrics.connectedUsers },
        { label: 'Documents open', value: metrics.documentsOpen },
        { label: 'Ops / second', value: metrics.operationsPerSecond },
      ],
    },
    {
      title: 'Performance',
      rows: [
        { label: 'WS latency', value: `${metrics.wsLatency} ms` },
        { label: 'Persist time', value: `${metrics.syncTime} ms` },
        { label: 'Merge time', value: `${metrics.avgMergeTime} ms` },
        { label: 'Total merges', value: metrics.crdtMergeCount },
      ],
    },
    {
      title: 'Server',
      rows: [
        { label: 'Total operations', value: metrics.totalOperations },
        { label: 'Memory', value: `${metrics.memoryUsage.heapUsed} MB` },
        { label: 'Uptime', value: formatUptime(metrics.serverUptime) },
      ],
    },
  ];

  return (
    <div className="fixed bottom-16 right-4 w-72 bg-paper border border-line rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-canvas">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-accent" />
          <h3 className="text-sm font-semibold text-ink">Analytics</h3>
        </div>
        <button type="button" onClick={toggleAnalytics} className="p-1 rounded-lg text-muted hover:text-ink hover:bg-paper">
          <X size={16} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="px-4 py-3 border-b border-line/60 last:border-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">{section.title}</p>
            <dl className="space-y-2">
              {section.rows.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <dt className="text-muted">{row.label}</dt>
                  <dd className="font-medium tabular-nums text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
