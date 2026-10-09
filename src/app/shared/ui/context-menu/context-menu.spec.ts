import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextMenu } from './context-menu';
import { ContextMenuService } from '../../../core/services/context-menu';
import { LanguageService } from '../../../core/services/language';
import { DockService } from '../../../core/services/dock';
import { DesktopIconsService } from '../../../core/services/desktop-icons';
import { ProcessManager } from '../../../core/services/process-manager';
import { signal } from '@angular/core';

describe('ContextMenu', () => {
  let component: ContextMenu;
  let fixture: ComponentFixture<ContextMenu>;

  const contextMenuMock = {
    open: vi.fn(),
    close: vi.fn(),
    isOpen: signal(false),
    position: signal({ x: 0, y: 0 }),
    activeAppId: signal<string | null>(null),
    activeItem: signal<string | null>(null),
    openApp: vi.fn(),
  };
  const dockMock = { pinnedApps: signal([]), pinApp: vi.fn(), unpinApp: vi.fn() };
  const desktopMock = { onDesktopApps: signal([]), addApp: vi.fn(), removeApp: vi.fn() };
  const processMock = { processes: signal([]), focus: vi.fn(), close: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenu],
      providers: [
        { provide: ContextMenuService, useValue: contextMenuMock },
        { provide: DockService, useValue: dockMock },
        { provide: DesktopIconsService, useValue: desktopMock },
        { provide: ProcessManager, useValue: processMock },
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
});
