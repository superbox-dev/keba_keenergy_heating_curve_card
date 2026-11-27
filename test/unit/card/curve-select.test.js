import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass, holdServiceCalls, serviceCalls, withLanguage, withStates } from '../../fixtures/hass';
import { circuitStates, curveSelect, curveSensor, entityId, plain } from '../../fixtures/registry';
/** @import { FieldKey } from '../../fixtures/registry' */
import { settle } from '../../test_helper/shadow-view';
/** @import { FakeHass, StateChanges } from '../../fixtures/types' */

/**
 * @param {FieldKey} key
 * @returns {string}
 */
const id = key => entityId('111', 1, key);

/**
 * The states after the controller switched the heating circuit to another table.
 *
 * @param {string} name
 * @returns {StateChanges}
 */
const table = name => ({ [id('select')]: curveSelect(name), [id('curve')]: curveSensor(name) });

/** @param {FakeHass} hass */
const selections = hass => serviceCalls(hass, 'select');

describe('curve tables', () => {
  it('offers the heating tables of the controller', async () => {
    const states = circuitStates('111', 1, { select: curveSelect('HC1', ['HC1', 'Off', 2, 'HC2']) });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveOptions.map(({ value, selected }) => ({ value, selected })))
      .toEqual([{ value: 'HC1', selected: true }, { value: 'HC2', selected: false }]);
  });

  it('shows the assignment right after the choice, while the menu still has the focus', async () => {
    const hass = createHass();
    hass.callService.mockReturnValue(new Promise(() => {}));
    const view = await CardView.create({}, hass);
    const form = view.cardForm('curve');
    form.dispatchEvent(new Event('focusin'));

    await view.selectCurve('HC2');

    expect(view.cardForm('curve')).not.toBe(form);
    expect(view.curveDisabled).toBe(true);
  });

  it('explains the selection below the field', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.curveTexts).toEqual({
      label: 'Curve table for this heating circuit',
      helper: 'Choose one of the heating tables (HC…) offered by the controller. Selecting a table assigns it to this '
        + 'heating circuit. A table can be shared by several circuits on the same controller.',
    });
  });

  it('offers no tables without options', async () => {
    const states = circuitStates('111', 1, { select: { state: 'HC1', attributes: {} } });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveOptions.map(option => option.label)).toEqual(['Current: HC1']);
  });

  it('assigns a table to the heating circuit', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.selectCurve('HC2');

    expect(selections(hass)).toEqual([['select_option', { entity_id: id('select'), option: 'HC2' }]]);
    expect(view.message).toBe('Curve HC2 assigned. Readings are updating.');
    expect(view.savePointsButton.disabled).toBe(true);

    view.hass = withStates(hass, { [id('select')]: curveSelect('HC2') });

    expect(view.savePointsButton.disabled).toBe(true);

    view.hass = withStates(hass, table('HC2'));

    expect(view.savePointsButton.disabled).toBe(false);
  });

  it('shows the loading table', async () => {
    const hass = createHass();
    const finish = holdServiceCalls(hass);
    const view = await CardView.create({}, hass);

    await view.selectCurve('HC3');

    expect(view.message).toBe('Assigning curve …');
    expect(view.curveDisabled).toBe(true);

    finish();
    await settle();
    await view.discardDraft();

    expect(view.message).toBe('Draft discarded.');

    view.hass = withStates(hass, { [id('outdoor')]: plain('1') });

    expect(view.message).toBe('Draft discarded.');
  });

  it('shows the loading table when the message is cleared', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.selectCurve('HC3');
    const german = withLanguage(hass, 'de');

    view.hass = german;

    expect(view.message).toBe('Kurve HC3 wird geladen …');

    view.hass = withStates(german, { [id('outdoor')]: plain('2') });

    expect(view.message).toBe('Kurve HC3 wird geladen …');
  });

  it('finishes when the table arrives while assigning', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    hass.callService.mockImplementation(async () => {
      view.hass = withStates(hass, table('HC2'));
    });

    await view.selectCurve('HC2');

    expect(view.savePointsButton.disabled).toBe(false);
  });

  it.each([
    ['an error', Error('Not allowed'), 'Selection failed: Not allowed'],
    ['an error without message', 'offline', 'Selection failed: offline'],
  ])('shows %s', async (_, failure, expected) => {
    const hass = createHass();
    hass.callService.mockRejectedValue(failure);
    const view = await CardView.create({}, hass);

    await view.selectCurve('HC2');

    expect(view.message).toBe(expected);
    expect(view.savePointsButton.disabled).toBe(false);
  });

  it('keeps the table with unsaved changes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.addPoint();

    await view.selectCurve('HC2');

    expect(selections(hass)).toEqual([]);
    expect(view.message).toBe('Save points / settings or discard the draft before switching tables.');
  });

  it('writes nothing when the table is already assigned', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.selectCurve('HC1');

    expect(selections(hass)).toEqual([]);
  });

  it('ignores tables that are not offered', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.selectCurve('HC9');

    expect(selections(hass)).toEqual([]);
  });

  it('assigns one table at a time', async () => {
    const hass = createHass();
    hass.callService.mockReturnValue(new Promise(() => {}));
    const view = await CardView.create({}, hass);
    await view.selectCurve('HC2');

    await view.selectCurve('HC3');

    expect(selections(hass)).toHaveLength(1);
  });

  it('disables the select without curve table entity', async () => {
    const states = circuitStates('111', 1, { select: plain('unavailable') });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveDisabled).toBe(true);
  });

  it('keeps the point edits while assigning', async () => {
    const hass = createHass();
    hass.callService.mockReturnValue(new Promise(() => {}));
    const view = await CardView.create({}, hass);
    await view.selectCurve('HC2');

    await view.setLimit('limitDay', 20);

    expect(view.limitField('limitDay').disabled).toBe(true);
  });
});
