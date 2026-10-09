import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppsGrid } from './apps-grid';
import { Apps } from '../../core/services/apps';
import { ContextMenuService } from '../../core/services/context-menu';
import { LanguageService } from '../../core/services/language';
import { DockService } from '../../core/services/dock';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { ProcessManager } from '../../core/services/process-manager';
import { Type, signal } from '@angular/core';
import { AppDefinition } from '../../core/models/dock';
import { Base } from '../../core/models/base';

describe('AppsGrid', () => {
  let component: AppsGrid;
  let fixture: ComponentFixture<AppsGrid>;
  let appsSearchQuery: ReturnType<typeof signal<string>>;

  beforeEach(async () => {
    appsSearchQuery = signal('');

    const appsMock = {
      searchQuery: appsSearchQuery,
      isAppsGridOpen: signal(false),
      filteredApps: signal([]),
      appsRegistry: signal({}),
      appsDefinition: signal([]),
      appSearchResult: signal([]),
      debouncedQuery: signal(''),
      openApp: vi.fn(),
      toggleGrid: vi.fn(),
      onRightClickApp: vi.fn(),
    };

    const contextMenuMock = {
      open: vi.fn(),
      close: vi.fn(),
      menuState: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [AppsGrid],
      providers: [
        { provide: Apps, useValue: appsMock },
        { provide: ContextMenuService, useValue: contextMenuMock },
        LanguageService,
        { provide: DockService, useValue: { pinnedApps: signal([]) } },
        { provide: DesktopIconsService, useValue: { onDesktopApps: signal([]) } },
        { provide: ProcessManager, useValue: { processes: signal([]) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppsGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onSearch sets appsService.searchQuery from input element value', () => {
    const input = document.createElement('input');
    input.value = 'browser';
    const event: Partial<Event> = { target: input };
    component.onSearch(event as Event);
    expect(appsSearchQuery()).toBe('browser');
  });

  it('onSearch with empty value clears searchQuery', () => {
    appsSearchQuery.set('browser');
    const input = document.createElement('input');
    input.value = '';
    const event: Partial<Event> = { target: input };
    component.onSearch(event as Event);
    expect(appsSearchQuery()).toBe('');
  });

  it('onDragStart sets appId on dataTransfer', () => {
    const app: AppDefinition = {
      id: 'browser',
      title: 'Browser',
      icon: 'globe',
      color: '#fff',
      component: Base as Type<Base>,
    };
    const dt: Partial<DataTransfer> = { setData: vi.fn(), effectAllowed: 'none' };
    const event: Partial<DragEvent> = { dataTransfer: dt as DataTransfer };
    component.onDragStart(event as DragEvent, app);
    expect(dt.setData).toHaveBeenCalledWith('appId', 'browser');
    expect(dt.effectAllowed).toBe('link');
  });

  it('onDragStart handles null dataTransfer gracefully', () => {
    const app: AppDefinition = {
      id: 'browser',
      title: 'Browser',
      icon: 'globe',
      color: '#fff',
      component: Base as Type<Base>,
    };
    const event: Partial<DragEvent> = { dataTransfer: null };
    expect(() => component.onDragStart(event as DragEvent, app)).not.toThrow();
  });
});
