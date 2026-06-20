import type { LlmProvider } from './types.js';
import { openAiProvider } from './openai.provider.js';

let provider: LlmProvider = openAiProvider;

export function getLlmProvider(): LlmProvider {
  return provider;
}

export function setLlmProvider(next: LlmProvider) {
  provider = next;
}

export * from './types.js';
