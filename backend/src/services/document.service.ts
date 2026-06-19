import { PermissionRole, ActivityType, Prisma, NotificationType } from '../lib/prisma.js';
import { prisma } from '../lib/prisma.js';
import { generateShareToken } from '../utils/helpers.js';
import { getTemplate } from '../data/templates.js';
import { getTemplateContent } from '../data/templateContent.js';
import { notificationService } from './notification.service.js';

export interface CreateDocumentOptions {
  title?: string;
  templateId?: string;
  seedContent?: Record<string, unknown> | null;
}

export interface DocumentFilters {
  search?: string;
  sortBy?: 'updatedAt' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  pinnedOnly?: boolean;
}

export class DocumentService {
  async create(userId: string, options: CreateDocumentOptions = {}) {
    const template = options.templateId ? getTemplate(options.templateId) : undefined;
    const title = options.title || template?.title || 'Untitled Document';
    const seedContent =
      options.seedContent ??
      (template && template.id !== 'blank' ? getTemplateContent(template.id) : null);

    const document = await prisma.document.create({
      data: {
        title,
        ownerId: userId,
        thumbnail: template?.thumbnail ?? null,
        seedContent: seedContent ? (seedContent as Prisma.InputJsonValue) : undefined,
        permissions: {
          create: { userId, role: PermissionRole.OWNER },
        },
      },
      include: this.includeRelations(),
    });

    await this.logActivity(userId, document.id, ActivityType.CREATED, {
      templateId: template?.id,
    });

    const formatted = this.formatDocument(document, userId);
    return { document: formatted };
  }

