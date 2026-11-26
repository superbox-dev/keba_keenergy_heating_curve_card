// Visual card editor: options of the card, the edit password and the chart axes.
import { AXIS_LIMITS, DEFAULT_AXIS_STEP, INTERMEDIATE_STEP, MIN_AXIS_STEP } from './chart-axis.js';
import { discoverControllers, loadRegistry } from './discovery.js';
import { esc } from './html.js';
import { errorText, languageCode, translate } from './i18n.js';
import { createVerifier } from './password.js';

/**
 * @typedef {import('./discovery.js').Controller} Controller
 * @typedef {import('./types.js').DeviceRegistryEntry} DeviceRegistryEntry
 * @typedef {import('./types.js').EntityRegistryEntry} EntityRegistryEntry
 * @typedef {import('./types.js').Hass} Hass
 */

const EDITOR_TYPE = 'keba-keenergy-heating-curve-card-editor';

/** Languages of the option `language` with their labels. */
const LANGUAGES = [
  { value: 'auto', label: 'Automatic (Home Assistant)' },
  { value: 'de', label: 'German' },
  { value: 'en', label: 'English' },
];

const STYLE = `
      :host{display:block;color:var(--primary-text-color);font:14px var(--primary-font-family,Arial)}*{box-sizing:border-box}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}label{display:grid;gap:6px;margin:12px 0;font-size:12px}
      input,select,button{font:inherit;color:var(--primary-text-color);background:var(--card-background-color,#fff);padding:10px;border:1px solid var(--divider-color,#ccc);border-radius:8px;min-width:0}
      button{cursor:pointer;margin:6px 6px 6px 0}p{color:var(--secondary-text-color);font-size:12px;line-height:1.5}summary{cursor:pointer}#password-message{color:var(--error-color,#a44)}
      fieldset{min-width:0;border:1px solid var(--divider-color,#ccc);border-radius:8px;margin:10px 0;padding:0 10px}legend{font-size:12px}.axis-fields{grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(max-width:450px){.grid{grid-template-columns:1fr}}
      `;

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
    if (before !== languageCode(this._config, hass) && !this._root.activeElement) this._render();
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
      this._controllers = discoverControllers(registry, devices, text => this._t(text));
    } catch (error) {
      this._error = this._t('Automatic selection unavailable: ') + errorText(error);
    } finally {
      this._loaded = true;
      this._loading = false;
      if (!this._root.activeElement) this._render();
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
   * @param {boolean} [redraw] Whether the editor is drawn again.
   */
  _change(key, value, redraw = false) {
    const config = /** @type {Record<string, unknown>} */ (this._config);
    if (value === '' || value == null) delete config[key];
    else config[key] = value;
    this._revision++;
    if (redraw) this._render();
    this._emit();
  }

  /**
   * Element of the editor.
   *
   * @param {string} selector CSS selector of an element that the editor always shows.
   * @returns {HTMLInputElement} The element.
   */
  _get(selector) {
    return /** @type {HTMLInputElement} */ (this._root.querySelector(selector));
  }

  /** Creates the verifier of the new password, the password itself is never stored. */
  async _createPassword() {
    const one = this._get('#new-password'), two = this._get('#repeat-password');
    const message = this._get('#password-message');
    if (!one.value || one.value !== two.value) {
      message.textContent = this._t('Both passwords must be filled in and match.');
      return;
    }
    if (!globalThis.crypto?.getRandomValues) {
      message.textContent = this._t('The browser cannot generate secure random values.');
      return;
    }
    const revision = this._revision, password = one.value;
    const button = this._get('#create-password');
    button.disabled = true;
    one.value = '';
    two.value = '';
    try {
      const verifier = await createVerifier(password);
      if (revision !== this._revision) {
        message.textContent = this._t('Configuration changed. Please set the password again.');
        return;
      }
      this._change('edit_password_hash', verifier, true);
    } catch (error) {
      message.textContent = this._t('Could not set the password: ') + errorText(error);
    } finally {
      button.disabled = false;
    }
  }

  /** Draws the editor. */
  _render() {
    if (!this._config) return;
    const c = this._config;
    if (this._registry) this._controllers = discoverControllers(this._registry, this._devices, text => this._t(text));
    const selected = this._controllers.find(controller => controller.id === c.config_entry
      || (!c.config_entry && String(c.serial || '') === controller.serial));
    const circuits = selected?.circuits || [];
    /**
     * Input field of an option.
     *
     * @param {string} label Label.
     * @param {string} key Option.
     * @param {string} [type] Type of the input element.
     * @param {string} [extra] Additional attributes.
     */
    const field = (label, key, type = 'text', extra = '') => {
      const value = type === 'number' ? String(c[key] ?? '').replace(',', '.') : c[key];
      return `<label>${esc(label)}<input data-config="${key}" type="${type}" value="${esc(value)}" ${extra}></label>`;
    };
    /**
     * Bounds and grid interval of an axis.
     *
     * @param {'x' | 'y'} axis Axis.
     * @param {string} title Title.
     */
    const axisFields = (axis, title) => {
      const { min, max } = AXIS_LIMITS[axis];
      const bounds = `min="${min}" max="${max}" step="0.01" placeholder="${esc(this._t('Automatic'))}"`;
      const stepBounds = `min="${MIN_AXIS_STEP}" max="${max - min}" step="0.01" placeholder="${DEFAULT_AXIS_STEP}"`;
      return `<fieldset><legend>${esc(title)}</legend><div class="grid axis-fields">
        ${field(this._t('Minimum (°C)'), `${axis}_min`, 'number', bounds)}
        ${field(this._t('Maximum (°C)'), `${axis}_max`, 'number', bounds)}
        ${field(this._t('Grid interval (°C)'), `${axis}_step`, 'number', stepBounds)}
      </div></fieldset>`;
    };
    const intermediateBounds = `min="${INTERMEDIATE_STEP.min}" max="${INTERMEDIATE_STEP.max}" step="0.01"`
      + ` placeholder="${INTERMEDIATE_STEP.default}"`;
    const axesOpen = /** @type {HTMLDetailsElement | null} */ (this._root.querySelector('#chart-axes'))?.open;
    const automatic = esc(this._t('Automatic · selectable in the dashboard'));
    const autoLockField = field(this._t('Auto-lock after minutes'), 'auto_lock_minutes', 'number', 'min="1" max="60" step="1"');
    this._root.innerHTML = `<style>${STYLE}</style>${field(this._t('Title'), 'title')}
      <label>${esc(this._t('Language'))}<select id="config-language" aria-label="${esc(this._t('Language'))}">${
        LANGUAGES.map(({ value, label }) => `<option value="${value}" ${(c.language || 'auto') === value
          ? 'selected'
          : ''}>${esc(this._t(label))}</option>`).join('')
      }</select></label>
      <label>${esc(this._t('Pin controller'))}<select id="config-controller" aria-label="${
        esc(this._t('Pin controller'))}"><option value="">${automatic}</option>${
        this._controllers.map(controller => `<option value="${esc(controller.id)}" ${selected?.id === controller.id
          ? 'selected'
          : ''}>${esc(controller.label)}</option>`).join('')
      }</select></label>
      <label>${esc(this._t('Pin heating circuit'))}<select id="config-circuit" aria-label="${
        esc(this._t('Pin heating circuit'))}"><option value="">${automatic}</option>${
        circuits.map(circuit => `<option value="${esc(circuit.id)}" ${String(c.circuit || '') === circuit.id
          ? 'selected'
          : ''}>${esc(circuit.label)}</option>`).join('')}${
        c.circuit && !circuits.some(circuit => circuit.id === String(c.circuit))
          ? `<option value="${esc(c.circuit)}" selected>${esc(this._t('Heating circuit'))} ${esc(c.circuit)}</option>`
          : ''
      }</select></label>
      <p>${esc(this._t('Without a fixed mapping, select the controller and heating circuit in the card. Switching the view sends no commands.'))}</p>
      ${this._error ? `<p>${esc(this._error)}</p>` : ''}
      <details id="chart-axes" ${axesOpen ? 'open' : ''}>
        <summary>${esc(this._t('Chart axes'))}</summary>
        <p>${esc(this._t('Empty bounds are set automatically. The default grid interval is 5 °C. These settings only change the visible chart range and grid.'))}</p>
        ${axisFields('x', this._t('X-axis · Outdoor temperature'))}
        ${axisFields('y', this._t('Y-axis · Flow temperature'))}
        <fieldset><legend>${esc(this._t('Interpolated values'))}</legend>
          ${field(this._t('Interpolated value interval on the X-axis (°C)'), 'intermediate_step', 'number', intermediateBounds)}
        </fieldset>
      </details>
      <details><summary>${esc(this._t('Chart flow limits'))}</summary><p>${
        esc(this._t('Leave empty to show the unmodified table. These values limit the display only and are not sent to the controller.'))
      }</p><div class="grid">${
        field(this._t('Display minimum (°C)'), 'flow_min', 'number', 'min="10" max="90" step="any"')}${
        field(this._t('Display maximum (°C)'), 'flow_max', 'number', 'min="10" max="90" step="any"')
      }</div></details>
      <details><summary>${esc(this._t('Password protection'))} ${
        esc(c.edit_password_hash ? this._t('· configured') : this._t('· optional'))}</summary><p>${
        esc(this._t('Set your own password. Only the verifier is stored in the card configuration. Protection applies to this card interface; Home Assistant permissions still apply.'))
      }</p>
      <div class="grid"><label>${esc(this._t('New password'))}<input id="new-password" type="password" autocomplete="new-password"></label><label>${
        esc(this._t('Repeat password'))}<input id="repeat-password" type="password" autocomplete="new-password"></label></div>
      <button type="button" id="create-password">${esc(this._t('Set password'))}</button>${
        c.edit_password_hash
          ? `<button type="button" id="remove-password">${esc(this._t('Remove password protection'))}</button>`
          : ''
      }
      <p id="password-message" role="status"></p>${autoLockField}</details>
      <p>${esc(this._t('Additional options and manual entity mappings are available in the YAML editor.'))}</p>`;
    this._bind();
  }

  /** Binds the event handlers after drawing. */
  _bind() {
    this._root.querySelectorAll('[data-config]').forEach((element) => {
      const input = /** @type {HTMLInputElement} */ (element);
      input.addEventListener('change', () => {
        if (input.closest('#chart-axes') && !input.reportValidity()) return;
        const value = input.type === 'number' && input.value !== '' ? Number(input.value) : input.value;
        this._change(/** @type {string} */ (input.dataset.config), value);
      });
    });
    this._get('#config-language').addEventListener('change', () => {
      this._change('language', this._get('#config-language').value, true);
    });
    this._get('#config-controller').addEventListener('change', () => {
      const config = /** @type {Record<string, unknown>} */ (this._config);
      delete config.serial;
      delete config.circuit;
      this._change('config_entry', this._get('#config-controller').value, true);
    });
    this._get('#config-circuit').addEventListener('change', () => {
      this._change('circuit', this._get('#config-circuit').value);
    });
    this._get('#create-password').addEventListener('click', () => this._createPassword());
    this._root.querySelector('#remove-password')?.addEventListener('click', () => {
      this._change('edit_password_hash', '', true);
    });
  }
}

if (!customElements.get(EDITOR_TYPE)) customElements.define(EDITOR_TYPE, KeEnergyHeatingCurveEditor);
