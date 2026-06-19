import { Router, type Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { analyticsService } from '../services/analytics.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = Router();

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await notificationService.list(req.authUser!.id);
    res.json({ notifications });
  } catch {
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  await notificationService.markRead(req.authUser!.id, param(req.params.id));
  res.json({ success: true });
});

router.post('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  await notificationService.markAllRead(req.authUser!.id);
  res.json({ success: true });
});

router.get('/analytics', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const metrics = await analyticsService.getMetrics();
    res.json(metrics);
  } catch {
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

export default router;
