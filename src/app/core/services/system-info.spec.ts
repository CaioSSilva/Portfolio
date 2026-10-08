import { TestBed } from '@angular/core/testing';
import { SystemInfoService } from './system-info';
import { ScreenService } from './screen';

describe('SystemInfoService', () => {
  let service: SystemInfoService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SystemInfoService, ScreenService],
    });

    service = TestBed.inject(SystemInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose an info object', () => {
    expect(service.info).toBeDefined();
  });

  it('should have os set to CaiOS string', () => {
    expect(service.info.os).toBe('Cai_OS 2.0.1 (Gnome-like Web Desktop)');
  });

  it('should have kernel set to Linux string', () => {
    expect(service.info.kernel).toBe('Linux 6.8.0-generic (WebAssembly Runtime)');
  });

  it('should expose arch as a string', () => {
    expect(typeof service.info.arch).toBe('string');
  });

  it('should expose cpu as number or dash string', () => {
    const cpu = service.info.cpu;
    expect(typeof cpu === 'number' || cpu === '—').toBe(true);
  });

  it('should expose ram as string', () => {
    expect(typeof service.info.ram).toBe('string');
  });

  it('should expose resolution as "W × H" pattern or dash string', () => {
    const res = service.info.resolution;
    const isPattern = /^\d+ × \d+$/.test(res) || res === '—';
    expect(isPattern).toBe(true);
  });

  it('should expose language from navigator.language', () => {
    expect(typeof service.info.language).toBe('string');
    expect(service.info.language.length).toBeGreaterThan(0);
  });

  it('should expose browser as non-empty string', () => {
    expect(typeof service.info.browser).toBe('string');
    expect(service.info.browser.length).toBeGreaterThan(0);
  });
});
