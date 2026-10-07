import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Boot } from './boot';
import { LanguageService } from '../../../core/services/language';
import { Sound } from '../../../core/services/sound';

describe('Boot', () => {
  let component: Boot;
  let fixture: ComponentFixture<Boot>;
  let soundMock: { play: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    soundMock = { play: vi.fn().mockResolvedValue(undefined) };

    await TestBed.configureTestingModule({
      imports: [Boot],
      providers: [
        LanguageService,
        { provide: Sound, useValue: soundMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Boot);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('detectDevice sets isMobile=true on small screens', () => {
    Object.defineProperty(window, 'innerWidth', { value: 800, writable: true, configurable: true });
    fixture.detectChanges();
    expect(component.isMobile()).toBe(true);
  });

  it('detectDevice starts simulateLoading on large non-mobile screens', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'innerWidth', { value: 1440, writable: true, configurable: true });
    const origUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      writable: true,
      configurable: true,
    });

    fixture.detectChanges();
    expect(component.isMobile()).toBe(false);
    vi.advanceTimersByTime(5000); // run the interval
    expect(component.progress()).toBeGreaterThan(0);

    Object.defineProperty(navigator, 'userAgent', { value: origUA, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    vi.useRealTimers();
  });

  it('startSystem does nothing when waitingClick is false', () => {
    fixture.detectChanges();
    component.waitingClick.set(false);
    component.startSystem();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('startSystem does nothing when isMobile is true', () => {
    fixture.detectChanges();
    component.waitingClick.set(true);
    component.isMobile.set(true);
    component.startSystem();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('startSystem does nothing when already exiting', () => {
    fixture.detectChanges();
    component.waitingClick.set(true);
    component.isExiting.set(true);
    component.isMobile.set(false);
    component.startSystem();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('startSystem plays startup sound and emits bootFinished after delay', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    component.waitingClick.set(true);
    component.isMobile.set(false);
    component.isExiting.set(false);

    let emitted = false;
    component.bootFinished.subscribe(() => (emitted = true));

    component.startSystem();
    expect(soundMock.play).toHaveBeenCalledWith('startup');
    expect(component.waitingClick()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(component.isExiting()).toBe(true);

    vi.advanceTimersByTime(300);
    expect(emitted).toBe(true);
    vi.useRealTimers();
  });
});
