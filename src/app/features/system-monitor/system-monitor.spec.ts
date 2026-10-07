import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SystemMonitor } from './system-monitor';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';
import { FileSystem } from '../../core/services/file-system';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';

describe('SystemMonitor', () => {
  let component: SystemMonitor;
  let fixture: ComponentFixture<SystemMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMonitor],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        ProcessManager,
        FileSystem,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemMonitor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
