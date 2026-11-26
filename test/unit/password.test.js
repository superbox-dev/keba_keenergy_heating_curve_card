import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { describe, expect, it, vi } from 'vitest';
import { ITERATIONS, createVerifier, parseVerifier, verifyPassword } from '../../src/password';
import { PASSWORD, PASSWORD_HASH } from '../fixtures/password';
/** @import { PasswordVerifier } from '../../src/password' */

/**
 * The bytes that the last PBKDF2 calculation got as password.
 *
 * @returns {Uint8Array}
 */
const lastPasswordBytes = () => /** @type {Uint8Array} */ (vi.mocked(pbkdf2Async).mock.calls.at(-1)?.[1]);

describe('parseVerifier', () => {
  it('parses a verifier in any case and lowercases the hash', () => {
    const [, iterations, salt, hash] = PASSWORD_HASH.split('$');

    expect(parseVerifier(PASSWORD_HASH.toUpperCase().replace('PBKDF2-SHA256', 'pbkdf2-sha256')))
      .toEqual({ iterations: Number(iterations), salt: salt.toUpperCase(), hash });
  });

  it.each(/** @type {[string | undefined, string][]} */ ([
    ['', 'empty'],
    [undefined, 'missing'],
    ['secret', 'no verifier'],
    [PASSWORD_HASH.replace('$100000$', '$99999$'), 'too few iterations'],
    [PASSWORD_HASH.replace('$100000$', '$1000001$'), 'too many iterations'],
  ]))('rejects %o (%s)', (value) => {
    expect(parseVerifier(value)).toBeNull();
  });
});

describe('verifyPassword', () => {
  const verifier = /** @type {PasswordVerifier} */ (parseVerifier(PASSWORD_HASH));

  it('accepts the password', async () => {
    await expect(verifyPassword(PASSWORD, verifier)).resolves.toBe(true);
  });

  it('rejects another password', async () => {
    await expect(verifyPassword('wrong', verifier)).resolves.toBe(false);
  });

  it('wipes the password bytes', async () => {
    await verifyPassword(PASSWORD, verifier);

    expect(lastPasswordBytes().every(byte => byte === 0)).toBe(true);
  });
});

describe('createVerifier', () => {
  it('creates a verifier with a random salt that accepts the password', async () => {
    const first = await createVerifier(PASSWORD);
    const second = await createVerifier(PASSWORD);

    expect(first).toMatch(new RegExp(`^pbkdf2-sha256\\$${ITERATIONS}\\$[0-9a-f]{32}\\$[0-9a-f]{64}$`));
    expect(second.split('$')[2]).not.toBe(first.split('$')[2]);
    await expect(verifyPassword(PASSWORD, /** @type {PasswordVerifier} */ (parseVerifier(first)))).resolves.toBe(true);
  });

  it('wipes the password bytes', async () => {
    await createVerifier(PASSWORD);

    expect(lastPasswordBytes().every(byte => byte === 0)).toBe(true);
  });
});
