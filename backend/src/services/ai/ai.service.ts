import { createHash } from 'crypto';
import {
  AiRequestStatus,
  AiRequestType,
  AiRewriteAction,
  SummaryFormat,
  Prisma,
} from '../../lib/prisma.js';
import { prisma } from '../../lib/prisma.js';
import { getLlmProvider, REWRITE_PROMPTS, SUMMARY_PROMPTS } from './providers/index.js';

const COMMON_MISSPELLINGS: Record<string, string> = {
  teh: 'the', recieve: 'receive', occured: 'occurred', seperate: 'separate',
  definately: 'definitely', accomodate: 'accommodate', occurence: 'occurrence',
  wich: 'which', thier: 'their', freind: 'friend', untill: 'until',
  goverment: 'government', enviroment: 'environment', succesful: 'successful',
  neccessary: 'necessary', recomend: 'recommend', writting: 'writing',
  understandings: 'understand', alot: 'a lot',
};

export interface SpellIssue {
  word: string;
  from: number;
  to: number;
  type: 'spelling' | 'grammar' | 'style' | 'repeated';
  suggestions: string[];
  message?: string;
}

class AiService {
  private async trackRequest(
    userId: string,
    documentId: string | null,
    type: AiRequestType,
    action: string | null,
    fn: () => Promise<{ result: string; metadata?: Record<string, unknown> }>
  ) {
    const start = Date.now();
    const request = await prisma.aiRequest.create({
      data: { userId, documentId, type, status: AiRequestStatus.PENDING, action },
    });

    try {
      const { result, metadata } = await fn();
      await prisma.aiRequest.update({
        where: { id: request.id },
        data: {
          status: AiRequestStatus.COMPLETED,
          latencyMs: Date.now() - start,
          metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
          completedAt: new Date(),
        },
      });
      await this.bumpUsage(userId, type, 'completed');
      return { result, requestId: request.id };
    } catch (err) {
      await prisma.aiRequest.update({
        where: { id: request.id },
        data: {
          status: AiRequestStatus.FAILED,
          error: err instanceof Error ? err.message : 'AI request failed',
          latencyMs: Date.now() - start,
          completedAt: new Date(),
        },
      });
      throw err;
    }
  }

  private async bumpUsage(userId: string, type: AiRequestType, outcome: 'completed' | 'accepted' | 'rejected') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const row = await prisma.aiUsageStat.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    const data = {
      rewriteCount: row?.rewriteCount ?? 0,
      grammarFixCount: row?.grammarFixCount ?? 0,
      dictationCount: row?.dictationCount ?? 0,
      summarizeCount: row?.summarizeCount ?? 0,
      chatCount: row?.chatCount ?? 0,
      acceptedSuggestions: row?.acceptedSuggestions ?? 0,
      rejectedSuggestions: row?.rejectedSuggestions ?? 0,
    };

    if (outcome === 'completed') {
      if (type === AiRequestType.REWRITE) data.rewriteCount += 1;
      else if (type === AiRequestType.GRAMMAR) data.grammarFixCount += 1;
      else if (type === AiRequestType.SPEECH) data.dictationCount += 1;
      else if (type === AiRequestType.SUMMARIZE) data.summarizeCount += 1;
      else if (type === AiRequestType.CHAT) data.chatCount += 1;
      else return;
    } else if (outcome === 'accepted') {
      data.acceptedSuggestions += 1;
    } else {
      data.rejectedSuggestions += 1;
    }

