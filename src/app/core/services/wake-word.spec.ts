import { WakeWordService } from './wake-word';

describe('WakeWordService', () => {
  let service: WakeWordService;

  beforeEach(() => {
    service = new WakeWordService();
  });

  describe('match', () => {
    it('matches "hello hermes" with no command', () => {
      const result = service.match('hello hermes');
      expect(result.matched).toBe(true);
      expect(result.command).toBe('');
    });

    it('matches "oi hermes" with no command', () => {
      const result = service.match('oi hermes');
      expect(result.matched).toBe(true);
      expect(result.command).toBe('');
    });

    it('extracts inline command after wake phrase', () => {
      const result = service.match('hey hermes open the terminal');
      expect(result.matched).toBe(true);
      expect(result.command).toBe('open the terminal');
    });

    it('matches accent variant hermés', () => {
      const result = service.match('olá hermés');
      expect(result.matched).toBe(true);
    });

    it('matches fuzzy variant "hermis" within levenshtein distance 1', () => {
      const result = service.match('oi hermis');
      expect(result.matched).toBe(true);
    });

    it('does not match unrelated transcript', () => {
      const result = service.match('open the terminal please');
      expect(result.matched).toBe(false);
      expect(result.command).toBe('');
    });

    it('is case insensitive', () => {
      const result = service.match('Hello Hermes');
      expect(result.matched).toBe(true);
    });
  });

  describe('isStopCommand', () => {
    it('detects "stop listening"', () => {
      expect(service.isStopCommand('stop listening')).toBe(true);
    });

    it('detects "para de ouvir"', () => {
      expect(service.isStopCommand('para de ouvir')).toBe(true);
    });

    it('returns false for non-stop phrases', () => {
      expect(service.isStopCommand('hello hermes')).toBe(false);
    });
  });
});
