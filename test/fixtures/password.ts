// The password of the tests and its verifier for `edit_password_hash`.

export const PASSWORD = 'test-password';

const SALT = '00112233445566778899aabbccddeeff';
const ITERATIONS = 100000;

const fromHex = (hex: string): Uint8Array<ArrayBuffer> =>
  Uint8Array.from(hex.match(/../g) ?? [], byte => Number.parseInt(byte, 16));

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

/**
 * Computes PBKDF2-SHA256 natively with Web Crypto.
 *
 * @param password The password bytes.
 * @param salt The salt bytes.
 * @param iterations The number of iterations.
 * @param length The length of the key in bytes.
 * @returns The derived key.
 */
export async function pbkdf2(
  password: Uint8Array<ArrayBuffer>,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
  length: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, length * 8);
  return new Uint8Array(bits);
}

const key = await pbkdf2(new TextEncoder().encode(PASSWORD), fromHex(SALT), ITERATIONS, 32);

/** Verifier of `PASSWORD` in the format of `edit_password_hash`. */
export const PASSWORD_HASH = `pbkdf2-sha256$${ITERATIONS}$${SALT}$${toHex(key)}`;
