import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Terminal } from './terminal';
import { TerminalComands } from '../../core/services/terminal-comands';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { Theme } from '../../core/services/theme';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';

describe('Terminal', () => {
  let component: Terminal;
  let fixture: ComponentFixture<Terminal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Terminal],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TerminalComands,
        LanguageService,
        FileSystem,
        Theme,
        ProcessManager,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Terminal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
