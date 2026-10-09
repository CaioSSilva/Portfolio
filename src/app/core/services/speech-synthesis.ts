import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { LanguageService } from './language';

@Injectable({ providedIn: 'root' })
export class SpeechSynthesisService {
  private readonly lang = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSpeaking = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.cancel());
  }

  speak(text: string, onEnd: () => void): void {
    if (typeof speechSynthesis === 'undefined') {
      onEnd();
      return;
    }
    const cleaned = this.stripMarkdown(text);
    if (!cleaned.trim()) {
      onEnd();
      return;
    }
    if (this.isSpeaking()) {
      speechSynthesis.cancel();
    }
    queueMicrotask(() => speechSynthesis.speak(this.buildUtterance(cleaned, onEnd)));
  }

  private buildUtterance(text: string, onEnd: () => void): SpeechSynthesisUtterance {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang.currentLang() === 'pt' ? 'pt-BR' : 'en-US';
    utterance.onstart = () => this.isSpeaking.set(true);
    utterance.onend = () => {
      this.isSpeaking.set(false);
      onEnd();
    };
    utterance.onerror = () => {
      this.isSpeaking.set(false);
      onEnd();
    };
    return utterance;
  }

  cancel(): void {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    this.isSpeaking.set(false);
  }

  isSupported(): boolean {
    if (typeof speechSynthesis === 'undefined') return false;
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') return false;
    return true;
  }

  private stripMarkdown(text: string): string {
    return text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\s*[-*+]\s/gm, '')
      .replace(/^\s*\d+\.\s/gm, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }
}
