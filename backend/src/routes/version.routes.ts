import { Router, type Response } from 'express';
import { PermissionRole } from '../lib/prisma.js';
import { versionService } from '../services/version.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';

const router = Router({ mergeParams: true });

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

router.use(authenticate);

router.get('/history', requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const history = await versionService.getVersionHistory(param(req.params.documentId));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get version history' });
  }
});

router.post('/restore/:versionId', requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const state = await versionService.restoreVersion(
      param(req.params.documentId),
      param(req.params.versionId),
      req.authUser!.id
    );
    res.json({ state: Array.from(state) });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Restore failed' });
  }
});

router.get('/reconstruct', requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const { timestamp } = req.query;
    if (!timestamp) {
      res.status(400).json({ error: 'timestamp query param required' });
      return;
    }
    const state = await versionService.reconstructAtTimestamp(
      param(req.params.documentId),
      new Date(timestamp as string)
    );
    res.json({ state: Array.from(state) });
  } catch (err) {
    res.status(500).json({ error: 'Reconstruction failed' });
  }
});

router.post('/snapshot', requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await versionService.createSnapshot(param(req.params.documentId));
    res.status(201).json({ snapshotId: snapshot.id });
  } catch (err) {
    res.status(500).json({ error: 'Snapshot failed' });
  }
});

export default router;
