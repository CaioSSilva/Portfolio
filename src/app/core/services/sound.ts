import { DestroyRef, inject, Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable({ providedIn: 'root' })
export class Sound {
  private readonly settings = inject(Settings);
  private readonly destroyRef = inject(DestroyRef);
  private audioContext: AudioContext | null = null;
  private readonly bufferCache = new Map<string, AudioBuffer>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.audioContext?.close();
      this.audioContext = null;
    });
  }

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

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const buffer = await this.getAudioBuffer(soundName, ctx);
      this.createAndStartSource(buffer, ctx);
    } catch {}
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

  private createAndStartSource(buffer: AudioBuffer, ctx: AudioContext): void {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  }
}
