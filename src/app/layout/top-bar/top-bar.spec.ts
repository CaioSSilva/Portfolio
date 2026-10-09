import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopBar } from './top-bar';
import { Theme } from '../../core/services/theme';
import { ProcessManager } from '../../core/services/process-manager';
import { NotificationService } from '../../core/services/notification';
import { LanguageService } from '../../core/services/language';
import { Sound } from '../../core/services/sound';
import { signal } from '@angular/core';
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
    const secondFixture = TestBed.createComponent(TopBar);
    const secondComponent = secondFixture.componentInstance;
    secondFixture.detectChanges();
    const before = secondComponent.now().getTime();
    vi.advanceTimersByTime(1100);
    const after = secondComponent.now().getTime();
    expect(after).toBeGreaterThan(before);
    vi.useRealTimers();
  });

  it('handlePowerOff emits true via onShutdown output', () => {
    let emitted: boolean | undefined;
    outputToObservable(component.onShutdown).subscribe((shutdownValue) => (emitted = shutdownValue));
    component.handlePowerOff();
    expect(emitted).toBe(true);
  });

  it('onTouchEnd opens notification panel when swiped down on mobile', () => {
    const notificationService = TestBed.inject(NotificationService);
    component.screen.width.set(400);

    const makeTouchList = (touches: Partial<Touch>[]): TouchList =>
      ({
        0: touches[0] as Touch,
        length: touches.length,
        item: () => null,
      }) as Partial<TouchList> as TouchList;

    component.onTouchStart({
      touches: makeTouchList([{ clientY: 10 }]),
    } as TouchEvent);

    component.onTouchMove({
      touches: makeTouchList([{ clientY: 60 }]),
    } as TouchEvent);
    expect(component.pullOffset()).toBeGreaterThan(0);

    component.onTouchEnd({
      changedTouches: makeTouchList([{ clientY: 60 }]),
    } as TouchEvent);

    expect(notificationService.isPanelOpen()).toBe(true);
    expect(component.pullOffset()).toBe(0);
  });
});
