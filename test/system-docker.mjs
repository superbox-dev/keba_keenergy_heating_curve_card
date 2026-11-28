// Home Assistant in Docker for the tests in `test/system/`, outside of the type check like `build.mjs`.
import { execFile } from 'node:child_process';
import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { createConnection, createLongLivedTokenAuth } from 'home-assistant-js-websocket';

const run = promisify(execFile);

/** Image of Home Assistant, the minimum version of `hacs.json`. */
export const IMAGE = 'homeassistant/home-assistant:2026.11.3';

/** Release of the integration `keba_keenergy`, the tests use its integration and the test data of its tests. */
export const INTEGRATION = 'v1.12.2';

/** Archive of the release on GitHub. */
const ARCHIVE = `https://codeload.github.com/superbox-dev/keba_keenergy/tar.gz/refs/tags/${INTEGRATION}`;

/**
 * The fake control units of `test/system/controller.py` in the container, with the test data of a device of the
 * integration and fake serial numbers.
 */
const CONTROLLERS = [
  // Two heating circuits, the test data has a cooling circuit as second circuit.
  { serial: '10000001', device: 'multiple_devices', port: 8091, enable: true, heating: true },
  { serial: '10000002', device: 'single_device', port: 8092, enable: false, heating: false },
];

/** Configuration of Home Assistant. */
const CONFIGURATION = 'default_config:\n';

/** Name of the container, a container of an aborted run is replaced. */
const CONTAINER = 'keba-keenergy-heating-curve-card-test';

/** Port of Home Assistant on the host. */
const PORT = 8123;

/** URL of Home Assistant on the host, the same as in `test/system/dashboard.js`. */
const URL = `http://localhost:${PORT}`;

/** Client ID of the test user, Home Assistant uses the URL of the frontend. */
const CLIENT_ID = `${URL}/`;

/**
 * Dashboard and view with the card, the same as in `test/system/dashboard.js`.
 *
 * An own dashboard, `/lovelace` opens the overview of Home Assistant.
 */
const DASHBOARD = 'card-test';
const VIEW = 'card';

/** URL of the built card in the dashboard resources. */
const RESOURCE = '/local/keba_keenergy_heating_curve_card.js';

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
 * Waits until the check passes.
 *
 * @param {() => Promise<boolean>} check
 * @param {number} timeout Milliseconds.
 * @returns {Promise<void>}
 */
async function waitFor(check, timeout) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await check().catch(() => false)) return;
    await new Promise(done => setTimeout(done, 1000));
  }
  throw Error(`Home Assistant did not start within ${timeout / 1000} s`);
}

/**
 * Sends a request to the REST API of Home Assistant.
 *
 * @param {string} path
 * @param {object} body
 * @param {string} [token]
 * @returns {Promise<Record<string, unknown>>}
 */
