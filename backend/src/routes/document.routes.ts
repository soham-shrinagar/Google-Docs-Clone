import { Router, type Response } from 'express';
import { z } from 'zod';
import { PermissionRole } from '../lib/prisma.js';
import { documentService } from '../services/document.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { search, sortBy, sortOrder, pinnedOnly } = req.query;
    const documents = await documentService.list(req.authUser!.id, {
      search: search as string,
      sortBy: sortBy as 'updatedAt' | 'createdAt' | 'title',
      sortOrder: sortOrder as 'asc' | 'desc',
      pinnedOnly: pinnedOnly === 'true',
    });
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to list documents' });
  }
});

router.get('/recent', async (req: AuthRequest, res: Response) => {
  try {
    const documents = await documentService.getRecentlyOpened(req.authUser!.id);
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recent documents' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({
      title: z.string().optional(),
      templateId: z.string().optional(),
    }).parse(req.body);
    const result = await documentService.create(req.authUser!.id, body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create document' });
  }
});

router.get('/:id', requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const document = await documentService.getById(param(req.params.id), req.authUser!.id);
    await documentService.recordOpen(param(req.params.id), req.authUser!.id);
    res.json({ document });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Not found' });
  }
});

router.patch('/:id', requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const { title } = z.object({ title: z.string().min(1).max(200) }).parse(req.body);
    const document = await documentService.update(param(req.params.id), req.authUser!.id, { title });
    res.json({ document });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Update failed' });
  }
});

router.delete('/:id', requirePermission(PermissionRole.OWNER), async (req: AuthRequest, res: Response) => {
  try {
    await documentService.delete(param(req.params.id), req.authUser!.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Delete failed' });
  }
});

router.post('/:id/share', requirePermission(PermissionRole.OWNER), async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = z.object({
      email: z.string().email(),
      role: z.nativeEnum(PermissionRole),
    }).parse(req.body);
    const permission = await documentService.share(param(req.params.id), req.authUser!.id, email, role);
    res.json({ permission });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Share failed' });
  }
});

router.post('/:id/pin', requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const result = await documentService.togglePin(param(req.params.id), req.authUser!.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Pin toggle failed' });
  }
});

export default router;
