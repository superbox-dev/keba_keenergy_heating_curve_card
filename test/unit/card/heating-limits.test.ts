import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass, holdServiceCalls, serviceCalls, withStates } from '../../fixtures/hass';
import { PASSWORD_HASH } from '../../fixtures/password';
import { circuitStates, entityId, heatingLimit, plain } from '../../fixtures/registry';
import type { FieldKey } from '../../fixtures/registry';
import { settle } from '../../test_helper/shadow-view';
import type { FakeHass } from '../../fixtures/types';

const id = (key: FieldKey): string => entityId('111', 1, key);

const numbers = (hass: FakeHass) => serviceCalls(hass, 'number');

const INVALID_DAY = 'Invalid value for Day heating limit. Observe the entity’s range and step size.';

describe('heating limits', () => {
  it('shows the limits with the range of the entities', async () => {
    const view = await CardView.create({}, createHass());

    const day = view.limitInput('limitDay');
    expect([day.value, day.min, day.max, day.step]).toEqual(['18', '0', '30', '0.5']);
    expect(view.limitInput('limitNight').value).toBe('15');
    expect(day.closest('label')?.textContent).toBe('Day heating limit (°C)');
  });

  it('accepts any value without range', async () => {
    const states = circuitStates('111', 1, { limitDay: heatingLimit(18, '°C', {}) });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.limitInput('limitDay').step).toBe('any');
    expect(view.limitInput('limitDay').hasAttribute('min')).toBe(false);
  });

  it('disables unavailable limits', async () => {
    const states = circuitStates('111', 1, { limitDay: plain('unavailable') });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.limitInput('limitDay').disabled).toBe(true);
    expect(view.limitInput('limitDay').value).toBe('');
  });

  it('saves the changed limits', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.setLimit('limitDay', 20);

    expect(view.message).toBe('Settings changed · not saved yet');

    await view.setLimit('limitNight', 15);
    await view.saveLimits();

    expect(numbers(hass)).toEqual([['set_value', { entity_id: id('limitDay'), value: 20 }]]);
    expect(view.message).toBe('1 settings sent. The next update will show the controller values.');
    expect(view.limitInput('limitDay').value).toBe('18');
  });

  it('saves in the unit of the entity', async () => {
    const limitDay = heatingLimit(64.4, '°F', { min: 32, max: 86, step: 0.9 });
    const hass = createHass({ states: circuitStates('111', 1, { limitDay }) });
    const view = await CardView.create({}, hass);

    await view.setLimit('limitDay', 20);
    await view.saveLimits();

    expect(numbers(hass)).toEqual([['set_value', { entity_id: id('limitDay'), value: 68 }]]);
  });

  it('saves in Kelvin', async () => {
    const hass = createHass({ states: circuitStates('111', 1, { limitDay: heatingLimit(291.15, 'K', {}) }) });
    const view = await CardView.create({}, hass);

    await view.setLimit('limitDay', 20);
    await view.saveLimits();

    expect(numbers(hass)[0][1].value).toBe(293.15);
  });

  it('sends nothing without changes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.saveLimits();

    expect(view.message).toBe('No settings changed.');
    expect(numbers(hass)).toEqual([]);
  });

  it.each([
    ['below the minimum', -1],
    ['above the maximum', 31],
    ['off the step', 18.3],
    ['empty', ''],
  ])('rejects a value %s', async (_, value) => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.setLimit('limitDay', value);
    await view.saveLimits();

    expect(view.message).toBe(INVALID_DAY);
    expect(numbers(hass)).toEqual([]);
  });

  it('rejects a change of an unavailable limit', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.setLimit('limitDay', 20);

    view.hass = withStates(hass, { [id('limitDay')]: plain('unknown') });
    await view.saveLimits();

    expect(view.message).toContain('Invalid value for Day heating limit.');
  });

  it.each([
    ['an error', Error('Out of range'), 'Partially saved (0). Remaining changes were not sent: Out of range'],
    ['an error without message', 'offline', 'Partially saved (0). Remaining changes were not sent: offline'],
  ])('shows %s', async (_, failure, expected) => {
    const hass = createHass();
    hass.callService.mockRejectedValue(failure);
    const view = await CardView.create({}, hass);

    await view.setLimit('limitDay', 20);
    await view.saveLimits();

    expect(view.message).toBe(expected);
  });

  it('ignores input while saving', async () => {
    const hass = createHass();
    const finish = holdServiceCalls(hass);
    const view = await CardView.create({}, hass);
    await view.setLimit('limitDay', 20);

    await view.saveLimits();

    expect(view.message).toBe('Saving settings …');

    const night = view.limitInput('limitNight');
    night.disabled = false;
    await view.input(night, 16);

    expect(view.message).toBe('Saving settings …');

    await view.forceClick(view.saveLimitsButton);
    finish();
    await settle();

    expect(numbers(hass)).toHaveLength(1);
  });

  it('stops when the card locks while saving', async () => {
    const hass = createHass();
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, hass);
    await view.unlock();
    hass.callService.mockImplementation(async () => {
      view.lockButton.click();
    });
    await view.setLimit('limitDay', 20);
    await view.setLimit('limitNight', 16);

    await view.saveLimits();

    expect(numbers(hass)).toHaveLength(1);
    expect(view.message)
      .toBe('Partially saved (1). Remaining changes were not sent: Editing locked. Please unlock again.');
  });
});
