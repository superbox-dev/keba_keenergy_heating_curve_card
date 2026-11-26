import { describe, expect, it } from 'vitest';
import '../../../src/card';
import { CardView } from '../../test_helper/card-view';
import { answerRegistry, createHass, withLanguage } from '../../fixtures/hass';
import { PASSWORD_HASH } from '../../fixtures/password';
import {
  circuitStates,
  controllerEntities,
  curveSelect,
  curveSensor,
  devices,
  entityId,
  registryEntry,
} from '../../fixtures/registry';
import { settle } from '../../test_helper/shadow-view';
import type { CardConfig, FakeHass } from '../../fixtures/types';

/** Two controllers, `111` with two heating circuits on HC1 and HC2, `222` with one on HC3. */
const twoControllers = (): FakeHass => createHass({
  registry: [...controllerEntities('entry-1', '111', 2), ...controllerEntities('entry-2', '222')],
  deviceList: [...devices('111', 2), ...devices('222')],
  states: {
    ...circuitStates('111', 1),
    ...circuitStates('111', 2, { select: curveSelect('HC2'), curve: curveSensor('HC2') }),
    ...circuitStates('222', 1, { select: curveSelect('HC3'), curve: curveSensor('HC3') }),
  },
});

/** A registry with a second curve sensor of the same heating circuit. */
const ambiguousRegistry = () => [
  ...controllerEntities('entry-1', '111'),
  registryEntry('entry-1', '111', 1, 'curve', { entity_id: 'sensor.second_curve' }),
];

const CONTROLLER_MISSING = 'The configured KeEnergy controller was not found. Check the card configuration.';
const CIRCUIT_MISSING = 'The selected heating circuit was not found on this controller.';

