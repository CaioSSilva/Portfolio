import { Component, inject, signal, computed, viewChild, ElementRef, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Gemini, GeminiModel } from '../../core/services/gemini';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { HermesActionService } from '../../core/services/hermes-action';
import { Base } from '../../core/models/base';
import { Message } from '../../core/models/hermes';
import { MarkdownPipe } from '../../core/pipes/markdown-pipe';

const MAX_HISTORY_MESSAGES = 6;

@Component({
  selector: 'app-hermes',
  standalone: true,
  imports: [FormsModule, CommonModule, MarkdownPipe],
  templateUrl: './hermes.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './hermes.scss',
})
export class Hermes extends Base {
  protected readonly lang = inject(LanguageService);
  private readonly not = inject(NotificationService);
  private readonly gemini = inject(Gemini);
  readonly settings = inject(Settings);
  private readonly actionService = inject(HermesActionService);

  scrollFrame = viewChild<ElementRef>('scrollFrame');

  userInput = signal('');
  isLoading = signal(false);
  messages = signal<Message[]>([]);
  selectedFile = signal<{ mimeType: string; b64: string } | null>(null);
  previewUrl = signal<string | null>(null);

  modelPickerOpen = signal(false);
  geminiModels = signal<GeminiModel[]>([]);
  modelsLoading = signal(false);
  modelsError = signal(false);
  private modelsLoaded = false;

  isButtonDisabled = computed(
    () => (this.userInput().trim().length === 0 && !this.selectedFile()) || this.isLoading(),
  );

  constructor() {
    super();
    effect(() => {
      if (this.messages().length || this.isLoading()) {
        this.scrollToBottom();
      }
    });
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.previewUrl.set(result);
      this.selectedFile.set({
        mimeType: file.type,
        b64: result.split(',')[1],
      });
    };
    reader.readAsDataURL(file);
  }

  async handleSendMessage() {
    if (this.isButtonDisabled()) return;

    const currentText = this.userInput();
    const currentFile = this.selectedFile();
    const currentPreview = this.previewUrl();

    // Limit history to the last N messages to save context and tokens
    const recentMessages = this.messages().slice(-MAX_HISTORY_MESSAGES);
    const historyFormatted = recentMessages
      .map((m) => `${m.role === 'user' ? 'User' : 'Hermes'}: ${m.text}`)
      .join('\n');

    const historyHeader =
      this.lang.currentLang() === 'pt'
        ? 'Histórico recente:\n'
        : 'Recent history:\n';

    const history = recentMessages.length > 0 ? historyHeader + historyFormatted : '';

    this.messages.update((prev) => [
      ...prev,
      {
        role: 'user',
        text: currentText,
        image: currentPreview ?? undefined,
      },
    ]);

    this.userInput.set('');
    this.clearAttachment();
    this.isLoading.set(true);

    // Placeholder message for streaming response
    const modelMessageIndex = this.messages().length;
    this.messages.update((prev) => [
      ...prev,
      {
        role: 'model',
        text: '',
      },
    ]);

    try {
      const rawResponse = await this.gemini.generateResponseStream(
        currentText,
        history,
        currentFile ?? undefined,
        (streamedText) => {
          const { cleanText } = this.actionService.parseActions(streamedText);
          this.messages.update((prev) => {
            const next = [...prev];
            if (next[modelMessageIndex]) {
              next[modelMessageIndex] = {
                ...next[modelMessageIndex],
                text: cleanText,
              };
            }
            return next;
          });
        }
      );

      // Parse final response and execute any detected actions
      const { cleanText, actions } = this.actionService.parseActions(rawResponse);

      this.messages.update((prev) => {
        const next = [...prev];
        if (next[modelMessageIndex]) {
          next[modelMessageIndex] = {
            ...next[modelMessageIndex],
            text: cleanText,
          };
        }
        return next;
      });

      for (const action of actions) {
        this.actionService.execute(action);
      }
    } catch (error) {
      this.messages.update((prev) => prev.filter((_, idx) => idx !== modelMessageIndex));
      const is404 = error instanceof Error && (error.message.includes('404') || error.message.includes('NOT_FOUND'));
      this.not.show({
        title: this.lang.t().errors.systemError,
        message: is404 ? this.lang.t().errors.modelUnavailable : this.lang.t().errors.seviceUnavailable,
        icon: is404 ? 'fas fa-robot' : 'fas fa-circle-exclamation',
        duration: is404 ? 10000 : 6000,
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  clearAttachment() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  async toggleModelPicker() {
    const opening = !this.modelPickerOpen();
    this.modelPickerOpen.set(opening);
    if (opening && !this.modelsLoaded) {
      await this.loadModels();
    }
  }

  async loadModels() {
    this.modelsLoading.set(true);
    this.modelsError.set(false);
    try {
      const models = await this.gemini.listModels();
      this.geminiModels.set(models);
      this.modelsLoaded = true;
    } catch {
      this.modelsError.set(true);
    } finally {
      this.modelsLoading.set(false);
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const frame = this.scrollFrame()?.nativeElement;
      if (frame) {
        frame.scrollTo({ top: frame.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
  }
}
