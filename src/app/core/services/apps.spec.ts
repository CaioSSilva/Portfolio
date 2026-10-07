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

    service.toggleGrid(); // closes
    expect(service.searchQuery()).toBe('');
  });

  it('should reset search query when opening app', () => {
    service.searchQuery.set('test');
    const app = service.appsDefinition()[0];
    service.openApp(app);
    expect(service.searchQuery()).toBe('');
    expect(service.isAppsGridOpen()).toBe(false);
  });

  it('should call contextMenu.openApp on right-click within window bounds', () => {
    const app = service.appsDefinition()[0];
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 100,
      clientY: 300,
    } as unknown as MouseEvent;

    service.onRightClickApp(event, app.id);
    expect(contextMenuSpy.openApp).toHaveBeenCalled();
  });

  it('should adjust x position when context menu would overflow right edge', () => {
    const app = service.appsDefinition()[0];
    const event = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: window.innerWidth - 10,
      clientY: 300,
    } as unknown as MouseEvent;

    service.onRightClickApp(event, app.id);
    const [xArg] = contextMenuSpy.openApp.mock.calls[0];
    expect(xArg).toBeLessThan(window.innerWidth - 10);
  });
});
