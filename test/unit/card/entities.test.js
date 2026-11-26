// @ts-check
import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { answerRegistry, createHass, wsMessages } from '../../fixtures/hass';
import { PASSWORD_HASH } from '../../fixtures/password';
import { controllerEntities, entityId } from '../../fixtures/registry';
/** @import { FieldKey } from '../../fixtures/registry' */
/** @import { CallWS, EntityRegistryEntry, FakeHass } from '../../fixtures/types' */

/**
 * @param {FieldKey} key
 * @returns {string}
 */
const id = key => entityId('111', 1, key);

/**
 * The registry of controller `111` with the given fields disabled by the integration.
 *
 * @param {...FieldKey} keys
 * @returns {EntityRegistryEntry[]}
 */
const disabled = (...keys) => controllerEntities('entry-1', '111').map(entry =>
  (keys.some(key => entry.entity_id === id(key)) ? { ...entry, disabled_by: 'integration' } : entry));

/** @param {FakeHass} hass */
const updates = hass => wsMessages(hass, 'config/entity_registry/update');

/**
 * Answers `config/entity_registry/update` with `update`, all other messages like before.
 *
 * @param {FakeHass} hass
 * @param {CallWS} update
 * @returns {void}
 */
function answerUpdates(hass, update) {
  const answer = /** @type {CallWS} */ (hass.callWS.getMockImplementation());
  hass.callWS.mockImplementation(message => (message.type === 'config/entity_registry/update' ? update : answer)(message));
}

/**
 * @param {number} count
 * @param {string} error
 * @returns {string}
 */
const stopped = (count, error) => `Enabling stopped after ${count} entities: ${error}. `
  + 'Sign in as an administrator or enable entities in the KeEnergy settings.';

describe('disabled entities', () => {
  it('shows no setup without disabled entities', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.enablePanel).toBeNull();
  });

  it('asks to enable the disabled entities', async () => {
    const view = await CardView.create({}, createHass({ registry: disabled('limitDay', 'limitNight') }));

    expect(view.text('.setup p')).toBe('2 required KeEnergy entities are disabled. '
      + 'An administrator can enable the required entities for this heating circuit.');
    expect(view.enableButton.disabled).toBe(false);
  });

  it('enables the disabled entities', async () => {
    const hass = createHass({ registry: disabled('limitDay', 'limitNight') });
    const view = await CardView.create({}, hass);
    answerRegistry(hass, controllerEntities('entry-1', '111'));

    await view.enableEntities();

    expect(updates(hass)).toEqual([
      { type: 'config/entity_registry/update', entity_id: id('limitDay'), disabled_by: null },
      { type: 'config/entity_registry/update', entity_id: id('limitNight'), disabled_by: null },
    ]);
    expect(view.message)
      .toBe('2 entities enabled. Home Assistant is loading their values; they will appear after the next update.');
    expect(view.enablePanel).toBeNull();
  });

  it('needs an administrator', async () => {
    const hass = createHass({ registry: disabled('limitDay'), admin: false });
    const view = await CardView.create({}, hass);

    expect(view.enableButton.disabled).toBe(true);

    await view.forceClick(view.enableButton);

    expect(view.message).toBe('Sign in as an administrator to enable disabled entities.');
    expect(updates(hass)).toEqual([]);
  });

  it.each([
    ['an error', Error('Unauthorized'), 'Unauthorized'],
    ['an error without message', 'denied', 'denied'],
  ])('shows %s', async (_, failure, error) => {
    const hass = createHass({ registry: disabled('limitDay') });
    const view = await CardView.create({}, hass);
    answerUpdates(hass, () => Promise.reject(failure));

    await view.enableEntities();

    expect(view.message).toBe(stopped(0, error));
  });

  it('stops when the card locks', async () => {
    const hass = createHass({ registry: disabled('limitDay', 'limitNight') });
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, hass);
    await view.unlock();
    answerUpdates(hass, async () => {
      view.lockButton.click();
      return {};
    });

    await view.enableEntities();

    expect(updates(hass)).toHaveLength(1);
    expect(view.message).toBe(stopped(1, 'Editing locked. Please unlock again.'));
  });

  it('enables nothing while locked', async () => {
    const hass = createHass({ registry: disabled('limitDay') });
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, hass);

    expect(view.enableButton.disabled).toBe(true);

    await view.forceClick(view.enableButton);

    expect(updates(hass)).toEqual([]);
  });

  it('enables once at a time', async () => {
    const hass = createHass({ registry: disabled('limitDay') });
    const view = await CardView.create({}, hass);
    answerUpdates(hass, () => new Promise(() => {}));

    await view.enableEntities();

    expect(view.message).toBe('Enabling required entities …');

    await view.forceClick(view.enableButton);

    expect(updates(hass)).toHaveLength(1);
  });
});
