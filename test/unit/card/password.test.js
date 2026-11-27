import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { describe, expect, it, vi } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass } from '../../fixtures/hass';
import { PASSWORD, PASSWORD_HASH } from '../../fixtures/password';
import { settle } from '../../test_helper/shadow-view';
/** @import { CardConfig, FakeHass } from '../../fixtures/types' */

/**
 * A card with `PASSWORD_HASH`, locked like after loading the dashboard.
 *
 * @param {CardConfig} config
 * @param {FakeHass} hass
 */
const lockedCard = (config = {}, hass = createHass()) =>
  CardView.create({ edit_password_hash: PASSWORD_HASH, ...config }, hass);

/**
 * Presses a key in the password field and returns the event, to check `defaultPrevented`.
 *
 * @param {CardView} view
 * @param {string} key
 * @returns {Promise<KeyboardEvent>}
 */
async function pressKey(view, key) {
  const event = new KeyboardEvent('keydown', { key, cancelable: true });
  await view.dispatch(view.get('#edit-password'), event);
  return event;
}

/** Waits for the PBKDF2 calculation the card started last. */
const lastPasswordCheck = () => vi.mocked(pbkdf2Async).mock.results.at(-1)?.value;

describe('locked card', () => {
  it('shows no password panel without password', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.lockPanel).toBeNull();
  });

  it('locks the editing', async () => {
    const view = await lockedCard();

    expect(view.lockStatus).toBe('Editing locked');
    expect(view.lockHint).toBe('Unlock to change the curve table, points and heating limits.');
    expect(view.savePointsButton.disabled).toBe(true);
    expect(view.saveLimitsDisabled).toBe(true);
    expect(view.curveDisabled).toBe(true);
    expect(view.discardButton.disabled).toBe(true);
    expect(view.limitField('limitDay').disabled).toBe(true);
  });

  it('rejects changes', async () => {
    const hass = createHass();
    const view = await lockedCard({}, hass);

    for (const button of [
      view.saveLimitsButton,
      view.savePointsButton,
      view.discardButton,
      view.addPointButton,
      view.removeButton(0),
    ]) {
      await view.forceClick(button);
    }
    await view.setLimit('limitDay', 20);
    await view.setPoint(0, 'outdoor', 5);
    await view.selectCurve('HC2');

    expect(view.message).toBe('Editing is locked. Please enter the password to unlock.');
    expect(hass.callService).not.toHaveBeenCalled();
  });
});

