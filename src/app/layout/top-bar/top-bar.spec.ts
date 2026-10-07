import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TopBar } from './top-bar';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';
import { Settings } from '../../core/services/settings';
import { Sound } from '../../core/services/sound';
import { FileSystem } from '../../core/services/file-system';
import { AppRegistry } from '../../core/services/app-registry';

describe('TopBar', () => {
  let component: TopBar;
  let fixture: ComponentFixture<TopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBar],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProcessManager,
        NotificationService,
        LanguageService,
        Settings,
        FileSystem,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
