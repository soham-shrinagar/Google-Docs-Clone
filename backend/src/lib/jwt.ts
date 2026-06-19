import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/index.js';
import type { User } from './prisma.js';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(user: Pick<User, 'id' | 'email'>): string {
  const options: SignOptions = { expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
