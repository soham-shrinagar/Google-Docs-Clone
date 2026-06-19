import { useEditorStore } from '../../store';
import { format } from 'date-fns';
import { X, GitBranch, Clock } from 'lucide-react';
import type { DocumentVersion, DocumentOperation } from '../../types';

interface VersionHistoryPanelProps {
  versions: DocumentVersion[];
  operations: DocumentOperation[];
  onRestore: (versionId: string) => void;
  onReconstruct: (timestamp: string) => void;
  onClose: () => void;
}

export function VersionHistoryPanel({
  versions,
  operations,
  onRestore,
  onReconstruct,
  onClose,
}: VersionHistoryPanelProps) {
  const timeline = [
    ...versions.map((v) => ({
      id: v.id,
      type: 'version' as const,
      label: v.label || `Version ${v.versionNum}`,
      user: v.user.name,
      timestamp: v.createdAt,
    })),
    ...operations.slice(-20).map((op) => ({
      id: op.id,
      type: 'operation' as const,
      label: op.operationType,
      user: op.user.name,
      timestamp: op.createdAt,
      lamportTs: op.lamportTs,
      vectorClock: op.vectorClock,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-brand-600" />
          <h2 className="font-semibold">Version History</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          {timeline.map((item) => (
            <div key={item.id} className="relative pl-10 pb-6">
              <div className="absolute left-2.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-white" />
              <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Clock size={12} />
                  {format(new Date(item.timestamp), 'h:mm a · MMM d, yyyy')}
                </div>
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 mt-1">by {item.user}</p>
                {'lamportTs' in item && item.lamportTs && (
                  <p className="text-xs text-gray-400 mt-1 font-mono">
                    Lamport: {item.lamportTs}
                  </p>
                )}
                {item.type === 'version' && (
                  <button
                    onClick={() => onRestore(item.id)}
                    className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Restore this version
                  </button>
                )}
                {item.type === 'operation' && (
                  <button
                    onClick={() => onReconstruct(item.timestamp)}
                    className="mt-2 text-xs text-gray-600 hover:text-gray-800 font-medium"
                  >
                    View at this point
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
