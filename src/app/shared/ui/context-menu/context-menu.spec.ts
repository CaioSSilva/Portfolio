import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenu } from './context-menu';
import { ContextMenuService } from '../../../core/services/context-menu';
import { LanguageService } from '../../../core/services/language';
import { DockService } from '../../../core/services/dock';
import { DesktopIconsService } from '../../../core/services/desktop-icons';
import { ProcessManager } from '../../../core/services/process-manager';
import { ScreenService } from '../../../core/services/screen';
import { signal } from '@angular/core';

describe('ContextMenu', () => {
  let component: ContextMenu;
  let fixture: ComponentFixture<ContextMenu>;

  const contextMenuMock = {
    close: vi.fn(),
    isOpen: signal(false),
    position: signal({ x: 0, y: 0 }),
    activeAppId: signal<string | null>(null),
    activeItem: signal<string | null>(null),
    openApp: vi.fn(),
  };
  const dockMock = {
    pinnedApps: signal([]),
    openActiveApp: vi.fn(),
    focusActiveApp: vi.fn(),
    hasPinnedAppWithId: vi.fn().mockReturnValue(false),
    pinApp: vi.fn(),
    unPinActiveApp: vi.fn(),
    closeActiveApp: vi.fn(),
  };
  const desktopMock = {
    onDesktopApps: signal([]),
    hasPinnedAppWithId: vi.fn().mockReturnValue(false),
    pinApp: vi.fn(),
    unpinApp: vi.fn(),
  };
  const processMock = {
    processes: signal([]),
    hasActiveProcessesById: vi.fn().mockReturnValue(false),
    focus: vi.fn(),
    close: vi.fn(),
  };
  const menuAnimation = { cancel: vi.fn() };
  const animateMenu = vi.fn().mockReturnValue(menuAnimation);

  beforeEach(async () => {
    vi.clearAllMocks();
    contextMenuMock.isOpen.set(false);
    contextMenuMock.activeAppId.set(null);
    Object.defineProperty(HTMLElement.prototype, 'animate', {
      configurable: true,
      value: animateMenu,
    });

    await TestBed.configureTestingModule({
      imports: [ContextMenu],
      providers: [
        { provide: ContextMenuService, useValue: contextMenuMock },
        { provide: DockService, useValue: dockMock },
        { provide: DesktopIconsService, useValue: desktopMock },
        { provide: ProcessManager, useValue: processMock },
        { provide: ScreenService, useValue: { isMobile: vi.fn().mockReturnValue(false) } },
        LanguageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes contextMenu service', () => {
    expect(component.contextMenu).toBe(contextMenuMock);
  });

  it('exposes dock service', () => {
    expect(component.dock).toBe(dockMock);
  });

  it('exposes desktop service', () => {
    expect(component.desktop).toBe(desktopMock);
  });

  it('exposes process manager', () => {
    expect(component.processManager).toBe(processMock);
  });

  it('positions the menu using its measured size and available viewport space', async () => {
    contextMenuMock.isOpen.set(false);
    contextMenuMock.activeAppId.set(null);
    expect(component.hasPositionedMenu()).toBe(false);

    contextMenuMock.activeAppId.set('files');
    contextMenuMock.position.set({ x: 0, y: 0 });
    contextMenuMock.isOpen.set(true);
    fixture.detectChanges();

    const menu = fixture.nativeElement.querySelector('[data-context-menu]');
    Object.defineProperties(menu, {
      offsetWidth: { configurable: true, value: 260 },
      offsetHeight: { configurable: true, value: 180 },
    });

    contextMenuMock.position.set({ x: 100, y: 120 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.menuPosition()).toEqual({ x: 100, y: 120 });

    contextMenuMock.position.set({ x: window.innerWidth - 1, y: window.innerHeight - 1 });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.menuPosition()).toEqual({
      x: Math.max(8, window.innerWidth - 268),
      y: Math.max(8, window.innerHeight - 188),
    });
    expect(component.menuTransformOrigin()).toBe(
      `${window.innerWidth - 1 - component.menuPosition().x}px ${window.innerHeight - 1 - component.menuPosition().y}px`,
    );
    expect(component.hasPositionedMenu()).toBe(true);
    expect(animateMenu).toHaveBeenCalledOnce();

    contextMenuMock.position.set({ x: 160, y: 180 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.hasPositionedMenu()).toBe(true);
    expect(animateMenu).toHaveBeenCalledOnce();

    contextMenuMock.isOpen.set(false);
    contextMenuMock.activeAppId.set(null);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.hasPositionedMenu()).toBe(false);
  });

  it('replays the opening animation when switching apps without closing the menu', async () => {
    contextMenuMock.activeAppId.set('files');
    contextMenuMock.position.set({ x: 100, y: 100 });
    contextMenuMock.isOpen.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(animateMenu).toHaveBeenCalledOnce();

    contextMenuMock.position.set({ x: 140, y: 140 });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(animateMenu).toHaveBeenCalledOnce();

    contextMenuMock.activeAppId.set('terminal');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(animateMenu).toHaveBeenCalledTimes(2);
    expect(menuAnimation.cancel).toHaveBeenCalledOnce();
  });

});
