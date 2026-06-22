import { Router, type Response } from 'express';
import { z } from 'zod';
import { PermissionRole } from '../lib/prisma.js';
import { workspaceService } from '../services/workspace.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router();

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

router.use(authenticate);

const pageSeedSchema = z.object({
  id: z.string().uuid(),
  width: z.number().positive(),
  height: z.number().positive(),
  backgroundType: z.enum(['blank', 'pdf_page', 'image']),
  backgroundUrl: z.string().nullable().optional(),
  backgroundMeta: z.record(z.unknown()).nullable().optional(),
  label: z.string().nullable().optional(),
});

const elementSeedSchema = z.object({
  id: z.string().uuid(),
  pageId: z.string().uuid(),
  type: z.string(),
  layer: z.string(),
  zIndex: z.number().int(),
  transform: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    rotation: z.number().optional(),
  }),
  style: z.record(z.unknown()).nullable().optional(),
  data: z.record(z.unknown()).optional(),
  locked: z.boolean().optional(),
  visible: z.boolean().optional(),
  name: z.string().nullable().optional(),
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = z
      .object({
        title: z.string().min(1).max(200),
        seed: z.object({
          pages: z.array(pageSeedSchema).min(1),
          elements: z.array(elementSeedSchema).optional(),
          sourceAsset: z
            .object({
              filename: z.string(),
              originalName: z.string(),
              mimeType: z.string(),
              size: z.number().int(),
              url: z.string(),
            })
            .optional(),
        }),
      })
      .parse(req.body);

    const document = await workspaceService.create(req.authUser!.id, body);
    res.status(201).json({ document });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to create workspace' });
  }
});

router.get(
  '/:documentId/meta',
  requirePermission(PermissionRole.VIEWER),
  async (req: AuthRequest, res: Response) => {
    try {
      const meta = await workspaceService.getWorkspaceMeta(
        param(req.params.documentId),
        req.authUser!.id
      );
      res.json(meta);
    } catch (err) {
      res.status(404).json({ error: err instanceof Error ? err.message : 'Not found' });
    }
  }
);

export default router;
