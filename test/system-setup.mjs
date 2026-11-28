// Starts Home Assistant in Docker once for all tests of the suite and removes it afterwards.
import { start, stop } from './system-docker.mjs';

/**
 * Starts Home Assistant, the tests read the tokens of the test user from `HA_TOKENS`.
 *
 * @returns {Promise<() => Promise<void>>} The teardown.
 */
export default async function setup() {
  const { config, tokens } = await start();
  process.env.HA_TOKENS = JSON.stringify(tokens);
  return () => stop(config);
}
