import { useEditorStore } from '../../store';
import { X, Wifi, WifiOff, Gauge } from 'lucide-react';

export function NetworkSimulatorPanel() {
  const { networkSim, updateNetworkSim, toggleNetworkSim } = useEditorStore();

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Gauge size={18} className="text-orange-500" />
          <h3 className="font-semibold text-sm">Network Simulator</h3>
        </div>
        <button onClick={toggleNetworkSim} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600 flex justify-between">
            <span>Latency</span>
            <span>{networkSim.latency}ms</span>
          </label>
          <input
            type="range"
            min={0}
            max={5000}
            step={100}
            value={networkSim.latency}
            onChange={(e) => updateNetworkSim({ latency: Number(e.target.value) })}
            className="w-full mt-1 accent-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 flex justify-between">
            <span>Packet Loss</span>
            <span>{networkSim.packetLoss}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={networkSim.packetLoss}
            onChange={(e) => updateNetworkSim({ packetLoss: Number(e.target.value) })}
            className="w-full mt-1 accent-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 flex justify-between">
            <span>Bandwidth Limit</span>
            <span>{networkSim.bandwidth === 0 ? 'Unlimited' : `${networkSim.bandwidth} KB/s`}</span>
          </label>
          <input
            type="range"
            min={0}
            max={1000}
            step={50}
            value={networkSim.bandwidth}
            onChange={(e) => updateNetworkSim({ bandwidth: Number(e.target.value) })}
            className="w-full mt-1 accent-brand-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => updateNetworkSim({ disconnected: true })}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100"
          >
            <WifiOff size={16} /> Disconnect
          </button>
          <button
            onClick={() => updateNetworkSim({ disconnected: false })}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100"
          >
            <Wifi size={16} /> Reconnect
          </button>
        </div>

        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
          Simulate network conditions to observe CRDT merge behavior and offline-first synchronization.
        </p>
      </div>
    </div>
  );
}
