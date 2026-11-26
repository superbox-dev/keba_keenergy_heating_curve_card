// Entity registry entries and states of the keba_keenergy integration, with fake serial numbers.
import { FIELDS } from '../../src/discovery';
import type {
  CurvePoint,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  EntityState,
  HassEntityState,
  HassEntityStates,
  StateChanges,
} from './types';

/** Field of a heating circuit, a key of `FIELDS` in `src/discovery.js`. */
export type FieldKey =
  | 'select'
  | 'curve'
  | 'outdoor'
  | 'actual'
  | 'target'
  | 'useCurve'
  | 'limitDay'
  | 'limitNight';

const FIELD_INFO = FIELDS as Record<FieldKey, [domain: string, uniqueId: string]>;

export const CURVE_TABLES = ['HC1', 'HC2', 'HC3'];

export const POINTS: CurvePoint[] = [
  { outdoor: -20, flow: 45 },
  { outdoor: 0, flow: 35 },
  { outdoor: 20, flow: 25 },
];

/**
 * Entity ID of a field.
 *
 * @example entityId('111', 1, 'curve') // 'sensor.c111_hc1_curve'
 * @example entityId('111', 1, 'outdoor') // 'sensor.c111_outdoor'
 */
export function entityId(serial: string, circuit: number, key: FieldKey): string {
  const name = key === 'outdoor' ? 'outdoor' : `hc${circuit}_${key}`;
  return `${FIELD_INFO[key][0]}.c${serial}_${name}`;
}

/**
 * Registry entry like the integration creates it, circuit 1 without a number in the unique ID.
 *
 * @param entry The config entry ID.
 * @param serial The serial number of the controller.
 * @param circuit The heating circuit number.
 * @param key The field.
 * @param extra Values that replace the defaults.
 */
export function registryEntry(
  entry: string | null,
  serial: string,
  circuit: number,
  key: FieldKey,
  extra: Partial<EntityRegistryEntry> = {},
): EntityRegistryEntry {
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

/** All registry entries of a controller with the given number of heating circuits. */
export function controllerEntities(entry: string, serial: string, circuits = 1): EntityRegistryEntry[] {
  const entities = [registryEntry(entry, serial, 1, 'outdoor')];

  for (let circuit = 1; circuit <= circuits; circuit++) {
    for (const key of Object.keys(FIELD_INFO) as FieldKey[]) {
      if (key !== 'outdoor') entities.push(registryEntry(entry, serial, circuit, key));
    }
  }

  return entities;
}

/** Devices of a controller: the controller and one device per heating circuit. */
export function devices(serial: string, circuits = 1): DeviceRegistryEntry[] {
  const circuitDevices = Array.from({ length: circuits }, (_, index) => ({
    id: `device-${serial}-${index + 1}`,
    name: `Circuit device ${index + 1}`,
  }));

  return [{ id: `device-${serial}-controller`, name: 'KeEnergy controller' }, ...circuitDevices];
}

/** The full state of an entity like Home Assistant sends it, with fixed timestamps and context. */
export function entityState(entityId: string, { state, attributes }: EntityState): HassEntityState {
  return {
    entity_id: entityId,
    state,
    attributes,
    last_changed: '',
    last_updated: '',
    context: { id: '', parent_id: null, user_id: null },
  };
}

/** The full states of the changes, by entity ID. */
export const entityStates = (changes: StateChanges): HassEntityStates =>
  Object.fromEntries(Object.entries(changes).map(([id, change]) => [id, entityState(id, change)]));

/** State of a temperature entity. */
export function temperature(value: number | string, unit = '°C', attributes: Record<string, unknown> = {}): EntityState {
  return { state: String(value), attributes: { unit_of_measurement: unit, ...attributes } };
}

/** State of an entity without attributes. */
export const plain = (state: string): EntityState => ({ state, attributes: {} });

/** State of the curve table select. */
export const curveSelect = (table: string, options: unknown[] = CURVE_TABLES): EntityState =>
  ({ state: table, attributes: { options } });

/** State of the curve sensor with its points. */
export const curveSensor = (table: string, points: unknown = POINTS): EntityState =>
  ({ state: table, attributes: { points } });

/** State of a heating limit entity with the range of the controller. */
export const heatingLimit = (
  value: number | string,
  unit = '°C',
  range: Record<string, unknown> = { min: 0, max: 30, step: 0.5 },
): EntityState =>
  temperature(value, unit, range);

/**
 * States of one heating circuit and the outdoor temperature of its controller.
 *
 * @param serial The serial number of the controller.
 * @param circuit The heating circuit number.
 * @param overrides States that replace the defaults, by field.
 */
export function circuitStates(
  serial: string,
  circuit = 1,
  overrides: Partial<Record<FieldKey, EntityState>> = {},
): HassEntityStates {
  const defaults: Record<FieldKey, EntityState> = {
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
    (Object.keys(fields) as FieldKey[]).map(key => [entityId(serial, circuit, key), fields[key]]),
  ));
}
