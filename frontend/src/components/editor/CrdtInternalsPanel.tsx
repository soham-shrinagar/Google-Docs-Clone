import { useEditorStore } from '../../store';
import { format } from 'date-fns';
import { X, Cpu, Merge, ArrowRightLeft } from 'lucide-react';

export function CrdtInternalsPanel() {
  const { crdtEvents, clearCrdtEvents, toggleCrdtInternals } = useEditorStore();

  const typeColors: Record<string, string> = {
    insert: 'bg-green-100 text-green-700',
    delete: 'bg-red-100 text-red-700',
    format: 'bg-purple-100 text-purple-700',
    sync: 'bg-blue-100 text-blue-700',
    merge: 'bg-yellow-100 text-yellow-700',
    conflict_resolved: 'bg-orange-100 text-orange-700',
  };

  const typeIcons: Record<string, typeof Cpu> = {
    merge: Merge,
    sync: ArrowRightLeft,
    conflict_resolved: Merge,
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-gray-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-green-400" />
          <h2 className="font-semibold text-sm">CRDT Internals</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCrdtEvents}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Clear
          </button>
          <button onClick={toggleCrdtInternals} className="p-1 hover:bg-gray-800 rounded">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs">
        {crdtEvents.length === 0 && (
          <p className="text-gray-500 text-center py-8">Edit the document to see CRDT operations...</p>
        )}
        {crdtEvents.map((event) => {
          const Icon = typeIcons[event.type] || Cpu;
          return (
            <div key={event.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={12} />
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${typeColors[event.type]}`}>
                  {event.type}
                </span>
                <span className="text-gray-500 ml-auto">
                  {format(event.timestamp, 'HH:mm:ss.SSS')}
                </span>
              </div>
              <p className="text-gray-300 mb-2">{event.description}</p>
              <div className="space-y-1 text-gray-500">
                <p>ID: <span className="text-gray-400">{event.id.slice(0, 8)}...</span></p>
                <p>User: <span className="text-gray-400">{event.userId.slice(0, 8)}...</span></p>
                <p>Lamport: <span className="text-yellow-400">{event.lamportTimestamp}</span></p>
                {Object.keys(event.vectorClock).length > 0 && (
                  <p>
                    Vector Clock:{' '}
                    <span className="text-cyan-400">
                      {JSON.stringify(event.vectorClock)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
