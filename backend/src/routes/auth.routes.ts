import { Router, type Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { config } from '../config/index.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data.email, data.password, data.name);
    setTokenCookie(res, result.token);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    setTokenCookie(res, result.token);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Login failed' });
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
  res.clearCookie('token', cookieOptions());
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

router.get('/google/callback', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;
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

    const tokens = await tokenRes.json() as { access_token: string };
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json() as { id: string; email: string; name: string; picture?: string };

    const result = await authService.findOrCreateGoogleUser({
      id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
    });

    setTokenCookie(res, result.token);
    res.redirect(`${config.clientUrl}/dashboard`);
  } catch {
    res.redirect(`${config.clientUrl}/login?error=oauth_failed`);
  }
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function setTokenCookie(res: Response, token: string) {
  res.cookie('token', token, cookieOptions());
}

export default router;
