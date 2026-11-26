import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { createHass } from '../../fixtures/hass';
import { PASSWORD_HASH } from '../../fixtures/password';
/** @import { CardConfig, HeatingCurveCardClass } from '../../fixtures/types' */

/** @returns {HeatingCurveCardClass} */
const Card = () =>
  /** @type {HeatingCurveCardClass} */ (/** @type {unknown} */ (customElements.get('keba-keenergy-heating-curve-card')));

/** @param {CardConfig} config */
const configure = config => () => new (Card())().setConfig(config);

describe('setConfig', () => {
  it('accepts an empty config', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.title).toBe('KeEnergy heating curve');
  });

  it('shows the title', async () => {
    const view = await CardView.create({ title: 'Basement <b>' }, createHass());

    expect(view.title).toBe('Basement <b>');
  });

  it('accepts all options', () => {
    expect(configure({
      language: 'de',
      serial: ' 111 ',
      circuit: 2,
      config_entry: 'entry-1',
      flow_min: '20',
      flow_max: 60,
      edit_password_hash: PASSWORD_HASH,
      auto_lock_minutes: '10',
      x_min: -30,
      x_max: '30',
      x_step: 2.5,
      y_min: 10,
      y_max: 70,
      y_step: ' ',
      intermediate_step: 0.5,
      entities: { curve_sensor: 'sensor.curve', heating_limit_day: 'number.day' },
    })).not.toThrow();
  });

  it.each(/** @type {[CardConfig, string][]} */ ([
    [{ entities: [] }, 'entities must be a mapping.'],
    [{ entities: 'sensor.curve' }, 'entities must be a mapping.'],
    [{ language: 'fr' }, 'language must be auto, de or en.'],
    [{ circuit: '0' }, 'circuit must be a heating circuit number starting at 1.'],
    [{ circuit: 'one' }, 'circuit must be a heating circuit number starting at 1.'],
    [{ entities: { unknown: 'sensor.x' } }, 'Invalid entity mapping: unknown'],
    [{ entities: { curve_sensor: 'select.curve' } }, 'Invalid entity mapping: curve_sensor'],
    [{ entities: { curve_sensor: 5 } }, 'Invalid entity mapping: curve_sensor'],
    [{ edit_password_hash: 'secret' }, 'edit_password_hash must be a valid PBKDF2-SHA256 verifier.'],
    [{ edit_password_hash: PASSWORD_HASH.replace('$100000$', '$99999$') }, 'edit_password_hash must be a valid'],
    [{ edit_password_hash: PASSWORD_HASH.replace('$100000$', '$1000001$') }, 'edit_password_hash must be a valid'],
    [{ auto_lock_minutes: 0 }, 'auto_lock_minutes must be between 1 and 60 minutes.'],
    [{ auto_lock_minutes: 61 }, 'auto_lock_minutes must be between 1 and 60 minutes.'],
    [{ auto_lock_minutes: 'soon' }, 'auto_lock_minutes must be between 1 and 60 minutes.'],
    [{ flow_min: 9 }, 'flow_min must be between 10 and 90 °C or empty.'],
    [{ flow_max: 91 }, 'flow_max must be between 10 and 90 °C or empty.'],
    [{ flow_max: 'hot' }, 'flow_max must be between 10 and 90 °C or empty.'],
    [{ flow_min: 50, flow_max: 50 }, 'flow_min must be less than flow_max.'],
    [{ x_min: -101 }, 'x_min must be between -100 and 100 °C and have at most two decimal places.'],
    [{ y_max: 151 }, 'y_max must be between 0 and 150 °C and have at most two decimal places.'],
    [{ x_step: 0.001 }, 'x_step must be between 0.01 and 200 °C and have at most two decimal places.'],
    [{ y_step: 1.234 }, 'y_step must be between 0.01 and 150 °C and have at most two decimal places.'],
    [{ x_min: true }, 'x_min must be between'],
    [{ x_min: 'cold' }, 'x_min must be between'],
    [{ x_min: 10, x_max: 10 }, 'x_min must be less than x_max.'],
    [{ y_min: 50, y_max: 20 }, 'y_min must be less than y_max.'],
    [{ intermediate_step: 0 }, 'intermediate_step must be between 0.01 and 200 °C'],
  ]))('rejects %o', (config, error) => {
    expect(configure(config)).toThrow(error);
  });

  it('translates the errors with the configured language', () => {
    expect(configure({ language: 'de', flow_min: 5 }))
      .toThrow('flow_min muss zwischen 10 und 90 °C liegen oder leer sein.');
  });

  it('shows the new config after a change', async () => {
    const view = await CardView.create({ title: 'Old' }, createHass());

    view.setConfig({ title: 'New' });

    expect(view.title).toBe('New');
  });

  it('renders nothing without hass', async () => {
    const view = await CardView.create({});

    expect(view.root.innerHTML).toBe('');
  });
});

describe('card API', () => {
  it('has the size of the card', () => {
    const card = new (Card())();

    expect(card.getCardSize()).toBe(11);
    expect(card.getGridOptions()).toEqual({ columns: 'full', min_columns: 6 });
  });

  it('has an empty stub config', () => {
    expect(Card().getStubConfig()).toEqual({});
  });

  it('creates the editor', () => {
    expect(Card().getConfigElement().localName).toBe('keba-keenergy-heating-curve-card-editor');
  });

  it('shows the version', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.content).toContain('KeEnergy heating curve · General version 0.0.0-test');
    expect(view.query('ha-card')).not.toBeNull();
  });
});
