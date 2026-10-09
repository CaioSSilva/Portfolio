import { Injectable, inject, signal } from '@angular/core';
import { Gemini } from './gemini';
import { HermesActionService } from './hermes-action';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { Message } from '../models/hermes';

const MAX_HISTORY_MESSAGES = 6;

@Injectable({ providedIn: 'root' })
export class HermesChatService {
  private readonly gemini = inject(Gemini);
  private readonly actionService = inject(HermesActionService);
  private readonly notifications = inject(NotificationService);
  private readonly lang = inject(LanguageService);

  readonly messages = signal<Message[]>([]);
  readonly isLoading = signal(false);

  private buildHistory(): string {
    const recentMessages = this.messages().slice(-MAX_HISTORY_MESSAGES);
    if (recentMessages.length === 0) return '';

    const t = this.lang.t();
    const formatted = recentMessages
      .map(
        (msg) => `${msg.role === 'user' ? t.hermes.roleUser : t.hermes.roleAssistant}: ${msg.text}`,
      )
      .join('\n');
    const header = this.lang.currentLang() === 'pt' ? 'Histórico recente:\n' : 'Recent history:\n';
    return header + formatted;
  }

  private appendUserMessage(text: string, image?: string): void {
    this.messages.update((prev) => [...prev, { role: 'user', text, image }]);
  }

  private appendModelPlaceholder(): number {
    const index = this.messages().length;
    this.messages.update((prev) => [...prev, { role: 'model', text: '' }]);
    return index;
  }

  private updateModelMessage(index: number, text: string): void {
    this.messages.update((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], text };
      }
      return next;
    });
  }

  private removeMessageAt(index: number): void {
    this.messages.update((prev) => prev.filter((_, i) => i !== index));
  }

  private handleStreamChunk(modelIndex: number, streamedText: string): void {
    const { cleanText } = this.actionService.parseActions(streamedText);
    this.updateModelMessage(modelIndex, cleanText);
  }

  private handleSendError(error: Error, modelIndex: number): void {
    this.removeMessageAt(modelIndex);
    const isModelError =
      error.message.includes('404') ||
      error.message.includes('NOT_FOUND') ||
      error.message.includes('429') ||
      error.message.includes('RESOURCE_EXHAUSTED');

    const errors = this.lang.t().errors;
    this.notifications.show({
      title: errors.systemError,
      message: isModelError ? errors.modelUnavailable : errors.serviceUnavailable,
      icon: isModelError ? 'fas fa-robot' : 'fas fa-circle-exclamation',
      duration: isModelError ? 10000 : 6000,
    });
  }

  async send(
    text: string,
    fileData: { mimeType: string; b64: string } | null,
    previewUrl: string | null,
  ): Promise<void> {
    const history = this.buildHistory();
    this.appendUserMessage(text, previewUrl ?? undefined);
    this.isLoading.set(true);
    const modelIndex = this.appendModelPlaceholder();
    try {
      await this.handleStreamResponse(text, history, fileData, modelIndex);
    } catch (error) {
      this.handleSendError(error as Error, modelIndex);
    } finally {
      this.isLoading.set(false);
    }
  }

  notifyAgentReply(text: string): void {
    const preview = text.length > 120 ? `${text.slice(0, 120)}…` : text;
    this.notifications.show({
      title: this.lang.t().hermes.roleAssistant,
      message: preview,
      icon: 'fas fa-robot',
      duration: 8000,
    });
  }

  clearMessages(): void {
    this.messages.set([]);
  }

  private async handleStreamResponse(
    text: string,
    history: string,
    fileData: { mimeType: string; b64: string } | null,
    modelIndex: number,
  ): Promise<void> {
    const rawResponse = await this.gemini.generateResponseStream(
      text,
      history,
      fileData ?? undefined,
      (streamedText) => this.handleStreamChunk(modelIndex, streamedText),
    );
    const { cleanText, actions } = this.actionService.parseActions(rawResponse);
    this.updateModelMessage(modelIndex, cleanText);
    for (const action of actions) {
      this.actionService.execute(action);
    }
  }
}
