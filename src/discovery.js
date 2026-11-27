// Controllers and heating circuits from the entity registry.
// Match registry unique IDs, never the user-editable entity names.

/**
 * @typedef {import('./types.js').DeviceRegistryEntry} DeviceRegistryEntry
 * @typedef {import('./types.js').EntityRegistryEntry} EntityRegistryEntry
 * @typedef {import('./types.js').Hass} Hass
 */

/**
 * Entity of a heating circuit.
 *
 * @typedef {object} Field
 * @property {string} domain Domain of the entity ID.
 * @property {string} uniqueId End of the unique ID of the integration.
 * @property {string} configKey Key in the config option `entities`.
 */

/**
 * Key of a heating circuit field.
 *
 * @typedef {'select' | 'curve' | 'outdoor' | 'actual' | 'target' | 'useCurve' | 'limitDay' | 'limitNight'} FieldKey
 */

/** @type {Record<FieldKey, Field>} */
export const FIELDS = {
  select: { domain: 'select', uniqueId: 'heating_curve', configKey: 'curve_select' },
  curve: { domain: 'sensor', uniqueId: 'heating_curve', configKey: 'curve_sensor' },
  outdoor: { domain: 'sensor', uniqueId: 'outdoor_temperature', configKey: 'outdoor_temperature' },
  actual: { domain: 'sensor', uniqueId: 'flow_temperature', configKey: 'flow_temperature' },
  target: { domain: 'sensor', uniqueId: 'flow_temperature_setpoint', configKey: 'flow_setpoint' },
  useCurve: { domain: 'switch', uniqueId: 'use_heating_curve', configKey: 'use_heating_curve' },
  limitDay: { domain: 'number', uniqueId: 'heating_limit_day', configKey: 'heating_limit_day' },
  limitNight: { domain: 'number', uniqueId: 'heating_limit_night', configKey: 'heating_limit_night' },
};

/** Keys of `FIELDS`, in their order. */
export const FIELD_KEYS = /** @type {FieldKey[]} */ (Object.keys(FIELDS));

/**
 * Entity of the integration with the field it belongs to.
 *
 * @typedef {object} ParsedEntity
 * @property {string} serial Serial number of the controller.
 * @property {string} [circuit] Number of the heating circuit, not for the outdoor temperature.
 * @property {FieldKey} key Field of the entity.
 */

/**
 * A heating circuit of a controller.
 *
 * @typedef {object} Circuit
 * @property {string} id Number of the heating circuit.
 * @property {string} label Label for the selection.
 * @property {Partial<Record<FieldKey, EntityRegistryEntry[]>>} candidates Found entities by field.
 * @property {Partial<Record<FieldKey, string>>} map Entity ID by field, when exactly one was found.
 * @property {FieldKey[]} ambiguous Fields with more than one entity.
 */

/**
 * A controller, one config entry of the integration.
 *
 * @typedef {object} Controller
 * @property {string} id Config entry ID.
 * @property {string} serial Serial number.
 * @property {string} label Label for the selection.
 * @property {Circuit[]} circuits Heating circuits with a heating curve table.
 * @property {EntityRegistryEntry[]} outdoorCandidates Found outdoor temperature sensors.
 * @property {string} outdoor Entity ID of the outdoor temperature, empty unless exactly one was found.
 */

/** Unique ID of a heating circuit entity: serial, circuit number in front or at the end, and the field. */
const CIRCUIT_ENTITY = /^(.+)_heat_circuit_(?:(\d+)_)?(heating_curve|flow_temperature_setpoint|flow_temperature|use_heating_curve|heating_limit_day|heating_limit_night)(?:_(\d+))?$/;

/**
 * Finds the field of an entity of the integration by its unique ID.
 *
 * Legacy unique IDs of the integration are aliases of the current ones.
 *
 * @param {EntityRegistryEntry} entity Entry of the entity registry.
 * @returns {ParsedEntity | null} The field, `null` for other entities.
 */
