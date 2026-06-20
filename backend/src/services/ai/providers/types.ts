export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface LlmProvider {
  readonly name: string;
  complete(options: LlmCompletionOptions): Promise<string>;
  transcribeAudio?(audioBuffer: Buffer, language?: string): Promise<string>;
}

export const REWRITE_PROMPTS: Record<string, string> = {
  IMPROVE: 'Improve the writing quality while preserving meaning. Return only the rewritten text.',
  FIX_GRAMMAR: 'Fix all grammar, spelling, and punctuation errors. Return only the corrected text.',
  PROFESSIONAL: 'Rewrite in a professional business tone. Return only the rewritten text.',
  CASUAL: 'Rewrite in a casual, conversational tone. Return only the rewritten text.',
  SHORTEN: 'Make this more concise without losing key information. Return only the shortened text.',
  EXPAND: 'Expand with relevant detail and clarity. Return only the expanded text.',
  SIMPLIFY: 'Simplify language for easier reading. Return only the simplified text.',
  TECHNICAL: 'Rewrite using precise technical language. Return only the rewritten text.',
  FORMAL: 'Rewrite in a formal academic tone. Return only the rewritten text.',
  FRIENDLY: 'Rewrite in a warm, friendly tone. Return only the rewritten text.',
  SUMMARIZE: 'Summarize the key points. Return only the summary.',
  EXPLAIN: 'Explain this clearly as if teaching a beginner. Return only the explanation.',
  TRANSLATE: 'Translate to English if not already, otherwise translate to Spanish. Return only the translation.',
};

export const SUMMARY_PROMPTS: Record<string, string> = {
  BRIEF: 'Provide a brief 2-3 sentence summary.',
  DETAILED: 'Provide a detailed summary covering all main points.',
  BULLETS: 'Provide a bullet-point summary with key takeaways.',
  EXECUTIVE: 'Provide an executive summary for leadership.',
  MEETING_NOTES: 'Format as meeting notes with attendees topics and decisions if inferable.',
  ACTION_ITEMS: 'Extract action items as a bullet list.',
};
