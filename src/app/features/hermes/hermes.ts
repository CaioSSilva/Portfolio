import { Component, inject, signal, computed, viewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Gemini } from '../../core/services/gemini';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { Base } from '../../core/models/base';
import { Message } from '../../core/models/hermes';
import { MarkdownPipe } from '../../core/pipes/markdown-pipe';

@Component({
  selector: 'app-hermes',
  standalone: true,
  imports: [FormsModule, CommonModule, MarkdownPipe],
  templateUrl: './hermes.html',
  styleUrl: './hermes.scss',
})
export class Hermes extends Base {
  protected readonly lang = inject(LanguageService);
  private readonly not = inject(NotificationService);
  private readonly gemini = inject(Gemini);

  scrollFrame = viewChild<ElementRef>('scrollFrame');

  userInput = signal('');
  isLoading = signal(false);
  messages = signal<Message[]>([]);
  selectedFile = signal<{ mimeType: string; b64: string } | null>(null);
  previewUrl = signal<string | null>(null);

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

    try {
      const response = await this.gemini.generateResponse(currentText, currentFile ?? undefined);

      this.messages.update((prev) => [
        ...prev,
        {
          role: 'model',
          text: response,
        },
      ]);
    } catch (error) {
      this.not.show({
        title: this.lang.t().errors.systemError,
        message: this.lang.t().errors.seviceUnavailable,
        icon: 'fas fa-circle-exclamation',
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  clearAttachment() {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
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
