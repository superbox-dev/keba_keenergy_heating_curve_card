// @ts-check
// Entity registry entries and states of the keba_keenergy integration, with fake serial numbers.
import { FIELDS } from '../../src/discovery';
/**
 * @import {
 *   CurvePoint,
 *   DeviceRegistryEntry,
 *   EntityRegistryEntry,
 *   EntityState,
 *   HassEntityState,
 *   HassEntityStates,
 *   StateChanges,
 * } from './types'
 */

/**
 * Field of a heating circuit, a key of `FIELDS` in `src/discovery.js`.
 *
 * @typedef {'select' | 'curve' | 'outdoor' | 'actual' | 'target' | 'useCurve' | 'limitDay' | 'limitNight'} FieldKey
 */

const FIELD_INFO = /** @type {Record<FieldKey, [domain: string, uniqueId: string]>} */ (FIELDS);

export const CURVE_TABLES = ['HC1', 'HC2', 'HC3'];

/** @type {CurvePoint[]} */
export const POINTS = [
  { outdoor: -20, flow: 45 },
  { outdoor: 0, flow: 35 },
  { outdoor: 20, flow: 25 },
];

/**
 * Entity ID of a field.
 *
 * @example entityId('111', 1, 'curve') // 'sensor.c111_hc1_curve'
 * @example entityId('111', 1, 'outdoor') // 'sensor.c111_outdoor'
 * @param {string} serial
 * @param {number} circuit
 * @param {FieldKey} key
 * @returns {string}
 */
export function entityId(serial, circuit, key) {
  const name = key === 'outdoor' ? 'outdoor' : `hc${circuit}_${key}`;
  return `${FIELD_INFO[key][0]}.c${serial}_${name}`;
}

/**
 * Registry entry like the integration creates it, circuit 1 without a number in the unique ID.
 *
 * @param {string | null} entry The config entry ID.
 * @param {string} serial The serial number of the controller.
 * @param {number} circuit The heating circuit number.
 * @param {FieldKey} key The field.
 * @param {Partial<EntityRegistryEntry>} extra Values that replace the defaults.
 * @returns {EntityRegistryEntry}
 */
export function registryEntry(
  entry,
  serial,
  circuit,
  key,
  extra = {},
) {
  const uniqueId = key === 'outdoor'
    ? `${serial}_outdoor_temperature`
    : `${serial}_heat_circuit_${FIELD_INFO[key][1]}${circuit === 1 ? '' : `_${circuit}`}`;

  return {
    entity_id: entityId(serial, circuit, key),
    unique_id: uniqueId,
    platform: 'keba_keenergy',
    config_entry_id: entry,
    device_id: `device-${serial}-${key === 'outdoor' ? 'controller' : circuit}`,
    disabled_by: null,
    ...extra,
  };
}

/**
 * All registry entries of a controller with the given number of heating circuits.
 *
 * @param {string} entry
 * @param {string} serial
 * @returns {EntityRegistryEntry[]}
 */
export function controllerEntities(entry, serial, circuits = 1) {
  const entities = [registryEntry(entry, serial, 1, 'outdoor')];

  for (let circuit = 1; circuit <= circuits; circuit++) {
    for (const key of /** @type {FieldKey[]} */ (Object.keys(FIELD_INFO))) {
      if (key !== 'outdoor') entities.push(registryEntry(entry, serial, circuit, key));
    }
  }

  return entities;
}

/**
 * Devices of a controller: the controller and one device per heating circuit.
 *
 * @param {string} serial
 * @returns {DeviceRegistryEntry[]}
 */
export function devices(serial, circuits = 1) {
  const circuitDevices = Array.from({ length: circuits }, (_, index) => ({
    id: `device-${serial}-${index + 1}`,
    name: `Circuit device ${index + 1}`,
  }));

  return [{ id: `device-${serial}-controller`, name: 'KeEnergy controller' }, ...circuitDevices];
}

/**
 * The full state of an entity like Home Assistant sends it, with fixed timestamps and context.
 *
 * @param {string} entityId
 * @param {EntityState} change
 * @returns {HassEntityState}
 */
export function entityState(entityId, { state, attributes }) {
  return {
    entity_id: entityId,
    state,
    attributes,
    last_changed: '',
    last_updated: '',
    context: { id: '', parent_id: null, user_id: null },
  };
}

/**
 * The full states of the changes, by entity ID.
 *
 * @param {StateChanges} changes
 * @returns {HassEntityStates}
 */
export const entityStates = changes =>
  Object.fromEntries(Object.entries(changes).map(([id, change]) => [id, entityState(id, change)]));

/**
 * State of a temperature entity.
 *
 * @param {number | string} value
 * @param {Record<string, unknown>} attributes
 * @returns {EntityState}
 */
export function temperature(value, unit = '°C', attributes = {}) {
  return { state: String(value), attributes: { unit_of_measurement: unit, ...attributes } };
}

/**
 * State of an entity without attributes.
 *
 * @param {string} state
 * @returns {EntityState}
 */
export const plain = state => ({ state, attributes: {} });

/**
 * State of the curve table select.
 *
 * @param {string} table
 * @param {unknown[]} options
 * @returns {EntityState}
 */
export const curveSelect = (table, options = CURVE_TABLES) =>
  ({ state: table, attributes: { options } });

/**
 * State of the curve sensor with its points.
 *
 * @param {string} table
 * @param {unknown} points
 * @returns {EntityState}
 */
export const curveSensor = (table, points = POINTS) =>
  ({ state: table, attributes: { points } });

/**
 * State of a heating limit entity with the range of the controller.
 *
 * @param {number | string} value
 * @param {Record<string, unknown>} range
 * @returns {EntityState}
 */
export const heatingLimit = (
  value,
  unit = '°C',
  range = { min: 0, max: 30, step: 0.5 },
) =>
  temperature(value, unit, range);

/**
 * States of one heating circuit and the outdoor temperature of its controller.
 *
 * @param {string} serial The serial number of the controller.
 * @param circuit The heating circuit number.
 * @param {Partial<Record<FieldKey, EntityState>>} overrides States that replace the defaults, by field.
 * @returns {HassEntityStates}
 */
export function circuitStates(
  serial,
  circuit = 1,
  overrides = {},
) {
  /** @type {Record<FieldKey, EntityState>} */
  const defaults = {
    outdoor: temperature(5),
    select: curveSelect('HC1'),
    curve: curveSensor('HC1'),
    actual: temperature(33),
    target: temperature(32),
    useCurve: plain('on'),
    limitDay: heatingLimit(18),
    limitNight: heatingLimit(15),
  };
  const fields = { ...defaults, ...overrides };

  return entityStates(Object.fromEntries(
    (/** @type {FieldKey[]} */ (Object.keys(fields))).map(key => [entityId(serial, circuit, key), fields[key]]),
  ));
}
