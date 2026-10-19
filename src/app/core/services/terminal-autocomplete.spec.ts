import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TerminalAutocomplete } from './terminal-autocomplete';
import { LanguageService } from './language';
import { TerminalCommands } from './terminal-commands';
import { FileSystem } from './file-system';
import { Theme } from './theme';
import { ProcessManager } from './process-manager';
import { NotificationService } from './notification';
import { AppRegistry } from './app-registry';
import { Sound } from './sound';
import { TerminalSuggestion } from '../models/terminal';
import { FileItem } from '../models/file';

describe('TerminalAutocomplete', () => {
  let service: TerminalAutocomplete;
  let fileSystemMock: {
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getChildren: ReturnType<typeof vi.fn>;
    tree: ReturnType<typeof vi.fn>;
    getNode: ReturnType<typeof vi.fn>;
    getParentId: ReturnType<typeof vi.fn>;
  };
  let commandsMock: {
    execute: ReturnType<typeof vi.fn>;
    resolvePath: ReturnType<typeof vi.fn>;
  };

  const mockFiles: FileItem[] = [
    { id: 'documents', name: 'Documents', type: 'folder', icon: 'folder' },
    { id: 'readme', name: 'readme.txt', type: 'file', icon: 'file', url: '/readme.txt' },
  ];

  beforeEach(() => {
    fileSystemMock = {
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getChildren: vi.fn().mockReturnValue(mockFiles),
      tree: vi.fn().mockReturnValue(null),
      getNode: vi.fn().mockReturnValue(undefined),
      getParentId: vi.fn().mockReturnValue('root'),
    };
    commandsMock = {
      execute: vi.fn().mockResolvedValue({ output: '', newPath: 'home', action: 'NONE' }),
      resolvePath: vi.fn().mockReturnValue('home'),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TerminalAutocomplete,
        LanguageService,
        { provide: TerminalCommands, useValue: commandsMock },
        { provide: FileSystem, useValue: fileSystemMock },
        {
          provide: Theme,
          useValue: { toggle: vi.fn(), isDarkMode: vi.fn().mockReturnValue(false) },
        },
        { provide: ProcessManager, useValue: { openFile: vi.fn() } },
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    });
    service = TestBed.inject(TerminalAutocomplete);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getCommandNames returns known commands', () => {
    const names = service.getCommandNames();
    expect(names).toContain('help');
    expect(names).toContain('ls');
    expect(names).toContain('clear');
  });

  it('getSuggestions returns command suggestions for single-word input', async () => {
    const results = await service.getSuggestions('he', 'home');
    expect(results.some((r: TerminalSuggestion) => r.value === 'help')).toBe(true);
  });

  it('getSuggestions returns empty for non-matching prefix', async () => {
    const results = await service.getSuggestions('zzz', 'home');
    expect(results.length).toBe(0);
  });

  it('getSuggestions returns path suggestions when typing exact command without trailing space', async () => {
    const results = await service.getSuggestions('open', 'home');
    expect(results.length).toBe(2);
    expect(results.some((r: TerminalSuggestion) => r.label === 'Documents/')).toBe(true);
    expect(results.some((r: TerminalSuggestion) => r.label === 'readme.txt')).toBe(true);
  });

  it('getSuggestions returns path suggestions when command has trailing space', async () => {
    const results = await service.getSuggestions('open ', 'home');
    expect(results.length).toBe(2);
    expect(results.some((r: TerminalSuggestion) => r.label === 'Documents/')).toBe(true);
    expect(results.some((r: TerminalSuggestion) => r.label === 'readme.txt')).toBe(true);
  });

  it('getSuggestions returns only folders for cd command with trailing space', async () => {
    const results = await service.getSuggestions('cd ', 'home');
    expect(results.length).toBe(1);
    expect(results[0].label).toBe('Documents/');
  });

  it('getSuggestions returns empty for non-path command with trailing space', async () => {
    const results = await service.getSuggestions('clear ', 'home');
    expect(results.length).toBe(0);
  });

  it('getSuggestions returns empty for blank input', async () => {
    const results = await service.getSuggestions('', 'home');
    expect(results.length).toBe(0);
  });

  it('getSuggestions returns file suggestions for multi-word input', async () => {
    const results = await service.getSuggestions('cd d', 'home');
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.some(
        (r: TerminalSuggestion) => r.label.startsWith('Documents') || r.label.startsWith('d'),
      ),
    ).toBe(true);
  });

  it('resolveMatch sets last part of input to suggestion value', () => {
    const result = service.resolveMatch('cd doc', { label: 'Documents', value: 'Documents/' });
    expect(result).toBe('cd Documents/');
  });

  it('resolveMatch appends trailing space for single-word command input', () => {
    const result = service.resolveMatch('he', { label: 'help', value: 'help' });
    expect(result).toBe('help ');
  });

  it('resolveMatch appends path when single-word exact command input selects path suggestion', () => {
    const result = service.resolveMatch('open', { label: 'Documents/', value: 'Documents/' });
    expect(result).toBe('open Documents/');
  });
});
