import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { SystemMonitor } from './system-monitor';
import { LanguageService } from '../../core/services/language';
import { ProcessManager } from '../../core/services/process-manager';
import { FileSystem } from '../../core/services/file-system';
import { NotificationService } from '../../core/services/notification';
import { AppRegistry } from '../../core/services/app-registry';
import { Sound } from '../../core/services/sound';

describe('SystemMonitor', () => {
  let component: SystemMonitor;
  let fixture: ComponentFixture<SystemMonitor>;
  let processManager: ProcessManager;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemMonitor],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        LanguageService,
        ProcessManager,
        FileSystem,
        NotificationService,
        AppRegistry,
        { provide: Sound, useValue: { play: vi.fn().mockResolvedValue(undefined) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SystemMonitor);
    component = fixture.componentInstance;
    processManager = TestBed.inject(ProcessManager);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default signal values', () => {
    expect(component.cpuHistory()).toEqual([]);
    expect(component.ramHistory()).toEqual([]);
    expect(component.rtt()).toBe(0);
    expect(component.downHistory().length).toBe(20);
  });

  it('should getProcessStats return cpu and ram values based on processId', () => {
    const stats = component.getProcessStats('abc');
    expect(stats.cpu).toBeDefined();
    expect(stats.ram).toBeDefined();
    expect(Number(stats.cpu)).toBeGreaterThanOrEqual(0);
  });

  it('should getProcessStats be deterministic for same id', () => {
    const s1 = component.getProcessStats('xyz');
    const s2 = component.getProcessStats('xyz');
    expect(s1.cpu).toBe(s2.cpu);
    expect(s1.ram).toBe(s2.ram);
  });

  it('should killProcess close the process in processManager', () => {
    processManager.open({
      id: 'test-app',
      title: 'T',
      icon: 'i',
      color: '#000',
      component: class {} as never,
    });
    const pid = processManager.processes()[0].id;
    expect(processManager.processes().length).toBe(1);

    component.killProcess(pid);
    expect(processManager.processes().length).toBe(0);
  });

  it('cpuPoints computed should return a string of SVG points', () => {
    component.cpuHistory.set([10, 20, 30]);
    const points = component.cpuPoints();
    expect(typeof points).toBe('string');
    expect(points).toContain(',');
  });

  it('ramPoints computed should return a string of SVG points', () => {
    component.ramHistory.set([40, 50]);
    const points = component.ramPoints();
    expect(typeof points).toBe('string');
  });

  it('downPoints computed should return a string of SVG points', () => {
    component.downHistory.set([1, 2, 3]);
    const points = component.downPoints();
    expect(typeof points).toBe('string');
  });
});
