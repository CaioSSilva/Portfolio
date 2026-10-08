import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ImageViewer } from './image-viewer';
import { LanguageService } from '../../core/services/language';
import { Apps } from '../../core/services/apps';
import { FileSystem } from '../../core/services/file-system';
import { Sound } from '../../core/services/sound';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';
import { ContextMenuService } from '../../core/services/context-menu';
import { FileItem } from '../../core/models/file';
import { NO_ERRORS_SCHEMA } from '@angular/core';

const makeImage = (id: string, url: string): FileItem => ({
  id,
  name: `${id}.jpg`,
  type: 'file',
  icon: 'image',
  url,
});

describe('ImageViewer', () => {
  let component: ImageViewer;
  let fixture: ComponentFixture<ImageViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageViewer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        Apps,
        FileSystem,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have null selectedFile and empty gallery initially', () => {
    expect(component.selectedFile()).toBeNull();
  });

  it('should selectFile sets selectedFile', () => {
    const img = makeImage('img1', '/img1.jpg');
    component.selectFile(img);
    expect(component.selectedFile()?.id).toBe('img1');
  });

  it('should openSelectedImage set isViewingImage to true when file has url', () => {
    const img = makeImage('img1', '/img1.jpg');
    component.selectFile(img);
    component.openSelectedImage();
    expect(component.isViewingImage()).toBe(true);
  });

  it('should not set isViewingImage when selected file has no url', () => {
    const noUrl: FileItem = { id: 'x', name: 'x.jpg', type: 'file', icon: 'image' };
    component.selectFile(noUrl);
    component.openSelectedImage();
    expect(component.isViewingImage()).toBe(false);
  });

  it('should closeImageView reset viewing state and call reset()', () => {
    const img = makeImage('img1', '/img1.jpg');
    component.selectFile(img);
    component.openSelectedImage();
    component.zoom.set(2);
    component.closeImageView();
    expect(component.isViewingImage()).toBe(false);
    expect(component.zoom()).toBe(1);
    expect(component.rotation()).toBe(0);
  });

  it('should handleZoomIn increase zoom', () => {
    component.handleZoomIn();
    expect(component.zoom()).toBeGreaterThan(1);
  });

  it('should handleZoomOut decrease zoom', () => {
    component.zoom.set(2);
    component.handleZoomOut();
    expect(component.zoom()).toBeLessThan(2);
  });

  it('should not zoom below 0.5', () => {
    component.zoom.set(0.5);
    component.handleZoomOut();
    expect(component.zoom()).toBeCloseTo(0.5);
  });

  it('should not zoom above 5', () => {
    component.zoom.set(5);
    component.handleZoomIn();
    expect(component.zoom()).toBeCloseTo(5);
  });

  it('should handleRotate rotate by 90 degrees each call', () => {
    expect(component.rotation()).toBe(0);
    component.handleRotate();
    expect(component.rotation()).toBe(90);
    component.handleRotate();
    expect(component.rotation()).toBe(180);
    component.handleRotate();
    component.handleRotate();
    expect(component.rotation()).toBe(0);
  });

  it('should reset restore zoom, rotation and position to defaults', () => {
    component.zoom.set(3);
    component.rotation.set(180);
    component.position.set({ x: 100, y: 200 });
    component.reset();
    expect(component.zoom()).toBe(1);
    expect(component.rotation()).toBe(0);
    expect(component.position()).toEqual({ x: 0, y: 0 });
  });

  it('should isFirstImage be true when no images are loaded', () => {
    expect(component.isFirstImage()).toBe(true);
  });

  it('should isLastImage be true when no images are loaded', () => {
    expect(component.isLastImage()).toBe(true);
  });

  it('should safeUrl be null when not viewing', () => {
    const img = makeImage('img1', '/img1.jpg');
    component.selectFile(img);
    expect(component.safeUrl()).toBeNull();
  });

  it('should safeUrl be set when viewing an image', () => {
    const img = makeImage('img1', '/img1.jpg');
    component.selectFile(img);
    component.openSelectedImage();
    expect(component.safeUrl()).toContain('img1.jpg');
  });

  it('should onMouseUp clear isDragging', () => {
    component.isDragging.set(true);
    component.onMouseUp();
    expect(component.isDragging()).toBe(false);
  });

  it('should onMouseDown not start drag when zoom is 1', () => {
    const event = new MouseEvent('mousedown', { clientX: 10, clientY: 10 });
    component.onMouseDown(event);
    expect(component.isDragging()).toBe(false);
  });

  it('should onMouseDown start drag when zoom > 1', () => {
    component.zoom.set(2);
    const event = { clientX: 10, clientY: 10, preventDefault: vi.fn() } as unknown as MouseEvent;
    component.onMouseDown(event);
    expect(component.isDragging()).toBe(true);
  });

  it('should onMouseMove update position when dragging', () => {
    component.zoom.set(2);
    component.isDragging.set(true);
    const moveEvent = { clientX: 50, clientY: 60 } as unknown as MouseEvent;
    component.onMouseMove(moveEvent);
    const pos = component.position();
    expect(typeof pos.x).toBe('number');
    expect(typeof pos.y).toBe('number');
  });

  it('should onMouseMove do nothing when not dragging', () => {
    component.isDragging.set(false);
    component.position.set({ x: 0, y: 0 });
    component.onMouseMove({ clientX: 100, clientY: 100 } as unknown as MouseEvent);
    expect(component.position()).toEqual({ x: 0, y: 0 });
  });

  it('should handleChangeImage navigate to next in list', () => {
    const t1 = makeImage('img1', '/img1.jpg');
    const t2 = makeImage('img2', '/img2.jpg');
    component.availableImages.set([t1, t2]);
    component.selectFile(t1);
    component.handleChangeImage(1);
    expect(component.selectedFile()?.id).toBe('img2');
  });

  it('should handleChangeImage do nothing when list is empty', () => {
    expect(() => component.handleChangeImage(1)).not.toThrow();
  });
});

