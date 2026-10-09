import { TestBed } from '@angular/core/testing';
import { HermesAppActionsService } from './hermes-app-actions';
import { AppRegistry } from './app-registry';
import { ProcessManager } from './process-manager';
import { FileSystem } from './file-system';
import { FileItem } from '../models/file';

describe('HermesAppActionsService', () => {
  let service: HermesAppActionsService;
  let appRegistrySpy: { getAppById: ReturnType<typeof vi.fn> };
  let processManagerSpy: {
    open: ReturnType<typeof vi.fn>;
    closeAllInstancesById: ReturnType<typeof vi.fn>;
    openFile: ReturnType<typeof vi.fn>;
  };
  let fileSystemSpy: {
    ensureLoaded: ReturnType<typeof vi.fn>;
    searchFiles: ReturnType<typeof vi.fn>;
    getFileExtension: ReturnType<typeof vi.fn>;
  };

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
      closeAllInstancesById: vi.fn(),
      openFile: vi.fn(),
    };
    fileSystemSpy = {
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      searchFiles: vi.fn(),
      getFileExtension: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HermesAppActionsService,
        { provide: AppRegistry, useValue: appRegistrySpy },
        { provide: ProcessManager, useValue: processManagerSpy },
        { provide: FileSystem, useValue: fileSystemSpy },
      ],
    });

    service = TestBed.inject(HermesAppActionsService);
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
});
