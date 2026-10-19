import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MobileOverview } from './mobile-overview';
import { ProcessManager } from '../../core/services/process-manager';
import { MobileNavService } from '../../core/services/mobile-nav';
import { LanguageService } from '../../core/services/language';
import { Settings } from '../../core/services/settings';
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
  let settings: Settings;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileOverview],
      providers: [ProcessManager, MobileNavService, LanguageService, Settings],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileOverview);
    component = fixture.componentInstance;
    processManager = TestBed.inject(ProcessManager);
    nav = TestBed.inject(MobileNavService);
    settings = TestBed.inject(Settings);
    settings.windowAnimationsEnabled.set(true);
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

  it('closeAll closes all processes and closes overview with transition when animations enabled', () => {
    vi.useFakeTimers();
    const closeSpy = vi.spyOn(processManager, 'close');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const p1 = makeProcess('p1');
    const p2 = makeProcess('p2');
    processManager.processes.set([p1, p2]);

    component.closeAll();

    expect(closeSpy).toHaveBeenCalledTimes(2);
    expect(component.isClosing()).toBe(true);
    vi.advanceTimersByTime(200);
    expect(closeOverviewSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('closeAll closes all processes immediately when animations disabled', () => {
    settings.windowAnimationsEnabled.set(false);
    const closeSpy = vi.spyOn(processManager, 'close');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const p1 = makeProcess('p1');
    processManager.processes.set([p1]);

    component.closeAll();

    expect(closeSpy).toHaveBeenCalledWith('p1');
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('closeProcess closes single process and stops event propagation', () => {
    const closeSpy = vi.spyOn(processManager, 'close');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    const stopPropSpy = vi.fn();
    const event: Partial<Event> = { stopPropagation: stopPropSpy };
    component.closeProcess(proc, event as Event);

    expect(stopPropSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledWith('p1');
  });

  it('onCardClick focuses process and closes overview with transition when animations enabled', () => {
    vi.useFakeTimers();
    const focusSpy = vi.spyOn(processManager, 'focus');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    const event: Partial<MouseEvent> = { stopPropagation: vi.fn() };
    component.onCardClick(event as MouseEvent, proc);

    expect(component.focusingId()).toBe('p1');
    expect(component.isClosing()).toBe(true);
    vi.advanceTimersByTime(220);
    expect(focusSpy).toHaveBeenCalledWith('p1');
    expect(closeOverviewSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('onCardClick focuses process and closes overview immediately when animations disabled', () => {
    settings.windowAnimationsEnabled.set(false);
    const focusSpy = vi.spyOn(processManager, 'focus');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    const event: Partial<MouseEvent> = { stopPropagation: vi.fn() };
    component.onCardClick(event as MouseEvent, proc);

    expect(focusSpy).toHaveBeenCalledWith('p1');
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('getCardTransform returns default transform when offset is 0', () => {
    expect(component.getCardTransform('p1')).toBe('translate3d(0, 0, 0)');
  });

  it('getCardTransform returns scale(1.06) when card is being focused and animations enabled', () => {
    component.focusingId.set('p1');
    expect(component.getCardTransform('p1')).toBe('translate3d(0, 0, 0) scale(1.06)');
  });

  it('getCardTransform returns default transform when animations disabled', () => {
    settings.windowAnimationsEnabled.set(false);
    component.focusingId.set('p1');
    expect(component.getCardTransform('p1')).toBe('translate3d(0, 0, 0)');
  });

  it('getCardTransform returns translateY when offset is set', () => {
    component.swipeOffsets.set({ p1: -60 });
    expect(component.getCardTransform('p1')).toBe('translate3d(0, -60px, 0)');
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

  it('isDismissing returns true after swipe dismiss', () => {
    const processItem = makeProcess('p1');
    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 200 } as Touch] as Partial<TouchList> as TouchList,
    };
    const moveEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 150 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: () => {},
    };
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 100, clientY: 50 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: () => {},
    };
    component.onCardTouchStart(startEvent as TouchEvent, processItem);
    component.onCardTouchMove(moveEvent as TouchEvent, processItem);
    component.onCardTouchEnd(endEvent as TouchEvent, processItem);
    expect(component.isDismissing('p1')).toBe(true);
  });

  it('onBackdropClick closes overview with transition when animations enabled', () => {
    vi.useFakeTimers();
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    nav.isOverviewOpen.set(true);
    component.onBackdropClick();
    expect(component.isClosing()).toBe(true);
    vi.advanceTimersByTime(200);
    expect(closeOverviewSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('onBackdropClick closes overview immediately when animations disabled', () => {
    settings.windowAnimationsEnabled.set(false);
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    nav.isOverviewOpen.set(true);
    component.onBackdropClick();
    expect(closeOverviewSpy).toHaveBeenCalled();
  });

  it('onBackdropTouchEnd closes overview on tap with transition', () => {
    vi.useFakeTimers();
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 200 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onBackdropTouchStart(startEvent as TouchEvent);
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 105, clientY: 204 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onBackdropTouchEnd(endEvent as TouchEvent);
    expect(component.isClosing()).toBe(true);
    vi.advanceTimersByTime(200);
    expect(closeOverviewSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('onBackdropTouchEnd does NOT close overview when swipe distance exceeds threshold', () => {
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 200 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onBackdropTouchStart(startEvent as TouchEvent);
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 200, clientY: 200 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onBackdropTouchEnd(endEvent as TouchEvent);
    expect(closeOverviewSpy).not.toHaveBeenCalled();
  });

  it('onCardTouchMove sets negative offset on upward vertical swipe', () => {
    const proc = makeProcess('p1');
    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 300 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onCardTouchStart(startEvent as TouchEvent, proc);
    const moveEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 240 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchMove(moveEvent as TouchEvent, proc);
    expect(component.swipeOffsets()['p1']).toBeLessThan(0);
  });

  it('onCardTouchEnd dismisses card on swipe-up > 80px', () => {
    vi.useFakeTimers();
    const closeSpy = vi.spyOn(processManager, 'close');
    const proc = makeProcess('p1');
    processManager.processes.set([proc]);

    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 400 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onCardTouchStart(startEvent as TouchEvent, proc);
    const moveEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 350 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchMove(moveEvent as TouchEvent, proc);
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 100, clientY: 300 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchEnd(endEvent as TouchEvent, proc);

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

    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 400 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onCardTouchStart(startEvent as TouchEvent, proc);
    const moveEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 350 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchMove(moveEvent as TouchEvent, proc);
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 100, clientY: 300 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchEnd(endEvent as TouchEvent, proc);

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

    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 400 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onCardTouchStart(startEvent as TouchEvent, p1);
    const moveEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 350 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchMove(moveEvent as TouchEvent, p1);
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 100, clientY: 300 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchEnd(endEvent as TouchEvent, p1);

    processManager.processes.set([p2]);
    vi.advanceTimersByTime(300);
    expect(closeOverviewSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('onCardTouchEnd focuses and closes overview on tap', () => {
    vi.useFakeTimers();
    const focusSpy = vi.spyOn(processManager, 'focus');
    const closeOverviewSpy = vi.spyOn(nav, 'closeOverview');
    const proc = makeProcess('p1');

    const startEvent: Partial<TouchEvent> = {
      touches: [{ clientX: 100, clientY: 300 } as Touch] as Partial<TouchList> as TouchList,
    };
    component.onCardTouchStart(startEvent as TouchEvent, proc);
    const endEvent: Partial<TouchEvent> = {
      changedTouches: [{ clientX: 102, clientY: 302 } as Touch] as Partial<TouchList> as TouchList,
      stopPropagation: vi.fn(),
    };
    component.onCardTouchEnd(endEvent as TouchEvent, proc);

    expect(component.focusingId()).toBe('p1');
    vi.advanceTimersByTime(220);
    expect(focusSpy).toHaveBeenCalledWith('p1');
    expect(closeOverviewSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