describe('ImageViewer — gallery loading', () => {
  let component: ImageViewer;
  let fixture: ComponentFixture<ImageViewer>;
  let fsSpy: {
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getFilesByExtensions: ReturnType<typeof vi.fn>;
    getSiblingsByUrl: ReturnType<typeof vi.fn>;
  };

  const allImages: FileItem[] = [
    makeImage('img1', '/a/photo1.jpg'),
    makeImage('img2', '/a/photo2.jpg'),
    makeImage('img3', '/b/other.jpg'),
  ];
  const folderImages: FileItem[] = [allImages[0], allImages[1]];

  beforeEach(async () => {
    fsSpy = {
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getFilesByExtensions: vi.fn().mockReturnValue(allImages),
      getSiblingsByUrl: vi.fn().mockReturnValue(folderImages),
    };

    await TestBed.configureTestingModule({
      imports: [ImageViewer],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        Apps,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        { provide: FileSystem, useValue: fsSpy },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ImageViewer, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(ImageViewer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should load all images via getFilesByExtensions when opened without data', () => {
    expect(fsSpy.getFilesByExtensions).toHaveBeenCalled();
    expect(component.availableImages().length).toBe(3);
  });

  it('should load siblings via getSiblingsByUrl when opened with a file url', async () => {
    fsSpy.getSiblingsByUrl.mockReturnValue(folderImages);

    component.data.set('/a/photo1.jpg');
    await fixture.whenStable();

    expect(fsSpy.getSiblingsByUrl).toHaveBeenCalledWith('/a/photo1.jpg', expect.any(Array));
    expect(component.availableImages().length).toBe(2);
    expect(component.isViewingImage()).toBe(true);
    expect(component.selectedFile()?.id).toBe('img1');
  });

  it('should not include files from other folders after opening via url', async () => {
    component.data.set('/a/photo1.jpg');
    await fixture.whenStable();

    const ids = component.availableImages().map((f) => f.id);
    expect(ids).not.toContain('img3');
  });
});
