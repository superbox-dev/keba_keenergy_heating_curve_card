// Types of the parts of Home Assistant and of the card that the tests use.
/** @import { HassServices, HassUser, MessageBase } from 'home-assistant-js-websocket' */
/** @import { Mock } from 'vitest' */

/** @typedef {import('home-assistant-js-websocket').HassEntityState} HassEntityState */
/** @typedef {import('home-assistant-js-websocket').HassEntityStates} HassEntityStates */

/**
 * The part of an entity state a test writes, `entityState()` adds the rest.
 *
 * @typedef {Pick<HassEntityState, 'state' | 'attributes'>} EntityState
 */

/**
 * Changed states by entity ID, for `withStates()`.
 *
 * @typedef {Record<string, EntityState>} StateChanges
 */

/**
 * Entry of `config/entity_registry/list`.
 *
 * @typedef {object} EntityRegistryEntry
 * @property {string} [entity_id]
 * @property {string} [unique_id]
 * @property {string} platform
 * @property {string | null} [config_entry_id]
 * @property {string} [device_id]
 * @property {string | null} [disabled_by]
 */

/**
 * Entry of `config/device_registry/list`.
 *
 * @typedef {object} DeviceRegistryEntry
 * @property {string} id
 * @property {string} name
 * @property {string} [name_by_user]
 */

/**
 * Websocket message of `hass.callWS()`.
 *
 * @typedef {MessageBase} WsMessage
 */

/** @typedef {(domain: string, service: string, data: Record<string, unknown>) => Promise<unknown>} CallService */
/** @typedef {(message: WsMessage) => Promise<unknown>} CallWS */

/**
 * Locale settings of the user profile.
 *
 * @typedef {object} HassLocale
 * @property {string} [language]
 * @property {string} [number_format]
 */

/**
 * Fake `hass` object with the parts of `HomeAssistant` the card and the editor read.
 *
 * `HomeAssistant` is a type of the Home Assistant frontend and no package, its tests also use a subset.
 *
 * @typedef {object} FakeHass
 * @property {HassEntityStates} states
 * @property {string} language
 * @property {HassLocale} locale
 * @property {Pick<HassUser, 'is_admin'>} user
 * @property {{ darkMode: boolean }} themes
 * @property {HassServices} services
 * @property {Mock<CallService>} callService
 * @property {Mock<CallWS>} callWS
 */

/**
 * Point of a heating curve table.
 *
 * @typedef {object} CurvePoint
 * @property {number} outdoor
 * @property {number} flow
 */

/**
 * Card config as the user writes it in YAML.
 *
 * Loosely typed, because the tests also pass invalid values.
 *
 * @typedef {Record<string, unknown>} CardConfig
 */

/**
 * The card element.
 *
 * @typedef {HTMLElement & {
 *   hass: Partial<FakeHass>,
 *   setConfig(config: CardConfig): void,
 *   getCardSize(): number,
 *   getGridOptions(): Record<string, unknown>,
 * }} HeatingCurveCard
 */

/**
 * The class of the card element with its static methods.
 *
 * @typedef {{
 *   new (): HeatingCurveCard,
 *   getStubConfig(): CardConfig,
 *   getConfigElement(): Promise<HTMLElement>,
 * }} HeatingCurveCardClass
 */

/**
 * Item of a schema of `ha-form`, like in the Home Assistant frontend.
 *
 * @typedef {object} FormSchema
 * @property {string} name
 * @property {'expandable' | 'grid'} [type]
 * @property {string} [title]
 * @property {boolean} [required]
 * @property {FormSelector} [selector]
 * @property {FormSchema[]} [schema]
 */

/**
 * Selector of a field of `ha-form`.
 *
 * @typedef {object} FormSelector
 * @property {{}} [text]
 * @property {{ mode: string, options: { value: string, label: string }[] }} [select]
 * @property {{ min: number, max: number, step: number | 'any', mode: string }} [number]
 */

/**
 * The editor element.
 *
 * @typedef {HTMLElement & {
 *   hass: Partial<FakeHass>,
 *   setConfig(config: CardConfig): void,
 * }} HeatingCurveCardEditor
 */

/**
 * Entry of `window.customCards` for the card picker.
 *
 * @typedef {object} CustomCard
 * @property {string} type
 * @property {string} [name]
 * @property {string} [description]
 * @property {boolean} [preview]
 */

/**
 * The window with the list of custom cards for the card picker.
 *
 * @typedef {Window & { customCards?: CustomCard[] }} CardWindow
 */

// Only types, the module exports nothing at runtime.
export {};
