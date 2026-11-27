// Chooses the controller and the heating circuit of the card and checks the manual entity mapping.
import { FIELDS, parseEntity } from '../discovery.js';

/**
 * @typedef {import('../discovery.js').Controller} Controller
 * @typedef {import('../discovery.js').FieldKey} FieldKey
 * @typedef {import('../types.js').EntityRegistryEntry} EntityRegistryEntry
 * @typedef {import('../types.js').Translate} Translate
 * @typedef {import('./config.js').CardConfig} CardConfig
 */

/**
 * Shown controller and heating circuit with their entities.
 *
 * @typedef {object} Binding
 * @property {string} controllerId Config entry ID of the shown controller.
 * @property {string} circuitId Number of the shown heating circuit.
 * @property {string | null} entryId Config entry for the actions, `null` when unknown.
 * @property {Partial<Record<FieldKey, string>>} map Discovered entity IDs by field.
 * @property {string} bindingError Why the card can't edit, empty when it can.
 */

/**
 * Input of `resolveBinding()`.
 *
 * @typedef {object} BindingInput
 * @property {CardConfig} config The card config.
 * @property {EntityRegistryEntry[]} registry Entries of the entity registry.
 * @property {Controller[]} controllers Discovered controllers.
 * @property {string} registryError Error of loading the registry, empty without error.
 * @property {string} controllerId Controller chosen in the card, empty for the first one.
 * @property {string} circuitId Heating circuit chosen in the card, empty for the first one.
 * @property {Translate} t Translates the errors.
 */

/** Fields of the controller, they don't pin a heating circuit. */
const CONTROLLER_KEYS = ['outdoor_temperature', 'flow_temperature', 'flow_setpoint'];

/**
 * Chooses the controller and the heating circuit from the config, the mapping and the choice in the card.
 *
 * @param {BindingInput} input The config, the registry and the current choice.
 * @returns {Binding} The binding, with `bindingError` when the mapping is inconsistent.
 */
export function resolveBinding({ config, registry, controllers, registryError, controllerId, circuitId, t }) {
  const explicit = config.entities || {};
  /** @type {Binding} */
  const binding = { controllerId, circuitId, entryId: null, map: {}, bindingError: '' };
  /** @param {string} message */
  const fail = message => ({ ...binding, bindingError: message });

  const anchors = /** @type {EntityRegistryEntry[]} */ (Object.entries(explicit)
    .filter(([key]) => !CONTROLLER_KEYS.includes(key))
    .map(([, id]) => registry.find(e => e.entity_id === id))
    .filter(Boolean));
  const entries = [...new Set(anchors.map(e => e.config_entry_id).filter(Boolean))];
  if (entries.length > 1) {
    return fail(t('Control entities belong to different controllers. Check the card mapping.'));
  }

  const entryPin = config.config_entry || entries[0] || '';
  const available = controllers.filter(c =>
    (!entryPin || c.id === entryPin) && (!config.serial || c.serial === config.serial));
  const controller = controllerId ? available.find(c => c.id === controllerId) : available[0];
  if (!controller) {
    // A manual mapping remains possible when registry reading is forbidden.
    if (registryError && config.config_entry && explicit.curve_sensor) {
      return { ...binding, entryId: config.config_entry };
    }
    if (controllers.length) {
      return fail(t('The configured KEBA KeEnergy controller was not found. Check the card configuration.'));
    }
    if (registryError) {
      return fail(t('Cannot read the KEBA KeEnergy mapping. Open as an administrator or set entities and config_entry manually.'));
    }
    return fail(t('No KEBA KeEnergy heating circuit with a heating curve table found.'));
  }
  if (entries.length && controller.id !== entries[0]) {
    return fail(t('config_entry and the entity mapping belong to different controllers.'));
  }

  const circuits = /** @type {string[]} */ ([...new Set(anchors.map(entity => parseEntity(entity)?.circuit))]
    .filter(Boolean));
  if (circuits.length > 1) return fail(t('Control entities belong to different heating circuits.'));
  if (config.circuit && circuits.length && config.circuit !== circuits[0]) {
    return fail(t('circuit and the entity mapping belong to different heating circuits.'));
  }
  const wantedCircuit = config.circuit || circuits[0] || circuitId;
  const circuit = wantedCircuit ? controller.circuits.find(c => c.id === wantedCircuit) : controller.circuits[0];
  binding.controllerId = controller.id;
  binding.entryId = controller.id;
  if (!circuit) return fail(t('The selected heating circuit was not found on this controller.'));

  binding.circuitId = circuit.id;
  binding.map = { ...circuit.map };
  const unresolved = circuit.ambiguous.filter(key => !explicit[FIELDS[key].configKey]);
  if (unresolved.length) {
    binding.bindingError = t('Ambiguous entities: {keys}. Please set entities explicitly.', {
      keys: unresolved.join(', '),
    });
  }
  if (anchors.some(anchor => anchor.platform !== 'keba_keenergy')) {
    binding.bindingError = t('Control entities must come from keba_keenergy.');
  }
  return binding;
}
