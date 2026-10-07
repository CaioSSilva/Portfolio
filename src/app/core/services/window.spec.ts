import { TestBed } from '@angular/core/testing';
import { WindowService, TOP_BAR_HEIGHT } from './window';
import { Base } from '../models/base';
import { ProcessManager } from './process-manager';
import { Settings } from './settings';
import { DockService } from './dock';
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
    component: class MockComponent extends Base {} as never,
    ...overrides,
  };
}

describe('WindowService', () => {
  let service: WindowService;
  let processManager: ProcessManager;
  let settings: Settings;
  let el: HTMLDivElement;
  let proc: Process;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowService, ProcessManager, Settings, DockService],
    });
    service = TestBed.inject(WindowService);
    processManager = TestBed.inject(ProcessManager);
    settings = TestBed.inject(Settings);

    el = document.createElement('div');
    // Attach to body so getBoundingClientRect works in jsdom
    document.body.appendChild(el);
    proc = makeProcess();
  });

  afterEach(() => {
    document.body.removeChild(el);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize window element and process', () => {
    service.init(el, proc);
    expect(service.isMaximized()).toBe(false);
    expect(service.isVisible()).toBe(false); // set via rAF which doesn't run synchronously
  });

  it('should toggle maximize state', () => {
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
    service.toggleMaximize(); // maximize
    service.toggleMaximize(); // restore
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

  it('should set isResizing to true on valid startResize', () => {
    service.init(el, proc);
    const event = new MouseEvent('mousedown', { button: 0, clientX: 200, clientY: 200 });
    service.startResize(event);
    expect(service.isResizing()).toBe(true);
    // clean up listeners
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
    const p = makeProcess({ id: pid });
    service.init(el, p);

    service.minimize();
    expect(processManager.processes()[0].isMinimized).toBe(true);
  });

  it('should focus process via focus()', () => {
    processManager.open(proc);
    const pid = processManager.processes()[0].id;
    const p = makeProcess({ id: pid });
    service.init(el, p);

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
});
