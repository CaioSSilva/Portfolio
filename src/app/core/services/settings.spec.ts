import { TestBed } from '@angular/core/testing';
import { Settings } from './settings';

describe('Settings', () => {
  let service: Settings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Settings],
    });
    service = TestBed.inject(Settings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should update wallpaper', () => {
    service.setWallpaper('/wallpapers/waves.webp');
    expect(service.wallpaper()).toBe('/wallpapers/waves.webp');
  });

  it('should update dock and desktop size', () => {
    service.setDockSize(64);
    expect(service.dockSize()).toBe(64);

    service.setDesktopSize(48);
    expect(service.desktopSize()).toBe(48);
  });

  it('should toggle options correctly', () => {
    const initialAutoHide = service.autoHideDock();
    service.toggleAutoHideDock();
    expect(service.autoHideDock()).toBe(!initialAutoHide);

    const initialTips = service.tipsEnabled();
    service.toggleSystemTips();
    expect(service.tipsEnabled()).toBe(!initialTips);

    const initialMute = service.systemMuted();
    service.toggleSystemSounds();
    expect(service.systemMuted()).toBe(!initialMute);
  });

  it('should have default geminiModel', () => {
    expect(service.geminiModel()).toBe('gemini-flash-lite-latest');
  });

  it('should setGeminiModel update the signal', () => {
    service.setGeminiModel('gemini-1.5-pro');
    expect(service.geminiModel()).toBe('gemini-1.5-pro');
  });

  it('should setGeminiModel persist across multiple updates', () => {
    service.setGeminiModel('gemini-ultra');
    service.setGeminiModel('gemini-nano');
    expect(service.geminiModel()).toBe('gemini-nano');
  });
});
