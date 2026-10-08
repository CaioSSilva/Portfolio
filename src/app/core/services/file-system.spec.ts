import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FileSystem } from './file-system';
import { LanguageService } from './language';
import { NotificationService } from './notification';
import { Sound } from './sound';
import { FileItem } from '../models/file';

describe('FileSystem', () => {
  let service: FileSystem;
  let httpMock: HttpTestingController;
  let notificationSpy: { show: ReturnType<typeof vi.fn> };

  const mockFsData: { root: FileItem } = {
    root: {
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
          children: [
            {
              id: 'doc1',
              name: 'document.pdf',
              type: 'file',
              icon: 'file-pdf',
              size: 2048,
              url: '/data/document.pdf',
            },
            {
              id: 'song1',
              name: 'track.mp3',
              type: 'file',
              icon: 'file-audio',
              size: 1048576,
              url: '/data/track.mp3',
            },
          ],
        },
        {
          id: 'pictures',
          name: 'pictures',
          type: 'folder',
          icon: 'folder',
          children: [
            {
              id: 'img1',
              name: 'photo1.jpg',
              type: 'file',
              icon: 'image',
              size: 512,
              url: '/data/photo1.jpg',
            },
            {
              id: 'img2',
              name: 'photo2.png',
              type: 'file',
              icon: 'image',
              size: 512,
              url: '/data/photo2.png',
            },
          ],
        },
      ],
    },
  };

  async function loadFs() {
    const loadPromise = service.ensureLoaded();
    httpMock.expectOne('/data/fs.json').flush(mockFsData);
    await loadPromise;
  }

  beforeEach(() => {
    notificationSpy = { show: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FileSystem,
        LanguageService,
        { provide: NotificationService, useValue: notificationSpy },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    });
    service = TestBed.inject(FileSystem);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load file system and index nodes', async () => {
    await loadFs();

    expect(service.isLoaded()).toBe(true);
    expect(service.getNode('home')).toBeDefined();
    expect(service.getChildren('home').length).toBe(2);
    expect(service.totalFiles()).toBe(4);
  });

  it('should set isLoading=true then false during load', async () => {
    const loadPromise = service.ensureLoaded();
    expect(service.isLoading()).toBe(true);
    httpMock.expectOne('/data/fs.json').flush(mockFsData);
    await loadPromise;
    expect(service.isLoading()).toBe(false);
  });

  it('should not re-request if already loaded (ensureLoaded idempotent)', async () => {
    await loadFs();
    await service.ensureLoaded();
    httpMock.expectNone('/data/fs.json');
  });

  it('should get files by extensions', async () => {
    await loadFs();

    const pdfs = service.getFilesByExtensions(['pdf']);
    expect(pdfs.length).toBe(1);
    expect(pdfs[0].name).toBe('document.pdf');
  });

  it('should search files by query', async () => {
    await loadFs();

    const results = service.searchFiles('document');
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('doc1');
  });

  it('should return empty array for short search query', async () => {
    await loadFs();
    expect(service.searchFiles('a')).toEqual([]);
    expect(service.searchFiles('')).toEqual([]);
  });

  it('should format file size properly', () => {
    expect(service.formatFileSize(0)).toContain('0');
    expect(service.formatFileSize(1024)).toContain('KB');
    expect(service.formatFileSize(1048576)).toContain('MB');
  });

  it('should return cached formatted size on second call', () => {
    const first = service.formatFileSize(2048);
    const second = service.formatFileSize(2048);
    expect(first).toBe(second);
  });

  it('should get file extension', () => {
    expect(service.getFileExtension('file.PDF')).toBe('pdf');
    expect(service.getFileExtension('noextension')).toBe('noextension');
  });

  it('should get folder name by id', async () => {
    await loadFs();
    expect(service.getFolderName('home')).toBe('home');
    expect(service.getFolderName('nonexistent')).toBe('nonexistent');
  });

  it('should get path for a known node', async () => {
    await loadFs();
    const path = service.getPath('doc1');
    expect(path).toContain('document.pdf');
  });

  it('should return empty string for unknown node path', async () => {
    await loadFs();
    expect(service.getPath('unknown-id')).toBe('');
  });

  it('should compute totalSize from tree', async () => {
    await loadFs();
    expect(service.totalSize()).toBeGreaterThan(0);
  });

  it('should show notification on HTTP error', async () => {
    const loadPromise = service.ensureLoaded();
    httpMock.expectOne('/data/fs.json').error(new ErrorEvent('Network error'));
    await loadPromise;
    expect(notificationSpy.show).toHaveBeenCalled();
  });

  it('should call downloadFile without throwing when path and name provided', () => {
    const anchor = document.createElement('a');
    vi.spyOn(document, 'createElement').mockReturnValueOnce(anchor);
    vi.spyOn(anchor, 'click').mockImplementation(() => {});
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchor);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchor);

    expect(() => service.downloadFile('/file.pdf', 'file.pdf')).not.toThrow();
    expect(anchor.href).toContain('file.pdf');
    expect(anchor.download).toBe('file.pdf');
    expect(document.body.appendChild).toHaveBeenCalledWith(anchor);
    expect(document.body.removeChild).toHaveBeenCalledWith(anchor);

    vi.restoreAllMocks();
  });

  it('should skip downloadFile when path or name is empty', () => {
    const createdElements: string[] = [];
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      createdElements.push(tag);
      return document.createElement(tag);
    });

    service.downloadFile('', 'file.pdf');
    service.downloadFile('/file.pdf', '');

    expect(createdElements).not.toContain('a');
    vi.restoreAllMocks();
  });

  describe('getSiblingsByUrl', () => {
    it('should return only siblings with matching extensions from same folder', async () => {
      await loadFs();

      const siblings = service.getSiblingsByUrl('/data/photo1.jpg', ['jpg', 'png']);
      expect(siblings.length).toBe(2);
      expect(siblings.map((f) => f.id)).toEqual(expect.arrayContaining(['img1', 'img2']));
    });

    it('should not include files from other folders', async () => {
      await loadFs();

      const siblings = service.getSiblingsByUrl('/data/photo1.jpg', ['jpg', 'png']);
      expect(siblings.map((f) => f.id)).not.toContain('doc1');
      expect(siblings.map((f) => f.id)).not.toContain('song1');
    });

    it('should filter siblings by extension', async () => {
      await loadFs();

      const siblings = service.getSiblingsByUrl('/data/document.pdf', ['pdf']);
      expect(siblings.length).toBe(1);
      expect(siblings[0].id).toBe('doc1');
    });

    it('should fall back to getFilesByExtensions when url has no match', async () => {
      await loadFs();

      const siblings = service.getSiblingsByUrl('/data/nonexistent.jpg', ['jpg', 'png']);
      expect(siblings.length).toBe(2);
      expect(siblings.map((f) => f.id)).toEqual(expect.arrayContaining(['img1', 'img2']));
    });
  });
});
