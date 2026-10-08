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
        {
          provide: ProcessManager,
          useValue: {
            processes: signal([]),
            isTopBarHidden: signal(false),
            isDockHidden: signal(false),
            hasActiveProcesses: signal(false),
          },
        },
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

  it('now signal updates over time via constructor interval', async () => {
    vi.useFakeTimers();
    const f2 = TestBed.createComponent(TopBar);
    const c2 = f2.componentInstance;
    f2.detectChanges();
    const before = c2.now().getTime();
    vi.advanceTimersByTime(1100);
    const after = c2.now().getTime();
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
    const notificationService = TestBed.inject(NotificationService);
    component.screen.width.set(400);

    component.onTouchStart({
      touches: [{ clientY: 10 }] as unknown as TouchList,
    } as TouchEvent);

    component.onTouchMove({
      touches: [{ clientY: 60 }] as unknown as TouchList,
    } as TouchEvent);
    expect(component.pullOffset()).toBeGreaterThan(0);

    component.onTouchEnd({
      changedTouches: [{ clientY: 60 }] as unknown as TouchList,
    } as TouchEvent);

    expect(notificationService.isPanelOpen()).toBe(true);
    expect(component.pullOffset()).toBe(0);
  });
});