    await prisma.aiUsageStat.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, ...data },
      update: data,
    });
  }

  async rewrite(
    userId: string,
    documentId: string,
    text: string,
    action: AiRewriteAction,
    targetLanguage?: string
  ) {
    const prompt = REWRITE_PROMPTS[action] || REWRITE_PROMPTS.IMPROVE;
    const llm = getLlmProvider();

    const { result, requestId } = await this.trackRequest(userId, documentId, AiRequestType.REWRITE, action, async () => {
      const result = await llm.complete({
        messages: [
          { role: 'system', content: `${prompt}${targetLanguage ? ` Target language: ${targetLanguage}.` : ''}` },
          { role: 'user', content: text },
        ],
        temperature: 0.35,
      });
      return { result };
    });

    const rewrite = await prisma.aiRewrite.create({
      data: { userId, documentId, requestId, action, originalText: text, resultText: result },
    });

    return { result, rewriteId: rewrite.id, requestId };
  }

  async recordRewriteOutcome(rewriteId: string, userId: string, accepted: boolean) {
    await prisma.aiRewrite.updateMany({
      where: { id: rewriteId, userId },
      data: { accepted },
    });
    await this.bumpUsage(userId, AiRequestType.REWRITE, accepted ? 'accepted' : 'rejected');
  }

  async recordGrammarOutcome(userId: string, accepted: boolean) {
    if (accepted) {
      await this.bumpUsage(userId, AiRequestType.GRAMMAR, 'accepted');
    } else {
      await this.bumpUsage(userId, AiRequestType.GRAMMAR, 'rejected');
    }
  }

  async checkGrammar(userId: string, documentId: string, text: string) {
    const llm = getLlmProvider();

    const { result } = await this.trackRequest(userId, documentId, AiRequestType.GRAMMAR, 'CHECK', async () => {
      const raw = await llm.complete({
        messages: [
          {
            role: 'system',
            content: `Analyze text for grammar issues. Return JSON: {"issues":[{"original":"...","suggestion":"...","explanation":"...","type":"grammar|style|punctuation"}]}. Max 8 issues.`,
          },
          { role: 'user', content: text.slice(0, 4000) },
        ],
        jsonMode: true,
        temperature: 0.2,
      });
      return { result, metadata: { length: text.length } };
    });

    try {
      const parsed = JSON.parse(result) as {
        issues?: { original: string; suggestion: string; explanation?: string; type?: string }[];
      };
      return parsed.issues ?? [];
    } catch {
      return [];
    }
  }

  spellCheckLocal(text: string, customWords: string[]): SpellIssue[] {
    const custom = new Set(customWords.map((w) => w.toLowerCase()));
    const issues: SpellIssue[] = [];
    const wordRegex = /\b[\w']+\b/g;
    let match: RegExpExecArray | null;

    while ((match = wordRegex.exec(text)) !== null) {
      const word = match[0];
      const lower = word.toLowerCase();

      if (custom.has(lower)) continue;
      if (/^\d+$/.test(word)) continue;
      if (word.length <= 2) continue;
      if (word === word.toUpperCase() && word.length > 1) continue;

      const correction = COMMON_MISSPELLINGS[lower];
      if (correction) {
        issues.push({
          word,
          from: match.index,
          to: match.index + word.length,
          type: 'spelling',
          suggestions: [correction],
          message: `Did you mean "${correction}"?`,
        });
      } else if (/^[a-z]+$/.test(word) && word.length > 3 && !/^(https?|www)/.test(word)) {
        const prev = issues[issues.length - 1];
        if (prev?.word.toLowerCase() === lower && prev.type === 'repeated') continue;
        const nextWord = text.slice(match.index + word.length + 1).match(/^\s+(\w+)/);
        if (nextWord && nextWord[1].toLowerCase() === lower) {
          issues.push({
            word,
            from: match.index,
            to: match.index + word.length,
            type: 'repeated',
            suggestions: [word],
            message: 'Repeated word',
          });
        }
      }
    }

    return issues.slice(0, 50);
  }

  async getUserDictionary(userId: string) {
    const rows = await prisma.userDictionaryWord.findMany({
      where: { userId },
      orderBy: { word: 'asc' },
    });
    return rows.map((r) => r.word);
  }

  async addDictionaryWord(userId: string, word: string) {
    const normalized = word.trim().toLowerCase();
    if (!normalized) throw new Error('Word required');
    await prisma.userDictionaryWord.upsert({
      where: { userId_word: { userId, word: normalized } },
      create: { userId, word: normalized },
      update: {},
    });
    return normalized;
  }

  async summarize(
    userId: string,
    documentId: string,
    text: string,
    format: SummaryFormat
  ) {
    const llm = getLlmProvider();
    const prompt = SUMMARY_PROMPTS[format] || SUMMARY_PROMPTS.BRIEF;
    const hash = createHash('sha256').update(text).digest('hex').slice(0, 16);

    const { result } = await this.trackRequest(userId, documentId, AiRequestType.SUMMARIZE, format, async () => {
      const result = await llm.complete({
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text.slice(0, 12000) },
        ],
        temperature: 0.3,
      });
      return { result };
    });

    await prisma.documentSummary.create({
      data: { userId, documentId, format, content: result, sourceHash: hash },
    });

    return { summary: result, format };
  }

  async chat(
    userId: string,
    documentId: string,
    documentText: string,
    question: string,
    history: { role: 'user' | 'assistant'; content: string }[] = []
  ) {
    const llm = getLlmProvider();
    const context = documentText.slice(0, 14000);

    const { result } = await this.trackRequest(userId, documentId, AiRequestType.CHAT, 'ASK', async () => {
      const result = await llm.complete({
        messages: [
          {
            role: 'system',
            content: `You are a document assistant. Answer based on the document context. Be concise and cite sections when helpful. If the answer is not in the document, say so.`,
          },
          { role: 'user', content: `Document:\n\n${context}\n\n---\n\nConversation so far included.` },
          ...history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: question },
        ],
        temperature: 0.4,
      });
      return { result };
    });

    return { answer: result };
  }

  async insights(userId: string, documentId: string, text: string, structure: Record<string, number>) {
    const llm = getLlmProvider();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const { result } = await this.trackRequest(userId, documentId, AiRequestType.INSIGHTS, 'ANALYZE', async () => {
      const result = await llm.complete({
        messages: [
          {
            role: 'system',
            content: `Return JSON only: {"topics":["..."],"sentiment":"positive|neutral|negative|mixed","complexity":"low|medium|high","readabilityScore":0-100,"keywords":["..."],"structureNotes":"..."}`,
          },
          { role: 'user', content: text.slice(0, 8000) },
        ],
        jsonMode: true,
        temperature: 0.2,
      });
      return { result };
    });

    let aiInsights = {
      topics: [] as string[],
      sentiment: 'neutral',
      complexity: 'medium',
      readabilityScore: 70,
      keywords: [] as string[],
      structureNotes: '',
    };

    try {
      aiInsights = { ...aiInsights, ...JSON.parse(result) };
    } catch { /* use defaults */ }

    return {
      words,
      characters: text.length,
      readingTimeMin: readingTime,
      structure,
      ...aiInsights,
    };
  }

  async saveSpeechTranscript(
    userId: string,
    documentId: string,
    transcript: string,
    language: string,
    insertMode: string,
    durationMs?: number
  ) {
    const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
    const row = await prisma.speechTranscript.create({
      data: {
        userId,
        documentId,
        transcript,
        language,
        insertMode,
        durationMs,
        wordCount,
      },
    });
    await this.bumpUsage(userId, AiRequestType.SPEECH, 'completed');
    return row;
  }

  async transcribeAudio(userId: string, documentId: string, audio: Buffer, language: string) {
    const llm = getLlmProvider();
    if (!llm.transcribeAudio) throw new Error('Transcription not supported by provider');

    const { result } = await this.trackRequest(userId, documentId, AiRequestType.SPEECH, 'TRANSCRIBE', async () => {
      const result = await llm.transcribeAudio!(audio, language);
      return { result };
    });

    return { transcript: result };
  }

  async getUsageStats(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const stats = await prisma.aiUsageStat.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    });

    const totals = stats.reduce(
      (acc, s) => ({
        rewriteCount: acc.rewriteCount + s.rewriteCount,
        grammarFixCount: acc.grammarFixCount + s.grammarFixCount,
        dictationCount: acc.dictationCount + s.dictationCount,
        summarizeCount: acc.summarizeCount + s.summarizeCount,
        chatCount: acc.chatCount + s.chatCount,
        acceptedSuggestions: acc.acceptedSuggestions + s.acceptedSuggestions,
        rejectedSuggestions: acc.rejectedSuggestions + s.rejectedSuggestions,
      }),
      {
        rewriteCount: 0,
        grammarFixCount: 0,
        dictationCount: 0,
        summarizeCount: 0,
        chatCount: 0,
        acceptedSuggestions: 0,
        rejectedSuggestions: 0,
      }
    );

    const recentRequests = await prisma.aiRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, type: true, action: true, status: true, createdAt: true, documentId: true },
    });

    return { totals, daily: stats, recentRequests };
  }

  async parseVoiceCommand(transcript: string) {
    const lower = transcript.toLowerCase().trim();
    const commands: { pattern: RegExp; action: string; payload?: Record<string, unknown> }[] = [
      { pattern: /^(create|insert|make)\s+(a\s+)?heading\s+(one|1|level\s*1)/i, action: 'heading', payload: { level: 1 } },
      { pattern: /^(create|insert|make)\s+(a\s+)?heading\s+(two|2|level\s*2)/i, action: 'heading', payload: { level: 2 } },
      { pattern: /^(create|insert|make)\s+(a\s+)?bullet\s+list/i, action: 'bulletList' },
      { pattern: /^(create|insert|make)\s+(a\s+)?numbered\s+list/i, action: 'orderedList' },
      { pattern: /^(create|insert|make)\s+(a\s+)?table/i, action: 'table' },
      { pattern: /^(create|insert|make)\s+(a\s+)?code\s+block/i, action: 'codeBlock' },
      { pattern: /^make\s+(this|it)\s+bold/i, action: 'bold' },
      { pattern: /^make\s+(this|it)\s+italic/i, action: 'italic' },
      { pattern: /^undo(\s+last\s+change)?/i, action: 'undo' },
    ];

    for (const cmd of commands) {
      if (cmd.pattern.test(lower)) {
        return { isCommand: true, action: cmd.action, payload: cmd.payload ?? {} };
      }
    }

    return { isCommand: false, action: null, payload: {} };
  }
}

export const aiService = new AiService();
