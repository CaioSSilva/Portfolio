import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AboutProject } from './about-project';
import { Apps } from '../../core/services/apps';
import { LanguageService } from '../../core/services/language';
import { FileSystem } from '../../core/services/file-system';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';
import { ContextMenuService } from '../../core/services/context-menu';
import { Sound } from '../../core/services/sound';

describe('AboutProject', () => {
  let component: AboutProject;
  let fixture: ComponentFixture<AboutProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutProject],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Apps,
        LanguageService,
        FileSystem,
        AppRegistry,
        AppLauncher,
        ContextMenuService,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutProject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list about apps', () => {
    const list = component.aboutApps();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((item) => item.config.id === 'files')).toBe(true);
  });
});
