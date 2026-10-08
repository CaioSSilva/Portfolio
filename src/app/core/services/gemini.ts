import { inject, Injectable, InjectionToken } from '@angular/core';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language';
import { HERMES_DOCS } from './hermes-docs';

export type GenAIFactory = (apiKey: string) => Pick<GoogleGenerativeAI, 'getGenerativeModel'>;

export const GENAI_FACTORY = new InjectionToken<GenAIFactory>('GENAI_FACTORY', {
  providedIn: 'root',
  factory: () => (apiKey: string) => new GoogleGenerativeAI(apiKey),
});

@Injectable({ providedIn: 'root' })
export class Gemini {
  private readonly langService = inject(LanguageService);
  private readonly genAIFactory = inject(GENAI_FACTORY);

  public async generateResponse(
    prompt: string,
    history: string,
    fileData?: { mimeType: string; b64: string }
  ): Promise<string> {
    const genAI = this.genAIFactory(environment.geminiApiKey);
    const currentLang = this.langService.currentLang();
    const docs = HERMES_DOCS[currentLang] ?? HERMES_DOCS['en'];

    const systemInstruction =
      currentLang === 'pt'
        ? `Você é Hermes, um assistente integrado ao CaiOS. Responda sempre em Português Brasileiro usando formatação Markdown puro (sem HTML). Use ## para títulos, **negrito**, *itálico*, \`código\`, listas com - e blocos de código com \`\`\`.\n\nDocumentação do sistema:\n${docs}\n\n${history}`
        : `You are Hermes, an assistant integrated into CaiOS. Always respond in English using pure Markdown formatting (no HTML). Use ## for headings, **bold**, *italic*, \`code\`, lists with - and code blocks with \`\`\`.\n\nSystem documentation:\n${docs}\n\n${history}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: systemInstruction,
    });

    const parts: Array<string | Part> = [prompt];
    if (fileData) {
      parts.push({
        inlineData: { data: fileData.b64, mimeType: fileData.mimeType },
      });
    }

    const result = await model.generateContent(parts);
    return result.response.text();
  }
}