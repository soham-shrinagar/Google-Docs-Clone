import { Router, type Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PermissionRole } from '../lib/prisma.js';
import { commentService } from '../services/comment.service.js';

const router = Router({ mergeParams: true });

const createSchema = z.object({
  content: z.string().min(1).max(5000),
  quote: z.string().max(2000).optional(),
  parentId: z.string().uuid().optional(),
});

router.get('/', authenticate, requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const comments = await commentService.list(documentId);
    res.json({ comments });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to load comments' });
  }
});

router.post('/', authenticate, requirePermission(PermissionRole.COMMENTER), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const data = createSchema.parse(req.body);
    const comment = await commentService.create(documentId, req.authUser!.id, data);
    res.status(201).json({ comment });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create comment' });
  }
});

router.patch('/:commentId', authenticate, requirePermission(PermissionRole.COMMENTER), async (req: AuthRequest, res: Response) => {
  try {
    const { resolved } = z.object({ resolved: z.boolean() }).parse(req.body);
    const comment = await commentService.resolve(req.params.commentId as string, req.authUser!.id, resolved);
    res.json({ comment });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to update comment' });
  }
});

export default router;
