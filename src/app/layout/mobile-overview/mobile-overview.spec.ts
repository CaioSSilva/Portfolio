import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileOverview } from './mobile-overview';
import { ProcessManager } from '../../core/services/process-manager';
import { MobileNavService } from '../../core/services/mobile-nav';
import { LanguageService } from '../../core/services/language';
import { Process } from '../../core/models/process';
import { Base } from '../../core/models/base';

function makeProcess(id: string): Process {
  return {
    id,
    appId: 'files',
    title: 'Files',
    icon: 'fas fa-folder',
    color: '#3584e4',
    component: class extends Base {} as never,
    isMinimized: false,
    isMaximized: false,
    zIndex: 100,
    cascadeIndex: 0,
  };
}

describe('MobileOverview', () => {
  let component: MobileOverview;
  let fixture: ComponentFixture<MobileOverview>;
  let processManager: ProcessManager;
  let nav: MobileNavService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileOverview],
      providers: [ProcessManager, MobileNavService, LanguageService],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileOverview);
    component = fixture.componentInstance;
    processManager = TestBed.inject(ProcessManager);
    nav = TestBed.inject(MobileNavService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('processes() returns processes sorted by descending zIndex', () => {
    const p1 = makeProcess('p1');
    const p2 = makeProcess('p2');
    p1.zIndex = 100;
    p2.zIndex = 200;
    processManager.processes.set([p1, p2]);
    const sorted = component.processes();
    expect(sorted[0].id).toBe('p2');
    expect(sorted[1].id).toBe('p1');
  });

  it('closeAll closes all processes and closes overview', () => {
    const closeSpy = vi.spyOn(processManager, 'close');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const p1 = makeProcess('p1');
    const p2 = makeProcess('p2');
    processManager.processes.set([p1, p2]);

    component.closeAll();

    expect(closeSpy).toHaveBeenCalledTimes(2);
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('closeProcess closes single process and stops event propagation', () => {
    const closeSpy = vi.spyOn(processManager, 'close');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    const stopPropSpy = vi.fn();
    component.closeProcess(proc, { stopPropagation: stopPropSpy } as unknown as Event);

    expect(stopPropSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledWith('p1');
  });

  it('onCardClick focuses process and closes overview', () => {
    const focusSpy = vi.spyOn(processManager, 'focus');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    component.onCardClick(event, proc);

    expect(focusSpy).toHaveBeenCalledWith('p1');
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('getCardTransform returns empty string when offset is 0', () => {
    expect(component.getCardTransform('p1')).toBe('');
  });

  it('getCardTransform returns translateY when offset is set', () => {
    component.swipeOffsets.set({ p1: -60 });
    expect(component.getCardTransform('p1')).toBe('translateY(-60px)');
  });

  it('getCardOpacity returns 1 for zero offset', () => {
    expect(component.getCardOpacity('p1')).toBe(1);
  });

  it('getCardOpacity fades as card moves upward', () => {
    component.swipeOffsets.set({ p1: -60 });
    const opacity = component.getCardOpacity('p1');
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThan(1);
  });

  it('getCardOpacity is 0 at -120px offset', () => {
    component.swipeOffsets.set({ p1: -120 });
    expect(component.getCardOpacity('p1')).toBe(0);
  });

  it('isDismissing returns false for unknown process', () => {
    expect(component.isDismissing('unknown')).toBe(false);
  });

  it('isDismissing returns true after dismissing flag is set', () => {
    component.dismissing.set({ p1: true });
    expect(component.isDismissing('p1')).toBe(true);
  });

  it('onBackdropClick closes overview', () => {
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    nav.isOverviewOpen.set(true);
    const event = new MouseEvent('click');
    component.onBackdropClick(event);
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('onBackdropTouchEnd closes overview on tap (small movement)', () => {
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    component.onBackdropTouchStart({
      touches: [{ clientX: 100, clientY: 200 }],
    } as unknown as TouchEvent);
    component.onBackdropTouchEnd({
      changedTouches: [{ clientX: 105, clientY: 204 }],
      stopPropagation: vi.fn(),
    } as unknown as TouchEvent);
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('onBackdropTouchEnd does NOT close overview when swipe distance exceeds threshold', () => {
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    component.onBackdropTouchStart({
      touches: [{ clientX: 100, clientY: 200 }],
    } as unknown as TouchEvent);
    component.onBackdropTouchEnd({
      changedTouches: [{ clientX: 200, clientY: 200 }],
      stopPropagation: vi.fn(),
    } as unknown as TouchEvent);
    expect(closeOverviewSpy).not.toHaveBeenCalled();
  });

  it('onCardTouchMove sets negative offset on upward swipe', () => {
    const proc = makeProcess('p1');
    component.onCardTouchStart(
      { touches: [{ clientX: 100, clientY: 300 }] } as unknown as TouchEvent,
      proc,
    );
    component.onCardTouchMove(
      {
        touches: [{ clientX: 100, clientY: 240 }],
        stopPropagation: vi.fn(),
      } as unknown as TouchEvent,
      proc,
    );
    expect(component.swipeOffsets()['p1']).toBeLessThan(0);
  });

  it('onCardTouchEnd dismisses card on swipe-up > 80px', () => {
    vi.useFakeTimers();
    const closeSpy = vi.spyOn(processManager, 'close');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    component.onCardTouchStart(
      { touches: [{ clientX: 100, clientY: 400 }] } as unknown as TouchEvent,
      proc,
    );
    component.onCardTouchEnd(
      {
        changedTouches: [{ clientX: 100, clientY: 300 }],
        stopPropagation: vi.fn(),
      } as unknown as TouchEvent,
      proc,
    );

    expect(component.isDismissing('p1')).toBe(true);
    vi.advanceTimersByTime(300);
    expect(closeSpy).toHaveBeenCalledWith('p1');
    vi.useRealTimers();
  });

  it('dismissCard closes overview when last process is dismissed', () => {
    vi.useFakeTimers();
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    component.onCardTouchStart(
      { touches: [{ clientX: 100, clientY: 400 }] } as unknown as TouchEvent,
      proc,
    );
    component.onCardTouchEnd(
      {
        changedTouches: [{ clientX: 100, clientY: 300 }],
        stopPropagation: vi.fn(),
      } as unknown as TouchEvent,
      proc,
    );

    processManager.processes.set([]);
    vi.advanceTimersByTime(300);
    expect(closeOverviewSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('dismissCard does NOT close overview when other processes remain', () => {
    vi.useFakeTimers();
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const p1 = makeProcess('p1');
    const p2 = makeProcess('p2');
    processManager.processes.set([p1, p2]);

    component.onCardTouchStart(
      { touches: [{ clientX: 100, clientY: 400 }] } as unknown as TouchEvent,
      p1,
    );
    component.onCardTouchEnd(
      {
        changedTouches: [{ clientX: 100, clientY: 300 }],
        stopPropagation: vi.fn(),
      } as unknown as TouchEvent,
      p1,
    );

    processManager.processes.set([p2]);
    vi.advanceTimersByTime(300);
    expect(closeOverviewSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('onCardTouchEnd focuses and closes overview on tap', () => {
    const focusSpy = vi.spyOn(processManager, 'focus');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const proc = makeProcess('p1');

    component.onCardTouchStart(
      { touches: [{ clientX: 100, clientY: 300 }] } as unknown as TouchEvent,
      proc,
    );
    component.onCardTouchEnd(
      {
        changedTouches: [{ clientX: 102, clientY: 302 }],
        stopPropagation: vi.fn(),
      } as unknown as TouchEvent,
      proc,
    );

    expect(focusSpy).toHaveBeenCalledWith('p1');
    expect(closeOverviewSpy).toHaveBeenCalled();
  });
});
