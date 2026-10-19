import { TestBed } from '@angular/core/testing';
import { WindowSnapLayout } from '../models/desktop';
import { ScreenService } from './screen';
import { Settings } from './settings';
import { WindowSnapService } from './window-snap';

describe('WindowSnapService', () => {
  let service: WindowSnapService;
  let settings: Settings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WindowSnapService, Settings, ScreenService],
    });
    service = TestBed.inject(WindowSnapService);
    settings = TestBed.inject(Settings);
    settings.setWindowSnapMode('classic');
    settings.setSnapEdgeSize(32);
  });

  it('calculates classic corner zones and available desktop height', () => {
    const target = service.calculateSnap(1279, 799, 1280, 800);

    expect(target?.layout).toBe('bottom-right');
    expect(target?.rect).toEqual({
      x: 640,
      y: 416,
      width: 640,
      height: 384,
    });
  });

  it('calculates the configured thirds zones', () => {
    settings.setWindowSnapMode('thirds');

    const target = service.calculateSnap(0, 300, 1200, 800);

    expect(target?.layout).toBe('left-third');
    expect(target?.rect).toEqual({
      x: 0,
      y: 32,
      width: 400,
      height: 768,
    });
  });

  it('resolves layout shortcuts and restore actions consistently', () => {
    const bottomShortcut = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      altKey: true,
    });
    const restoreShortcut = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      altKey: true,
    });

    expect(service.resolveShortcut(bottomShortcut, 'classic', false, false, null)).toEqual({
      type: 'layout',
      layout: 'bottom-half',
    });
    expect(service.resolveShortcut(restoreShortcut, 'classic', false, true, 'bottom-half')).toEqual({
      type: 'restore',
    });
  });

  it('keeps lower-corner shortcuts exclusive to classic mode', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowLeft',
      altKey: true,
      ctrlKey: true,
    });

    expect(service.resolveShortcut(event, 'classic', false, false, null)).toEqual({
      type: 'layout',
      layout: 'bottom-left',
    });

    settings.setWindowSnapMode('halves');
    expect(service.resolveShortcut(event, 'halves', false, false, null)).toBeNull();
  });

  it('does not treat Alt+Shift+ArrowUp as a snap shortcut', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      altKey: true,
      shiftKey: true,
    });

    expect(service.resolveShortcut(event, 'classic', false, false, null)).toBeNull();
  });

  it('accepts all supported snap layouts when calculating their rectangles', () => {
    const layouts: WindowSnapLayout[] = [
      'maximize',
      'left-half',
      'right-half',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
      'bottom-half',
      'left-third',
      'center-third',
      'right-third',
    ];

    for (const layout of layouts) {
      const rect = service.getSnapRect(layout, 1200, 800);
      expect(rect.width).toBeGreaterThan(0);
      expect(rect.height).toBeGreaterThan(0);
    }
  });
});
