// Visual card editor: options of the card, the edit password and the chart axes.
import { AXIS_LIMITS, INTERMEDIATE_STEP, MIN_AXIS_STEP } from './chart-axis.js';
import { discoverControllers, loadRegistry } from './discovery.js';
import { html } from './html.js';
import { LANGUAGES, errorText, languageCode, translate } from './i18n.js';
import { createVerifier } from './password.js';
import { LOCK_MINUTES } from './card/config.js';
import { POINT_LIMITS } from './card/points.js';

/**
 * @typedef {import('./discovery.js').Controller} Controller
 * @typedef {import('./types.js').DeviceRegistryEntry} DeviceRegistryEntry
 * @typedef {import('./types.js').EntityRegistryEntry} EntityRegistryEntry
 * @typedef {import('./types.js').Hass} Hass
 */

const EDITOR_TYPE = 'keba-keenergy-heating-curve-card-editor';

/** Value of the controller and heating circuit selection without pinning, not stored in the config. */
const AUTOMATIC = 'auto';

/**
 * Schema item of `ha-form` of the Home Assistant frontend.
 *
 * @typedef {object} FormSchema
 * @property {string} name Option, or a name of the section.
 * @property {'expandable' | 'grid'} [type] Section with nested items.
 * @property {boolean} [flatten] Whether the nested items use the options of the config directly.
 * @property {string} [title] Title of a section.
 * @property {boolean} [expanded] Whether a section is open.
 * @property {boolean} [required] Whether the field has no empty value.
 * @property {Record<string, unknown>} [selector] Selector of the field.
 * @property {FormSchema[]} [schema] Nested items.
 */

/**
 * The `ha-form` element of the Home Assistant frontend.
 *
 * @typedef {HTMLElement & {
 *   hass?: Hass,
 *   data: Record<string, unknown>,
 *   schema: FormSchema[],
 *   computeLabel: (schema: FormSchema) => string,
 *   computeHelper: (schema: FormSchema) => string | undefined,
 * }} HaForm
 */

/**
 * The `ha-expansion-panel` element of the Home Assistant frontend.
 *
 * @typedef {HTMLElement & { header: string, secondary: string }} ExpansionPanel
 */

/**
 * Bounds of the chart options, the editor ignores values outside of them like the card.
 *
 * @type {Record<string, { min: number, max: number }>}
 */
const CHART_BOUNDS = {
  x_min: AXIS_LIMITS.x,
  x_max: AXIS_LIMITS.x,
  x_step: { min: MIN_AXIS_STEP, max: AXIS_LIMITS.x.max - AXIS_LIMITS.x.min },
  y_min: AXIS_LIMITS.y,
  y_max: AXIS_LIMITS.y,
  y_step: { min: MIN_AXIS_STEP, max: AXIS_LIMITS.y.max - AXIS_LIMITS.y.min },
  intermediate_step: { min: INTERMEDIATE_STEP.min, max: INTERMEDIATE_STEP.max },
};

/**
 * Labels of the options in English, translated by `_t()`, empty for the sections, they have a title or no label.
 *
 * @type {Record<string, string>}
 */
const LABELS = {
  x_axis: '',
  y_axis: '',
  interpolated: '',
  x_grid: '',
  y_grid: '',
  flow_grid: '',
  title: 'Title',
  language: 'Language',
  config_entry: 'Pin controller',
  circuit: 'Pin heating circuit',
  x_min: 'Minimum (°C)',
  x_max: 'Maximum (°C)',
  x_step: 'Grid interval (°C)',
  y_min: 'Minimum (°C)',
  y_max: 'Maximum (°C)',
  y_step: 'Grid interval (°C)',
  intermediate_step: 'Interpolated value interval on the X-axis (°C)',
  flow_min: 'Display minimum (°C)',
  flow_max: 'Display maximum (°C)',
  auto_lock_minutes: 'Auto-lock after minutes',
  passwords: '',
  new_password: 'New password',
  repeat_password: 'Repeat password',
};

/**
 * The fields of a new password, side by side like the password fields of Home Assistant.
 *
 * @type {FormSchema[]}
 */
