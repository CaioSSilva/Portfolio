import { TestBed } from '@angular/core/testing';
import {
  WindowService,
  TOP_BAR_HEIGHT,
  MOBILE_NAV_BAR_HEIGHT,
  WINDOW_ANIMATION_DURATION_MS,
} from './window';
import { Base } from '../models/base';
import { ProcessManager } from './process-manager';
import { Settings } from './settings';
import { DockService } from './dock';
import { ScreenService } from './screen';
import { Process } from '../models/process';

function makeProcess(overrides: Partial<Process> = {}): Process {
  return {
    id: 'p1',
    appId: 'files',
    title: 'Files',
    icon: 'folder',
    color: 'blue',
    isMinimized: false,
    isMaximized: false,
    zIndex: 1,
    cascadeIndex: 0,
    component: class MockComponent extends Base {} as never,
    ...overrides,
  };
}

function makePointerEvent(type: string, init: PointerEventInit = {}): PointerEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: init.button ?? 0,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
  }) as PointerEvent;
  Object.defineProperty(event, 'pointerId', { value: init.pointerId ?? 1 });
  return event;
}

describe('WindowService', () => {
  let service: WindowService;
  let processManager: ProcessManager;
  let screenService: ScreenService;
  let settings: Settings;
  let el: HTMLDivElement;
  let proc: Process;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowService, ProcessManager, Settings, DockService, ScreenService],
    });
    service = TestBed.inject(WindowService);
    processManager = TestBed.inject(ProcessManager);
    screenService = TestBed.inject(ScreenService);
    settings = TestBed.inject(Settings);

    screenService.width.set(1280);
    screenService.height.set(window.innerHeight);
    settings.windowAnimationsEnabled.set(true);
    settings.windowSnapMode.set('classic');
    settings.snapPairingEnabled.set(false);

    el = document.createElement('div');
    document.body.appendChild(el);
    proc = makeProcess();
  });

  afterEach(() => {
    document.body.removeChild(el);
    document.querySelector('[data-dock-area]')?.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize window element and process in desktop mode', () => {
    settings.windowAnimationsEnabled.set(false);
    service.init(el, proc);
    expect(service.isMaximized()).toBe(false);
    expect(service.isVisible()).toBe(true);
  });

  it('should play genie animation on init when animations enabled', () => {
    vi.useFakeTimers();
    const animationFrames: FrameRequestCallback[] = [];
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });

    service.init(el, proc);
    expect(service.isVisible()).toBe(true);

    animationFrames.shift()?.(0);
    expect(el.style.opacity).toBe('0');
    animationFrames.shift()?.(0);
    expect(el.style.opacity).toBe('1');

    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    rafSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should initialize window element as maximized in mobile mode', () => {
    screenService.width.set(500);
    service.init(el, proc);
    expect(service.isMaximized()).toBe(true);
    expect(el.style.width).toBe('100vw');
  });

  it('should toggle maximize state in desktop mode', () => {
    service.init(el, proc);

    service.toggleMaximize();
    expect(service.isMaximized()).toBe(true);
    expect(service.isSnapped()).toBe(false);

    service.toggleMaximize();
    expect(service.isMaximized()).toBe(false);
  });

  it('should apply maximized CSS on toggleMaximize', () => {
    service.init(el, proc);
    service.toggleMaximize();
    expect(el.style.width).toBe('100vw');
  });

  it('should restore normal size on second toggleMaximize', () => {
    service.init(el, proc);
    service.toggleMaximize();
    service.toggleMaximize();
    expect(el.style.width).toContain('px');
  });

  it('should restore the previous partial snap after maximizing', () => {
    settings.windowAnimationsEnabled.set(false);
    service.init(el, proc);
    service.snapToLayout('top-left');
    const snappedRect = {
      x: 0,
      y: TOP_BAR_HEIGHT,
      width: screenService.width() / 2,
      height: (screenService.height() - TOP_BAR_HEIGHT) / 2,
    };
    expect(service.isSnapped()).toBe(true);

    service.toggleMaximize();
    expect(service.isMaximized()).toBe(true);
    service.toggleMaximize();

    expect(service.isMaximized()).toBe(false);
    expect(service.isSnapped()).toBe(true);
    expect(el.style.transform).toBe(`translate3d(${snappedRect.x}px, ${snappedRect.y}px, 0)`);
    expect(el.style.width).toBe(`${snappedRect.width}px`);
    expect(el.style.height).toBe(`${snappedRect.height}px`);
  });

  it('should resize a snapped window proportionally when the viewport changes', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    service.snapToLayout('left-half');

    screenService.width.set(800);
    screenService.height.set(600);
    TestBed.flushEffects();

    expect(el.style.transform).toBe(`translate3d(0px, ${TOP_BAR_HEIGHT}px, 0)`);
    expect(el.style.width).toBe('400px');
    expect(el.style.height).toBe(`${600 - TOP_BAR_HEIGHT}px`);
  });

  it('should restore a maximized snapped window to the resized snap zone', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    service.snapToLayout('right-half');
    service.toggleMaximize();

    screenService.width.set(800);
    screenService.height.set(600);
    TestBed.flushEffects();
    service.toggleMaximize();

    expect(el.style.transform).toBe(`translate3d(400px, ${TOP_BAR_HEIGHT}px, 0)`);
    expect(el.style.width).toBe('400px');
    expect(el.style.height).toBe(`${600 - TOP_BAR_HEIGHT}px`);
  });

  it('should apply the final drag position when the pointer is released', () => {
    settings.windowAnimationsEnabled.set(false);
    service.init(el, proc);
    Object.defineProperty(el, 'offsetParent', { configurable: true, value: document.body });

    service.startDrag(new MouseEvent('mousedown', { button: 0, clientX: 400, clientY: 100 }));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 140 }));
    document.dispatchEvent(new MouseEvent('mouseup', { clientX: 0, clientY: 140 }));

    expect(service.isDragging()).toBe(false);
    expect(service.isSnapped()).toBe(true);
    expect(el.style.transform).toBe(`translate3d(0px, ${TOP_BAR_HEIGHT}px, 0)`);
    expect(el.style.width).toBe(`${screenService.width() / 2}px`);
  });

  it('should drag windows through Pointer Events', () => {
    settings.windowAnimationsEnabled.set(false);
    service.init(el, proc);
    Object.defineProperty(el, 'offsetParent', { configurable: true, value: document.body });

    service.startDrag(
      makePointerEvent('pointerdown', { clientX: 400, clientY: 100, pointerId: 3 }),
    );
    document.dispatchEvent(
      makePointerEvent('pointermove', { clientX: 450, clientY: 130, pointerId: 3 }),
    );
    document.dispatchEvent(
      makePointerEvent('pointerup', { clientX: 0, clientY: 130, pointerId: 3 }),
    );

    expect(service.isDragging()).toBe(false);
    expect(service.isSnapped()).toBe(true);
    expect(el.style.width).toBe(`${screenService.width() / 2}px`);
  });

  it('should use the configured thirds snap layout', () => {
    settings.windowAnimationsEnabled.set(false);
    settings.setWindowSnapMode('thirds');
    service.init(el, proc);

    service['updateSnapGhost'](0, 200);
    expect(service.snapGhost()?.width).toBe(screenService.width() / 3);
    service['finalizeDrag']();
    expect(el.style.width).toBe(`${screenService.width() / 3}px`);
  });

  it('should offer eligible windows for the opposite half when pairing is enabled', () => {
    settings.windowAnimationsEnabled.set(false);
    settings.snapPairingEnabled.set(true);
    const pairedSnap = vi.fn();
    processManager.processes.set([proc, makeProcess({ id: 'p2', zIndex: 2 })]);
    processManager.registerWindowSnapHandler('p2', pairedSnap);
    service.init(el, proc);

    service.snapToLayout('left-half');

    expect(processManager.snapPairRequest()).toEqual({
      sourceProcessId: proc.id,
      targetLayout: 'right-half',
    });
    expect(processManager.snapPairCandidates().map((candidate) => candidate.id)).toContain('p2');

    processManager.chooseSnapPairCandidate('p2');
    expect(pairedSnap).toHaveBeenCalledWith('right-half');
    expect(processManager.snapPairRequest()).toBeNull();
  });

  it('should apply window snap keyboard shortcuts', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      altKey: true,
      cancelable: true,
    });

    expect(service.handleWindowShortcut(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(service.isSnapped()).toBe(true);
    expect(el.style.transform).toBe(
      `translate3d(${screenService.width() / 2}px, ${TOP_BAR_HEIGHT}px, 0)`,
    );
  });

  it.each([
    ['classic', 'left-half', 0, 2],
    ['halves', 'left-half', 0, 2],
    ['thirds', 'left-third', 0, 3],
  ] as const)('should snap Alt+ArrowLeft to the left zone in %s mode', (mode, layout, x, divisor) => {
    settings.windowAnimationsEnabled.set(false);
    settings.setWindowSnapMode(mode);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      altKey: true,
      cancelable: true,
    });
    expect(service.handleWindowShortcut(event)).toBe(true);
    expect(service.isSnapped()).toBe(true);
    expect(el.style.transform).toBe(`translate3d(${x}px, ${TOP_BAR_HEIGHT}px, 0)`);
    expect(el.style.width).toBe(`${screenService.width() / divisor}px`);
    expect(service['snapLayout']).toBe(layout);
  });

  it.each([
    ['classic', 'bottom-half'],
    ['halves', 'bottom-half'],
    ['thirds', 'center-third'],
  ] as const)('should snap Alt+ArrowDown to the lower zone in %s mode', (mode, layout) => {
    settings.windowAnimationsEnabled.set(false);
    settings.setWindowSnapMode(mode);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      altKey: true,
      cancelable: true,
    });
    expect(service.handleWindowShortcut(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(service['snapLayout']).toBe(layout);
  });

  it('should reserve corner shortcuts for classic mode', () => {
    settings.windowAnimationsEnabled.set(false);
    settings.setWindowSnapMode('classic');
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);

    service.handleWindowShortcut(
      new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        altKey: true,
        shiftKey: true,
        cancelable: true,
      }),
    );

    expect(service['snapLayout']).toBe('top-right');
  });

  it.each([
    ['ArrowLeft', 'bottom-left'],
    ['ArrowRight', 'bottom-right'],
  ] as const)('should snap to the %s lower corner in classic mode', (key, layout) => {
    settings.windowAnimationsEnabled.set(false);
    settings.setWindowSnapMode('classic');
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);
    const event = new KeyboardEvent('keydown', {
      key,
      altKey: true,
      ctrlKey: true,
      cancelable: true,
    });

    expect(service.handleWindowShortcut(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(service['snapLayout']).toBe(layout);
  });

  it.each(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const)(
    'should drag-snap to the %s corner in classic mode',
    (layout) => {
    settings.windowAnimationsEnabled.set(false);
    settings.setWindowSnapMode('classic');
    service.init(el, proc);
    const x = layout.endsWith('right') ? screenService.width() - 1 : 0;
    const y = layout.startsWith('bottom')
      ? screenService.height() - 1
      : TOP_BAR_HEIGHT + 1;

    service['updateSnapGhost'](x, y);
    service['finalizeDrag']();

    expect(service['snapLayout']).toBe(layout);
    expect(service.isSnapped()).toBe(true);
    },
  );

  it('should maximize with Alt+ArrowUp and restore on the next press', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);
    const event = () =>
      new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, cancelable: true });

    service.handleWindowShortcut(event());
    expect(service.isMaximized()).toBe(true);

    service.handleWindowShortcut(event());
    expect(service.isMaximized()).toBe(false);
  });

  it('should not maximize or restore with Alt+Shift+ArrowUp', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      altKey: true,
      shiftKey: true,
      cancelable: true,
    });

    expect(service.handleWindowShortcut(event)).toBe(false);
    expect(event.defaultPrevented).toBe(false);
    expect(service.isMaximized()).toBe(false);
    expect(service.isSnapped()).toBe(false);
  });

  it('should snap to the bottom half with Alt+ArrowDown', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      altKey: true,
      cancelable: true,
    });

    expect(service.handleWindowShortcut(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(service.isSnapped()).toBe(true);
    expect(service.isMaximized()).toBe(false);
    expect(el.style.transform).toBe(
      `translate3d(0px, ${TOP_BAR_HEIGHT + (screenService.height() - TOP_BAR_HEIGHT) / 2}px, 0)`,
    );
    expect(el.style.width).toBe(`${screenService.width()}px`);
    expect(el.style.height).toBe(`${(screenService.height() - TOP_BAR_HEIGHT) / 2}px`);
  });

  it('should restore the window when Alt+ArrowDown is pressed again on the bottom snap', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.processes.set([proc]);
    service.init(el, proc);
    processManager.focus(proc.id);
    service.snapToLayout('bottom-half');

    service.handleWindowShortcut(
      new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, cancelable: true }),
    );

    expect(service.isSnapped()).toBe(false);
    expect(service.isMaximized()).toBe(false);
  });

  it('should fit a maximized window to a smaller viewport when restored', () => {
    settings.windowAnimationsEnabled.set(false);
    service.init(el, proc);
    service.toggleMaximize();

    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 400 });

    try {
      service.toggleMaximize();
      const [, x, y] = el.style.transform.match(/translate3d\((\d+)px, (\d+)px, 0\)/) ?? [];
      expect(Number(x) + Number.parseFloat(el.style.width)).toBeLessThanOrEqual(800);
      expect(Number(y) + Number.parseFloat(el.style.height)).toBeLessThanOrEqual(400);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
      Object.defineProperty(window, 'innerHeight', { configurable: true, value: originalHeight });
    }
  });

  it('should constrain a normal window when the viewport shrinks', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.open(proc);
    service.init(el, processManager.processes()[0]);

    screenService.width.set(800);
    screenService.height.set(400);
    TestBed.flushEffects();

    const [, x, y] = el.style.transform.match(/translate3d\((\d+)px, (\d+)px, 0\)/) ?? [];
    expect(Number(x) + Number.parseFloat(el.style.width)).toBeLessThanOrEqual(800);
    expect(Number(y) + Number.parseFloat(el.style.height)).toBeLessThanOrEqual(400);
  });

  it('should stay maximized when the desktop viewport changes size', () => {
    settings.windowAnimationsEnabled.set(false);
    processManager.open(proc);
    service.init(el, processManager.processes()[0]);
    service.toggleMaximize();

    screenService.width.set(1100);
    screenService.height.set(700);
    TestBed.flushEffects();

    expect(service.isMaximized()).toBe(true);
    expect(el.style.width).toBe('100vw');
  });

  it('should not start resize when already maximized', () => {
    service.init(el, proc);
    service.toggleMaximize();
    expect(service.isMaximized()).toBe(true);

    const event = new MouseEvent('mousedown', { button: 0, clientX: 200, clientY: 200 });
    service.startResize(event);
    expect(service.isResizing()).toBe(false);
  });

  it('should not start resize on non-left-button click', () => {
    service.init(el, proc);
    const event = new MouseEvent('mousedown', { button: 2, clientX: 200, clientY: 200 });
    service.startResize(event);
    expect(service.isResizing()).toBe(false);
  });

  it('should set isResizing to true on valid startResize in desktop mode', () => {
    service.init(el, proc);
    const event = new MouseEvent('mousedown', { button: 0, clientX: 200, clientY: 200 });
    service.startResize(event);
    expect(service.isResizing()).toBe(true);
    document.dispatchEvent(new MouseEvent('mouseup'));
  });

  it('should keep a resized window within the viewport', () => {
    settings.windowAnimationsEnabled.set(false);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    try {
      service.init(el, proc);
      service.startResize(new MouseEvent('mousedown', { button: 0, clientX: 500, clientY: 500 }));
      document.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: window.innerWidth + 1000,
          clientY: window.innerHeight + 1000,
        }),
      );
      document.dispatchEvent(new MouseEvent('mouseup'));

      const [, x, y] = el.style.transform.match(/translate3d\((\d+)px, (\d+)px, 0\)/) ?? [];
      expect(Number(x) + Number.parseFloat(el.style.width)).toBeLessThanOrEqual(window.innerWidth);
      expect(Number(y) + Number.parseFloat(el.style.height)).toBeLessThanOrEqual(
        window.innerHeight,
      );
    } finally {
      rafSpy.mockRestore();
    }
  });

  it('should close process via close() with genie animation', () => {
    vi.useFakeTimers();
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const closeProc = makeProcess({ id: pid, appId: proc.appId });
    service.init(el, closeProc);

    service.close();
    expect(service.isClosing()).toBe(true);
    expect(el.style.opacity).toBe('0');
    expect(el.style.width).toBe('0px');
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    expect(processManager.processes().length).toBe(0);
    vi.useRealTimers();
  });

  it('should not close process before animation completes', () => {
    vi.useFakeTimers();
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const closeProc = makeProcess({ id: pid, appId: proc.appId });
    service.init(el, closeProc);

    service.close();
    expect(processManager.processes().length).toBe(1);
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS - 1);
    expect(processManager.processes().length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(processManager.processes().length).toBe(0);
    vi.useRealTimers();
  });

  it('should guard against double close()', () => {
    vi.useFakeTimers();
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const closeProc = makeProcess({ id: pid, appId: proc.appId });
    service.init(el, closeProc);

    service.close();
    service.close();
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    expect(processManager.processes().length).toBe(0);
    vi.useRealTimers();
  });

  it('should minimize process via minimize()', () => {
    vi.useFakeTimers();
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const process = makeProcess({ id: pid });
    service.init(el, process);
    TestBed.flushEffects();
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);

    service.minimize();
    TestBed.flushEffects();
    expect(processManager.processes()[0].isMinimized).toBe(true);
    expect(service.isAnimatingMinimize()).toBe(true);
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    expect(service.isAnimatingMinimize()).toBe(false);
    vi.useRealTimers();
  });

  it('should apply genie transition styles when minimizing', () => {
    vi.useFakeTimers();
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const process = makeProcess({ id: pid });
    service.init(el, process);
    TestBed.flushEffects();
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);

    service.minimize();
    TestBed.flushEffects();
    expect(el.style.opacity).toBe('0');
    expect(el.style.width).toBe('0px');
    expect(el.style.height).toBe('0px');
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    vi.useRealTimers();
  });

  it('should minimize and restore from icon via external toggleMinimize', () => {
    vi.useFakeTimers();
    const animationFrames: FrameRequestCallback[] = [];
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      animationFrames.push(callback);
      return animationFrames.length;
    });

    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const process = makeProcess({ id: pid });
    service.init(el, process);
    TestBed.flushEffects();

    while (animationFrames.length) animationFrames.shift()?.(0);
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);

    processManager.toggleMinimize(pid);
    TestBed.flushEffects();
    expect(processManager.processes()[0].isMinimized).toBe(true);
    expect(service.isAnimatingMinimize()).toBe(true);
    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    expect(service.isAnimatingMinimize()).toBe(false);

    animationFrames.length = 0;
    processManager.toggleMinimize(pid);
    TestBed.flushEffects();
    expect(processManager.processes()[0].isMinimized).toBe(false);
    expect(el.style.width).not.toBe('0px');

    for (let attempts = 0; el.style.width !== '0px' && attempts < 10; attempts++) {
      animationFrames.shift()?.(0);
    }
    expect(el.style.width).toBe('0px');
    expect(el.style.opacity).toBe('0');

    for (
      let attempts = 0;
      (el.style.width === '0px' || el.style.opacity !== '1') && attempts < 10;
      attempts++
    ) {
      animationFrames.shift()?.(0);
    }
    expect(el.style.width).not.toBe('0px');
    expect(el.style.opacity).toBe('1');
    expect(el.style.transition).toContain('width');

    vi.advanceTimersByTime(WINDOW_ANIMATION_DURATION_MS);
    rafSpy.mockRestore();
    vi.useRealTimers();
  });

  it('should focus process via focus()', () => {
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const process = makeProcess({ id: pid });
    service.init(el, process);

    service.focus();
    expect(processManager.activeProcessId()).toBe(pid);
  });

  it('should not start drag on non-left-button', () => {
    service.init(el, proc);
    const event = new MouseEvent('mousedown', { button: 1 });
    service.startDrag(event);
    expect(service.isDragging()).toBe(false);
  });

  it('should update bottom overlap when maximized window is detected', () => {
    service.init(el, proc);
    expect(processManager.isDockHidden()).toBe(false);
    service.toggleMaximize();
    expect(processManager.isDockHidden()).toBe(true);
  });

  it('should clear dock overlap when a window is minimized externally', () => {
    processManager.open(proc);
    const process = processManager.processes()[0];
    service.init(el, process);

    service.toggleMaximize();
    expect(processManager.isDockHidden()).toBe(true);

    processManager.toggleMinimize(process.id);
    TestBed.flushEffects();
    expect(processManager.isDockHidden()).toBe(false);
  });

  it('should clear dock overlap when a process is removed externally', () => {
    processManager.open(proc);
    const process = processManager.processes()[0];
    service.init(el, process);
    service.toggleMaximize();
    expect(processManager.isDockHidden()).toBe(true);

    processManager.close(process.id);
    TestBed.flushEffects();
    expect(processManager.isDockHidden()).toBe(false);
  });

  it('should update dock overlap when resizing changes the window bottom edge', () => {
    const dockArea = document.createElement('div');
    dockArea.dataset['dockArea'] = '';
    vi.spyOn(dockArea, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, window.innerHeight - 80, window.innerWidth, 80),
    );
    document.body.appendChild(dockArea);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    settings.windowAnimationsEnabled.set(false);

    try {
      service.init(el, proc);
      expect(processManager.isDockHidden()).toBe(true);
      service.startResize(new MouseEvent('mousedown', { button: 0, clientX: 500, clientY: 500 }));
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: 500, clientY: 100 }));
      document.dispatchEvent(new MouseEvent('mouseup'));

      expect(processManager.isDockHidden()).toBe(false);
    } finally {
      rafSpy.mockRestore();
    }
  });

  it('should not hide the dock when a window reaches the bottom outside its horizontal area', () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1800 });
    const dockArea = document.createElement('div');
    dockArea.dataset['dockArea'] = '';
    vi.spyOn(dockArea, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(100, window.innerHeight - 80, 200, 80),
    );
    document.body.appendChild(dockArea);
    settings.windowAnimationsEnabled.set(false);

    try {
      service.init(el, proc);
      expect(processManager.isDockHidden()).toBe(false);
    } finally {
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
    }
  });

  it('should not allow drag when in mobile mode', () => {
    screenService.width.set(500);
    service.init(el, proc);
    const event = new MouseEvent('mousedown', { button: 0 });
    service.startDrag(event);
    expect(service.isDragging()).toBe(false);
  });

  it('should not allow resize when in mobile mode', () => {
    screenService.width.set(500);
    service.init(el, proc);
    const event = new MouseEvent('mousedown', { button: 0, clientX: 200, clientY: 200 });
    service.startResize(event);
    expect(service.isResizing()).toBe(false);
  });

  it('should not allow toggleMaximize when in mobile mode', () => {
    screenService.width.set(500);
    service.init(el, proc);
    expect(service.isMaximized()).toBe(true);
    service.toggleMaximize();
    expect(service.isMaximized()).toBe(true);
  });

  it('should apply mobile CSS dimensions on init in mobile mode', () => {
    screenService.width.set(500);
    service.init(el, proc);
    expect(el.style.width).toBe('100vw');
    expect(el.style.height).toContain(`${TOP_BAR_HEIGHT + MOBILE_NAV_BAR_HEIGHT}`);
  });

  it('should apply desktop CSS on toggleMaximize on desktop', () => {
    service.init(el, proc);
    service.toggleMaximize();
    expect(el.style.width).toBe('100vw');
    expect(el.style.height).toContain(`${TOP_BAR_HEIGHT}`);
  });
});