describe('automatic selection', () => {
  it('shows the first controller and heating circuit', async () => {
    const view = await CardView.create({}, twoControllers());

    expect(view.controllerOptions).toEqual([
      { value: 'entry-1', label: 'KeEnergy controller · 111', selected: true },
      { value: 'entry-2', label: 'KeEnergy controller · 222', selected: false },
    ]);
    expect(view.circuitOptions).toEqual([
      { value: '1', label: 'Heating circuit 1 · Circuit device 1', selected: true },
      { value: '2', label: 'Heating circuit 2 · Circuit device 2', selected: false },
    ]);
    expect(view.controllerSelect.disabled).toBe(false);
    expect(view.circuitSelect.disabled).toBe(false);
    expect(view.badge).toBe('HC1');
    expect(view.mappingError).toBeUndefined();
  });

  it('disables the selects with one controller and circuit', async () => {
    const view = await CardView.create({}, createHass());

    expect(view.controllerSelect.disabled).toBe(true);
    expect(view.circuitSelect.disabled).toBe(true);
  });

  it('switches the controller without sending anything', async () => {
    const hass = twoControllers();
    const view = await CardView.create({}, hass);

    await view.selectController('entry-2');

    expect(view.controllerOptions[1].selected).toBe(true);
    expect(view.circuitOptions).toEqual([{ value: '1', label: 'Heating circuit 1 · Circuit device 1', selected: true }]);
    expect(view.badge).toBe('HC3');
    expect(view.message).toBe('View changed. No values were sent.');
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('switches the heating circuit', async () => {
    const view = await CardView.create({}, twoControllers());

    await view.selectCircuit('2');

    expect(view.circuitOptions[1].selected).toBe(true);
    expect(view.badge).toBe('HC2');
  });

  it('ignores unknown controllers and heating circuits', async () => {
    const view = await CardView.create({}, twoControllers());

    await view.selectController('entry-9');
    await view.selectCircuit('9');

    expect(view.message).toBe('');
    expect(view.badge).toBe('HC1');
  });

  it('keeps the view with unsaved changes', async () => {
    const view = await CardView.create({}, twoControllers());
    await view.setLimit('limitDay', 20);

    await view.selectController('entry-2');

    expect(view.message).toBe('Save changes or discard the draft before switching controller or heating circuit.');
    expect(view.controllerSelect.value).toBe('entry-1');

    await view.selectCircuit('2');

    expect(view.circuitSelect.value).toBe('1');
  });

  it('locks the editing when the view changes', async () => {
    const view = await CardView.create({ edit_password_hash: PASSWORD_HASH }, twoControllers());
    await view.unlock();

    await view.selectCircuit('2');

    expect(view.message).toBe('View changed. Please unlock editing again.');
    expect(view.query('#unlock-editor')).not.toBeNull();
  });

  it('marks a controller that disappeared', async () => {
    const hass = twoControllers();
    const view = await CardView.create({}, hass);
    await view.selectController('entry-2');
    answerRegistry(hass, controllerEntities('entry-1', '111', 2));

    await view.reloadRegistry();

    expect(view.controllerOptions[0]).toEqual({ value: 'entry-2', label: 'Selected controller is missing', selected: true });
    expect(view.mappingError).toBe(CONTROLLER_MISSING);
  });

  it('marks a heating circuit that disappeared', async () => {
    const hass = twoControllers();
    const view = await CardView.create({}, hass);
    await view.selectCircuit('2');
    answerRegistry(hass, controllerEntities('entry-1', '111'));

    await view.reloadRegistry();

    expect(view.circuitOptions[0]).toEqual({ value: '2', label: 'Selected heating circuit is missing', selected: true });
    expect(view.mappingError).toBe(CIRCUIT_MISSING);
  });
});

describe('pinned selection', () => {
  it('pins the controller with config_entry', async () => {
    const view = await CardView.create({ config_entry: 'entry-2' }, twoControllers());

    expect(view.badge).toBe('HC3');
    expect(view.controllerSelect.disabled).toBe(true);

    await view.selectController('entry-1');

    expect(view.badge).toBe('HC3');
  });

  it('pins the controller with the serial number', async () => {
    const view = await CardView.create({ serial: '222' }, twoControllers());

    expect(view.badge).toBe('HC3');
  });

  it('pins the heating circuit', async () => {
    const view = await CardView.create({ circuit: '2' }, twoControllers());

    expect(view.badge).toBe('HC2');
    expect(view.circuitSelect.disabled).toBe(true);

    await view.selectCircuit('1');

    expect(view.badge).toBe('HC2');
  });

  it('pins controller and heating circuit with the entities', async () => {
    const config = { entities: { curve_sensor: entityId('111', 2, 'curve') } };

    const view = await CardView.create(config, twoControllers());

    expect(view.badge).toBe('HC2');
    expect(view.controllerSelect.disabled).toBe(true);
    expect(view.circuitSelect.disabled).toBe(true);
  });

  it('accepts a heating circuit that matches the entities', async () => {
    const config = { circuit: '2', entities: { curve_sensor: entityId('111', 2, 'curve') } };

    const view = await CardView.create(config, twoControllers());

    expect(view.mappingError).toBeUndefined();
  });

  it('ignores temperature entities for the pinning', async () => {
    const config = { entities: { outdoor_temperature: 'sensor.other_outdoor' } };

    const view = await CardView.create(config, twoControllers());

    expect(view.badge).toBe('HC1');
    expect(view.mappingError).toBeUndefined();
  });
});

describe('mapping errors', () => {
  it.each<[string, CardConfig, string]>([
    [
      'entities of two controllers',
      { entities: { curve_sensor: entityId('111', 1, 'curve'), curve_select: entityId('222', 1, 'select') } },
      'Control entities belong to different controllers. Check the card mapping.',
    ],
    ['an unknown serial number', { serial: '999' }, CONTROLLER_MISSING],
    [
      'config_entry of another controller',
      { config_entry: 'entry-2', entities: { curve_sensor: entityId('111', 1, 'curve') } },
      'config_entry and the entity mapping belong to different controllers.',
    ],
    [
      'entities of two heating circuits',
      { entities: { curve_sensor: entityId('111', 1, 'curve'), curve_select: entityId('111', 2, 'select') } },
      'Control entities belong to different heating circuits.',
    ],
    [
      'a heating circuit that does not match the entities',
      { circuit: '1', entities: { curve_sensor: entityId('111', 2, 'curve') } },
      'circuit and the entity mapping belong to different heating circuits.',
    ],
    ['an unknown heating circuit', { circuit: '5' }, CIRCUIT_MISSING],
  ])('shows %s', async (_, config, expected) => {
    const view = await CardView.create(config, twoControllers());

    expect(view.mappingError).toBe(expected);
  });

  it('shows ambiguous entities', async () => {
    const view = await CardView.create({}, createHass({ registry: ambiguousRegistry() }));

    expect(view.mappingError).toBe('Ambiguous entities: curve. Please set entities explicitly.');
  });

  it('resolves ambiguous entities with the entities option', async () => {
    const config = { entities: { curve_sensor: entityId('111', 1, 'curve') } };

    const view = await CardView.create(config, createHass({ registry: ambiguousRegistry() }));

    expect(view.mappingError).toBeUndefined();
  });

  it('rejects control entities of other integrations', async () => {
    const registry = [
      ...controllerEntities('entry-1', '111'),
      { entity_id: 'number.other_day', platform: 'other', config_entry_id: 'entry-1' },
    ];

    const view = await CardView.create({ entities: { heating_limit_day: 'number.other_day' } }, createHass({ registry }));

    expect(view.mappingError).toBe('Control entities must come from keba_keenergy.');
  });

  it('rejects changes with a mapping error', async () => {
    const hass = createHass();
    const view = await CardView.create({ serial: '999' }, hass);

    expect(view.saveLimitsButton.disabled).toBe(true);

    await view.forceClick(view.saveLimitsButton);

    expect(view.message).toBe(CONTROLLER_MISSING);
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('shows that no heating circuit was found', async () => {
    const view = await CardView.create({}, createHass({ registry: [] }));

    expect(view.mappingError).toBe('No KeEnergy heating circuit with a heating curve table found.');
    expect(view.controllerOptions).toEqual([{ value: 'No controller found', label: 'No controller found', selected: true }]);
    expect(view.circuitOptions)
      .toEqual([{ value: 'No heating circuit found', label: 'No heating circuit found', selected: true }]);
    expect(view.content).toContain('Integration entry not found yet. Optionally set config_entry in the card.');
  });
});

describe('registry access', () => {
  const manualMapping = {
    curve_sensor: entityId('111', 1, 'curve'),
    curve_select: entityId('111', 1, 'select'),
    outdoor_temperature: entityId('111', 1, 'outdoor'),
  };

  it('explains a forbidden registry', async () => {
    const hass = createHass();
    hass.callWS.mockRejectedValue(Error('Unauthorized'));

    const view = await CardView.create({}, hass);

    expect(view.mappingError)
      .toBe('Cannot read the KeEnergy mapping. Open as an administrator or set entities and config_entry manually.');
    expect(view.registryHint).toBe('Registry: Unauthorized');
  });

  it('shows errors without message', async () => {
    const hass = createHass();
    hass.callWS.mockRejectedValue('denied');

    const view = await CardView.create({}, hass);

    expect(view.registryHint).toBe('Registry: denied');
  });

  it('explains an invalid registry', async () => {
    const view = await CardView.create({ language: 'de' }, createHass({ registry: null }));

    expect(view.registryHint).toBe('Verzeichnis: Entitätenverzeichnis nicht verfügbar.');
  });

  it('works with a manual mapping', async () => {
    const hass = createHass();
    hass.callWS.mockRejectedValue(Error('Unauthorized'));

    const view = await CardView.create({ config_entry: 'entry-1', entities: manualMapping }, hass);

    expect(view.mappingError).toBeUndefined();
    expect(view.badge).toBe('HC1');
  });

  it('needs config_entry for a manual mapping', async () => {
    const hass = createHass();
    hass.callWS.mockRejectedValue(Error('Unauthorized'));

    const view = await CardView.create({ entities: { curve_sensor: entityId('111', 1, 'curve') } }, hass);

    expect(view.mappingError).toContain('Cannot read the KeEnergy mapping.');
  });

  it('reads the registry again', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    expect(hass.callWS).toHaveBeenCalledTimes(2);

    await view.reloadRegistry();

    expect(hass.callWS).toHaveBeenCalledTimes(4);
  });

  it('reads the registry again from the setup hints', async () => {
    const hass = createHass({ pointService: false });
    const view = await CardView.create({}, hass);

    await view.click(view.retryButton);

    expect(hass.callWS).toHaveBeenCalledTimes(4);
  });

  it('reads the registry only once', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    view.hass = { ...hass };
    await settle();

    expect(hass.callWS).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['result', () => Promise.resolve([])],
    ['error', () => Promise.reject(Error('late'))],
  ])('ignores the %s of an outdated discovery', async (_, answer) => {
    let finish = () => {};
    const hass = createHass();
    const list = hass.callWS.getMockImplementation();
    hass.callWS.mockImplementationOnce(() => new Promise((resolve) => {
      finish = () => resolve(answer());
    }));
    const view = await CardView.create({ title: 'Old' }, hass);
    hass.callWS.mockImplementation(list!);

    view.setConfig({ title: 'New' });
    await settle();
    finish();
    await settle();

    expect(view.title).toBe('New');
    expect(view.mappingError).toBeUndefined();
  });

  it('translates the labels when the language changes', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    view.hass = withLanguage(hass, 'de');
    await settle();

    expect(view.circuitOptions[0].label).toBe('Heizkreis 1 · Circuit device 1');
  });

  it('changes the language before the registry is read', async () => {
    const hass = createHass();
    hass.callWS.mockReturnValue(new Promise(() => {}));
    const view = await CardView.create({}, hass);

    view.hass = withLanguage(hass, 'de');

    expect(view.title).toBe('Heizkurve KeEnergy');
  });

  it('does not read the registry without config', () => {
    const hass = createHass();
    const view = new CardView(document.createElement('keba-keenergy-heating-curve-card'));

    view.hass = hass;

    expect(view.root.innerHTML).toBe('');
    expect(hass.callWS).not.toHaveBeenCalled();
  });

  it('reads the registry once while it is loading', async () => {
    const hass = createHass();
    const view = await CardView.create({}, hass);

    view.reloadButton.click();
    view.reloadButton.click();
    await settle();

    expect(hass.callWS).toHaveBeenCalledTimes(4);
  });
});
