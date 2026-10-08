import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Shutdown } from './shutdown';
import { LanguageService } from '../../../core/services/language';
import { outputToObservable } from '@angular/core/rxjs-interop';

describe('Shutdown', () => {
  let component: Shutdown;
  let fixture: ComponentFixture<Shutdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shutdown],
      providers: [LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(Shutdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('cancelShutdown emits false via shutdown output', () => {
    let emitted: boolean | undefined;
    outputToObservable(component.shutdown).subscribe((v) => (emitted = v));
    component.cancelShutdown();
    expect(emitted).toBe(false);
  });

  it('restart calls window.location.reload', () => {
    const reloadMock = vi.fn();
    const locationSave = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      configurable: true,
    });
    component.restart();
    expect(reloadMock).toHaveBeenCalled();
    Object.defineProperty(window, 'location', { value: locationSave, configurable: true });
  });

  it('onConfirmPowerOff calls window.close and navigates after 100ms', () => {
    vi.useFakeTimers();
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
    let setHrefCalled = false;
    const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');

    try {
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          get href() { return ''; },
          set href(v: string) {
            if (v === 'about:blank') setHrefCalled = true;
          },
        },
        writable: true,
        configurable: true,
      });

      component.onConfirmPowerOff();
      expect(closeSpy).toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(setHrefCalled).toBe(true);
    } finally {
      if (locationDescriptor) {
        Object.defineProperty(window, 'location', locationDescriptor);
      }
    }
  });
});
