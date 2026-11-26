// @ts-check
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { describe, expect, it, vi } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass } from '../../fixtures/hass';
import { PASSWORD_HASH } from '../../fixtures/password';
import { settle } from '../../test_helper/shadow-view';

// The check fails only when the browser cannot compute the hash.
vi.mock('@noble/hashes/pbkdf2.js', async importOriginal => ({
  .../** @type {object} */ (await importOriginal()),
  pbkdf2Async: vi.fn(),
}));

describe('failed password check', () => {
  it('asks to try again', async () => {
    vi.mocked(pbkdf2Async).mockRejectedValue(Error('Out of memory'));
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, createHass());

    await view.unlock();

    expect(view.unlockError).toBe('Password verification failed. Please try again.');
  });

  it('ignores a failure after the form was closed', async () => {
    /** @type {(error: Error) => void} */
    let fail = () => {};
    vi.mocked(pbkdf2Async).mockReturnValue(new Promise((_, reject) => {
      fail = reject;
    }));
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, createHass());
    await view.enterPassword('secret');
    await view.click(view.confirmUnlockButton);

    await view.click(view.cancelUnlockButton);
    fail(Error('Out of memory'));
    await settle();

    expect(view.unlockError).toBeUndefined();
  });
});
