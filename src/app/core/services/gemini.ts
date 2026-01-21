import { inject, Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class Gemini {
  private langService = inject(LanguageService);
  private currentKeyIndex = 0;

  async generateResponse(
    prompt: string,
    fileData?: { mimeType: string; b64: string },
  ): Promise<string> {
    const totalKeys = environment.geminiApiKeys.length;

    for (let i = 0; i < totalKeys; i++) {
      const apiKey = environment.geminiApiKeys[this.currentKeyIndex];

      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const currentLang = this.langService.currentLang();

        const systemInstruction =
          currentLang === 'pt'
            ? 'Você é Hermes, um assistente integrado ao Cai_OS. Responda sempre em Português Brasileiro.'
            : 'You are Hermes, an assistant integrated into Cai_OS. Always respond in English.';

        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemInstruction,
        });

        const parts: any[] = [prompt];
        if (fileData) {
          parts.push({
            inlineData: { data: fileData.b64, mimeType: fileData.mimeType },
          });
        }

        const result = await model.generateContent(parts);
        return result.response.text();
      } catch (error: any) {
        const isRateLimit =
          error?.status === 429 ||
          error?.message?.includes('429') ||
          error?.message?.includes('quota');

        if (isRateLimit && i < totalKeys - 1) {
          console.warn(`Quota excedida na chave ${this.currentKeyIndex}. Tentando próxima...`);
          this.rotateKey();
          continue;
        }
        throw error;
      }
    }
    throw new Error();
  }

  private rotateKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % environment.geminiApiKeys.length;
  }
}
