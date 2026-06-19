import { prisma } from '../lib/prisma.js';

export class PresenceService {
  async updatePresence(
    userId: string,
    documentId: string,
    data: {
      cursorPos?: { anchor: number; head: number };
      selection?: { from: number; to: number };
      isTyping?: boolean;
      isOnline?: boolean;
    }
  ) {
    return prisma.userPresence.upsert({
      where: { userId_documentId: { userId, documentId } },
      create: {
        userId,
        documentId,
        cursorPos: data.cursorPos || {},
        selection: data.selection || {},
        isTyping: data.isTyping ?? false,
        isOnline: data.isOnline ?? true,
        lastActive: new Date(),
      },
      update: {
        ...data,
        lastActive: new Date(),
      },
    });
  }

  async getDocumentPresence(documentId: string) {
    const presence = await prisma.userPresence.findMany({
      where: { documentId, isOnline: true },
      include: {
        user: { select: { id: true, name: true, avatar: true, color: true } },
      },
    });

    return presence.map((p) => ({
      userId: p.user.id,
      name: p.user.name,
      avatar: p.user.avatar,
      color: p.user.color,
      cursorPos: p.cursorPos,
      selection: p.selection,
      isTyping: p.isTyping,
      isOnline: p.isOnline,
      lastActive: p.lastActive,
    }));
  }

  async setOffline(userId: string, documentId: string) {
    await prisma.userPresence.updateMany({
      where: { userId, documentId },
      data: { isOnline: false, isTyping: false, lastActive: new Date() },
    });
  }

  async createSession(userId: string, socketId: string, documentId?: string) {
    return prisma.activeSession.create({
      data: { userId, socketId, documentId },
    });
  }

  async removeSession(socketId: string) {
    await prisma.activeSession.deleteMany({ where: { socketId } });
  }

  async updateSessionActivity(socketId: string) {
    await prisma.activeSession.updateMany({
      where: { socketId },
      data: { lastActive: new Date() },
    });
  }
}

export const presenceService = new PresenceService();
