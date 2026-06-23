import { Router, type Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { aiService } from '../services/ai/ai.service.js';

const router = Router();

router.post('/dictionary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { word } = z.object({ word: z.string().min(1).max(100) }).parse(req.body);
    const saved = await aiService.addDictionaryWord(req.authUser!.id, word);
    res.status(201).json({ word: saved });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to add word' });
  }
});

router.post('/grammar/outcome', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { accepted } = z.object({ accepted: z.boolean() }).parse(req.body);
    await aiService.recordGrammarOutcome(req.authUser!.id, accepted);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

router.get('/usage', authenticate, async (req: AuthRequest, res: Response) => {
  const stats = await aiService.getUsageStats(req.authUser!.id);
  res.json(stats);
});

export default router;
