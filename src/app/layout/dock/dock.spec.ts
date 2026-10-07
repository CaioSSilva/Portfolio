import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Dock } from './dock';
import { DockService } from '../../core/services/dock';
import { ProcessManager } from '../../core/services/process-manager';
import { Settings } from '../../core/services/settings';
import { ContextMenuService } from '../../core/services/context-menu';
import { LanguageService } from '../../core/services/language';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';
import { FileSystem } from '../../core/services/file-system';
import { NotificationService } from '../../core/services/notification';
import { Sound } from '../../core/services/sound';

describe('Dock', () => {
  let component: Dock;
  let fixture: ComponentFixture<Dock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dock],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DockService,
        ProcessManager,
        Settings,
        ContextMenuService,
        LanguageService,
        AppRegistry,
        AppLauncher,
        FileSystem,
        NotificationService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
