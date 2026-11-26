import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass, withLanguage, withStates } from '../../fixtures/hass';
import {
  circuitStates,
  controllerEntities,
  curveSelect,
  curveSensor,
  entityId,
  plain,
  temperature,
} from '../../fixtures/registry';
/** @import { FieldKey } from '../../fixtures/registry' */
import { settle } from '../../test_helper/shadow-view';
/** @import { FakeHass } from '../../fixtures/types' */

/**
 * @param {FieldKey} key
 * @returns {string}
 */
const id = key => entityId('111', 1, key);

/**
 * A state change that needs a full redraw: the heating circuit uses another curve table.
 *
 * @param {FakeHass} hass
 * @returns {FakeHass}
 */
const otherTable = hass => withStates(hass, { [id('select')]: curveSelect('HC2', ['HC1', 'HC2']) });

describe('readings', () => {
  it('shows the readings', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.reading('outdoor')).toBe('5 °C');
    expect(view.reading('target')).toBe('32 °C');
    expect(view.reading('actual')).toBe('33 °C');
    expect(view.reading('points')).toBe('3');
    expect(view.mode).toBe('Point table is in use');
  });

  it('converts Fahrenheit and Kelvin to Celsius', async () => {
    const states = circuitStates('111', 1, {
      outdoor: temperature(41, '°F'),
      actual: temperature(306.15, 'K'),
      limitDay: temperature(64.4, '°F', { min: 32, max: 86, step: 0.9 }),
    });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.reading('outdoor')).toBe('5 °C');
    expect(view.reading('actual')).toBe('33 °C');
    const day = view.limitInput('limitDay');
    expect(Number(day.value)).toBeCloseTo(18);
    expect(Number(day.min)).toBeCloseTo(0);
    expect(Number(day.max)).toBeCloseTo(30);
    expect(Number(day.step)).toBeCloseTo(0.5);
  });

  it('reads numbers with a decimal comma', async () => {
    const states = circuitStates('111', 1, { outdoor: temperature('4,5') });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.reading('outdoor')).toBe('4.5 °C');
  });

  it.each([
    ['off', 'Hybrid active · saved point table'],
    ['unavailable', 'Curve mode unavailable'],
  ])('shows the curve mode %s', async (state, mode) => {
    const states = circuitStates('111', 1, { useCurve: plain(state) });

    const view = await CardView.create({}, createHass({ states }));

    expect(view.mode).toBe(mode);
  });

  it('lists the missing entities', async () => {
    const registry = controllerEntities('entry-1', '111').filter(entry => entry.entity_id !== id('target'));
    const states = circuitStates('111', 1, { actual: plain('unavailable') });
    delete states[id('outdoor')];

    const view = await CardView.create({}, createHass({ registry, states }));

    expect(view.reading('actual')).toBe('—');
    expect(view.missingEntities).toEqual([id('outdoor'), id('actual'), 'flow_setpoint (not mapped)']);
    expect(view.text('details p')).toBe('These entities are missing or do not yet provide values:');
  });

  it('explains the missing action of the integration', async () => {
    const view = await CardView.create({}, createHass({ pointService: false }));

    expect(view.setupHints?.textContent).toContain('The keba_keenergy.set_heating_curve_points action is unavailable.');
    expect(view.missingEntities).toEqual([]);
  });

  it('shows no setup hints when everything is there', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.setupHints).toBeNull();
  });

  it('shows the card in German', async () => {
    const view = await CardView.create({ language: 'de' }, createHass());

    expect(view.title).toBe('Heizkurve KeEnergy');
    expect(view.text('#save-points')).toBe('Punkte speichern');
    expect(view.reading('target')).toBe('32 °C');
  });

  it('formats the numbers like Home Assistant', async () => {
    const hass = createHass({ states: circuitStates('111', 1, { outdoor: temperature(4.5) }) });

    const view = await CardView.create({}, { ...hass, locale: { language: 'en', number_format: 'decimal_comma' } });

    expect(view.reading('outdoor')).toBe('4,5 °C');
  });

  it('explains the display limits', async () => {
    const lower = await CardView.create({ flow_min: 20 }, createHass());
    const upper = await CardView.create({ flow_max: 50 }, createHass());

    expect(lower.notice).toBe('Display limits: 20 °C to no maximum. Limits apply to the chart only. '
      + 'The controller target is read separately from KeEnergy.');
    expect(upper.notice).toContain('Display limits: no minimum to 50 °C.');
    expect(upper.legend).toContain('Flow min / max');
  });

  it('explains the chart without display limits', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.notice)
      .toBe('Saved table with linearly interpolated values. The controller target is read separately from KeEnergy.');
    expect(view.legend).not.toContain('Flow min / max');
  });
});

