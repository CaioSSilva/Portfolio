import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Files } from './files';
import { FileSystem } from '../../core/services/file-system';
import { ProcessManager } from '../../core/services/process-manager';
import { LanguageService } from '../../core/services/language';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';

describe('Files', () => {
  let component: Files;
  let fixture: ComponentFixture<Files>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Files],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        FileSystem,
        ProcessManager,
        LanguageService,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Files);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
