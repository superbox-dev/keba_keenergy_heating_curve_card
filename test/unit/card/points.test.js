import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
/** @import { PointAxis } from '../../test_helper/card-view' */
import { createHass, holdServiceCalls, serviceCalls, withStates } from '../../fixtures/hass';
/** @import { HassOptions } from '../../fixtures/hass' */
import { PASSWORD_HASH } from '../../fixtures/password';
import { circuitStates, curveSelect, curveSensor, entityId, plain, POINTS } from '../../fixtures/registry';
/** @import { FieldKey } from '../../fixtures/registry' */
import { settle } from '../../test_helper/shadow-view';
/** @import { FakeHass, StateChanges } from '../../fixtures/types' */

/**
 * @param {FieldKey} key
 * @returns {string}
 */
const id = key => entityId('111', 1, key);

/**
 * The states after the controller saved the points in HC1.
 *
 * @param {unknown} points
 * @returns {StateChanges}
 */
const savedPoints = points => ({ [id('curve')]: curveSensor('HC1', points) });

/**
 * Home Assistant whose curve table HC1 has the given points.
 *
 * @param {unknown} points
 * @returns {FakeHass}
 */
const withPoints = points =>
  createHass({ states: circuitStates('111', 1, { curve: curveSensor('HC1', points) }) });

/**
 * Points with the outdoor temperatures `start`, `start + step`, … and the same flow.
 *
 * @param {number} length
 * @param {number} start
 * @param {number} step
 */
const series = (length, start, step) =>
  Array.from({ length }, (_, index) => ({ outdoor: start + index * step, flow: 30 }));

/** @param {FakeHass} hass */
const saved = hass => serviceCalls(hass, 'keba_keenergy');

const INVALID_POINTS = 'Invalid points: outdoor −40 to 40 °C, flow 10 to 90 °C; outdoor temperatures must be unique.';

describe('point table', () => {
  it('shows the saved points', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.pointValues).toEqual([['-20', '45'], ['0', '35'], ['20', '25']]);
    expect(view.pointField(0, 'outdoor').label).toBe('Outdoor °C');
    expect(view.pointField(0, 'flow').selector?.number).toEqual({ mode: 'box', step: 'any', min: 10, max: 90 });
    expect(view.savePointsButton.disabled).toBe(false);
  });

  it('shows empty fields for invalid values', async () => {
    const view = await CardView.create({}, withPoints([{ outdoor: 'x', flow: null }]));

    expect(view.pointValues).toEqual([['', '']]);
  });

  it.each(/** @type {[string, HassOptions][]} */ ([
    ['without the action of the integration', { pointService: false }],
    ['with an unavailable curve', { states: circuitStates('111', 1, { curve: plain('unavailable') }) }],
    ['without points', { states: circuitStates('111', 1, { curve: { state: 'HC1', attributes: {} } }) }],
    ['with another table than the select', { states: circuitStates('111', 1, { curve: curveSensor('HC2') }) }],
    ['with a table that is no heating table', {
      states: circuitStates('111', 1, { select: curveSelect('Off', ['Off']), curve: curveSensor('Off') }),
    }],
  ]))('is read-only %s', async (_, options) => {
    const view = await CardView.create({}, createHass(options));

    expect(view.savePointsButton.disabled).toBe(true);
    expect(view.addPointButton.disabled).toBe(true);
    expect(/** @type {HTMLInputElement | null} */ (view.query('[data-point="0"][data-axis="outdoor"]'))?.disabled ?? true).toBe(true);
  });

  it('uses the curve sensor without select', async () => {
    const states = circuitStates('111', 1, { select: plain('unavailable') });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveTable).toBe('HC1');
    expect(view.curveOptions).toEqual([{ value: 'HC1', label: 'Current: HC1', selected: true }]);
  });

  it('shows a dash without curve table', async () => {
    const states = circuitStates('111', 1, { select: plain('unknown'), curve: plain('') });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.curveTable).toBe('—');
    expect(view.curveOptions).toEqual([{ value: 'No curves available', label: 'No curves available', selected: true }]);
  });
});

