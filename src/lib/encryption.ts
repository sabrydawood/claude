// AES-256-GCM encryption for user API keys.
// ENCRYPTION_KEY env var must be a 64-char hex string (32 bytes).

const ALG = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // bytes for GCM

function getKeyMaterial(): string {
  const k = process.env.ENCRYPTION_KEY;
  if (!k || k.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-char hex string (32 bytes)');
  }
  return k;
}

function hexToBuffer(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function bufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function importKey(): Promise<CryptoKey> {
  const raw = hexToBuffer(getKeyMaterial());
  return crypto.subtle.importKey('raw', raw, { name: ALG, length: KEY_LENGTH }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptApiKey(plaintext: string): Promise<string> {
  const key = await importKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALG, iv }, key, encoded);
  // Store as iv:ciphertext (both hex)
  return `${bufferToHex(iv.buffer)}:${bufferToHex(ciphertext)}`;
}

export async function decryptApiKey(stored: string): Promise<string> {
  const [ivHex, ctHex] = stored.split(':');
  if (!ivHex || !ctHex) throw new Error('Invalid encrypted key format');
  const key = await importKey();
  const iv = hexToBuffer(ivHex);
  const ciphertext = hexToBuffer(ctHex);
  const plaintext = await crypto.subtle.decrypt({ name: ALG, iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
