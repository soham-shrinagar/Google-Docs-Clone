import { Router, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import { PermissionRole, AiRewriteAction, SummaryFormat } from '../lib/prisma.js';
import { aiService } from '../services/ai/ai.service.js';

const router = Router({ mergeParams: true });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

router.post('/rewrite', authenticate, requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const body = z.object({
      text: z.string().min(1).max(8000),
      action: z.nativeEnum(AiRewriteAction),
      targetLanguage: z.string().optional(),
    }).parse(req.body);

    const result = await aiService.rewrite(
      req.authUser!.id,
      documentId,
      body.text,
      body.action,
      body.targetLanguage
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Rewrite failed' });
  }
});

router.post('/rewrite/:rewriteId/outcome', authenticate, requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const { accepted } = z.object({ accepted: z.boolean() }).parse(req.body);
    await aiService.recordRewriteOutcome(req.params.rewriteId as string, req.authUser!.id, accepted);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

router.post('/grammar', authenticate, requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const { text } = z.object({ text: z.string().min(1).max(8000) }).parse(req.body);
    const issues = await aiService.checkGrammar(req.authUser!.id, documentId, text);
    res.json({ issues });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Grammar check failed' });
  }
});

router.post('/spell-check', authenticate, requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const { text } = z.object({ text: z.string().min(1).max(50000) }).parse(req.body);
    const customWords = await aiService.getUserDictionary(req.authUser!.id);
    const issues = aiService.spellCheckLocal(text, customWords);
    res.json({ issues });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Spell check failed' });
  }
});

router.post('/summarize', authenticate, requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const body = z.object({
      text: z.string().min(1).max(50000),
      format: z.nativeEnum(SummaryFormat),
    }).parse(req.body);
    const result = await aiService.summarize(req.authUser!.id, documentId, body.text, body.format);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Summarize failed' });
  }
});

router.post('/chat', authenticate, requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const body = z.object({
      question: z.string().min(1).max(2000),
      documentText: z.string().min(1).max(50000),
      history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })).optional(),
    }).parse(req.body);
    const result = await aiService.chat(
      req.authUser!.id,
      documentId,
      body.documentText,
      body.question,
      body.history ?? []
    );
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Chat failed' });
  }
});

router.post('/insights', authenticate, requirePermission(PermissionRole.VIEWER), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const body = z.object({
      text: z.string().min(1).max(50000),
      structure: z.record(z.number()).optional(),
    }).parse(req.body);
    const insights = await aiService.insights(
      req.authUser!.id,
      documentId,
      body.text,
      body.structure ?? {}
    );
    res.json({ insights });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Insights failed' });
  }
});

router.post('/speech/transcript', authenticate, requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const body = z.object({
      transcript: z.string(),
      language: z.string().default('en-US'),
      insertMode: z.string(),
      durationMs: z.number().optional(),
    }).parse(req.body);
    const row = await aiService.saveSpeechTranscript(
      req.authUser!.id,
      documentId,
      body.transcript,
      body.language,
      body.insertMode,
      body.durationMs
    );
    res.status(201).json({ transcript: row });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed to save transcript' });
  }
});

router.post('/speech/transcribe', authenticate, requirePermission(PermissionRole.EDITOR), upload.single('audio'), async (req: AuthRequest, res: Response) => {
  try {
    const documentId = req.params.documentId as string;
    const language = (req.body.language as string) || 'en';
    if (!req.file) {
      res.status(400).json({ error: 'Audio file required' });
      return;
    }
    const result = await aiService.transcribeAudio(req.authUser!.id, documentId, req.file.buffer, language);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Transcription failed' });
  }
});

router.post('/voice-command', authenticate, requirePermission(PermissionRole.EDITOR), async (req: AuthRequest, res: Response) => {
  try {
    const { transcript } = z.object({ transcript: z.string().min(1) }).parse(req.body);
    const parsed = await aiService.parseVoiceCommand(transcript);
    res.json(parsed);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

export default router;
