import { TestBed } from '@angular/core/testing';
import { Theme } from './theme';

describe('Theme', () => {
  let service: Theme;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Theme],
    });
    service = TestBed.inject(Theme);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle theme correctly', () => {
    const initial = service.isDarkMode();
    service.toggle();
    expect(service.isDarkMode()).toBe(!initial);
    service.toggle();
    expect(service.isDarkMode()).toBe(initial);
  });

  it('should set dark mode explicitly', () => {
    service.setDark(true);
    expect(service.isDarkMode()).toBe(true);

    service.setDark(false);
    expect(service.isDarkMode()).toBe(false);
  });
});
