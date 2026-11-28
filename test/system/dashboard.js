// The Home Assistant of `test/system-docker.mjs` and the login of its test user.

/** URL of Home Assistant on the host. */
export const URL = 'http://localhost:8123';

/** Path of the view with the card, in its own dashboard. */
export const DASHBOARD = 'card-test/card';

/**
 * Tokens of the test user, the frontend keeps them in `localStorage` as `hassTokens`.
 *
 * @typedef {object} Tokens
 * @property {string} access_token
 * @property {string} refresh_token
 * @property {number} expires_in
 * @property {string} token_type
 */

/**
 * The tokens of the test user, the global setup sets them.
 *
 * @returns {Tokens}
 */
export const testUser = () => /** @type {Tokens} */ (JSON.parse(String(import.meta.env.HA_TOKENS ?? '{}')));

/**
 * The state of an entity in Home Assistant, read with the REST API like the card would see it.
 *
 * @param {string} entityId
 * @returns {Promise<{ state: string, last_changed: string, attributes: Record<string, unknown> }>}
 */
export async function entityState(entityId) {
  const response = await fetch(`${URL}/api/states/${entityId}`, {
    headers: { Authorization: `Bearer ${testUser().access_token}` },
  });
  return /** @type {{ state: string, last_changed: string, attributes: Record<string, unknown> }} */ (
    await response.json());
}
