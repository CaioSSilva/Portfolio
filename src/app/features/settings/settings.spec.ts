import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings';
import { Theme } from '../../core/services/theme';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';
import { ScreenService } from '../../core/services/screen';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [Theme, Settings, LanguageService, ScreenService],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch active section', () => {
    component.setSection('sound');
    expect(component.activeSection()).toBe('sound');
    component.setSection('language');
    expect(component.activeSection()).toBe('language');
  });

  it('should default activeSection to appearance', () => {
    expect(component.activeSection()).toBe('appearance');
  });

  it('should menuItems include all sections', () => {
    const ids = component.menuItems().map((m) => m.id);
    expect(ids).toContain('appearance');
    expect(ids).toContain('desktop');
    expect(ids).toContain('sound');
    expect(ids).toContain('language');
    expect(ids).toContain('system');
  });

  it('should wallpapers list be non-empty', () => {
    expect(component.wallpapers.length).toBeGreaterThan(0);
  });

  it('should wallpapersAnimated list be non-empty', () => {
    expect(component.wallpapersAnimated.length).toBeGreaterThan(0);
  });

  it('should systemInfo have os and kernel properties', () => {
    expect(component.systemInfo).toBeDefined();
    expect(component.systemInfo.os).toBeDefined();
    expect(component.systemInfo.kernel).toBeDefined();
  });

  it('should setSection to desktop', () => {
    component.setSection('desktop');
    expect(component.activeSection()).toBe('desktop');
  });

  it('should setSection to system', () => {
    component.setSection('system');
    expect(component.activeSection()).toBe('system');
  });

  it('dock size slider --slider-pct is 0% at minimum value', () => {
    const settings = TestBed.inject(Settings);
    settings.setDockSize(28);
    const pct = ((settings.dockSize() - 28) / (64 - 28)) * 100;
    expect(pct).toBe(0);
  });

  it('dock size slider --slider-pct is 100% at maximum value', () => {
    const settings = TestBed.inject(Settings);
    settings.setDockSize(64);
    const pct = ((settings.dockSize() - 28) / (64 - 28)) * 100;
    expect(pct).toBe(100);
  });

  it('dock size slider --slider-pct is proportional mid-range', () => {
    const settings = TestBed.inject(Settings);
    settings.setDockSize(46);
    const pct = ((settings.dockSize() - 28) / (64 - 28)) * 100;
    expect(pct).toBeCloseTo(50, 0);
  });

  it('desktop size slider --slider-pct is 0% at minimum value', () => {
    const settings = TestBed.inject(Settings);
    settings.setDesktopSize(32);
    const pct = ((settings.desktopSize() - 32) / (80 - 32)) * 100;
    expect(pct).toBe(0);
  });

  it('desktop size slider --slider-pct is 100% at maximum value', () => {
    const settings = TestBed.inject(Settings);
    settings.setDesktopSize(80);
    const pct = ((settings.desktopSize() - 32) / (80 - 32)) * 100;
    expect(pct).toBe(100);
  });

  it('updates snap edge sensitivity from a typed range input event', () => {
    const settings = TestBed.inject(Settings);
    const input = document.createElement('input');
    input.type = 'range';
    input.value = '48';
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: input });

    component.onSnapEdgeSizeInput(event);

    expect(settings.snapEdgeSize()).toBe(48);
  });

  it('uses the shared dropdown for snap mode instead of a native select', () => {
    component.setSection('desktop');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('select')).toBeNull();
    const dropdown = fixture.nativeElement.querySelector('app-dropdown');
    expect(dropdown).not.toBeNull();

    dropdown.querySelector('[data-dropdown-trigger]').click();
    fixture.detectChanges();
    expect(dropdown.querySelector('[role="listbox"]')).not.toBeNull();
    expect(dropdown.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it('updates snap mode when selecting a shared dropdown option', () => {
    const settings = TestBed.inject(Settings);
    component.setSection('desktop');
    fixture.detectChanges();
    const dropdown = fixture.nativeElement.querySelector('app-dropdown');
    dropdown.querySelector('[data-dropdown-trigger]').click();
    fixture.detectChanges();

    dropdown.querySelector('[data-dropdown-option="thirds"]').click();
    fixture.detectChanges();

    expect(settings.windowSnapMode()).toBe('thirds');
    expect(dropdown.querySelector('[role="listbox"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Pair adjacent windows');

    settings.setWindowSnapMode('halves');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Pair adjacent windows');
  });

  it('groups snap shortcut guidance and adapts the labels to the selected layout', () => {
    const settings = TestBed.inject(Settings);
    const language = TestBed.inject(LanguageService);
    language.setLanguage('pt');
    settings.setWindowSnapMode('classic');
    component.setSection('desktop');
    fixture.detectChanges();

    const desktop = fixture.nativeElement as HTMLElement;
    expect(desktop.textContent).toContain('Atalhos do teclado');
    expect(desktop.textContent).toContain('Encaixar à esquerda ou à direita');
    expect(desktop.textContent).toContain('Metades da tela');
    expect(desktop.querySelectorAll('.snap-shortcut-key').length).toBeGreaterThan(0);
    expect(desktop.textContent).toContain('Encaixar nos cantos superiores');

    settings.setWindowSnapMode('thirds');
    fixture.detectChanges();
    expect(desktop.textContent).toContain('Terços da tela');
    expect(desktop.textContent).toContain('Terço central; pressione novamente para restaurar');
    expect(desktop.textContent).not.toContain('Encaixar nos cantos superiores');
  });

  it('hides snap controls and shortcut guidance in mobile mode', () => {
    const screen = TestBed.inject(ScreenService);
    TestBed.inject(LanguageService).setLanguage('pt');
    component.setSection('desktop');
    screen.width.set(500);
    fixture.detectChanges();

    const desktop = fixture.nativeElement as HTMLElement;
    expect(desktop.querySelector('app-dropdown')).toBeNull();
    expect(desktop.textContent).not.toContain('Layouts de encaixe');
    expect(desktop.textContent).not.toContain('Atalhos do teclado');
    expect(desktop.querySelector('.snap-shortcut-key')).toBeNull();

    screen.width.set(1024);
    fixture.detectChanges();
    expect(desktop.querySelector('app-dropdown')).not.toBeNull();
  });
});
