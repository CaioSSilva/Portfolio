import { TestBed } from '@angular/core/testing';
import { AppRegistry } from './app-registry';
import { LanguageService } from './language';

describe('AppRegistry', () => {
  let service: AppRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppRegistry, LanguageService],
    });
    service = TestBed.inject(AppRegistry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return app by id', () => {
    const app = service.getAppById('files');
    expect(app).toBeDefined();
    expect(app?.id).toBe('files');
  });

  it('should return undefined for unknown app id', () => {
    expect(service.getAppById('nonexistent-app-xyz')).toBeUndefined();
  });

  it('should find handler for file extensions', () => {
    const handlerPdf = service.findHandlerForExtension('pdf');
    expect(handlerPdf).toBeDefined();
    expect(handlerPdf?.id).toBe('documents');

    const handlerAudio = service.findHandlerForExtension('mp3');
    expect(handlerAudio).toBeDefined();
    expect(handlerAudio?.id).toBe('musics');
  });

  it('should return undefined for unknown extension', () => {
    expect(service.findHandlerForExtension('xyz123')).toBeUndefined();
  });

  it('should expose all app definitions via definitions()', () => {
    const defs = service.definitions();
    expect(defs.length).toBeGreaterThan(0);
    expect(defs.every((d) => !!d.id)).toBe(true);
  });

  it('should searchApps returning all apps when query is empty', () => {
    const all = service.searchApps('');
    expect(all.length).toBe(service.definitions().length);
  });

  it('should searchApps filtering by title or id', () => {
    const results = service.searchApps('terminal');
    expect(results.some((a) => a.id === 'terminal')).toBe(true);
  });

  it('should searchApps returning empty array for no match', () => {
    const results = service.searchApps('zzznomatch999');
    expect(results).toEqual([]);
  });
});
