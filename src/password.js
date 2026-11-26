// Salted PBKDF2-SHA256 verifiers of the edit password, the password itself is never stored.
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';

/** Iterations of a new verifier. */
export const ITERATIONS = 120000;

const MIN_ITERATIONS = 100000;
const MAX_ITERATIONS = 1000000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const VERIFIER = /^pbkdf2-sha256\$(\d+)\$([0-9a-f]{32})\$([0-9a-f]{64})$/i;

/**
 * Parsed verifier of the config option `edit_password_hash`.
 *
 * @typedef {object} PasswordVerifier
 * @property {number} iterations PBKDF2 iterations.
 * @property {string} salt Salt as hexadecimal string.
 * @property {string} hash Derived key as lowercase hexadecimal string.
 */

/**
 * Parses a verifier in the format `pbkdf2-sha256$<iterations>$<salt>$<hash>`.
 *
 * @param {unknown} value Value of `edit_password_hash`.
 * @returns {PasswordVerifier | null} The verifier, `null` when the value is empty or invalid.
 */
export function parseVerifier(value) {
  const token = String(value || '').match(VERIFIER);
  if (!token) return null;
  const iterations = Number(token[1]);
  if (iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) return null;
  return { iterations, salt: token[2], hash: token[3].toLowerCase() };
}

/**
 * Checks a password against a verifier, in constant time.
 *
 * @param {string} password The entered password, its bytes are wiped after use.
 * @param {PasswordVerifier} verifier The verifier of the card config.
 * @returns {Promise<boolean>} Whether the password is correct.
 */
export async function verifyPassword(password, verifier) {
  const bytes = new TextEncoder().encode(password);
  /** @type {Uint8Array | undefined} */
  let derived;
  try {
    derived = await pbkdf2Async(sha256, bytes, fromHex(verifier.salt), { c: verifier.iterations, dkLen: KEY_LENGTH });
    const expected = fromHex(verifier.hash);
    let difference = 0;
    for (let index = 0; index < expected.length; index++) difference |= derived[index] ^ expected[index];
    return difference === 0;
  } finally {
    bytes.fill(0);
    derived?.fill(0);
  }
}

/**
 * Creates a verifier with a random salt.
 *
 * @param {string} password The new password, its bytes are wiped after use.
 * @returns {Promise<string>} The verifier for `edit_password_hash`.
 */
export async function createVerifier(password) {
  const bytes = new TextEncoder().encode(password);
  /** @type {Uint8Array | undefined} */
  let derived;
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    derived = await pbkdf2Async(sha256, bytes, salt, { c: ITERATIONS, dkLen: KEY_LENGTH });
    return ['pbkdf2-sha256', ITERATIONS, toHex(salt), toHex(derived)].join('$');
  } finally {
    bytes.fill(0);
    derived?.fill(0);
  }
}

/**
 * Converts a hexadecimal string to bytes.
 *
 * @param {string} hex Hexadecimal string with an even length.
 * @returns {Uint8Array} The bytes.
 */
function fromHex(hex) {
  const pairs = /** @type {RegExpMatchArray} */ (hex.match(/../g));
  return Uint8Array.from(pairs, pair => parseInt(pair, 16));
}

/**
 * Converts bytes to a lowercase hexadecimal string.
 *
 * @param {Uint8Array} bytes The bytes.
 * @returns {string} The hexadecimal string.
 */
function toHex(bytes) {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
