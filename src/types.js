// Types of the parts of Home Assistant that the card and the editor use, checked by `npm run typecheck`.

/**
 * @typedef {import('home-assistant-js-websocket').HassEntity} HassEntity
 * @typedef {import('home-assistant-js-websocket').HassEntities} HassEntities
 * @typedef {import('home-assistant-js-websocket').HassServices} HassServices
 */

/**
 * Locale settings of the user profile in Home Assistant.
 *
 * @typedef {object} HassLocale
 * @property {string} [language] Language of the user interface, for example `de` or `en-GB`.
 * @property {string} [number_format] Number format of the profile, for example `decimal_comma` or `system`.
 */

/**
 * The part of the `hass` object of the Home Assistant frontend that the card and the editor read.
 *
 * @typedef {object} Hass
 * @property {HassEntities} [states] Entity states by entity ID.
 * @property {HassServices} [services] Available actions by domain.
 * @property {HassLocale} [locale] Locale settings of the user.
 * @property {string} [language] Language of the user interface, older Home Assistant versions.
 * @property {{ is_admin?: boolean }} [user] The signed-in user.
 * @property {{ darkMode?: boolean }} [themes] Theme settings.
 * @property {(domain: string, service: string, data: object) => Promise<unknown>} callService Calls an action.
 * @property {(message: { type: string } & Record<string, unknown>) => Promise<unknown>} callWS Sends a websocket
 *   message.
 */

/**
 * Entry of the entity registry (`config/entity_registry/list`).
 *
 * @typedef {object} EntityRegistryEntry
 * @property {string} [entity_id] Entity ID, the user can rename it.
 * @property {string} [unique_id] Unique ID of the integration, stable across renames.
 * @property {string} platform Integration of the entity, for example `keba_keenergy`.
 * @property {string | null} [config_entry_id] Config entry of the integration, one per controller.
 * @property {string | null} [device_id] Device of the entity.
 * @property {string | null} [disabled_by] Reason why the entity is disabled, `null` when it is enabled.
 */

/**
 * Entry of the device registry (`config/device_registry/list`).
 *
 * @typedef {object} DeviceRegistryEntry
 * @property {string} id Device ID.
 * @property {string} [name] Name of the integration.
 * @property {string | null} [name_by_user] Name set by the user.
 */

/**
 * Translates an English source text, placeholders as `{name}`.
 *
 * @typedef {(text: string, params?: Record<string, unknown>) => string} Translate
 */

/**
 * Formats a number in the number format of the user.
 *
 * @typedef {(value: number, options?: Intl.NumberFormatOptions) => string} FormatNumber
 */

export {};
