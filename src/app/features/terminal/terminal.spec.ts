import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Terminal } from './terminal';
import { TerminalComands } from '../../core/services/terminal-comands';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { Theme } from '../../core/services/theme';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';

describe('Terminal', () => {
  let component: Terminal;
  let fixture: ComponentFixture<Terminal>;
  let commandSpy: { execute: ReturnType<typeof vi.fn> };
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
        { provide: TerminalComands, useValue: commandSpy },
        LanguageService,
        { provide: FileSystem, useValue: fsSpy },
        Theme,
        ProcessManager,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
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

  it('should handleCommand execute command and add to history', async () => {
    const input = document.createElement('input');
    input.value = 'help';
    const event = { target: input } as unknown as Event;

    await component.handleCommand(event);

    expect(commandSpy.execute).toHaveBeenCalledWith('help', 'home');
    expect(component.history().length).toBe(1);
    expect(component.history()[0].command).toBe('help');
    expect(input.value).toBe('');
  });

  it('should handleCommand do nothing when input is empty', async () => {
    const input = document.createElement('input');
    input.value = '   ';
    const event = { target: input } as unknown as Event;
    await component.handleCommand(event);
    expect(commandSpy.execute).not.toHaveBeenCalled();
  });

  it('should handleCommand CLEAR_ACTION empties history', async () => {
    commandSpy.execute.mockResolvedValue({ action: 'CLEAR_ACTION' });
    component.history.set([{ command: 'old', output: '', path: 'home' }]);

    const input = document.createElement('input');
    input.value = 'clear';
    await component.handleCommand({ target: input } as unknown as Event);

    expect(component.history()).toEqual([]);
  });

  it('should handleCommand update currentPath when newPath is returned', async () => {
    commandSpy.execute.mockResolvedValue({ output: '', action: 'NONE', newPath: 'documents' });

    const input = document.createElement('input');
    input.value = 'cd documents';
    await component.handleCommand({ target: input } as unknown as Event);

    expect(component.currentPath()).toBe('documents');
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
});
