import { inject, Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class Gemini {
  private genAI: GoogleGenerativeAI;
  private langService = inject(LanguageService);

  constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
  }

  async generateResponse(
    prompt: string,
    fileData?: { mimeType: string; b64: string },
  ): Promise<string> {
    try {
      const currentLang = this.langService.currentLang();
      const systemInstruction =
        currentLang === 'pt'
          ? 'Você é Hermes, um assistente integrado ao Cai_OS. Responda sempre em Português Brasileiro.'
          : 'You are Hermes, an assistant integrated into Cai_OS. Always respond in English.';

      const model = this.genAI.getGenerativeModel({
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
    } catch (error) {
      throw error;
    }
  }
}
