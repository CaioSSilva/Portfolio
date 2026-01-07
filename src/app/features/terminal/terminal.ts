import { Component, inject, signal, viewChild, ElementRef, computed } from '@angular/core';
import { LanguageService } from '../../core/services/language';
import { TerminalComands } from '../../core/services/terminal-comands';
import { Base } from '../../core/models/base';
import { CommandResult, TerminalLine } from '../../core/models/terminal';
import { FileSystem } from '../../core/services/file-system';

@Component({
  selector: 'app-terminal',
  standalone: true,
  templateUrl: './terminal.html',
})
export class Terminal extends Base {
  protected readonly lang = inject(LanguageService);
  private readonly commandService = inject(TerminalComands);
  private readonly fs = inject(FileSystem);

  currentPath = signal<string>('home');
  history = signal<TerminalLine[]>([]);
  private commandHistory = signal<string[]>([]);
  private historyIndex = signal<number>(-1);

  private termInput = viewChild.required<ElementRef<HTMLInputElement>>('termInput');
  private scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  async handleCommand(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;

    this.commandHistory.update((prev) => [value, ...prev]);
    this.historyIndex.set(-1);

    const result = (await this.commandService.execute(value, this.currentPath())) as CommandResult;

    if (result.action === 'CLEAR_ACTION') {
      this.history.set([]);
    } else {
      const oldPath = this.currentPath();
      if (result.newPath) this.currentPath.set(result.newPath);
      this.addHistoryLine(value, result.output || '', oldPath);
    }

    input.value = '';
    this.scrollToBottom();
  }

  handleKeydown(event: KeyboardEvent): void {
    const keys: Record<string, () => void> = {
      Tab: () => {
        event.preventDefault();
        this.autocomplete();
      },
      ArrowUp: () => {
        event.preventDefault();
        this.navigateHistory(1);
      },
      ArrowDown: () => {
        event.preventDefault();
        this.navigateHistory(-1);
      },
    };
    keys[event.key]?.();
  }

  private navigateHistory(direction: number): void {
    const history = this.commandHistory();
    const newIndex = this.historyIndex() + direction;

    if (newIndex >= -1 && newIndex < history.length) {
      this.historyIndex.set(newIndex);
      this.termInput().nativeElement.value = newIndex === -1 ? '' : history[newIndex];
    }
  }

  private autocomplete(): void {
    const input = this.termInput().nativeElement;
    const parts = input.value.split(' ');
    const lastPart = parts[parts.length - 1];

    if (parts.length === 1) {
      const matches = Object.keys(this.lang.t().terminal.commands).filter((c) =>
        c.startsWith(lastPart.toLowerCase()),
      );
      this.applyMatch(input, parts, matches);
    } else {
      this.handleFileAutocomplete(input, parts, lastPart);
    }
  }

  private async handleFileAutocomplete(
    input: HTMLInputElement,
    parts: string[],
    lastPart: string,
  ): Promise<void> {
    const segments = lastPart.split('/');
    const prefix = segments.pop()?.toLowerCase() || '';
    const dirPath = segments.join('/');

    let searchDir = this.currentPath();
    if (dirPath) {
      const res = await this.commandService.execute(`cd ${dirPath}`, this.currentPath());
      if (res.newPath) searchDir = res.newPath;
      else return;
    }

    const trans = this.lang.t().files as Record<string, string>;
    const children = await this.fs.getChildren(searchDir);
    const matches = children
      .map((f) => ({ name: trans[f.id.toLowerCase()] || f.name, isFolder: f.type === 'folder' }))
      .filter((f) => f.name.toLowerCase().startsWith(prefix))
      .map((f) => (f.isFolder ? `${f.name}/` : f.name));

    this.applyMatch(input, parts, matches, dirPath);
  }

  private applyMatch(input: HTMLInputElement, parts: string[], matches: string[], path = ''): void {
    if (matches.length === 1) {
      parts[parts.length - 1] = path ? `${path}/${matches[0]}` : matches[0];
      input.value = parts.join(' ');
    } else if (matches.length > 1) {
      this.addHistoryLine(input.value, matches.join('\n'), this.currentPath());
    }
  }

  private async addHistoryLine(command: string, output: string, pathId: string): Promise<void> {
    const resolvedPath = await this.getTranslatedName(pathId);

    this.history.update((prev) => [
      ...prev,
      {
        command,
        output,
        path: resolvedPath,
      },
    ]);

    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer().nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }

  focusInput(): void {
    this.termInput().nativeElement.focus();
  }

  async getTranslatedName(id: string): Promise<string> {
    const trans = this.lang.t().files as Record<string, string>;
    const name = trans[id.toLowerCase()] || this.fs.getFolderName(id);
    return name;
  }

  readonly prompt = computed(() => {
    const path = this.currentPath();
    const trans = this.lang.t().files as Record<string, string>;
    const name = trans[path.toLowerCase()] || this.fs.getFolderName(path);
    return `user@caios:${name}$`;
  });
}
