import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DesktopIcons } from './desktop-icons';
import { DesktopIconsService } from '../../core/services/desktop-icons';
import { Settings } from '../../core/services/settings';
import { ContextMenuService } from '../../core/services/context-menu';
import { LanguageService } from '../../core/services/language';
import { AppRegistry } from '../../core/services/app-registry';
import { AppLauncher } from '../../core/services/app-launcher';

describe('DesktopIcons', () => {
  let component: DesktopIcons;
  let fixture: ComponentFixture<DesktopIcons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesktopIcons],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        DesktopIconsService,
        Settings,
        ContextMenuService,
        LanguageService,
        AppRegistry,
        AppLauncher,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DesktopIcons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