describe('updates', () => {
  it('updates the readings without a redraw', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const shell = view.get('ha-card');

    view.hass = withStates(hass, { [id('outdoor')]: temperature(-3) });

    expect(view.reading('outdoor')).toBe('-3 °C');
    expect(view.get('ha-card')).toBe(shell);
  });

  it('updates the points without a redraw', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const shell = view.get('ha-card');
    const points = [{ outdoor: -10, flow: 40 }, { outdoor: 10, flow: 30 }];

    view.hass = withStates(hass, { [id('curve')]: curveSensor('HC1', points) });

    expect(view.get('ha-card')).toBe(shell);
    expect(view.pointRows).toHaveLength(2);
    expect(view.pointInput(0, 'outdoor').value).toBe('-10');
  });

  it('redraws when the view changes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const shell = view.get('ha-card');

    view.hass = otherTable(hass);

    expect(view.get('ha-card')).not.toBe(shell);
  });

  it('keeps an open select and redraws when it closes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const select = view.curveSelect;
    select.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));

    view.hass = withStates(hass, { [id('select')]: curveSelect('HC1', ['HC1', 'HC4']) });

    expect(view.curveSelect).toBe(select);

    select.dispatchEvent(new Event('blur'));
    view.root.dispatchEvent(new Event('click'));
    await settle();

    expect(view.curveSelect).not.toBe(select);
    expect(view.curveOptions.map(option => option.value)).toEqual(['HC1', 'HC4']);
  });

  it('ignores other mouse buttons and disabled selects', async () => {
    const hass = createHass();
    const view = await CardView.create({ config_entry: 'entry-1' }, hass);
    view.curveSelect.dispatchEvent(new MouseEvent('pointerdown', { button: 2 }));
    view.controllerSelect.dispatchEvent(new MouseEvent('pointerdown', { button: 0 }));
    const shell = view.get('ha-card');

    view.hass = otherTable(hass);

    expect(view.get('ha-card')).not.toBe(shell);
  });

  it.each([
    ['#controller-select', 'focus', new Event('focus')],
    ['#controller-select', 'pointerdown', new MouseEvent('pointerdown', { button: 0 })],
    ['#circuit-select', 'focus', new Event('focus')],
    ['#circuit-select', 'pointerdown', new MouseEvent('pointerdown', { button: 0 })],
    ['#curve-select', 'focus', new Event('focus')],
  ])('keeps %s after %s', async (selector, _, event) => {
    const registry = [...controllerEntities('entry-1', '111', 2), ...controllerEntities('entry-2', '222')];
    const hass = createHass({ registry });
    const view = await CardView.create({}, hass);
    const select = view.get(selector);
    select.dispatchEvent(event);

    view.hass = otherTable(hass);

    expect(view.get(selector)).toBe(select);

    select.dispatchEvent(new Event('blur'));
    view.root.dispatchEvent(new Event('click'));
    await settle();

    expect(view.get(selector)).not.toBe(select);
  });

  it('keeps a focused input and redraws when it loses the focus', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const field = view.limitInput('limitDay');
    field.focus();

    view.hass = otherTable(hass);

    expect(view.limitInput('limitDay')).toBe(field);

    field.blur();
    await settle();

    expect(view.limitInput('limitDay')).not.toBe(field);
  });

  it('waits for a button click before a redraw', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const field = view.limitInput('limitDay');
    field.focus();
    view.hass = otherTable(hass);

    const focusout = new FocusEvent('focusout', { bubbles: true, composed: true, relatedTarget: view.saveLimitsButton });
    await view.dispatch(field, focusout);

    expect(view.limitInput('limitDay')).toBe(field);
  });

  it('keeps the scroll position of the point table', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    view.tableWrap.scrollTop = 40;

    view.hass = withLanguage(hass, 'de');

    expect(view.tableWrap.scrollTop).toBe(40);

    await view.setPoint(0, 'flow', 44);

    expect(view.tableWrap.scrollTop).toBe(40);
  });

  it('keeps an empty heating limit when the points change', async () => {
    const view = await CardView.create({}, createHass());
    const shell = view.get('ha-card');
    await view.setLimit('limitDay', '');

    await view.addPoint();

    expect(view.get('ha-card')).toBe(shell);
    expect(view.limitInput('limitDay').value).toBe('');
  });

  it('draws the chart in the dark theme', async () => {
    const view = await CardView.create({}, { ...createHass(), themes: { darkMode: true } });

    expect(view.chart.svg.getAttribute('style')).toContain('--curve-line:#65B4B0');
  });
});
