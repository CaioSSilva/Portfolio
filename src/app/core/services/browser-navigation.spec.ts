import { TestBed } from '@angular/core/testing';
import { BrowserNavigationService } from './browser-navigation';

describe('BrowserNavigationService', () => {
  let service: BrowserNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserNavigationService);
  });

  it('should normalize a host without a protocol to https', () => {
    const result = service.prepareUrl('example.com');

    expect(result.url).toBe('https://example.com');
    expect(result.safeUrl).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('should keep valid http and https URLs', () => {
    expect(service.prepareUrl('http://example.com').url).toBe('http://example.com');
    expect(service.prepareUrl('https://example.com/path').url).toBe('https://example.com/path');
  });

  it('should classify invalid URLs', () => {
    const result = service.prepareUrl('https://');

    expect(result.url).toBeNull();
    expect(result.safeUrl).toBeNull();
    expect(result.error).toBe('invalidUrl');
  });

  it('should reject non-http protocols', () => {
    const result = service.prepareUrl('ftp://example.com');

    expect(result.url).toBeNull();
    expect(result.safeUrl).toBeNull();
    expect(result.error).toBe('invalidUrl');
  });
});
