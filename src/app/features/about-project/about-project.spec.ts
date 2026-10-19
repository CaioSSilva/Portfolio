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
import { ProcessManager } from '../../core/services/process-manager';

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

  it('should choose the README matching the active language', () => {
    component.lang.setLanguage('en');
    expect(component.readmeName()).toBe('README.md');

    component.lang.setLanguage('pt');
    expect(component.readmeName()).toBe('README.pt-BR.md');
  });

  it('should open the README matching the active language', () => {
    const processManager = TestBed.inject(ProcessManager);
    const openFileSpy = vi.spyOn(processManager, 'openFile').mockImplementation(() => {});

    component.lang.setLanguage('pt');
    component.openReadme();

    expect(openFileSpy).toHaveBeenCalledWith({
      id: 'readme-pt-br',
      name: 'README.pt-BR.md',
      type: 'file',
      icon: 'fas fa-file-alt',
      url: '/data/root/home/documents/README.pt-BR.md',
    });
  });

  it('should open the resume for the active language', () => {
    const processManager = TestBed.inject(ProcessManager);
    const openFileSpy = vi.spyOn(processManager, 'openFile').mockImplementation(() => {});

    component.lang.setLanguage('en');
    component.openResume();

    expect(openFileSpy).toHaveBeenCalledWith({
      id: 'Curr2',
      name: 'Resume.pdf',
      type: 'file',
      icon: 'fas fa-file-pdf',
      url: '/data/root/home/documents/Resume.pdf',
    });
  });
});
