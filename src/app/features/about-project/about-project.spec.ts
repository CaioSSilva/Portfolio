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
  let appLauncherSpy: { launch: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    appLauncherSpy = { launch: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [AboutProject],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        Apps,
        LanguageService,
        FileSystem,
        AppRegistry,
        { provide: AppLauncher, useValue: appLauncherSpy },
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

  it('should list about apps with at least files and terminal', () => {
    const list = component.aboutApps();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((item) => item.config.id === 'files')).toBe(true);
    expect(list.some((item) => item.config.id === 'terminal')).toBe(true);
  });

  it('should handleOpenApp launch the app', () => {
    const appsService = TestBed.inject(Apps);
    const app = appsService.appsDefinition()[0];
    component.handleOpenApp(app);
    expect(appLauncherSpy.launch).toHaveBeenCalledWith(app, app.data);
  });

  it('should resumeName be Currículo for pt language', () => {
    component.lang.setLanguage('pt');
    expect(component.resumeName()).toBe('Currículo');
  });

  it('should resumeName be Resume for en language', () => {
    component.lang.setLanguage('en');
    expect(component.resumeName()).toBe('Resume');
  });

  it('should downloadResume call fs.downloadFile with correct path and name', () => {
    const fileSystem = TestBed.inject(FileSystem);
    const fsSpy = vi
      .spyOn(fileSystem, 'downloadFile')
      .mockImplementation(() => {});
    component.lang.setLanguage('en');
    component.downloadResume();
    expect(fsSpy).toHaveBeenCalled();
    const [, name] = fsSpy.mock.calls[0];
    expect(name).toContain('Resume');
  });
});
