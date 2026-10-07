import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ContextMenu } from './context-menu';
import { ContextMenuService } from '../../../core/services/context-menu';
import { LanguageService } from '../../../core/services/language';
import { DockService } from '../../../core/services/dock';
import { DesktopIconsService } from '../../../core/services/desktop-icons';
import { ProcessManager } from '../../../core/services/process-manager';
import { AppRegistry } from '../../../core/services/app-registry';
import { AppLauncher } from '../../../core/services/app-launcher';
import { FileSystem } from '../../../core/services/file-system';
import { NotificationService } from '../../../core/services/notification';
import { Sound } from '../../../core/services/sound';

describe('ContextMenu', () => {
  let component: ContextMenu;
  let fixture: ComponentFixture<ContextMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextMenu],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ContextMenuService,
        LanguageService,
        DockService,
        DesktopIconsService,
        ProcessManager,
        AppRegistry,
        AppLauncher,
        FileSystem,
        NotificationService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContextMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
