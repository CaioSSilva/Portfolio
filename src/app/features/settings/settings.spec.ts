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
    const ids = component.menuItems().map(m => m.id);
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
});
