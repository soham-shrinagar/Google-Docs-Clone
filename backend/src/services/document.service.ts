import { PermissionRole, ActivityType, Prisma } from '../lib/prisma.js';
import { prisma } from '../lib/prisma.js';
import { generateShareToken } from '../utils/helpers.js';
import { getTemplate } from '../data/templates.js';

export interface CreateDocumentOptions {
  title?: string;
  templateId?: string;
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

    const document = await prisma.document.create({
      data: {
        title,
        ownerId: userId,
        thumbnail: template?.thumbnail ?? null,
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
    return {
      document: formatted,
      initialHtml: template?.html ?? null,
    };
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
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) throw new Error('User not found');

    const permission = await prisma.documentPermission.upsert({
      where: { documentId_userId: { documentId, userId: targetUser.id } },
      create: { documentId, userId: targetUser.id, role, shareToken: generateShareToken() },
      update: { role },
    });

    await this.logActivity(userId, documentId, ActivityType.SHARED, { email, role });
    return permission;
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
