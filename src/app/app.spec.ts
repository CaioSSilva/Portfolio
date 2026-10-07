import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from './app';
import { NotificationService } from './core/services/notification';
import { ProcessManager } from './core/services/process-manager';
import { Settings } from './core/services/settings';
import { Sound } from './core/services/sound';
import { LanguageService } from './core/services/language';
import { SystemTips } from './core/services/system-tips';
import { DesktopIconsService } from './core/services/desktop-icons';
import { FileSystem } from './core/services/file-system';
import { AppRegistry } from './core/services/app-registry';
import { AppLauncher } from './core/services/app-launcher';
import { ContextMenuService } from './core/services/context-menu';
import { DockService } from './core/services/dock';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificationService,
        ProcessManager,
        Settings,
        LanguageService,
        SystemTips,
        DesktopIconsService,
        FileSystem,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        DockService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
