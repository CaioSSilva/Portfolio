import { inject, Injectable, InjectionToken } from '@angular/core';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language';
import { Settings } from './settings';
import { HERMES_DOCS } from './hermes-docs';

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
}

export type GenAIFactory = (apiKey: string) => Pick<GoogleGenerativeAI, 'getGenerativeModel'>;

export const GENAI_FACTORY = new InjectionToken<GenAIFactory>('GENAI_FACTORY', {
  providedIn: 'root',
  factory: () => (apiKey: string) => new GoogleGenerativeAI(apiKey),
});

@Injectable({ providedIn: 'root' })
export class Gemini {
  private readonly langService = inject(LanguageService);
  private readonly genAIFactory = inject(GENAI_FACTORY);
  private readonly settings = inject(Settings);

  private buildSystemInstruction(): string {
    const currentLang = this.langService.currentLang();
    const docs = HERMES_DOCS[currentLang] ?? HERMES_DOCS['en'];

    return currentLang === 'pt'
      ? `Você é Hermes, o assistente inteligente integrado ao CaiOS. Responda com formatação Markdown puro (sem HTML). Seja conciso e direto. Sempre que apropriado, use ações no sistema com a tag <!--caios:action {"type": "...", "payload": {...}} -->.\n\n${docs}`
      : `You are Hermes, the intelligent assistant integrated into CaiOS. Respond using pure Markdown formatting (no HTML). Be concise and direct. Whenever appropriate, trigger system actions using the tag <!--caios:action {"type": "...", "payload": {...}} -->.\n\n${docs}`;
  }

  private buildParts(
    prompt: string,
    history?: string,
    fileData?: { mimeType: string; b64: string }
  ): Array<string | Part> {
    const parts: Array<string | Part> = [];
    if (history) {
      parts.push(history);
    }
    parts.push(prompt);
    if (fileData) {
      parts.push({
        inlineData: { data: fileData.b64, mimeType: fileData.mimeType },
      });
    }
    return parts;
  }

  public async listModels(): Promise<GeminiModel[]> {
    const apiKey = environment.geminiApiKey;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    if (!res.ok) throw new Error(`Failed to list models: ${res.status}`);
    const data = await res.json();
    const all: Array<{ name: string; displayName: string; description: string; supportedGenerationMethods?: string[] }> =
      data.models ?? [];
    return all
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => ({
        name: m.name.replace('models/', ''),
        displayName: m.displayName,
        description: m.description ?? '',
      }));
  }

  private getModel(apiKey: string): ReturnType<GoogleGenerativeAI['getGenerativeModel']> {
    const genAI = this.genAIFactory(apiKey);
    return genAI.getGenerativeModel({
      model: this.settings.geminiModel(),
      systemInstruction: this.buildSystemInstruction(),
    });
  }

  public async generateResponse(
    prompt: string,
    history: string,
    fileData?: { mimeType: string; b64: string }
  ): Promise<string> {
    const parts = this.buildParts(prompt, history, fileData);

    try {
      const result = await this.getModel(environment.geminiApiKey).generateContent(parts);
      return result.response.text();
    } catch {
      const result = await this.getModel(environment.geminiApiKey2).generateContent(parts);
      return result.response.text();
    }
  }

  public async generateResponseStream(
    prompt: string,
    history: string,
    fileData: { mimeType: string; b64: string } | undefined,
    onChunk: (chunkText: string) => void
  ): Promise<string> {
    const parts = this.buildParts(prompt, history, fileData);

    const runStream = async (apiKey: string): Promise<string> => {
      const result = await this.getModel(apiKey).generateContentStream(parts);
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk(fullText);
      }
      return fullText;
    };

    try {
      return await runStream(environment.geminiApiKey);
    } catch {
      return await runStream(environment.geminiApiKey2);
    }
  }
}
