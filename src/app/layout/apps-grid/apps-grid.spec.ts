import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppsGrid } from './apps-grid';
import { Apps } from '../../core/services/apps';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';
import { ContextMenuService } from '../../core/services/context-menu';
import { LanguageService } from '../../core/services/language';
import { DockService } from '../../core/services/dock';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { ProcessManager } from '../../core/services/process-manager';
import { FileSystem } from '../../core/services/file-system';
import { NotificationService } from '../../core/services/notification';
import { Sound } from '../../core/services/sound';

describe('AppsGrid', () => {
  let component: AppsGrid;
  let fixture: ComponentFixture<AppsGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppsGrid],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Apps,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        LanguageService,
        DockService,
        DesktopIconsService,
        ProcessManager,
        FileSystem,
        NotificationService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppsGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
