import { TestBed } from '@angular/core/testing';
import { ContextMenuService } from './context-menu';

describe('ContextMenuService', () => {
  let service: ContextMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContextMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open context menu with coordinates and appId', () => {
    service.openApp(100, 200, 'files');
    expect(service.isOpen()).toBe(true);
    expect(service.position()).toEqual({ x: 100, y: 200 });
    expect(service.activeAppId()).toBe('files');
  });

  it('should close context menu and reset activeAppId', () => {
    service.openApp(100, 200, 'files');
    service.close();
    expect(service.isOpen()).toBe(false);
    expect(service.activeAppId()).toBeNull();
  });

  it('should start with activeItem as null', () => {
    expect(service.activeItem()).toBeNull();
  });

  it('should allow setting activeItem directly', () => {
    service.activeItem.set('custom-item');
    expect(service.activeItem()).toBe('custom-item');
  });

  it('should update position when openApp is called again', () => {
    service.openApp(10, 20, 'terminal');
    service.openApp(300, 400, 'files');
    expect(service.position()).toEqual({ x: 300, y: 400 });
    expect(service.activeAppId()).toBe('files');
  });
});
