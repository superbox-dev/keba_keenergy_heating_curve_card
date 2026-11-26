// @ts-check
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { describe, expect, it, vi } from 'vitest';
import '../../src/card';
import { EditorView } from '../test_helper/editor-view';
import { settle } from '../test_helper/shadow-view';

// Setting a password fails only when the browser cannot compute the hash.
vi.mock('@noble/hashes/pbkdf2.js', async importOriginal => ({
  .../** @type {object} */ (await importOriginal()),
  pbkdf2Async: vi.fn(),
}));

describe('failed password', () => {
  it.each([
    ['an error', Error('Out of memory'), 'Could not set the password: Out of memory'],
    ['an error without message', 'busy', 'Could not set the password: busy'],
  ])('shows %s', async (_, failure, expected) => {
    vi.mocked(pbkdf2Async).mockRejectedValue(failure);
    const editor = await EditorView.create({});

    editor.startPassword('secret');
    await settle();

    expect(editor.text('#password-message')).toBe(expected);
    expect(editor.createPasswordButton.disabled).toBe(false);
  });
});
