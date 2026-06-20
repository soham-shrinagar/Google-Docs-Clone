import { config } from '../../../config/index.js';
import type { LlmCompletionOptions, LlmProvider } from './types.js';

export class OpenAiProvider implements LlmProvider {
  readonly name = 'openai';

  private get apiKey() {
    return config.ai.openaiApiKey;
  }

  async complete(options: LlmCompletionOptions): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY in .env');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: options.messages,
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 2048,
        ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (!res.ok) {
      throw new Error(data.error?.message || `OpenAI request failed (${res.status})`);
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty response from AI provider');
    return content;
  }

  async transcribeAudio(audioBuffer: Buffer, language = 'en'): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const form = new FormData();
    form.append('file', new Blob([audioBuffer]), 'audio.webm');
    form.append('model', config.ai.whisperModel);
    form.append('language', language.split('-')[0]);

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: form,
    });

    const data = (await res.json()) as { text?: string; error?: { message?: string } };
    if (!res.ok) throw new Error(data.error?.message || 'Transcription failed');
    return data.text?.trim() || '';
  }
}

export const openAiProvider = new OpenAiProvider();
