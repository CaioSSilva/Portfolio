import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Terminal } from './terminal';
import { TerminalCommands } from '../../core/services/terminal-commands';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { Theme } from '../../core/services/theme';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';
import { TerminalAutocomplete } from '../../core/services/terminal-autocomplete';

describe('Terminal', () => {
  let component: Terminal;
  let fixture: ComponentFixture<Terminal>;
  let commandSpy: { execute: ReturnType<typeof vi.fn> };
  let autocompleteSpy: {
    getSuggestions: ReturnType<typeof vi.fn>;
    resolveMatch: ReturnType<typeof vi.fn>;
    getCommandNames: ReturnType<typeof vi.fn>;
  };
  let fsSpy: {
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getChildren: ReturnType<typeof vi.fn>;
    tree: ReturnType<typeof vi.fn>;
    getNode: ReturnType<typeof vi.fn>;
    getFileExtension: ReturnType<typeof vi.fn>;
    getFilesByExtensions: ReturnType<typeof vi.fn>;
    getPath: ReturnType<typeof vi.fn>;
    getFolderName: ReturnType<typeof vi.fn>;
    searchFiles: ReturnType<typeof vi.fn>;
    formatFileSize: ReturnType<typeof vi.fn>;
    downloadFile: ReturnType<typeof vi.fn>;
    totalFiles: ReturnType<typeof vi.fn>;
    totalSize: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    isLoading: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    commandSpy = {
      execute: vi.fn().mockResolvedValue({ output: 'ok', action: 'NONE' }),
    };
    autocompleteSpy = {
      getSuggestions: vi.fn().mockResolvedValue([]),
      resolveMatch: vi.fn().mockReturnValue('help'),
      getCommandNames: vi.fn().mockReturnValue(['help', 'ls', 'clear']),
    };
    fsSpy = {
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getChildren: vi.fn().mockReturnValue([]),
      tree: vi.fn().mockReturnValue(null),
      getNode: vi.fn().mockReturnValue(undefined),
      getFileExtension: vi.fn().mockReturnValue(''),
      getFilesByExtensions: vi.fn().mockReturnValue([]),
      getPath: vi.fn().mockReturnValue(''),
      getFolderName: vi.fn().mockReturnValue(''),
      searchFiles: vi.fn().mockReturnValue([]),
      formatFileSize: vi.fn().mockReturnValue('1 KB'),
      downloadFile: vi.fn(),
      totalFiles: vi.fn().mockReturnValue(0),
      totalSize: vi.fn().mockReturnValue(0),
      error: vi.fn().mockReturnValue(null),
      isLoading: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [Terminal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TerminalCommands, useValue: commandSpy },
        LanguageService,
        { provide: FileSystem, useValue: fsSpy },
        Theme,
        ProcessManager,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
        { provide: TerminalAutocomplete, useValue: autocompleteSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Terminal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to home path', () => {
    expect(component.currentPath()).toBe('home');
  });

  it('should have empty history initially', () => {
    expect(component.history()).toEqual([]);
  });

  it('should prompt include current path translated name', () => {
    expect(component.prompt()).toContain('user@caios:');
  });

  it('should getPromptPath use the translated folder name', () => {
    TestBed.inject(LanguageService).setLanguage('pt');
    fsSpy.getNode.mockReturnValue({ id: 'photos', name: 'Photos', type: 'folder' });
    expect(component.getPromptPath('photos')).toBe('~/Fotos');
    expect(component.getPromptPath('home')).toBe('~');
    expect(component.getPromptPath('root')).toBe('/');
  });

  it('should handleCommand execute command and add to history', async () => {
    const input = document.createElement('input');
    input.value = 'help';
    const event: Partial<Event> = { target: input };

    await component.handleCommand(event as Event);

    expect(commandSpy.execute).toHaveBeenCalledWith('help', 'home');
    expect(component.history().length).toBe(1);
    expect(component.history()[0].command).toBe('help');
    expect(input.value).toBe('');
  });

  it('should handleCommand do nothing when input is empty', async () => {
    const input = document.createElement('input');
    input.value = '   ';
    const event: Partial<Event> = { target: input };
    await component.handleCommand(event as Event);
    expect(commandSpy.execute).not.toHaveBeenCalled();
  });

  it('should handleCommand CLEAR_ACTION empties history', async () => {
    commandSpy.execute.mockResolvedValue({ action: 'CLEAR_ACTION' });
    component.history.set([{ command: 'old', output: '', path: 'home' }]);

    const input = document.createElement('input');
    input.value = 'clear';
    const event: Partial<Event> = { target: input };
    await component.handleCommand(event as Event);

    expect(component.history()).toEqual([]);
  });

  it('should handleCommand update currentPath when newPath is returned', async () => {
    commandSpy.execute.mockResolvedValue({ output: '', action: 'NONE', newPath: 'documents' });

    const input = document.createElement('input');
    input.value = 'cd documents';
    const event: Partial<Event> = { target: input };
    await component.handleCommand(event as Event);

    expect(component.currentPath()).toBe('documents');
  });

  it('should handleCommand clear suggestions after execution', async () => {
    component.suggestions.set([{ label: 'help', value: 'help' }]);
    const input = document.createElement('input');
    input.value = 'help';
    const event: Partial<Event> = { target: input };
    await component.handleCommand(event as Event);
    expect(component.suggestions()).toEqual([]);
  });

  it('should applySuggestion refresh suggestions after applying', async () => {
    autocompleteSpy.getSuggestions.mockResolvedValue([
      { label: 'Documents/', value: 'Documents/' },
    ]);
    autocompleteSpy.resolveMatch.mockReturnValue('cd Documents/');
    component.suggestions.set([{ label: 'Documents/', value: 'Documents/' }]);
    await component.applySuggestion({ label: 'Documents/', value: 'Documents/' });
    expect(autocompleteSpy.getSuggestions).toHaveBeenCalled();
  });

  it('should handleInput update suggestions via autocomplete service', async () => {
    autocompleteSpy.getSuggestions.mockResolvedValue([{ label: 'ls', value: 'ls' }]);
    const input = document.createElement('input');
    input.value = 'l';
    const event: Partial<Event> = { target: input };
    await component.handleInput(event as Event);
    expect(component.suggestions().length).toBe(1);
    expect(component.suggestions()[0].value).toBe('ls');
  });

  it('should getTranslatedName return translation when available', () => {
    const result = component.getTranslatedName('home');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should getTranslatedName return node name as fallback', () => {
    fsSpy.getNode.mockReturnValue({ id: 'x', name: 'Custom', type: 'folder', icon: 'folder' });
    const result = component.getTranslatedName('x');
    expect(result).toBe('Custom');
  });

  it('should getTranslatedName return id when no translation or node', () => {
    fsSpy.getNode.mockReturnValue(undefined);
    const result = component.getTranslatedName('unknown-xyz-999');
    expect(result).toBe('unknown-xyz-999');
  });

  it('extractDirName strips [DIR] prefix', () => {
    expect(component.extractDirName('[DIR] Documents')).toBe('Documents');
  });

  it('extractFileName strips [FILE] prefix', () => {
    expect(component.extractFileName('[FILE] readme.txt')).toBe('readme.txt');
  });

  it('onDirTap executes cd and adds to history', async () => {
    component.onDirTap('Documents');
    await fixture.whenStable();
    expect(commandSpy.execute).toHaveBeenCalledWith('cd Documents', 'home');
    expect(component.historyService.commands()[0]).toBe('cd Documents');
  });

  it('onFileTap executes open and adds to history', async () => {
    component.onFileTap('readme.txt');
    await fixture.whenStable();
    expect(commandSpy.execute).toHaveBeenCalledWith('open readme.txt', 'home');
  });

  it('runFromHistory executes the command and closes history sheet', async () => {
    component.isHistorySheetOpen.set(true);
    component.runFromHistory('whoami');
    await fixture.whenStable();
    expect(component.isHistorySheetOpen()).toBe(false);
    expect(commandSpy.execute).toHaveBeenCalledWith('whoami', 'home');
  });

  it('tracks input focus state', () => {
    component.onInputFocus();
    expect(component.isInputFocused()).toBe(true);
    component.onInputBlur();
    expect(component.isInputFocused()).toBe(false);
  });

  it('should blur input when command returns blurInput', async () => {
    commandSpy.execute.mockResolvedValue({ output: 'opening...', action: 'NONE', blurInput: true });
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const blurSpy = vi.spyOn(input, 'blur');

    input.value = 'open file.pdf';
    const event: Partial<Event> = { target: input };
    await component.handleCommand(event as Event);

    expect(blurSpy).toHaveBeenCalled();
  });

  it('should list all available commands when Tab is pressed on empty input', async () => {
    autocompleteSpy.getCommandNames.mockReturnValue(['help', 'ls', 'clear']);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = '';

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.handleKeydown(event);
    await fixture.whenStable();

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.history().length).toBe(1);
    expect(component.history()[0].output).toContain('help  ls  clear');
  });

  it('should list multiple matching suggestions when Tab is pressed with prefix', async () => {
    autocompleteSpy.getSuggestions.mockResolvedValue([
      { label: 'Documents/', value: 'Documents/' },
      { label: 'Downloads/', value: 'Downloads/' },
    ]);
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'cd D';

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    component.handleKeydown(event);
    await fixture.whenStable();

    expect(component.history().length).toBe(1);
    expect(component.history()[0].output).toContain('Documents/  Downloads/');
  });
});
