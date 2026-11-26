import { describe, expect, it, vi } from 'vitest';
import { discoverControllers, loadRegistry, parseEntity } from '../../src/discovery';
import { controllerEntities, devices, registryEntry } from '../fixtures/registry';
/** @import { EntityRegistryEntry } from '../fixtures/types' */

/**
 * @typedef {object} Circuit
 * @property {string} id
 * @property {string} label
 * @property {Record<string, string>} map
 * @property {string[]} ambiguous
 */

/**
 * @typedef {object} Controller
 * @property {string} id
 * @property {string} serial
 * @property {string} label
 * @property {string} outdoor
 * @property {Circuit[]} circuits
 */

/**
 * @param {Parameters<typeof discoverControllers>} args
 * @returns {Controller[]}
 */
const discover = (...args) => discoverControllers(...args);

/**
 * A registry entry of the integration with a renamed entity ID, discovery reads only the unique ID.
 *
 * @param {string} uniqueId
 * @param {Partial<EntityRegistryEntry>} extra
 * @returns {EntityRegistryEntry}
 */
const entity = (uniqueId, domain = 'sensor', extra = {}) => ({
  entity_id: `${domain}.renamed_by_user`,
  unique_id: uniqueId,
  platform: 'keba_keenergy',
  config_entry_id: 'entry-1',
  ...extra,
});

/**
 * @param {string} text
 * @returns {string}
 */
const brackets = text => `<${text}>`;

describe('parseEntity', () => {
  it('reads circuit 1 without a number', () => {
    expect(parseEntity(entity('111_heat_circuit_heating_curve'))).toEqual({ serial: '111', circuit: '1', key: 'curve' });
  });

  it('reads the circuit number at the end', () => {
    expect(parseEntity(entity('111_heat_circuit_heating_curve_2', 'select')))
      .toEqual({ serial: '111', circuit: '2', key: 'select' });
  });

  it('reads the circuit number in the middle', () => {
    expect(parseEntity(entity('111_heat_circuit_3_flow_temperature')))
      .toEqual({ serial: '111', circuit: '3', key: 'actual' });
  });

  it('rejects two circuit numbers', () => {
    expect(parseEntity(entity('111_heat_circuit_2_heating_curve_3'))).toBeNull();
  });

  it.each([
    ['keba_keenergy_111_heat_circuit_heating_curve', 'sensor', 'curve'],
    ['111_heating_circuit_heating_curve', 'sensor', 'curve'],
    ['111_heat_circuit_use_curve_table', 'switch', 'useCurve'],
    ['111_heat_circuit_mixer_flow_temperature', 'sensor', 'actual'],
  ])('reads the legacy unique ID %s', (uniqueId, domain, key) => {
    expect(parseEntity(entity(uniqueId, domain))).toEqual({ serial: '111', circuit: '1', key });
  });

  it('reads the outdoor temperature of the controller', () => {
    expect(parseEntity(entity('111_outdoor_temperature'))).toEqual({ serial: '111', key: 'outdoor' });
  });

  it('ignores an outdoor temperature that is no sensor', () => {
    expect(parseEntity(entity('111_outdoor_temperature', 'number'))).toBeNull();
  });

  it.each([
    ['111_heat_circuit_flow_temperature_offset', 'sensor'],
    ['111_heat_pump_flow_temperature', 'sensor'],
    ['111_heat_circuit_heating_curve', 'number'],
  ])('ignores the unknown entity %s (%s)', (uniqueId, domain) => {
    expect(parseEntity(entity(uniqueId, domain))).toBeNull();
  });

  it('ignores other integrations', () => {
    expect(parseEntity(entity('111_heat_circuit_heating_curve', 'sensor', { platform: 'other' }))).toBeNull();
  });

  it('handles a missing entity ID and unique ID', () => {
    expect(parseEntity({ platform: 'keba_keenergy' })).toBeNull();
  });
});

