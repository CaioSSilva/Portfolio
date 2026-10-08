import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type, signal } from '@angular/core';
import { Dock } from './dock';
import { DockService } from '../../core/services/dock';
import { Apps } from '../../core/services/apps';
import { ProcessManager } from '../../core/services/process-manager';
import { Settings } from '../../core/services/settings';
import { ContextMenuService } from '../../core/services/context-menu';
import { LanguageService } from '../../core/services/language';
import { AppDefinition } from '../../core/models/dock';
import { Base } from '../../core/models/base';
describe('Dock', () => {
  let component: Dock;
  let fixture: ComponentFixture<Dock>;
  let dockMock: Pick<
    DockService,
    | 'pinnedAppIds'
    | 'forceShow'
    | 'dockItems'
    | 'pinApp'
    | 'unpinApp'
    | 'handleAppClick'
    | 'openActiveApp'
    | 'closeActiveApp'
    | 'unPinActiveApp'
    | 'hasPinnedAppWithId'
  >;
  let appsMock: Pick<
    Apps,
    | 'openApp'
    | 'isAppsGridOpen'
    | 'appsDefinition'
    | 'appSearchResult'
    | 'searchQuery'
    | 'toggleGrid'
    | 'onRightClickApp'
  > & { appsRegistry: ReturnType<typeof signal<Record<string, AppDefinition | undefined>>> };

  beforeEach(async () => {
    dockMock = {
      forceShow: signal(false),
      dockItems: signal([]),
      pinnedAppIds: signal([]),
      pinApp: vi.fn(),
      unpinApp: vi.fn(),
      handleAppClick: vi.fn(),
      openActiveApp: vi.fn(),
      closeActiveApp: vi.fn(),
      unPinActiveApp: vi.fn(),
      hasPinnedAppWithId: vi.fn().mockReturnValue(false),
    };

    appsMock = {
      openApp: vi.fn(),
      isAppsGridOpen: signal(false),
      appsRegistry: signal({}),
      appsDefinition: signal([]),
      appSearchResult: signal([]),
      searchQuery: signal(''),
      toggleGrid: vi.fn(),
      onRightClickApp: vi.fn(),
    };

    const settingsMock = {
      wallpaper: signal(''),
      tipsEnabled: signal(false),
      dockSize: signal(48),
      desktopSize: signal(40),
      systemMuted: signal(false),
      autoHideDock: signal(true),
    };

    await TestBed.configureTestingModule({
      imports: [Dock],
      providers: [
        { provide: DockService, useValue: dockMock },
        {
          provide: ProcessManager,
          useValue: {
            processes: signal([]),
            isTopBarHidden: signal(false),
            isDockHidden: signal(false),
            hasActiveProcesses: signal(false),
            focus: vi.fn(),
          },
        },
        { provide: Settings, useValue: settingsMock },
        {
          provide: ContextMenuService,
          useValue: {
            isOpen: signal(false),
            position: signal({ x: 0, y: 0 }),
            activeAppId: signal(null),
            activeItem: signal(null),
            close: vi.fn(),
            openApp: vi.fn(),
          },
        },
        LanguageService,
        { provide: Apps, useValue: appsMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dock);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getAppLabel returns localized app name', () => {
    const label = component.getAppLabel('about', 'About');
    expect(typeof label).toBe('string');
  });

  it('getAppLabel falls back to defaultTitle when appId not in lang', () => {
    const label = component.getAppLabel('unknownApp999', 'My Default');
    expect(label).toBe('My Default');
  });

  it('itemNewPinPos defaults to null', () => {
    expect(component.itemNewPinPos()).toBeNull();
  });

  it('onDrop calls dock.pinApp with appId and position then resets', () => {
    component.itemNewPinPos.set(2);
    const dt = {
      getData: vi.fn().mockReturnValue('browser'),
      preventDefault: vi.fn(),
    } as unknown as DataTransfer;
    const event = { preventDefault: vi.fn(), dataTransfer: dt } as unknown as DragEvent;
    component.onDrop(event);
    expect(dockMock.pinApp).toHaveBeenCalledWith('browser', 2);
    expect(component.itemNewPinPos()).toBeNull();
  });

  it('onDrop does nothing if appId is empty', () => {
    component.itemNewPinPos.set(1);
    const dt = {
      getData: vi.fn().mockReturnValue(''),
      preventDefault: vi.fn(),
    } as unknown as DataTransfer;
    const event = { preventDefault: vi.fn(), dataTransfer: dt } as unknown as DragEvent;
    component.onDrop(event);
    expect(dockMock.pinApp).not.toHaveBeenCalled();
    expect(component.itemNewPinPos()).toBeNull();
  });
});
