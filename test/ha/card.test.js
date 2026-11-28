// The built card in a dashboard of Home Assistant in Docker: the real frontend, `ha-form`, the theme and the real
// integration keba_keenergy. Its control units are the fakes of test/ha/controller.py, no device is ever written.
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DASHBOARD, URL, entityState, testUser } from './dashboard';
import { PASSWORD, PASSWORD_HASH } from '../fixtures/password';
import { DashboardView } from '../test_helper/dashboard-view';

/** Time for a write, the integration writes after its running update, e.g. of the points of a new curve table. */
const WRITE = { timeout: 15_000 };

/** The control unit with two heating circuits and enabled entities, the first one of the card. */
const CONTROLLER_1 = { serial: '10000001', host: '127.0.0.1:8091' };

/** The control unit with the entities that the integration adds disabled, like after the setup by a user. */
const CONTROLLER_2 = { serial: '10000002', host: '127.0.0.1:8092' };

/** Entities of heating circuit 1 of the first control unit. */
const CIRCUIT_1 = {
  table: 'select.keba_keenergy_10000001_heat_circuit_heating_curve_1',
  curve: 'sensor.keba_keenergy_10000001_heat_circuit_heating_curve_1',
  limitDay: 'number.keba_keenergy_10000001_heat_circuit_heating_limit_day_1',
};

/** Entities of heating circuit 2 of the first control unit. */
const CIRCUIT_2 = {
  table: 'select.keba_keenergy_10000001_heat_circuit_heating_curve_2',
  limitNight: 'number.keba_keenergy_10000001_heat_circuit_heating_limit_night_2',
};

/** The curve table selection of the second control unit, the integration adds it disabled. */
const DISABLED_TABLE = 'select.keba_keenergy_10000002_heat_circuit_heating_curve';

/** @type {DashboardView} */
let view;

beforeEach(async () => {
  view = await DashboardView.open(URL, DASHBOARD, testUser());
  await view.card.locator('#limits-form ha-input input').first().waitFor();
});

afterEach(async () => {
  await view.close();
});

describe('dashboard', () => {
  it('shows the card without an error card', async () => {
    expect(await view.errorCards.count()).toBe(0);
  });

  it('finds the first controller and heating circuit and shows their readings', async () => {
    expect(await view.selected('controller')).toBe(await entryOf(CONTROLLER_1.host));
    expect(await view.selected('circuit')).toBe('1');
    expect(await view.curveTable).toBe('HC6');
    expect(await view.reading('outdoor')).toBe('20.5 °C');
    expect(await view.reading('target')).toBe('26.6 °C');
    expect(await view.reading('actual')).toBe('22.2 °C');
    expect(await view.reading('points')).toBe('3');
    expect(await view.points()).toEqual([['-20', '50'], ['0', '40'], ['20', '30']]);
  });
});

describe('view', () => {
  it('switches the heating circuit without writing anything', async () => {
    const before = await entityState(CIRCUIT_2.table);

    await view.choose('circuit', 'Heating circuit 2');

    await expect.poll(() => view.curveTable).toBe('HC7');
    expect((await entityState(CIRCUIT_2.table)).last_changed).toBe(before.last_changed);
  });

  it('switches the controller', async () => {
    await view.choose('controller', CONTROLLER_2.serial);

    await expect.poll(() => view.selected('controller')).toBe(await entryOf(CONTROLLER_2.host));
    expect(await view.curveTable).toBe('HC4');
  });

  it('reloads the mapping', async () => {
    await view.press('reload-registry');

    await expect.poll(() => view.curveTable).toBe('HC6');
    expect(await view.errorCards.count()).toBe(0);
  });
});

describe('writes', () => {
  it('assigns a curve table to the heating circuit', async () => {
    await view.choose('circuit', 'Heating circuit 2');
    await expect.poll(() => view.curveTable).toBe('HC7');

    await view.choose('curve', 'HC3');

    await expect.poll(async () => (await entityState(CIRCUIT_2.table)).state, WRITE).toBe('HC3');
    await expect.poll(() => view.curveTable).toBe('HC3');
    // The integration reads the points of the assigned table with its next update.
    await expect.poll(() => view.points(), { timeout: 45_000 }).toEqual([['-20', '47'], ['0', '37'], ['20', '27']]);
  }, 60_000);

  it('saves a heating limit', async () => {
    await view.choose('circuit', 'Heating circuit 2');
    await expect.poll(() => view.curveTable).not.toBe('HC6');

    await view.setLimit('night', 16.5);
    await view.press('save-settings');

    await expect.poll(async () => (await entityState(CIRCUIT_2.limitNight)).state, WRITE).toBe('16.5');
    expect(await view.text('#message')).toBe('');
  });

  it('saves the points of the curve table', async () => {
    await view.setPoint(0, 'flow', 55);
    await expect.poll(() => view.text('#curve-label')).toBe('Point table · Draft');

    await view.press('save-points');

    await expect.poll(async () => (await entityState(CIRCUIT_1.curve)).attributes.points, WRITE).toEqual([
      { outdoor: -20, flow: 55 },
      { outdoor: 0, flow: 40 },
      { outdoor: 20, flow: 30 },
    ]);
    await expect.poll(() => view.text('#curve-label')).toBe('Point table');
  });

  it('writes nothing for a curve table that is already assigned', async () => {
    const before = await entityState(CIRCUIT_1.table);

    await view.choose('curve', before.state);

    expect((await entityState(CIRCUIT_1.table)).last_changed).toBe(before.last_changed);
  });
});

