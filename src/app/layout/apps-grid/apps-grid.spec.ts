import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppsGrid } from './apps-grid';
import { Apps } from '../../core/services/apps';
import { ContextMenuService } from '../../core/services/context-menu';
import { LanguageService } from '../../core/services/language';
import { DockService } from '../../core/services/dock';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { ProcessManager } from '../../core/services/process-manager';
import { signal } from '@angular/core';
import { AppDefinition } from '../../core/models/dock';

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
    const event = { target: input } as unknown as Event;
    component.onSearch(event);
    expect(appsSearchQuery()).toBe('browser');
  });

  it('onSearch with empty value clears searchQuery', () => {
    appsSearchQuery.set('browser');
    const input = document.createElement('input');
    input.value = '';
    component.onSearch({ target: input } as unknown as Event);
    expect(appsSearchQuery()).toBe('');
  });

  it('ondragStart sets appId on dataTransfer', () => {
    const app: AppDefinition = { id: 'browser', title: 'Browser', icon: 'globe', color: '#fff', component: null as any };
    const dt = { setData: vi.fn(), effectAllowed: '' } as unknown as DataTransfer;
    const event = { dataTransfer: dt } as unknown as DragEvent;
    component.ondragStart(event, app);
    expect(dt.setData).toHaveBeenCalledWith('appId', 'browser');
    expect(dt.effectAllowed).toBe('link');
  });

  it('ondragStart handles null dataTransfer gracefully', () => {
    const app: AppDefinition = { id: 'browser', title: 'Browser', icon: 'globe', color: '#fff', component: null as any };
    const event = { dataTransfer: null } as unknown as DragEvent;
    expect(() => component.ondragStart(event, app)).not.toThrow();
  });
});
