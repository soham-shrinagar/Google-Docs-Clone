import { Router, type Response } from 'express';
import { presenceService } from '../services/presence.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const presence = await presenceService.getDocumentPresence(param(req.params.documentId));
    res.json({ presence });
  } catch {
    res.status(500).json({ error: 'Failed to get presence' });
  }
});

export default router;