  async list(userId: string, filters: DocumentFilters = {}) {
    const { search, sortBy = 'updatedAt', sortOrder = 'desc', pinnedOnly } = filters;

    const pinnedIds = await prisma.pinnedDocument.findMany({
      where: { userId },
      select: { documentId: true },
    });
    const pinnedSet = new Set(pinnedIds.map((p) => p.documentId));

    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { permissions: { some: { userId } } },
        ],
        ...(search && {
          title: { contains: search, mode: 'insensitive' as const },
        }),
        ...(pinnedOnly && { id: { in: [...pinnedSet] } }),
      },
      include: this.includeRelations(),
      orderBy: { [sortBy]: sortOrder },
    });

    return documents.map((doc) => this.formatDocument(doc, userId, pinnedSet.has(doc.id)));
  }

  async getById(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: this.includeRelations(),
    });

    if (!document) throw new Error('Document not found');
    return this.formatDocument(document, userId);
  }

  async update(documentId: string, userId: string, data: { title?: string }) {
    const document = await prisma.document.update({
      where: { id: documentId },
      data,
      include: this.includeRelations(),
    });

    if (data.title) {
      await this.logActivity(userId, documentId, ActivityType.RENAMED, { title: data.title });
    }

    return this.formatDocument(document, userId);
  }

  async delete(documentId: string, userId: string) {
    await this.logActivity(userId, documentId, ActivityType.DELETED);
    await prisma.document.delete({ where: { id: documentId } });
  }

  async share(documentId: string, userId: string, email: string, role: PermissionRole) {
    const normalizedEmail = email.trim().toLowerCase();
    const targetUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (!targetUser) {
      throw new Error(
        `${normalizedEmail} is not registered yet. Use "Copy share link" instead, or ask them to sign up first.`
      );
    }
    if (targetUser.id === userId) {
      throw new Error('You cannot share a document with yourself');
    }
    if (role === PermissionRole.OWNER) {
      throw new Error('Cannot assign owner role to collaborators');
    }

    const permission = await prisma.documentPermission.upsert({
      where: { documentId_userId: { documentId, userId: targetUser.id } },
      create: { documentId, userId: targetUser.id, role, shareToken: generateShareToken() },
      update: { role },
    });

    await notificationService.create(
      targetUser.id,
      NotificationType.DOCUMENT_SHARED,
      'Document shared with you',
      `You were given ${role} access to a document`,
      documentId
    );

    await this.logActivity(userId, documentId, ActivityType.SHARED, { email: normalizedEmail, role });
    return permission;
  }

  async createShareLink(documentId: string, userId: string) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) throw new Error('Document not found');
    if (document.ownerId !== userId) throw new Error('Only the owner can create share links');

    const token = generateShareToken();

    await prisma.documentPermission.upsert({
      where: { documentId_userId: { documentId, userId: document.ownerId } },
      create: { documentId, userId: document.ownerId, role: PermissionRole.OWNER, shareToken: token },
      update: { shareToken: token },
    });

    return { token };
  }

  async joinByShareToken(token: string, userId: string) {
    const permission = await prisma.documentPermission.findFirst({
      where: { shareToken: token },
    });

    if (!permission) throw new Error('Invalid or expired share link');

    if (permission.documentId && permission.userId !== userId) {
      await prisma.documentPermission.upsert({
        where: { documentId_userId: { documentId: permission.documentId, userId } },
        create: {
          documentId: permission.documentId,
          userId,
          role: PermissionRole.EDITOR,
        },
        update: {},
      });
    }

    await this.logActivity(userId, permission.documentId, ActivityType.JOINED, { via: 'share_link' });

    return this.getById(permission.documentId, userId);
  }

  async getCollaborators(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true, color: true } },
        permissions: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true, color: true } } },
        },
      },
    });

    if (!document) throw new Error('Document not found');

    const collaborators = [
      { ...document.owner, role: PermissionRole.OWNER },
      ...document.permissions
        .filter((p) => p.userId !== document.ownerId)
        .map((p) => ({ ...p.user, role: p.role })),
    ];

    const ownerPerm = document.permissions.find((p) => p.userId === document.ownerId);
    const shareToken = ownerPerm?.shareToken ?? null;

    return { collaborators, shareToken };
  }

  async togglePin(documentId: string, userId: string) {
    const existing = await prisma.pinnedDocument.findUnique({
      where: { userId_documentId: { userId, documentId } },
    });

    if (existing) {
      await prisma.pinnedDocument.delete({ where: { id: existing.id } });
      return { pinned: false };
    }

    await prisma.pinnedDocument.create({ data: { userId, documentId } });
    return { pinned: true };
  }

  async recordOpen(documentId: string, userId: string) {
    await prisma.recentlyOpened.upsert({
      where: { userId_documentId: { userId, documentId } },
      create: { userId, documentId },
      update: { openedAt: new Date() },
    });
  }

  async getRecentlyOpened(userId: string, limit = 10) {
    const recent = await prisma.recentlyOpened.findMany({
      where: { userId },
      orderBy: { openedAt: 'desc' },
      take: limit,
      include: { document: { include: this.includeRelations() } },
    });

    return recent.map((r) => this.formatDocument(r.document, userId));
  }

  private includeRelations() {
    return {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      permissions: {
        include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
      },
      activities: {
        orderBy: { createdAt: 'desc' as const },
        take: 3,
        include: { user: { select: { id: true, name: true } } },
      },
      _count: { select: { permissions: true, operations: true } },
    };
  }

  private formatDocument(
    doc: {
      id: string;
      title: string;
      thumbnail: string | null;
      ownerId: string;
      seedContent?: Prisma.JsonValue | null;
      createdAt: Date;
      updatedAt: Date;
      owner: { id: string; name: string; email: string; avatar: string | null };
      permissions: Array<{
        role: PermissionRole;
        user: { id: string; name: string; email: string; avatar: string | null };
      }>;
      activities: Array<{ type: ActivityType; createdAt: Date; user: { id: string; name: string } }>;
      _count: { permissions: number; operations: number };
    },
    userId: string,
    isPinned = false
  ) {
    const userPermission = doc.ownerId === userId
      ? PermissionRole.OWNER
      : doc.permissions.find((p) => p.user.id === userId)?.role || PermissionRole.VIEWER;

    return {
      id: doc.id,
      title: doc.title,
      thumbnail: doc.thumbnail,
      owner: doc.owner,
      collaboratorCount: doc._count.permissions,
      operationCount: doc._count.operations,
      seedContent: doc._count.operations === 0 && doc.seedContent ? doc.seedContent : null,
      permission: userPermission,
      isPinned,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      recentActivity: doc.activities,
    };
  }

  private async logActivity(
    userId: string,
    documentId: string,
    type: ActivityType,
    metadata?: Prisma.InputJsonValue
  ) {
    await prisma.activityLog.create({
      data: { userId, documentId, type, metadata: metadata ?? {} },
    });
  }
}

export const documentService = new DocumentService();
