import { TestBed } from '@angular/core/testing';
import { ScreenService, MOBILE_BREAKPOINT, TABLET_BREAKPOINT } from './screen';

describe('ScreenService', () => {
  let service: ScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScreenService],
    });
    service = TestBed.inject(ScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('computes isMobile correctly when width < MOBILE_BREAKPOINT', () => {
    service.width.set(MOBILE_BREAKPOINT - 1);
    expect(service.isMobile()).toBe(true);
    expect(service.isCompact()).toBe(true);
    expect(service.isDesktop()).toBe(false);
  });

  it('computes isTablet correctly between MOBILE_BREAKPOINT and TABLET_BREAKPOINT', () => {
    service.width.set(800);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(true);
    expect(service.isCompact()).toBe(true);
    expect(service.isDesktop()).toBe(false);
  });

  it('computes isDesktop correctly for width >= TABLET_BREAKPOINT', () => {
    service.width.set(TABLET_BREAKPOINT);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(false);
    expect(service.isCompact()).toBe(false);
    expect(service.isDesktop()).toBe(true);
  });

  it('computes isMobile at exact MOBILE_BREAKPOINT boundary (exclusive)', () => {
    service.width.set(MOBILE_BREAKPOINT);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(true);
  });

  it('computes all flags for a wide desktop screen', () => {
    service.width.set(1920);
    expect(service.isMobile()).toBe(false);
    expect(service.isTablet()).toBe(false);
    expect(service.isCompact()).toBe(false);
    expect(service.isDesktop()).toBe(true);
  });

  it('isTouchDevice is a boolean signal', () => {
    expect(typeof service.isTouchDevice()).toBe('boolean');
  });

  it('height signal is initialized to a positive number', () => {
    expect(service.height()).toBeGreaterThan(0);
  });
});
