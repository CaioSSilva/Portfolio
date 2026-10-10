import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HermesAppActionsService } from './hermes-app-actions';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import { FileSystem } from './file-system';
import { HermesChatService } from './hermes-chat';
import { FileItem } from '../models/file';
import { Process } from '../models/process';
import { signal } from '@angular/core';

describe('HermesAppActionsService', () => {
  let service: HermesAppActionsService;
  let httpMock: HttpTestingController;
  let appRegistrySpy: { getAppById: ReturnType<typeof vi.fn> };
  let processManagerSpy: {
    open: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    closeAllInstancesById: ReturnType<typeof vi.fn>;
    openFile: ReturnType<typeof vi.fn>;
    minimizeAllVisible: ReturnType<typeof vi.fn>;
    focus: ReturnType<typeof vi.fn>;
    processes: ReturnType<typeof signal<Process[]>>;
  };
  let fileSystemSpy: {
    ensureLoaded: ReturnType<typeof vi.fn>;
    searchFiles: ReturnType<typeof vi.fn>;
    getFileExtension: ReturnType<typeof vi.fn>;
  };
  let chatSpy: { injectSystemMessage: ReturnType<typeof vi.fn> };

  const mockPhoto: FileItem = {
    id: 'photo1',
    name: 'sunset.webp',
    type: 'file',
    icon: 'fas fa-image',
    url: '/data/photos/sunset.webp',
  };

  const mockDoc: FileItem = {
    id: 'doc1',
    name: 'resume.pdf',
    type: 'file',
    icon: 'fas fa-file',
    url: '/data/documents/resume.pdf',
  };

  beforeEach(() => {
    appRegistrySpy = { getAppById: vi.fn() };
    processManagerSpy = {
      open: vi.fn(),
      close: vi.fn(),
      closeAllInstancesById: vi.fn(),
      openFile: vi.fn(),
      minimizeAllVisible: vi.fn(),
      focus: vi.fn(),
      processes: signal<Process[]>([]),
    };
    fileSystemSpy = {
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      searchFiles: vi.fn(),
      getFileExtension: vi.fn(),
    };
    chatSpy = { injectSystemMessage: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        HermesAppActionsService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppRegistry, useValue: appRegistrySpy },
        { provide: ProcessManager, useValue: processManagerSpy },
        { provide: FileSystem, useValue: fileSystemSpy },
        { provide: HermesChatService, useValue: chatSpy },
      ],
    });

    service = TestBed.inject(HermesAppActionsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('open_app', () => {
    it('opens the app via processManager when found', () => {
      const mockApp = { id: 'terminal', title: 'Terminal', data: { id: '1' } };
      appRegistrySpy.getAppById.mockReturnValue(mockApp);

      service.execute({ type: 'open_app', payload: { app: 'terminal' } });

      expect(appRegistrySpy.getAppById).toHaveBeenCalledWith('terminal');
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockApp, mockApp.data);
    });

    it('throws when app payload is missing', () => {
      expect(() => service.execute({ type: 'open_app', payload: {} })).toThrow('Missing app');
    });

    it('throws when app is not found in registry', () => {
      appRegistrySpy.getAppById.mockReturnValue(undefined);
      expect(() => service.execute({ type: 'open_app', payload: { app: 'ghost' } })).toThrow(
        'App not found: ghost',
      );
    });
  });

  describe('close_app', () => {
    it('closes all instances by app id', () => {
      service.execute({ type: 'close_app', payload: { app: 'terminal' } });
      expect(processManagerSpy.closeAllInstancesById).toHaveBeenCalledWith('terminal');
    });

    it('throws when app payload is missing', () => {
      expect(() => service.execute({ type: 'close_app', payload: {} })).toThrow('Missing app');
    });
  });

  describe('window management actions', () => {
    it('minimize_all calls minimizeAllVisible', () => {
      service.execute({ type: 'minimize_all' });
      expect(processManagerSpy.minimizeAllVisible).toHaveBeenCalled();
    });

    it('close_all_apps closes all processes', () => {
      processManagerSpy.processes.set([
        { id: 'proc-1', appId: 'terminal' } as Process,
        { id: 'proc-2', appId: 'files' } as Process,
      ]);

      service.execute({ type: 'close_all_apps' });
      expect(processManagerSpy.close).toHaveBeenCalledWith('proc-1');
      expect(processManagerSpy.close).toHaveBeenCalledWith('proc-2');
    });

    it('focus_app focuses existing process', () => {
      processManagerSpy.processes.set([
        { id: 'proc-1', appId: 'terminal' } as Process,
      ]);

      service.execute({ type: 'focus_app', payload: { app: 'terminal' } });
      expect(processManagerSpy.focus).toHaveBeenCalledWith('proc-1');
    });

    it('focus_app throws when app is not running', () => {
      processManagerSpy.processes.set([]);
      expect(() => service.execute({ type: 'focus_app', payload: { app: 'terminal' } })).toThrow(
        'App not running: terminal',
      );
    });

    it('focus_app throws when app payload is missing', () => {
      expect(() => service.execute({ type: 'focus_app', payload: {} })).toThrow('Missing app');
    });
  });

  describe('browser actions', () => {
    it('browser_open_url opens firefox with given url', () => {
      const mockFirefox = { id: 'firefox', title: 'Firefox' };
      appRegistrySpy.getAppById.mockReturnValue(mockFirefox);

      service.execute({ type: 'browser_open_url', payload: { url: 'https://github.com' } });
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockFirefox, { url: 'https://github.com' });
    });

    it('browser_open_url throws when url is missing', () => {
      expect(() => service.execute({ type: 'browser_open_url', payload: {} })).toThrow('Missing url');
    });

    it('browser_search opens firefox with google search url', () => {
      const mockFirefox = { id: 'firefox', title: 'Firefox' };
      appRegistrySpy.getAppById.mockReturnValue(mockFirefox);

      service.execute({ type: 'browser_search', payload: { query: 'angular signals' } });
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockFirefox, {
        url: 'https://www.google.com/search?q=angular%20signals',
      });
    });

    it('browser_search throws when query is missing', () => {
      expect(() => service.execute({ type: 'browser_search', payload: {} })).toThrow('Missing search query');
    });
  });

  describe('open_file', () => {
    it('opens the file via processManager', () => {
      service.execute({
        type: 'open_file',
        payload: { name: 'Resume.pdf', url: '/data/Resume.pdf' },
      });

      expect(processManagerSpy.openFile).toHaveBeenCalledWith({
        id: 'Resume.pdf',
        name: 'Resume.pdf',
        type: 'file',
        icon: 'fas fa-file',
        url: '/data/Resume.pdf',
      });
    });

    it('throws when name or url is missing', () => {
      expect(() => service.execute({ type: 'open_file', payload: { name: 'x' } })).toThrow(
        'Missing file info',
      );
      expect(() => service.execute({ type: 'open_file', payload: { url: '/x' } })).toThrow(
        'Missing file info',
      );
    });
  });

  describe('photos_open_photo', () => {
    it('finds and opens the photo via processManager', async () => {
      fileSystemSpy.searchFiles.mockReturnValue([mockPhoto]);
      fileSystemSpy.getFileExtension.mockReturnValue('webp');

      service.execute({ type: 'photos_open_photo', payload: { query: 'sunset' } });
      await vi.waitFor(() =>
        expect(processManagerSpy.openFile).toHaveBeenCalledWith(mockPhoto),
      );
    });

    it('throws when query is missing', () => {
      expect(() => service.execute({ type: 'photos_open_photo', payload: {} })).toThrow(
        'Missing search query',
      );
    });
  });

  describe('docs_open_document', () => {
    it('finds and opens the document via processManager', async () => {
      fileSystemSpy.searchFiles.mockReturnValue([mockDoc]);
      fileSystemSpy.getFileExtension.mockReturnValue('pdf');

      service.execute({ type: 'docs_open_document', payload: { query: 'resume' } });
      await vi.waitFor(() =>
        expect(processManagerSpy.openFile).toHaveBeenCalledWith(mockDoc),
      );
    });

    it('throws when query is missing', () => {
      expect(() => service.execute({ type: 'docs_open_document', payload: {} })).toThrow(
        'Missing search query',
      );
    });
  });

  describe('terminal_exec', () => {
    it('opens terminal with the given command as data', () => {
      const mockTerminal = { id: 'terminal', title: 'Terminal' };
      appRegistrySpy.getAppById.mockReturnValue(mockTerminal);

      service.execute({ type: 'terminal_exec', payload: { command: 'neofetch' } });
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockTerminal, { command: 'neofetch' });
    });

    it('throws when command is missing', () => {
      expect(() => service.execute({ type: 'terminal_exec', payload: {} })).toThrow(
        'Missing command',
      );
    });

    it('throws when terminal app is not registered', () => {
      appRegistrySpy.getAppById.mockReturnValue(undefined);
      expect(() =>
        service.execute({ type: 'terminal_exec', payload: { command: 'ls' } }),
      ).toThrow('Terminal not found');
    });
  });

  describe('files_search', () => {
    it('opens files with the given search query as data', () => {
      const mockFiles = { id: 'files', title: 'Files' };
      appRegistrySpy.getAppById.mockReturnValue(mockFiles);

      service.execute({ type: 'files_search', payload: { query: 'project' } });
      expect(processManagerSpy.open).toHaveBeenCalledWith(mockFiles, { searchQuery: 'project' });
    });

    it('throws when query is missing', () => {
      expect(() => service.execute({ type: 'files_search', payload: {} })).toThrow(
        'Missing search query',
      );
    });

    it('throws when files app is not registered', () => {
      appRegistrySpy.getAppById.mockReturnValue(undefined);
      expect(() =>
        service.execute({ type: 'files_search', payload: { query: 'test' } }),
      ).toThrow('Files not found');
    });
  });

  describe('read_file_content', () => {
    it('ensures filesystem is loaded and fetches content', async () => {
      service.execute({ type: 'read_file_content', payload: { path: '/data/notes.md' } });

      await Promise.resolve();

      expect(fileSystemSpy.ensureLoaded).toHaveBeenCalled();
      const req = httpMock.expectOne('/data/notes.md');
      req.flush('# Notes\nHello world');

      await vi.waitFor(() =>
        expect(chatSpy.injectSystemMessage).toHaveBeenCalledWith(
          '/data/notes.md',
          '# Notes\nHello world',
        ),
      );
    });

    it('throws when path is missing', () => {
      expect(() => service.execute({ type: 'read_file_content', payload: {} })).toThrow(
        'Missing file path',
      );
    });
  });
});
