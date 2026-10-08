import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { NotificationService } from './core/services/notification';
import { ProcessManager } from './core/services/process-manager';
import { Settings } from './core/services/settings';
import { Sound } from './core/services/sound';
import { LanguageService } from './core/services/language';
import { SystemTips } from './core/services/system-tips';
import { Apps } from './core/services/apps';
import { AppLauncher } from './core/services/app-launcher';
import { AppRegistry } from './core/services/app-registry';
import { DockService } from './core/services/dock';
import { ContextMenuService } from './core/services/context-menu';
import { DesktopIconsService } from './core/services/desktop-icons';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';

describe('App', () => {
  let soundMock: { play: ReturnType<typeof vi.fn> };
  let settingsMock: any;
  let tipsMock: { startRandomTips: ReturnType<typeof vi.fn> };
  let appsMock: { isAppsGridOpen: ReturnType<typeof signal<boolean>>; appsRegistry: ReturnType<typeof signal<any>>; appsDefinition: ReturnType<typeof signal<any[]>>; appSearchResult: ReturnType<typeof signal<any[]>>; searchQuery: ReturnType<typeof signal<string>>; openApp: ReturnType<typeof vi.fn>; toggleGrid: ReturnType<typeof vi.fn> };

  function setup() {
    return TestBed.createComponent(App);
  }

  beforeEach(async () => {
    soundMock = { play: vi.fn().mockResolvedValue(undefined) };
    settingsMock = {
      wallpaper: signal(''),
      tipsEnabled: signal(false),
      dockSize: signal(48),
      desktopSize: signal(40),
      systemMuted: signal(false),
      autoHideDock: signal(true),
    };
    tipsMock = { startRandomTips: vi.fn() };
    appsMock = {
      isAppsGridOpen: signal(false),
      appsRegistry: signal({}),
      appsDefinition: signal([]),
      appSearchResult: signal([]),
      searchQuery: signal(''),
      openApp: vi.fn(),
      toggleGrid: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        NotificationService,
        LanguageService,
        AppRegistry,
        { provide: ProcessManager, useValue: {
          processes: signal([]),
          isTopBarHidden: signal(false),
          isDockHidden: signal(false),
          hasActiveProcesses: signal(false),
          open: vi.fn(), focus: vi.fn(), close: vi.fn(), openFile: vi.fn()
        } },
        { provide: Settings, useValue: settingsMock },
        { provide: Sound, useValue: soundMock },
        { provide: SystemTips, useValue: tipsMock },
        { provide: Apps, useValue: appsMock },
        { provide: AppLauncher, useValue: { launch: vi.fn() } },
        { provide: DockService, useValue: {
          pinnedApps: signal([]),
          forceShow: signal(false),
          dockItems: signal([]),
          pinnedAppIds: signal([]),
          pinApp: vi.fn(),
          handleAppClick: vi.fn(),
        } },
        { provide: ContextMenuService, useValue: { isOpen: signal(false), position: signal({ x: 0, y: 0 }), activeAppId: signal(null), activeItem: signal(null), close: vi.fn(), openApp: vi.fn() } },
        { provide: DesktopIconsService, useValue: { onDesktopApps: signal([]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('systemReady defaults to false', () => {
    const fixture = setup();
    expect(fixture.componentInstance.systemReady()).toBe(false);
  });

  it('shutingDown defaults to false', () => {
    const fixture = setup();
    expect(fixture.componentInstance.shutingDown()).toBe(false);
  });

  it('isAnimated returns false for non-video wallpaper', () => {
    settingsMock.wallpaper.set('mountains.jpg');
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.componentInstance.isAnimated()).toBe(false);
  });

  it('isAnimated returns true for .mp4 wallpaper', () => {
    settingsMock.wallpaper.set('animated.mp4');
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.componentInstance.isAnimated()).toBe(true);
  });

  it('isAnimated returns true for .webm wallpaper', () => {
    settingsMock.wallpaper.set('animated.webm');
    const fixture = setup();
    fixture.detectChanges();
    expect(fixture.componentInstance.isAnimated()).toBe(true);
  });

  it('onClick plays mouse_down sound when system is ready', () => {
    const fixture = setup();
    const app = fixture.componentInstance;
    app.systemReady.set(true);
    app.onClick();
    expect(soundMock.play).toHaveBeenCalledWith('mouse_down');
  });

  it('onClick does nothing when system not ready', () => {
    const fixture = setup();
    const app = fixture.componentInstance;
    app.systemReady.set(false);
    app.onClick();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('onMouseUp plays mouse_up sound when system is ready', () => {
    const fixture = setup();
    const app = fixture.componentInstance;
    app.systemReady.set(true);
    app.onMouseUp();
    expect(soundMock.play).toHaveBeenCalledWith('mouse_up');
  });

  it('onMouseUp does nothing when system not ready', () => {
    const fixture = setup();
    const app = fixture.componentInstance;
    app.systemReady.set(false);
    app.onMouseUp();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('startRandomTips called when systemReady and tipsEnabled', () => {
    const fixture = setup();
    const app = fixture.componentInstance;
    settingsMock.tipsEnabled.set(true);
    app.systemReady.set(true);
    fixture.detectChanges();
    expect(tipsMock.startRandomTips).toHaveBeenCalled();
  });

  it('startRandomTips NOT called when systemReady but tipsEnabled is false', () => {
    const fixture = setup();
    const app = fixture.componentInstance;
    settingsMock.tipsEnabled.set(false);
    app.systemReady.set(true);
    fixture.detectChanges();
    expect(tipsMock.startRandomTips).not.toHaveBeenCalled();
  });

  it('opens About app 1s after systemReady when about is in registry', () => {
    vi.useFakeTimers();
    const aboutApp = { id: 'about', title: 'About', icon: 'i', color: '#fff', component: null as any };
    appsMock.appsRegistry.set({ about: aboutApp });

    const fixture = setup();
    fixture.detectChanges();

    fixture.componentInstance.systemReady.set(true);
    fixture.detectChanges();

    vi.advanceTimersByTime(1000);
    expect(appsMock.openApp).toHaveBeenCalledWith(aboutApp);
    vi.useRealTimers();
  });

  it('does not open About app before systemReady fires', () => {
    vi.useFakeTimers();
    const aboutApp = { id: 'about', title: 'About', icon: 'i', color: '#fff', component: null as any };
    appsMock.appsRegistry.set({ about: aboutApp });

    const fixture = setup();
    fixture.detectChanges();

    vi.advanceTimersByTime(2000);
    expect(appsMock.openApp).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