const PASSWORD_SCHEMA = [{
  name: 'passwords',
  type: 'grid',
  flatten: true,
  schema: ['new_password', 'repeat_password'].map(name => ({
    name,
    selector: { text: { type: 'password', autocomplete: 'new-password' } },
  })),
}];

/**
 * Help texts below the fields in English, translated by `_t()`.
 *
 * @type {Record<string, string>}
 */
const HELPERS = {
  circuit: 'Without a fixed mapping, select the controller and heating circuit in the card. Switching the view sends no commands.',
};

/** Options shown as numbers. */
const NUMBERS = new Set([...Object.keys(CHART_BOUNDS), 'flow_min', 'flow_max', 'auto_lock_minutes']);

/**
 * Selector of a number field, a box like the other fields of the editor.
 *
 * @param {number} min Minimum.
 * @param {number} max Maximum.
 * @param {number | 'any'} step Step of the arrows.
 * @returns {Record<string, unknown>} The selector.
 */
const numberSelector = (min, max, step) => ({ number: { min, max, step, mode: 'box' } });

/**
 * Card helpers of Home Assistant, `window.loadCardHelpers()` loads them.
 *
 * @typedef {{ createCardElement: (config: object) => HTMLElement }} CardHelpers
 */

/**
 * Loads `ha-form` of Home Assistant when no editor of the dashboard has loaded it yet.
 *
 * The editor of the button card uses `ha-form`, loading it defines the element.
 *
 * @returns {Promise<void>}
 */
export async function loadHaForm() {
  if (customElements.get('ha-form')) return;
  const win = /** @type {{ loadCardHelpers?: () => Promise<CardHelpers> }} */ (globalThis);
  const card = (await win.loadCardHelpers?.())?.createCardElement({ type: 'button' });
  const cardClass = /** @type {{ getConfigElement?: () => Promise<unknown> } | undefined} */ (card?.constructor);
  await cardClass?.getConfigElement?.();
}

/** CSS of the editor, in the shadow root. */
const STYLE = `
  :host {
    display: block;
    container-type: inline-size;
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body);
    font-size: var(--ha-font-size-m);
    line-height: var(--ha-line-height-normal);
  }
  * {
    box-sizing: border-box;
  }
  ha-expansion-panel {
    display: block;
    margin-top: var(--ha-space-4);
  }
  .panel {
    padding: 0 var(--ha-space-4) var(--ha-space-4);
  }
  [hidden] {
    display: none !important;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--ha-space-2);
    margin: var(--ha-space-3) 0;
  }
  p {
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-s);
    line-height: var(--ha-line-height-normal);
  }
  #password-message {
    display: block;
    margin-bottom: var(--ha-space-3);
  }
  #password-message:empty {
    display: none;
  }
`;

/** Markup of the editor, the texts are set by `_render()`. */
const TEMPLATE = html`<style>${STYLE}</style>
  <ha-form id="general"></ha-form>
  <p id="registry-error" hidden></p>
  <ha-expansion-panel id="chart-axes" outlined>
    <ha-icon slot="leading-icon" icon="mdi:chart-line"></ha-icon>
    <div class="panel"><p id="axes-hint"></p><ha-form id="axes"></ha-form></div>
  </ha-expansion-panel>
  <ha-expansion-panel id="flow-limits" outlined>
    <ha-icon slot="leading-icon" icon="mdi:arrow-collapse-vertical"></ha-icon>
    <div class="panel"><p id="flow-hint"></p><ha-form id="flow"></ha-form></div>
  </ha-expansion-panel>
  <ha-expansion-panel id="password" outlined>
    <ha-icon slot="leading-icon" icon="mdi:lock-outline"></ha-icon>
    <div class="panel">
      <p id="password-hint"></p>
      <ha-form id="new-password"></ha-form>
      <div class="buttons">
        <ha-button id="remove-password" appearance="plain" variant="danger"></ha-button>
        <ha-button id="create-password"></ha-button>
      </div>
      <ha-alert id="password-message" alert-type="error"></ha-alert>
      <ha-form id="lock"></ha-form>
    </div>
  </ha-expansion-panel>`;

