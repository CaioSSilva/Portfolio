import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DesktopIcons } from './desktop-icons';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { Apps } from '../../core/services/apps';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { signal } from '@angular/core';

describe('DesktopIcons', () => {
  let component: DesktopIcons;
  let fixture: ComponentFixture<DesktopIcons>;

  const desktopMock = {
    onDesktopApps: signal([{ id: 'browser', title: 'Browser', icon: 'globe', color: '#fff' }]),
    icons: signal([]),
  };

  const appsMock = {
    openApp: vi.fn(),
    appsRegistry: signal({}),
    searchQuery: signal(''),
    filteredApps: signal([]),
  };

  const settingsMock = {
    wallpaper: signal('/wallpapers/default.webp'),
    tipsEnabled: signal(false),
    dockSize: signal(48),
    desktopSize: signal(40),
    systemMuted: signal(false),
    autoHideDock: signal(true),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopIcons],
      providers: [
        { provide: DesktopIconsService, useValue: desktopMock },
        { provide: Apps, useValue: appsMock },
        { provide: Settings, useValue: settingsMock },
        LanguageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopIcons);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes desktop service as desktop property', () => {
    expect(component.desktop).toBe(desktopMock);
  });

  it('exposes apps service as appsService property', () => {
    expect(component.appsService).toBe(appsMock);
  });

  it('exposes settings service as settings property', () => {
    expect(component.settings).toBe(settingsMock);
  });

  it('desktop.onDesktopApps signal is accessible', () => {
    expect(component.desktop.onDesktopApps().length).toBe(1);
    expect(component.desktop.onDesktopApps()[0].id).toBe('browser');
  });
});
