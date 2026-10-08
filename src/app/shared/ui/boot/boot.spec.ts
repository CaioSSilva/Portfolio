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

  it('simulates loading and enables waitingClick upon completion', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    vi.advanceTimersByTime(3500);
    expect(component.progress()).toBe(100);
    expect(component.waitingClick()).toBe(true);
    vi.useRealTimers();
  });

  it('startSystem does nothing when waitingClick is false', () => {
    fixture.detectChanges();
    component.waitingClick.set(false);
    component.startSystem();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('startSystem does nothing when already exiting', () => {
    fixture.detectChanges();
    component.waitingClick.set(true);
    component.isExiting.set(true);
    component.startSystem();
    expect(soundMock.play).not.toHaveBeenCalled();
  });

  it('startSystem plays startup sound and emits bootFinished after delay', () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    component.waitingClick.set(true);
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
