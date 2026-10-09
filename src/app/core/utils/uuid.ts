export function uuid(): string {
  const cryptoInstance = globalThis.crypto;

  if (typeof cryptoInstance?.randomUUID === 'function') {
    return cryptoInstance.randomUUID();
  }

  const bytes = cryptoInstance.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hexParts = Array.from(bytes, (byteValue) => byteValue.toString(16).padStart(2, '0'));
  return (
    `${hexParts.slice(0, 4).join('')}-` +
    `${hexParts.slice(4, 6).join('')}-` +
    `${hexParts.slice(6, 8).join('')}-` +
    `${hexParts.slice(8, 10).join('')}-` +
    `${hexParts.slice(10).join('')}`
  );
}