class KeEnergyHeatingCurveEditor extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    /** @type {Record<string, unknown> | undefined} */
    this._config = undefined;
    /** @type {Hass | undefined} */
    this._hass = undefined;
    /** @type {Controller[]} */
    this._controllers = [];
    /** @type {EntityRegistryEntry[] | undefined} */
    this._registry = undefined;
    /** @type {DeviceRegistryEntry[]} */
    this._devices = [];
    /** Error of loading the registry, empty without error. */
    this._error = '';
    this._loaded = false;
    this._loading = false;
    /** Counter of the config changes, a password of an older config is not set. */
    this._revision = 0;
    /**
     * Values of the password fields, emptied when the password is set.
     *
     * @type {Record<string, unknown>}
     */
    this._passwords = {};
  }

  /**
   * Sets the card config, called by Home Assistant.
   *
   * @param {Record<string, unknown>} config Card config.
   */
  setConfig(config) {
    this._config = { ...config };
    this._revision++;
    this._render();
  }

  /**
   * Sets the `hass` object, called by Home Assistant on every state change.
   *
   * @param {Hass} hass The `hass` object.
   */
  set hass(hass) {
    const before = languageCode(this._config, this._hass);
    this._hass = hass;
    if (before !== languageCode(this._config, hass)) this._render();
    else this._root.querySelectorAll('ha-form').forEach(form => Object.assign(form, { hass }));
    if (!this._loaded && !this._loading) this._load();
  }

  /**
   * Translates an English source text into the language of the editor.
   *
   * @param {string} text English source text.
   * @param {Record<string, unknown>} [params] Values of the placeholders.
   * @returns {string} The translated text.
   */
  _t(text, params) {
    return translate(languageCode(this._config, this._hass), text, params);
  }

  /** Loads the registry for the controller and heating circuit selection. */
  async _load() {
    this._loading = true;
    try {
      const { registry, devices } = await loadRegistry(/** @type {Hass} */ (this._hass), text => this._t(text));
      this._registry = registry;
      this._devices = devices;
    } catch (error) {
      this._error = this._t('Automatic selection unavailable: ') + errorText(error);
    } finally {
      this._loaded = true;
      this._loading = false;
      this._render();
    }
  }

  /** Sends the changed config to Home Assistant. */
  _emit() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * Changes an option, an empty value removes it.
   *
   * @param {string} key Option.
   * @param {unknown} value New value.
   */
  _change(key, value) {
    const config = /** @type {Record<string, unknown>} */ (this._config);
    if (value === '' || value == null) delete config[key];
    else config[key] = value;
    this._revision++;
    this._render();
    this._emit();
  }

  /**
   * Takes the changed option of a form, like the user changed it.
   *
   * @param {Record<string, unknown>} data Values of the form.
   */
  _formChanged(data) {
    const current = this._data();
    const key = Object.keys({ ...current, ...data }).find(name => data[name] !== current[name]);
    if (!key) return;
    const value = data[key];
    const bounds = CHART_BOUNDS[key];
    if (bounds && typeof value === 'number' && (value < bounds.min || value > bounds.max)) {
      this._render();
      return;
    }
    const config = /** @type {Record<string, unknown>} */ (this._config);
    if (key === 'config_entry') {
      delete config.serial;
      delete config.circuit;
    }
    this._change(key, (key === 'config_entry' || key === 'circuit') && value === AUTOMATIC ? '' : value);
  }

  /**
   * Element of the editor.
   *
   * @template {HTMLElement} [E=HTMLInputElement]
   * @param {string} selector CSS selector of an element that the editor always shows.
   * @returns {E} The element.
   */
  _get(selector) {
    return /** @type {E} */ (this._root.querySelector(selector));
  }

  /** Creates the verifier of the new password, the password itself is never stored. */
  async _createPassword() {
    const password = String(this._passwords.new_password ?? '');
    const message = this._get('#password-message');
    if (!password || password !== this._passwords.repeat_password) {
      message.textContent = this._t('Both passwords must be filled in and match.');
      return;
    }
    if (!globalThis.crypto?.getRandomValues) {
      message.textContent = this._t('The browser cannot generate secure random values.');
      return;
    }
    const revision = this._revision;
    const button = this._get('#create-password');
    button.disabled = true;
    this._passwords = {};
    /** @type {HaForm} */ (this._get('#new-password')).data = this._passwords;
    try {
      const verifier = await createVerifier(password);
      if (revision !== this._revision) {
        message.textContent = this._t('Configuration changed. Please set the password again.');
        return;
      }
      message.textContent = '';
      this._change('edit_password_hash', verifier);
    } catch (error) {
      message.textContent = this._t('Could not set the password: ') + errorText(error);
    } finally {
      button.disabled = false;
    }
  }

  /** @returns {Controller | undefined} The pinned controller, also by the serial number of older configs. */
  _selected() {
    const c = /** @type {Record<string, unknown>} */ (this._config);
    return this._controllers.find(controller => controller.id === c.config_entry
      || (!c.config_entry && String(c.serial || '') === controller.serial));
  }

  /** @returns {Record<string, unknown>} Values of the forms, the numbers of older configs with a decimal comma. */
  _data() {
    const c = /** @type {Record<string, unknown>} */ (this._config);
    /** @type {Record<string, unknown>} */
    const data = {
      ...c,
      language: c.language || 'auto',
      config_entry: this._selected()?.id ?? AUTOMATIC,
      circuit: c.circuit ? String(c.circuit) : AUTOMATIC,
    };
    for (const key of NUMBERS) {
      if (typeof data[key] === 'string') data[key] = Number(String(data[key]).replace(',', '.'));
    }
    return data;
  }

  /**
   * Selection of a controller or a heating circuit, an unknown pinned heating circuit stays selectable.
   *
   * @param {{ id: string, label: string }[]} entries Controllers or heating circuits.
   * @param {string} [unknown] Pinned heating circuit that the registry does not know.
   * @returns {Record<string, unknown>} The selector.
   */
  _pinSelector(entries, unknown) {
    const options = [
      { value: AUTOMATIC, label: this._t('Automatic · selectable in the dashboard') },
      ...entries.map(({ id, label }) => ({ value: id, label })),
    ];
    if (unknown) options.push({ value: unknown, label: `${this._t('Heating circuit')} ${unknown}` });
    return { select: { mode: 'dropdown', options } };
  }

  /**
   * Schemas of the forms.
   *
   * @returns {Record<'general' | 'axes' | 'flow' | 'lock', FormSchema[]>} The schema of each form.
   */
  _schemas() {
    const c = /** @type {Record<string, unknown>} */ (this._config);
    const circuits = this._selected()?.circuits || [];
    const circuit = c.circuit ? String(c.circuit) : '';
    /**
     * Bounds and grid interval of an axis.
     *
     * @param {'x' | 'y'} axis Axis.
     * @param {string} title Title.
     * @returns {FormSchema} The section.
     */
    const axis = (axis, title) => ({
      name: `${axis}_axis`,
      type: 'expandable',
      flatten: true,
      expanded: true,
      title,
      schema: [{
        name: `${axis}_grid`,
        type: 'grid',
        flatten: true,
        schema: ['min', 'max', 'step'].map(part => ({
          name: `${axis}_${part}`,
          selector: numberSelector(CHART_BOUNDS[`${axis}_${part}`].min, CHART_BOUNDS[`${axis}_${part}`].max, 0.01),
        })),
      }],
    });
    return {
      general: [
        { name: 'title', selector: { text: {} } },
        {
          name: 'language',
          required: true,
          selector: {
            select: { mode: 'dropdown', options: LANGUAGES.map(({ value, label }) => ({ value, label: this._t(label) })) },
          },
        },
        { name: 'config_entry', required: true, selector: this._pinSelector(this._controllers) },
        {
          name: 'circuit',
          required: true,
          selector: this._pinSelector(circuits, circuit && !circuits.some(({ id }) => id === circuit) ? circuit : ''),
        },
      ],
      axes: [
        axis('x', this._t('X-axis · Outdoor temperature')),
        axis('y', this._t('Y-axis · Flow temperature')),
        {
          name: 'interpolated',
          type: 'expandable',
          flatten: true,
          expanded: true,
          title: this._t('Interpolated values'),
          schema: [{
            name: 'intermediate_step',
            selector: numberSelector(INTERMEDIATE_STEP.min, INTERMEDIATE_STEP.max, 0.01),
          }],
        },
      ],
      flow: [{
        name: 'flow_grid',
        type: 'grid',
        flatten: true,
        schema: ['flow_min', 'flow_max'].map(name => ({ name, selector: numberSelector(POINT_LIMITS.flow.min, POINT_LIMITS.flow.max, 'any') })),
      }],
      lock: [{ name: 'auto_lock_minutes', selector: numberSelector(LOCK_MINUTES.min, LOCK_MINUTES.max, 1) }],
    };
  }

  /**
   * Sets the text of an element.
   *
   * @param {string} selector CSS selector.
   * @param {string} text Text in the language of the editor.
   */
  _text(selector, text) {
    this._get(selector).textContent = text;
  }

  /** Draws the editor, the elements stay and keep their focus and open sections. */
  _render() {
    if (!this._config) return;
    if (!this._root.firstChild) {
      this._root.innerHTML = TEMPLATE;
      this._bind();
    }
    const c = this._config;
    if (this._registry) this._controllers = discoverControllers(this._registry, this._devices, text => this._t(text));
    const data = this._data();
    /** @typedef {[string, FormSchema[], Record<string, unknown>]} EditorForm ID, schema and values of a form. */
    /** @type {EditorForm[]} */
    const forms = [
      ...Object.entries(this._schemas()).map(([name, schema]) => /** @type {EditorForm} */ ([name, schema, data])),
      // The password fields keep their own values, they never reach the config.
      ['new-password', PASSWORD_SCHEMA, this._passwords],
    ];
    for (const [name, schema, values] of forms) {
      Object.assign(/** @type {HaForm} */ (this._get(`#${name}`)), {
        hass: this._hass,
        data: values,
        schema,
        computeLabel: (/** @type {FormSchema} */ item) => this._t(LABELS[item.name]),
        computeHelper: (/** @type {FormSchema} */ item) => HELPERS[item.name] && this._t(HELPERS[item.name]),
      });
    }
    /** @type {[string, string][]} */
    const headers = [
      ['#chart-axes', this._t('Chart axes')],
      ['#flow-limits', this._t('Chart flow limits')],
      ['#password', this._t('Password protection')],
    ];
    for (const [selector, header] of headers) {
      /** @type {ExpansionPanel} */ (this._get(selector)).header = header;
    }
    /** @type {ExpansionPanel} */ (this._get('#password')).secondary = c.edit_password_hash
      ? this._t('Configured')
      : this._t('Optional');
    this._text('#registry-error', this._error);
    this._get('#registry-error').hidden = !this._error;
    this._text('#axes-hint', this._t('Empty bounds are set automatically. The default grid interval is 5 °C. These settings only change the visible chart range and grid.'));
    this._text('#flow-hint', this._t('Leave empty to show the unmodified table. These values limit the display only and are not sent to the controller.'));
    this._text('#password-hint', this._t('Set your own password. Only the verifier is stored in the card configuration. Protection applies to this card interface; Home Assistant permissions still apply.'));
    this._text('#create-password', this._t('Set password'));
    this._text('#remove-password', this._t('Remove password protection'));
    this._get('#remove-password').hidden = !c.edit_password_hash;
  }

  /** Binds the event handlers once. */
  _bind() {
    this._root.querySelectorAll('ha-form:not(#new-password)').forEach((form) => {
      form.addEventListener('value-changed', (event) => {
        event.stopPropagation();
        this._formChanged(/** @type {CustomEvent<{ value: Record<string, unknown> }>} */ (event).detail.value);
      });
    });
    const passwords = /** @type {HaForm} */ (this._get('#new-password'));
    passwords.addEventListener('value-changed', (event) => {
      event.stopPropagation();
      this._passwords = /** @type {CustomEvent<{ value: Record<string, unknown> }>} */ (event).detail.value;
      passwords.data = this._passwords;
    });
    this._get('#create-password').addEventListener('click', () => this._createPassword());
    this._get('#remove-password').addEventListener('click', () => this._change('edit_password_hash', ''));
  }
}

if (!customElements.get(EDITOR_TYPE)) customElements.define(EDITOR_TYPE, KeEnergyHeatingCurveEditor);
