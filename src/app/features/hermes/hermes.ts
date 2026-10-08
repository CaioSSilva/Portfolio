import {
  Component,
  inject,
  computed,
  viewChild,
  ElementRef,
  effect,
  signal,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Gemini, GeminiModel } from '../../core/services/gemini';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { Base } from '../../core/models/base';
import { MarkdownPipe } from '../../core/pipes/markdown-pipe';
import { HermesChatService } from '../../core/services/hermes-chat';

@Component({
  selector: 'app-hermes',
  standalone: true,
  imports: [FormsModule, NgClass, MarkdownPipe],
  templateUrl: './hermes.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hermes.scss',
})
export class Hermes extends Base {
  private readonly gemini = inject(Gemini);
  private readonly destroyRef = inject(DestroyRef);
  readonly lang = inject(LanguageService);
  readonly settings = inject(Settings);
  readonly chat = inject(HermesChatService);

  private readonly scrollFrame = viewChild<ElementRef>('scrollFrame');

  readonly userInput = signal('');
  readonly selectedFile = signal<{ mimeType: string; b64: string } | null>(null);
  readonly previewUrl = signal<string | null>(null);

  readonly modelPickerOpen = signal(false);
  readonly geminiModels = signal<GeminiModel[]>([]);
  readonly modelsLoading = signal(false);
  readonly modelsError = signal(false);

  readonly isButtonDisabled = computed(
    () => (this.userInput().trim().length === 0 && !this.selectedFile()) || this.chat.isLoading(),
  );

  private modelsLoaded = false;
  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    super();
    effect(() => {
      if (this.chat.messages().length || this.chat.isLoading()) {
        this.scrollToBottom();
      }
    });
    this.destroyRef.onDestroy(() => {
      if (this.scrollTimeout !== null) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
    });
  }

  async onFileSelected(event: Event): Promise<void> {
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

  async handleSendMessage(): Promise<void> {
    if (this.isButtonDisabled()) return;

    const text = this.userInput();
    const fileData = this.selectedFile();
    const preview = this.previewUrl();

    this.userInput.set('');
    this.clearAttachment();

    await this.chat.send(text, fileData, preview);
  }

  clearAttachment(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  async toggleModelPicker(): Promise<void> {
    const opening = !this.modelPickerOpen();
    this.modelPickerOpen.set(opening);
    if (opening && !this.modelsLoaded) {
      await this.loadModels();
    }
  }

  async loadModels(): Promise<void> {
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

  private scrollToBottom(): void {
    if (this.scrollTimeout !== null) {
      clearTimeout(this.scrollTimeout);
    }
    this.scrollTimeout = setTimeout(() => {
      this.scrollTimeout = null;
      const frame = this.scrollFrame()?.nativeElement;
      if (frame) {
        frame.scrollTo({ top: frame.scrollHeight, behavior: 'smooth' });
      }
    }, 50);
  }
}
