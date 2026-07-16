import bcrypt from 'bcryptjs';
import { OtpPurpose } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';
import { assignUserColor } from '../utils/helpers.js';
import { otpService } from './otp.service.js';

export class AuthService {
  async register(email: string, password: string, name: string, otp: string) {
    const normalizedEmail = otpService.normalizeEmail(email);
    await otpService.verify(normalizedEmail, OtpPurpose.SIGNUP, otp);

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new Error('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        color: assignUserColor(normalizedEmail),
      },
    });

    const token = signToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(email: string, password: string, otp: string) {
    const normalizedEmail = otpService.normalizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new Error('User not found');
    if (!user.passwordHash) throw new Error('This account uses Google sign-in. Please continue with Google.');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    await otpService.verify(normalizedEmail, OtpPurpose.LOGIN, otp);

    const token = signToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async resetPassword(email: string, newPassword: string, otp: string) {
    const normalizedEmail = otpService.normalizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) throw new Error('Invalid or expired password reset request');

    await otpService.verify(normalizedEmail, OtpPurpose.RESET_PASSWORD, otp);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password reset successfully' };
  }

  async findOrCreateGoogleUser(profile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: profile.name,
          avatar: profile.avatar || user.avatar,
        },
      });
    } else {
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

    if (!user) throw new Error('Failed to create Google user');

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
