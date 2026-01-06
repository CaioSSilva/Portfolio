import { inject, Injectable } from '@angular/core';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root',
})
export class Sound {
  settings = inject(Settings);
  private audioContext = new AudioContext();

  async play(soundName: string) {
    if (this.settings.systemMuted()) {
      return;
    }

    const response = await fetch(`/sounds/${soundName}.ogg`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    source.start();
  }
}
