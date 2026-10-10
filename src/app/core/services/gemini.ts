import { inject, Injectable, InjectionToken } from '@angular/core';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language';
import { Settings } from './settings';
import { FileSystem } from './file-system';
import { HERMES_DOCS } from './hermes-docs';
import { GenAIFactory, GeminiModel, GeminiModelRaw } from '../models/gemini';

export type { GeminiModel, GenAIFactory };

export const GENAI_FACTORY = new InjectionToken<GenAIFactory>('GENAI_FACTORY', {
  providedIn: 'root',
  factory: () => (apiKey: string) => new GoogleGenerativeAI(apiKey),
});

@Injectable({ providedIn: 'root' })
export class Gemini {
  private readonly langService = inject(LanguageService);
  private readonly genAIFactory = inject(GENAI_FACTORY);
  private readonly settings = inject(Settings);
  private readonly fileSystem = inject(FileSystem);

  private buildSystemInstruction(): string {
    const currentLang = this.langService.currentLang();
    const docs = HERMES_DOCS[currentLang] ?? HERMES_DOCS['en'];
    const fileIndex = this.buildFileIndex(currentLang);

    return currentLang === 'pt'
      ? `Você é Hermes, o assistente inteligente integrado ao CaiOS. Responda com formatação Markdown puro (sem HTML). Seja conciso e direto. Sempre que apropriado, use ações no sistema com a tag <!--caios:action {"type": "...", "payload": {...}} -->.\n\n${docs}${fileIndex}`
      : `You are Hermes, the intelligent assistant integrated into CaiOS. Respond using pure Markdown formatting (no HTML). Be concise and direct. Whenever appropriate, trigger system actions using the tag <!--caios:action {"type": "...", "payload": {...}} -->.\n\n${docs}${fileIndex}`;
  }

  private buildFileIndex(lang: string): string {
    if (!this.fileSystem.isLoaded()) return '';
    const lines: string[] = [];
    for (const node of this.fileSystem.allFiles()) {
      if (node.url) lines.push(`- ${node.name}: ${node.url}`);
    }
    if (lines.length === 0) return '';
    const header = lang === 'pt'
      ? '\n\n## Arquivos no sistema\nUse o path exato abaixo em ações como read_file_content ou open_file:\n'
      : '\n\n## Files in the system\nUse the exact path below in actions like read_file_content or open_file:\n';
    return header + lines.join('\n');
  }

  private buildParts(
    prompt: string,
    history?: string,
    fileData?: { mimeType: string; b64: string },
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

  async listModels(): Promise<GeminiModel[]> {
    const apiKey = environment.geminiApiKey;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    if (!response.ok) throw new Error(`Failed to list models: ${response.status}`);
    const data = await response.json();
    const all: GeminiModelRaw[] = data.models ?? [];
    return all
      .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
      .map((model) => ({
        name: model.name.replace('models/', ''),
        displayName: model.displayName,
        description: model.description ?? '',
      }));
  }

  private getModel(apiKey: string): ReturnType<GoogleGenerativeAI['getGenerativeModel']> {
    const genAI = this.genAIFactory(apiKey);
    return genAI.getGenerativeModel({
      model: this.settings.geminiModel(),
      systemInstruction: this.buildSystemInstruction(),
    });
  }

  private isFallbackError(error: Error): boolean {
    const errorMessage = error.message;
    return (
      errorMessage.includes('404') ||
      errorMessage.includes('NOT_FOUND') ||
      errorMessage.includes('429') ||
      errorMessage.includes('RESOURCE_EXHAUSTED')
    );
  }

  async generateResponse(
    prompt: string,
    history: string,
    fileData?: { mimeType: string; b64: string },
  ): Promise<string> {
    const parts = this.buildParts(prompt, history, fileData);

    try {
      const result = await this.getModel(environment.geminiApiKey).generateContent(parts);
      return result.response.text();
    } catch (error) {
      if (!this.isFallbackError(error as Error)) throw error;
      const result = await this.getModel(environment.geminiApiKey2).generateContent(parts);
      return result.response.text();
    }
  }

  async generateResponseStream(
    prompt: string,
    history: string,
    fileData: { mimeType: string; b64: string } | undefined,
    onChunk: (chunkText: string) => void,
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
    } catch (error) {
      if (!this.isFallbackError(error as Error)) throw error;
      return await runStream(environment.geminiApiKey2);
    }
  }
}
