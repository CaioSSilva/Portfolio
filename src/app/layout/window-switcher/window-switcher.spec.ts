import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WindowSwitcher } from './window-switcher';
import { ProcessManager } from '../../core/services/process-manager';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';

describe('WindowSwitcher', () => {
  let component: WindowSwitcher;
  let fixture: ComponentFixture<WindowSwitcher>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindowSwitcher],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProcessManager,
        LanguageService,
        FileSystem,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WindowSwitcher);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
