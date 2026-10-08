import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileNavBar } from './mobile-nav-bar';
import { MobileNavService } from '../../core/services/mobile-nav';
import { ProcessManager } from '../../core/services/process-manager';
import { LanguageService } from '../../core/services/language';
import { signal } from '@angular/core';

describe('MobileNavBar', () => {
  let component: MobileNavBar;
  let fixture: ComponentFixture<MobileNavBar>;
  let toggleOverviewSpy: ReturnType<typeof vi.fn>;
  let goHomeSpy: ReturnType<typeof vi.fn>;
  let toggleAppDrawerSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    toggleOverviewSpy = vi.fn();
    goHomeSpy = vi.fn();
    toggleAppDrawerSpy = vi.fn();

    const navMock = {
      isOverviewOpen: signal(false),
      toggleOverview: toggleOverviewSpy as () => void,
      goHome: goHomeSpy as () => void,
      toggleAppDrawer: toggleAppDrawerSpy as () => void,
    };
    const pmMock = { processes: signal([]) };

    await TestBed.configureTestingModule({
      imports: [MobileNavBar],
      providers: [
        { provide: MobileNavService, useValue: navMock },
        { provide: ProcessManager, useValue: pmMock },
        LanguageService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileNavBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('tap() executes the supplied action', () => {
    const fn = vi.fn();
    component.tap(fn as () => void);
    expect(fn).toHaveBeenCalled();
  });

  it('tap() with toggleOverview delegates to nav service', () => {
    component.tap(toggleOverviewSpy as () => void);
    expect(toggleOverviewSpy).toHaveBeenCalled();
  });

  it('tap() with goHome delegates to nav service', () => {
    component.tap(goHomeSpy as () => void);
    expect(goHomeSpy).toHaveBeenCalled();
  });

  it('tap() with toggleAppDrawer delegates to nav service', () => {
    component.tap(toggleAppDrawerSpy as () => void);
    expect(toggleAppDrawerSpy).toHaveBeenCalled();
  });
});
