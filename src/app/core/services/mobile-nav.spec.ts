import { TestBed } from '@angular/core/testing';
import { MobileNavService } from './mobile-nav';
import { ProcessManager } from './process-manager';
import { Apps } from './apps';
import { AppDefinition } from '../models/dock';

describe('MobileNavService', () => {
  let service: MobileNavService;
  let processManager: ProcessManager;
  let apps: Apps;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MobileNavService, ProcessManager, Apps],
    });
    service = TestBed.inject(MobileNavService);
    processManager = TestBed.inject(ProcessManager);
    apps = TestBed.inject(Apps);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with overview closed', () => {
    expect(service.isOverviewOpen()).toBe(false);
  });

  it('should toggle overview state', () => {
    service.toggleOverview();
    expect(service.isOverviewOpen()).toBe(true);
    service.toggleOverview();
    expect(service.isOverviewOpen()).toBe(false);
  });

  it('toggleOverview closes apps grid before toggling', () => {
    apps.isAppsGridOpen.set(true);
    service.toggleOverview();
    expect(apps.isAppsGridOpen()).toBe(false);
    expect(service.isOverviewOpen()).toBe(true);
  });

  it('openOverview sets isOverviewOpen to true and closes apps grid', () => {
    apps.isAppsGridOpen.set(true);
    service.openOverview();
    expect(service.isOverviewOpen()).toBe(true);
    expect(apps.isAppsGridOpen()).toBe(false);
  });

  it('closeOverview sets isOverviewOpen to false', () => {
    service.isOverviewOpen.set(true);
    service.closeOverview();
    expect(service.isOverviewOpen()).toBe(false);
  });

  it('should close overview and app drawer on goHome', () => {
    service.isOverviewOpen.set(true);
    apps.isAppsGridOpen.set(true);
    service.goHome();
    expect(service.isOverviewOpen()).toBe(false);
    expect(apps.isAppsGridOpen()).toBe(false);
  });

  it('goHome minimizes all non-minimized processes', () => {
    const mockApp = {
      id: 'app1', title: 'App', icon: 'i', color: '#000',
      component: class {} as never,
    };
    processManager.open(mockApp);
    expect(processManager.processes()[0].isMinimized).toBe(false);

    service.goHome();

    expect(processManager.processes()[0].isMinimized).toBe(true);
  });

  it('goHome does not double-minimize already minimized processes', () => {
    const mockApp = {
      id: 'app2', title: 'App2', icon: 'i', color: '#000',
      component: class {} as never,
    };
    processManager.open(mockApp);
    const pid = processManager.processes()[0].id;
    processManager.toggleMinimize(pid);
    expect(processManager.processes()[0].isMinimized).toBe(true);

    service.goHome();

    expect(processManager.processes()[0].isMinimized).toBe(true);
  });

  it('should toggle app drawer via toggleAppDrawer', () => {
    service.isOverviewOpen.set(true);
    service.toggleAppDrawer();
    expect(service.isOverviewOpen()).toBe(false);
    expect(apps.isAppsGridOpen()).toBe(true);
  });

  it('openAppAndCloseDrawer closes overview and opens the app', () => {
    service.isOverviewOpen.set(true);
    const app = { id: 'files' } as AppDefinition;
    const openSpy = vi.spyOn(apps, 'openApp');
    service.openAppAndCloseDrawer(app);
    expect(service.isOverviewOpen()).toBe(false);
    expect(openSpy).toHaveBeenCalledWith(app);
  });
});