describe('discoverControllers', () => {
  it('finds the controllers sorted by serial number', () => {
    const registry = [...controllerEntities('entry-2', '222'), ...controllerEntities('entry-1', '111', 2)];

    const controllers = discover(registry, [...devices('111', 2), ...devices('222')]);

    expect(controllers.map(({ id, serial, label }) => ({ id, serial, label }))).toEqual([
      { id: 'entry-1', serial: '111', label: 'KeEnergy controller · 111' },
      { id: 'entry-2', serial: '222', label: 'KeEnergy controller · 222' },
    ]);
  });

  it('maps the circuits sorted by number', () => {
    const [controller] = discover(controllerEntities('entry-1', '111', 10), devices('111', 10), brackets);

    expect(controller.circuits.map(circuit => circuit.id)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
    expect(controller.circuits[1].label).toBe('<Heating circuit> 2 · Circuit device 2');
    expect(controller.circuits[1].map).toEqual({
      select: 'select.c111_hc2_select',
      curve: 'sensor.c111_hc2_curve',
      outdoor: 'sensor.c111_outdoor',
      actual: 'sensor.c111_hc2_actual',
      target: 'sensor.c111_hc2_target',
      useCurve: 'switch.c111_hc2_useCurve',
      limitDay: 'number.c111_hc2_limitDay',
      limitNight: 'number.c111_hc2_limitNight',
    });
  });

  it('prefers the device name of the user', () => {
    const userDevices = [{ id: 'device-111-controller', name: 'Controller', name_by_user: 'Basement' }];

    const [controller] = discover(controllerEntities('entry-1', '111'), userDevices);

    expect(controller.label).toBe('Basement · 111');
    expect(controller.circuits[0].label).toBe('Heating circuit 1');
  });

  it('uses KeEnergy without devices', () => {
    const [controller] = discover(controllerEntities('entry-1', '111'));

    expect(controller.label).toBe('KeEnergy · 111');
  });

  it('marks fields with several entities as ambiguous', () => {
    const registry = [
      ...controllerEntities('entry-1', '111'),
      registryEntry('entry-1', '111', 1, 'curve', { entity_id: 'sensor.duplicate' }),
    ];

    const [circuit] = discover(registry)[0].circuits;

    expect(circuit.map.curve).toBeUndefined();
    expect(circuit.ambiguous).toEqual(['curve']);
  });

  it('leaves out an ambiguous outdoor temperature', () => {
    const registry = [
      ...controllerEntities('entry-1', '111'),
      registryEntry('entry-1', '111', 1, 'outdoor', { entity_id: 'sensor.second_outdoor' }),
    ];

    const [controller] = discover(registry);

    expect(controller.outdoor).toBe('');
    expect(controller.circuits[0].map.outdoor).toBeUndefined();
  });

  it('ignores entities of another serial number in the same entry', () => {
    const registry = [...controllerEntities('entry-1', '111'), registryEntry('entry-1', '999', 2, 'curve')];

    const [controller] = discover(registry);

    expect(controller.circuits.map(circuit => circuit.id)).toEqual(['1']);
  });

  it('ignores entities without config entry and unknown entities', () => {
    const registry = [
      registryEntry(null, '111', 1, 'curve'),
      { entity_id: 'light.kitchen', platform: 'hue', config_entry_id: 'entry-9' },
    ];

    expect(discover(registry)).toEqual([]);
  });

  it('leaves out circuits and controllers without curve entities', () => {
    const registry = [registryEntry('entry-1', '111', 1, 'outdoor'), registryEntry('entry-1', '111', 1, 'actual')];

    expect(discover(registry)).toEqual([]);
  });

  it('accepts a circuit with only the curve select', () => {
    const [controller] = discover([registryEntry('entry-1', '111', 1, 'select')]);

    expect(controller.circuits[0].map).toEqual({ select: 'select.c111_hc1_select' });
  });
});

describe('loadRegistry', () => {
  /**
   * A connection that answers the entity and the device registry, an `Error` is thrown.
   *
   * @param {unknown} entities
   * @param {unknown} deviceList
   */
  const connection = (entities, deviceList) => ({
    callWS: vi.fn(async (/** @type {{ type: string }} */ { type }) => {
      const result = type === 'config/entity_registry/list' ? entities : deviceList;
      if (result instanceof Error) throw result;
      return result;
    }),
  });

  it('loads the entities and devices', async () => {
    const hass = connection(['entity'], ['device']);

    await expect(loadRegistry(hass)).resolves.toEqual({ registry: ['entity'], devices: ['device'] });
    expect(hass.callWS).toHaveBeenCalledWith({ type: 'config/entity_registry/list' });
    expect(hass.callWS).toHaveBeenCalledWith({ type: 'config/device_registry/list' });
  });

  it('works without devices', async () => {
    await expect(loadRegistry(connection(['entity'], Error('forbidden'))))
      .resolves.toEqual({ registry: ['entity'], devices: [] });
    await expect(loadRegistry(connection(['entity'], null))).resolves.toEqual({ registry: ['entity'], devices: [] });
  });

  it('fails without entity registry', async () => {
    await expect(loadRegistry(connection(Error('forbidden'), []))).rejects.toThrow('forbidden');
  });

  it('fails with an invalid entity registry', async () => {
    await expect(loadRegistry(connection(null, []))).rejects.toThrow('Entity registry unavailable.');
    await expect(loadRegistry(connection(null, []), brackets)).rejects.toThrow('<Entity registry unavailable.>');
  });
});
