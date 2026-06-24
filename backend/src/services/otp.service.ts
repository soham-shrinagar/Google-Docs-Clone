import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { OtpPurpose } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { emailService } from './email.service.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

export class OtpService {
  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private generateCode(): string {
    return String(crypto.randomInt(100000, 1_000_000));
  }

  async sendSignupOtp(email: string): Promise<{ message: string }> {
    const normalized = this.normalizeEmail(email);
    const existing = await prisma.user.findUnique({ where: { email: normalized } });
    if (existing) throw new Error('Email already registered');

    return this.createAndSend(normalized, OtpPurpose.SIGNUP);
  }

  async sendLoginOtp(email: string, password: string): Promise<{ message: string }> {
    const normalized = this.normalizeEmail(email);
    const user = await prisma.user.findUnique({ where: { email: normalized } });
    if (!user) throw new Error('User not found');
    if (!user.passwordHash) {
      throw new Error('This account uses Google sign-in. Please continue with Google.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error('Invalid credentials');

    return this.createAndSend(normalized, OtpPurpose.LOGIN);
  }

  private async createAndSend(email: string, purpose: OtpPurpose): Promise<{ message: string }> {
    const recent = await prisma.emailOtp.findFirst({
      where: { email, purpose },
      orderBy: { createdAt: 'desc' },
    });
    if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new Error('Please wait a minute before requesting another code');
    }

    await prisma.emailOtp.deleteMany({ where: { email, purpose } });

    const code = this.generateCode();
    const codeHash = await bcrypt.hash(code, 10);

    await prisma.emailOtp.create({
      data: {
        email,
        purpose,
        codeHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      },
    });

    const sent = await emailService.sendOtpEmail({ to: email, code, purpose });
    if (!sent) {
      if (config.nodeEnv === 'development') {
        console.log(`[otp] ${purpose} code for ${email}: ${code}`);
        return { message: 'Verification code sent (see server console in development)' };
      }
      if (emailService.usesHttpApi()) {
        throw new Error('Failed to send verification email. Check BREVO_API_KEY and BREVO_SENDER_EMAIL on Render.');
      }
      throw new Error(
        'Failed to send verification email. Render free tier blocks Gmail SMTP — add BREVO_API_KEY on Render, or upgrade to a paid instance.'
      );
    }

    return { message: 'Verification code sent to your email' };
  }

  async verify(email: string, purpose: OtpPurpose, code: string): Promise<void> {
    const normalized = this.normalizeEmail(email);
    const record = await prisma.emailOtp.findFirst({
      where: { email: normalized, purpose },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new Error('Verification code expired or not found. Request a new one.');
    }
    if (record.expiresAt < new Date()) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      throw new Error('Verification code expired. Request a new one.');
    }
    if (record.attempts >= MAX_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { id: record.id } });
      throw new Error('Too many failed attempts. Request a new code.');
    }

    const valid = await bcrypt.compare(code, record.codeHash);
    if (!valid) {
      await prisma.emailOtp.update({
        where: { id: record.id },
        data: { attempts: record.attempts + 1 },
      });
      throw new Error('Invalid verification code');
    }

    await prisma.emailOtp.delete({ where: { id: record.id } });
  }
}

export const otpService = new OtpService();
