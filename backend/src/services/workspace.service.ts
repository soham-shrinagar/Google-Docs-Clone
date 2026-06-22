import { ActivityType, DocumentType, PermissionRole, Prisma } from '../lib/prisma.js';
import { prisma } from '../lib/prisma.js';
import { documentService } from './document.service.js';

export interface WorkspacePageSeed {
  id: string;
  width: number;
  height: number;
  backgroundType: 'blank' | 'pdf_page' | 'image';
  backgroundUrl?: string | null;
  backgroundMeta?: Record<string, unknown> | null;
  label?: string | null;
}

export interface WorkspaceElementSeed {
  id: string;
  pageId: string;
  type: string;
  layer: string;
  zIndex: number;
  transform: { x: number; y: number; width: number; height: number; rotation?: number };
  style?: Record<string, unknown> | null;
  data?: Record<string, unknown>;
  locked?: boolean;
  visible?: boolean;
  name?: string | null;
}

export interface WorkspaceSeed {
  pages: WorkspacePageSeed[];
  elements?: WorkspaceElementSeed[];
  sourceAsset?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  };
}

export interface CreateWorkspaceOptions {
  title: string;
  seed: WorkspaceSeed;
}

export class WorkspaceService {
  async create(userId: string, options: CreateWorkspaceOptions) {
    const { title, seed } = options;
    const thumbnail = seed.pages[0]?.backgroundUrl ?? null;

    const document = await prisma.document.create({
      data: {
        title,
        documentType: DocumentType.WORKSPACE,
        thumbnail,
        ownerId: userId,
        workspaceMeta: {
          pageCount: seed.pages.length,
          sourceMime: seed.sourceAsset?.mimeType ?? null,
          sourceName: seed.sourceAsset?.originalName ?? null,
        } as Prisma.InputJsonValue,
        seedContent: { workspace: true, ...seed } as unknown as Prisma.InputJsonValue,
        permissions: { create: { userId, role: PermissionRole.OWNER } },
        ...(seed.sourceAsset && {
          assets: {
            create: {
              filename: seed.sourceAsset.filename,
              originalName: seed.sourceAsset.originalName,
              mimeType: seed.sourceAsset.mimeType,
              size: seed.sourceAsset.size,
              url: seed.sourceAsset.url,
              scanStatus: 'pending',
            },
          },
        }),
        workspacePages: {
          create: seed.pages.map((page, index) => ({
            id: page.id,
            pageIndex: index,
            width: page.width,
            height: page.height,
            backgroundType: page.backgroundType,
            backgroundUrl: page.backgroundUrl ?? null,
            backgroundMeta: (page.backgroundMeta ?? {}) as Prisma.InputJsonValue,
            label: page.label ?? `Page ${index + 1}`,
          })),
        },
        ...(seed.elements?.length && {
          workspaceElements: {
            create: seed.elements.map((el) => ({
              id: el.id,
              pageId: el.pageId,
              type: el.type,
              layer: el.layer,
              zIndex: el.zIndex,
              transform: el.transform as Prisma.InputJsonValue,
              style: (el.style ?? {}) as Prisma.InputJsonValue,
              data: (el.data ?? {}) as Prisma.InputJsonValue,
              locked: el.locked ?? false,
              visible: el.visible ?? true,
              name: el.name ?? null,
            })),
          },
        }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true, avatar: true } },
        permissions: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          include: { user: { select: { id: true, name: true } } },
        },
        _count: { select: { permissions: true, operations: true } },
        assets: true,
        workspacePages: { orderBy: { pageIndex: 'asc' } },
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        documentId: document.id,
        type: ActivityType.UPLOADED,
        metadata: {
          documentType: 'WORKSPACE',
          pageCount: seed.pages.length,
          source: seed.sourceAsset?.originalName ?? null,
        },
      },
    });

    return documentService.getById(document.id, userId);
  }

  async getWorkspaceMeta(documentId: string, userId: string) {
    await documentService.getById(documentId, userId);

    const [pages, assets] = await Promise.all([
      prisma.workspacePage.findMany({
        where: { documentId },
        orderBy: { pageIndex: 'asc' },
      }),
      prisma.workspaceAsset.findMany({
        where: { documentId },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return { pages, assets };
  }
}

export const workspaceService = new WorkspaceService();
