import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language';

describe('LanguageService', () => {
  let service: LanguageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LanguageService],
    });
    service = TestBed.inject(LanguageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language initialized', () => {
    expect(['pt', 'en']).toContain(service.currentLang());
    expect(service.t()).toBeDefined();
  });

  it('should change language and toggle language properly', () => {
    service.setLanguage('en');
    expect(service.currentLang()).toBe('en');

    service.toggle();
    expect(service.currentLang()).toBe('pt');

    service.toggle();
    expect(service.currentLang()).toBe('en');
  });
});
