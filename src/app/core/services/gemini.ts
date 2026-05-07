import { inject, Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../../environments/environment';
import { LanguageService } from './language';
import { HERMES_DOCS } from './hermes-docs';

@Injectable({ providedIn: 'root' })
export class Gemini {
  private langService = inject(LanguageService);

  async generateResponse(
    prompt: string,
    history: string,
    fileData?: { mimeType: string; b64: string },
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(environment.geminiApiKey);
    const currentLang = this.langService.currentLang();
    const docs = HERMES_DOCS[currentLang] ?? HERMES_DOCS['en'];

    const systemInstruction =
      currentLang === 'pt'
        ? `Você é Hermes, um assistente integrado ao CaiOS. Responda sempre em Português Brasileiro.\n\nDocumentação do sistema:\n${docs}\n\n${history}`
        : `You are Hermes, an assistant integrated into CaiOS. Always respond in English.\n\nSystem documentation:\n${docs}\n\n${history}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
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
  }
}
