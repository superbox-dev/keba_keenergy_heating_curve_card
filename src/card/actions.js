// Actions that write to Home Assistant, only from explicit user actions.
import { fromCelsius, isAvailable, numberRange, LIMIT_FIELDS } from './entities.js';
import { pointsToSave, samePoints, sortByOutdoor } from './points.js';
import { errorText } from '../i18n.js';

/**
 * @typedef {import('../card.js').KeEnergyHeatingCurveCard} Card
 * @typedef {import('./entities.js').LimitKey} LimitKey
 */

/** Tolerance of the comparison of temperatures. */
const EPSILON = 1e-6;

/**
 * Assigns a curve table to the shown heating circuit.
 *
 * @param {Card} card The card.
 * @param {string} name Name of the curve table.
 */
export async function selectCurve(card, name) {
  if (card._busy || !card._requireEdit()) return;
  card._lock.touch();
  if (card._draft || Object.keys(card._edits).length) {
    card._notice(card._t('Save points / settings or discard the draft before switching tables.'));
    card._render();
    return;
  }
  if (!card._options().includes(name)) return;
  card._loadingCurve = name;
  card._busy = true;
  card._message = card._t('Assigning curve …');
  card._render();
  try {
    await card._connection.callService('select', 'select_option', { entity_id: card._ids().select, option: name });
    card._message = card._t('Curve {name} assigned. Readings are updating.', { name });
  } catch (error) {
    card._loadingCurve = null;
    card._message = card._t('Selection failed: ') + errorText(error);
  } finally {
    card._busy = false;
    if (card._state(card._ids().curve)?.state === name && card._selected() === name) card._loadingCurve = null;
    card._render();
  }
}

/**
 * Saves the points of the draft, for all heating circuits that use the curve table.
 *
 * @param {Card} card The card.
 */
export async function savePoints(card) {
  if (!card._requireEdit() || !card._ready()) return;
  card._lock.touch();
  const name = card._selected();
  const points = pointsToSave(card._points());
  if (!points) {
    card._notice(card._t('Invalid points: outdoor −40 to 40 °C, flow 10 to 90 °C; outdoor temperatures must be unique.'));
    return;
  }
  if (samePoints(points, sortByOutdoor(card._readPoints()))) {
    card._draft = null;
    card._message = card._t('No changes to the points.');
    card._render();
    return;
  }
  card._busy = true;
  card._message = card._t('Saving points …');
  card._render();
  try {
    await card._connection.callService('keba_keenergy', 'set_heating_curve_points', {
      config_entry: card._entryId,
      heating_curve: name,
      points,
    });
    card._draft = card._lock.canEdit() ? { name, points, saved: true } : null;
    card._message = card._t('Points for {name} sent. Controller readings are updating.', { name });
    if (samePoints(points, sortByOutdoor(card._readPoints()))) card._draft = null;
  } catch (error) {
    card._message = card._t('Save failed: ') + errorText(error);
  } finally {
    card._busy = false;
    card._render();
  }
}

/**
 * Saves the changed heating limits, only the values that differ from the entities.
 *
 * @param {Card} card The card.
 */
export async function saveLimits(card) {
  if (card._busy || !card._requireEdit()) return;
  card._lock.touch();
  const ids = card._ids();
  const changes = /** @type {[LimitKey, number][]} */ (Object.entries(card._edits));
  for (const [key, value] of changes) {
    if (!validLimit(card, ids[key], value)) {
      card._notice(card._t('Invalid value for {field}. Observe the entity’s range and step size.', {
        field: card._t(LIMIT_FIELDS[key].label),
      }));
      return;
    }
  }
  if (!changes.length) {
    card._notice(card._t('No settings changed.'));
    return;
  }
  card._busy = true;
  card._message = card._t('Saving settings …');
  card._render();
  let saved = 0;
  try {
    for (const [key, value] of changes) {
      if (!card._lock.canEdit()) throw Error(card._t('Editing locked. Please unlock again.'));
      if (Math.abs(card._num(ids[key]) - value) > EPSILON) {
        const converted = Math.round(fromCelsius(card._state(ids[key]), value) * 1e8) / 1e8;
        await card._connection.callService('number', 'set_value', { entity_id: ids[key], value: converted });
        saved++;
      }
      delete card._edits[key];
    }
    card._message = card._t('{count} settings sent. The next update will show the controller values.', { count: saved });
  } catch (error) {
    card._message = card._t('Partially saved ({count}). Remaining changes were not sent: {error}', { count: saved, error: errorText(error) });
  } finally {
    card._busy = false;
    card._render();
  }
}

/**
 * Whether a heating limit fits the range and the step size of its entity.
 *
 * @param {Card} card The card.
 * @param {string} id Entity ID.
 * @param {number} value The value in °C.
 * @returns {boolean} `true` when the entity is available and the value is valid.
 */
function validLimit(card, id, value) {
  const { min, max, step } = numberRange(card._state(id));
  const steps = (value - (Number.isFinite(min) ? min : 0)) / step;
  return isAvailable(card._state(id)) && Number.isFinite(value)
    && !(Number.isFinite(min) && value < min - EPSILON) && !(Number.isFinite(max) && value > max + EPSILON)
    && !(Number.isFinite(step) && step > 0 && Math.abs(steps - Math.round(steps)) > EPSILON);
}

/**
 * Enables the disabled entities that the card needs, only for administrators.
 *
 * @param {Card} card The card.
 */
export async function enableEntities(card) {
  if (card._busy || !card._requireEdit()) return;
  card._lock.touch();
  if (!card._hass?.user?.is_admin) {
    card._notice(card._t('Sign in as an administrator to enable disabled entities.'));
    return;
  }
  const disabled = card._disabledEditors();
  card._busy = true;
  card._message = card._t('Enabling required entities …');
  card._render();
  let count = 0;
  try {
    for (const entry of disabled) {
      if (!card._lock.canEdit()) throw Error(card._t('Editing locked. Please unlock again.'));
      await card._connection.callWS({ type: 'config/entity_registry/update', entity_id: entry.entity_id, disabled_by: null });
      entry.disabled_by = null;
      count++;
    }
    card._message = card._t('{count} entities enabled. Home Assistant is loading their values; they will appear after the next update.', { count });
  } catch (error) {
    card._message = card._t('Enabling stopped after {count} entities: {error}. Sign in as an administrator or enable entities in the KeEnergy settings.', { count, error: errorText(error) });
  } finally {
    card._busy = false;
    card._discovered = false;
    card._render();
    await card._discover();
  }
}
