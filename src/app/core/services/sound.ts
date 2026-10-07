import { inject, Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable({ providedIn: 'root' })
export class Sound {
  private readonly settings = inject(Settings);
  private audioContext: AudioContext | null = null;
  private readonly bufferCache = new Map<string, AudioBuffer>();

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return null;
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  async play(soundName: string): Promise<void> {
    if (this.settings.systemMuted()) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const buffer = await this.getAudioBuffer(soundName, ctx);
      this.createAndStartSource(buffer, ctx);
    } catch (error) {
      console.warn(`[Sound] Failed to play sound "${soundName}":`, error);
    }
  }

  private async getAudioBuffer(soundName: string, ctx: AudioContext): Promise<AudioBuffer> {
    const cached = this.bufferCache.get(soundName);
    if (cached) return cached;

    const buffer = await this.fetchAndDecode(soundName, ctx);
    this.bufferCache.set(soundName, buffer);
    return buffer;
  }

  private async fetchAndDecode(soundName: string, ctx: AudioContext): Promise<AudioBuffer> {
    const response = await fetch(`/sounds/${soundName}.ogg`);
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }

  private createAndStartSource(buffer: AudioBuffer, ctx: AudioContext) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
}
