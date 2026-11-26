// A fake Home Assistant with the parts the card and the editor use.
import { vi } from 'vitest';
/** @import { Mock } from 'vitest' */
import { circuitStates, controllerEntities, devices, entityStates } from './registry';
/**
 * @import {
 *   CallService,
 *   CallWS,
 *   DeviceRegistryEntry,
 *   EntityRegistryEntry,
 *   FakeHass,
 *   HassEntityStates,
 *   StateChanges,
 *   WsMessage,
 * } from './types'
 */

/**
 * @typedef {object} HassOptions
 * @property {EntityRegistryEntry[] | null} [registry] Answer of `config/entity_registry/list`, `null` for an invalid
 *   answer.
 * @property {DeviceRegistryEntry[]} [deviceList] Answer of `config/device_registry/list`.
 * @property {HassEntityStates} [states]
 * @property {string} [language]
 * @property {boolean} [admin]
 * @property {boolean} [pointService] Whether the integration offers `keba_keenergy.set_heating_curve_points`.
 */

/**
 * Creates a fake Home Assistant with one controller `111` and one heating circuit.
 *
 * `callService` and `callWS` are mocks, `callWS` answers the registry messages.
 *
 * @param {HassOptions} [options]
 * @returns {FakeHass}
 */
export function createHass({
  registry = controllerEntities('entry-1', '111'),
  deviceList = devices('111'),
  states = circuitStates('111'),
  language = 'en',
  admin = true,
  pointService = true,
} = {}) {
  /** @type {Record<string, unknown>} */
  const answers = {
    'config/entity_registry/list': registry,
    'config/device_registry/list': deviceList,
    'config/entity_registry/update': {},
  };

  return {
    states,
    language,
    locale: { language, number_format: 'language' },
    user: { is_admin: admin },
    themes: { darkMode: false },
    services: { keba_keenergy: pointService ? { set_heating_curve_points: { fields: {} } } : {} },
    callService: /** @type {Mock<CallService>} */ (vi.fn(async () => undefined)),
    callWS: /** @type {Mock<CallWS>} */ (vi.fn(async (/** @type {WsMessage} */ message) => {
      if (message.type in answers) return answers[message.type];
      throw Error(`Unknown message ${message.type}`);
    })),
  };
}

/**
 * A new hass object with changed states, like Home Assistant sends it on every update.
 *
 * @param {FakeHass} hass
 * @param {StateChanges} changes
 * @returns {FakeHass}
 */
export const withStates = (hass, changes) =>
  ({ ...hass, states: { ...hass.states, ...entityStates(changes) } });

/**
 * A new hass object with another language.
 *
 * @param {FakeHass} hass
 * @param {string} language
 * @returns {FakeHass}
 */
export const withLanguage = (hass, language) =>
  ({ ...hass, language, locale: { language } });

/**
 * The calls of `hass.callService` to a domain, as `[service, data]`.
 *
 * @param {FakeHass} hass
 * @param {string} domain
 * @returns {[string, Record<string, unknown>][]}
 */
export const serviceCalls = (hass, domain) =>
  hass.callService.mock.calls
    .filter(([callDomain]) => callDomain === domain)
    .map(([, service, data]) => [service, data]);

/**
 * The messages of `hass.callWS` of a type.
 *
 * @param {FakeHass} hass
 * @param {string} type
 * @returns {WsMessage[]}
 */
export const wsMessages = (hass, type) =>
  hass.callWS.mock.calls.map(([message]) => message).filter(message => message.type === type);

/**
 * Makes `callService` wait, to test the card while it is sending.
 *
 * @param {FakeHass} hass
 * @returns {() => void} A function that lets the last call finish.
 */
export function holdServiceCalls(hass) {
  let finish = () => {};
  hass.callService.mockImplementation(() => new Promise((resolve) => {
    finish = () => resolve(undefined);
  }));
  return () => finish();
}

/**
 * Makes `callWS` answer the entity registry list with other entries, and nothing else.
 *
 * @param {FakeHass} hass
 * @param {EntityRegistryEntry[]} registry
 * @returns {void}
 */
export function answerRegistry(hass, registry) {
  hass.callWS.mockImplementation(async ({ type }) => (type === 'config/entity_registry/list' ? registry : []));
}
