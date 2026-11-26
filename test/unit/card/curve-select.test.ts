import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass, holdServiceCalls, serviceCalls, withLanguage, withStates } from '../../fixtures/hass';
import { circuitStates, curveSelect, curveSensor, entityId, plain } from '../../fixtures/registry';
import type { FieldKey } from '../../fixtures/registry';
import { settle } from '../../test_helper/shadow-view';
import type { FakeHass, StateChanges } from '../../fixtures/types';

const id = (key: FieldKey): string => entityId('111', 1, key);

/** The states after the controller switched the heating circuit to another table. */
const table = (name: string): StateChanges => ({ [id('select')]: curveSelect(name), [id('curve')]: curveSensor(name) });

const selections = (hass: FakeHass) => serviceCalls(hass, 'select');

describe('curve tables', () => {
  it('offers the heating tables of the controller', async () => {
    const states = circuitStates('111', 1, { select: curveSelect('HC1', ['HC1', 'Off', 2, 'HC2']) });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveOptions.map(({ value, selected }) => ({ value, selected })))
      .toEqual([{ value: 'HC1', selected: true }, { value: 'HC2', selected: false }]);
  });

  it('offers no tables without options', async () => {
    const states = circuitStates('111', 1, { select: { state: 'HC1', attributes: {} } });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveOptions.map(option => option.label)).toEqual(['Current: HC1', 'HC1']);
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
    expect(view.curveSelect.disabled).toBe(true);

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
    const select = view.curveSelect;
    select.disabled = false;

    await view.change(select, 'HC3');

    expect(selections(hass)).toHaveLength(1);
  });

  it('disables the select without curve table entity', async () => {
    const states = circuitStates('111', 1, { select: plain('unavailable') });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveSelect.disabled).toBe(true);
  });

  it('keeps the point edits while assigning', async () => {
    const hass = createHass();
    hass.callService.mockReturnValue(new Promise(() => {}));
    const view = await CardView.create({}, hass);
    await view.selectCurve('HC2');

    await view.setLimit('limitDay', 20);

    expect(view.limitInput('limitDay').disabled).toBe(true);
  });
});
