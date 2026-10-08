import { TestBed } from '@angular/core/testing';
import { Sound } from './sound';
import { Settings } from './settings';

describe('Sound', () => {
  let service: Sound;
  let settings: Settings;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Sound, Settings],
    });
    service = TestBed.inject(Sound);
    settings = TestBed.inject(Settings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not play sound if system is muted', async () => {
    settings.systemMuted.set(true);
    await expect(service.play('bell')).resolves.toBeUndefined();
  });

  it('should attempt playback when not muted and AudioContext is unavailable (JSDOM)', async () => {
    settings.systemMuted.set(false);
    await expect(service.play('bell')).resolves.toBeUndefined();
  });

  it('should resolve to undefined when play encounters a fetch error (AudioContext stub)', async () => {
    settings.systemMuted.set(false);

    const decodeAudioData = vi.fn().mockRejectedValue(new Error('decode failed'));

    type GlobalWithAudioContext = typeof globalThis & { AudioContext: typeof AudioContext };
    const globals = globalThis as GlobalWithAudioContext;
    const origAudioContext = globals.AudioContext;
    globals.AudioContext = function AudioContextStub() {
      return { createBufferSource: vi.fn(), destination: {}, decodeAudioData, close: vi.fn() };
    } as unknown as typeof AudioContext;

    const origFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    });

    await expect(service.play('error-sound')).resolves.toBeUndefined();

    globals.AudioContext = origAudioContext;
    globalThis.fetch = origFetch;
  });
});
