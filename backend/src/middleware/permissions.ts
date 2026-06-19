import type { Response, NextFunction } from 'express';
import { PermissionRole } from '../lib/prisma.js';
import { prisma } from '../lib/prisma.js';
import type { AuthRequest } from './auth.js';

const ROLE_HIERARCHY: Record<PermissionRole, number> = {
  VIEWER: 0,
  COMMENTER: 1,
  EDITOR: 2,
  OWNER: 3,
};

function param(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : value || '';
}

export function requirePermission(minRole: PermissionRole) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const documentId = param(req.params.documentId) || param(req.params.id);
      if (!documentId || !req.authUser) {
        res.status(400).json({ error: 'Invalid request' });
        return;
      }

      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: { permissions: { where: { userId: req.authUser.id } } },
      });

      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      let role: PermissionRole;
      if (document.ownerId === req.authUser.id) {
        role = PermissionRole.OWNER;
      } else if (document.permissions.length > 0) {
        role = document.permissions[0].role;
      } else {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      req.documentRole = role;
      next();
    } catch {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export async function getUserDocumentRole(
  userId: string,
  documentId: string
): Promise<PermissionRole | null> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { permissions: { where: { userId } } },
  });

  if (!document) return null;
  if (document.ownerId === userId) return PermissionRole.OWNER;
  if (document.permissions.length > 0) return document.permissions[0].role;
  return null;
}
