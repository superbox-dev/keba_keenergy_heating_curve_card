// The password of the tests and its verifier for `edit_password_hash`.

export const PASSWORD = 'test-password';

const SALT = '00112233445566778899aabbccddeeff';
const ITERATIONS = 100000;

/**
 * @param {string} hex
 * @returns {Uint8Array<ArrayBuffer>}
 */
const fromHex = hex =>
  Uint8Array.from(hex.match(/../g) ?? [], byte => Number.parseInt(byte, 16));

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
const toHex = bytes =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');

/**
 * Computes PBKDF2-SHA256 natively with Web Crypto.
 *
 * @param {Uint8Array<ArrayBuffer>} password The password bytes.
 * @param {Uint8Array<ArrayBuffer>} salt The salt bytes.
 * @param {number} iterations The number of iterations.
 * @param {number} length The length of the key in bytes.
 * @returns {Promise<Uint8Array>} The derived key.
 */
export async function pbkdf2(
  password,
  salt,
  iterations,
  length,
) {
  const key = await crypto.subtle.importKey('raw', password, 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, length * 8);
  return new Uint8Array(bits);
}

const key = await pbkdf2(new TextEncoder().encode(PASSWORD), fromHex(SALT), ITERATIONS, 32);

/** Verifier of `PASSWORD` in the format of `edit_password_hash`. */
export const PASSWORD_HASH = `pbkdf2-sha256$${ITERATIONS}$${SALT}$${toHex(key)}`;
