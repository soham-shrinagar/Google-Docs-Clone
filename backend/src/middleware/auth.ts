import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { getDbErrorMessage, isTransientDbError } from '../lib/dbErrors.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  color: string;
}

export interface AuthRequest extends Request {
  authUser?: AuthUser;
  documentRole?: import('../lib/prisma.js').PermissionRole;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, avatar: true, color: true },
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.authUser = user;
    next();
  } catch (err) {
    if (isTransientDbError(err)) {
      if (config.nodeEnv === 'development') {
        console.error('Database unreachable:', getDbErrorMessage(err));
      }
      res.status(503).json({
        error: 'Database temporarily unreachable. If you use WSL, try PowerShell instead or fix WSL DNS.',
      });
      return;
    }

    if (config.nodeEnv === 'development') {
      console.error('Auth middleware error:', getDbErrorMessage(err));
    }
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    next();
    return;
  }

  authenticate(req, res, next);
}
