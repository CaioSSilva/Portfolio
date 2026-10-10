import {
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
  ElementRef,
  computed,
  ChangeDetectionStrategy,
  effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { LanguageService } from '../../core/services/language';
import { TerminalCommands } from '../../core/services/terminal-commands';
import { Base } from '../../core/models/base';
import { CommandResult, TerminalLine } from '../../core/models/terminal';
import { FileSystem } from '../../core/services/file-system';

@Component({
  selector: 'app-terminal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './terminal.html',
})
export class Terminal extends Base {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly commandService = inject(TerminalCommands);
  private readonly fileSystem = inject(FileSystem);
  readonly lang = inject(LanguageService);

  readonly currentPath = signal('home');
  readonly history = signal<TerminalLine[]>([]);

  private readonly commandHistory = signal<string[]>([]);
  private readonly historyIndex = signal(-1);

  private readonly termInput = viewChild.required<ElementRef<HTMLInputElement>>('termInput');
  private readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  readonly prompt = computed(() => `user@caios:${this.getTranslatedName(this.currentPath())}$`);

  constructor() {
    super();
    effect(() => {
      const rawData = this.data();
      if (rawData && typeof rawData === 'object' && 'command' in rawData) {
        const cmd = (rawData as { command: string }).command;
        if (cmd) queueMicrotask(() => this.runCommand(cmd));
      }
    });
  }

  async handleCommand(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (!value) return;

    this.updateCommandHistory(value);
    const result = await this.commandService.execute(value, this.currentPath());

    this.processCommandResult(result, value);

    input.value = '';
    this.scrollToBottom();
  }

  private processCommandResult(result: CommandResult, command: string): void {
    if (result.action === 'CLEAR_ACTION') {
      this.history.set([]);
      return;
    }

    const oldPath = this.currentPath();
    if (result.newPath) this.currentPath.set(result.newPath);

    this.addHistoryLine(command, result.output || '', oldPath);
  }

  private async runCommand(command: string): Promise<void> {
    const result = await this.commandService.execute(command, this.currentPath());
    this.processCommandResult(result, command);
    this.scrollToBottom();
  }

  private updateCommandHistory(value: string): void {
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

  private autocompleteCommand(input: HTMLInputElement, parts: string[], lastPart: string): void {
    const matches = Object.keys(this.lang.t().terminal.commands).filter((cmd) =>
      cmd.startsWith(lastPart.toLowerCase()),
    );
    this.applyMatch(input, parts, matches);
  }

  private async autocompleteFile(
    input: HTMLInputElement,
    parts: string[],
    lastPart: string,
  ): Promise<void> {
    const segments = lastPart.split('/');
    const prefix = segments.pop()?.toLowerCase() || '';
    const dirPath = segments.join('/');

    const searchDir = await this.resolveSearchDir(dirPath);
    if (!searchDir) return;

    const matches = this.fileSystem
      .getChildren(searchDir)
      .map((file) => ({ name: this.getTranslatedName(file.id), isFolder: file.type === 'folder' }))
      .filter((file) => file.name.toLowerCase().startsWith(prefix))
      .map((file) => (file.isFolder ? `${file.name}/` : file.name));

    this.applyMatch(input, parts, matches, dirPath);
  }

  private async resolveSearchDir(dirPath: string): Promise<string | null> {
    if (!dirPath) return this.currentPath();
    const result = await this.commandService.execute(`cd ${dirPath}`, this.currentPath());
    return result.newPath || null;
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
    afterNextRender(
      () => {
        const container = this.scrollContainer().nativeElement;
        container.scrollTop = container.scrollHeight;
      },
      { injector: this.injector },
    );
  }

  focusInput(): void {
    this.termInput().nativeElement.focus();
  }

  onInputFocus(): void {
    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scrollToBottom());
  }

  getTranslatedName(id: string): string {
    const fileTranslations = this.lang.t().files as Record<string, string>;
    return fileTranslations[id.toLowerCase()] || this.fileSystem.getNode(id)?.name || id;
  }
}
