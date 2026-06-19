import * as Y from 'yjs';
import { prisma } from '../lib/prisma.js';
import { mergeLamport, tickLamport, stateVectorToClock } from '../utils/vectorClock.js';
import type { DistributedEvent } from '../utils/vectorClock.js';

const SNAPSHOT_INTERVAL = 50;

export class VersionService {
  private snapshotLocks = new Set<string>();

  async storeOperation(
    documentId: string,
    userId: string,
    update: Uint8Array,
    clientId: string
  ): Promise<DistributedEvent> {
    const lamportTs = BigInt(tickLamport());
    const operationId = crypto.randomUUID();

    const doc = new Y.Doc();
    const existing = await this.getDocumentState(documentId);
    if (existing) Y.applyUpdate(doc, existing);

    const stateVector = Y.encodeStateVector(doc);
    const vectorClock = stateVectorToClock(stateVector);

    await prisma.documentOperation.create({
      data: {
        documentId,
        userId,
        operationId,
        operationType: 'yjs_update',
        payload: Buffer.from(update),
        vectorClock,
        lamportTs,
        clientId,
      },
    });

    const operationCount = await prisma.documentOperation.count({
      where: { documentId },
    });

    if (operationCount % SNAPSHOT_INTERVAL === 0) {
      await this.createSnapshotSafe(documentId, doc);
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { content: Buffer.from(Y.encodeStateAsUpdate(doc)), updatedAt: new Date() },
    });

    return {
      id: operationId,
      type: 'insert',
      userId,
      documentId,
      timestamp: Date.now(),
      lamportTimestamp: Number(lamportTs),
      vectorClock,
      description: `Operation stored (${update.byteLength} bytes)`,
    };
  }

  private async createSnapshotSafe(documentId: string, doc?: Y.Doc) {
    if (this.snapshotLocks.has(documentId)) return;

    this.snapshotLocks.add(documentId);
    try {
      await this.createSnapshot(documentId, doc);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'P2002') return;
      console.error(`Snapshot failed for document ${documentId}:`, err);
    } finally {
      this.snapshotLocks.delete(documentId);
    }
  }

  async createSnapshot(documentId: string, doc?: Y.Doc) {
    if (!doc) {
      doc = new Y.Doc();
      const state = await this.getDocumentState(documentId);
      if (state) Y.applyUpdate(doc, state);
    }

    const data = Y.encodeStateAsUpdate(doc);
    const stateVector = Y.encodeStateVector(doc);

    const snapshot = await prisma.documentSnapshot.create({
      data: {
        documentId,
        data: Buffer.from(data),
        stateVector: Buffer.from(stateVector),
      },
    });

    const maxVersion = await prisma.documentVersion.aggregate({
      where: { documentId },
      _max: { versionNum: true },
    });
    const nextVersion = (maxVersion._max.versionNum ?? 0) + 1;

    const owner = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });

    if (!owner) throw new Error('Document not found');

    await prisma.documentVersion.create({
      data: {
        documentId,
        userId: owner.ownerId,
        versionNum: nextVersion,
        label: `Snapshot v${nextVersion}`,
        snapshotId: snapshot.id,
      },
    });

    return snapshot;
  }

  async getDocumentState(documentId: string): Promise<Uint8Array | null> {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { content: true },
    });
    return document?.content ? new Uint8Array(document.content) : null;
  }

  async getVersionHistory(documentId: string) {
    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNum: 'desc' },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        snapshot: true,
      },
    });

    const operations = await prisma.documentOperation.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, name: true } } },
      take: 500,
    });

    return { versions, operations };
  }

  async restoreVersion(documentId: string, versionId: string, userId: string) {
    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: { snapshot: true },
    });

    if (!version?.snapshot) throw new Error('Version not found');

    await prisma.document.update({
      where: { id: documentId },
      data: { content: version.snapshot.data, updatedAt: new Date() },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        documentId,
        type: 'RESTORED',
        metadata: { versionNum: version.versionNum },
      },
    });

    return new Uint8Array(version.snapshot.data);
  }

  async reconstructAtTimestamp(documentId: string, timestamp: Date): Promise<Uint8Array> {
    const snapshot = await prisma.documentSnapshot.findFirst({
      where: { documentId, createdAt: { lte: timestamp } },
      orderBy: { createdAt: 'desc' },
    });

    const doc = new Y.Doc();
    if (snapshot) {
      Y.applyUpdate(doc, new Uint8Array(snapshot.data));
    }

    const operations = await prisma.documentOperation.findMany({
      where: {
        documentId,
        createdAt: {
          gt: snapshot?.createdAt || new Date(0),
          lte: timestamp,
        },
      },
      orderBy: { lamportTs: 'asc' },
    });

    for (const op of operations) {
      Y.applyUpdate(doc, new Uint8Array(op.payload));
    }

    return Y.encodeStateAsUpdate(doc);
  }

  processIncomingLamport(received: number): number {
    return mergeLamport(received);
  }
}

export const versionService = new VersionService();
