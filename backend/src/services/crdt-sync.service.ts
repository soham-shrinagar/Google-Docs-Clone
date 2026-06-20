import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import type { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../lib/jwt.js';
import { getUserDocumentRole } from '../middleware/permissions.js';
import { PermissionRole, NotificationType } from '../lib/prisma.js';
import { versionService } from './version.service.js';
import { presenceService } from './presence.service.js';
import { notificationService } from './notification.service.js';

const messageSync = 0;
const messageAwareness = 1;

interface WsClient extends WebSocket {
  isAlive?: boolean;
  socketId?: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  documentId?: string;
}

interface DocRoom {
  doc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  clients: Set<WsClient>;
}

export class CrdtSyncService {
  private rooms = new Map<string, DocRoom>();
  private persistQueues = new Map<string, Promise<void>>();

  private enqueuePersist(documentId: string, task: () => Promise<void>) {
    const previous = this.persistQueues.get(documentId) ?? Promise.resolve();
    const next = previous.then(task).catch((err) => {
      console.error(`Persist queue error for ${documentId}:`, err);
    });
    this.persistQueues.set(documentId, next);
  }

  async getOrCreateRoom(documentId: string): Promise<DocRoom> {
    let room = this.rooms.get(documentId);
    if (!room) {
      const doc = new Y.Doc();
      const state = await versionService.getDocumentState(documentId);
      if (state) Y.applyUpdate(doc, state);

      const awareness = new awarenessProtocol.Awareness(doc);
      room = { doc, awareness, clients: new Set() };
      this.rooms.set(documentId, room);

      doc.on('update', (update: Uint8Array, origin: unknown) => {
        if (origin === 'remote') return;

        const client = [...room!.clients].find((c) => c.userId);
        if (!client?.userId) return;

        this.enqueuePersist(documentId, async () => {
          try {
            await versionService.storeOperation(
              documentId,
              client.userId!,
              update,
              client.userId!
            );
          } catch (err) {
            console.error(`Failed to persist operation for ${documentId}:`, err);
          }
        });
      });
    }
    return room;
  }

  async handleConnection(ws: WsClient, documentId: string, token: string) {
    try {
      const payload = verifyToken(token);
      const role = await getUserDocumentRole(payload.userId, documentId);

      if (!role || role === PermissionRole.VIEWER) {
        ws.close(4003, 'Insufficient permissions');
        return;
      }

      const user = await import('../lib/prisma.js').then((m) =>
        m.prisma.user.findUnique({
          where: { id: payload.userId },
          select: { id: true, name: true, color: true },
        })
      );

      if (!user) {
        ws.close(4001, 'User not found');
        return;
      }

      ws.userId = user.id;
      ws.userName = user.name;
      ws.userColor = user.color;
      ws.documentId = documentId;
      ws.socketId = uuidv4();

      const room = await this.getOrCreateRoom(documentId);
      room.clients.add(ws);

      await presenceService.createSession(user.id, ws.socketId, documentId);
      await presenceService.updatePresence(user.id, documentId, { isOnline: true });

      await notificationService.notifyDocumentCollaborators(
        documentId,
        user.id,
        NotificationType.USER_JOINED,
        'User joined',
        `${user.name} joined the document`
      );

      const syncStart = encoding.createEncoder();
      encoding.writeVarUint(syncStart, messageSync);
      syncProtocol.writeSyncStep1(syncStart, room.doc);
      ws.send(encoding.toUint8Array(syncStart));

      const awarenessStates = room.awareness.getStates();
      if (awarenessStates.size > 0) {
        const awarenessEncoder = encoding.createEncoder();
        encoding.writeVarUint(awarenessEncoder, messageAwareness);
        encoding.writeVarUint8Array(
          awarenessEncoder,
          awarenessProtocol.encodeAwarenessUpdate(room.awareness, Array.from(awarenessStates.keys()))
        );
        ws.send(encoding.toUint8Array(awarenessEncoder));
      }

      room.awareness.setLocalStateField('user', {
        id: user.id,
        name: user.name,
        color: user.color,
      });

      ws.on('message', (data: Buffer) => {
        this.handleMessage(ws, room, new Uint8Array(data));
        presenceService.updateSessionActivity(ws.socketId!);
      });

      ws.on('close', async () => {
        room.clients.delete(ws);
        room.awareness.setLocalState(null);
        await presenceService.setOffline(user.id, documentId);
        await presenceService.removeSession(ws.socketId!);

        await notificationService.notifyDocumentCollaborators(
          documentId,
          user.id,
          NotificationType.USER_LEFT,
          'User left',
          `${user.name} left the document`
        );

        if (room.clients.size === 0) {
          const state = Y.encodeStateAsUpdate(room.doc);
          await import('../lib/prisma.js').then((m) =>
            m.prisma.document.update({
              where: { id: documentId },
              data: { content: Buffer.from(state) },
            })
          );
        }
      });
    } catch {
      ws.close(4001, 'Authentication failed');
    }
  }

  private handleMessage(ws: WsClient, room: DocRoom, data: Uint8Array) {
    const decoder = decoding.createDecoder(data);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, room.doc, ws);
        if (encoding.length(encoder) > 1) {
          ws.send(encoding.toUint8Array(encoder));
        }
        break;
      }
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          room.awareness,
          decoding.readVarUint8Array(decoder),
          ws
        );
        break;
      }
    }
  }

  setupAwarenessForwarding(documentId: string) {
    const room = this.rooms.get(documentId);
    if (!room) return;

    room.awareness.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
      const changedClients = added.concat(updated, removed);
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(room.awareness, changedClients)
      );
      const message = encoding.toUint8Array(encoder);

      room.clients.forEach((client) => {
        if (client.readyState === 1) client.send(message);
      });
    });
  }
}

export const crdtSyncService = new CrdtSyncService();
