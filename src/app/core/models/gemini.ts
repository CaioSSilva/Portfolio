import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
}

export interface GeminiModelRaw {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods?: string[];
}

export type GenAIFactory = (apiKey: string) => Pick<GoogleGenerativeAI, 'getGenerativeModel'>;
