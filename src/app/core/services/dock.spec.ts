import { TestBed } from '@angular/core/testing';
import { DockService } from './dock';
import { ProcessManager } from './process-manager';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';
import { ContextMenuService } from './context-menu';
import { AppBase } from '../models/base';
import { DockItem } from '../models/dock';

describe('DockService', () => {
  let service: DockService;
  let processManager: ProcessManager;
  let appLauncherSpy: { launch: ReturnType<typeof vi.fn> };
  let contextMenuSpy: {
    activeAppId: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    isOpen: ReturnType<typeof vi.fn>;
    position: ReturnType<typeof vi.fn>;
    openApp: ReturnType<typeof vi.fn>;
  };

  const mockApp: AppBase = {
    id: 'test-app',
    title: 'Test App',
    icon: 'fas fa-cog',
    color: '#000',
    component: class MockComponent {} as never,
  };

  beforeEach(() => {
    appLauncherSpy = { launch: vi.fn() };
    contextMenuSpy = {
      activeAppId: vi.fn().mockReturnValue(null),
      close: vi.fn(),
      isOpen: vi.fn().mockReturnValue(false),
      position: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      openApp: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DockService,
        ProcessManager,
        AppRegistry,
        { provide: ContextMenuService, useValue: contextMenuSpy },
        { provide: AppLauncher, useValue: appLauncherSpy },
      ],
    });
    service = TestBed.inject(DockService);
    processManager = TestBed.inject(ProcessManager);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list pinned dock items by default', () => {
    const items = service.dockItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.some((i) => i.id === 'firefox')).toBe(true);
  });

  it('should pin and unpin apps correctly', () => {
    expect(service.hasPinnedAppWithId('music')).toBe(false);
    service.pinApp('music');
    expect(service.hasPinnedAppWithId('music')).toBe(true);

    service.unpinApp('music');
    expect(service.hasPinnedAppWithId('music')).toBe(false);
  });

  it('should handle app click when not open — launches app', () => {
    const dockItem = service.dockItems().find((i) => !i.isOpen && i.id === 'firefox');
    if (dockItem) {
      service.handleAppClick(dockItem);
      expect(appLauncherSpy.launch).toHaveBeenCalledWith(dockItem);
    }
  });

  it('should pin app at a specific index', () => {
    service.pinApp('about', 0);
    expect(service.pinnedAppIds()[0]).toBe('about');
  });

  it('should minimize active process when clicked while active (focusOrMinimize)', () => {
    processManager.open(mockApp);
    const pid = processManager.processes()[0].id;
    processManager.focus(pid);

    const dockItem: DockItem = {
      ...mockApp,
      pinned: false,
      isOpen: true,
      isActive: true,
      count: 1,
      pids: [pid],
    };

    service.handleAppClick(dockItem);
    expect(processManager.processes()[0].isMinimized).toBe(true);
  });

  it('should focus process when clicked while not active', () => {
    processManager.open(mockApp);
    processManager.open({ ...mockApp, id: 'other-app', title: 'Other' });

    const pids = processManager.processes().map((p) => p.id);
    // focus second process so first is not active
    processManager.focus(pids[1]);

    const dockItem: DockItem = {
      ...mockApp,
      pinned: false,
      isOpen: true,
      isActive: false,
      count: 1,
      pids: [pids[0]],
    };

    service.handleAppClick(dockItem);
    expect(processManager.activeProcessId()).toBe(pids[0]);
  });

  it('should restore minimized process on click', () => {
    processManager.open(mockApp);
    const pid = processManager.processes()[0].id;
    processManager.toggleMinimize(pid);
    expect(processManager.processes()[0].isMinimized).toBe(true);

    const dockItem: DockItem = {
      ...mockApp,
      pinned: false,
      isOpen: true,
      isActive: false,
      count: 1,
      pids: [pid],
    };

    service.handleAppClick(dockItem);
    expect(processManager.processes()[0].isMinimized).toBe(false);
  });

  it('should close active app via closeActiveApp', () => {
    processManager.open(mockApp);
    expect(processManager.processes().length).toBe(1);

    contextMenuSpy.activeAppId.mockReturnValue(mockApp.id);
    service.closeActiveApp();
    expect(processManager.processes().length).toBe(0);
  });

  it('should not close when no activeAppId in closeActiveApp', () => {
    processManager.open(mockApp);
    contextMenuSpy.activeAppId.mockReturnValue(null);
    service.closeActiveApp();
    expect(processManager.processes().length).toBe(1);
  });

  it('should open active app via openActiveApp', () => {
    const appRegistry = TestBed.inject(AppRegistry);
    const app = appRegistry.getAppById('firefox');
    contextMenuSpy.activeAppId.mockReturnValue('firefox');

    service.openActiveApp();
    expect(appLauncherSpy.launch).toHaveBeenCalledWith(app);
  });

  it('should not open when no activeAppId in openActiveApp', () => {
    contextMenuSpy.activeAppId.mockReturnValue(null);
    service.openActiveApp();
    expect(appLauncherSpy.launch).not.toHaveBeenCalled();
  });

  it('should unpin active app via unPinActiveApp when allowed', () => {
    service.pinApp('about');
    expect(service.hasPinnedAppWithId('about')).toBe(true);
    expect(service.pinnedAppIds().length).toBeGreaterThan(1);

    contextMenuSpy.activeAppId.mockReturnValue('about');
    service.unPinActiveApp();

    expect(service.hasPinnedAppWithId('about')).toBe(false);
    expect(contextMenuSpy.close).toHaveBeenCalled();
  });

  it('should not unpin when only one app is pinned', () => {
    // leave only one pinned app
    service.pinnedAppIds.set(['firefox']);
    contextMenuSpy.activeAppId.mockReturnValue('firefox');
    service.unPinActiveApp();

    expect(service.hasPinnedAppWithId('firefox')).toBe(true);
    expect(contextMenuSpy.close).not.toHaveBeenCalled();
  });
});
