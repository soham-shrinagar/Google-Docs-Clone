import { prisma } from '../lib/prisma.js';

export class CommentService {
  async list(documentId: string) {
    const comments = await prisma.documentComment.findMany({
      where: { documentId, parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, color: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, color: true } },
          },
        },
      },
    });
    return comments;
  }

  async create(
    documentId: string,
    userId: string,
    data: { content: string; quote?: string; parentId?: string }
  ) {
    return prisma.documentComment.create({
      data: {
        documentId,
        userId,
        content: data.content.trim(),
        quote: data.quote?.trim() || null,
        parentId: data.parentId || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, color: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, color: true } },
          },
        },
      },
    });
  }

  async resolve(commentId: string, userId: string, resolved: boolean) {
    const comment = await prisma.documentComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    return prisma.documentComment.update({
      where: { id: commentId },
      data: { resolved },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, color: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true, color: true } },
          },
        },
      },
    });
  }
}

export const commentService = new CommentService();
