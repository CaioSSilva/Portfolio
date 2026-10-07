import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProcessManager } from './process-manager';
import { LanguageService } from './language';
import { FileSystem } from './file-system';
import { NotificationService } from './notification';
import { AppRegistry } from './app-registry';
import { Sound } from './sound';
import { AppBase } from '../models/base';
import { FileItem } from '../models/file';

describe('ProcessManager', () => {
  let service: ProcessManager;
  let notificationSpy: { show: ReturnType<typeof vi.fn> };
  let appRegistrySpy: {
    findHandlerForExtension: ReturnType<typeof vi.fn>;
    registry: ReturnType<typeof vi.fn>;
    definitions: ReturnType<typeof vi.fn>;
    getAppById: ReturnType<typeof vi.fn>;
    searchApps: ReturnType<typeof vi.fn>;
  };
  let fileSystemSpy: {
    getFileExtension: ReturnType<typeof vi.fn>;
    isLoaded: ReturnType<typeof vi.fn>;
    ensureLoaded: ReturnType<typeof vi.fn>;
    getChildren: ReturnType<typeof vi.fn>;
    tree: ReturnType<typeof vi.fn>;
  };

  const mockApp: AppBase = {
    id: 'test-app',
    title: 'Test App',
    icon: 'fas fa-cog',
    color: '#000',
    component: class MockComponent {} as never,
  };

  const musicApp: AppBase = {
    id: 'musics',
    title: 'Music',
    icon: 'fas fa-music',
    color: '#f00',
    component: class MockComponent {} as never,
  };

  beforeEach(() => {
    notificationSpy = { show: vi.fn() };
    appRegistrySpy = {
      findHandlerForExtension: vi.fn().mockReturnValue(null),
      registry: vi.fn().mockReturnValue({}),
      definitions: vi.fn().mockReturnValue([]),
      getAppById: vi.fn().mockReturnValue(null),
      searchApps: vi.fn().mockReturnValue([]),
    };
    fileSystemSpy = {
      getFileExtension: vi.fn().mockReturnValue('pdf'),
      isLoaded: vi.fn().mockReturnValue(true),
      ensureLoaded: vi.fn().mockResolvedValue(undefined),
      getChildren: vi.fn().mockReturnValue([]),
      tree: vi.fn().mockReturnValue(null),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProcessManager,
        LanguageService,
        { provide: FileSystem, useValue: fileSystemSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: AppRegistry, useValue: appRegistrySpy },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    });
    service = TestBed.inject(ProcessManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open and close process', () => {
    service.open(mockApp);
    expect(service.processes().length).toBe(1);
    expect(service.hasActiveProcesses()).toBe(true);

    const pid = service.processes()[0].id;
    service.close(pid);
    expect(service.processes().length).toBe(0);
    expect(service.hasActiveProcesses()).toBe(false);
  });

  it('should toggle minimize on process', () => {
    service.open(mockApp);
    const pid = service.processes()[0].id;

    service.toggleMinimize(pid);
    expect(service.processes()[0].isMinimized).toBe(true);

    service.toggleMinimize(pid);
    expect(service.processes()[0].isMinimized).toBe(false);
  });

  it('should focus active process', () => {
    service.open(mockApp);
    const pid = service.processes()[0].id;
    service.focus(pid);
    expect(service.activeProcessId()).toBe(pid);
  });

  it('should close all instances by appId', () => {
    service.open(mockApp);
    service.open(mockApp);
    expect(service.processes().length).toBe(2);

    service.closeAllInstancesById(mockApp.id);
    expect(service.processes().length).toBe(0);
  });

  it('should check if there are active processes by appId', () => {
    expect(service.hasActiveProcessesById(mockApp.id)).toBe(false);

    service.open(mockApp);
    expect(service.hasActiveProcessesById(mockApp.id)).toBe(true);
  });

  it('should update bottom overlap counter and compute isDockHidden', () => {
    expect(service.isDockHidden()).toBe(false);

    service.updateBottomOverlap(true);
    expect(service.isDockHidden()).toBe(true);

    service.updateBottomOverlap(false);
    expect(service.isDockHidden()).toBe(false);
  });

  it('should not go below 0 on bottom overlap counter', () => {
    service.updateBottomOverlap(false);
    expect(service.isDockHidden()).toBe(false);
  });

  it('should update top overlap counter and compute isTopBarHidden', () => {
    expect(service.isTopBarHidden()).toBe(false);

    service.updateTopOverlap(true);
    expect(service.isTopBarHidden()).toBe(true);

    service.updateTopOverlap(false);
    expect(service.isTopBarHidden()).toBe(false);
  });

  it('should open file with a known handler', () => {
    const handler = { ...mockApp, id: 'documents', handle: ['pdf'] };
    appRegistrySpy.findHandlerForExtension.mockReturnValue(handler);
    fileSystemSpy.getFileExtension.mockReturnValue('pdf');

    const node: FileItem = { id: 'doc1', name: 'file.pdf', type: 'file', icon: 'file', url: '/file.pdf' };
    service.openFile(node);

    expect(service.processes().length).toBe(1);
    expect(service.processes()[0].appId).toBe('documents');
  });

  it('should show notification when no handler found for file', () => {
    appRegistrySpy.findHandlerForExtension.mockReturnValue(null);

    const node: FileItem = { id: 'unknown', name: 'file.xyz', type: 'file', icon: 'file', url: '/file.xyz' };
    service.openFile(node);

    expect(notificationSpy.show).toHaveBeenCalled();
  });

  it('should skip openFile when node has no url', () => {
    const node: FileItem = { id: 'nurl', name: 'file.pdf', type: 'file', icon: 'file' };
    service.openFile(node);
    expect(service.processes().length).toBe(0);
  });

  it('should close existing music process before opening new one (singleton)', () => {
    const musicHandler = { ...musicApp, handle: ['mp3'] };
    appRegistrySpy.findHandlerForExtension.mockReturnValue(musicHandler);
    fileSystemSpy.getFileExtension.mockReturnValue('mp3');

    const node1: FileItem = { id: 'song1', name: 'song1.mp3', type: 'file', icon: 'file', url: '/song1.mp3' };
    service.openFile(node1);
    expect(service.processes().length).toBe(1);

    const node2: FileItem = { id: 'song2', name: 'song2.mp3', type: 'file', icon: 'file', url: '/song2.mp3' };
    service.openFile(node2);
    // old one closed, new one opened
    expect(service.processes().length).toBe(1);
  });
});
