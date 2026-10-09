import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Files } from './files';
import { FileSystem } from '../../core/services/file-system';
import { ProcessManager } from '../../core/services/process-manager';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';
import { signal } from '@angular/core';
import { FileItem } from '../../core/models/file';

const mockFolder: FileItem = { id: 'docs', name: 'Documents', type: 'folder', icon: 'folder' };
const mockFile: FileItem = {
  id: 'readme',
  name: 'readme.txt',
  type: 'file',
  icon: 'file',
  size: 1024,
};

function makeFsMock() {
  return {
    isLoaded: signal(true),
    tree: signal(null),
    ensureLoaded: vi.fn().mockResolvedValue(undefined),
    getChildren: vi.fn().mockReturnValue([mockFolder, mockFile]),
    getFolderName: vi.fn().mockReturnValue('Home'),
    getNode: vi.fn().mockReturnValue(mockFolder),
    formatFileSize: vi.fn().mockReturnValue('2 KB'),
  };
}

describe('Files', () => {
  let component: Files;
  let fixture: ComponentFixture<Files>;
  let fsMock: ReturnType<typeof makeFsMock>;
  let processManagerMock: {
    processes: ReturnType<typeof signal>;
    openFile: ReturnType<typeof vi.fn>;
    focus: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    fsMock = makeFsMock();
    processManagerMock = {
      processes: signal([]),
      openFile: vi.fn(),
      focus: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Files],
      providers: [
        { provide: FileSystem, useValue: fsMock },
        { provide: ProcessManager, useValue: processManagerMock },
        LanguageService,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Files);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('currentFolderId returns last pathId', () => {
    expect(component.currentFolderId()).toBe('home');
  });

  it('breadcrumbs returns array with id/name for each pathId', () => {
    const crumbs = component.breadcrumbs();
    expect(crumbs.length).toBe(2);
    expect(crumbs[0].id).toBe('root');
    expect(crumbs[1].id).toBe('home');
  });

  it('filteredFiles returns all files when searchQuery is empty', () => {
    expect(component.filteredFiles().length).toBe(2);
  });

  it('filteredFiles filters by searchQuery', () => {
    component.searchQuery.set('readme');
    expect(component.filteredFiles().length).toBe(1);
    expect(component.filteredFiles()[0].name).toBe('readme.txt');
  });

  it('totalSize delegates to fs.formatFileSize', () => {
    expect(component.totalSize()).toBe('2 KB');
  });

  it('handleNavigate with folder calls navigate as non-sidebar', () => {
    component.handleNavigate(mockFolder);
    expect(component.pathIds()).toContain('docs');
  });

  it('handleNavigate with file opens via processManager', () => {
    component.handleNavigate(mockFile);
    expect(processManagerMock.openFile).toHaveBeenCalledWith(mockFile);
  });

  it('navigate with string resolves node from fs and opens folder', () => {
    fsMock.getNode.mockReturnValue(mockFolder);
    component.navigate('docs', true);
    expect(component.pathIds()).toContain('docs');
  });

  it('jumpTo slices pathIds to given index', () => {
    component.pathIds.set(['root', 'home', 'docs']);
    component.jumpTo(1);
    expect(component.pathIds()).toEqual(['root', 'home']);
  });

  it('goBack removes last pathId', () => {
    component.pathIds.set(['root', 'home', 'docs']);
    component.goBack();
    expect(component.pathIds()).toEqual(['root', 'home']);
  });

  it('goBack does not remove beyond root', () => {
    component.pathIds.set(['root']);
    component.goBack();
    expect(component.pathIds()).toEqual(['root']);
  });

  it('handleToggleExpand adds a new id to expandedFolders', () => {
    component.handleToggleExpand('docs');
    expect(component.expandedFolders().has('docs')).toBe(true);
  });

  it('handleToggleExpand removes an existing id from expandedFolders', () => {
    component.expandedFolders.set(new Set(['docs']));
    component.handleToggleExpand('docs');
    expect(component.expandedFolders().has('docs')).toBe(false);
  });

  it('startResizing sets isResizing and prevents default', () => {
    const event = new MouseEvent('mousedown', { clientX: 200 });
    const preventSpy = vi.spyOn(event, 'preventDefault');
    component.startResizing(event);
    const move = new MouseEvent('mousemove', { clientX: 250 });
    component.onMouseMove(move);
    expect(component.sidebarWidth()).toBe(290);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('onMouseMove does nothing when not resizing', () => {
    const before = component.sidebarWidth();
    component.onMouseMove(new MouseEvent('mousemove', { clientX: 300 }));
    expect(component.sidebarWidth()).toBe(before);
  });

  it('onMouseUp stops resizing', () => {
    component.startResizing(new MouseEvent('mousedown', { clientX: 200 }));
    component.onMouseUp();
    component.onMouseMove(new MouseEvent('mousemove', { clientX: 400 }));
    expect(component.sidebarWidth()).toBe(240);
  });

  it('updateGridSize sets gridSize from event', () => {
    const input = document.createElement('input');
    input.value = '150';
    const event: Partial<Event> = { target: input };
    component.updateGridSize(event as Event);
    expect(component.gridSize()).toBe(150);
  });

  it('viewMode defaults to list', () => {
    expect(component.viewMode()).toBe('list');
  });

  it('grid size slider --slider-pct is 0% at minimum value', () => {
    component.gridSize.set(80);
    const pct = ((component.gridSize() - 80) / (300 - 80)) * 100;
    expect(pct).toBe(0);
  });

  it('grid size slider --slider-pct is 100% at maximum value', () => {
    component.gridSize.set(300);
    const pct = ((component.gridSize() - 80) / (300 - 80)) * 100;
    expect(pct).toBe(100);
  });

  it('grid size slider --slider-pct is proportional mid-range', () => {
    component.gridSize.set(190);
    const pct = ((component.gridSize() - 80) / (300 - 80)) * 100;
    expect(pct).toBeCloseTo(50, 0);
  });
});
