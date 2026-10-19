import { Injectable, signal } from '@angular/core';

@Injectable()
export class TerminalHistoryService {
  private readonly entries = signal<string[]>([]);
  private readonly activeIndex = signal(-1);

  readonly commands = this.entries.asReadonly();

  push(command: string): void {
    this.entries.update((prev) => [command, ...prev]);
    this.activeIndex.set(-1);
  }

  navigate(direction: 1 | -1): string | null {
    const history = this.entries();
    const newIndex = this.activeIndex() + direction;

    if (newIndex < -1 || newIndex >= history.length) return null;

    this.activeIndex.set(newIndex);
    return newIndex === -1 ? '' : history[newIndex];
  }
}
