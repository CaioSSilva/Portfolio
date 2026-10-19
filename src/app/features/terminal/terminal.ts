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
import { TerminalAutocomplete } from '../../core/services/terminal-autocomplete';
import { TerminalHistoryService } from '../../core/services/terminal-history';
import { ScreenService } from '../../core/services/screen';
import { Base } from '../../core/models/base';
import {
  CommandResult,
  TerminalLine,
  TerminalSuggestion,
  TerminalTouchKey,
} from '../../core/models/terminal';
import { FileSystem } from '../../core/services/file-system';

@Component({
  selector: 'app-terminal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './terminal.html',
  providers: [TerminalHistoryService],
})
export class Terminal extends Base {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly commandService = inject(TerminalCommands);
  private readonly fileSystem = inject(FileSystem);
  private readonly autocompleteService = inject(TerminalAutocomplete);
  readonly historyService = inject(TerminalHistoryService);
  readonly lang = inject(LanguageService);
  readonly screen = inject(ScreenService);

  readonly currentPath = signal('home');
  readonly history = signal<TerminalLine[]>([]);
  readonly suggestions = signal<TerminalSuggestion[]>([]);
  readonly isHistorySheetOpen = signal(false);
  readonly isInputFocused = signal(false);

  private readonly termInput = viewChild.required<ElementRef<HTMLInputElement>>('termInput');
  private readonly scrollContainer = viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  readonly prompt = computed(() => `user@caios:${this.getPromptPath(this.currentPath())}$`);

  readonly touchKeys: TerminalTouchKey[] = [
    { label: 'Tab', key: 'Tab', action: 'key' },
    { label: '↑', key: 'ArrowUp', action: 'key' },
    { label: '↓', key: 'ArrowDown', action: 'key' },
    { label: 'Ctrl+C', key: 'c', action: 'ctrl' },
    { label: '/', key: '/', action: 'key' },
    { label: '~', key: '~', action: 'key' },
    { label: '-', key: '-', action: 'key' },
  ];

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
    input.value = '';
    await this.submitValue(value);
  }

  private async submitValue(value: string): Promise<void> {
    if (!value) return;

    this.historyService.push(value);
    const result = await this.commandService.execute(value, this.currentPath());

    this.processCommandResult(result, value);
    this.suggestions.set([]);
    this.scrollToBottom();
  }

  private async submitCurrentInput(): Promise<void> {
    const input = this.termInput().nativeElement;
    const value = input.value.trim();
    input.value = '';
    await this.submitValue(value);
  }

  async handleInput(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const newSuggestions = await this.autocompleteService.getSuggestions(
      input.value,
      this.currentPath(),
    );
    this.suggestions.set(newSuggestions);
  }

  handleBeforeInput(event: InputEvent): void {
    if (event.inputType === 'insertLineBreak') {
      event.preventDefault();
      this.submitCurrentInput();
    }
  }

  private processCommandResult(result: CommandResult, command: string): void {
    if (result.blurInput) {
      this.termInput().nativeElement.blur();
    }

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

  handleKeydown(event: KeyboardEvent): void {
    const actions: Record<string, () => void> = {
      Tab: () => {
        event.preventDefault();
        this.applyFirstSuggestion();
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

  async applySuggestion(suggestion: TerminalSuggestion): Promise<void> {
    const input = this.termInput().nativeElement;
    input.value = this.autocompleteService.resolveMatch(input.value, suggestion);
    input.focus();
    await this.handleInputUpdate(input.value);
  }

  onTouchKey(touchKey: TerminalTouchKey): void {
    if (touchKey.action === 'ctrl' && touchKey.key === 'c') {
      this.termInput().nativeElement.value = '';
      this.suggestions.set([]);
      return;
    }

    const keyHandlers: Record<string, () => void> = {
      Tab: () => this.applyFirstSuggestion(),
      ArrowUp: () => this.navigateHistory(1),
      ArrowDown: () => this.navigateHistory(-1),
    };

    const handler = keyHandlers[touchKey.key];
    if (handler) {
      handler();
      return;
    }

    this.insertTouchChar(touchKey.key);
  }

  private insertTouchChar(char: string): void {
    const input = this.termInput().nativeElement;
    input.value += char;
    input.focus();
    this.handleInputUpdate(input.value);
  }

  private async handleInputUpdate(value: string): Promise<void> {
    const newSuggestions = await this.autocompleteService.getSuggestions(value, this.currentPath());
    this.suggestions.set(newSuggestions);
  }

  runFromHistory(command: string): void {
    this.isHistorySheetOpen.set(false);
    this.submitValue(command);
  }

  onDirTap(dirName: string): void {
    this.submitValue(`cd ${dirName}`);
  }

  onFileTap(fileName: string): void {
    this.submitValue(`open ${fileName}`);
  }

  private async applyFirstSuggestion(): Promise<void> {
    const input = this.termInput().nativeElement;
    const value = input.value;

    if (!value.trim()) {
      const commands = this.autocompleteService.getCommandNames();
      this.addHistoryLine('', commands.join('  '), this.currentPath());
      return;
    }

    const current = await this.autocompleteService.getSuggestions(value, this.currentPath());
    if (current.length === 1) {
      await this.applySuggestion(current[0]);
    } else if (current.length > 1) {
      this.addHistoryLine(value, current.map((s) => s.label).join('  '), this.currentPath());
    }
  }

  private navigateHistory(direction: 1 | -1): void {
    const value = this.historyService.navigate(direction);
    if (value !== null) {
      this.termInput().nativeElement.value = value;
    }
  }

  private addHistoryLine(command: string, output: string, pathId: string): void {
    this.history.update((prev) => [...prev, { command, output, path: this.getPromptPath(pathId) }]);
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
    this.isInputFocused.set(true);
    timer(100)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.scrollToBottom());
  }

  onInputBlur(): void {
    this.isInputFocused.set(false);
  }

  onOutputAreaClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('[data-interactive]')) return;
    this.focusInput();
  }

  getPromptPath(pathId: string): string {
    if (pathId === 'home') return '~';
    if (pathId === 'root') return '/';
    const name = this.getTranslatedName(pathId);
    return `~/${name}`;
  }

  getTranslatedName(id: string): string {
    const fileTranslations = this.lang.t().files as Record<string, string>;
    return fileTranslations[id.toLowerCase()] || this.fileSystem.getNode(id)?.name || id;
  }

  extractDirName(item: string): string {
    return item.replace('[DIR]', '').trim();
  }

  extractFileName(item: string): string {
    return item.replace('[FILE]', '').trim();
  }
}
