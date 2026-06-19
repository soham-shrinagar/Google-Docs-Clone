export interface VectorClock {
  [clientId: string]: number;
}

export interface DistributedEvent {
  id: string;
  type: 'insert' | 'delete' | 'format' | 'sync' | 'merge' | 'conflict_resolved';
  userId: string;
  documentId: string;
  timestamp: number;
  lamportTimestamp: number;
  vectorClock: VectorClock;
  payload?: Record<string, unknown>;
  description: string;
}

let lamportClock = 0;

export function tickLamport(): number {
  return ++lamportClock;
}

export function mergeLamport(received: number): number {
  lamportClock = Math.max(lamportClock, received) + 1;
  return lamportClock;
}

export function incrementVectorClock(clock: VectorClock, clientId: string): VectorClock {
  return { ...clock, [clientId]: (clock[clientId] || 0) + 1 };
}

export function mergeVectorClocks(a: VectorClock, b: VectorClock): VectorClock {
  const merged: VectorClock = { ...a };
  for (const [clientId, count] of Object.entries(b)) {
    merged[clientId] = Math.max(merged[clientId] || 0, count);
  }
  return merged;
}

export function compareVectorClocks(a: VectorClock, b: VectorClock): 'before' | 'after' | 'concurrent' {
  let aGreater = false;
  let bGreater = false;

  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const aVal = a[key] || 0;
    const bVal = b[key] || 0;
    if (aVal > bVal) aGreater = true;
    if (bVal > aVal) bGreater = true;
  }

  if (aGreater && !bGreater) return 'after';
  if (bGreater && !aGreater) return 'before';
  return 'concurrent';
}

export function stateVectorToClock(stateVector: Uint8Array): VectorClock {
  const clock: VectorClock = {};
  for (let i = 0; i < stateVector.length; i += 2) {
    const clientId = stateVector[i].toString();
    const count = stateVector[i + 1] || 0;
    clock[clientId] = count;
  }
  return clock;
}
