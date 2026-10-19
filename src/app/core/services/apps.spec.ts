import { TestBed } from '@angular/core/testing';
import { Apps } from './apps';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';
import { ContextMenuService } from './context-menu';
import { LanguageService } from './language';

describe('Apps', () => {
  let service: Apps;
  let appLauncherSpy: { launch: ReturnType<typeof vi.fn> };
  let contextMenuSpy: {
    close: ReturnType<typeof vi.fn>;
    isOpen: ReturnType<typeof vi.fn>;
    activeAppId: ReturnType<typeof vi.fn>;
    position: ReturnType<typeof vi.fn>;
    openApp: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    appLauncherSpy = { launch: vi.fn() };
    contextMenuSpy = {
      close: vi.fn(),
      isOpen: vi.fn().mockReturnValue(false),
      activeAppId: vi.fn().mockReturnValue(null),
      position: vi.fn().mockReturnValue({ x: 0, y: 0 }),
      openApp: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        Apps,
        AppRegistry,
        LanguageService,
        { provide: ContextMenuService, useValue: contextMenuSpy },
        { provide: AppLauncher, useValue: appLauncherSpy },
      ],
    });
    service = TestBed.inject(Apps);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list apps and filter by search query', () => {
    expect(service.appsDefinition().length).toBeGreaterThan(0);

    service.searchQuery.set('term');
    const filtered = service.appSearchResult();
    expect(filtered.some((a) => a.id === 'terminal')).toBe(true);
  });

  it('should open app via launcher', () => {
    const app = service.appsDefinition()[0];
    service.openApp(app);
    expect(appLauncherSpy.launch).toHaveBeenCalledWith(app, app.data);
  });

  it('should toggle grid open and close', () => {
    expect(service.isAppsGridOpen()).toBe(false);

    service.toggleGrid();
    expect(service.isAppsGridOpen()).toBe(true);
    expect(contextMenuSpy.close).toHaveBeenCalled();

    service.toggleGrid();
    expect(service.isAppsGridOpen()).toBe(false);
  });

  it('should reset search query when closing grid via toggleGrid', () => {
    service.isAppsGridOpen.set(true);
    service.searchQuery.set('files');

    service.toggleGrid();
    expect(service.searchQuery()).toBe('');
  });

  it('should reset search query when opening app', () => {
    service.searchQuery.set('test');
    const app = service.appsDefinition()[0];
    service.openApp(app);
    expect(service.searchQuery()).toBe('');
    expect(service.isAppsGridOpen()).toBe(false);
  });

  it('should open the context menu at the right-click position', () => {
    const app = service.appsDefinition()[0];
    const event: Partial<MouseEvent> = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 120,
      clientY: 330,
    };

    service.onRightClickApp(event as MouseEvent, app.id);
    expect(contextMenuSpy.openApp).toHaveBeenCalledWith(120, 330, app.id);
  });

  it('should open the context menu for an app under the backdrop right-click', () => {
    const appButton = document.createElement('button');
    appButton.dataset['contextMenuAppId'] = 'terminal';
    const icon = document.createElement('i');
    appButton.append(icon);
    Object.defineProperty(document, 'elementsFromPoint', {
      configurable: true,
      value: vi.fn().mockReturnValue([icon]),
    });
    const event = new MouseEvent('contextmenu', { clientX: 240, clientY: 180 });
    vi.spyOn(event, 'preventDefault');

    try {
      service.onContextMenuBackdrop(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(contextMenuSpy.openApp).toHaveBeenCalledWith(240, 180, 'terminal');
    } finally {
      Reflect.deleteProperty(document, 'elementsFromPoint');
    }
  });

  it('should switch context menu apps after a long touch on the backdrop', () => {
    contextMenuSpy.close.mockClear();
    contextMenuSpy.openApp.mockClear();
    contextMenuSpy.isOpen.mockReturnValue(true);
    const target = document.createElement('button');
    target.dataset['contextMenuAppId'] = 'terminal';
    Object.defineProperty(document, 'elementsFromPoint', {
      configurable: true,
      value: vi.fn().mockReturnValue([target]),
    });
    const event = new Event('touchstart', { cancelable: true });
    Object.defineProperty(event, 'touches', {
      value: [{ clientX: 120, clientY: 160 }],
    });
    vi.useFakeTimers();

    try {
      service.onContextMenuBackdropTouchStart(event as TouchEvent);
      expect(contextMenuSpy.openApp).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(contextMenuSpy.openApp).toHaveBeenCalledWith(120, 160, 'terminal');

      service.onContextMenuBackdropTouchEnd();
      expect(contextMenuSpy.close).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
      Reflect.deleteProperty(document, 'elementsFromPoint');
      contextMenuSpy.isOpen.mockReturnValue(false);
    }
  });

  it('should close the context menu after a short backdrop touch', () => {
    contextMenuSpy.close.mockClear();
    contextMenuSpy.isOpen.mockReturnValue(true);
    const target = document.createElement('button');
    target.dataset['contextMenuAppId'] = 'terminal';
    Object.defineProperty(document, 'elementsFromPoint', {
      configurable: true,
      value: vi.fn().mockReturnValue([target]),
    });
    const event = new Event('touchstart', { cancelable: true });
    Object.defineProperty(event, 'touches', {
      value: [{ clientX: 120, clientY: 160 }],
    });

    try {
      service.onContextMenuBackdropTouchStart(event as TouchEvent);
      service.onContextMenuBackdropTouchEnd();
      expect(contextMenuSpy.close).toHaveBeenCalledOnce();
    } finally {
      Reflect.deleteProperty(document, 'elementsFromPoint');
      contextMenuSpy.isOpen.mockReturnValue(false);
    }
  });
});