async function post(path, body, token) {
  const response = await fetch(`${URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw Error(`${path}: ${response.status} ${await response.text()}`);
  return /** @type {Record<string, unknown>} */ (await response.json());
}

/**
 * Creates the test user and finishes the onboarding.
 *
 * @returns {Promise<Tokens>}
 */
async function onboard() {
  const { auth_code: code } = await post('/api/onboarding/users', {
    client_id: CLIENT_ID,
    name: 'Test',
    username: 'test',
    password: 'test-password',
    language: 'en',
  });
  const response = await fetch(`${URL}/auth/token`, {
    method: 'POST',
    body: new URLSearchParams({ grant_type: 'authorization_code', code: String(code), client_id: CLIENT_ID }),
  });
  const tokens = /** @type {Tokens} */ (await response.json());
  await post('/api/onboarding/core_config', {}, tokens.access_token);
  await post('/api/onboarding/analytics', {}, tokens.access_token);
  await post('/api/onboarding/integration', { client_id: CLIENT_ID, redirect_uri: `${URL}/?auth_callback=1` }, tokens.access_token);
  return tokens;
}

/**
 * Downloads the release of the integration and copies the integration, its test data and the fake control unit into
 * the config directory.
 *
 * @param {string} config
 * @returns {Promise<void>}
 */
async function installIntegration(config) {
  const download = await mkdtemp(join(tmpdir(), 'keba-card-integration-'));
  try {
    const response = await fetch(ARCHIVE);
    if (!response.ok) throw Error(`${ARCHIVE}: ${response.status}`);
    const archive = join(download, 'release.tar.gz');
    await writeFile(archive, Buffer.from(await response.arrayBuffer()));
    await run('tar', ['-xzf', archive, '-C', download, '--strip-components=1']);
    await cp(join(download, 'custom_components', 'keba_keenergy'), join(config, 'custom_components', 'keba_keenergy'), {
      recursive: true,
    });
    await mkdir(join(config, 'fake_controller'));
    await cp(join(download, 'tests', 'fixtures'), join(config, 'fake_controller', 'fixtures'), { recursive: true });
    await cp(resolve('test/system/controller.py'), join(config, 'fake_controller', 'controller.py'));
  } finally {
    await rm(download, { recursive: true, force: true });
  }
}

/**
 * Starts the fake control units in the container, they only listen in the container.
 *
 * @returns {Promise<void>}
 */
async function startControllers() {
  for (const { serial, device, port, heating } of CONTROLLERS) {
    await run('docker', [
      'exec',
      '--detach',
      CONTAINER,
      'python3',
      '/config/fake_controller/controller.py',
      '--fixtures',
      '/config/fake_controller/fixtures',
      '--device',
      device,
      '--serial',
      serial,
      '--port',
      String(port),
      ...heating ? ['--heating'] : [],
    ]);
  }
}

/**
 * Adds the fake control units with the config flow of the integration, like a user in the settings.
 *
 * @param {string} token
 * @returns {Promise<void>}
 */
async function addControllers(token) {
  for (const { port } of CONTROLLERS) {
    const { flow_id: flow } = await post('/api/config/config_entries/flow', { handler: 'keba_keenergy' }, token);
    const result = await post(`/api/config/config_entries/flow/${flow}`, { host: `127.0.0.1:${port}`, ssl: false }, token);
    if (result.type !== 'create_entry') throw Error(`Config flow of 127.0.0.1:${port}: ${JSON.stringify(result)}`);
  }
}

/**
 * Enables the entities that the integration adds disabled, of the control units with `enable`, and reloads them.
 *
 * The other control unit keeps them disabled like after the setup by a user, for the test of enabling them in the card.
 *
 * @param {string} token
 * @returns {Promise<void>}
 */
async function enableEntities(token) {
  const connection = await createConnection({ auth: createLongLivedTokenAuth(URL, token) });
  try {
    const entries = /** @type {{ entry_id: string, title: string }[]} */ (
      await connection.sendMessagePromise({ type: 'config_entries/get', domain: 'keba_keenergy' }));
    const registry = /** @type {{ entity_id: string, config_entry_id: string, disabled_by: string | null }[]} */ (
      await connection.sendMessagePromise({ type: 'config/entity_registry/list' }));
    for (const { port } of CONTROLLERS.filter(controller => controller.enable)) {
      // The config flow names the entry after the host.
      const entry = entries.find(candidate => candidate.title.endsWith(`(127.0.0.1:${port})`));
      if (!entry) throw Error(`No config entry of 127.0.0.1:${port}`);
      for (const { entity_id: entityId } of registry.filter(item => item.config_entry_id === entry.entry_id
        && item.disabled_by === 'integration')) {
        await connection.sendMessagePromise({ type: 'config/entity_registry/update', entity_id: entityId, disabled_by: null });
      }
      await post(`/api/config/config_entries/entry/${entry.entry_id}/reload`, {}, token);
    }
  } finally {
    connection.close();
  }
}

/**
 * Adds the built card as a resource and a dashboard with the card.
 *
 * @param {string} token
 * @returns {Promise<void>}
 */
async function addDashboard(token) {
  const connection = await createConnection({ auth: createLongLivedTokenAuth(URL, token) });
  try {
    await connection.sendMessagePromise({ type: 'lovelace/resources/create', res_type: 'module', url: RESOURCE });
    await connection.sendMessagePromise({
      type: 'lovelace/dashboards/create',
      url_path: DASHBOARD,
      title: 'Card',
      mode: 'storage',
      require_admin: false,
      show_in_sidebar: true,
    });
    await connection.sendMessagePromise({
      type: 'lovelace/config/save',
      url_path: DASHBOARD,
      // A panel view gives the card the whole width, like a wide dashboard.
      config: {
        views: [{ path: VIEW, title: 'Card', type: 'panel', cards: [{ type: 'custom:keba-keenergy-heating-curve-card' }] }],
      },
    });
  } finally {
    connection.close();
  }
}

/**
 * Removes the container and its config directory.
 *
 * @param {string} [config]
 * @returns {Promise<void>}
 */
export async function stop(config) {
  await run('docker', ['rm', '--force', CONTAINER]).catch(() => undefined);
  if (config) await rm(config, { recursive: true, force: true });
}

/**
 * Starts Home Assistant with the built card in `dist/`, onboards the test user and adds the dashboard.
 *
 * @returns {Promise<{ config: string, tokens: Tokens }>}
 */
export async function start() {
  await stop();
  const config = await mkdtemp(join(tmpdir(), 'keba-card-ha-'));
  // The real integration talks to the fake control units in the container, no device is ever written.
  await installIntegration(config);
  await writeFile(join(config, 'configuration.yaml'), CONFIGURATION);
  await run('docker', [
    'run',
    '--detach',
    '--name',
    CONTAINER,
    '--publish',
    `${PORT}:8123`,
    '--volume',
    `${config}:/config`,
    '--volume',
    `${resolve('dist')}:/config/www:ro`,
    IMAGE,
  ]);
  await startControllers();
  await waitFor(async () => (await fetch(`${URL}/api/onboarding`)).ok, 180_000);
  const tokens = await onboard();
  await addControllers(tokens.access_token);
  await enableEntities(tokens.access_token);
  await addDashboard(tokens.access_token);
  return { config, tokens };
}
