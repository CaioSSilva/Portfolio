import { TestBed } from '@angular/core/testing';
import { WindowService, TOP_BAR_HEIGHT, MOBILE_NAV_BAR_HEIGHT } from './window';
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

    el = document.createElement('div');
    document.body.appendChild(el);
    proc = makeProcess();
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize window element and process in desktop mode', () => {
    service.init(el, proc);
    expect(service.isMaximized()).toBe(false);
    expect(service.isVisible()).toBe(true);
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

  it('should close process via close()', () => {
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const closeProc = makeProcess({ id: pid, appId: proc.appId });
    service.init(el, closeProc);

    service.close();
    expect(processManager.processes().length).toBe(0);
  });

  it('should minimize process via minimize()', () => {
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const process = makeProcess({ id: pid });
    service.init(el, process);

    service.minimize();
    expect(processManager.processes()[0].isMinimized).toBe(true);
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
