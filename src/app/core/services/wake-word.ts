import { Injectable } from '@angular/core';
import { WakeWordMatch } from '../models/agent-mode';

const WAKE_VARIANTS = ['hermes', 'hermés', 'ermes', 'ermis', 'ermos', 'hermos'];
const GREETINGS = ['hello', 'hi', 'oi', 'olá', 'ola', 'hey'];
const STOP_VARIANTS = ['stop listening', 'para de ouvir', 'pare de ouvir', 'stop'];

@Injectable({ providedIn: 'root' })
export class WakeWordService {
  isStopCommand(transcript: string): boolean {
    const normalized = this.normalize(transcript);
    return STOP_VARIANTS.some((variant) => normalized.includes(variant));
  }

  match(transcript: string): WakeWordMatch {
    const normalized = this.normalize(transcript);
    const wakeIndex = this.findWakeIndex(normalized);
    if (wakeIndex === -1) {
      return { matched: false, command: '' };
    }
    const command = this.extractCommand(normalized, wakeIndex);
    return { matched: true, command };
  }

  private findWakeIndex(normalized: string): number {
    for (const greeting of GREETINGS) {
      for (const variant of WAKE_VARIANTS) {
        const phrase = `${greeting} ${variant}`;
        const index = normalized.indexOf(phrase);
        if (index !== -1) return index + phrase.length;
      }
    }
    return this.findFuzzyWakeIndex(normalized);
  }

  private findFuzzyWakeIndex(normalized: string): number {
    const words = normalized.split(/\s+/);
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      for (const variant of WAKE_VARIANTS) {
        if (this.levenshtein(word, variant) <= 1) {
          return words.slice(0, wordIndex + 1).join(' ').length;
        }
      }
    }
    return -1;
  }

  private extractCommand(normalized: string, afterIndex: number): string {
    return normalized.slice(afterIndex).replace(/^[,\s]+/, '').trim();
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    for (let row = 1; row <= b.length; row++) {
      for (let col = 1; col <= a.length; col++) {
        const cost = a[col - 1] === b[row - 1] ? 0 : 1;
        matrix[row][col] = Math.min(
          matrix[row - 1][col] + 1,
          matrix[row][col - 1] + 1,
          matrix[row - 1][col - 1] + cost,
        );
      }
    }
    return matrix[b.length][a.length];
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
