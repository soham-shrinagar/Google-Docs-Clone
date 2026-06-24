import { Router, type Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { otpService } from '../services/otp.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { config } from '../config/index.js';
import { verifyToken } from '../lib/jwt.js';
import { formatRouteError } from '../utils/helpers.js';

const router = Router();

const otpCodeSchema = z
  .string({ required_error: 'Verification code is required' })
  .regex(/^\d{6}$/, 'Verification code must be 6 digits');

const sendOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['signup', 'login']),
  password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.purpose === 'login' && !data.password) {
    ctx.addIssue({ code: 'custom', message: 'Password is required', path: ['password'] });
  }
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
  name: z.string().min(1).max(100),
  otp: otpCodeSchema,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  otp: otpCodeSchema,
});

router.post('/otp/send', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const data = sendOtpSchema.parse(req.body);
    const result =
      data.purpose === 'signup'
        ? await otpService.sendSignupOtp(data.email)
        : await otpService.sendLoginOtp(data.email, data.password!);
    res.json(result);
  } catch (err) {
    const message = formatRouteError(err, 'Failed to send verification code');
    const status = message === 'Invalid credentials' || message === 'User not found' ? 401 : 400;
    res.status(status).json({ error: message });
  }
});

router.post('/register', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data.email, data.password, data.name, data.otp);
    setTokenCookie(res, result.token);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: formatRouteError(err, 'Registration failed') });
  }
});

router.post('/login', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password, data.otp);
    setTokenCookie(res, result.token);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: formatRouteError(err, 'Login failed') });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.authUser!.id);
    res.json({ user });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : 'Not found' });
  }
});

router.post('/logout', (_req, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
  });
  res.json({ success: true });
});

router.get('/google', (_req, res: Response) => {
  if (!config.google.clientId) {
    res.status(503).json({ error: 'Google OAuth not configured' });
    return;
  }
  const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${config.google.clientId}&` +
    `redirect_uri=${encodeURIComponent(config.google.callbackUrl)}&` +
    `response_type=code&scope=email%20profile&access_type=offline`;
  res.redirect(url);
});

router.get('/session', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ error: 'No session' });
      return;
    }

    const payload = verifyToken(token);
    const user = await authService.getMe(payload.userId);
    res.json({ user, token });
  } catch {
    res.status(401).json({ error: 'Invalid session' });
  }
});

router.get('/google/callback', async (req: AuthRequest, res: Response) => {
  try {
    const { code, error } = req.query;
    if (error) {
      res.redirect(`${config.clientUrl}/login?error=oauth_denied`);
      return;
    }
    if (!code || typeof code !== 'string') {
      res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
      return;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json() as { access_token?: string; error?: string; error_description?: string };
    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Google token exchange failed:', tokens.error || tokens.error_description || tokenRes.status);
      res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
      return;
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json() as {
      id?: string;
      email?: string;
      name?: string;
      picture?: string;
      error?: { message?: string };
    };

    if (!profileRes.ok || !profile.id || !profile.email || !profile.name) {
      console.error('Google profile fetch failed:', profile.error?.message || profileRes.status);
      res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
      return;
    }

    const result = await authService.findOrCreateGoogleUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    setTokenCookie(res, result.token);
    res.redirect(`${config.clientUrl}/auth/callback#token=${encodeURIComponent(result.token)}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
  }
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setTokenCookie(res: Response, token: string) {
  res.cookie('token', token, cookieOptions());
}

export default router;
