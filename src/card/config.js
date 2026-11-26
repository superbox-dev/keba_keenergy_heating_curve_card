// Checks the card config and sets the defaults.
import { AXIS_LIMITS, INTERMEDIATE_STEP, MIN_AXIS_STEP } from '../chart-axis.js';
import { FIELDS } from '../discovery.js';
import { formatNumber, languageCode, translate } from '../i18n.js';
import { parseVerifier } from '../password.js';
import { numeric } from './entities.js';

/**
 * @typedef {import('../types.js').Hass} Hass
 * @typedef {import('../password.js').PasswordVerifier} PasswordVerifier
 */

/**
 * Card config after the check, with the defaults.
 *
 * @typedef {object} CardConfig
 * @property {string} title Title, empty for the default title.
 * @property {string} language `auto`, `de` or `en`.
 * @property {string} serial Pinned controller by serial number, empty for automatic.
 * @property {string} circuit Pinned heating circuit number, empty for automatic.
 * @property {string} config_entry Pinned controller by config entry ID, empty for automatic.
 * @property {Record<string, string>} [entities] Manual entity mapping by `FIELDS` config key.
 * @property {string} edit_password_hash Verifier of the edit password, empty without password.
 * @property {number} auto_lock_minutes Minutes until the card locks again.
 * @property {number | null} flow_min Lower display limit of the flow temperature.
 * @property {number | null} flow_max Upper display limit of the flow temperature.
 * @property {number | null} x_min Fixed minimum of the outdoor temperature axis.
 * @property {number | null} x_max Fixed maximum of the outdoor temperature axis.
 * @property {number | null} x_step Grid interval of the outdoor temperature axis.
 * @property {number | null} y_min Fixed minimum of the flow temperature axis.
 * @property {number | null} y_max Fixed maximum of the flow temperature axis.
 * @property {number | null} y_step Grid interval of the flow temperature axis.
 * @property {number | null} intermediate_step Interval of the interpolated values on the outdoor temperature axis.
 */

const DEFAULTS = {
  title: '',
  language: 'auto',
  serial: '',
  circuit: '',
  flow_min: null,
  flow_max: null,
  edit_password_hash: '',
  auto_lock_minutes: 5,
};

const LANGUAGES = ['auto', 'de', 'en'];
const FLOW_LIMITS = { min: 10, max: 90 };
const LOCK_MINUTES = { min: 1, max: 60 };

/**
 * Checks the card config and sets the defaults.
 *
 * The errors are in the language of the new config.
 *
 * @param {Record<string, unknown>} raw Card config as the user wrote it.
 * @param {Hass | undefined} hass The `hass` object, for the language and the number format.
 * @returns {{ config: CardConfig, verifier: PasswordVerifier | null }} The config and the parsed password verifier.
 * @throws {Error} When an option is invalid.
 */
export function normalizeConfig(raw, hass) {
  /** @type {Record<string, any>} */
  const config = { ...DEFAULTS, ...raw };
  /** @type {import('../types.js').Translate} */
  const t = (text, params) => translate(languageCode(config, hass), text, params);
  /** @type {import('../types.js').FormatNumber} */
  const number = (value, options) => formatNumber(value, config, hass, options);

  if (raw.entities && (typeof raw.entities !== 'object' || Array.isArray(raw.entities))) {
    throw Error(t('entities must be a mapping.'));
  }
  if (!LANGUAGES.includes(config.language)) throw Error(t('language must be auto, de or en.'));
  for (const key of ['serial', 'circuit', 'config_entry']) config[key] = String(config[key] ?? '').trim();
  if (config.circuit && !/^[1-9]\d*$/.test(config.circuit)) {
    throw Error(t('circuit must be a heating circuit number starting at 1.'));
  }
  for (const [key, id] of Object.entries(config.entities || {})) {
    const field = Object.values(FIELDS).find(f => f.configKey === key);
    if (!field || typeof id !== 'string' || !id.startsWith(field.domain + '.')) {
      throw Error(t('Invalid entity mapping: ') + key);
    }
  }

  const verifier = parseVerifier(config.edit_password_hash);
  if (config.edit_password_hash && !verifier) {
    throw Error(t('edit_password_hash must be a valid PBKDF2-SHA256 verifier. Create one in the visual editor.'));
  }

  config.auto_lock_minutes = numeric(config.auto_lock_minutes);
  if (!Number.isFinite(config.auto_lock_minutes) || config.auto_lock_minutes < LOCK_MINUTES.min
    || config.auto_lock_minutes > LOCK_MINUTES.max) {
    throw Error(t('auto_lock_minutes must be between 1 and 60 minutes.'));
  }

  for (const key of ['flow_min', 'flow_max']) {
    config[key] = config[key] === null || config[key] === '' ? null : numeric(config[key]);
    if (config[key] !== null && (!Number.isFinite(config[key])
      || config[key] < FLOW_LIMITS.min || config[key] > FLOW_LIMITS.max)) {
      throw Error(t('{key} must be between 10 and 90 °C or empty.', { key }));
    }
  }
  if (config.flow_min !== null && config.flow_max !== null && config.flow_min >= config.flow_max) {
    throw Error(t('flow_min must be less than flow_max.'));
  }

  /**
   * Checks a chart option with at most 2 decimals, empty values become `null`.
   *
   * @param {string} key Option.
   * @param {number} min Smallest value.
   * @param {number} max Largest value.
   */
  const setChartOption = (key, min, max) => {
    const value = config[key] == null || (typeof config[key] === 'string' && !config[key].trim())
      ? null
      : numeric(config[key]);
    if (value !== null && (!['number', 'string'].includes(typeof config[key]) || value < min || value > max
      || value !== Math.round(value * 100) / 100)) {
      throw Error(t('{key} must be between {min} and {max} °C and have at most two decimal places.', {
        key,
        min: number(min, { maximumFractionDigits: 2 }),
        max: number(max),
      }));
    }
    config[key] = value;
  };
  for (const [axis, { min, max }] of Object.entries(AXIS_LIMITS)) {
    const minKey = axis + '_min';
    const maxKey = axis + '_max';
    setChartOption(minKey, min, max);
    setChartOption(maxKey, min, max);
    setChartOption(axis + '_step', MIN_AXIS_STEP, max - min);
    if (config[minKey] !== null && config[maxKey] !== null && config[minKey] >= config[maxKey]) {
      throw Error(t('{minKey} must be less than {maxKey}.', { minKey, maxKey }));
    }
  }
  setChartOption('intermediate_step', INTERMEDIATE_STEP.min, INTERMEDIATE_STEP.max);

  return { config: /** @type {CardConfig} */ (config), verifier };
}