describe('editing points', () => {
  it('changes a point as draft', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    await view.setPoint(1, 'flow', 38);

    expect(view.message).toBe('Points changed · not saved yet');
    expect(view.chart.pointLabels).toEqual(['45.0', '38.0', '25.0']);
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('changes several points of the draft', async () => {
    const view = await CardView.create({}, createHass());

    await view.setPoint(0, 'flow', 50);
    await view.setPoint(2, 'outdoor', 25);
    await view.addPoint();

    expect(view.pointValues.slice(0, 3)).toEqual([['-20', '50'], ['0', '35'], ['25', '25']]);
  });

  it('adds a point', async () => {
    const view = await CardView.create({}, createHass());

    await view.addPoint();

    expect(view.pointValues).toEqual([['-20', '45'], ['0', '35'], ['20', '25'], ['5', '30']]);
    expect(view.message).toBe('Point added · not saved yet');
    expect(view.curveLabel).toBe('Point table · Draft');
  });

  it('adds a point below 0 °C when 0 to 40 °C are used', async () => {
    const view = await CardView.create({}, withPoints(series(9, 0, 5)));

    await view.addPoint();

    expect(view.pointValues.at(-1)).toEqual(['-5', '30']);
  });

  it('adds a point below the used negative temperatures', async () => {
    const view = await CardView.create({}, withPoints(series(11, -10, 5)));

    await view.addPoint();

    expect(view.pointValues.at(-1)).toEqual(['-15', '30']);
  });

  it('allows at most 16 points', async () => {
    const view = await CardView.create({}, withPoints(series(15, -35, 5)));

    await view.addPoint();

    expect(view.pointRows).toHaveLength(16);
    expect(view.addPointButton.disabled).toBe(true);
  });

  it('removes a point', async () => {
    const view = await CardView.create({}, createHass());

    await view.removePoint(1);

    expect(view.pointValues).toEqual([['-20', '45'], ['20', '25']]);
    expect(view.curveLabel).toBe('Point table · Draft');
  });

  it('keeps the last point', async () => {
    const view = await CardView.create({}, withPoints([{ outdoor: 0, flow: 35 }]));

    expect(view.removeButton(0).disabled).toBe(true);

    await view.forceClick(view.removeButton(0));

    expect(view.pointValues).toEqual([['0', '35']]);
  });

  it('discards the draft', async () => {
    const view = await CardView.create({}, createHass());
    await view.addPoint();
    await view.setLimit('limitDay', 20);

    await view.discardDraft();

    expect(view.pointValues).toHaveLength(3);
    expect(view.limitValue('limitDay')).toBe(18);
    expect(view.message).toBe('Draft discarded.');
  });

  it('keeps the draft when the readings update', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.setPoint(0, 'flow', 50);

    view.hass = withStates(hass, { [id('outdoor')]: plain('1') });

    expect(view.pointValues[0]).toEqual(['-20', '50']);
  });

  it('shows the points of another table without the draft', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.addPoint();

    view.hass = withStates(hass, {
      [id('select')]: curveSelect('HC2', ['HC1', 'HC2']),
      [id('curve')]: curveSensor('HC2', [{ outdoor: 0, flow: 30 }]),
    });

    expect(view.pointValues).toEqual([['0', '30']]);
  });
});

describe('saving points', () => {
  it('sends the sorted and rounded points', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.setPoint(1, 'outdoor', -25.556);

    await view.savePoints();

    expect(saved(hass)).toEqual([['set_heating_curve_points', {
      config_entry: 'entry-1',
      heating_curve: 'HC1',
      points: [{ outdoor: -25.56, flow: 35 }, { outdoor: -20, flow: 45 }, { outdoor: 20, flow: 25 }],
    }]]);
    expect(view.message).toBe('');
    expect(view.curveLabel).toBe('Point table');
    expect(view.pointValues[0]).toEqual(['-25.56', '35']);
  });

  it('removes the draft when the controller has the points', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.removePoint(0);
    await view.savePoints();

    view.hass = withStates(hass, savedPoints(POINTS.slice(1)));

    expect(view.curveLabel).toBe('Point table');
  });

  it('removes the draft when the points arrive while saving', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    hass.callService.mockImplementation(async () => {
      view.hass = withStates(hass, savedPoints(POINTS.slice(1)));
    });
    await view.removePoint(0);

    await view.savePoints();

    expect(view.curveLabel).toBe('Point table');
  });

  it('sends nothing without changes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.setPoint(0, 'flow', 45);

    await view.savePoints();

    expect(saved(hass)).toEqual([]);
    expect(view.message).toBe('No changes to the points.');
  });

  it.each(/** @type {[string, number, PointAxis, number | string][]} */ ([
    ['an outdoor temperature below -40 °C', 0, 'outdoor', -41],
    ['an outdoor temperature above 40 °C', 2, 'outdoor', 41],
    ['a flow temperature below 10 °C', 0, 'flow', 9],
    ['a flow temperature above 90 °C', 0, 'flow', 91],
    ['an empty flow temperature', 0, 'flow', ''],
    ['an empty outdoor temperature', 0, 'outdoor', ''],
    ['a duplicate outdoor temperature', 1, 'outdoor', -20.001],
  ]))('rejects %s', async (_, index, axis, value) => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    await view.setPoint(index, axis, value);

    await view.savePoints();

    expect(saved(hass)).toEqual([]);
    expect(view.message).toBe(INVALID_POINTS);
  });

  it.each([
    ['no points', []],
    ['more than 16 points', series(17, -32, 4)],
  ])('rejects %s', async (_, points) => {
    const hass = withPoints(points);
    const view = await CardView.create({}, hass);

    await view.savePoints();

    expect(saved(hass)).toEqual([]);
    expect(view.message).toContain('Invalid points');
  });

  it.each([
    ['an error', Error('Service unavailable'), 'Save failed: Service unavailable'],
    ['an error without message', 'timeout', 'Save failed: timeout'],
  ])('shows %s', async (_, failure, expected) => {
    const hass = createHass();
    hass.callService.mockRejectedValue(failure);
    const view = await CardView.create({}, hass);
    await view.addPoint();

    await view.savePoints();

    expect(view.message).toBe(expected);
    expect(view.savePointsButton.disabled).toBe(false);
  });

  it('locks the inputs while saving', async () => {
    const hass = createHass();
    const finish = holdServiceCalls(hass);
    const view = await CardView.create({}, hass);
    await view.addPoint();

    await view.savePoints();

    expect(view.message).toBe('Saving points …');
    expect(view.savePointsButton.disabled).toBe(true);

    await view.setPoint(0, 'flow', 50);

    expect(view.message).toBe('Saving points …');

    await view.forceClick(view.savePointsButton);
    await view.forceClick(view.reloadButton);

    expect(saved(hass)).toHaveLength(1);
    expect(hass.callWS).toHaveBeenCalledTimes(2);

    finish();
    await settle();

    expect(view.message).toBe('');
  });

  it('drops the draft when the card locks while saving', async () => {
    const hass = createHass();
    const finish = holdServiceCalls(hass);
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, hass);
    await view.unlock();
    await view.addPoint();
    await view.savePoints();

    await view.lock();
    finish();
    await settle();

    expect(view.pointValues).toHaveLength(3);
  });
});
