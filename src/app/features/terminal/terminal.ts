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

  readonly currentPath = signal('home');
  readonly history = signal<TerminalLine[]>([]);

  private readonly commandHistory = signal<string[]>([]);
  private readonly historyIndex = signal(-1);

  private readonly termInput = viewChild.required<ElementRef<HTMLInputElement>>('termInput');
  private readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  readonly prompt = computed(() => `user@caios:${this.getTranslatedName(this.currentPath())}$`);

  async handleCommand(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;

    this.updateCommandHistory(value);
    const result = (await this.commandService.execute(value, this.currentPath())) as CommandResult;

    this.processCommandResult(result, value);

    input.value = '';
    this.scrollToBottom();
  }

  private processCommandResult(result: CommandResult, command: string) {
    if (result.action === 'CLEAR_ACTION') {
      this.history.set([]);
      return;
    }

    const oldPath = this.currentPath();
    if (result.newPath) this.currentPath.set(result.newPath);

    this.addHistoryLine(command, result.output || '', oldPath);
  }

  private updateCommandHistory(value: string) {
    this.commandHistory.update((prev) => [value, ...prev]);
    this.historyIndex.set(-1);
  }

  handleKeydown(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
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
    actions[event.key]?.();
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

    parts.length === 1
      ? this.autocompleteCommand(input, parts, lastPart)
      : this.autocompleteFile(input, parts, lastPart);
  }

  private autocompleteCommand(input: HTMLInputElement, parts: string[], lastPart: string) {
    const matches = Object.keys(this.lang.t().terminal.commands).filter((c) =>
      c.startsWith(lastPart.toLowerCase()),
    );
    this.applyMatch(input, parts, matches);
  }

  private async autocompleteFile(input: HTMLInputElement, parts: string[], lastPart: string) {
    const segments = lastPart.split('/');
    const prefix = segments.pop()?.toLowerCase() || '';
    const dirPath = segments.join('/');

    const searchDir = await this.resolveSearchDir(dirPath);
    if (!searchDir) return;

    const matches = this.fs
      .getChildren(searchDir)
      .map((f) => ({ name: this.getTranslatedName(f.id), isFolder: f.type === 'folder' }))
      .filter((f) => f.name.toLowerCase().startsWith(prefix))
      .map((f) => (f.isFolder ? `${f.name}/` : f.name));

    this.applyMatch(input, parts, matches, dirPath);
  }

  private async resolveSearchDir(dirPath: string): Promise<string | null> {
    if (!dirPath) return this.currentPath();
    const res = await this.commandService.execute(`cd ${dirPath}`, this.currentPath());
    return res.newPath || null;
  }

  private applyMatch(input: HTMLInputElement, parts: string[], matches: string[], path = ''): void {
    if (matches.length === 1) {
      parts[parts.length - 1] = path ? `${path}/${matches[0]}` : matches[0];
      input.value = parts.join(' ');
    } else if (matches.length > 1) {
      this.addHistoryLine(input.value, matches.join('\n'), this.currentPath());
    }
  }

  private addHistoryLine(command: string, output: string, pathId: string): void {
    this.history.update((prev) => [
      ...prev,
      { command, output, path: this.getTranslatedName(pathId) },
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

  getTranslatedName(id: string): string {
    const trans = this.lang.t().files as Record<string, string>;
    return trans[id.toLowerCase()] || this.fs.getNode(id)?.name || id;
  }
}
