import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsComponent } from './settings';
import { Theme } from '../../core/services/theme';
import { Settings } from '../../core/services/settings';
import { LanguageService } from '../../core/services/language';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [Theme, Settings, LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch active section', () => {
    component.setSection('desktop');
    expect(component.activeSection()).toBe('desktop');
  });
});
