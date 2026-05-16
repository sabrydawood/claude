// src/Lib/Ai/Crypto.ts

const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits for GCM

function GetEncryptionKey(): CryptoKey {
  const hexKey = process.env.ENCRYPTION_KEY;
  if (!hexKey || hexKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  const keyBytes = new Uint8Array(hexKey.match(/.{1,2}/g)!.map(b => parseInt(b, 16)));
  return crypto.subtle.importKey('raw', keyBytes, { name: ALGORITHM }, false, ['encrypt', 'decrypt']) as unknown as CryptoKey;
}

export async function EncryptApiKey(plaintext: string): Promise<string> {
  const key = await GetEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
  const ivB64 = Buffer.from(iv).toString('base64');
  const ctB64 = Buffer.from(ciphertext).toString('base64');
  return `${ivB64}:${ctB64}`;
}

export async function DecryptApiKey(encrypted: string): Promise<string> {
  const key = await GetEncryptionKey();
  const [ivB64, ctB64] = encrypted.split(':');
  if (!ivB64 || !ctB64) throw new Error('Invalid encrypted format');
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(ctB64, 'base64');
  const plaintext = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
