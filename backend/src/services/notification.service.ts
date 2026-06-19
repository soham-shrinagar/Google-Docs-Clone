import { NotificationType, Prisma } from '../lib/prisma.js';
import { prisma } from '../lib/prisma.js';

export class NotificationService {
  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    documentId?: string,
    metadata?: Prisma.InputJsonValue
  ) {
    return prisma.notification.create({
      data: { userId, type, title, message, documentId, metadata: metadata ?? {} },
    });
  }

  async notifyDocumentCollaborators(
    documentId: string,
    excludeUserId: string,
    type: NotificationType,
    title: string,
    message: string
  ) {
    const permissions = await prisma.documentPermission.findMany({
      where: { documentId, userId: { not: excludeUserId } },
      select: { userId: true },
    });

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { ownerId: true },
    });

    const userIds = new Set(permissions.map((p) => p.userId));
    if (document?.ownerId && document.ownerId !== excludeUserId) {
      userIds.add(document.ownerId);
    }

    await Promise.all(
      [...userIds].map((userId) =>
        this.create(userId, type, title, message, documentId)
      )
    );
  }

  async list(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: { userId, ...(unreadOnly && { isRead: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
