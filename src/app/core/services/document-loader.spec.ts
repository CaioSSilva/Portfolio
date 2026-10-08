import { TestBed } from '@angular/core/testing';
import { DocumentLoaderService } from './document-loader';
import { FileSystem } from './file-system';
import { NotificationService } from './notification';
import { LanguageService } from './language';
import { FileItem, DOC_EXTENSIONS } from '../models/file';
import { LoadedDoc } from '../models/document';

const makeFile = (overrides: Partial<FileItem> = {}): FileItem => ({
  id: 'file-1',
  name: 'readme.md',
  type: 'file',
  icon: 'fas fa-file',
  url: '/data/readme.md',
  ...overrides,
});

describe('DocumentLoaderService', () => {
  let service: DocumentLoaderService;
  let fileSystemSpy: Pick<FileSystem, 'getFilesByExtensions' | 'getSiblingsByUrl'>;
  let notificationsSpy: Pick<NotificationService, 'show'>;
  let langService: LanguageService;

  beforeEach(() => {
    fileSystemSpy = {
      getFilesByExtensions: vi.fn().mockReturnValue([]),
      getSiblingsByUrl: vi.fn().mockReturnValue([]),
    };
    notificationsSpy = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        DocumentLoaderService,
        LanguageService,
        { provide: FileSystem, useValue: fileSystemSpy },
        { provide: NotificationService, useValue: notificationsSpy },
      ],
    });

    service = TestBed.inject(DocumentLoaderService);
    langService = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start with isLoading = true', () => {
      expect(service.isLoading()).toBe(true);
    });

    it('should start with hasError = false', () => {
      expect(service.hasError()).toBe(false);
    });
  });

  describe('loadAllDocs()', () => {
    it('should return files from fileSystem and set isLoading to false', () => {
      const files = [makeFile(), makeFile({ id: 'file-2', name: 'doc.txt' })];
      (fileSystemSpy.getFilesByExtensions as ReturnType<typeof vi.fn>).mockReturnValue(files);

      const result = service.loadAllDocs();

      expect(result).toEqual(files);
      expect(fileSystemSpy.getFilesByExtensions).toHaveBeenCalledWith(['pdf', ...DOC_EXTENSIONS]);
      expect(service.isLoading()).toBe(false);
    });

    it('should return empty array and set hasError on fileSystem throw', () => {
      (fileSystemSpy.getFilesByExtensions as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('FS error');
      });

      const result = service.loadAllDocs();

      expect(result).toEqual([]);
      expect(service.hasError()).toBe(true);
      expect(service.isLoading()).toBe(false);
      expect(notificationsSpy.show).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadLibraryForUrl()', () => {
    it('should return siblings from fileSystem and set isLoading to false', () => {
      const files = [makeFile({ id: 'sib-1', name: 'sibling.md' })];
      (fileSystemSpy.getSiblingsByUrl as ReturnType<typeof vi.fn>).mockReturnValue(files);

      const result = service.loadLibraryForUrl('/data/readme.md');

      expect(result).toEqual(files);
      expect(fileSystemSpy.getSiblingsByUrl).toHaveBeenCalledWith('/data/readme.md', [
        'pdf',
        ...DOC_EXTENSIONS,
      ]);
      expect(service.isLoading()).toBe(false);
    });

    it('should return empty array and set hasError on fileSystem throw', () => {
      (fileSystemSpy.getSiblingsByUrl as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('FS error');
      });

      const result = service.loadLibraryForUrl('/data/missing.md');

      expect(result).toEqual([]);
      expect(service.hasError()).toBe(true);
      expect(service.isLoading()).toBe(false);
      expect(notificationsSpy.show).toHaveBeenCalledTimes(1);
    });
  });

  describe('processFile()', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should resolve with fileType "pdf" for .pdf files (no fetch needed)', async () => {
      const file = makeFile({ name: 'report.pdf', url: '/data/report.pdf' });
      const result = await service.processFile(file);
      expect(result.fileType).toBe('pdf');
      expect(result.fileName).toBe('report.pdf');
    });

    it('should resolve with fileType "markdown" for .md files', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        text: async () => '# Hello',
      } as Response);

      const file = makeFile({ name: 'notes.md', url: '/data/notes.md' });
      const result: LoadedDoc = await service.processFile(file);

      expect(result.fileType).toBe('markdown');
      expect(result.textContent).toBe('# Hello');
    });

    it('should resolve with fileType "text" for other text files', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: true,
        text: async () => 'plain content',
      } as Response);

      const file = makeFile({ name: 'log.txt', url: '/data/log.txt' });
      const result: LoadedDoc = await service.processFile(file);

      expect(result.fileType).toBe('text');
      expect(result.textContent).toBe('plain content');
    });

    it('should return fileType "unsupported" when file has no url', async () => {
      const file = makeFile({ name: 'nourl.txt', url: undefined });
      const result = await service.processFile(file);
      expect(result.fileType).toBe('unsupported');
    });

    it('should return "unsupported" and set hasError on fetch failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const file = makeFile({ name: 'broken.md', url: '/data/broken.md' });
      const result = await service.processFile(file);

      expect(result.fileType).toBe('unsupported');
      expect(service.hasError()).toBe(true);
      expect(notificationsSpy.show).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetState()', () => {
    it('should reset isLoading to true and hasError to false', () => {
      service.hasError.set(true);
      service.isLoading.set(false);

      service.resetState();

      expect(service.isLoading()).toBe(true);
      expect(service.hasError()).toBe(false);
    });
  });
});
