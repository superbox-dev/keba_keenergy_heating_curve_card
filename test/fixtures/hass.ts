// A fake Home Assistant with the parts the card and the editor use.
import { vi } from 'vitest';
import { circuitStates, controllerEntities, devices, entityStates } from './registry';
import type {
  CallService,
  CallWS,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  FakeHass,
  HassEntityStates,
  StateChanges,
  WsMessage,
} from './types';

export interface HassOptions {
  /** Answer of `config/entity_registry/list`, `null` for an invalid answer. */
  registry?: EntityRegistryEntry[] | null;
  /** Answer of `config/device_registry/list`. */
  deviceList?: DeviceRegistryEntry[];
  states?: HassEntityStates;
  language?: string;
  admin?: boolean;
  /** Whether the integration offers `keba_keenergy.set_heating_curve_points`. */
  pointService?: boolean;
}

/**
 * Creates a fake Home Assistant with one controller `111` and one heating circuit.
 *
 * `callService` and `callWS` are mocks, `callWS` answers the registry messages.
 */
export function createHass({
  registry = controllerEntities('entry-1', '111'),
  deviceList = devices('111'),
  states = circuitStates('111'),
  language = 'en',
  admin = true,
  pointService = true,
}: HassOptions = {}): FakeHass {
  const answers: Record<string, unknown> = {
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
    callService: vi.fn<CallService>(async () => undefined),
    callWS: vi.fn<CallWS>(async (message: WsMessage) => {
      if (message.type in answers) return answers[message.type];
      throw Error(`Unknown message ${message.type}`);
    }),
  };
}

/** A new hass object with changed states, like Home Assistant sends it on every update. */
export const withStates = (hass: FakeHass, changes: StateChanges): FakeHass =>
  ({ ...hass, states: { ...hass.states, ...entityStates(changes) } });

/** A new hass object with another language. */
export const withLanguage = (hass: FakeHass, language: string): FakeHass =>
  ({ ...hass, language, locale: { language } });

/** The calls of `hass.callService` to a domain, as `[service, data]`. */
export const serviceCalls = (hass: FakeHass, domain: string): [string, Record<string, unknown>][] =>
  hass.callService.mock.calls
    .filter(([callDomain]) => callDomain === domain)
    .map(([, service, data]) => [service, data]);

/** The messages of `hass.callWS` of a type. */
export const wsMessages = (hass: FakeHass, type: string): WsMessage[] =>
  hass.callWS.mock.calls.map(([message]) => message).filter(message => message.type === type);

/**
 * Makes `callService` wait, to test the card while it is sending.
 *
 * @returns A function that lets the last call finish.
 */
export function holdServiceCalls(hass: FakeHass): () => void {
  let finish = () => {};
  hass.callService.mockImplementation(() => new Promise((resolve) => {
    finish = () => resolve(undefined);
  }));
  return () => finish();
}

/** Makes `callWS` answer the entity registry list with other entries, and nothing else. */
export function answerRegistry(hass: FakeHass, registry: EntityRegistryEntry[]): void {
  hass.callWS.mockImplementation(async ({ type }) => (type === 'config/entity_registry/list' ? registry : []));
}
