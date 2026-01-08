import { inject, Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable({ providedIn: 'root' })
export class Sound {
  private readonly settings = inject(Settings);
  private readonly audioContext = new AudioContext();
  private readonly bufferCache = new Map<string, AudioBuffer>();

  async play(soundName: string) {
    if (this.settings.systemMuted()) return;

    try {
      const buffer = await this.getAudioBuffer(soundName);
      this.createAndStartSource(buffer);
    } catch (error) {}
  }

  private async getAudioBuffer(soundName: string): Promise<AudioBuffer> {
    const cached = this.bufferCache.get(soundName);
    if (cached) return cached;

    const buffer = await this.fetchAndDecode(soundName);
    this.bufferCache.set(soundName, buffer);
    return buffer;
  }

  private async fetchAndDecode(soundName: string): Promise<AudioBuffer> {
    const response = await fetch(`/sounds/${soundName}.ogg`);
    const arrayBuffer = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  private createAndStartSource(buffer: AudioBuffer) {
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }
}
