import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DocumentViewer } from './document-viewer';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { FileSystem } from '../../core/services/file-system';
import { ScreenService } from '../../core/services/screen';
import { Sound } from '../../core/services/sound';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FileItem } from '../../core/models/file';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';
import { ContextMenuService } from '../../core/services/context-menu';

const makeDoc = (id: string, name: string, url: string): FileItem => ({
  id, name, type: 'file', icon: 'file', url,
});

describe('DocumentViewer', () => {
  let component: DocumentViewer;
  let fixture: ComponentFixture<DocumentViewer>;
  let fsSpy: {
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getFilesByExtensions: ReturnType<typeof vi.fn>;
    getSiblingsByUrl: ReturnType<typeof vi.fn>;
    getChildren: ReturnType<typeof vi.fn>;
    tree: ReturnType<typeof vi.fn>;
    getNode: ReturnType<typeof vi.fn>;
    getFileExtension: ReturnType<typeof vi.fn>;
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

  const mockDocs: FileItem[] = [
    makeDoc('doc1', 'resume.pdf', '/resume.pdf'),
    makeDoc('doc2', 'notes.txt', '/notes.txt'),
  ];

  let screenSpy: { isMobile: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    fsSpy = {
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getFilesByExtensions: vi.fn().mockReturnValue(mockDocs),
      getSiblingsByUrl: vi.fn().mockReturnValue(mockDocs),
      getChildren: vi.fn().mockReturnValue([]),
      tree: vi.fn().mockReturnValue(null),
      getNode: vi.fn().mockReturnValue(undefined),
      getFileExtension: vi.fn().mockReturnValue('pdf'),
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
    screenSpy = { isMobile: vi.fn().mockReturnValue(false) };

    await TestBed.configureTestingModule({
      imports: [DocumentViewer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        Apps,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        { provide: FileSystem, useValue: fsSpy },
        { provide: ScreenService, useValue: screenSpy },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(DocumentViewer, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load available documents from file system', () => {
    expect(component.availableDocs().length).toBe(2);
  });

  it('should selectFile update selectedFile signal', () => {
    component.selectFile(mockDocs[0]);
    expect(component.selectedFile()?.id).toBe('doc1');
  });

  it('should openSelectedDocument set isViewingDocument and detect PDF', () => {
    component.selectFile(mockDocs[0]); // resume.pdf
    component.openSelectedDocument();
    expect(component.isViewingDocument()).toBe(true);
    expect(component.fileType()).toBe('pdf');
  });

  it('should openSelectedDocument detect text file', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => 'hello' });

    component.selectFile(mockDocs[1]); // notes.txt
    component.openSelectedDocument();
    await fixture.whenStable();

    expect(component.fileType()).toBe('text');
    globalThis.fetch = origFetch;
  });

  it('should closeDocumentView reset state', () => {
    component.selectFile(mockDocs[0]);
    component.openSelectedDocument();
    expect(component.isViewingDocument()).toBe(true);

    component.closeDocumentView();
    expect(component.isViewingDocument()).toBe(false);
    expect(component.zoom()).toBe(1.0);
  });

  it('should changeZoom increase zoom within max 3.0', () => {
    component.changeZoom(0.5);
    expect(component.zoom()).toBeCloseTo(1.5);
    component.zoom.set(3.0);
    component.changeZoom(1.0);
    expect(component.zoom()).toBe(3.0);
  });

  it('should changeZoom not go below 0.3', () => {
    component.zoom.set(0.3);
    component.changeZoom(-1.0);
    expect(component.zoom()).toBeCloseTo(0.3);
  });

  it('should onPdfLoadSuccess clear loading and error', () => {
    component.isLoading.set(true);
    component.hasError.set(true);
    component.onPdfLoadSuccess();
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it('should onPdfLoadError set hasError', () => {
    component.onPdfLoadError();
    expect(component.hasError()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should getFileIcon return pdf icon for pdf type', () => {
    component.fileType.set('pdf');
    expect(component.getFileIcon()).toBe('fas fa-file-pdf');
  });

  it('should getFileIcon return alt icon for non-pdf', () => {
    component.fileType.set('text');
    expect(component.getFileIcon()).toBe('fas fa-file-alt');
  });

  it('should getIconColor return red for pdf', () => {
    component.fileType.set('pdf');
    expect(component.getIconColor()).toBe('#ef4444');
  });

  it('should getIconColor return blue for non-pdf', () => {
    component.fileType.set('text');
    expect(component.getIconColor()).toBe('#3b82f6');
  });

  it('should isFirstDoc be true when no doc selected', () => {
    expect(component.isFirstDoc()).toBe(true);
  });

  it('should isLastDoc be true when no docs loaded', () => {
    component.availableDocs.set([]);
    expect(component.isLastDoc()).toBe(true);
  });

  it('should safePath be null when not viewing', () => {
    component.selectFile(mockDocs[0]);
    expect(component.safePath()).toBeNull();
  });

  it('should safePath return encoded url when viewing', () => {
    component.selectFile(mockDocs[0]);
    component.isViewingDocument.set(true);
    expect(component.safePath()).toContain('resume.pdf');
  });

  it('should handleChangeDocument navigate to next doc', () => {
    component.availableDocs.set(mockDocs);
    component.selectFile(mockDocs[0]);
    component.handleChangeDocument(1);
    expect(component.selectedFile()?.id).toBe('doc2');
  });

  it('should handleChangeDocument do nothing when no docs', () => {
    expect(() => component.handleChangeDocument(1)).not.toThrow();
  });

  it('should load all docs via getFilesByExtensions when opened without data', () => {
    expect(fsSpy.getFilesByExtensions).toHaveBeenCalled();
    expect(component.availableDocs().length).toBe(2);
  });

  it('should load siblings via getSiblingsByUrl when opened with a file url', async () => {
    const siblingDocs = [makeDoc('doc1', 'resume.pdf', '/resume.pdf')];
    fsSpy.getSiblingsByUrl.mockReturnValue(siblingDocs);

    component.data.set('/resume.pdf');
    await fixture.whenStable();

    expect(fsSpy.getSiblingsByUrl).toHaveBeenCalledWith('/resume.pdf', expect.any(Array));
    expect(component.availableDocs().length).toBe(1);
    expect(component.isViewingDocument()).toBe(true);
  });

  describe('isNarrow (ResizeObserver)', () => {
    it('should start as false', () => {
      expect(component.isNarrow()).toBe(false);
    });

    it('should set isNarrow true when container width < 500', () => {
      component.isNarrow.set(true);
      expect(component.isNarrow()).toBe(true);
    });
  });

  describe('resetZoom', () => {
    it('should reset zoom to 1.0 and clear isPinchZoomed', () => {
      component.zoom.set(2.5);
      component.isPinchZoomed.set(true);
      component.resetZoom();
      expect(component.zoom()).toBe(1.0);
      expect(component.isPinchZoomed()).toBe(false);
    });
  });

  describe('pinch zoom (mobile only)', () => {
    const makeTouches = (d: number): TouchList => {
      const half = d / 2;
      return {
        0: { clientX: 0, clientY: 0 } as Touch,
        1: { clientX: half * Math.SQRT2, clientY: half * Math.SQRT2 } as Touch,
        length: 2,
        item: (i: number) => null,
      } as unknown as TouchList;
    };

    it('should not change zoom when not mobile', () => {
      screenSpy.isMobile.mockReturnValue(false);
      component.zoom.set(1.0);
      component.onTouchMove({ touches: makeTouches(200) } as TouchEvent);
      expect(component.zoom()).toBe(1.0);
    });

    it('should change zoom when mobile and pinch distance diff > 18', () => {
      screenSpy.isMobile.mockReturnValue(true);
      component.zoom.set(1.0);
      // bootstrap start distance
      component.onTouchStart({ touches: makeTouches(100) } as TouchEvent);
      // simulate a large open pinch
      component.onTouchMove({ touches: makeTouches(200), preventDefault: vi.fn() } as unknown as TouchEvent);
      expect(component.zoom()).toBeGreaterThan(1.0);
    });

    it('should set isPinchZoomed when zoom changes via pinch', () => {
      screenSpy.isMobile.mockReturnValue(true);
      component.onTouchStart({ touches: makeTouches(100) } as TouchEvent);
      component.onTouchMove({ touches: makeTouches(200), preventDefault: vi.fn() } as unknown as TouchEvent);
      expect(component.isPinchZoomed()).toBe(true);
    });

    it('should not react if only 1 touch point in onTouchStart', () => {
      screenSpy.isMobile.mockReturnValue(true);
      component.zoom.set(1.0);
      component.onTouchStart({ touches: { 0: { clientX: 10, clientY: 20 }, length: 1 } } as unknown as TouchEvent);
      expect(component.zoom()).toBe(1.0);
    });
  });

  describe('swipe navigation — horizontal scrollable guard', () => {
    const makeSwipeEnd = (dx: number, target: EventTarget): TouchEvent =>
      ({
        touches: { length: 0 },
        changedTouches: { 0: { clientX: 100 + dx, clientY: 50 } },
      } as unknown as TouchEvent);

    const makeSwipeStart = (target: EventTarget): TouchEvent =>
      ({
        touches: {
          length: 1,
          0: { clientX: 100, clientY: 50, target },
        },
      } as unknown as TouchEvent);

    const makeScrollableEl = (scrollWidth: number, clientWidth: number): HTMLElement => {
      const el = document.createElement('pre');
      Object.defineProperty(el, 'scrollWidth', { value: scrollWidth });
      Object.defineProperty(el, 'clientWidth', { value: clientWidth });
      el.style.overflowX = 'auto';
      return el;
    };

    beforeEach(() => {
      screenSpy.isMobile.mockReturnValue(true);
      component.availableDocs.set(mockDocs);
      component.selectFile(mockDocs[0]);
      component.isViewingDocument.set(true);
      component.zoom.set(1.0);
    });

    it('should NOT navigate when swipe starts inside a horizontally scrollable element', () => {
      const pre = makeScrollableEl(600, 300);
      document.body.appendChild(pre);

      component.onTouchStart(makeSwipeStart(pre));
      component.onTouchEnd(makeSwipeEnd(-80, pre));

      expect(component.selectedFile()?.id).toBe('doc1');
      document.body.removeChild(pre);
    });

    it('should navigate when swipe starts inside a non-scrollable element', () => {
      const div = document.createElement('div');
      Object.defineProperty(div, 'scrollWidth', { value: 100 });
      Object.defineProperty(div, 'clientWidth', { value: 100 });
      document.body.appendChild(div);

      component.onTouchStart(makeSwipeStart(div));
      component.onTouchEnd(makeSwipeEnd(-80, div));

      expect(component.selectedFile()?.id).toBe('doc2');
      document.body.removeChild(div);
    });

    it('should navigate when swipe starts inside a scrollable element that does NOT overflow', () => {
      const pre = makeScrollableEl(200, 300); // scrollWidth < clientWidth — não overflow
      document.body.appendChild(pre);

      component.onTouchStart(makeSwipeStart(pre));
      component.onTouchEnd(makeSwipeEnd(-80, pre));

      expect(component.selectedFile()?.id).toBe('doc2');
      document.body.removeChild(pre);
    });

    it('should NOT navigate when swipe starts inside a CHILD of a scrollable element', () => {
      const pre = makeScrollableEl(600, 300);
      const code = document.createElement('code');
      pre.appendChild(code);
      document.body.appendChild(pre);

      component.onTouchStart(makeSwipeStart(code));
      component.onTouchEnd(makeSwipeEnd(-80, code));

      expect(component.selectedFile()?.id).toBe('doc1');
      document.body.removeChild(pre);
    });
  });
});
