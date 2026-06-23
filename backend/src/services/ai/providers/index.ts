import type { LlmProvider } from './types.js';
import { openAiProvider } from './openai.provider.js';

export function getLlmProvider(): LlmProvider {
  return openAiProvider;
}

export * from './types.js';
