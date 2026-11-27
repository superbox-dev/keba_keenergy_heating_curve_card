import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass, withStates } from '../../fixtures/hass';
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
    expect(Number(view.limitValue('limitDay'))).toBeCloseTo(18);
    const day = view.limitField('limitDay').selector?.number;
    expect(Number(day?.min)).toBeCloseTo(0);
    expect(Number(day?.max)).toBeCloseTo(30);
    expect(Number(day?.step)).toBeCloseTo(0.5);
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

  it('shows an unknown reading like Home Assistant and its value when it arrives', async () => {
    const hass = createHass({ states: circuitStates('111', 1, { actual: plain('unknown') }) });
    const view = await CardView.create({}, hass);

    expect(view.reading('actual')).toBe('Unknown');
    expect(view.readingMissing('actual')).toBe(true);

    view.hass = withStates(hass, { [id('actual')]: temperature(31) });

    expect(view.reading('actual')).toBe('31 °C');
    expect(view.readingMissing('actual')).toBe(false);
  });

  it('lists the missing entities', async () => {
    const registry = controllerEntities('entry-1', '111').filter(entry => entry.entity_id !== id('target'));
    const states = circuitStates('111', 1, { actual: plain('unavailable') });
    delete states[id('outdoor')];

    const view = await CardView.create({}, createHass({ registry, states }));

    expect(view.reading('actual')).toBe('Unavailable');
    expect(view.reading('outdoor')).toBe('Unavailable');
    expect(view.missingEntities).toEqual([
      `Outdoor temperature · ${id('outdoor')}`,
      `Actual flow · ${id('actual')}`,
      'Target flow · flow_setpoint (not mapped)',
    ]);
    expect(view.text('#setup-details p')).toBe('These entities are missing or do not yet provide values:');
    expect(view.setupHints?.getAttribute('alert-type')).toBe('warning');
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

    expect(view.title).toBe('Heizkurve KEBA KeEnergy');
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
      + 'The controller target is read separately from KEBA KeEnergy.');
    expect(upper.notice).toContain('Display limits: no minimum to 50 °C.');
    expect(upper.legend).toContain('Flow min / max');
  });

  it('explains the chart without display limits', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.notice)
      .toBe('Saved table with linearly interpolated values. The controller target is read separately from KEBA KeEnergy.');
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
    expect(view.pointValues[0]).toEqual(['-10', '40']);
  });

  it('redraws when the view changes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const shell = view.get('ha-card');

    view.hass = otherTable(hass);

    expect(view.get('ha-card')).not.toBe(shell);
  });

  it('keeps the open curve table menu and redraws when it closes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const form = view.cardForm('curve');
    form.dispatchEvent(new Event('focusin'));

    view.hass = withStates(hass, { [id('select')]: curveSelect('HC1', ['HC1', 'HC4']) });

    expect(view.cardForm('curve')).toBe(form);

    form.dispatchEvent(new Event('focusout'));
    view.root.dispatchEvent(new Event('click'));
    await settle();

    expect(view.cardForm('curve')).not.toBe(form);
    expect(view.curveOptions.map(option => option.value)).toEqual(['HC1', 'HC4']);
  });

  it.each(['controller', 'circuit', 'limits'])('keeps the %s form while it has the focus', async (kind) => {
    const registry = [...controllerEntities('entry-1', '111', 2), ...controllerEntities('entry-2', '222')];
    const hass = createHass({ registry });
    const view = await CardView.create({}, hass);
    const form = view.cardForm(/** @type {'controller' | 'circuit' | 'limits'} */ (kind));
    form.dispatchEvent(new Event('focusin'));

    view.hass = otherTable(hass);

    expect(view.get(`#${kind}-form`)).toBe(form);

    form.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
    await settle();

    expect(view.get(`#${kind}-form`)).not.toBe(form);
  });

  it('waits for a button click before a redraw', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);
    const form = view.cardForm('limits');
    form.dispatchEvent(new Event('focusin'));
    view.hass = otherTable(hass);

    const focusout = new FocusEvent('focusout', { bubbles: true, composed: true, relatedTarget: view.saveLimitsButton });
    await view.dispatch(form, focusout);

    expect(view.cardForm('limits')).toBe(form);
  });

  it('keeps an empty heating limit when the points change', async () => {
    const view = await CardView.create({}, createHass());
    const shell = view.get('ha-card');
    await view.setLimit('limitDay', '');

    await view.addPoint();

    expect(view.get('ha-card')).toBe(shell);
    expect(view.limitValue('limitDay')).toBeUndefined();
  });

  it('draws the chart in the dark theme', async () => {
    const view = await CardView.create({}, { ...createHass(), themes: { darkMode: true } });

    expect(view.chart.svg.getAttribute('style')).toContain('--curve-line:#65B4B0');
  });
});
