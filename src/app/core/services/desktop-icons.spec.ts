import { TestBed } from '@angular/core/testing';
import { DesktopIconsService } from './desktop-icons';
import { AppRegistry } from './app-registry';
import { AppLauncher } from './app-launcher';

describe('DesktopIconsService', () => {
  let service: DesktopIconsService;
  let appLauncherSpy: { launch: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    appLauncherSpy = { launch: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        DesktopIconsService,
        AppRegistry,
        { provide: AppLauncher, useValue: appLauncherSpy },
      ],
    });
    service = TestBed.inject(DesktopIconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should pin and unpin apps', () => {
    service.pinApp('files');
    expect(service.hasPinnedAppWithId('files')).toBe(true);
    expect(service.onDesktopApps().some((a) => a.id === 'files')).toBe(true);

    service.unpinApp('files');
    expect(service.hasPinnedAppWithId('files')).toBe(false);
    expect(service.onDesktopApps().some((a) => a.id === 'files')).toBe(false);
  });

  it('should trigger action and open app', () => {
    service.pinApp('terminal');
    expect(service.hasPinnedAppWithId('terminal')).toBe(true);

    const pinnedItem = service.onDesktopApps().find((a) => a.id === 'terminal');
    pinnedItem?.action();
    expect(appLauncherSpy.launch).toHaveBeenCalled();

    service.openApp('terminal');
    expect(appLauncherSpy.launch).toHaveBeenCalledTimes(2);
  });
});
