import { useAnalytics } from '../../hooks/useApi';
import { useEditorStore } from '../../store';
import { X, Activity, Users, Zap, Clock, Database, Server } from 'lucide-react';

export function AnalyticsPanel() {
  const { data: metrics } = useAnalytics();
  const { toggleAnalytics } = useEditorStore();

  if (!metrics) return null;

  const items = [
    { icon: Users, label: 'Connected Users', value: metrics.connectedUsers },
    { icon: Activity, label: 'Documents Open', value: metrics.documentsOpen },
    { icon: Zap, label: 'Ops / Second', value: metrics.operationsPerSecond },
    { icon: Server, label: 'CRDT Merges', value: metrics.crdtMergeCount },
    { icon: Clock, label: 'WS Latency', value: `${metrics.wsLatency}ms` },
    { icon: Clock, label: 'Sync Time', value: `${metrics.syncTime}ms` },
    { icon: Clock, label: 'Avg Merge Time', value: `${metrics.avgMergeTime}ms` },
    { icon: Users, label: 'Active Sessions', value: metrics.activeSessions },
    { icon: Database, label: 'Memory (Heap)', value: `${metrics.memoryUsage.heapUsed}MB` },
    { icon: Server, label: 'Server Uptime', value: `${Math.floor(metrics.serverUptime / 60)}m` },
    { icon: Zap, label: 'Total Operations', value: metrics.totalOperations },
  ];

  return (
    <div className="fixed bottom-20 left-4 w-72 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-brand-600" />
          <h3 className="font-semibold text-sm">Analytics</h3>
        </div>
        <button onClick={toggleAnalytics} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} />
        </button>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
              <item.icon size={12} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