describe('draft', () => {
  it('adds and removes points and discards the draft', async () => {
    const saved = await view.points();

    await view.press('add-point');
    await expect.poll(async () => (await view.points()).length).toBe(saved.length + 1);
    await view.removePoint(0);
    await expect.poll(async () => (await view.points()).length).toBe(saved.length);
    await view.press('reset');

    await expect.poll(() => view.points()).toEqual(saved);
    expect(await view.text('#message')).toBe('Draft discarded.');
  });

  it('saves nothing for a heating limit that was only changed in the field', async () => {
    const before = await entityState(CIRCUIT_1.limitDay);

    await view.setLimit('day', 22);

    expect(await view.text('#message')).toBe('Settings changed · not saved yet');
    expect((await entityState(CIRCUIT_1.limitDay)).state).toBe(before.state);
  });
});

describe('options', () => {
  it('shows the card in German', async () => {
    await view.configure({ language: 'de' });

    await expect.poll(() => view.text('h2')).toBe('Heizkurve');
    expect(await view.text('ha-button#save-points')).toBe('Punkte speichern');
  });

  it('draws the display limits of the flow temperature', async () => {
    await view.configure({ flow_min: 25, flow_max: 45 });

    await expect.poll(() => view.chartLines('limit.flow-min').count()).toBe(1);
    expect(await view.chartLines('limit.flow-max').count()).toBe(1);
    expect(await view.text('.notice')).toContain('Display limits: 25 °C to 45 °C.');
  });

  it('shows the chart and the settings in one column in a narrow window', async () => {
    expect(await view.layoutColumns()).toBe(2);

    await view.resize(700);

    await expect.poll(() => view.layoutColumns()).toBe(1);
  });
});

describe('password', () => {
  beforeEach(async () => {
    await view.configure({ edit_password_hash: PASSWORD_HASH });
    await expect.poll(() => view.alertTitle('lock-status')).toBe('Editing locked');
  });

  it('unlocks with the password', async () => {
    await view.unlock(PASSWORD);

    await expect.poll(() => view.alertTitle('lock-status'), { timeout: 15_000 }).toBe('Editing unlocked');
  });

  it('rejects a wrong password', async () => {
    await view.unlock('wrong');

    await expect.poll(() => view.text('.unlock-error'), { timeout: 15_000 }).toBe('Incorrect password.');
    expect(await view.alertTitle('lock-status')).toBe('Editing locked');
  });
});

describe('editor', () => {
  it('shows the forms of Home Assistant', async () => {
    await view.openEditor({});

    expect(await view.selectors('general').count()).toBe(4);
    expect(await view.header('chart-axes')).toBe('Chart axes');
    expect(await view.header('password')).toBe('Password protection');
  });

  it('sends a changed title', async () => {
    await view.openEditor({});

    await view.type('general', 0, 'Basement');

    await expect.poll(() => view.configs()).toContainEqual({ title: 'Basement' });
  });
});

// Last, it enables the entities of the second control unit for good.
describe('setup', () => {
  it('names the missing entities and enables the disabled ones', async () => {
    await view.choose('controller', CONTROLLER_2.serial);
    await expect.poll(() => view.shows('#enable-panel')).toBe(true);
    expect(await view.alertTitle('setup-details')).toBe('Check entities / setup');

    await view.press('enable-editors');

    await expect.poll(() => view.text('#message')).toMatch(/^\d+ entities enabled\./);
    // Home Assistant reloads the integration 30 s after enabling entities.
    await expect.poll(async () => (await entityState(DISABLED_TABLE)).state, { timeout: 60_000 }).toBe('HC4');
  }, 90_000);
});

/**
 * The config entry of a control unit, the card selects controllers by it.
 *
 * @param {string} host Host of the fake control unit, the config flow names the entry after it.
 * @returns {Promise<string>}
 */
async function entryOf(host) {
  const response = await fetch(`${URL}/api/config/config_entries/entry?domain=keba_keenergy`, {
    headers: { Authorization: `Bearer ${testUser().access_token}` },
  });
  const entries = /** @type {{ entry_id: string, title: string }[]} */ (await response.json());
  return entries.find(entry => entry.title.endsWith(`(${host})`))?.entry_id ?? '';
}
