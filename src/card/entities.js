// Values of the entity states, temperatures internally in °C.

/** @typedef {import('../types.js').HassEntity} HassEntity */

/**
 * Setting of a heating circuit that the card edits.
 *
 * @typedef {object} LimitField
 * @property {string} label English label, translated with `_t()`.
 * @property {string} unit Unit of the field.
 */

/**
 * Key of an editable heating limit.
 *
 * @typedef {'limitDay' | 'limitNight'} LimitKey
 */

/** @type {Record<LimitKey, LimitField>} */
export const LIMIT_FIELDS = {
  limitDay: { label: 'Day heating limit', unit: '°C' },
  limitNight: { label: 'Night heating limit', unit: '°C' },
};

/** Keys of `LIMIT_FIELDS`, in their order. */
export const LIMIT_KEYS = /** @type {LimitKey[]} */ (Object.keys(LIMIT_FIELDS));

/**
 * Reads a number, also with a decimal comma.
 *
 * @param {unknown} value Number or text.
 * @returns {number} The number, `NaN` when the value is empty or no number.
 */
export function numeric(value) {
  return value == null || String(value).trim() === '' ? NaN : Number(String(value).replace(',', '.'));
}

/**
 * Whether an entity has a usable state.
 *
 * @param {HassEntity | undefined} state State of the entity.
 * @returns {state is HassEntity} `false` when the entity is missing, `unknown` or `unavailable`.
 */
export function isAvailable(state) {
  return !!state && !['unknown', 'unavailable', ''].includes(state.state);
}

/**
 * Converts a temperature of an entity to °C.
 *
 * @param {HassEntity | undefined} state State of the entity, for its unit.
 * @param {number} value Temperature in the unit of the entity.
 * @param {boolean} [delta] Whether the value is a difference, like a step size.
 * @returns {number} The temperature in °C.
 */
export function toCelsius(state, value, delta = false) {
  const unit = state?.attributes?.unit_of_measurement;
  if (unit === '°F') return (value - (delta ? 0 : 32)) / 1.8;
  if (unit === 'K') return value - (delta ? 0 : 273.15);
  return value;
}

/**
 * Converts a temperature in °C to the unit of an entity.
 *
 * @param {HassEntity | undefined} state State of the entity, for its unit.
 * @param {number} value Temperature in °C.
 * @returns {number} The temperature in the unit of the entity.
 */
export function fromCelsius(state, value) {
  const unit = state?.attributes?.unit_of_measurement;
  if (unit === '°F') return value * 1.8 + 32;
  if (unit === 'K') return value + 273.15;
  return value;
}

/**
 * Temperature of an entity in °C.
 *
 * @param {HassEntity | undefined} state State of the entity.
 * @returns {number} The temperature, `NaN` when the entity has no usable state.
 */
export function temperature(state) {
  return isAvailable(state) ? toCelsius(state, numeric(state.state)) : NaN;
}

/**
 * Range and step size of a number entity in °C.
 *
 * @param {HassEntity | undefined} state State of the entity.
 * @returns {{ min: number, max: number, step: number }} The bounds, `NaN` when the entity has none.
 */
export function numberRange(state) {
  const attributes = state?.attributes || {};
  return {
    min: toCelsius(state, numeric(attributes.min)),
    max: toCelsius(state, numeric(attributes.max)),
    step: toCelsius(state, numeric(attributes.step), true),
  };
}
