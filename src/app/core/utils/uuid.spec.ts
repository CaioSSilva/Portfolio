import { uuid } from './uuid';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('uuid', () => {
  describe('secure context (randomUUID available)', () => {
    it('delegates to crypto.randomUUID', () => {
      const expected = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
      const spy = vi
        .spyOn(globalThis.crypto, 'randomUUID')
        .mockReturnValue(expected as ReturnType<typeof crypto.randomUUID>);

      expect(uuid()).toBe(expected);
      expect(spy).toHaveBeenCalledOnce();

      spy.mockRestore();
    });
  });

  describe('non-secure context (randomUUID unavailable)', () => {
    let originalRandomUUID: typeof crypto.randomUUID;

    beforeEach(() => {
      originalRandomUUID = globalThis.crypto.randomUUID;
      (globalThis.crypto as Partial<typeof crypto>).randomUUID = undefined as never;
    });

    afterEach(() => {
      globalThis.crypto.randomUUID = originalRandomUUID;
    });

    it('returns a valid v4 UUID', () => {
      expect(uuid()).toMatch(UUID_PATTERN);
    });

    it('returns a different value on each call', () => {
      expect(uuid()).not.toBe(uuid());
    });

    it('sets version bits to 4', () => {
      const result = uuid();
      expect(result[14]).toBe('4');
    });

    it('sets variant bits to 8, 9, a, or b', () => {
      const result = uuid();
      expect(['8', '9', 'a', 'b']).toContain(result[19]);
    });
  });
});
