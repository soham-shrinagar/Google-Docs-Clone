import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { assignUserColor } from '../utils/helpers.js';

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        color: assignUserColor(email),
      },
    });

    const token = signToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw new Error('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    const token = signToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async findOrCreateGoogleUser(profile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

    if (!user) {
      user = await prisma.user.findUnique({ where: { email: profile.email } });
      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.id, avatar: profile.avatar || user.avatar },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            googleId: profile.id,
            avatar: profile.avatar,
            color: assignUserColor(profile.id),
          },
        });
      }
    }

    const token = signToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    color: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      color: user.color,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
