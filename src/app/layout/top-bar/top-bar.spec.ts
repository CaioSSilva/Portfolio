import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBar } from './top-bar';
import { Theme } from '../../core/services/theme';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';
import { Sound } from '../../core/services/sound';
import { computed, signal } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';

describe('TopBar', () => {
  let component: TopBar;
  let fixture: ComponentFixture<TopBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopBar],
      providers: [
        LanguageService,
        NotificationService,
        { provide: ProcessManager, useValue: {
          processes: signal([]),
          isTopBarHidden: signal(false),
          isDockHidden: signal(false),
          hasActiveProcesses: signal(false),
        } },
        { provide: Theme, useValue: { current: signal('dark'), toggle: vi.fn() } },
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('forceShow defaults to false', () => {
    expect(component.forceShow()).toBe(false);
  });

  it('now signal is initialized to a Date', () => {
    expect(component.now()).toBeInstanceOf(Date);
  });

  it('ngOnInit sets up interval that updates now signal', async () => {
    vi.useFakeTimers();
    const before = component.now().getTime();
    component.ngOnInit();
    vi.advanceTimersByTime(1100);
    const after = component.now().getTime();
    expect(after).toBeGreaterThan(before);
    vi.useRealTimers();
  });

  it('handlePowerOff emits true via onShutdown output', () => {
    let emitted: boolean | undefined;
    outputToObservable(component.onShutdown).subscribe((v) => (emitted = v));
    component.handlePowerOff();
    expect(emitted).toBe(true);
  });

  it('onTouchEnd opens notification panel when swiped down on mobile', () => {
    const notfService = TestBed.inject(NotificationService);
    component.screen.width.set(400);

    // Simulate touchstart
    component.onTouchStart({
      touches: [{ clientY: 10 }] as unknown as TouchList,
    } as unknown as TouchEvent);

    // Simulate touchmove
    component.onTouchMove({
      touches: [{ clientY: 60 }] as unknown as TouchList,
    } as unknown as TouchEvent);
    expect(component.pullOffset()).toBeGreaterThan(0);

    // Simulate touchend with downward swipe
    component.onTouchEnd({
      changedTouches: [{ clientY: 60 }] as unknown as TouchList,
    } as unknown as TouchEvent);

    expect(notfService.isPanelOpen()).toBe(true);
    expect(component.pullOffset()).toBe(0);
  });
});
