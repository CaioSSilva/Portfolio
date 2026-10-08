import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TerminalCommands } from './terminal-commands';
import { LanguageService } from './language';
import { Theme } from './theme';
import { FileSystem } from './file-system';
import { ProcessManager } from './process-manager';
import { NotificationService } from './notification';
import { AppRegistry } from './app-registry';
import { Sound } from './sound';
import { FileItem } from '../models/file';

describe('TerminalCommands', () => {
  let service: TerminalCommands;
  let fileSystemMock: {
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getChildren: ReturnType<typeof vi.fn>;
    tree: ReturnType<typeof vi.fn>;
  };
  let processManagerMock: { openFile: ReturnType<typeof vi.fn> };
  let themeMock: { toggle: ReturnType<typeof vi.fn>; isDarkMode: ReturnType<typeof vi.fn> };

  const mockFolder: FileItem = {
    id: 'docs',
    name: 'Documents',
    type: 'folder',
    icon: 'folder',
    children: [
      { id: 'readme', name: 'readme.txt', type: 'file', icon: 'file', url: '/readme.txt' },
    ],
  };

  const mockTree: FileItem = {
    id: 'root',
    name: 'root',
    type: 'folder',
    icon: 'folder',
    children: [
      {
        id: 'home',
        name: 'home',
        type: 'folder',
        icon: 'folder',
        children: [mockFolder],
      },
    ],
  };

  beforeEach(() => {
    fileSystemMock = {
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getChildren: vi.fn().mockReturnValue([]),
      tree: vi.fn().mockReturnValue(mockTree),
    };
    processManagerMock = { openFile: vi.fn() };
    themeMock = { toggle: vi.fn(), isDarkMode: vi.fn().mockReturnValue(false) };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TerminalCommands,
        LanguageService,
        { provide: Theme, useValue: themeMock },
        { provide: FileSystem, useValue: fileSystemMock },
        { provide: ProcessManager, useValue: processManagerMock },
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    });
    service = TestBed.inject(TerminalCommands);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should execute help command', async () => {
    const result = await service.execute('help', 'home');
    expect(result.output).toBeDefined();
    expect(result.action).toBe('NONE');
  });

  it('should execute clear command', async () => {
    const result = await service.execute('clear', 'home');
    expect(result.action).toBe('CLEAR_ACTION');
  });

  it('should execute whoami command', async () => {
    const result = await service.execute('whoami', 'home');
    expect(result.output).toContain('Caio Souza Silva');
  });

  it('should execute date command and return a date string', async () => {
    const result = await service.execute('date', 'home');
    expect(result.action).toBe('NONE');
    expect(result.output).toBeDefined();
    expect(result.output!.length).toBeGreaterThan(0);
  });

  it('should execute neofetch command', async () => {
    const result = await service.execute('neofetch', 'home');
    expect(result.action).toBe('NONE');
    expect(result.output).toContain('Cai_OS');
  });

  it('should execute about command', async () => {
    const result = await service.execute('about', 'home');
    expect(result.action).toBe('NONE');
    expect(result.output).toContain('Cai_OS');
  });

  it('should execute theme command and toggle theme', async () => {
    const result = await service.execute('theme', 'home');
    expect(themeMock.toggle).toHaveBeenCalled();
    expect(result.action).toBe('NONE');
    expect(result.output).toContain('Theme:');
  });

  it('should execute ls command with children', async () => {
    fileSystemMock.getChildren.mockReturnValue([
      { id: 'docs', name: 'Documents', type: 'folder', icon: 'folder' },
      { id: 'pic', name: 'pic.jpg', type: 'file', icon: 'file' },
    ]);
    const result = await service.execute('ls', 'home');
    expect(result.action).toBe('NONE');
    expect(result.output).toContain('[DIR]');
  });

  it('should execute ls command with empty directory', async () => {
    fileSystemMock.getChildren.mockReturnValue([]);
    const result = await service.execute('ls', 'home');
    expect(result.output).toBe('');
  });

  it('should execute cd with no arg to return home', async () => {
    const result = await service.execute('cd', 'docs');
    expect(result.newPath).toBe('home');
  });

  it('should execute cd with ~ to return home', async () => {
    const result = await service.execute('cd ~', 'docs');
    expect(result.newPath).toBe('home');
  });

  it('should execute cd with invalid path and return error', async () => {
    const result = await service.execute('cd /nonexistent', 'home');
    expect(result.output).toBeDefined();
    expect(result.newPath).toBeUndefined();
  });

  it('should execute open without arguments and return error', async () => {
    const result = await service.execute('open', 'home');
    expect(result.action).toBe('NONE');
    expect(result.output).toBeDefined();
  });

  it('should return not found for unknown command', async () => {
    const result = await service.execute('nonexistentcmd', 'home');
    expect(result.output).toContain('nonexistentcmd');
  });

  it('should resolve path / to root', () => {
    const result = service.resolvePath('/', 'home');
    expect(result).toBe('root');
  });

  it('should resolve path ~ to home', () => {
    const result = service.resolvePath('~', 'home');
    expect(result).toBe('home');
  });
});