export function parseEntity(entity) {
  if (entity.platform !== 'keba_keenergy') return null;
  const domain = entity.entity_id?.split('.')[0];
  const unique = String(entity.unique_id || '').replace(/^keba_keenergy_/, '')
    .replace('_heating_circuit_', '_heat_circuit_')
    .replace('_use_curve_table', '_use_heating_curve')
    .replace('_mixer_flow_temperature', '_flow_temperature');
  const outdoor = unique.match(/^(.+)_outdoor_temperature$/);
  if (outdoor && domain === 'sensor') return { serial: outdoor[1], key: 'outdoor' };
  const match = unique.match(CIRCUIT_ENTITY);
  if (!match || (match[2] && match[4])) return null;
  const key = FIELD_KEYS.find(k => k !== 'outdoor' && FIELDS[k].domain === domain && FIELDS[k].uniqueId === match[3]);
  return key ? { serial: match[1], circuit: match[2] || match[4] || '1', key } : null;
}

/**
 * Groups the entities of the integration by controller and heating circuit.
 *
 * @param {EntityRegistryEntry[]} registry Entries of the entity registry.
 * @param {DeviceRegistryEntry[]} [devices] Entries of the device registry, for the labels.
 * @param {(text: string) => string} [t] Translates the texts of the labels.
 * @returns {Controller[]} Controllers with at least one heating circuit with a heating curve table, sorted by serial
 *   number.
 */
export function discoverControllers(registry, devices = [], t = text => text) {
  /** @type {Map<string, Controller>} */
  const controllers = new Map();
  /** @param {string | null | undefined} id */
  const deviceLabel = (id) => {
    const d = devices.find(device => device.id === id);
    return d?.name_by_user || d?.name || '';
  };
  for (const entity of registry) {
    const p = parseEntity(entity);
    if (!p || !entity.config_entry_id) continue;
    let controller = controllers.get(entity.config_entry_id);
    if (!controller) {
      controller = {
        id: entity.config_entry_id,
        serial: p.serial,
        label: '',
        circuits: [],
        outdoorCandidates: [],
        outdoor: '',
      };
      controllers.set(controller.id, controller);
    }
    // One integration entry belongs to one controller. Do not merge inconsistent IDs.
    if (p.serial !== controller.serial) continue;
    if (p.key === 'outdoor') {
      controller.outdoorCandidates.push(entity);
      controller.label = deviceLabel(entity.device_id) || controller.label;
      continue;
    }
    const id = /** @type {string} */ (p.circuit);
    let circuit = controller.circuits.find(c => c.id === id);
    if (!circuit) {
      circuit = { id, label: '', candidates: {}, map: {}, ambiguous: [] };
      controller.circuits.push(circuit);
    }
    circuit.label ||= deviceLabel(entity.device_id);
    (circuit.candidates[p.key] ||= []).push(entity);
  }
  return [...controllers.values()].map((controller) => {
    const outdoor = controller.outdoorCandidates;
    controller.outdoor = outdoor.length === 1 ? /** @type {string} */ (outdoor[0].entity_id) : '';
    controller.label = (controller.label || 'KEBA KeEnergy') + ' · ' + controller.serial;
    controller.circuits = controller.circuits.filter(c => c.candidates.curve || c.candidates.select).map((circuit) => {
      circuit.label = t('Heating circuit') + ' ' + circuit.id + (circuit.label ? ' · ' + circuit.label : '');
      for (const [key, entries] of Object.entries(circuit.candidates)) {
        const field = /** @type {FieldKey} */ (key);
        if (entries.length === 1) circuit.map[field] = entries[0].entity_id;
        else circuit.ambiguous.push(field);
      }
      if (controller.outdoor) circuit.map.outdoor = controller.outdoor;
      return circuit;
    }).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    return controller;
  }).filter(c => c.circuits.length).sort((a, b) => a.serial.localeCompare(b.serial, undefined, { numeric: true }));
}

/**
 * Loads the entity registry and the device registry, the device registry is optional.
 *
 * @param {Pick<Hass, 'callWS'>} hass The `hass` object of Home Assistant.
 * @param {(text: string) => string} [t] Translates the error text.
 * @returns {Promise<{ registry: EntityRegistryEntry[], devices: DeviceRegistryEntry[] }>} The entries.
 */
export async function loadRegistry(hass, t = text => text) {
  const [entities, devices] = await Promise.allSettled([
    hass.callWS({ type: 'config/entity_registry/list' }),
    hass.callWS({ type: 'config/device_registry/list' }),
  ]);
  if (entities.status === 'rejected') throw entities.reason;
  if (!Array.isArray(entities.value)) throw Error(t('Entity registry unavailable.'));
  return {
    registry: entities.value,
    devices: devices.status === 'fulfilled' && Array.isArray(devices.value) ? devices.value : [],
  };
}
