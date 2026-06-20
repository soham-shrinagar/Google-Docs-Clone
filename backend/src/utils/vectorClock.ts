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

export function stateVectorToClock(stateVector: Uint8Array): VectorClock {
  const clock: VectorClock = {};
  for (let i = 0; i < stateVector.length; i += 2) {
    const clientId = stateVector[i].toString();
    const count = stateVector[i + 1] || 0;
    clock[clientId] = count;
  }
  return clock;
}