describe('unlocking', () => {
  it('opens the password form with the focus on the password', async () => {
    const view = await lockedCard();

    await view.click(view.unlockButton);

    expect(view.root.activeElement).toBe(view.passwordInput);
    expect(view.text('#confirm-unlock')).toBe('Unlock editing');
  });

  it('unlocks with the password', async () => {
    const view = await lockedCard();

    await view.unlock();

    expect(view.lockStatus).toBe('Editing unlocked');
    expect(view.lockHint).toBe('Locks automatically after 5 minutes without editing.');
    expect(view.message).toBe('Editing unlocked.');
    expect(view.savePointsButton.disabled).toBe(false);
  });

  it('shows the check of the password', async () => {
    const view = await lockedCard();
    await view.enterPassword(PASSWORD);

    await view.click(view.confirmUnlockButton);

    expect(view.text('#confirm-unlock')).toBe('Verifying …');
    expect(view.passwordInput?.disabled).toBe(true);

    await view.waitForPasswordCheck();
  });

  it('rejects a wrong password', async () => {
    const view = await lockedCard();

    await view.unlock('wrong');

    expect(view.unlockError).toBe('Incorrect password.');
    expect(view.root.activeElement).toBe(view.passwordInput);
    expect(view.lockStatus).toBe('Editing locked');
  });

  it('asks for an empty password', async () => {
    const view = await lockedCard();

    await view.unlock('');

    expect(view.unlockError).toBe('Please enter the password.');
    expect(view.root.activeElement).toBe(view.passwordInput);
  });

  it('unlocks with the Enter key', async () => {
    const view = await lockedCard();
    await view.enterPassword(PASSWORD);

    await pressKey(view, 'Enter');
    await view.waitForPasswordCheck();

    expect(view.lockStatus).toBe('Editing unlocked');
  });

  it('unlocks by submitting the form', async () => {
    const view = await lockedCard();
    await view.enterPassword(PASSWORD);
    const form = /** @type {HTMLFormElement} */ (view.get('#unlock-form'));

    const submit = new Event('submit', { cancelable: true });
    form.dispatchEvent(submit);
    form.dispatchEvent(new Event('submit'));
    await view.waitForPasswordCheck();

    expect(submit.defaultPrevented).toBe(true);
    expect(view.lockStatus).toBe('Editing unlocked');
  });

  it('closes the form with the Escape key', async () => {
    const view = await lockedCard();
    await view.click(view.unlockButton);

    await pressKey(view, 'a');

    expect(view.passwordInput).not.toBeNull();

    const escape = await pressKey(view, 'Escape');

    expect(escape.defaultPrevented).toBe(true);
    expect(view.passwordInput).toBeNull();
    expect(view.message).toBe('Editing locked.');
  });

  it('closes the form with Cancel', async () => {
    const view = await lockedCard();
    await view.click(view.unlockButton);

    await view.click(view.cancelUnlockButton);

    expect(view.unlockForm).toBeNull();
  });

  it('ignores a check that ends after the form was closed', async () => {
    const view = await lockedCard();
    await view.enterPassword(PASSWORD);
    await view.click(view.confirmUnlockButton);

    await view.click(view.cancelUnlockButton);
    await lastPasswordCheck();
    await settle();

    expect(view.lockStatus).toBe('Editing locked');
    expect(view.message).toBe('Editing locked.');
  });

  it('shows the translated password panel', async () => {
    const view = await lockedCard({ language: 'de' });

    expect(view.lockStatus).toBe('Einstellungen gesperrt');
  });
});

describe('locking', () => {
  it('locks with the lock button and discards the draft', async () => {
    const view = await lockedCard();
    await view.unlock();
    await view.setLimit('limitDay', 20);

    await view.lock();

    expect(view.lockStatus).toBe('Editing locked');
    expect(view.message).toBe('Editing locked. Unsaved changes discarded.');
    expect(view.limitValue('limitDay')).toBe(18);
  });

  it('locks after the inactivity time', async () => {
    const view = await lockedCard({ auto_lock_minutes: 2 });
    await view.unlock();
    vi.useFakeTimers();

    await view.setLimit('limitDay', 20);
    vi.advanceTimersByTime(119000);

    expect(view.lockStatus).toBe('Editing unlocked');

    await view.setLimit('limitDay', 21);
    vi.advanceTimersByTime(119000);

    expect(view.lockStatus).toBe('Editing unlocked');

    vi.advanceTimersByTime(1000);

    expect(view.lockStatus).toBe('Editing locked');
    expect(view.message).toBe('Locked automatically after inactivity. Unsaved changes discarded.');
  });

  it('locks when the page is hidden', async () => {
    const view = await lockedCard();
    await view.unlock();

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));

    expect(view.lockStatus).toBe('Editing locked');
  });

  it('stays unlocked when the page is visible', async () => {
    const view = await lockedCard();
    await view.unlock();

    document.dispatchEvent(new Event('visibilitychange'));

    expect(view.lockStatus).toBe('Editing unlocked');
  });

  it('ignores the page visibility without password', async () => {
    const view = await CardView.create({}, createHass());

    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));

    expect(view.message).toBe('');
  });

  it('locks when the card is removed', async () => {
    const view = await lockedCard();
    await view.unlock();

    view.element.remove();
    document.body.append(view.element);

    expect(view.lockStatus).toBe('Editing locked');
  });

  it('locks when the config changes', async () => {
    const view = await lockedCard();
    await view.unlock();

    view.setConfig({ edit_password_hash: PASSWORD_HASH });

    expect(view.lockStatus).toBe('Editing locked');
  });

  it('removes the card without password', async () => {
    const view = await CardView.create({}, createHass());

    view.element.remove();

    expect(view.root.innerHTML).not.toBe('');
  });
});
